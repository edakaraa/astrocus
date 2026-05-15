// [GÖREV 3] — app-context altından auth modülüne taşındı (demo oturum yardımcıları)

import { AuthPayload, User } from "../../shared/types";
import { STARS } from "../../shared/constants";

export const DEV_DEMO = {
  tokenPrefix: "dev-demo",
  emailAliases: ["demo", "demo@astrocus.dev"] as string[],
  password: "demo1234",
} as const;

/** Sadece __DEV__ demo oturumunda — üretim RPC ile aynı temel formül (yaklaşık). */
export const simulateDemoSessionReward = (input: {
  durationMinutes: number;
  pauseCount: number;
  /** Seri +1 varsayımı ile demo kutlaması */
  streakAfterSession: number;
}) => {
  const baseXp = input.durationMinutes * 2;
  const baseStardust = input.durationMinutes * 10;
  const streakBonus = Math.min(input.streakAfterSession * 0.1, 0.5);
  const pauseBonus = input.pauseCount === 0 ? 0.1 : 0;
  const totalBonus = streakBonus + pauseBonus;
  const stardustEarned = Math.round(baseStardust + baseStardust * totalBonus);
  return { stardustEarned, xpEarned: baseXp, streakCount: input.streakAfterSession };
};

export const createDevDemoPayload = (input: { email: string }): AuthPayload => {
  const now = Date.now();
  const user: User = {
    id: `${DEV_DEMO.tokenPrefix}-user`,
    email: input.email.includes("@") ? input.email : "demo@astrocus.dev",
    username: "demo",
    avatar: "🌙",
    galaxyName: "Astrocus",
    language: "tr",
    totalStardust: 0,
    totalXp: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    targetStarId: STARS[0].id,
    onboardingCompleted: true,
    dailyGoalMinutes: 120,
  };

  return {
    token: `${DEV_DEMO.tokenPrefix}:${now}`,
    user,
    sessions: [],
    unlockedStarIds: [STARS[0].id],
  };
};

export const isDevDemoToken = (token: string | null) => Boolean(token && token.startsWith(`${DEV_DEMO.tokenPrefix}:`));

export const matchesDevDemoCredentials = (input: { email: string; password: string }) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  return DEV_DEMO.emailAliases.includes(email) && password === DEV_DEMO.password;
};
