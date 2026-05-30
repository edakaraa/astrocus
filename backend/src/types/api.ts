export type AnalyticsSummary = {
  totalFocusMinutes: number;
  weekFocusMinutes: number[];
  categoryDistribution: Array<{ categoryId: string; minutes: number; percentage: number }>;
  streakCount: number;
  longestStreak: number;
  totalStardust: number;
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
