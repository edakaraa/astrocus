import type { PendingSession, SessionRecord } from "../../shared/types";

export const pendingToSessionRecord = (
  pending: PendingSession,
  userId: string,
): SessionRecord => ({
  id: pending.id,
  userId,
  categoryId: pending.categoryId,
  durationMinutes: pending.durationMinutes,
  stardustEarned: 0,
  pauseUsed: (pending.pauseCount ?? 0) > 0,
  startedAt: pending.startedAt,
  completedAt: pending.completedAt,
  isOffline: true,
});

/** Merges unsynced queue items into session list for local UI (daily goal, categories). */
export const mergeSessionsWithPending = (
  sessions: SessionRecord[],
  pending: PendingSession[],
  userId: string,
): SessionRecord[] => {
  if (pending.length === 0) {
    return sessions;
  }
  const syncedIds = new Set(sessions.map((session) => session.id));
  const optimistic = pending
    .filter((item) => !syncedIds.has(item.id))
    .map((item) => pendingToSessionRecord(item, userId));
  return optimistic.length > 0 ? [...sessions, ...optimistic] : sessions;
};
