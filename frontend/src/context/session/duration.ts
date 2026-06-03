/**
 * Active focus time from the countdown timer (not wall-clock session span).
 * Pauses and background gaps that do not consume remaining time are excluded.
 */
export const computeFocusedSeconds = (
  plannedDurationMinutes: number,
  remainingSeconds: number,
): number => {
  const plannedSeconds = Math.max(0, plannedDurationMinutes) * 60;
  const remaining = Math.max(0, Math.min(remainingSeconds, plannedSeconds));
  return Math.max(0, plannedSeconds - remaining);
};

export const computeFocusedDurationMinutes = (
  plannedDurationMinutes: number,
  remainingSeconds: number,
): number => Math.floor(computeFocusedSeconds(plannedDurationMinutes, remainingSeconds) / 60);

export const focusedSecondsToDurationMinutes = (focusedSeconds: number): number =>
  Math.floor(Math.max(0, focusedSeconds) / 60);

/** Anti-cheat: active focus cannot exceed wall-clock elapsed time. */
export const isFocusedDurationPlausible = (
  focusedMinutes: number,
  startedAt: string,
  endedAt: string,
): boolean => {
  const wallSeconds = Math.max(
    0,
    Math.floor((new Date(endedAt).getTime() - new Date(startedAt).getTime()) / 1000),
  );
  const wallMinutes = wallSeconds / 60;
  if (focusedMinutes < 1) {
    return false;
  }
  return wallMinutes + 0.01 >= focusedMinutes * 0.9;
};
