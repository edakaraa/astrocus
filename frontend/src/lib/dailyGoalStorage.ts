import NetInfo from "@react-native-community/netinfo";
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

/** Parse manual goal input; accepts comma or dot decimals. */
export const parseDailyGoalInput = (raw: string): number | null => {
  const trimmed = raw.trim().replace(",", ".");
  if (!trimmed) {
    return null;
  }
  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
};

/** Clamp to allowed range; round fractional minutes to the nearest whole minute for storage. */
export const normalizeDailyGoalMinutes = (minutes: number): number =>
  clampDailyGoalMinutes(Math.round(minutes));

export type TodayDailyGoalState = {
  todayMinutes: number;
  pickerDefaultMinutes: number;
  progress: DailyGoalProgress | null;
};

type CachedDailyGoalProgress = {
  dateKey: string;
  progress: DailyGoalProgress;
};

const readCachedDailyGoalProgress = async (
  todayKey: string,
): Promise<DailyGoalProgress | null> => {
  const cached = await asyncStorage.get<CachedDailyGoalProgress | null>(
    STORAGE_KEYS.dailyGoalProgressCache,
    null,
  );
  if (!cached || cached.dateKey !== todayKey) {
    return null;
  }
  return cached.progress;
};

const readLocalChosenGoal = async (
  todayKey: string,
  profileFallbackMinutes: number,
): Promise<{ todayMinutes: number; pickerDefaultMinutes: number }> => {
  const chosenDate = await asyncStorage.get(STORAGE_KEYS.dailyGoalChosenDate, "");
  const lastMinutes = await asyncStorage.get(STORAGE_KEYS.dailyGoalMinutes, profileFallbackMinutes);
  const pickerDefaultMinutes = lastMinutes > 0 ? lastMinutes : theme.layout.goalSheetDefaultMinutes;
  const todayMinutes = chosenDate === todayKey && lastMinutes > 0 ? lastMinutes : 0;
  return { todayMinutes, pickerDefaultMinutes };
};

export const persistLocalDailyGoal = async (
  goalMinutes: number,
  progress?: DailyGoalProgress | null,
): Promise<void> => {
  const todayKey = getDateKey(new Date().toISOString());
  const rounded = normalizeDailyGoalMinutes(goalMinutes);
  await asyncStorage.set(STORAGE_KEYS.dailyGoalMinutes, rounded);
  await asyncStorage.set(STORAGE_KEYS.dailyGoalChosenDate, todayKey);

  const cachedProgress: DailyGoalProgress =
    progress ??
    ({
      goalDate: todayKey,
      goalMinutes: rounded,
      focusedMinutes: 0,
      completedSessions: 0,
      goalMet: false,
      rewardClaimed: false,
    } satisfies DailyGoalProgress);

  await asyncStorage.set(STORAGE_KEYS.dailyGoalProgressCache, {
    dateKey: todayKey,
    progress: { ...cachedProgress, goalMinutes: rounded, goalDate: todayKey },
  });
};

const loadFromLocalCaches = async (
  todayKey: string,
  profileFallbackMinutes: number,
  pickerFallback: number,
): Promise<TodayDailyGoalState | null> => {
  const cachedProgress = await readCachedDailyGoalProgress(todayKey);
  if (cachedProgress && cachedProgress.goalMinutes > 0) {
    return {
      todayMinutes: cachedProgress.goalMinutes,
      pickerDefaultMinutes: cachedProgress.goalMinutes,
      progress: cachedProgress,
    };
  }

  const local = await readLocalChosenGoal(todayKey, profileFallbackMinutes);
  if (local.todayMinutes > 0) {
    return {
      todayMinutes: local.todayMinutes,
      pickerDefaultMinutes: local.pickerDefaultMinutes,
      progress: {
        goalDate: todayKey,
        goalMinutes: local.todayMinutes,
        focusedMinutes: 0,
        completedSessions: 0,
        goalMet: false,
        rewardClaimed: false,
      },
    };
  }

  if (profileFallbackMinutes > 0) {
    return null;
  }

  return {
    todayMinutes: 0,
    pickerDefaultMinutes: pickerFallback,
    progress: null,
  };
};

/** Today's confirmed goal minutes (0 if user has not picked a goal today). */
export const loadTodayDailyGoal = async (
  profileFallbackMinutes: number,
  token: string | null,
): Promise<TodayDailyGoalState> => {
  const pickerFallback =
    profileFallbackMinutes > 0 ? profileFallbackMinutes : theme.layout.goalSheetDefaultMinutes;
  const todayKey = getDateKey(new Date().toISOString());
  const net = await NetInfo.fetch();
  const offline = !net.isConnected || net.isInternetReachable === false;

  if (offline || !token || isDevDemoToken(token)) {
    const local = await loadFromLocalCaches(todayKey, profileFallbackMinutes, pickerFallback);
    if (local) {
      return local;
    }
    return {
      todayMinutes: 0,
      pickerDefaultMinutes: pickerFallback,
      progress: null,
    };
  }

  try {
    const progress = await api.fetchDailyGoalProgress(getDeviceTimeZone());
    const todayMinutes = progress.goalMinutes > 0 ? progress.goalMinutes : 0;
    if (todayMinutes > 0) {
      await persistLocalDailyGoal(todayMinutes, progress);
    } else {
      await asyncStorage.set(STORAGE_KEYS.dailyGoalProgressCache, { dateKey: todayKey, progress });
    }
    return {
      todayMinutes,
      pickerDefaultMinutes: todayMinutes > 0 ? todayMinutes : pickerFallback,
      progress,
    };
  } catch {
    const local = await loadFromLocalCaches(todayKey, profileFallbackMinutes, pickerFallback);
    if (local) {
      return local;
    }
  }

  return {
    todayMinutes: 0,
    pickerDefaultMinutes: pickerFallback,
    progress: null,
  };
};

export const saveTodayDailyGoal = async (
  minutes: number,
  token: string | null,
): Promise<number> => {
  const rounded = normalizeDailyGoalMinutes(minutes);
  const timezone = getDeviceTimeZone();

  if (token && !isDevDemoToken(token)) {
    try {
      await api.confirmDailyGoal(rounded, timezone);
      try {
        const progress = await api.fetchDailyGoalProgress(timezone);
        await persistLocalDailyGoal(rounded, progress);
        return rounded;
      } catch {
        await persistLocalDailyGoal(rounded);
        return rounded;
      }
    } catch {
      // Fall through to local persistence when offline or RPC unavailable.
    }
  }

  await persistLocalDailyGoal(rounded);
  return rounded;
};
