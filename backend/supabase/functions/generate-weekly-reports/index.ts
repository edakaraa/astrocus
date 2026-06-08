import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WeeklyStats {
  user_name: string;
  week_label_tr: string;
  week_label_en: string;
  total_minutes: number;
  total_sessions: number;
  completed_sessions: number;
  best_day_tr: string | null;
  best_day_en: string | null;
  best_day_minutes: number | null;
  peak_hour_range: string | null;
  current_streak: number;
  longest_streak: number;
  personal_record_broken: boolean;
  vs_last_week_minutes: number | null;
  daily_goal_minutes: number;
  goal_met_days: number;
  user_type: "inactive" | "new" | "low" | "medium" | "high";
}

type ProfileRow = {
  id: string;
  username: string;
  display_name: string | null;
  streak_count: number;
  longest_streak: number;
  daily_goal_minutes: number;
  created_at: string;
};

type SessionRow = {
  duration_minutes: number;
  started_at: string;
  completed_at: string;
  pause_used: boolean;
};

type ReportText = { tr: string; en: string };

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b:free",
] as const;

const MODEL_RETRY_DELAY_MS = 3000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DAY_NAMES_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// ---------------------------------------------------------------------------
// Week boundaries (UTC calendar week: Mon 00:00 – Sun 23:59:59.999)
// ---------------------------------------------------------------------------

const pad2 = (n: number) => String(n).padStart(2, "0");

const toDateKeyUtc = (d: Date) =>
  `${d.getUTCFullYear()}-${pad2(d.getUTCMonth() + 1)}-${pad2(d.getUTCDate())}`;

const parseDateKey = (key: string): Date => {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
};

/** Monday 00:00 UTC of the week containing `ref`, then optionally step back `weeksAgo`. */
const getWeekStartUtc = (ref: Date, weeksAgo = 0): Date => {
  const d = new Date(Date.UTC(ref.getUTCFullYear(), ref.getUTCMonth(), ref.getUTCDate()));
  const day = d.getUTCDay();
  const daysFromMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - daysFromMonday - weeksAgo * 7);
  return d;
};

const getWeekEndUtc = (weekStart: Date): Date => {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return end;
};

const formatWeekLabel = (weekStart: Date, locale: "tr-TR" | "en-US"): string => {
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
  const fmt = new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" });
  const fmtShort = new Intl.DateTimeFormat(locale, { day: "numeric", month: "short" });
  const startStr = locale === "en-US"
    ? fmtShort.format(weekStart)
    : fmt.format(weekStart);
  const endStr = fmt.format(weekEnd);
  return `${startStr} - ${endStr}`;
};

// ---------------------------------------------------------------------------
// Stats aggregation
// ---------------------------------------------------------------------------

const classifyUserType = (
  createdAt: string,
  totalMinutes: number,
  refDate: Date,
): WeeklyStats["user_type"] => {
  const created = new Date(createdAt);
  const ageMs = refDate.getTime() - created.getTime();
  if (ageMs < 8 * 24 * 60 * 60 * 1000) return "new";
  if (totalMinutes === 0) return "inactive";
  if (totalMinutes < 30) return "low";
  if (totalMinutes <= 120) return "medium";
  return "high";
};

const sessionInWeek = (session: SessionRow, weekStart: Date, weekEnd: Date): boolean => {
  const completed = new Date(session.completed_at);
  return completed >= weekStart && completed <= weekEnd;
};

const computePeakHourRange = (sessions: SessionRow[]): string | null => {
  if (sessions.length === 0) return null;

  const hourMinutes = new Array<number>(24).fill(0);
  for (const s of sessions) {
    const h = new Date(s.started_at).getUTCHours();
    hourMinutes[h] += s.duration_minutes;
  }

  let bestStart = 0;
  let bestSum = -1;
  for (let h = 0; h < 24; h += 1) {
    const sum = hourMinutes[h] + hourMinutes[(h + 1) % 24];
    if (sum > bestSum) {
      bestSum = sum;
      bestStart = h;
    }
  }

  if (bestSum <= 0) return null;
  const endHour = (bestStart + 2) % 24;
  return `${pad2(bestStart)}:00-${pad2(endHour)}:00`;
};

const sumMinutesByUtcDay = (sessions: SessionRow[]): Map<string, number> => {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const key = toDateKeyUtc(new Date(s.completed_at));
    map.set(key, (map.get(key) ?? 0) + s.duration_minutes);
  }
  return map;
};

const maxWeekMinutesBefore = async (
  admin: ReturnType<typeof createClient>,
  userId: string,
  beforeWeekStart: string,
): Promise<number> => {
  const { data } = await admin
    .from("weekly_reports")
    .select("stats_json")
    .eq("user_id", userId)
    .lt("week_start", beforeWeekStart);

  let max = 0;
  for (const row of data ?? []) {
    const mins = Number((row.stats_json as { total_minutes?: number })?.total_minutes ?? 0);
    if (mins > max) max = mins;
  }
  return max;
};

const sumWeekMinutesFromSessions = (
  allSessions: SessionRow[],
  weekStart: Date,
  weekEnd: Date,
): number => {
  let total = 0;
  for (const s of allSessions) {
    if (sessionInWeek(s, weekStart, weekEnd)) {
      total += s.duration_minutes;
    }
  }
  return total;
};

export const buildWeeklyStats = (
  profile: ProfileRow,
  weekSessions: SessionRow[],
  weekStart: Date,
  weekEnd: Date,
  allSessions: SessionRow[],
  priorMaxWeekMinutes: number,
  refDate: Date,
  goalsByDay: Map<string, number> = new Map(),
): WeeklyStats => {
  const total_minutes = weekSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const total_sessions = weekSessions.length;
  const completed_sessions = weekSessions.filter((s) => !s.pause_used).length;

  const byDay = sumMinutesByUtcDay(weekSessions);
  let bestKey: string | null = null;
  let bestMinutes = 0;
  for (const [key, mins] of byDay) {
    if (mins > bestMinutes) {
      bestMinutes = mins;
      bestKey = key;
    }
  }

  let best_day_tr: string | null = null;
  let best_day_en: string | null = null;
  if (bestKey && bestMinutes > 0) {
    const dow = parseDateKey(bestKey).getUTCDay();
    best_day_tr = DAY_NAMES_TR[dow];
    best_day_en = DAY_NAMES_EN[dow];
  }

  const daily_goal_minutes = profile.daily_goal_minutes;
  let goal_met_days = 0;
  for (let i = 0; i < 7; i += 1) {
    const day = new Date(weekStart);
    day.setUTCDate(day.getUTCDate() + i);
    const key = toDateKeyUtc(day);
    const dayGoal = goalsByDay.get(key);
    if (dayGoal != null && (byDay.get(key) ?? 0) >= dayGoal) {
      goal_met_days += 1;
    }
  }

  const weekStartKey = toDateKeyUtc(weekStart);
  const hasAnyPriorWeek = allSessions.some((s) => {
    const completed = new Date(s.completed_at);
    return completed < weekStart;
  });

  const lastWeekStart = new Date(weekStart);
  lastWeekStart.setUTCDate(lastWeekStart.getUTCDate() - 7);
  const lastWeekEnd = getWeekEndUtc(lastWeekStart);
  const lastWeekTotal = sumWeekMinutesFromSessions(allSessions, lastWeekStart, lastWeekEnd);

  const vs_last_week_minutes = hasAnyPriorWeek ? total_minutes - lastWeekTotal : null;

  const weekTotalsBefore = new Map<string, number>();
  for (const s of allSessions) {
    const completed = new Date(s.completed_at);
    if (completed >= weekStart) continue;
    const wsKey = toDateKeyUtc(getWeekStartUtc(completed, 0));
    weekTotalsBefore.set(wsKey, (weekTotalsBefore.get(wsKey) ?? 0) + s.duration_minutes);
  }
  const sessionHistoryMax = weekTotalsBefore.size > 0
    ? Math.max(...weekTotalsBefore.values())
    : 0;
  const historicalMax = Math.max(priorMaxWeekMinutes, sessionHistoryMax);
  const personal_record_broken = total_minutes > 0 && total_minutes > historicalMax;

  return {
    user_name: profile.username?.trim() || profile.display_name?.trim() || "Explorer",
    week_label_tr: formatWeekLabel(weekStart, "tr-TR"),
    week_label_en: formatWeekLabel(weekStart, "en-US"),
    total_minutes,
    total_sessions,
    completed_sessions,
    best_day_tr,
    best_day_en,
    best_day_minutes: bestMinutes > 0 ? bestMinutes : null,
    peak_hour_range: computePeakHourRange(weekSessions),
    current_streak: profile.streak_count,
    longest_streak: profile.longest_streak,
    personal_record_broken,
    vs_last_week_minutes,
    daily_goal_minutes,
    goal_met_days,
    user_type: classifyUserType(profile.created_at, total_minutes, refDate),
  };
};

// ---------------------------------------------------------------------------
// AI + fallback
// ---------------------------------------------------------------------------

const toneByUserType: Record<WeeklyStats["user_type"], string> = {
  inactive:
    "Tone: gentle re-engagement. Invite them back without guilt. Mention the app is ready when they are.",
  new:
    "Tone: warm welcome. Celebrate any small win. Briefly encourage building a rhythm next week.",
  low:
    "Tone: supportive and hopeful. Highlight one concrete positive from the data. Suggest one tiny next step.",
  medium:
    "Tone: balanced pride. Acknowledge progress and give one practical tip for next week.",
  high:
    "Tone: celebratory. Honor discipline. Offer a subtle stretch goal for next week.",
};

const buildSystemPrompt = (userType: WeeklyStats["user_type"]): string =>
  `You are Astrocus, a calm cosmic focus coach in a gamified pomodoro app.

Write a personalized weekly focus report in TWO languages as JSON ONLY:
{"tr":"Turkish text","en":"English text"}

Rules:
- Each language: 2-4 sentences, max 110 words per language.
- Warm cosmic metaphor; no emojis; no bullet points; no markdown.
- Use ONLY numbers and facts present in the user JSON payload.
- Address the user by user_name in each language naturally.
- Mention week_label_tr in the Turkish text and week_label_en in the English text.

${toneByUserType[userType]}

Output ONLY valid JSON with keys "tr" and "en". No other keys. No preamble.`;

const parseReportText = (raw: string | undefined): ReportText | null => {
  if (!raw) return null;
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = JSON.parse(jsonMatch[0]) as Record<string, unknown>;
    if (typeof parsed.tr === "string" && typeof parsed.en === "string") {
      return { tr: parsed.tr.trim(), en: parsed.en.trim() };
    }
  } catch {
    return null;
  }
  return null;
};

const FALLBACKS: Record<WeeklyStats["user_type"], (stats: WeeklyStats) => ReportText> = {
  inactive: (stats) => {
    const name = stats.user_name;
    return {
      tr: `${name}, ${stats.week_label_tr} haftasında kayıtlı odak dakikan yok — galaksin seni bekliyor. Gelecek hafta kısa bir seansla yıldız tozunu yeniden toplamaya ne dersin?`,
      en: `${name}, you logged no focus minutes during ${stats.week_label_en} — your galaxy is still waiting. How about one short session next week to gather stardust again?`,
    };
  },
  new: (stats) => {
    const name = stats.user_name;
    const mins = stats.total_minutes;
    const sessions = stats.completed_sessions;
    return {
      tr: `${name}, ${stats.week_label_tr} haftasında ${mins} dakika ve ${sessions} tamamlanmış seansla yolculuğa başladın. Küçük adımlar büyük takımyıldızları kurar; ritmini sürdür.`,
      en: `${name}, you began your journey with ${mins} minutes and ${sessions} completed sessions in ${stats.week_label_en}. Small steps build great constellations — keep your rhythm.`,
    };
  },
  low: (stats) => {
    const name = stats.user_name;
    const mins = stats.total_minutes;
    return {
      tr: `${name}, bu hafta ${mins} dakika odaklandın${stats.best_day_tr ? `; en güçlü günün ${stats.best_day_tr}` : ""}. Bir sonraki hafta hedefini biraz büyütmek için hazırsın.`,
      en: `${name}, you focused for ${mins} minutes this week${stats.best_day_en ? `; your strongest day was ${stats.best_day_en}` : ""}. You're ready to stretch your goal a little next week.`,
    };
  },
  medium: (stats) => {
    const name = stats.user_name;
    const mins = stats.total_minutes;
    const sessions = stats.completed_sessions;
    return {
      tr: `${name}, ${stats.week_label_tr} boyunca ${mins} dakika ve ${sessions} seans — istikrarlı bir yörünge. ${stats.goal_met_days} gün günlük hedefini yakaladın; bu ritmi koru.`,
      en: `${name}, ${mins} minutes and ${sessions} sessions across ${stats.week_label_en} — a steady orbit. You hit your daily goal on ${stats.goal_met_days} days; keep this rhythm.`,
    };
  },
  high: (stats) => {
    const name = stats.user_name;
    const mins = stats.total_minutes;
    return {
      tr: `${name}, ${stats.week_label_tr} haftasında ${mins} dakikalık derin bir uçuş! ${stats.current_streak} günlük serin parlıyor${stats.personal_record_broken ? " ve haftalık rekorunu kırdın" : ""}. Yıldızlar seninle.`,
      en: `${name}, a deep ${mins}-minute flight during ${stats.week_label_en}! Your ${stats.current_streak}-day streak shines${stats.personal_record_broken ? " and you set a weekly record" : ""}. The stars are with you.`,
    };
  },
};

export const buildFallbackReport = (stats: WeeklyStats): ReportText => FALLBACKS[stats.user_type](stats);

async function callLLM(stats: WeeklyStats, apiKey: string): Promise<ReportText | null> {
  const systemPrompt = buildSystemPrompt(stats.user_type);

  for (let i = 0; i < MODELS.length; i += 1) {
    const model = MODELS[i];
    try {
      const response = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://astrocus.app",
          "X-Title": "Astrocus Weekly Reports",
        },
        body: JSON.stringify({
          model,
          max_tokens: 300,
          temperature: 0.7,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(stats) },
          ],
        }),
      });

      if (!response.ok) {
        console.warn(`[weekly-reports] ${model}: HTTP ${response.status}`);
        if (i < MODELS.length - 1) await sleep(MODEL_RETRY_DELAY_MS);
        continue;
      }

      const data = await response.json() as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const content = data.choices?.[0]?.message?.content;
      const parsed = parseReportText(content);
      if (parsed?.tr && parsed?.en) {
        return parsed;
      }
    } catch (err) {
      console.warn(`[weekly-reports] model ${model} failed:`, err);
    }

    if (i < MODELS.length - 1) {
      await sleep(MODEL_RETRY_DELAY_MS);
    }
  }

  return null;
}

const generateReportText = async (stats: WeeklyStats): Promise<{ text: ReportText; fallback: boolean }> => {
  const apiKey = Deno.env.get("OPENROUTER_API_KEY")?.trim();
  if (!apiKey) {
    return { text: buildFallbackReport(stats), fallback: true };
  }

  const llmText = await callLLM(stats, apiKey);
  if (llmText) {
    return { text: llmText, fallback: false };
  }

  return { text: buildFallbackReport(stats), fallback: true };
};

// ---------------------------------------------------------------------------
// HTTP handler
// ---------------------------------------------------------------------------

const extractBearerToken = (req: Request): string | null => {
  const auth = req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!auth) return null;
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return (match?.[1] ?? auth).trim();
};

const CRON_SECRET_MIN_LENGTH = 32;

/** Yalnızca CRON_SECRET (Bearer veya x-cron-secret). Service role ile auth kaldırıldı. */
const authorizeCron = (req: Request): boolean => {
  const cronSecret = Deno.env.get("CRON_SECRET")?.trim();
  if (!cronSecret || cronSecret.length < CRON_SECRET_MIN_LENGTH) {
    return false;
  }

  const bearer = extractBearerToken(req);
  const cronHeader = req.headers.get("x-cron-secret")?.trim();

  return bearer === cronSecret || cronHeader === cronSecret;
};

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!authorizeCron(req)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: "Missing Supabase env" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let weekStartKey: string | null = null;
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    if (body && typeof body.week_start === "string") {
      weekStartKey = body.week_start;
    }
  } catch {
    /* optional body */
  }

  const refDate = new Date();
  const targetWeekStart = weekStartKey
    ? parseDateKey(weekStartKey)
    : getWeekStartUtc(refDate, 1);
  const weekStart = targetWeekStart;
  const weekEnd = getWeekEndUtc(weekStart);
  const weekStartStr = toDateKeyUtc(weekStart);

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, username, display_name, streak_count, longest_streak, daily_goal_minutes, created_at");

  if (profilesError) {
    return new Response(JSON.stringify({ error: profilesError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const profile of (profiles ?? []) as ProfileRow[]) {
    try {
      const { data: existing } = await admin
        .from("weekly_reports")
        .select("id")
        .eq("user_id", profile.id)
        .eq("week_start", weekStartStr)
        .maybeSingle();

      if (existing) {
        skipped += 1;
        continue;
      }

      const { data: sessions, error: sessionsError } = await admin
        .from("sessions")
        .select("duration_minutes, started_at, completed_at, pause_used")
        .eq("user_id", profile.id);

      if (sessionsError) throw sessionsError;

      const allSessions = (sessions ?? []) as SessionRow[];
      const weekSessions = allSessions.filter((s) => sessionInWeek(s, weekStart, weekEnd));

      const weekEndStr = toDateKeyUtc(weekEnd);
      const { data: goalRows, error: goalsError } = await admin
        .from("daily_goal_entries")
        .select("goal_date, goal_minutes")
        .eq("user_id", profile.id)
        .gte("goal_date", weekStartStr)
        .lte("goal_date", weekEndStr);

      if (goalsError) throw goalsError;

      const goalsByDay = new Map<string, number>();
      for (const row of goalRows ?? []) {
        const goalDate = String((row as { goal_date: string }).goal_date);
        const goalMinutes = Number((row as { goal_minutes: number }).goal_minutes);
        if (goalDate && goalMinutes > 0) {
          goalsByDay.set(goalDate, goalMinutes);
        }
      }

      const priorMax = await maxWeekMinutesBefore(admin, profile.id, weekStartStr);

      const stats = buildWeeklyStats(
        profile,
        weekSessions,
        weekStart,
        weekEnd,
        allSessions,
        priorMax,
        refDate,
        goalsByDay,
      );

      const { text, fallback } = await generateReportText(stats);

      const { error: insertError } = await admin.from("weekly_reports").insert({
        user_id: profile.id,
        week_start: weekStartStr,
        stats_json: stats,
        report_text: text,
        fallback_used: fallback,
      });

      if (insertError) throw insertError;
      processed += 1;
    } catch (err) {
      failed += 1;
      console.error(`[weekly-reports] user ${profile.id}:`, err);
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      week_start: weekStartStr,
      processed,
      skipped,
      failed,
      total_profiles: profiles?.length ?? 0,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
