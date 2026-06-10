import type { Language } from "../../shared/types";
import type { SessionCompletionSnapshot } from "./sessionTimer";
import { snapshotFocusedMinutes } from "./sessionTimer";

export const buildFocusSessionCelebrationBody = (
  durationMinutes: number,
  stardustEarned: number,
  language: Language = "tr",
): string =>
  language === "en"
    ? `You focused for ${durationMinutes} min and earned ${stardustEarned} ✦`
    : `${durationMinutes} dk odaklandın, ${stardustEarned} ✦ kazandın`;

export type FocusSessionNotificationDeps = {
  stopFocusSessionNotification: () => Promise<void>;
  cancelFocusSessionCompletedNotification: () => Promise<void>;
  presentFocusSessionCompletedNotification: (input: {
    durationMinutes: number;
    stardustEarned: number;
    language: Language;
  }) => Promise<void>;
  clearOngoingNotificationInterval: () => void;
};

/**
 * Stop ongoing FGS / fallback notification and show immediate celebration banner.
 * Idempotent per session via caller-owned guard ref.
 */
export const onFocusSessionTimerCompleted = async (
  snapshot: SessionCompletionSnapshot,
  language: Language,
  stardustEarned: number,
  deps: FocusSessionNotificationDeps,
): Promise<void> => {
  deps.clearOngoingNotificationInterval();
  await deps.stopFocusSessionNotification();
  await deps.cancelFocusSessionCompletedNotification();

  const durationMinutes = snapshotFocusedMinutes(snapshot);
  if (durationMinutes < 1) {
    return;
  }

  await deps.presentFocusSessionCompletedNotification({
    durationMinutes,
    stardustEarned,
    language,
  });
};
