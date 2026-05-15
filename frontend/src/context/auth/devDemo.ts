// [GÖREV 3] — app-context altından auth modülüne taşındı (demo oturum yardımcıları)

import { AuthPayload, User } from "../../shared/types";
import { STARS } from "../../shared/constants";

export const DEV_DEMO = {
  tokenPrefix: "dev-demo",
  emailAliases: ["demo", "demo@astrocus.dev"] as string[],
  password: "demo1234",
} as const;

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
