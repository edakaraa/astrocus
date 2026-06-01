import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import * as Haptics from "expo-haptics";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { toastTone, useAppContext } from "../context/AppContext";
import { loadSkyCatalog, getSkyCatalogOrNull } from "../services/skyCatalog";
import { useResponsive } from "../shared/responsive";
import { colors, fontFamilies, layout, radii, screenBlock, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { SurfaceCard } from "../components/SurfaceCard";
import { CelestialVisual } from "../components/CelestialVisual";
import { ScreenContentColumn } from "../components/ScreenContentColumn";
import { StardustPill } from "../components/StardustPill";
import {
  buildConstellationProgressList,
  constellationLabel,
  groupConstellationsForSky,
  sortConstellationsForUser,
  starDisplayName,
  starUnlockCost,
  type ConstellationProgressEnriched,
} from "../services/constellationCatalog";
import { formatNumber } from "../shared/formatLocale";
import { t } from "../shared/i18n";
import type { ConstellationProgress, StarWithProgress } from "../shared/types";

const CELESTIAL_VARIANTS = ["galaxy", "star", "planet"] as const;

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
type StarCardProps = {
  star: StarWithProgress;
  isNextToUnlock: boolean;
  totalStardust: number;
  isActiveConstellation: boolean;
  onPress: (star: StarWithProgress) => void;
  cardIndex: number;
};

const StarCard = React.memo(
  ({
    star,
    isNextToUnlock,
    totalStardust,
    isActiveConstellation,
    onPress,
    cardIndex,
  }: StarCardProps) => {
    const { language } = useAppContext();
    const variant = CELESTIAL_VARIANTS[cardIndex % 3];
    const unlockCost = starUnlockCost(star);
    const canAfford = totalStardust >= unlockCost;
    const tappable = isActiveConstellation && isNextToUnlock && canAfford;
    const remaining = Math.max(unlockCost - totalStardust, 0);
    const starName = starDisplayName(star, language);

    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${starName} — ${star.isUnlocked ? t(language, "starA11yUnlocked") : `${unlockCost} ✦ ${t(language, "starA11yRequired")}`}`}
        onPress={() => onPress(star)}
        style={({ pressed }) => [
          styles.starCard,
          star.isUnlocked && styles.starCardUnlocked,
          tappable && styles.starCardAffordable,
          pressed && styles.starCardPressed,
        ]}
      >
        {/* Glow halo for unlocked stars */}
        {star.isUnlocked ? <View style={styles.starGlow} /> : null}

        <CelestialVisual variant={variant} size={72} muted={!star.isUnlocked} />

        <Text style={[styles.starName, star.isUnlocked && styles.starNameUnlocked]}>{starName}</Text>

        {star.isUnlocked ? (
          <View style={styles.statusPill}>
            <MaterialCommunityIcons name="check-circle" size={11} color={colors.success} />
            <Text style={[styles.statusText, { color: colors.success }]}>{t(language, "starOpen")}</Text>
          </View>
        ) : isNextToUnlock && isActiveConstellation ? (
          <View style={[styles.statusPill, canAfford ? styles.pillAffordable : styles.pillLocked]}>
            <MaterialCommunityIcons
              name={canAfford ? "star-four-points" : "lock-outline"}
              size={11}
              color={canAfford ? colors.warning : colors.textFaint}
            />
            <Text style={[styles.statusText, { color: canAfford ? colors.warning : colors.textFaint }]}>
              {canAfford
                ? `${unlockCost} ✦`
                : `${formatNumber(language, remaining)} ✦ ${t(language, "starShortfallSuffix")}`}
            </Text>
          </View>
        ) : (
          <View style={styles.statusPill}>
            <MaterialCommunityIcons name="lock-outline" size={11} color={colors.textFaint} />
            <Text style={[styles.statusText, { color: colors.textFaint }]}>{t(language, "starLockedLabel")}</Text>
          </View>
        )}
      </Pressable>
    );
  },
);

type ConstellationCardProps = {
  progress: ConstellationProgressEnriched;
  totalStardust: number;
  onStarPress: (star: StarWithProgress, constellation: ConstellationProgress) => void;
};

const ConstellationCard = React.memo(({ progress, totalStardust, onStarPress }: ConstellationCardProps) => {
  const { language } = useAppContext();
  const { constellation, stars, isActive, isCompleted, isNext, isLocked, unlockedCount, unlockOrder, isStarter } =
    progress;
  const progressFraction = stars.length > 0 ? unlockedCount / stars.length : 0;
  const astronomicalName = constellation.nameAstronomical;

  // The next star to unlock is the first locked one in sequential order
  const nextStarIndex = stars.findIndex((s) => !s.isUnlocked);

  return (
    <SurfaceCard
      style={[
        screenBlock,
        styles.constellationCard,
        isActive && styles.constellationCardActive,
        isNext && styles.constellationCardNext,
        isCompleted && styles.constellationCardCompleted,
        isLocked && styles.constellationCardLocked,
      ]}
      borderVariant={isActive || isNext ? "strong" : "subtle"}
    >
      {/* Header */}
      <View style={styles.constHeader}>
        <View style={styles.constSymbolWrap}>
          <MaterialCommunityIcons name="star-circle-outline" size={22} color={colors.primary} />
        </View>
        <View style={styles.constHeaderText}>
          <Text style={styles.constName}>{astronomicalName}</Text>
          <Text style={styles.constSubname}>
            {constellation.genitiveEn} · {stars.length} {t(language, "starsCount")}
          </Text>
        </View>
        <View style={styles.constBadge}>
          {isCompleted ? (
            <MaterialCommunityIcons name="check-decagram" size={22} color={colors.success} />
          ) : isActive ? (
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>{t(language, "active")}</Text>
            </View>
          ) : isNext ? (
            <View style={styles.nextPill}>
              <Text style={styles.nextPillText}>{t(language, "nextLabel")}</Text>
            </View>
          ) : isLocked ? (
            <View style={styles.lockedPill}>
              <MaterialCommunityIcons name="lock-outline" size={12} color={colors.textFaint} />
              <Text style={styles.lockedPillText}>
                {isStarter ? t(language, "starterTier") : `#${unlockOrder}`}
              </Text>
            </View>
          ) : (
            <Text style={styles.constCount}>{`${unlockedCount}/${stars.length}`}</Text>
          )}
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${Math.round(progressFraction * 100)}%` }]} />
      </View>

      {/* Stars row */}
      <View style={styles.starsRow}>
        {stars.map((star, idx) => (
          <StarCard
            key={star.id}
            star={star}
            isNextToUnlock={idx === nextStarIndex}
            totalStardust={totalStardust}
            isActiveConstellation={isActive}
            onPress={(s) => onStarPress(s, progress)}
            cardIndex={idx}
          />
        ))}
      </View>

      {/* Completion reward hint */}
      {isCompleted ? (
        <View style={styles.completedBanner}>
          <MaterialCommunityIcons name="trophy-variant" size={13} color={colors.warning} />
          <Text style={styles.completedBannerText}>
            {t(language, "badgeTrophy")} — {astronomicalName}
          </Text>
        </View>
      ) : isLocked ? (
        <Text style={styles.lockedHint}>{t(language, "unlockRequirement")}</Text>
      ) : isActive || isNext ? (
        <Text style={styles.constDesc}>{constellationLabel(constellation, language)}</Text>
      ) : null}
    </SurfaceCard>
  );
});

// ---------------------------------------------------------------------------
// Main GalaxyScreen
// ---------------------------------------------------------------------------
const SkySection = ({
  title,
  items,
  totalStardust,
  onStarPress,
}: {
  title: string;
  items: ConstellationProgressEnriched[];
  totalStardust: number;
  onStarPress: (star: StarWithProgress, constellation: ConstellationProgress) => void;
}) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {items.map((progress) => (
        <ConstellationCard
          key={progress.constellation.id}
          progress={progress}
          totalStardust={totalStardust}
          onStarPress={onStarPress}
        />
      ))}
    </View>
  );
};

export const GalaxyScreen = () => {
  const { tabBarClearance, topInset } = useResponsive();
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
      <View style={[styles.root, styles.centered]}>
        <StarfieldBackground density={38} />
        <Text style={styles.loadingText}>{t(language, "loadingCatalog")}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StarfieldBackground density={38} />

      <ScrollView
        contentContainerStyle={[
          styles.container,
          {
            alignItems: "center",
            flexGrow: 1,
            paddingBottom: tabBarClearance,
            paddingTop: Math.max(spacing.md, topInset),
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenContentColumn style={{ gap: spacing.md }}>
        {/* Header */}
        <View style={styles.top}>
          <View>
            <Text style={styles.eyebrow}>{t(language, "skyEyebrow")}</Text>
            <Text style={styles.title}>{t(language, "skyTitle")}</Text>
          </View>
          <StardustPill amount={totalStardust} />
        </View>

        {/* Overall progress bar */}
        <SurfaceCard style={[screenBlock, styles.summaryCard]} borderVariant="strong">
          <View style={styles.summaryRow}>
            <View>
              <Text style={styles.summaryLabel}>{t(language, "skyProgress")}</Text>
              <Text style={styles.summarySubtext}>
                {overallUnlocked} / {overallStars} {t(language, "skyProgressSub")} · {completedCount} /{" "}
                {constellationCount} {t(language, "constellationsWord")}
              </Text>
            </View>
          </View>
          <View style={styles.progressBgMain}>
            <Animated.View
              style={[
                styles.progressFillMain,
                { width: `${Math.round((overallUnlocked / Math.max(overallStars, 1)) * 100)}%` },
              ]}
            />
          </View>
        </SurfaceCard>

        {/* Filter tabs */}
        <View style={styles.filterRow}>
          {([
            { id: "all", label: t(language, "allConstellations") },
            { id: "active", label: t(language, "filterActive") },
            { id: "completed", label: t(language, "filterCompleted") },
          ] as const).map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item.id}
              onPress={() => setFilter(item.id)}
              style={[styles.filterChip, filter === item.id && styles.filterChipActive]}
            >
              <Text style={[styles.filterText, filter === item.id && styles.filterTextActive]}>{item.label}</Text>
            </Pressable>
          ))}
        </View>

        <SkySection
          title={t(language, "completedSection")}
          items={filteredSections.completed}
          totalStardust={totalStardust}
          onStarPress={handleStarPress}
        />

        <SkySection
          title={t(language, "journey")}
          items={filteredSections.journey}
          totalStardust={totalStardust}
          onStarPress={handleStarPress}
        />

        {filteredSections.completed.length === 0 && filteredSections.journey.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              {filter === "completed"
                ? t(language, "noCompletedConstellations")
                : t(language, "noConstellationsFound")}
            </Text>
          </View>
        ) : null}
        </ScreenContentColumn>
      </ScrollView>
    </View>
  );
};

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: colors.textMuted,
    fontFamily: fontFamilies.body,
    fontSize: 14,
  },
  container: {
    gap: spacing.md,
    width: "100%",
  },
  top: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    maxHeight: layout.topBarMaxHeight,
    width: "100%",
  },
  eyebrow: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  title: {
    ...typography.h3,
    color: colors.text,
    marginTop: 4,
  },
  summaryCard: {
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  summaryLabel: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
  },
  summarySubtext: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 3,
  },
  progressBgMain: {
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(149,155,181,0.12)",
    overflow: "hidden",
  },
  progressFillMain: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  costHint: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  filterRow: {
    backgroundColor: "rgba(255,255,255,0.035)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  filterChip: {
    alignItems: "center",
    borderRadius: radii.pill,
    flex: 1,
    paddingVertical: 8,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: "800",
  },
  filterTextActive: {
    color: colors.warmOffWhite,
  },
  constellationCard: {
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  constellationCardActive: {
    borderColor: "rgba(131,135,195,0.36)",
    backgroundColor: "rgba(13,11,50,0.92)",
  },
  constellationCardCompleted: {
    borderColor: "rgba(185,240,215,0.22)",
    backgroundColor: "rgba(10,30,20,0.60)",
  },
  constellationCardNext: {
    borderColor: "rgba(255,209,102,0.28)",
    backgroundColor: "rgba(18,16,40,0.90)",
  },
  constellationCardLocked: {
    opacity: 0.72,
    backgroundColor: "rgba(10,10,24,0.85)",
  },
  lockedPill: {
    alignItems: "center",
    backgroundColor: "rgba(149,155,181,0.08)",
    borderColor: "rgba(149,155,181,0.18)",
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  lockedPillText: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: "800",
  },
  lockedHint: {
    color: colors.textFaint,
    fontSize: 11,
    fontStyle: "italic",
    marginTop: 2,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  nextPill: {
    backgroundColor: "rgba(255,209,102,0.12)",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(255,209,102,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  nextPillText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: "800",
  },
  constHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
  },
  constSymbolWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(131,135,195,0.14)",
    alignItems: "center",
    justifyContent: "center",
  },
  constSymbol: {
    fontSize: 20,
  },
  constHeaderText: {
    flex: 1,
  },
  constName: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 15,
    fontWeight: "800",
  },
  constSubname: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 1,
  },
  constBadge: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  constCount: {
    color: colors.textMuted,
    fontFamily: fontFamilies.mono,
    fontSize: 13,
    fontWeight: "700",
  },
  activePill: {
    backgroundColor: "rgba(131,135,195,0.24)",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activePillText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "800",
  },
  progressBg: {
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(149,155,181,0.10)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  starsRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  starCard: {
    alignItems: "center",
    backgroundColor: "rgba(13,11,43,0.78)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    minHeight: 140,
    padding: 10,
    position: "relative",
    overflow: "hidden",
  },
  starCardUnlocked: {
    backgroundColor: "rgba(22,18,70,0.86)",
    borderColor: "rgba(131,135,195,0.28)",
  },
  starCardAffordable: {
    borderColor: colors.warning,
    borderWidth: 1.5,
  },
  starCardPressed: {
    opacity: 0.72,
  },
  starGlow: {
    position: "absolute",
    top: -20,
    left: -20,
    right: -20,
    bottom: -20,
    borderRadius: 999,
    backgroundColor: "rgba(131,135,195,0.10)",
  },
  starName: {
    color: colors.textMuted,
    fontFamily: fontFamilies.displayBold,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },
  starNameUnlocked: {
    color: colors.text,
  },
  statusPill: {
    alignItems: "center",
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  pillAffordable: {
    backgroundColor: "rgba(255,209,102,0.10)",
  },
  pillLocked: {
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  statusText: {
    fontSize: 9,
    fontWeight: "800",
  },
  constDesc: {
    color: colors.textFaint,
    fontSize: 11,
    lineHeight: 16,
  },
  completedBanner: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    backgroundColor: "rgba(185,240,215,0.06)",
    borderRadius: radii.sm,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  completedBannerText: {
    color: colors.success,
    fontSize: 11,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.xl,
  },
  emptyText: {
    color: colors.textFaint,
    fontSize: 13,
  },
});
