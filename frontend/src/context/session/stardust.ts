import { CATEGORIES } from "../../shared/constants";
import { AuthPayload, DailyGoalProgress, SessionRecord, User } from "../../shared/types";
import { simulateDemoSessionReward } from "../auth/devDemo";
import { getDateKey, isSameLocalCalendarDay } from "./dateKey";

const resolveTodayGoalMinutes = (
  user: User | null,
  dailyGoalToday?: DailyGoalProgress | null,
): number => {
  if (dailyGoalToday && dailyGoalToday.goalMinutes > 0) {
    return dailyGoalToday.goalMinutes;
  }
  return user?.dailyGoalMinutes ?? 0;
};

export const createDailySummary = (
  sessions: SessionRecord[],
  user: User | null,
  dailyGoalToday?: DailyGoalProgress | null,
) => {
  const todaySessions = sessions.filter((session) => isSameLocalCalendarDay(session.completedAt));
  const totalMinutes = todaySessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const categoryBreakdown = CATEGORIES.map((category) => ({
    categoryId: category.id,
    minutes: todaySessions
      .filter((session) => session.categoryId === category.id)
      .reduce((sum, session) => sum + session.durationMinutes, 0),
  })).filter((item) => item.minutes > 0);

  const goalMinutes = resolveTodayGoalMinutes(user, dailyGoalToday);

  return {
    totalMinutes,
    completedSessions: todaySessions.length,
    goalProgress: goalMinutes > 0 ? Math.min(totalMinutes / goalMinutes, 1) : 0,
    categoryBreakdown,
  };
};

/** Client-side preview when a session is queued for offline sync. */
export const estimateSessionCelebration = (
  base: AuthPayload,
  input: {
    durationMinutes: number;
    startedAt: string;
    completedAt: string;
    pauseCount: number;
  },
) => {
  const durationMinutes = Math.max(0, Math.floor(input.durationMinutes));

  const sessionDate = getDateKey(input.completedAt);
  const yesterday = new Date(input.completedAt);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getDateKey(yesterday.toISOString());
  const lastDate = base.user.lastSessionDate;

  let streakCount: number;
  if (!lastDate) {
    streakCount = 1;
  } else if (lastDate === sessionDate) {
    streakCount = base.user.currentStreak;
  } else if (lastDate === yesterdayKey) {
    streakCount = base.user.currentStreak + 1;
  } else {
    streakCount = 1;
  }

  const { stardustEarned } = simulateDemoSessionReward({
    durationMinutes,
    pauseCount: input.pauseCount,
    streakAfterSession: streakCount,
  });

  const todayTotalMinutes =
    base.sessions
      .filter((session) => isSameLocalCalendarDay(session.completedAt))
      .reduce((sum, session) => sum + session.durationMinutes, 0) + durationMinutes;

  return { durationMinutes, todayTotalMinutes, streakCount, stardustEarned };
};
