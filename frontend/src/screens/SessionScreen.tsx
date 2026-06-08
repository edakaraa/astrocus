import React, { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import {
  BACKGROUND_TOLERANCE_SECONDS,
  PAUSE_LIMIT,
} from "../shared/constants";
import { formatTranslation, t, type TranslationKey } from "../shared/i18n";
import { STARDUST_PER_MINUTE } from "../shared/constants";
import type { Language, SessionRecord } from "../shared/types";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { getFocusPresetIcon } from "../shared/appIcons";
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
import { UniverseMessageCard } from "../components/session/UniverseMessageCard";
import { WeekDayStars } from "../components/session/WeekDayStars";
import { AppText } from "../components/ui/AppText";
import { AppIcon } from "../components/ui/AppIcon";
import { PillChip } from "../components/ui/PillChip";
import { UserAvatar } from "../components/UserAvatar";
import { WeeklyReportCard } from "../components/WeeklyReportCard";
import { WeeklyReportModal } from "../components/WeeklyReportModal";
import { useWeeklyReport } from "../hooks/useWeeklyReport";
import theme from "../theme";

/** Recommended durations in the "Duration" section (distinct from quick-start presets). */
const DURATION_OPTIONS = [15, 30, 90, 120] as const;
const QUICK_PRESETS = [
  { titleKey: "presetBreath" as const, minutes: 10 },
  { titleKey: "presetPomodoro" as const, minutes: 25 },
  { titleKey: "presetFlow" as const, minutes: 45 },
  { titleKey: "presetDeep" as const, minutes: 60 },
] as const;
const QUICK_PRESET_MINUTES = QUICK_PRESETS.map((preset) => preset.minutes);

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
    sessions,
    analyticsSummary,
  } = useAppContext();

  const [customDurationOpen, setCustomDurationOpen] = useState(false);
  const [weeklyReportOpen, setWeeklyReportOpen] = useState(false);

  const {
    report: weeklyReport,
    reportText: weeklyReportText,
    weekLabel: weeklyReportWeekLabel,
    loading: weeklyReportLoading,
    refetch: refetchWeeklyReport,
  } = useWeeklyReport(user?.id, language, user?.username);

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

  const selectedDurationMinutes = sessionState.selectedDurationMinutes;
  const hasDurationSelected = selectedDurationMinutes > 0;
  const isCustomDuration =
    hasDurationSelected &&
    !(DURATION_OPTIONS as readonly number[]).includes(selectedDurationMinutes) &&
    !(QUICK_PRESET_MINUTES as readonly number[]).includes(selectedDurationMinutes);

  const focusCategories = useMemo(
    () =>
      FOCUS_CATEGORY_IDS.map((id) => categories.find((c) => c.id === id)).filter(
        (c): c is (typeof categories)[number] => Boolean(c),
      ),
    [categories],
  );

  const heroStarSize = scale(isCompact ? 52 : isShort ? 58 : 64);
  const heroSparkleRadius = scale(6);
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
    if (!hasDurationSelected) {
      void showAlert({
        title: t(language, "selectDurationTitle"),
        message: t(language, "selectDurationMessage"),
        confirmLabel: t(language, "continue"),
      });
      return;
    }
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
          <View style={styles.heroAvatarWrap}>
            <View
              style={[
                styles.heroAvatarSparkle,
                {
                  width: heroStarSize,
                  height: heroStarSize,
                  borderRadius: heroStarSize / 2,
                  shadowRadius: heroSparkleRadius,
                },
              ]}
            >
              <UserAvatar
                avatar={user?.avatar ?? "moon"}
                size={heroStarSize}
                style={styles.heroAvatarBare}
              />
            </View>
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
          <AppText variant="caption" style={styles.stardustHintText} maxFontSizeMultiplier={MAX_FONT_SCALE}>
            {formatTranslation(language, "stardustPerMinute", {
              rate: formatNumber(language, STARDUST_PER_MINUTE),
            })}
          </AppText>
        </SurfaceCard>

        <FocusSectionCard title={t(language, "quickStartTitle")} sectionLabelSize={sectionLabelSize}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.presetScroller, { minWidth: cardInnerWidth }]}
          >
            {QUICK_PRESETS.map((item) => {
              const active = hasDurationSelected && selectedDurationMinutes === item.minutes;
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
                  <AppIcon
                    name={getFocusPresetIcon(item.titleKey)}
                    size={presetTitleSize + 10}
                    color={active ? colors.warmOffWhite : colors.textMuted}
                  />
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.durationScroller}
          >
            <PillChip
              variant="duration"
              style={styles.durationChip}
              label={
                isCustomDuration
                  ? formatDuration(language, selectedDurationMinutes)
                  : t(language, "customDuration")
              }
              active={isCustomDuration}
              accessibilityLabel={t(language, "customDuration")}
              onPress={() => setCustomDurationOpen(true)}
            />
            {DURATION_OPTIONS.map((minutes) => {
              const active = hasDurationSelected && selectedDurationMinutes === minutes;
              return (
                <PillChip
                  key={minutes}
                  variant="duration"
                  style={styles.durationChip}
                  label={formatDuration(language, minutes)}
                  active={active}
                  accessibilityLabel={`${minutes} ${t(language, "selectSessionMinutesA11y")}`}
                  onPress={() => setSelectedDurationMinutes(minutes)}
                />
              );
            })}
          </ScrollView>
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
                  label={t(language, labelKey)}
                  leadingIcon={category.icon}
                  active={active}
                  accessibilityLabel={`${t(language, labelKey)} ${t(language, "selectCategoryA11y")}`}
                  onPress={() => setSelectedCategoryId(category.id)}
                />
              );
            })}
          </ScrollView>
        </FocusSectionCard>

        <UniverseMessageCard language={language} sectionLabelSize={sectionLabelSize} />

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
  },
  heroAvatarWrap: {
    alignItems: "center",
    alignSelf: "center",
  },
  heroAvatarSparkle: {
    alignItems: "center",
    backgroundColor: "transparent",
    justifyContent: "center",
    shadowColor: theme.colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.34,
  },
  heroAvatarBare: {
    backgroundColor: "transparent",
    borderWidth: 0,
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
  stardustHintRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  stardustHintText: {
    color: colors.textMuted,
    textAlign: "center",
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
  durationScroller: {
    gap: spacing.sm,
    paddingRight: spacing.xs,
  },
  durationChip: {
    flexShrink: 0,
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
