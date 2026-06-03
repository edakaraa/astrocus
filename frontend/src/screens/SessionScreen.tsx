import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "expo-router";
import Svg, { Circle, Line } from "react-native-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import {
  BACKGROUND_TOLERANCE_SECONDS,
  PAUSE_LIMIT,
} from "../shared/constants";
import { fetchGalacticAdvice } from "../services/galacticAdvice";
import { t, type TranslationKey } from "../shared/i18n";
import type { Language, SessionRecord } from "../shared/types";
import { formatDuration } from "../shared/formatLocale";
import { getMondayWeekFocusMinutes } from "../shared/weekFocus";
import { MAX_FONT_SCALE, useResponsive } from "../shared/responsive";
import { colors, fontFamilies, getTabBarMetrics, layout, radii, screenBlock, spacing, typography } from "../shared/theme";
import { GalaxyBackground, GALAXY_BACKDROP_COLOR } from "../components/GalaxyBackground";
import { scheduleGalaxyScenePreload } from "../components/galaxy/preloadGalaxyScene";
import { ScreenContentColumn } from "../components/ScreenContentColumn";
import { SurfaceCard } from "../components/SurfaceCard";
import { CustomDurationSheet } from "../components/CustomDurationSheet";
import { TabScreenScaffold } from "../components/layout/TabScreenScaffold";
import { FocusSectionCard } from "../components/session/FocusSectionCard";
import { WeekDayStars } from "../components/session/WeekDayStars";
import { AppText } from "../components/ui/AppText";
import { PillChip } from "../components/ui/PillChip";
import { WeeklyReportCard } from "../components/WeeklyReportCard";
import { WeeklyReportModal } from "../components/WeeklyReportModal";
import { useWeeklyReport } from "../hooks/useWeeklyReport";

/** Recommended durations in the "Duration" section (distinct from quick-start presets). */
const DURATION_OPTIONS = [15, 30, 90, 120] as const;
const QUICK_PRESETS = [
  { titleKey: "presetBreath" as const, minutes: 10, emoji: "🌬️" },
  { titleKey: "presetPomodoro" as const, minutes: 25, emoji: "🍅" },
  { titleKey: "presetFlow" as const, minutes: 45, emoji: "⚡" },
  { titleKey: "presetDeep" as const, minutes: 60, emoji: "🌙" },
] as const;

const FOCUS_CATEGORY_IDS = [
  "general",
  "work",
  "reading",
  "project",
  "creativity",
  "coding",
  "sports",
  "meditation",
] as const;
const FOCUS_CATEGORY_LABEL: Record<(typeof FOCUS_CATEGORY_IDS)[number], TranslationKey> = {
  general: "category_general",
  work: "category_work",
  reading: "category_reading",
  project: "category_project",
  creativity: "category_creativity",
  coding: "category_coding",
  sports: "category_sports",
  meditation: "category_meditation",
};

const COSMIC_QUOTE_KEYS = ["cosmicQuote1", "cosmicQuote2", "cosmicQuote3"] as const satisfies readonly TranslationKey[];

function AnimatedStar({ size }: { size: number }) {
  const pulse = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 2400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(rotate, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const coreScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1.14],
  });
  const rayRotate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const coreSize = size * 0.26;
  const coreOffset = (size - coreSize) / 2;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: size,
          height: size,
          transform: [{ rotate: rayRotate }],
        }}
      >
        <Svg width={size} height={size} viewBox="0 0 100 100">
          <Line x1={50} y1={8} x2={50} y2={92} stroke="#E8E6C8" strokeWidth={1} strokeOpacity={0.5} />
          <Line x1={8} y1={50} x2={92} y2={50} stroke="#E8E6C8" strokeWidth={1} strokeOpacity={0.38} />
          <Line x1={18} y1={18} x2={82} y2={82} stroke="#E8C97A" strokeWidth={0.7} strokeOpacity={0.25} />
          <Line x1={82} y1={18} x2={18} y2={82} stroke="#E8C97A" strokeWidth={0.7} strokeOpacity={0.25} />
        </Svg>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: coreOffset,
          top: coreOffset,
          transform: [{ scale: coreScale }],
        }}
      >
        <Svg width={coreSize} height={coreSize} viewBox="0 0 100 100">
          <Circle cx={50} cy={50} r={46} fill="#E8E6C8" opacity={0.94} />
        </Svg>
      </Animated.View>
    </View>
  );
}

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

export const SessionScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { bottomOffset, height: tabBarHeight } = getTabBarMetrics(insets.bottom);
  const {
    contentPadding,
    edgePadding,
    tabBarClearance,
    topInset,
    width,
    height,
    availableHeight,
    isCompact,
    isShort,
    scale,
    font,
  } = useResponsive();
  const {
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
    showAlert,
    showConfirm,
    user,
    token,
    sessions,
    analyticsSummary,
  } = useAppContext();

  const [customDurationOpen, setCustomDurationOpen] = useState(false);
  const [cosmicMessage, setCosmicMessage] = useState<string | null>(null);
  const [weeklyReportOpen, setWeeklyReportOpen] = useState(false);

  const {
    report: weeklyReport,
    reportText: weeklyReportText,
    weekLabel: weeklyReportWeekLabel,
    loading: weeklyReportLoading,
    refetch: refetchWeeklyReport,
  } = useWeeklyReport(user?.id, language);

  useFocusEffect(
    useCallback(() => {
      void refetchWeeklyReport();
      return undefined;
    }, [refetchWeeklyReport]),
  );

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === sessionState.selectedCategoryId) ?? categories[categories.length - 1],
    [categories, sessionState.selectedCategoryId],
  );

  const isSessionActive =
    sessionState.status === "running" ||
    sessionState.status === "paused" ||
    sessionState.status === "completed";

  const tabBarStyle = useMemo(
    () => ({
      position: "absolute" as const,
      left: spacing.md,
      right: spacing.md,
      bottom: bottomOffset,
      backgroundColor: "rgba(6, 7, 22, 0.94)",
      borderColor: "rgba(149, 155, 181, 0.12)",
      borderTopWidth: 1,
      borderWidth: 1,
      borderRadius: 26,
      height: tabBarHeight,
      paddingTop: 0,
      paddingBottom: 0,
    }),
    [bottomOffset, tabBarHeight],
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      tabBarStyle: isSessionActive ? { display: "none" } : tabBarStyle,
    });
    return () => {
      navigation.setOptions({ tabBarStyle });
    };
  }, [isSessionActive, navigation, tabBarStyle]);

  useLayoutEffect(() => {
    scheduleGalaxyScenePreload(0.5);
  }, []);

  const selectedCategoryLabel = t(language, `category_${selectedCategory.id}` as never);

  const weeklyMinutes = useMemo(
    () => getMondayWeekFocusMinutes(sessions, analyticsSummary?.weekFocusMinutes),
    [analyticsSummary?.weekFocusMinutes, sessions],
  );
  const weekTotalMinutes = useMemo(() => weeklyMinutes.reduce((sum, m) => sum + m, 0), [weeklyMinutes]);

  const fallbackCosmicQuote = useMemo(() => {
    const dayIndex = new Date().getDate() % COSMIC_QUOTE_KEYS.length;
    return t(language, COSMIC_QUOTE_KEYS[dayIndex]);
  }, [language]);

  useEffect(() => {
    if (!token || !user) {
      setCosmicMessage(fallbackCosmicQuote);
      return;
    }
    let cancelled = false;
    void fetchGalacticAdvice(token, {
      language,
      durationMinutes: sessionState.selectedDurationMinutes,
      categoryId: sessionState.selectedCategoryId,
      currentStreak: user.currentStreak,
      todayTotalMinutes: dailySummary.totalMinutes,
      totalStardust: user.totalStardust,
    })
      .then((advice) => {
        if (!cancelled) {
          setCosmicMessage(advice.trim() || fallbackCosmicQuote);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setCosmicMessage(fallbackCosmicQuote);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [
    dailySummary.totalMinutes,
    fallbackCosmicQuote,
    language,
    sessionState.selectedCategoryId,
    sessionState.selectedDurationMinutes,
    token,
    user,
  ]);

  const isCustomDuration = !(DURATION_OPTIONS as readonly number[]).includes(sessionState.selectedDurationMinutes);

  const focusCategories = useMemo(
    () =>
      FOCUS_CATEGORY_IDS.map((id) => categories.find((c) => c.id === id)).filter(
        (c): c is (typeof categories)[number] => Boolean(c),
      ),
    [categories],
  );

  const heroStarSize = scale(isCompact ? 52 : isShort ? 58 : 64);
  const heroTitleSize = font(isCompact ? 17 : 19);
  const heroSubtitleSize = font(isCompact ? 12 : 13);
  const heroNumberSize = font(isCompact ? 36 : 40);
  const sectionLabelSize = font(10);
  const presetTitleSize = font(11);
  const presetDurationSize = font(10);
  const cardInnerWidth = width - edgePadding * 2 - spacing.md * 2;
  const presetTileWidth = Math.max(72, Math.floor((cardInnerWidth - spacing.sm * 3) / 4));
  const idleGap = isShort ? spacing.xs : spacing.sm;
  const heroSubtitle =
    dailySummary.totalMinutes <= 0
      ? t(language, "heroSubtitleZero")
      : t(language, "heroSubtitleToday").replace(
          "{duration}",
          formatDuration(language, dailySummary.totalMinutes),
        );

  const handleStartSession = () => {
    void startSession();
  };

  const handlePrimaryTimerAction = () => {
    if (sessionState.status === "running") {
      if (sessionState.pauseCount >= PAUSE_LIMIT) {
        void showAlert({
          title: t(language, "pauseExhaustedTitle"),
          message: t(language, "pauseExhaustedMessage"),
          confirmLabel: t(language, "continue"),
        });
        return;
      }

      pauseSession();
      void showAlert({
        title: t(language, "pauseUsedTitle"),
        message: t(language, "pauseUsedMessage"),
        confirmLabel: t(language, "continue"),
      });
      return;
    }

    resumeSession();
  };

  const openEndSessionConfirm = useCallback(() => {
    void showConfirm({
      title: t(language, "endSessionTitle"),
      message: t(language, "endSessionMessage"),
      cancelLabel: t(language, "continue"),
      confirmLabel: t(language, "endSessionConfirm"),
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) {
        void cancelSession();
      }
    });
  }, [cancelSession, language, showConfirm]);

  const handleDismissFailedSession = () => {
    resetSession();
  };

  const primaryLabel = sessionState.status === "running" ? t(language, "pause") : t(language, "resume");
  const primaryA11y = sessionState.status === "running" ? t(language, "pause") : t(language, "resume");

  const ringSize = Math.round(Math.min(width - contentPadding * 2, availableHeight * 0.42, 280));
  const timerFontSizeActive = Math.round(Math.max(168, ringSize) * 0.24);
  const layoutBase = Math.min(width, height);
  const galaxyCenterY = height * 0.5;
  const galaxyHalfBand = Math.round(layoutBase * 0.34) / 2;
  const gapAboveGalaxy = scale(52);
  const gapBelowGalaxy = scale(50);
  const sessionTitleSize = font(15);
  const sessionTitleLineHeight = Math.round(sessionTitleSize * 1.14);
  const categoryLabelUpper =
    language === "tr"
      ? selectedCategoryLabel.toLocaleUpperCase("tr-TR")
      : selectedCategoryLabel.toLocaleUpperCase("en-US");

  const backLeft = Math.max(edgePadding, insets.left + spacing.xs);
  const backTop = topInset + spacing.sm;
  const timerAnchorBottom = galaxyCenterY - galaxyHalfBand - gapAboveGalaxy;
  const controlsAnchorTop = galaxyCenterY + galaxyHalfBand + gapBelowGalaxy;

  return (
    <View style={[styles.sessionShell, isSessionActive && styles.fullScreen]}>
      {isSessionActive ? (
        <View style={styles.galaxyHost} pointerEvents="none">
          <GalaxyBackground centerYRatio={0.5} animate />
        </View>
      ) : null}

      {isSessionActive ? (
        <View style={styles.activeContentLayer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "reset")}
            onPress={openEndSessionConfirm}
            style={[styles.activeBackButton, { top: backTop, left: backLeft }]}
            hitSlop={layout.hitSlop}
          >
            <MaterialCommunityIcons name="chevron-left" size={22} color={colors.textMuted} />
          </Pressable>

          <View
            style={[
              styles.activeLayout,
              {
                paddingHorizontal: contentPadding,
                paddingBottom: Math.max(insets.bottom, spacing.md),
              },
            ]}
          >
            <View
              style={[
                styles.activeTimerAnchor,
                {
                  left: contentPadding,
                  right: contentPadding,
                  bottom: height - timerAnchorBottom,
                },
              ]}
            >
              <View style={styles.activeTimerBlock}>
                <AppText
                  variant="sessionDisplay"
                  style={[
                    styles.activeCategoryLabel,
                    { fontSize: sessionTitleSize, lineHeight: sessionTitleLineHeight },
                  ]}
                  numberOfLines={1}
                >
                  {categoryLabelUpper}
                </AppText>
                <AppText
                  variant="sessionDisplay"
                  style={[
                    styles.activeTime,
                    { fontSize: timerFontSizeActive, lineHeight: Math.round(timerFontSizeActive * 1.08) },
                  ]}
                >
                  {formatSeconds(sessionState.remainingSeconds)}
                </AppText>
                <AppText variant="caption" style={styles.activeSubtitle}>
                  {t(language, "focusActiveHint")}
                </AppText>
              </View>
            </View>

            <View
              style={[
                styles.activeControlsAnchor,
                {
                  left: contentPadding,
                  right: contentPadding,
                  top: controlsAnchorTop,
                },
              ]}
            >
              <View style={styles.activeControls}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={primaryA11y}
                  onPress={handlePrimaryTimerAction}
                  style={styles.primaryWideButton}
                >
                  <AppText variant="focusCta">{primaryLabel}</AppText>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t(language, "endSession")}
                  onPress={openEndSessionConfirm}
                  hitSlop={layout.hitSlop}
                >
                  <AppText variant="sessionGhostAction" style={styles.ghostAction}>
                    {t(language, "endSession")}
                  </AppText>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      ) : (
        <TabScreenScaffold
          stardustAmount={user?.totalStardust ?? 0}
          paddingBottom={spacing.md}
          scrollContentStyle={{ alignItems: "center" }}
          columnStyle={{ gap: idleGap }}
          footer={
            <ScreenContentColumn style={[styles.idleFooter, { paddingBottom: tabBarClearance }]}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t(language, "startSession")}
                onPress={handleStartSession}
                style={styles.startFocusButton}
              >
                <AppText variant="focusCta" maxFontSizeMultiplier={MAX_FONT_SCALE}>
                  {t(language, "startFocusCta")}
                </AppText>
              </Pressable>
            </ScreenContentColumn>
          }
          overlay={
            <>
              <CustomDurationSheet
                visible={customDurationOpen}
                language={language}
                selectedMinutes={sessionState.selectedDurationMinutes}
                onSelect={setSelectedDurationMinutes}
                onClose={() => setCustomDurationOpen(false)}
              />
              <WeeklyReportModal
                visible={weeklyReportOpen}
                report={weeklyReport}
                onClose={() => setWeeklyReportOpen(false)}
              />
            </>
          }
        >
          <SurfaceCard
            contentPadding={spacing.md}
            style={[screenBlock, styles.heroSurface, isShort ? styles.heroSurfaceCompact : null]}
          >
          <View style={styles.heroStarWrap}>
            <AnimatedStar size={heroStarSize} />
          </View>
          <AppText
            variant="sessionDisplay"
            style={[styles.heroWelcome, { fontSize: heroTitleSize, lineHeight: Math.round(heroTitleSize * 1.14) }]}
            numberOfLines={2}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {`${t(language, "welcomeUser")}, ${user?.username ?? t(language, "explorerName")}`}
          </AppText>
          <AppText
            variant="sessionHeroSubtitle"
            style={{ fontSize: heroSubtitleSize }}
            numberOfLines={3}
            maxFontSizeMultiplier={MAX_FONT_SCALE}
          >
            {heroSubtitle}
          </AppText>
          <View style={styles.heroStatBlock}>
            <AppText
              variant="sessionHeroStatNumber"
              style={{ fontSize: heroNumberSize }}
              maxFontSizeMultiplier={MAX_FONT_SCALE}
            >
              {formatDuration(language, dailySummary.totalMinutes)}
            </AppText>
            <AppText variant="sessionHeroStatLabel" maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t(language, "todayFocusLabel")}
            </AppText>
          </View>
        </SurfaceCard>

        <FocusSectionCard title={t(language, "quickStartTitle")} sectionLabelSize={sectionLabelSize}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.presetScroller, { minWidth: cardInnerWidth }]}
          >
            {QUICK_PRESETS.map((item) => {
              const active = sessionState.selectedDurationMinutes === item.minutes;
              return (
                <Pressable
                  key={item.titleKey}
                  accessibilityRole="button"
                  accessibilityLabel={`${t(language, item.titleKey)} ${item.minutes} ${t(language, "selectSessionMinutesA11y")}`}
                  onPress={() => setSelectedDurationMinutes(item.minutes)}
                  android_ripple={undefined}
                  style={({ pressed }) => [
                    styles.presetTile,
                    { width: presetTileWidth },
                    active ? styles.presetTileActive : styles.presetTileIdle,
                    pressed ? styles.presetTilePressed : null,
                  ]}
                >
                  <AppText variant="sessionPresetEmoji">{item.emoji}</AppText>
                  <AppText
                    variant="sessionPresetTitle"
                    style={{ fontSize: presetTitleSize }}
                    numberOfLines={1}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {t(language, item.titleKey)}
                  </AppText>
                  <AppText
                    variant="sessionPresetDuration"
                    style={{ fontSize: presetDurationSize }}
                    numberOfLines={1}
                    maxFontSizeMultiplier={MAX_FONT_SCALE}
                  >
                    {formatDuration(language, item.minutes)}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </FocusSectionCard>

        <FocusSectionCard title={t(language, "durationTitle")} sectionLabelSize={sectionLabelSize}>
          <View style={styles.durationRow}>
            {DURATION_OPTIONS.map((minutes) => {
              const active = sessionState.selectedDurationMinutes === minutes;
              return (
                <PillChip
                  key={minutes}
                  variant="duration"
                  flex
                  label={formatDuration(language, minutes)}
                  active={active}
                  accessibilityLabel={`${minutes} ${t(language, "selectSessionMinutesA11y")}`}
                  onPress={() => setSelectedDurationMinutes(minutes)}
                />
              );
            })}
            <PillChip
              variant="duration"
              flex
              label={
                isCustomDuration
                  ? formatDuration(language, sessionState.selectedDurationMinutes)
                  : t(language, "customDuration")
              }
              active={isCustomDuration}
              accessibilityLabel={t(language, "customDuration")}
              onPress={() => setCustomDurationOpen(true)}
            />
          </View>
        </FocusSectionCard>

        <FocusSectionCard title={t(language, "activityTitle")} sectionLabelSize={sectionLabelSize}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroller}>
            {focusCategories.map((category) => {
              const active = sessionState.selectedCategoryId === category.id;
              const labelKey = FOCUS_CATEGORY_LABEL[category.id as (typeof FOCUS_CATEGORY_IDS)[number]] ?? (`category_${category.id}` as TranslationKey);
              return (
                <PillChip
                  key={category.id}
                  variant="activity"
                  label={`${category.emoji} ${t(language, labelKey)}`}
                  active={active}
                  accessibilityLabel={`${t(language, labelKey)} ${t(language, "selectCategoryA11y")}`}
                  onPress={() => setSelectedCategoryId(category.id)}
                />
              );
            })}
          </ScrollView>
        </FocusSectionCard>

        <FocusSectionCard title={`✨ ${t(language, "cosmicMessageTitle")}`} sectionLabelSize={sectionLabelSize}>
          <AppText variant="sessionCosmicQuote" maxFontSizeMultiplier={MAX_FONT_SCALE}>
            "{cosmicMessage ?? fallbackCosmicQuote}"
          </AppText>
          <AppText variant="sessionCosmicAttribution" maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {t(language, "cosmicMessageAttribution")}
          </AppText>
        </FocusSectionCard>

        <FocusSectionCard title={t(language, "thisWeekTitle")} sectionLabelSize={sectionLabelSize}>
          <View style={styles.weekStatBlock}>
            <WeekDayStars minutesByDay={weeklyMinutes} language={language} />
            <AppText variant="sessionWeekLabel" maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {t(language, "totalFocusWeek")}
            </AppText>
            <AppText variant="sessionWeekTotal" maxFontSizeMultiplier={MAX_FONT_SCALE}>
              {formatDuration(language, weekTotalMinutes)}
            </AppText>
          </View>
        </FocusSectionCard>

        <WeeklyReportCard
          language={language}
          reportText={weeklyReportText}
          weekLabel={weeklyReportWeekLabel}
          stats={weeklyReport?.stats}
          loading={weeklyReportLoading}
          onPress={weeklyReport ? () => setWeeklyReportOpen(true) : undefined}
        />

        {sessionState.status === "failed" ? (
          <SurfaceCard style={[screenBlock, styles.failedCard]} borderVariant="strong">
            <AppText variant="sessionFailedTitle">{t(language, "failedSessionTitle")}</AppText>
            <AppText variant="sessionFailedText">
              {t(language, "failedSessionBackground").replace("{seconds}", String(BACKGROUND_TOLERANCE_SECONDS))}
            </AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(language, "reset")}
              onPress={handleDismissFailedSession}
              style={styles.softButton}
            >
              <AppText variant="sessionSoftButtonText">{t(language, "prepareAgain")}</AppText>
            </Pressable>
          </SurfaceCard>
        ) : null}
        </TabScreenScaffold>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sessionShell: {
    backgroundColor: GALAXY_BACKDROP_COLOR,
    flex: 1,
  },
  galaxyHost: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  fullScreen: {
    overflow: "hidden",
  },
  activeContentLayer: {
    flex: 1,
    zIndex: 1,
  },
  activeBackButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: layout.touchTargetMin,
    justifyContent: "center",
    position: "absolute",
    width: layout.touchTargetMin,
    zIndex: 2,
  },
  activeLayout: {
    flex: 1,
  },
  activeTimerAnchor: {
    alignItems: "center",
    position: "absolute",
  },
  activeControlsAnchor: {
    alignItems: "center",
    position: "absolute",
  },
  activeTimerBlock: {
    alignItems: "center",
    width: "100%",
  },
  activeControls: {
    alignItems: "center",
    width: "100%",
  },
  activeCategoryLabel: {
    alignSelf: "center",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  activeTime: {
    marginBottom: spacing.xxs,
    marginTop: spacing.xxs,
    textAlign: "center",
  },
  activeSubtitle: {
    color: colors.textFaint,
    marginTop: spacing.xs,
    textAlign: "center",
  },
  primaryWideButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: "rgba(232,230,200,0.24)",
    borderRadius: radii.md,
    borderWidth: 1,
    justifyContent: "center",
    paddingVertical: 14,
    width: "100%",
  },
  ghostAction: {
    marginTop: spacing.sm,
  },
  container: {
    flexGrow: 1,
  },
  heroSurface: {
    alignItems: "center",
    gap: spacing.xs,
    overflow: "hidden",
  },
  heroStarWrap: {
    alignItems: "center",
    alignSelf: "center",
  },
  heroSurfaceCompact: {
    gap: spacing.xxs,
  },
  heroWelcome: {
    textAlign: "center",
  },
  heroStatBlock: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  presetScroller: {
    flexGrow: 1,
    gap: spacing.sm,
    justifyContent: "space-between",
  },
  presetTile: {
    alignItems: "center",
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 2,
    justifyContent: "center",
    minHeight: 58,
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.sm,
  },
  presetTileIdle: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
  },
  presetTileActive: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(232,230,200,0.32)",
  },
  presetTilePressed: {
    opacity: 0.92,
  },
  durationRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  categoryScroller: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  weekStatBlock: {
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
  },
  idleFooter: {
    backgroundColor: "transparent",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  startFocusButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: "rgba(232,230,200,0.28)",
    borderRadius: radii.lg,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: layout.touchTargetMin,
    paddingVertical: spacing.sm,
    width: "100%",
  },
  failedCard: {
    borderColor: "rgba(255,107,157,0.22)",
    gap: spacing.sm,
  },
  softButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    paddingVertical: 12,
  },
});
