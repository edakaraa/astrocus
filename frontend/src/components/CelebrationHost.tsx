import React, { useMemo } from "react";
import { BADGES, getBadgeLabel } from "../shared/constants";
import { useAppContext } from "../context/AppContext";
import { CelebrationModal } from "./CelebrationModal";

/** Root-level celebration overlay — stays visible across tab/screen transitions. */
export const CelebrationHost = () => {
  const { celebration, dismissCelebration, language, stars, user, sessionState, dailySummary } =
    useAppContext();

  const unlockedStarLabel = useMemo(() => {
    if (!celebration?.unlockedStarId) {
      return null;
    }
    const star = stars.find((item) => item.id === celebration.unlockedStarId);
    return star?.name ?? null;
  }, [celebration?.unlockedStarId, stars]);

  const newBadgeLabels = useMemo(() => {
    if (!celebration?.newBadgeIds?.length) {
      return undefined;
    }
    return celebration.newBadgeIds
      .map((id) => {
        const badge = BADGES.find((item) => item.id === id);
        return badge ? getBadgeLabel(badge, language).name : id;
      })
      .filter(Boolean);
  }, [celebration?.newBadgeIds, language]);

  const streakForCelebration = celebration?.streakCount ?? user?.currentStreak ?? 0;

  const isFirstSession = celebration?.newBadgeIds?.includes("first_step") ?? false;

  const firstBadge = useMemo(() => {
    if (!isFirstSession) {
      return null;
    }
    const badge = BADGES.find((item) => item.id === "first_step");
    if (!badge) {
      return null;
    }
    const label = getBadgeLabel(badge, language);
    return { id: badge.id, title: label.name, description: label.description };
  }, [isFirstSession, language]);

  return (
    <CelebrationModal
      visible={Boolean(celebration)}
      stardustEarned={celebration?.stardustEarned ?? 0}
      pendingSync={celebration?.pendingSync}
      isFirstSession={isFirstSession}
      unlockedStarLabel={unlockedStarLabel}
      newBadgeLabels={newBadgeLabels}
      firstBadge={firstBadge}
      durationMinutes={celebration?.durationMinutes ?? sessionState.selectedDurationMinutes}
      currentStreak={streakForCelebration}
      todayTotalMinutes={celebration?.todayTotalMinutes ?? dailySummary.totalMinutes}
      onClose={dismissCelebration}
    />
  );
};
