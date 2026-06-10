/**
 * Session timer elapsed time via performance.now() delta.
 * Immune to mid-session manual clock / timezone changes (rare edge case).
 * ISO timestamps (startedAt / completedAt) still use real wall clock where needed.
 */
type MonotonicAnchor = {
  wallAnchorMs: number;
  perfAnchorMs: number;
};

let sessionAnchor: MonotonicAnchor | null = null;

export const bindSessionMonotonicAnchor = (wallMs: number): void => {
  sessionAnchor = {
    wallAnchorMs: wallMs,
    perfAnchorMs: performance.now(),
  };
};

export const clearSessionMonotonicAnchor = (): void => {
  sessionAnchor = null;
};

/** Monotonic wall-ms for focus timer math; falls back to Date.now() outside a session. */
export const sessionMonotonicNowMs = (): number => {
  if (sessionAnchor === null) {
    return Date.now();
  }
  return sessionAnchor.wallAnchorMs + (performance.now() - sessionAnchor.perfAnchorMs);
};
