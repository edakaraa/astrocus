import { NO_SESSION_DURATION_SELECTED, PAUSE_LIMIT } from "../../shared/constants";
import type { TimerStatus } from "../../shared/types";

/** Immutable snapshot used when persisting a session — avoids stale React closure bugs. */
export type SessionCompletionSnapshot = {
  plannedDurationMinutes: number;
  focusedSeconds: number;
  categoryId: string;
  pauseCount: number;
  startedAt: string;
  /** Wall-clock instant when active focus ended (not late unlock / sync time). */
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
  /** Wall-clock ms when the current running segment began (null while paused or frozen). */
  runningSinceMs: number | null;
  /** Focus seconds fully accumulated before the current running segment. */
  accumulatedFocusSeconds: number;
  /** Set when status becomes completed — exact wall-clock focus end. */
  focusEndedAtMs: number | null;
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
  focusEndedAtMs: null,
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

/**
 * Consolidate elapsed focus into accumulatedFocusSeconds and reset the running anchor.
 * Call after every sync/tick so multiple code paths cannot double-count wall time.
 */
export const materializeFocusTimer = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  const synced = syncFocusTimer(state, nowMs);

  if (synced.status !== "running" || synced.runningSinceMs === null) {
    return synced;
  }

  return {
    ...synced,
    accumulatedFocusSeconds: synced.focusedSeconds,
    runningSinceMs: nowMs,
  };
};

/** Wall-clock instant when the active focus segment actually reached the planned duration. */
export const computeFocusEndedAtMs = (state: FocusTimerState, nowMs = Date.now()): number => {
  const plannedSeconds = plannedSecondsOf(state);
  const synced = syncFocusTimer(state, nowMs);

  if (plannedSeconds <= 0 || synced.focusedSeconds < plannedSeconds) {
    return nowMs;
  }

  const secondsIntoSegment = plannedSeconds - state.accumulatedFocusSeconds;
  if (state.runningSinceMs !== null && secondsIntoSegment > 0) {
    return state.runningSinceMs + secondsIntoSegment * 1000;
  }

  if (state.startedAt) {
    return new Date(state.startedAt).getTime() + plannedSeconds * 1000;
  }

  return nowMs;
};

export const completeFocusTimer = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  const plannedSeconds = plannedSecondsOf(state);
  const focusEndedAtMs = computeFocusEndedAtMs(state, nowMs);

  return {
    ...state,
    status: "completed",
    remainingSeconds: 0,
    focusedSeconds: plannedSeconds,
    accumulatedFocusSeconds: plannedSeconds,
    runningSinceMs: null,
    focusEndedAtMs,
  };
};

/** Heartbeat tick — wall clock with per-tick materialization (no interval drift or double count). */
export const heartbeatTick = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  if (state.status !== "running") {
    return state;
  }

  const synced = syncFocusTimer(state, nowMs);
  if (synced.remainingSeconds <= 0) {
    return completeFocusTimer(synced, nowMs);
  }

  return materializeFocusTimer(synced, nowMs);
};

/**
 * Freeze the wall clock while the app is away (not screen lock).
 * Status stays "running" but background seconds do not count toward focus.
 */
/** Running segment paused for app-switch away (not user pause). */
export const isFocusTimerFrozenForAway = (state: FocusTimerState): boolean =>
  state.status === "running" && state.runningSinceMs === null;

export const freezeFocusTimer = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  if (state.status !== "running") {
    return state;
  }

  const synced = syncFocusTimer(state, nowMs);
  if (isFocusTimerFrozenForAway(synced)) {
    return synced;
  }

  return {
    ...synced,
    runningSinceMs: null,
    accumulatedFocusSeconds: synced.focusedSeconds,
  };
};

/** Resume wall clock after returning from app-switch away (not pause). */
export const unfreezeFocusTimer = (state: FocusTimerState, nowMs = Date.now()): FocusTimerState => {
  if (state.status !== "running" || !isFocusTimerFrozenForAway(state)) {
    return state;
  }

  return {
    ...state,
    runningSinceMs: nowMs,
  };
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
    focusEndedAtMs: null,
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

  const synced = syncFocusTimer(state, nowMs);
  return {
    ...synced,
    status: "running",
    runningSinceMs: nowMs,
    accumulatedFocusSeconds: synced.focusedSeconds,
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

  const synced = state.status === "completed" ? state : syncFocusTimer(state, nowMs);
  const endedAtMs = state.focusEndedAtMs ?? nowMs;

  return {
    plannedDurationMinutes: state.plannedDurationMinutes,
    focusedSeconds: synced.focusedSeconds,
    categoryId: state.selectedCategoryId,
    pauseCount: state.pauseCount,
    startedAt: state.startedAt,
    completedAt: new Date(endedAtMs).toISOString(),
    completedNaturally,
  };
};

/** Active focus minutes to persist — never above the planned session length. */
export const snapshotFocusedMinutes = (snapshot: SessionCompletionSnapshot): number => {
  const focusedMinutes = Math.floor(Math.max(0, snapshot.focusedSeconds) / 60);
  return Math.min(snapshot.plannedDurationMinutes, Math.max(0, focusedMinutes));
};
