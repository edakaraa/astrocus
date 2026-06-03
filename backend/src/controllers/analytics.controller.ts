import type { Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth";
import { createSupabaseUserClient } from "../lib/supabaseAdmin";
import type { AnalyticsSummary, DailyGoalHistoryDay } from "../types/api";

const querySchema = z.object({
  timezone: z.string().min(1).optional().default("UTC"),
});

const historyQuerySchema = z.object({
  timezone: z.string().min(1).optional().default("UTC"),
  days: z.coerce.number().int().min(1).max(366).optional().default(30),
});

const toDateKey = (iso: string, timeZone: string) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(iso));

  const year = parts.find((p) => p.type === "year")?.value ?? "1970";
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${year}-${month}-${day}`;
};

const MONDAY_FIRST_WEEKDAY: Record<string, number> = {
  Mon: 0,
  Tue: 1,
  Wed: 2,
  Thu: 3,
  Fri: 4,
  Sat: 5,
  Sun: 6,
};

/** Monday → Sunday date keys for the current calendar week in the user's timezone. */
const buildCurrentWeekDayKeys = (timeZone: string) => {
  const now = new Date();
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(now);
  const mondayOffset = MONDAY_FIRST_WEEKDAY[weekday] ?? 0;

  return Array.from({ length: 7 }, (_, index) => {
    const d = new Date(now);
    d.setDate(now.getDate() - mondayOffset + index);
    return toDateKey(d.toISOString(), timeZone);
  });
};

export const getAnalyticsSummary = async (req: AuthedRequest, res: Response) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
      return;
    }

    if (!req.userId || !req.accessToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { timezone } = parsed.data;
    const supabase = createSupabaseUserClient(req.accessToken);

    const [profileResult, sessionsResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("streak_count, longest_streak, total_stardust")
        .eq("id", req.userId)
        .single(),
      supabase
        .from("sessions")
        .select("category_id, duration_minutes, completed_at")
        .eq("user_id", req.userId)
        .order("completed_at", { ascending: false }),
    ]);

    if (profileResult.error) {
      res.status(500).json({ error: "Failed to load profile", code: profileResult.error.message });
      return;
    }

    if (sessionsResult.error) {
      res.status(500).json({ error: "Failed to load sessions", code: sessionsResult.error.message });
      return;
    }

    const sessions = sessionsResult.data ?? [];
    const weekKeys = buildCurrentWeekDayKeys(timezone);
    const weekMap = new Map(weekKeys.map((key) => [key, 0]));

    const categoryMinutes = new Map<string, number>();
    let totalFocusMinutes = 0;

    for (const session of sessions) {
      totalFocusMinutes += session.duration_minutes;
      const dayKey = toDateKey(session.completed_at, timezone);

      if (weekMap.has(dayKey)) {
        weekMap.set(dayKey, (weekMap.get(dayKey) ?? 0) + session.duration_minutes);
      }

      categoryMinutes.set(
        session.category_id,
        (categoryMinutes.get(session.category_id) ?? 0) + session.duration_minutes,
      );
    }

    const categoryTotal = Array.from(categoryMinutes.values()).reduce((sum, n) => sum + n, 0);

    const categoryDistribution = Array.from(categoryMinutes.entries())
      .map(([categoryId, minutes]) => ({
        categoryId,
        minutes,
        percentage: categoryTotal > 0 ? Math.round((minutes / categoryTotal) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.minutes - a.minutes);

    const payload: AnalyticsSummary = {
      totalFocusMinutes,
      weekFocusMinutes: weekKeys.map((key) => weekMap.get(key) ?? 0),
      categoryDistribution,
      streakCount: profileResult.data.streak_count,
      longestStreak: profileResult.data.longest_streak,
      totalStardust: profileResult.data.total_stardust,
    };

    res.json(payload);
  } catch (error) {
    console.error("[analytics/summary]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const mapHistoryRow = (raw: unknown): DailyGoalHistoryDay | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const row = raw as Record<string, unknown>;
  const goalDate = typeof row.goal_date === "string" ? row.goal_date : null;
  if (!goalDate) {
    return null;
  }
  return {
    goalDate,
    goalMinutes: Number(row.goal_minutes ?? 0),
    focusedMinutes: Number(row.focused_minutes ?? 0),
    completedSessions: Number(row.completed_sessions ?? 0),
    goalMet: Boolean(row.goal_met),
    rewardClaimed: Boolean(row.reward_claimed),
  };
};

/** Daily goal + focus history for charts (backed by `list_daily_goal_history` RPC). */
export const getDailyGoalHistory = async (req: AuthedRequest, res: Response) => {
  try {
    const parsed = historyQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid query", details: parsed.error.flatten() });
      return;
    }

    if (!req.userId || !req.accessToken) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const { timezone, days } = parsed.data;
    const supabase = createSupabaseUserClient(req.accessToken);

    const { data, error } = await supabase.rpc("list_daily_goal_history", {
      p_days: days,
      p_timezone: timezone,
    });

    if (error) {
      res.status(500).json({ error: "Failed to load daily goal history", code: error.message });
      return;
    }

    const history = Array.isArray(data)
      ? data.map(mapHistoryRow).filter((row): row is DailyGoalHistoryDay => row !== null)
      : [];

    res.json({ history });
  } catch (error) {
    console.error("[analytics/daily-goals]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
