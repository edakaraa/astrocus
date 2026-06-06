import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ProfileRow = {
  id: string;
  expo_push_token: string;
  created_at: string;
  language?: string | null;
};

type QuoteRow = {
  order_index: number;
  text_en: string;
  text_tr: string;
};

type ExpoPushMessage = {
  to: string;
  title: string;
  body: string;
  data: { screen: "universe-message" };
  sound: "default";
};

type ExpoPushTicket = {
  status?: string;
  message?: string;
};

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";
const QUOTE_CYCLE = 60;
const BODY_MAX_LENGTH = 150;
const PUSH_CHUNK_SIZE = 100;

const TITLES = {
  tr: "✨ Günün Mesajı",
  en: "✨ Daily Message",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const jsonResponse = (body: Record<string, unknown>, status = 200): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const extractBearerToken = (req: Request): string | null => {
  const auth = req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return (match?.[1] ?? "").trim() || null;
};

const authorizeCronSecret = (req: Request): boolean => {
  const cronSecret = Deno.env.get("CRON_SECRET")?.trim();
  if (!cronSecret) return false;
  const bearer = extractBearerToken(req);
  return bearer === cronSecret;
};

/** Full UTC calendar days between registration date and today (inclusive day 0 on signup day). */
const daysSinceRegistration = (createdAt: string, today: Date): number => {
  const created = new Date(createdAt);
  const createdMidnight = Date.UTC(
    created.getUTCFullYear(),
    created.getUTCMonth(),
    created.getUTCDate(),
  );
  const todayMidnight = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  );
  return Math.floor((todayMidnight - createdMidnight) / (24 * 60 * 60 * 1000));
};

const quoteOrderIndexForUser = (createdAt: string, today: Date): number => {
  const dayOffset = daysSinceRegistration(createdAt, today);
  return (dayOffset % QUOTE_CYCLE) + 1;
};

/** profiles.language is used when preferred_language column is absent. */
const resolvePreferredLanguage = (profile: ProfileRow): "tr" | "en" => {
  const lang = profile.language?.trim().toLowerCase();
  return lang === "tr" ? "tr" : "en";
};

const truncateBody = (text: string): string => {
  if (text.length <= BODY_MAX_LENGTH) return text;
  return `${text.slice(0, BODY_MAX_LENGTH - 1)}…`;
};

const countExpoTickets = (tickets: ExpoPushTicket[]): { success: number; error: number } => {
  let success = 0;
  let error = 0;
  for (const ticket of tickets) {
    if (ticket.status === "ok") {
      success += 1;
    } else {
      error += 1;
    }
  }
  return { success, error };
};

const sendExpoPushChunks = async (
  messages: ExpoPushMessage[],
): Promise<{ success: number; error: number }> => {
  let success = 0;
  let error = 0;

  for (let i = 0; i < messages.length; i += PUSH_CHUNK_SIZE) {
    const chunk = messages.slice(i, i + PUSH_CHUNK_SIZE);
    try {
      const response = await fetch(EXPO_PUSH_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(chunk),
      });

      if (!response.ok) {
        console.warn(`[send-daily-quote] Expo HTTP ${response.status}`);
        error += chunk.length;
        continue;
      }

      const payload = await response.json() as { data?: ExpoPushTicket[] } | ExpoPushTicket[];
      const tickets = Array.isArray(payload)
        ? payload
        : Array.isArray(payload.data)
        ? payload.data
        : [];

      if (tickets.length === 0) {
        error += chunk.length;
        continue;
      }

      const counts = countExpoTickets(tickets);
      success += counts.success;
      error += counts.error;

      if (tickets.length < chunk.length) {
        error += chunk.length - tickets.length;
      }
    } catch (err) {
      console.error("[send-daily-quote] Expo push chunk failed:", err);
      error += chunk.length;
    }
  }

  return { success, error };
};

// ---------------------------------------------------------------------------
// HTTP handler
// ---------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  if (!authorizeCronSecret(req)) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return jsonResponse({ error: "Missing Supabase env" }, 500);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const today = new Date();

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, expo_push_token, created_at, language")
    .eq("notifications_enabled", true)
    .not("expo_push_token", "is", null);

  if (profilesError) {
    return jsonResponse({ error: profilesError.message }, 500);
  }

  const eligibleProfiles = ((profiles ?? []) as ProfileRow[]).filter(
    (profile) => typeof profile.expo_push_token === "string" && profile.expo_push_token.length > 0,
  );

  const { data: quotes, error: quotesError } = await admin
    .from("quotes")
    .select("order_index, text_en, text_tr");

  if (quotesError) {
    return jsonResponse({ error: quotesError.message }, 500);
  }

  const quotesByIndex = new Map<number, QuoteRow>();
  for (const quote of (quotes ?? []) as QuoteRow[]) {
    quotesByIndex.set(quote.order_index, quote);
  }

  const messages: ExpoPushMessage[] = [];
  let skippedMissingQuote = 0;

  for (const profile of eligibleProfiles) {
    const orderIndex = quoteOrderIndexForUser(profile.created_at, today);
    const quote = quotesByIndex.get(orderIndex);
    if (!quote) {
      skippedMissingQuote += 1;
      continue;
    }

    const language = resolvePreferredLanguage(profile);
    const title = TITLES[language];
    const rawBody = language === "tr" ? quote.text_tr : quote.text_en;

    messages.push({
      to: profile.expo_push_token,
      title,
      body: truncateBody(rawBody),
      data: { screen: "universe-message" },
      sound: "default",
    });
  }

  const pushResult = messages.length > 0
    ? await sendExpoPushChunks(messages)
    : { success: 0, error: 0 };

  return jsonResponse({
    ok: true,
    date: today.toISOString().slice(0, 10),
    eligible_users: eligibleProfiles.length,
    messages_prepared: messages.length,
    skipped_missing_quote: skippedMissingQuote,
    push_success: pushResult.success,
    push_error: pushResult.error,
  });
});
