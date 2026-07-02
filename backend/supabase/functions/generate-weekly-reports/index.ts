import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  addCalendarDays,
  formatWeekLabel,
  getLastCompletedWeekMondayKey,
  getWeekDateKeys,
  getWeekMondayKeyForLocalDate,
  getWeeksToProcessForUser,
  toDateKeyInTimeZone,
  weekdayIndexInTimeZone,
} from "./weekTimezone.ts";

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
  /** Longest consecutive focus-day run within the reported week (local calendar days). */
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
  timezone?: string | null;
};

type SessionRow = {
  duration_minutes: number;
  started_at: string;
  completed_at: string;
  pause_used: boolean;
};

type ReportText = { tr: string; en: string };

type AdminClient = SupabaseClient;

type WeeklyReportStatsRow = {
  stats_json: { total_minutes?: number } | null;
};

type WeeklyReportInsert = {
  user_id: string;
  week_start: string;
  stats_json: WeeklyStats;
  report_text: ReportText;
  fallback_used: boolean;
};

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODELS = [
  "google/gemma-4-31b-it:free",
  "google/gemma-4-26b-a4b-it:free",
  "nvidia/nemotron-3-super-120b:free",
] as const;

const MODEL_RETRY_DELAY_MS = 3000;
const USER_CONCURRENCY = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const DAY_NAMES_TR = ["Pazar", "Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi"];
const DAY_NAMES_EN = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const runInBatches = async <T>(
  items: T[],
  batchSize: number,
  fn: (item: T) => Promise<void>,
): Promise<void> => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await Promise.all(batch.map((item) => fn(item)));
  }
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

const sessionInWeekKeys = (
  session: SessionRow,
  weekKeys: Set<string>,
  timeZone: string,
): boolean => {
  const key = toDateKeyInTimeZone(new Date(session.completed_at), timeZone);
  return weekKeys.has(key);
};

const computePeakHourRange = (sessions: SessionRow[], timeZone: string): string | null => {
  if (sessions.length === 0) return null;

  const pad2 = (n: number) => String(n).padStart(2, "0");
  const hourMinutes = new Array<number>(24).fill(0);
  for (const s of sessions) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "numeric",
      hour12: false,
    }).formatToParts(new Date(s.started_at));
    const h = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
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

const sumMinutesByLocalDay = (sessions: SessionRow[], timeZone: string): Map<string, number> => {
  const map = new Map<string, number>();
  for (const s of sessions) {
    const key = toDateKeyInTimeZone(new Date(s.completed_at), timeZone);
    map.set(key, (map.get(key) ?? 0) + s.duration_minutes);
  }
  return map;
};

const maxWeekMinutesBefore = async (
  admin: AdminClient,
  userId: string,
  beforeWeekStart: string,
): Promise<number> => {
  const { data } = await admin
    .from("weekly_reports")
    .select("stats_json")
    .eq("user_id", userId)
    .lt("week_start", beforeWeekStart);

  let max = 0;
  for (const row of (data ?? []) as WeeklyReportStatsRow[]) {
    const mins = Number(row.stats_json?.total_minutes ?? 0);
    if (mins > max) max = mins;
  }
  return max;
};

const sumWeekMinutesFromSessions = (
  allSessions: SessionRow[],
  weekKeys: Set<string>,
  timeZone: string,
): number => {
  let total = 0;
  for (const s of allSessions) {
    if (sessionInWeekKeys(s, weekKeys, timeZone)) {
      total += s.duration_minutes;
    }
  }
  return total;
};

/** Longest run of consecutive local calendar days with ≥1 session in the reported week. */
export const computeLongestStreakInWeek = (
  weekSessions: SessionRow[],
  weekDateKeys: string[],
  timeZone: string,
): number => {
  const byDay = sumMinutesByLocalDay(weekSessions, timeZone);
  let longest = 0;
  let current = 0;

  for (const key of weekDateKeys) {
    if ((byDay.get(key) ?? 0) > 0) {
      current += 1;
      longest = Math.max(longest, current);
    } else {
      current = 0;
    }
  }

  return longest;
};

export const buildWeeklyStats = (
  profile: ProfileRow,
  weekSessions: SessionRow[],
  weekMondayKey: string,
  weekDateKeys: string[],
  timeZone: string,
  allSessions: SessionRow[],
  priorMaxWeekMinutes: number,
  refDate: Date,
  goalsByDay: Map<string, number> = new Map(),
): WeeklyStats => {
  const weekKeySet = new Set(weekDateKeys);
  const sundayKey = weekDateKeys[6];

  const total_minutes = weekSessions.reduce((sum, s) => sum + s.duration_minutes, 0);
  const total_sessions = weekSessions.length;
  const completed_sessions = weekSessions.filter((s) => !s.pause_used).length;

  const byDay = sumMinutesByLocalDay(weekSessions, timeZone);
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
    const dow = weekdayIndexInTimeZone(bestKey, timeZone);
    best_day_tr = DAY_NAMES_TR[dow];
    best_day_en = DAY_NAMES_EN[dow];
  }

  const daily_goal_minutes = profile.daily_goal_minutes;
  let goal_met_days = 0;
  for (const key of weekDateKeys) {
    const dayGoal = goalsByDay.get(key);
    if (dayGoal != null && (byDay.get(key) ?? 0) >= dayGoal) {
      goal_met_days += 1;
    }
  }

  const firstDayKey = weekDateKeys[0];
  const hasAnyPriorWeek = allSessions.some((s) => {
    const localKey = toDateKeyInTimeZone(new Date(s.completed_at), timeZone);
    return localKey < firstDayKey;
  });

  const prevMondayKey = addCalendarDays(weekMondayKey, -7, timeZone);
  const prevWeekKeys = new Set(getWeekDateKeys(prevMondayKey, timeZone));
  const lastWeekTotal = sumWeekMinutesFromSessions(allSessions, prevWeekKeys, timeZone);

  const vs_last_week_minutes = hasAnyPriorWeek ? total_minutes - lastWeekTotal : null;

  const weekTotalsBefore = new Map<string, number>();
  for (const s of allSessions) {
    const localKey = toDateKeyInTimeZone(new Date(s.completed_at), timeZone);
    if (weekKeySet.has(localKey) || localKey >= weekMondayKey) continue;
    const wsKey = getWeekMondayKeyForLocalDate(localKey, timeZone);
    weekTotalsBefore.set(wsKey, (weekTotalsBefore.get(wsKey) ?? 0) + s.duration_minutes);
  }
  const sessionHistoryMax = weekTotalsBefore.size > 0
    ? Math.max(...weekTotalsBefore.values())
    : 0;
  const historicalMax = Math.max(priorMaxWeekMinutes, sessionHistoryMax);
  const personal_record_broken = total_minutes > 0 && total_minutes > historicalMax;
  const weekLongestStreak = computeLongestStreakInWeek(weekSessions, weekDateKeys, timeZone);

  return {
    user_name: profile.username?.trim() || profile.display_name?.trim() || "Explorer",
    week_label_tr: formatWeekLabel(weekMondayKey, sundayKey, "tr-TR"),
    week_label_en: formatWeekLabel(weekMondayKey, sundayKey, "en-US"),
    total_minutes,
    total_sessions,
    completed_sessions,
    best_day_tr,
    best_day_en,
    best_day_minutes: bestMinutes > 0 ? bestMinutes : null,
    peak_hour_range: computePeakHourRange(weekSessions, timeZone),
    current_streak: weekLongestStreak,
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
- current_streak = longest consecutive focus days within the reported week (not all-time).
- longest_streak = all-time personal best streak days.
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
      tr: `${name}, ${stats.week_label_tr} haftasında ${mins} dakikalık derin bir uçuş!${stats.current_streak > 0 ? ` En uzun serin ${stats.current_streak} gün` : ""}${stats.personal_record_broken ? " ve haftalık rekorunu kırdın" : ""}. Yıldızlar seninle.`,
      en: `${name}, a deep ${mins}-minute flight during ${stats.week_label_en}!${stats.current_streak > 0 ? ` Your longest run was ${stats.current_streak} days` : ""}${stats.personal_record_broken ? " and you set a weekly record" : ""}. The stars are with you.`,
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

type ProcessResult = { processed: number; skipped: number; failed: number };

const resolveUserTimezone = async (
  admin: AdminClient,
  profile: ProfileRow,
): Promise<string> => {
  const { data: goalRow } = await admin
    .from("daily_goal_entries")
    .select("timezone")
    .eq("user_id", profile.id)
    .order("goal_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  const goalTz = (goalRow as { timezone?: string } | null)?.timezone?.trim();
  const profileTz = profile.timezone?.trim();

  // profiles.timezone defaults to UTC before first app sync — prefer real goal/device TZ.
  if (profileTz && profileTz !== "UTC") return profileTz;
  if (goalTz) return goalTz;
  return profileTz || "UTC";
};

const processProfileWeeks = async (
  admin: AdminClient,
  profile: ProfileRow,
  refDate: Date,
  explicitWeekStart: string | null,
  backfill: boolean,
): Promise<ProcessResult> => {
  let processed = 0;
  let skipped = 0;
  let failed = 0;

  const timeZone = await resolveUserTimezone(admin, profile);
  const weeksToProcess = getWeeksToProcessForUser(timeZone, refDate, explicitWeekStart, backfill);

  const { data: sessions, error: sessionsError } = await admin
    .from("sessions")
    .select("duration_minutes, started_at, completed_at, pause_used")
    .eq("user_id", profile.id);

  if (sessionsError) {
    console.error(`[weekly-reports] sessions ${profile.id}:`, sessionsError);
    return { processed, skipped, failed: weeksToProcess.length };
  }

  const allSessions = (sessions ?? []) as SessionRow[];

  for (const weekMondayKey of weeksToProcess) {
    const weekDateKeys = getWeekDateKeys(weekMondayKey, timeZone);
    const weekKeySet = new Set(weekDateKeys);
    const weekEndKey = weekDateKeys[6];

    try {
      const { data: existing } = await admin
        .from("weekly_reports")
        .select("id")
        .eq("user_id", profile.id)
        .eq("week_start", weekMondayKey)
        .maybeSingle();

      if (existing) {
        skipped += 1;
        continue;
      }

      const weekSessions = allSessions.filter((s) => sessionInWeekKeys(s, weekKeySet, timeZone));

      const { data: goalRows, error: goalsError } = await admin
        .from("daily_goal_entries")
        .select("goal_date, goal_minutes")
        .eq("user_id", profile.id)
        .gte("goal_date", weekMondayKey)
        .lte("goal_date", weekEndKey);

      if (goalsError) throw goalsError;

      const goalsByDay = new Map<string, number>();
      for (const row of goalRows ?? []) {
        const goalDate = String((row as { goal_date: string }).goal_date);
        const goalMinutes = Number((row as { goal_minutes: number }).goal_minutes);
        if (goalDate && goalMinutes > 0) {
          goalsByDay.set(goalDate, goalMinutes);
        }
      }

      const priorMax = await maxWeekMinutesBefore(admin, profile.id, weekMondayKey);

      const stats = buildWeeklyStats(
        profile,
        weekSessions,
        weekMondayKey,
        weekDateKeys,
        timeZone,
        allSessions,
        priorMax,
        refDate,
        goalsByDay,
      );

      const { text, fallback } = await generateReportText(stats);

      const insertRow: WeeklyReportInsert = {
        user_id: profile.id,
        week_start: weekMondayKey,
        stats_json: stats,
        report_text: text,
        fallback_used: fallback,
      };
      const { error: insertError } = await admin.from("weekly_reports").insert(insertRow);

      if (insertError) throw insertError;
      processed += 1;
    } catch (err) {
      failed += 1;
      console.error(`[weekly-reports] user ${profile.id} week ${weekMondayKey}:`, err);
    }
  }

  return { processed, skipped, failed };
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
  let backfill = false;
  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};
    if (body && typeof body.week_start === "string") {
      weekStartKey = body.week_start;
    }
    if (body && body.backfill === true) {
      backfill = true;
    }
  } catch {
    /* optional body */
  }

  const refDate = new Date();

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: profiles, error: profilesError } = await admin
    .from("profiles")
    .select("id, username, display_name, streak_count, longest_streak, daily_goal_minutes, created_at, timezone");

  if (profilesError) {
    return new Response(JSON.stringify({ error: profilesError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  const profileRows = (profiles ?? []) as ProfileRow[];
  await runInBatches(profileRows, USER_CONCURRENCY, async (profile) => {
    const result = await processProfileWeeks(admin, profile, refDate, weekStartKey, backfill);
    processed += result.processed;
    skipped += result.skipped;
    failed += result.failed;
  });

  return new Response(
    JSON.stringify({
      ok: true,
      backfill,
      processed,
      skipped,
      failed,
      total_profiles: profileRows.length,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
