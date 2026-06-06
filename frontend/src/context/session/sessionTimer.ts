import { NO_SESSION_DURATION_SELECTED, PAUSE_LIMIT } from "../../shared/constants";
import type { TimerStatus } from "../../shared/types";

/** Immutable snapshot used when persisting a session — avoids stale React closure bugs. */
export type SessionCompletionSnapshot = {
  plannedDurationMinutes: number;
  focusedSeconds: number;
  categoryId: string;
  pauseCount: number;
  startedAt: string;
  /** Wall-clock instant when the snapshot was taken (timer end / cancel). */
  completedAt: string;
  /** True when the countdown reached zero (not early cancel). */
  completedNaturally: boolean;
};

export type FocusTimerState = {
  selectedDurationMinutes: number;
  selectedCategoryId: string;
  status: TimerStatus;
  /** Locked at session start; null while idle. */
  plannedDurationMinutes: number | null;
  remainingSeconds: number;
  focusedSeconds: number;
  pauseCount: number;
  startedAt: string | null;
  /** Wall-clock ms when the current running segment began (null while paused). */
  runningSinceMs: number | null;
  /** Focus seconds fully accumulated before the current running segment. */
  accumulatedFocusSeconds: number;
};

export const createIdleFocusTimerState = (
  selectedDurationMinutes = NO_SESSION_DURATION_SELECTED,
  selectedCategoryId = "general",
): FocusTimerState => ({
  selectedDurationMinutes,
  selectedCategoryId,
  status: "idle",
  plannedDurationMinutes: null,
  remainingSeconds: selectedDurationMinutes * 60,
  focusedSeconds: 0,
  pauseCount: 0,
  startedAt: null,
  runningSinceMs: null,
  accumulatedFocusSeconds: 0,
});

const plannedSecondsOf = (state: FocusTimerState): number =>
  Math.max(0, (state.plannedDurationMinutes ?? state.selectedDurationMinutes) * 60);

/** Derive focused + remaining from wall-clock segments (heartbeat source of truth). */
export const syncFocusTimer = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  if (state.plannedDurationMinutes === null) {
    return {
      ...state,
      remainingSeconds: state.selectedDurationMinutes * 60,
      focusedSeconds: 0,
    };
  }

  if (state.status === "idle" || state.status === "failed") {
    return state;
  }

  const plannedSeconds = plannedSecondsOf(state);
  let focusedSeconds = Math.min(plannedSeconds, state.accumulatedFocusSeconds);

  if (state.status === "running" && state.runningSinceMs !== null) {
    const segmentSeconds = Math.max(0, Math.floor((nowMs - state.runningSinceMs) / 1000));
    focusedSeconds = Math.min(plannedSeconds, state.accumulatedFocusSeconds + segmentSeconds);
  }

  return {
    ...state,
    focusedSeconds,
    remainingSeconds: Math.max(0, plannedSeconds - focusedSeconds),
  };
};

export const completeFocusTimer = (state: FocusTimerState): FocusTimerState => {
  const plannedSeconds = plannedSecondsOf(state);
  return {
    ...state,
    status: "completed",
    remainingSeconds: 0,
    focusedSeconds: plannedSeconds,
    accumulatedFocusSeconds: plannedSeconds,
    runningSinceMs: null,
  };
};

/** Heartbeat tick — safe to call every second; uses wall clock, not interval drift. */
export const heartbeatTick = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  if (state.status !== "running") {
    return state;
  }

  const synced = syncFocusTimer(state, nowMs);
  if (synced.remainingSeconds <= 0) {
    return completeFocusTimer(synced);
  }

  return synced;
};

export const startFocusSession = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  if (state.selectedDurationMinutes <= 0) {
    return state;
  }

  const plannedDurationMinutes = state.selectedDurationMinutes;
  const plannedSeconds = plannedDurationMinutes * 60;

  return {
    ...state,
    status: "running",
    plannedDurationMinutes,
    remainingSeconds: plannedSeconds,
    focusedSeconds: 0,
    accumulatedFocusSeconds: 0,
    runningSinceMs: nowMs,
    pauseCount: 0,
    startedAt: new Date(nowMs).toISOString(),
  };
};

export const pauseFocusSession = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  if (state.status !== "running" || state.pauseCount >= PAUSE_LIMIT) {
    return state;
  }

  const synced = syncFocusTimer(state, nowMs);
  return {
    ...synced,
    status: "paused",
    runningSinceMs: null,
    accumulatedFocusSeconds: synced.focusedSeconds,
    pauseCount: synced.pauseCount + 1,
  };
};

export const resumeFocusSession = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  if (state.status !== "paused") {
    return state;
  }

  return {
    ...state,
    status: "running",
    runningSinceMs: nowMs,
  };
};

export const failFocusSession = (state: FocusTimerState): FocusTimerState => ({
  ...state,
  status: "failed",
  remainingSeconds: 0,
  runningSinceMs: null,
});

export const buildCompletionSnapshot = (
  state: FocusTimerState,
  nowMs = Date.now(),
  completedNaturally = false,
): SessionCompletionSnapshot | null => {
  if (!state.startedAt || state.plannedDurationMinutes === null) {
    return null;
  }

  const synced =
    state.status === "completed" ? state : syncFocusTimer(state, nowMs);

  return {
    plannedDurationMinutes: state.plannedDurationMinutes,
    focusedSeconds: synced.focusedSeconds,
    categoryId: state.selectedCategoryId,
    pauseCount: state.pauseCount,
    startedAt: state.startedAt,
    completedAt: new Date(nowMs).toISOString(),
    completedNaturally,
  };
};

/** Active focus minutes to persist — never above the planned session length. */
export const snapshotFocusedMinutes = (snapshot: SessionCompletionSnapshot): number => {
  if (snapshot.completedNaturally) {
    return snapshot.plannedDurationMinutes;
  }

  const focusedMinutes = Math.floor(Math.max(0, snapshot.focusedSeconds) / 60);
  return Math.min(snapshot.plannedDurationMinutes, Math.max(0, focusedMinutes));
};
