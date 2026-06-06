import { AuthPayload, SessionRecord, User } from "../../shared/types";
import {
  STARS,
  getPartialStardustThresholdMinutes,
  STARDUST_NO_PAUSE_BONUS,
  STARDUST_PER_MINUTE,
  STARDUST_STREAK_BONUS_MAX,
  STARDUST_STREAK_BONUS_PER_DAY,
} from "../../shared/constants";
import { getDateKey, isSameLocalCalendarDay } from "../session/dateKey";

export const DEV_DEMO = {
  tokenPrefix: "dev-demo",
  emailAliases: ["demo", "demo@astrocus.dev"] as string[],
  password: "demo1234",
} as const;

/** Sadece __DEV__ demo oturumunda — sunucu ile aynı kazanç formülü. */
export const simulateDemoSessionReward = (input: {
  durationMinutes: number;
  pauseCount: number;
  /** Seri +1 varsayımı ile demo kutlaması */
  streakAfterSession: number;
}) => {
  const baseStardust = input.durationMinutes * STARDUST_PER_MINUTE;
  const streakBonus = Math.min(
    input.streakAfterSession * STARDUST_STREAK_BONUS_PER_DAY,
    STARDUST_STREAK_BONUS_MAX,
  );
  const pauseBonus = input.pauseCount === 0 ? STARDUST_NO_PAUSE_BONUS : 0;
  const totalBonus = streakBonus + pauseBonus;
  const stardustEarned = Math.round(baseStardust + baseStardust * totalBonus);
  return { stardustEarned, streakCount: input.streakAfterSession };
};

/** Demo / client-side preview of partial reward on early cancel. */
export const simulatePartialCancelReward = (input: {
  plannedDurationMinutes: number;
  focusedMinutes: number;
}) => {
  const threshold = getPartialStardustThresholdMinutes(input.plannedDurationMinutes);
  const minutesFocused = Math.max(0, Math.floor(input.focusedMinutes));
  if (minutesFocused < threshold) {
    return { saved: false as const, stardustEarned: 0, minutesFocused };
  }
  return {
    saved: true as const,
    stardustEarned: minutesFocused * STARDUST_PER_MINUTE,
    minutesFocused,
  };
};

const demoSessionId = () => `demo-session-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

type DemoSessionInput = {
  categoryId: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
  pauseCount: number;
};

/** Merge a completed demo session into existing client state (no server). */
export const appendDemoCompletedSession = (
  base: AuthPayload,
  input: DemoSessionInput,
): {
  payload: AuthPayload;
  durationMinutes: number;
  todayTotalMinutes: number;
  streakCount: number;
  stardustEarned: number;
} => {
  const durationMinutes = Math.max(0, Math.floor(input.durationMinutes));

  const existingSessions = base.sessions;
  const lastSession =
    existingSessions.length > 0
      ? existingSessions.reduce((latest, session) =>
          new Date(session.completedAt).getTime() > new Date(latest.completedAt).getTime() ? session : latest,
        )
      : null;
  const lastSessionDate = lastSession ? new Date(lastSession.completedAt) : null;
  const isNewDay = !lastSessionDate || !isSameLocalCalendarDay(lastSessionDate);
  const streakCount = isNewDay ? base.user.currentStreak + 1 : base.user.currentStreak;

  const { stardustEarned } = simulateDemoSessionReward({
    durationMinutes,
    pauseCount: input.pauseCount,
    streakAfterSession: streakCount,
  });

  const sessionRecord: SessionRecord = {
    id: demoSessionId(),
    userId: base.user.id,
    categoryId: input.categoryId,
    durationMinutes,
    stardustEarned,
    pauseUsed: input.pauseCount > 0,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    isOffline: false,
  };

  const todayTotalMinutes =
    existingSessions
      .filter((session) => isSameLocalCalendarDay(session.completedAt))
      .reduce((sum, session) => sum + session.durationMinutes, 0) + durationMinutes;

  const updatedPayload: AuthPayload = {
    ...base,
    user: {
      ...base.user,
      totalStardust: base.user.totalStardust + stardustEarned,
      currentStreak: streakCount,
      longestStreak: Math.max(base.user.longestStreak, streakCount),
      lastSessionDate: getDateKey(input.completedAt),
    },
    sessions: [sessionRecord, ...base.sessions],
  };

  return { payload: updatedPayload, durationMinutes, todayTotalMinutes, streakCount, stardustEarned };
};

/** Merge a partial demo cancel reward into existing client state. */
export const appendDemoPartialSession = (
  base: AuthPayload,
  input: { categoryId: string; startedAt: string; cancelledAt: string },
  partial: { stardustEarned: number; minutesFocused: number },
): AuthPayload => {
  const sessionRecord: SessionRecord = {
    id: demoSessionId(),
    userId: base.user.id,
    categoryId: input.categoryId,
    durationMinutes: partial.minutesFocused,
    stardustEarned: partial.stardustEarned,
    pauseUsed: false,
    startedAt: input.startedAt,
    completedAt: input.cancelledAt,
    isOffline: false,
  };

  return {
    ...base,
    user: {
      ...base.user,
      totalStardust: base.user.totalStardust + partial.stardustEarned,
    },
    sessions: [sessionRecord, ...base.sessions],
  };
};

export const createDevDemoPayload = (input: { email: string }): AuthPayload => {
  const now = Date.now();
  const user: User = {
    id: `${DEV_DEMO.tokenPrefix}-user`,
    email: input.email.includes("@") ? input.email : "demo@astrocus.dev",
    username: "demo",
    avatar: "moon",
    galaxyName: "Astrocus",
    language: "tr",
    totalStardust: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    targetStarId: STARS[0].id,
    activeConstellationId: "aries",
    onboardingCompleted: true,
    dailyGoalMinutes: 120,
  };

  return {
    token: `${DEV_DEMO.tokenPrefix}:${now}`,
    user,
    sessions: [],
    unlockedStarIds: [STARS[0].id],
    earnedBadgeIds: [],
    constellationProgress: [],
  };
};

export const isDevDemoToken = (token: string | null) => Boolean(token && token.startsWith(`${DEV_DEMO.tokenPrefix}:`));

export const matchesDevDemoCredentials = (input: { email: string; password: string }) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  return DEV_DEMO.emailAliases.includes(email) && password === DEV_DEMO.password;
};
