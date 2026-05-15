export type AnalyticsSummary = {
  totalFocusMinutes: number;
  weekFocusMinutes: number[];
  categoryDistribution: Array<{ categoryId: string; minutes: number; percentage: number }>;
  streakCount: number;
  longestStreak: number;
  level: number;
  totalXp: number;
  totalStardust: number;
};

export type UnlockStarResult = {
  starId: string;
  cost: number;
  totalStardust: number;
  targetStarId: string;
};

export type CompleteFocusSessionResult = {
  sessionId: string;
  xpEarned: number;
  stardustEarned: number;
  streakCount: number;
  longestStreak: number;
  level: number;
  totalXp: number;
  totalStardust: number;
  newBadges: string[];
};

export type ApiErrorBody = {
  error: string;
  code?: string;
};
