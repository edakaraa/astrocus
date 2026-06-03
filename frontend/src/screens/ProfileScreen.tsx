import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import BottomSheet from "@gorhom/bottom-sheet";
import { useAppContext } from "../context/AppContext";
import { useResponsive } from "../shared/responsive";
import { t } from "../shared/i18n";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { BADGES, getBadgeLabel } from "../shared/constants";
import { getCategoryChartColor } from "../constants/categoryChartColors";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { asyncStorage } from "../shared/storage";
import { getDateKey } from "../context/session/dateKey";
import { UserAvatar } from "../components/UserAvatar";
import { StarryBackground } from "../components/StarryBackground";
import { ScreenContentColumn } from "../components/ScreenContentColumn";
import { WeeklyReportModal } from "../components/WeeklyReportModal";
import { useWeeklyReport } from "../hooks/useWeeklyReport";
import { Card } from "../components/ui/Card";
import { AppText } from "../components/ui/AppText";
import { TabScreenTopBar } from "../components/layout/TabScreenTopBar";
import { StatBox } from "../components/profile/StatBox";
import { DailyGoalCard } from "../components/profile/DailyGoalCard";
import { CategoryDistribution } from "../components/profile/CategoryDistribution";
import { ProfileNavRow } from "../components/profile/ProfileNavRow";
import { GoalSheet } from "../components/profile/GoalSheet";
import { GradientButton } from "../components/GradientButton";
import theme from "../theme";

export const ProfileScreen = () => {
  const router = useRouter();
  const { tabBarClearance } = useResponsive();
  const goalSheetRef = useRef<BottomSheet>(null);
  const {
    analyticsSummary,
    dailySummary,
    language,
    refreshAnalytics,
    sessions,
    updateProfile,
    user,
    earnedBadgeIds,
    unlockedStarIds,
  } = useAppContext();

  const [weeklyReportOpen, setWeeklyReportOpen] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(0);

  const {
    report: weeklyReport,
    reportText: weeklyReportText,
    loading: weeklyReportLoading,
    refetch: refetchWeeklyReport,
  } = useWeeklyReport(user?.id, language);

  useFocusEffect(
    useCallback(() => {
      void refreshAnalytics();
      void refetchWeeklyReport();
      return undefined;
    }, [refreshAnalytics, refetchWeeklyReport]),
  );

  useEffect(() => {
    if (!user) {
      return;
    }
    const loadGoal = async () => {
      const stored = await asyncStorage.get(STORAGE_KEYS.dailyGoalMinutes, user.dailyGoalMinutes);
      setGoalMinutes(stored > 0 ? stored : user.dailyGoalMinutes);
    };
    void loadGoal();
  }, [user]);

  const handleGoalSaved = useCallback(
    async (minutes: number) => {
      setGoalMinutes(minutes);
      await updateProfile({ dailyGoalMinutes: minutes });
    },
    [updateProfile],
  );

  const handleGoalReached = useCallback(async () => {
    if (!user) {
      return;
    }
    const todayKey = getDateKey(new Date().toISOString());
    const lastReward = await asyncStorage.get(STORAGE_KEYS.dailyGoalRewardDate, "");
    if (lastReward === todayKey) {
      return;
    }
    await asyncStorage.set(STORAGE_KEYS.dailyGoalRewardDate, todayKey);
    await updateProfile({
      totalStardust: user.totalStardust + theme.layout.dailyGoalStardustReward,
    });
  }, [updateProfile, user]);

  const categoryRows = useMemo(() => {
    const rows = analyticsSummary?.categoryDistribution ?? [];
    return rows.map((row) => ({
      name: t(language, `category_${row.categoryId}` as never),
      minutes: row.minutes,
      color: getCategoryChartColor(row.categoryId),
      percentage: row.percentage,
    }));
  }, [analyticsSummary?.categoryDistribution, language]);

  if (!user) {
    return null;
  }

  const totalFocusedMinutes =
    analyticsSummary?.totalFocusMinutes ?? sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const earnedSet = new Set(earnedBadgeIds);
  const unlockedBadgeCount = BADGES.filter((b) => earnedSet.has(b.id)).length;

  return (
    <StarryBackground>
      <TabScreenTopBar
        stardustAmount={user.totalStardust}
        showSettings
        settingsAccessibilityLabel={t(language, "settings")}
        onSettingsPress={() => router.push("/settings")}
      />
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingBottom: tabBarClearance,
            paddingTop: theme.layout.topBarBottomGap,
          },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenContentColumn style={styles.column}>
          <Card radius={theme.radii.xl} style={styles.profileCard}>
            <View style={styles.avatarWrap}>
              <View style={styles.avatarRing}>
                <UserAvatar avatar={user.avatar} size={theme.layout.avatarSize} />
              </View>
            </View>
            <AppText variant="title" style={styles.username}>
              {user.username || t(language, "explorerName")}
            </AppText>
            <AppText variant="caption" style={styles.stardustLine}>
              {`${t(language, "profileTotalStardust")}: ${formatNumber(language, user.totalStardust)} ✦`}
            </AppText>
            <View style={styles.statsRow}>
              <StatBox value={formatDuration(language, totalFocusedMinutes)} label={t(language, "totalFocus")} />
              <StatBox value={formatNumber(language, sessions.length)} label={t(language, "totalSessions")} />
              <StatBox
                value={formatNumber(language, analyticsSummary?.streakCount ?? user.currentStreak)}
                label={t(language, "currentStreak")}
              />
            </View>
          </Card>

          <Card style={styles.weeklyCard}>
            <View style={styles.weeklyHeader}>
              <MaterialCommunityIcons name="chart-timeline-variant" size={20} color={theme.colors.accent} />
              <View style={styles.weeklyTitles}>
                <AppText variant="card">{t(language, "weeklyReportTitle")}</AppText>
                <AppText variant="caption">{t(language, "weeklyReportSubtitle")}</AppText>
              </View>
            </View>
            {weeklyReportLoading ? (
              <AppText variant="body">…</AppText>
            ) : weeklyReport && weeklyReportText ? (
              <>
                <AppText variant="body" numberOfLines={3}>
                  {weeklyReportText}
                </AppText>
                <GradientButton
                  label={t(language, "weeklyReportOpen")}
                  onPress={() => setWeeklyReportOpen(true)}
                  variant="soft"
                  accessibilityLabel={t(language, "weeklyReportOpen")}
                />
              </>
            ) : (
              <AppText variant="body" style={styles.italic}>
                {t(language, "weeklyReportEmpty")}
              </AppText>
            )}
          </Card>

          <DailyGoalCard
            goalMinutes={goalMinutes}
            elapsedMinutes={dailySummary.totalMinutes}
            sessionCount={dailySummary.completedSessions}
            onSetGoal={() => goalSheetRef.current?.expand()}
            onGoalReached={() => void handleGoalReached()}
          />

          <CategoryDistribution categories={categoryRows} />

          <Card padding={0} style={styles.navCard}>
            <ProfileNavRow
              icon="medal-outline"
              label={t(language, "badges")}
              meta={`${unlockedBadgeCount} / ${BADGES.length}`}
              accessibilityLabel={t(language, "badges")}
              onPress={() => router.push("/badges")}
            />
            <ProfileNavRow
              icon="star-four-points-outline"
              label={t(language, "myConstellation")}
              meta={`${unlockedStarIds.length} ${t(language, "starsUnlocked")}`}
              accessibilityLabel={t(language, "myConstellation")}
              onPress={() => router.push("/(tabs)/galaxy")}
              isLast
            />
          </Card>
        </ScreenContentColumn>
      </ScrollView>

      <GoalSheet
        ref={goalSheetRef}
        initialMinutes={goalMinutes}
        onSaved={(minutes) => void handleGoalSaved(minutes)}
      />

      <WeeklyReportModal
        visible={weeklyReportOpen}
        report={weeklyReport}
        onClose={() => setWeeklyReportOpen(false)}
      />
    </StarryBackground>
  );
};

const styles = StyleSheet.create({
  scroll: {
    flexGrow: 1,
    width: "100%",
  },
  column: {
    gap: theme.spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    gap: theme.spacing.sm,
  },
  avatarWrap: {
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  avatarRing: {
    borderColor: theme.colors.accent,
    borderRadius: theme.layout.avatarSize,
    borderWidth: theme.layout.avatarRingWidth,
    padding: theme.spacing.xs,
    shadowColor: theme.colors.accent,
    shadowOpacity: theme.layout.avatarGlowOpacity,
    shadowRadius: theme.layout.avatarGlowRadius,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  },
  username: {
    textAlign: "center",
  },
  stardustLine: {
    marginTop: theme.spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: theme.spacing.sm,
    marginTop: theme.spacing.lg,
    width: "100%",
  },
  weeklyCard: {
    gap: theme.spacing.md,
  },
  weeklyHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  weeklyTitles: {
    flex: 1,
    gap: theme.spacing.xs,
  },
  italic: {
    fontStyle: "italic",
  },
  navCard: {
    overflow: "hidden",
  },
});
