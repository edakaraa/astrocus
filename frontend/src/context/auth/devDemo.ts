import { AuthPayload, User } from "../../shared/types";
import { STARS } from "../../shared/constants";

export const DEV_DEMO = {
  tokenPrefix: "dev-demo",
  emailAliases: ["demo", "demo@astrocus.dev"] as string[],
  password: "demo1234",
} as const;

/** Sadece __DEV__ demo oturumunda — migration 003 ile uyumlu (2 ✦/dk taban). */
export const simulateDemoSessionReward = (input: {
  durationMinutes: number;
  pauseCount: number;
  /** Seri +1 varsayımı ile demo kutlaması */
  streakAfterSession: number;
}) => {
  const baseStardust = input.durationMinutes * 2;
  const streakBonus = Math.min(input.streakAfterSession * 0.1, 0.5);
  const pauseBonus = input.pauseCount === 0 ? 0.1 : 0;
  const totalBonus = streakBonus + pauseBonus;
  const stardustEarned = Math.round(baseStardust + baseStardust * totalBonus);
  return { stardustEarned, streakCount: input.streakAfterSession };
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
