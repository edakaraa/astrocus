import React, { useCallback, useMemo } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import {
  BACKGROUND_TOLERANCE_SECONDS,
  BADGES,
  getBadgeLabel,
  PAUSE_LIMIT,
  SESSION_DURATION_OPTIONS,
} from "../shared/constants";
import { t } from "../shared/i18n";
import { formatDuration, formatNumber, getWeekDayLabels } from "../shared/formatLocale";
import { useResponsive } from "../shared/responsive";
import { colors, fontFamilies, layout, radii, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { SurfaceCard } from "../components/SurfaceCard";
import { CelebrationModal } from "../components/CelebrationModal";
import { ProgressRing } from "../components/ProgressRing";
import { CelestialVisual } from "../components/CelestialVisual";
import { Logo } from "../components/Logo";
import { StardustPill } from "../components/StardustPill";

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

export const SessionScreen = () => {
  const { contentPadding, tabBarClearance, topInset, width, availableHeight, isCompact, scale } = useResponsive();
  const {
    analyticsSummary,
    categories,
    dailySummary,
    language,
    sessionState,
    setSelectedCategoryId,
    setSelectedDurationMinutes,
    startSession,
    pauseSession,
    resumeSession,
    resetSession,
    cancelSession,
    celebration,
    dismissCelebration,
    user,
    unlockedStarIds,
    stars,
    sessions,
  } = useAppContext();

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === sessionState.selectedCategoryId) ?? categories[categories.length - 1],
    [categories, sessionState.selectedCategoryId],
  );

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

  const progressRatio = useMemo(() => {
    const totalSeconds = sessionState.selectedDurationMinutes * 60;
    if (totalSeconds <= 0) {
      return 0;
    }
    return 1 - Math.min(sessionState.remainingSeconds / totalSeconds, 1);
  }, [sessionState.remainingSeconds, sessionState.selectedDurationMinutes]);

  const ringColor = sessionState.status === "running" ? colors.primary : colors.borderStrong;
  const isSessionActive = sessionState.status === "running" || sessionState.status === "paused";
  const dailyGoalMinutes = user?.dailyGoalMinutes ?? 90;
  const dailyProgress = Math.min(dailySummary.totalMinutes / Math.max(dailyGoalMinutes, 1), 1);
  const latestSession = sessions[sessions.length - 1] ?? null;
  const bestSuggestedDuration = dailySummary.totalMinutes >= dailyGoalMinutes ? 15 : sessionState.selectedDurationMinutes;
  const selectedCategoryLabel = t(language, `category_${selectedCategory.id}` as never);

  const weeklyMinutes = useMemo(() => {
    if (analyticsSummary?.weekFocusMinutes?.length === 7) {
      return analyticsSummary.weekFocusMinutes;
    }
    const today = new Date();
    const firstDay = new Date(today);
    const day = today.getDay() === 0 ? 6 : today.getDay() - 1;
    firstDay.setDate(today.getDate() - day);

    const weekDayLabels = getWeekDayLabels(language);

    return weekDayLabels.map((_, index) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + index);
      const key = date.toLocaleDateString("en-CA");

      return sessions
        .filter((session) => new Date(session.completedAt).toLocaleDateString("en-CA") === key)
        .reduce((sum, session) => sum + session.durationMinutes, 0);
    });
  }, [analyticsSummary?.weekFocusMinutes, language, sessions]);

  const streakForCelebration = celebration?.streakCount ?? user?.currentStreak ?? 0;

  const handleStartSession = () => {
    void startSession();
  };

  const handlePrimaryTimerAction = () => {
    if (sessionState.status === "running") {
      pauseSession();
      return;
    }

    resumeSession();
  };

  const confirmEndSession = useCallback(() => {
    Alert.alert(t(language, "endSessionTitle"), t(language, "endSessionMessage"), [
      { text: t(language, "continue"), style: "cancel" },
      {
        text: t(language, "endSessionConfirm"),
        style: "destructive",
        onPress: () => {
          void cancelSession();
        },
      },
    ]);
  }, [cancelSession, language]);

  const handleDismissFailedSession = () => {
    resetSession();
  };

  if (isSessionActive) {
    const primaryLabel = sessionState.status === "running" ? t(language, "pause") : t(language, "resume");
    const primaryA11y = sessionState.status === "running" ? t(language, "pause") : t(language, "resume");

    // Ring fits both width and the available vertical space on any device.
    const ringSize = Math.round(
      Math.min(width - contentPadding * 2, availableHeight * 0.42, 280),
    );
    const ringSizeClamped = Math.max(168, ringSize);
    const planetSize = Math.round(ringSizeClamped * 0.875);
    const timerFontSize = Math.round(ringSizeClamped * 0.24);

    return (
      <View style={[styles.fullScreen, { paddingTop: topInset, paddingHorizontal: contentPadding }]}>
        <StarfieldBackground density={36} />

        <View style={styles.activeTopBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "reset")}
            onPress={confirmEndSession}
            style={styles.iconButton}
            hitSlop={layout.hitSlop}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textMuted} />
          </Pressable>
          <Text style={styles.activeEyebrow} numberOfLines={1}>{selectedCategoryLabel}</Text>
          <View style={styles.iconButtonGhost} />
        </View>

        <View style={[styles.activeContent, { paddingBottom: tabBarClearance }]}>
          <Text style={styles.activeTitle}>{t(language, "deepFocus")}</Text>
          <Text style={[styles.activeTime, { fontSize: timerFontSize }]}>{formatSeconds(sessionState.remainingSeconds)}</Text>
          <Text style={styles.activeSubtitle}>{t(language, "focusStartHint")}</Text>

          <ProgressRing size={ringSizeClamped} strokeWidth={3} progress={progressRatio} progressColor={ringColor}>
            <CelestialVisual variant="planet" size={planetSize} />
          </ProgressRing>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={primaryA11y}
            onPress={handlePrimaryTimerAction}
            style={styles.primaryWideButton}
          >
            <Text style={styles.primaryWideText}>{primaryLabel}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "endSession")}
            onPress={confirmEndSession}
            hitSlop={layout.hitSlop}
          >
            <Text style={styles.ghostAction}>{t(language, "endSession")}</Text>
          </Pressable>
        </View>

        <CelebrationModal
          visible={Boolean(celebration)}
          stardustEarned={celebration?.stardustEarned ?? 0}
          pendingSync={celebration?.pendingSync}
          unlockedStarLabel={unlockedStarLabel}
          newBadgeLabels={newBadgeLabels}
          galacticAdvice={celebration?.galacticAdvice}
          durationMinutes={sessionState.selectedDurationMinutes}
          currentStreak={streakForCelebration}
          todayTotalMinutes={dailySummary.totalMinutes}
          onClose={dismissCelebration}
        />
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingHorizontal: contentPadding,
          paddingBottom: tabBarClearance,
          paddingTop: Math.max(spacing.sm, topInset),
        },
      ]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <StarfieldBackground density={34} />

      {/* Global stardust balance — visible at all times */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <Logo size="md" accessibilityLabel={t(language, "appName")} />
          <Text style={styles.brandTitle}>{t(language, "appName")}</Text>
        </View>
        <StardustPill amount={user?.totalStardust ?? 0} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroGlow} pointerEvents="none" />
        <Logo size={isCompact ? "md" : "lg"} style={styles.heroLogo} accessibilityLabel={t(language, "appName")} />
        <CelestialVisual variant="planet" size={scale(132)} style={styles.heroPlanet} />
        <Text style={styles.heroEyebrow}>{t(language, "mainNavigation")}</Text>
        <Text style={styles.heroTitle} numberOfLines={2}>{`${t(language, "welcomeUser")}, ${user?.username ?? t(language, "explorerName")}`}</Text>
        <Text style={styles.heroSubtitle}>{t(language, "sessionHeroSubtitle")}</Text>
        <Text style={styles.heroRateHint}>{t(language, "stardustPerMinute")}</Text>
      </View>

      <View style={styles.menuList}>
        <SurfaceCard style={styles.menuItem}>
          <View style={styles.menuIcon}>
            <MaterialCommunityIcons name="timer-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.menuTextWrap}>
            <Text style={styles.menuTitle}>{t(language, "session")}</Text>
            <Text style={styles.menuSubtitle}>{t(language, "focusMenuSubtitle")}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textFaint} />
        </SurfaceCard>

        <SurfaceCard style={styles.dailyGoalCard} borderVariant="strong">
          <View style={styles.dailyHeader}>
            <Text style={styles.cardLabel}>{t(language, "todayFocusLabel")}</Text>
            <Text style={styles.dailyMeta}>{`${formatDuration(language, dailySummary.totalMinutes)} / ${formatDuration(language, dailyGoalMinutes)}`}</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${Math.round(dailyProgress * 100)}%` }]} />
          </View>
        </SurfaceCard>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t(language, "suggestedSessions")}</Text>
      </View>

      <View style={styles.suggestionRow}>
        {[
          { titleKey: "deepFocus" as const, minutes: bestSuggestedDuration, icon: "star-four-points" as const },
          { titleKey: "longFocus" as const, minutes: 50, icon: "moon-waning-crescent" as const },
          { titleKey: "shortBreath" as const, minutes: 15, icon: "weather-windy" as const },
        ].map((item) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${t(language, item.titleKey)} ${item.minutes} ${t(language, "selectSessionMinutesA11y")}`}
            key={`${item.titleKey}-${item.minutes}`}
            onPress={() => setSelectedDurationMinutes(item.minutes)}
            style={[
              styles.suggestionCard,
              sessionState.selectedDurationMinutes === item.minutes ? styles.suggestionCardActive : null,
            ]}
          >
            <MaterialCommunityIcons name={item.icon} size={20} color={colors.warmOffWhite} />
            <Text style={styles.suggestionTitle}>{t(language, item.titleKey)}</Text>
            <Text style={styles.suggestionTime}>{formatDuration(language, item.minutes)}</Text>
          </Pressable>
        ))}
      </View>

      <SurfaceCard style={styles.startCard} borderVariant="strong">
        <View style={styles.startTop}>
          <View>
            <Text style={styles.cardLabel}>{t(language, "sessionType")}</Text>
            <Text style={styles.startTitle}>{selectedCategoryLabel}</Text>
          </View>
          <View style={styles.durationBubble}>
            <Text style={styles.durationBubbleText}>{formatDuration(language, sessionState.selectedDurationMinutes)}</Text>
          </View>
        </View>

        <View style={styles.durationRow}>
          {SESSION_DURATION_OPTIONS.map((minutes) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${minutes} ${t(language, "selectSessionMinutesA11y")}`}
              key={minutes}
              onPress={() => setSelectedDurationMinutes(minutes)}
              style={[styles.durationChip, sessionState.selectedDurationMinutes === minutes ? styles.durationChipActive : null]}
            >
              <Text style={[styles.durationChipText, sessionState.selectedDurationMinutes === minutes ? styles.durationChipTextActive : null]}>
                {formatDuration(language, minutes)}
              </Text>
            </Pressable>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroller}>
          {categories.map((category) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${t(language, `category_${category.id}` as never)} ${t(language, "selectCategoryA11y")}`}
              key={category.id}
              onPress={() => setSelectedCategoryId(category.id)}
              style={[
                styles.categoryOptionChip,
                sessionState.selectedCategoryId === category.id ? styles.categoryChipActive : null,
              ]}
            >
              <Text style={styles.categoryChipText}>{`${category.emoji} ${t(language, `category_${category.id}` as never)}`}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(language, "startSession")}
          onPress={handleStartSession}
          style={styles.primaryWideButton}
        >
          <Text style={styles.primaryWideText}>{t(language, "start")}</Text>
        </Pressable>
      </SurfaceCard>

      {latestSession ? (
        <SurfaceCard style={styles.lastSessionCard}>
          <View style={styles.miniPlanet}>
            <CelestialVisual variant="planet" size={54} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardLabel}>{t(language, "lastSession")}</Text>
            <Text style={styles.lastSessionTitle}>
              {`${t(language, `category_${latestSession.categoryId}` as never)} · ${formatDuration(language, latestSession.durationMinutes)}`}
            </Text>
          </View>
          <Text style={styles.lastSessionReward}>{`+${formatNumber(language, latestSession.stardustEarned)} ✦`}</Text>
        </SurfaceCard>
      ) : null}

      <SurfaceCard style={styles.weekCard}>
        <View style={styles.dailyHeader}>
          <Text style={styles.sectionTitle}>{t(language, "weeklyProgress")}</Text>
          <Text style={styles.dailyMeta}>{`${formatNumber(language, unlockedStarIds.length)} ${t(language, "starsOpenCount")}`}</Text>
        </View>
        <View style={styles.weekBars}>
          {weeklyMinutes.map((minutes, index) => {
            const barHeight = 22 + Math.min(minutes / Math.max(dailyGoalMinutes, 1), 1) * 58;
            const weekDayLabels = getWeekDayLabels(language);

            return (
              <View key={weekDayLabels[index]} style={styles.weekBarItem}>
                <View style={styles.weekTrack}>
                  <View style={[styles.weekFill, { height: barHeight }]} />
                </View>
                <Text style={styles.weekLabel}>{weekDayLabels[index]}</Text>
              </View>
            );
          })}
        </View>
      </SurfaceCard>

      {sessionState.status === "failed" ? (
        <SurfaceCard style={styles.failedCard} borderVariant="strong">
          <Text style={styles.failedTitle}>{t(language, "failedSessionTitle")}</Text>
          <Text style={styles.failedText}>
            {t(language, "failedSessionBackground").replace("{seconds}", String(BACKGROUND_TOLERANCE_SECONDS))}
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel={t(language, "reset")} onPress={handleDismissFailedSession} style={styles.softButton}>
            <Text style={styles.softButtonText}>{t(language, "prepareAgain")}</Text>
          </Pressable>
        </SurfaceCard>
      ) : null}

      <View style={styles.statsRow}>
        <Text style={styles.statItem}>{`◎ ${sessionState.pauseCount} ${t(language, "pauseBreak")} / ${PAUSE_LIMIT}`}</Text>
        <Text style={styles.statItem}>{`⏱ ${formatDuration(language, sessionState.selectedDurationMinutes)} ${t(language, "sessionGoal")}`}</Text>
        <Text style={styles.statItem}>{`✦ ${formatNumber(language, user?.currentStreak ?? 0)} ${t(language, "dayStreak")}`}</Text>
      </View>

      <CelebrationModal
        visible={Boolean(celebration)}
        stardustEarned={celebration?.stardustEarned ?? 0}
        pendingSync={celebration?.pendingSync}
        unlockedStarLabel={unlockedStarLabel}
        newBadgeLabels={newBadgeLabels}
        galacticAdvice={celebration?.galacticAdvice}
        durationMinutes={sessionState.selectedDurationMinutes}
        currentStreak={streakForCelebration}
        todayTotalMinutes={dailySummary.totalMinutes}
        onClose={dismissCelebration}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  fullScreen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  activeTopBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: spacing.sm,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: layout.touchTargetMin,
    justifyContent: "center",
    width: layout.touchTargetMin,
  },
  iconButtonGhost: {
    height: layout.touchTargetMin,
    width: layout.touchTargetMin,
  },
  activeEyebrow: {
    color: colors.textFaint,
    flex: 1,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  activeContent: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  activeTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  activeTime: {
    color: colors.text,
    fontFamily: fontFamilies.mono,
    fontWeight: "800",
    letterSpacing: -1,
    marginVertical: spacing.xxs,
  },
  activeSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 22,
    marginTop: 4,
  },
  primaryWideButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: "rgba(232,230,200,0.24)",
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    marginTop: spacing.md,
    paddingVertical: 14,
    width: "100%",
  },
  primaryWideText: {
    color: colors.warmOffWhite,
    fontFamily: fontFamilies.displayBold,
    fontSize: 15,
    fontWeight: "800",
  },
  ghostAction: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: "700",
    marginTop: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    maxHeight: layout.topBarMaxHeight,
    paddingBottom: spacing.xxs,
  },
  topBarLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  brandTitle: {
    color: colors.text,
    fontFamily: fontFamilies.display,
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  heroLogo: {
    marginBottom: 4,
    marginTop: 4,
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: "rgba(5, 7, 23, 0.78)",
    borderColor: "rgba(149,155,181,0.12)",
    borderRadius: 26,
    borderWidth: 1,
    minHeight: 220,
    overflow: "hidden",
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
  },
  heroGlow: {
    backgroundColor: "rgba(131,135,195,0.12)",
    borderRadius: 999,
    height: 190,
    position: "absolute",
    top: 8,
    width: 190,
  },
  heroPlanet: {
    marginBottom: -4,
    marginTop: 0,
  },
  heroEyebrow: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.6,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  heroTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: "center",
  },
  heroSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 6,
  },
  heroRateHint: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 8,
  },
  menuList: {
    gap: spacing.sm,
  },
  menuItem: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  menuIcon: {
    alignItems: "center",
    backgroundColor: "rgba(131,135,195,0.14)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  menuTextWrap: {
    flex: 1,
  },
  menuTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
  },
  menuSubtitle: {
    color: colors.textFaint,
    fontSize: 10,
    marginTop: 3,
  },
  dailyGoalCard: {
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dailyHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
  },
  dailyMeta: {
    color: colors.textMuted,
    fontFamily: fontFamilies.monoRegular,
    fontSize: 11,
  },
  progressBg: {
    backgroundColor: "rgba(149,155,181,0.14)",
    borderRadius: 999,
    height: 6,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: "100%",
  },
  sectionHeader: {
    marginTop: 2,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 15,
    fontWeight: "800",
  },
  suggestionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  suggestionCard: {
    backgroundColor: "rgba(13, 11, 43, 0.82)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexBasis: "30%",
    flexGrow: 1,
    minHeight: 106,
    minWidth: 100,
    padding: spacing.sm,
  },
  suggestionCardActive: {
    backgroundColor: "rgba(131,135,195,0.18)",
    borderColor: "rgba(232,230,200,0.22)",
  },
  suggestionTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 14,
  },
  suggestionTime: {
    color: colors.textFaint,
    fontFamily: fontFamilies.monoRegular,
    fontSize: 10,
    marginTop: 3,
  },
  startCard: {
    gap: spacing.md,
  },
  startTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  startTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 20,
    fontWeight: "800",
    marginTop: 3,
  },
  durationBubble: {
    backgroundColor: "rgba(131,135,195,0.16)",
    borderColor: "rgba(232,230,200,0.16)",
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  durationBubbleText: {
    color: colors.text,
    fontFamily: fontFamilies.monoRegular,
    fontSize: 11,
  },
  durationRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  durationChip: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  durationChipActive: {
    backgroundColor: colors.primary,
    borderColor: "rgba(232,230,200,0.24)",
  },
  durationChipText: {
    color: colors.textMuted,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "800",
  },
  durationChipTextActive: {
    color: colors.warmOffWhite,
  },
  categoryScroller: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  categoryOptionChip: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  categoryChipActive: {
    backgroundColor: "rgba(131,135,195,0.22)",
    borderColor: "rgba(232,230,200,0.2)",
  },
  categoryChipText: {
    color: colors.text,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "700",
  },
  lastSessionCard: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingVertical: 12,
  },
  miniPlanet: {
    height: 54,
    overflow: "hidden",
    width: 54,
  },
  lastSessionTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  lastSessionReward: {
    color: colors.primary,
    fontFamily: fontFamilies.mono,
    fontSize: 12,
    fontWeight: "800",
  },
  weekCard: {
    gap: spacing.md,
  },
  weekBars: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 10,
    height: 112,
    justifyContent: "space-between",
  },
  weekBarItem: {
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  weekTrack: {
    alignItems: "center",
    backgroundColor: "rgba(149,155,181,0.12)",
    borderRadius: radii.pill,
    height: 82,
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 12,
  },
  weekFill: {
    backgroundColor: colors.primary,
    borderRadius: radii.pill,
    width: "100%",
  },
  weekLabel: {
    color: colors.textFaint,
    fontSize: 9,
    fontWeight: "700",
  },
  failedCard: {
    borderColor: "rgba(255,107,157,0.22)",
    gap: spacing.sm,
  },
  failedTitle: {
    color: colors.danger,
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    fontWeight: "800",
  },
  failedText: {
    color: colors.textMuted,
    fontSize: 12,
  },
  softButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingVertical: 12,
  },
  softButtonText: {
    color: colors.text,
    fontWeight: "800",
  },
  statsRow: {
    flexDirection: "row",
    gap: 14,
    justifyContent: "center",
  },
  statItem: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "700",
  },
});
