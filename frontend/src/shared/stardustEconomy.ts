/**
 * Single source of truth for stardust earning and unlock economy.
 * Keep in sync with migrations `024_stardust_economy_rebalance.sql`, `025_stardust_tier_soften.sql`,
 * and `026_dynamic_daily_goal_reward.sql`.
 */

/** Base reward for completed focus sessions (✦ per focused minute). */
export const STARDUST_PER_MINUTE = 10;

/** +10% per consecutive focus day; caps at +50% (5+ day streak). */
export const STARDUST_STREAK_BONUS_PER_DAY = 0.1;
export const STARDUST_STREAK_BONUS_MAX = 0.5;

/** +10% when the session completes without using pause. */
export const STARDUST_NO_PAUSE_BONUS = 0.1;

/** Daily goal bonus: 3 ✦ per goal minute, minimum 75 ✦. Keep in sync with `026_dynamic_daily_goal_reward.sql`. */
export const calculateDailyGoalReward = (goalMinutes: number): number =>
  Math.max(75, goalMinutes * 3);

/** Dynamic star pricing tiers (completed constellation count). */
export const STAR_COST_EASY = 500; // 0–3 completed (~50 dk)
export const STAR_COST_MEDIUM = 1500; // 4–8 completed (~2,5 saat)
export const STAR_COST_MASTERY = 2000; // 9+ completed (~3,5 saat; katalog üst bandına yakın)

export const STAR_COST_TIER_THRESHOLDS = {
  medium: 4,
  mastery: 9,
} as const;

export type StarCostTier = "easy" | "medium" | "mastery";

export type StarCostInfo = {
  tier: StarCostTier;
  completedCount: number;
  costPerStar: number;
};

export const getStarCostInfo = (completedCount: number): StarCostInfo => {
  if (completedCount < STAR_COST_TIER_THRESHOLDS.medium) {
    return { tier: "easy", completedCount, costPerStar: STAR_COST_EASY };
  }
  if (completedCount < STAR_COST_TIER_THRESHOLDS.mastery) {
    return { tier: "medium", completedCount, costPerStar: STAR_COST_MEDIUM };
  }
  return { tier: "mastery", completedCount, costPerStar: STAR_COST_MASTERY };
};

/** Percent labels for UI (e.g. 10 → "10%"). */
export const formatBonusPercent = (ratio: number): number => Math.round(ratio * 100);

export const formatStreakBonusPercent = (streakDays: number): number =>
  formatBonusPercent(Math.min(streakDays * STARDUST_STREAK_BONUS_PER_DAY, STARDUST_STREAK_BONUS_MAX));
