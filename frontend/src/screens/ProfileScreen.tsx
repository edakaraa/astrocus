import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { useAppContext } from "../context/AppContext";
import { isDevDemoToken } from "../context/auth/devDemo";
import { api } from "../shared/api";
import { t } from "../shared/i18n";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { BADGES } from "../shared/constants";
import { getCategoryChartColor } from "../constants/categoryChartColors";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { asyncStorage } from "../shared/storage";
import { getDateKey } from "../context/session/dateKey";
import { UserAvatar } from "../components/UserAvatar";
import { WeeklyReportModal } from "../components/WeeklyReportModal";
import { useWeeklyReport } from "../hooks/useWeeklyReport";
import { Card } from "../components/ui/Card";
import { WeeklyReportCard } from "../components/WeeklyReportCard";
import { AppText } from "../components/ui/AppText";
import { TabScreenScaffold } from "../components/layout/TabScreenScaffold";
import { StatBox } from "../components/profile/StatBox";
import { DailyGoalCard } from "../components/profile/DailyGoalCard";
import { CategoryDistribution } from "../components/profile/CategoryDistribution";
import { ProfileNavRow } from "../components/profile/ProfileNavRow";
import { loadTodayDailyGoal, saveTodayDailyGoal } from "../lib/dailyGoalStorage";
import theme from "../theme";

export const ProfileScreen = () => {
  const router = useRouter();
  const {
    analyticsSummary,
    dailySummary,
    language,
    refreshAnalytics,
    sessions,
    updateProfile,
    refreshUser,
    token,
    user,
    earnedBadgeIds,
    unlockedStarIds,
  } = useAppContext();

  const [weeklyReportOpen, setWeeklyReportOpen] = useState(false);
  const [goalMinutes, setGoalMinutes] = useState(0);
  const [pickerDefaultMinutes, setPickerDefaultMinutes] = useState<number>(0);

  const {
    report: weeklyReport,
    reportText: weeklyReportText,
    loading: weeklyReportLoading,
    refetch: refetchWeeklyReport,
  } = useWeeklyReport(user?.id, language);

  const refreshTodayGoal = useCallback(async () => {
    if (!user) {
      return;
    }
    const { todayMinutes, pickerDefaultMinutes: defaultMinutes } = await loadTodayDailyGoal(
      user.dailyGoalMinutes,
      token,
    );
    setGoalMinutes(todayMinutes);
    setPickerDefaultMinutes(defaultMinutes);
  }, [token, user]);

  useEffect(() => {
    void refreshTodayGoal();
  }, [refreshTodayGoal]);

  useFocusEffect(
    useCallback(() => {
      void refreshAnalytics();
      void refetchWeeklyReport();
      void refreshTodayGoal();
      return undefined;
    }, [refreshAnalytics, refetchWeeklyReport, refreshTodayGoal]),
  );

  const handleGoalConfirmed = useCallback(
    async (minutes: number) => {
      const saved = await saveTodayDailyGoal(minutes, token);
      setGoalMinutes(saved);
      setPickerDefaultMinutes(saved);
      if (token && !isDevDemoToken(token)) {
        await refreshUser();
      } else {
        await updateProfile({ dailyGoalMinutes: saved });
      }
    },
    [refreshUser, token, updateProfile],
  );

  const handleGoalReached = useCallback(async () => {
    if (!user) {
      return;
    }

    if (token && !isDevDemoToken(token)) {
      try {
        const result = await api.claimDailyGoalReward();
        if (result.claimed) {
          await refreshUser();
        }
      } catch {
        // Server already claimed or goal not met — ignore duplicate toasts.
      }
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
  }, [refreshUser, token, updateProfile, user]);

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
    <TabScreenScaffold
      stardustAmount={user.totalStardust}
      columnStyle={styles.column}
      overlay={
        <WeeklyReportModal
          visible={weeklyReportOpen}
          report={weeklyReport}
          onClose={() => setWeeklyReportOpen(false)}
        />
      }
    >
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
          {`${t(language, "profileTotalStardust")}: `}
          <AppText variant="numericCompact">{formatNumber(language, user.totalStardust)}</AppText>
          {" ✦"}
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

      <WeeklyReportCard
        mode="profile"
        language={language}
        loading={weeklyReportLoading}
        report={weeklyReport}
        reportText={weeklyReportText}
        onOpen={() => setWeeklyReportOpen(true)}
      />

      <DailyGoalCard
        goalMinutes={goalMinutes}
        pickerDefaultMinutes={pickerDefaultMinutes}
        elapsedMinutes={dailySummary.totalMinutes}
        sessionCount={dailySummary.completedSessions}
        onConfirmGoal={(minutes) => void handleGoalConfirmed(minutes)}
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
        />
        <ProfileNavRow
          icon="cog-outline"
          label={t(language, "settings")}
          accessibilityLabel={t(language, "settings")}
          onPress={() => router.push("/settings")}
          isLast
        />
      </Card>
    </TabScreenScaffold>
  );
};

const styles = StyleSheet.create({
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
  navCard: {
    overflow: "hidden",
  },
});
