import { STORAGE_KEYS } from "../constants/storageKeys";
import { isDevDemoToken } from "../context/auth/devDemo";
import { getDateKey } from "../context/session/dateKey";
import { api } from "../shared/api";
import { asyncStorage } from "../shared/storage";
import type { DailyGoalProgress } from "../shared/types";
import { getDeviceTimeZone } from "../shared/timezone";
import theme from "../theme";

/** One full day — shared cap for picker, clamp, and server validation. */
export const DAILY_GOAL_MAX_MINUTES = theme.layout.goalSheetMaxMinutes;

export const clampDailyGoalMinutes = (minutes: number): number =>
  Math.min(DAILY_GOAL_MAX_MINUTES, Math.max(theme.layout.goalSheetMinMinutes, minutes));

export const roundDailyGoalMinutes = (minutes: number): number =>
  clampDailyGoalMinutes(Math.round(minutes / theme.layout.goalSheetStep) * theme.layout.goalSheetStep);

export type TodayDailyGoalState = {
  todayMinutes: number;
  pickerDefaultMinutes: number;
  progress: DailyGoalProgress | null;
};

/** Today's confirmed goal minutes (0 if user has not picked a goal today). */
export const loadTodayDailyGoal = async (
  profileFallbackMinutes: number,
  token: string | null,
): Promise<TodayDailyGoalState> => {
  const pickerFallback =
    profileFallbackMinutes > 0 ? profileFallbackMinutes : theme.layout.goalSheetDefaultMinutes;

  if (token && !isDevDemoToken(token)) {
    try {
      const progress = await api.fetchDailyGoalProgress(getDeviceTimeZone());
      const todayMinutes = progress.goalMinutes > 0 ? progress.goalMinutes : 0;
      return {
        todayMinutes,
        pickerDefaultMinutes: todayMinutes > 0 ? todayMinutes : pickerFallback,
        progress,
      };
    } catch {
      // Fall through to local cache if migration/RPC not deployed yet.
    }
  }

  const todayKey = getDateKey(new Date().toISOString());
  const chosenDate = await asyncStorage.get(STORAGE_KEYS.dailyGoalChosenDate, "");
  const lastMinutes = await asyncStorage.get(STORAGE_KEYS.dailyGoalMinutes, profileFallbackMinutes);
  const pickerDefaultMinutes = lastMinutes > 0 ? lastMinutes : theme.layout.goalSheetDefaultMinutes;
  const todayMinutes = chosenDate === todayKey && lastMinutes > 0 ? lastMinutes : 0;

  return {
    todayMinutes,
    pickerDefaultMinutes,
    progress: null,
  };
};

export const saveTodayDailyGoal = async (
  minutes: number,
  token: string | null,
): Promise<number> => {
  const rounded = roundDailyGoalMinutes(minutes);
  const timezone = getDeviceTimeZone();

  if (token && !isDevDemoToken(token)) {
    try {
      await api.confirmDailyGoal(rounded, timezone);
      return rounded;
    } catch {
      // Fall through to local persistence.
    }
  }

  const todayKey = getDateKey(new Date().toISOString());
  await asyncStorage.set(STORAGE_KEYS.dailyGoalMinutes, rounded);
  await asyncStorage.set(STORAGE_KEYS.dailyGoalChosenDate, todayKey);
  return rounded;
};
