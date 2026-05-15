import type { Response } from "express";
import { z } from "zod";
import type { AuthedRequest } from "../middleware/auth";
import { createSupabaseUserClient } from "../lib/supabaseAdmin";
import type { AnalyticsSummary } from "../types/api";

const querySchema = z.object({
  timezone: z.string().min(1).optional().default("UTC"),
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

const buildLastSevenDayKeys = (timeZone: string) => {
  const keys: string[] = [];
  const now = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const d = new Date(now);
    d.setDate(now.getDate() - offset);
    keys.push(toDateKey(d.toISOString(), timeZone));
  }

  return keys;
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
        .select("streak_count, longest_streak, level, total_xp, total_stardust")
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
    const weekKeys = buildLastSevenDayKeys(timezone);
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
      level: profileResult.data.level,
      totalXp: profileResult.data.total_xp,
      totalStardust: profileResult.data.total_stardust,
    };

    res.json(payload);
  } catch (error) {
    console.error("[analytics/summary]", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
