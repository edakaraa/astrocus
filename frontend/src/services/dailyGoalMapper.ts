import type { DailyGoalHistoryDay, DailyGoalProgress } from "../shared/types";

type DailyGoalRpc = {
  goal_date?: string;
  goal_minutes?: number;
  focused_minutes?: number;
  completed_sessions?: number;
  goal_met?: boolean;
  reward_claimed?: boolean;
};

export const mapDailyGoalProgress = (raw: unknown): DailyGoalProgress | null => {
  if (!raw || typeof raw !== "object") {
    return null;
  }
  const row = raw as DailyGoalRpc;
  const goalDate = typeof row.goal_date === "string" ? row.goal_date : null;
  if (!goalDate) {
    return null;
  }
  return {
    goalDate,
    goalMinutes: Number(row.goal_minutes ?? 0),
    focusedMinutes: Number(row.focused_minutes ?? 0),
    completedSessions: Number(row.completed_sessions ?? 0),
    goalMet: Boolean(row.goal_met),
    rewardClaimed: Boolean(row.reward_claimed),
  };
};

export const mapDailyGoalHistory = (raw: unknown): DailyGoalHistoryDay[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .map((item) => mapDailyGoalProgress(item))
    .filter((item): item is DailyGoalHistoryDay => item !== null);
};

export type DailyGoalClaimResult = {
  claimed: boolean;
  alreadyClaimed: boolean;
  stardustEarned: number;
  totalStardust: number;
};

export const mapDailyGoalClaim = (raw: unknown): DailyGoalClaimResult => {
  const row = (raw ?? {}) as Record<string, unknown>;
  return {
    claimed: Boolean(row.claimed),
    alreadyClaimed: Boolean(row.already_claimed),
    stardustEarned: Number(row.stardust_earned ?? 0),
    totalStardust: Number(row.total_stardust ?? 0),
  };
};
