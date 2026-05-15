export type Language = "tr" | "en";
export type AuthMode = "login" | "register";

export type Category = {
  id: string;
  key: string;
  emoji: string;
};

export type Star = {
  id: string;
  name: string;
  description: string;
  requiredStardust: number;
};

export type User = {
  id: string;
  email: string;
  username: string;
  avatar: string;
  galaxyName: string;
  language: Language;
  totalStardust: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  targetStarId: string;
  onboardingCompleted: boolean;
  dailyGoalMinutes: number;
};

export type SessionRecord = {
  id: string;
  userId: string;
  categoryId: string;
  durationMinutes: number;
  stardustEarned: number;
  startedAt: string;
  completedAt: string;
  isOffline: boolean;
};

export type PendingSession = {
  id: string;
  categoryId: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
};

export type SessionReward = {
  stardustEarned: number;
  unlockedStarId: string | null;
  currentStreak: number;
  longestStreak: number;
};

export type DailySummary = {
  totalMinutes: number;
  completedSessions: number;
  goalProgress: number;
  categoryBreakdown: Array<{ categoryId: string; minutes: number }>;
};

export type AuthPayload = {
  token: string;
  user: User;
  sessions: SessionRecord[];
  unlockedStarIds: string[];
};

export type TimerStatus = "idle" | "running" | "paused" | "completed" | "failed";
