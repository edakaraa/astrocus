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

  return (
    <CelebrationModal
      visible={Boolean(celebration)}
      stardustEarned={celebration?.stardustEarned ?? 0}
      pendingSync={celebration?.pendingSync}
      unlockedStarLabel={unlockedStarLabel}
      newBadgeLabels={newBadgeLabels}
      galacticAdvice={celebration?.galacticAdvice}
      durationMinutes={celebration?.durationMinutes ?? sessionState.selectedDurationMinutes}
      currentStreak={streakForCelebration}
      todayTotalMinutes={celebration?.todayTotalMinutes ?? dailySummary.totalMinutes}
      onClose={dismissCelebration}
    />
  );
};
