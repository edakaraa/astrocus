import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Animated, StyleSheet, View } from "react-native";
import * as Haptics from "expo-haptics";
import { toastTone, useAppContext } from "../context/AppContext";
import { loadSkyCatalog, getSkyCatalogOrNull } from "../services/skyCatalog";
import { screenBlock, spacing } from "../shared/theme";
import { CosmicScreenBackground } from "../components/CosmicScreenBackground";
import { GALAXY_BACKDROP_COLOR } from "../components/GalaxyBackground";
import { SurfaceCard } from "../components/SurfaceCard";
import { TabScreenScaffold } from "../components/layout/TabScreenScaffold";
import {
  ConstellationFilterBar,
  SkySection,
  galaxyCardStyles,
} from "../components/galaxy";
import { AppText } from "../components/ui/AppText";
import {
  buildConstellationProgressList,
  groupConstellationsForSky,
  sortConstellationsForUser,
  starDisplayName,
  starUnlockCost,
} from "../services/constellationCatalog";
import { formatNumber } from "../shared/formatLocale";
import { t } from "../shared/i18n";
import type { ConstellationProgress, StarWithProgress } from "../shared/types";
import theme from "../theme";

export const GalaxyScreen = () => {
  const { user, unlockedStarIds, constellationProgress, unlockStar, language, showToast } = useAppContext();
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");
  const [catalogReady, setCatalogReady] = useState(Boolean(getSkyCatalogOrNull()));
  const [unlocking, setUnlocking] = useState<string | null>(null);

  useEffect(() => {
    if (getSkyCatalogOrNull()) {
      setCatalogReady(true);
      return;
    }
    void loadSkyCatalog()
      .then(() => setCatalogReady(true))
      .catch(() => setCatalogReady(false));
  }, []);

  const skyCatalog = getSkyCatalogOrNull();
  const totalStardust = user?.totalStardust ?? 0;
  const activeConstellationId = user?.activeConstellationId ?? null;

  const completedCount = useMemo(
    () => constellationProgress.filter((p) => p.completedAt !== null).length,
    [constellationProgress],
  );

  const baseProgress = useMemo(() => {
    if (!skyCatalog) {
      return [];
    }
    return buildConstellationProgressList(
      skyCatalog,
      unlockedStarIds,
      constellationProgress,
      activeConstellationId,
    );
  }, [skyCatalog, unlockedStarIds, constellationProgress, activeConstellationId]);

  const sortedProgress = useMemo(
    () => sortConstellationsForUser(baseProgress, activeConstellationId, constellationProgress),
    [baseProgress, activeConstellationId, constellationProgress],
  );

  const skySections = useMemo(() => groupConstellationsForSky(sortedProgress), [sortedProgress]);

  const filteredSections = useMemo(() => {
    if (filter === "active") {
      const journeyItems = sortedProgress.filter((p) => p.isActive || p.isNext || p.isStarter);
      return {
        completed: [],
        journey: groupConstellationsForSky(
          [...sortedProgress.filter((p) => p.isCompleted), ...journeyItems],
        ).journey,
      };
    }
    if (filter === "completed") {
      return { completed: sortedProgress.filter((p) => p.isCompleted), journey: [] };
    }
    return skySections;
  }, [filter, skySections, sortedProgress]);

  const overallStars = skyCatalog?.constellationStars.length ?? 0;
  const constellationCount = skyCatalog?.constellations.length ?? 13;
  const constellationStarIds = useMemo(
    () => new Set(skyCatalog?.constellationStars.map((s) => s.id) ?? []),
    [skyCatalog],
  );
  const overallUnlocked = useMemo(
    () => unlockedStarIds.filter((id) => constellationStarIds.has(id)).length,
    [unlockedStarIds, constellationStarIds],
  );

  const handleStarPress = useCallback(
    async (star: StarWithProgress, constellation: ConstellationProgress) => {
      if (star.isUnlocked) return;
      if (unlocking) return;

      if (constellation.isLocked) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast({
          title: t(language, "toastLocked"),
          subtitle: t(language, "toastLockedSub"),
          ...toastTone.star,
        });
        return;
      }

      if (!constellation.isActive) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast({
          title: t(language, "toastWrongConstellation"),
          subtitle: t(language, "toastWrongConstellationSub"),
          ...toastTone.star,
        });
        return;
      }

      const nextIndex = constellation.stars.findIndex((s) => !s.isUnlocked);
      if (constellation.stars[nextIndex]?.id !== star.id) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        showToast({
          title: t(language, "toastSequenceRequired"),
          subtitle: t(language, "toastSequenceRequiredSub"),
          ...toastTone.star,
        });
        return;
      }

      const starCost = starUnlockCost(star);
      if (totalStardust < starCost) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const need = starCost - totalStardust;
        showToast({
          title: t(language, "toastInsufficient"),
          subtitle: `${formatNumber(language, need)} ✦ ${t(language, "toastInsufficientSub")}`,
          ...toastTone.warning,
        });
        return;
      }

      setUnlocking(star.id);
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        const result = await unlockStar(star.id);

        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        if (result?.constellationCompleted) {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          showToast({
            title: `${constellation.constellation.nameAstronomical} ${t(language, "constellationComplete")}`,
            subtitle: t(language, "toastConstellationDone"),
            ...toastTone.trophy,
          });
        } else {
          showToast({
            title: `${starDisplayName(star, language)} ${t(language, "toastStarUnlocked")}`,
            subtitle: `${formatNumber(language, starUnlockCost(star))} ${t(language, "toastStardustSpent")}`,
            ...toastTone.star,
          });
        }
      } catch (error) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        const msg = error instanceof Error ? error.message : t(language, "toastUnlockFailed");
        showToast({
          title: t(language, "toastError"),
          subtitle: msg,
          ...toastTone.error,
        });
      } finally {
        setUnlocking(null);
      }
    },
    [language, showToast, totalStardust, unlockStar, unlocking],
  );

  if (!catalogReady || !skyCatalog) {
    return (
      <CosmicScreenBackground>
        <View style={[styles.root, styles.centered]}>
          <AppText variant="galaxyLoading">{t(language, "loadingCatalog")}</AppText>
        </View>
      </CosmicScreenBackground>
    );
  }

  const filterOptions = [
    { id: "all" as const, label: t(language, "allConstellations") },
    { id: "active" as const, label: t(language, "filterActive") },
    { id: "completed" as const, label: t(language, "filterCompleted") },
  ];

  return (
    <TabScreenScaffold
      stardustAmount={totalStardust}
      scrollStyle={styles.root}
      scrollContentStyle={{ alignItems: "center" }}
      columnStyle={{ gap: spacing.md }}
    >
      <SurfaceCard style={[screenBlock, galaxyCardStyles.summaryCard]} borderVariant="strong">
        <View style={galaxyCardStyles.summaryRow}>
          <View>
            <AppText variant="galaxySummaryLabel">{t(language, "skyProgress")}</AppText>
            <AppText variant="galaxySummarySubtext">
              <AppText variant="numericCompact" color={theme.colors.textSecondary}>
                {overallUnlocked}
              </AppText>
              {" / "}
              <AppText variant="numericCompact" color={theme.colors.textSecondary}>
                {overallStars}
              </AppText>
              {` ${t(language, "skyProgressSub")} · `}
              <AppText variant="numericCompact" color={theme.colors.textSecondary}>
                {completedCount}
              </AppText>
              {" / "}
              <AppText variant="numericCompact" color={theme.colors.textSecondary}>
                {constellationCount}
              </AppText>
              {` ${t(language, "constellationsWord")}`}
            </AppText>
          </View>
        </View>
        <View style={galaxyCardStyles.progressBgMain}>
          <Animated.View
            style={[
              galaxyCardStyles.progressFillMain,
              { width: `${Math.round((overallUnlocked / Math.max(overallStars, 1)) * 100)}%` },
            ]}
          />
        </View>
      </SurfaceCard>

      <ConstellationFilterBar options={filterOptions} value={filter} onChange={setFilter} />

      <SkySection
        title={t(language, "completedSection")}
        items={filteredSections.completed}
        totalStardust={totalStardust}
        onStarPress={handleStarPress}
      />

      <SkySection
        title={t(language, "skyTitle")}
        items={filteredSections.journey}
        totalStardust={totalStardust}
        onStarPress={handleStarPress}
      />

      {filteredSections.completed.length === 0 && filteredSections.journey.length === 0 ? (
        <View style={galaxyCardStyles.emptyState}>
          <AppText variant="galaxyEmptyText">
            {filter === "completed"
              ? t(language, "noCompletedConstellations")
              : t(language, "noConstellationsFound")}
          </AppText>
        </View>
      ) : null}
    </TabScreenScaffold>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: GALAXY_BACKDROP_COLOR,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
});
