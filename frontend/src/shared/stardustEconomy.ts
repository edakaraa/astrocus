/**
 * Single source of truth for stardust earning and unlock economy.
 * Keep in sync with migrations `024_stardust_economy_rebalance.sql`, `026_dynamic_daily_goal_reward.sql`,
 * and `027_constellation_journey_star_cost.sql`.
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

/** Star pricing tiers by constellation journey position (unlock_order). */
export const STAR_COST_EASY = 500; // unlock_order 0–3 (first 4 constellations)
export const STAR_COST_MEDIUM = 1200; // unlock_order 4–7 (next 4)
export const STAR_COST_MASTERY = 2000; // unlock_order 8+ (remaining)

export const STAR_COST_TIER_THRESHOLDS = {
  medium: 4,
  mastery: 8,
} as const;

export type StarCostTier = "easy" | "medium" | "mastery";

export type StarCostInfo = {
  tier: StarCostTier;
  unlockOrder: number;
  costPerStar: number;
};

export const getStarCostForUnlockOrder = (unlockOrder: number): StarCostInfo => {
  if (unlockOrder < STAR_COST_TIER_THRESHOLDS.medium) {
    return { tier: "easy", unlockOrder, costPerStar: STAR_COST_EASY };
  }
  if (unlockOrder < STAR_COST_TIER_THRESHOLDS.mastery) {
    return { tier: "medium", unlockOrder, costPerStar: STAR_COST_MEDIUM };
  }
  return { tier: "mastery", unlockOrder, costPerStar: STAR_COST_MASTERY };
};

/** @deprecated Use getStarCostForUnlockOrder — kept for existing imports. */
export const getStarCostInfo = getStarCostForUnlockOrder;

/** Percent labels for UI (e.g. 10 → "10%"). */
export const formatBonusPercent = (ratio: number): number => Math.round(ratio * 100);

export const formatStreakBonusPercent = (streakDays: number): number =>
  formatBonusPercent(Math.min(streakDays * STARDUST_STREAK_BONUS_PER_DAY, STARDUST_STREAK_BONUS_MAX));
