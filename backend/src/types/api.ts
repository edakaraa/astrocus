export type AnalyticsSummary = {
  totalFocusMinutes: number;
  weekFocusMinutes: number[];
  categoryDistribution: Array<{ categoryId: string; minutes: number; percentage: number }>;
  streakCount: number;
  longestStreak: number;
  totalStardust: number;
};

export type DailyGoalHistoryDay = {
  goalDate: string;
  goalMinutes: number;
  focusedMinutes: number;
  completedSessions: number;
  goalMet: boolean;
  rewardClaimed: boolean;
};

export type UnlockStarResult = {
  starId: string;
  cost: number;
  totalStardust: number;
  targetStarId: string;
  constellationCompleted: boolean;
  newBadgeId: string | null;
  nextConstellationId: string | null;
};
