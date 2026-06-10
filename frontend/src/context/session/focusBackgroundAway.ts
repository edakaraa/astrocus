import {
  BACKGROUND_TOLERANCE_SECONDS,
  WARNING_THRESHOLD_SECONDS,
} from "../../shared/constants";

export type AwayTimeoutHandles = {
  warningTimeoutId: ReturnType<typeof setTimeout> | null;
  failTimeoutId: ReturnType<typeof setTimeout> | null;
};

export type AwayTimeoutCallbacks = {
  onWarning: () => void;
  onFail: () => void;
};

export const scheduleFocusBackgroundAwayTimeouts = (
  callbacks: AwayTimeoutCallbacks,
  schedule: typeof setTimeout = setTimeout,
): AwayTimeoutHandles => ({
  warningTimeoutId: schedule(callbacks.onWarning, WARNING_THRESHOLD_SECONDS * 1000),
  failTimeoutId: schedule(callbacks.onFail, BACKGROUND_TOLERANCE_SECONDS * 1000),
});

export const clearFocusBackgroundAwayTimeouts = (
  handles: Pick<AwayTimeoutHandles, "warningTimeoutId" | "failTimeoutId">,
  clear: typeof clearTimeout = clearTimeout,
): void => {
  if (handles.warningTimeoutId !== null) {
    clear(handles.warningTimeoutId);
  }
  if (handles.failTimeoutId !== null) {
    clear(handles.failTimeoutId);
  }
};

export const shouldResumeAwaySession = (elapsedSeconds: number): boolean =>
  elapsedSeconds < BACKGROUND_TOLERANCE_SECONDS;

export const shouldHaveFiredAwayWarning = (elapsedSeconds: number): boolean =>
  elapsedSeconds >= WARNING_THRESHOLD_SECONDS;
