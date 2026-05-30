import React, { useCallback } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { useResponsive } from "../shared/responsive";
import { colors, fontFamilies, layout, radii, spacing, typography } from "../shared/theme";
import { t, type TranslationKey } from "../shared/i18n";
import { Logo } from "../components/Logo";
import { UserAvatar } from "../components/UserAvatar";
import { BADGES, getBadgeLabel, PRESET_AVATARS, resolveAvatarId } from "../shared/constants";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { SurfaceCard } from "../components/SurfaceCard";
import { GradientButton } from "../components/GradientButton";
import { CelestialVisual } from "../components/CelestialVisual";
import { StardustPill } from "../components/StardustPill";

export const ProfileScreen = () => {
  const router = useRouter();
  const { contentPadding, tabBarClearance, topInset } = useResponsive();
  const {
    analyticsSummary,
    dailySummary,
    language,
    pendingSessions,
    refreshAnalytics,
    sessions,
    setLanguage,
    logout,
    syncOfflineSessions,
    updateProfile,
    user,
    unlockedStarIds,
    earnedBadgeIds,
  } = useAppContext();

  useFocusEffect(
    useCallback(() => {
      void refreshAnalytics();
      return undefined;
    }, [refreshAnalytics]),
  );

  if (!user) {
    return null;
  }

  const totalFocusedMinutes =
    analyticsSummary?.totalFocusMinutes ?? sessions.reduce((sum, session) => sum + session.durationMinutes, 0);

  const piePreview = analyticsSummary?.categoryDistribution?.slice(0, 3) ?? [];
  const goalProgress = user.dailyGoalMinutes > 0 ? Math.min(dailySummary.totalMinutes / user.dailyGoalMinutes, 1) : 0;
  const earnedSet = new Set(earnedBadgeIds);
  const badgeVariants = ["badge", "star", "planet"] as const;
  const achievements = BADGES.map((badge, index) => {
    const label = getBadgeLabel(badge, language);
    return {
      title: label.name,
      detail: label.description,
      unlocked: earnedSet.has(badge.id),
      variant: badgeVariants[index % badgeVariants.length],
    };
  });

  const handleSync = async () => {
    try {
      await syncOfflineSessions();
      void refreshAnalytics();
      Alert.alert(t(language, "appName"), t(language, "syncSuccess"));
    } catch (error) {
      Alert.alert(
        t(language, "appName"),
        error instanceof Error ? error.message : t(language, "syncFailed"),
      );
    }
  };

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

      {/* Global stardust balance */}
      <View style={styles.profileTopBar}>
        <View style={styles.profileTopBarLeft}>
          <Logo size="sm" accessibilityLabel={t(language, "appName")} />
          <Text style={styles.profileTopBarLabel}>{t(language, "profileTitle")}</Text>
        </View>
        <StardustPill amount={user.totalStardust} />
      </View>

      <View style={styles.heroCard}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(language, "settings")}
          onPress={() => router.push("/legal/privacy-policy")}
          style={styles.settingsButton}
        >
          <MaterialCommunityIcons name="cog-outline" size={18} color={colors.textMuted} />
        </Pressable>
        <View style={styles.heroGlow} pointerEvents="none" />
        <View style={styles.avatarHalo}>
          <CelestialVisual variant="planet" size={124} />
          <View style={styles.avatarShell}>
            <UserAvatar avatar={user.avatar} size={52} />
          </View>
        </View>
        <Text style={styles.username}>{user.username || t(language, "explorerName")}</Text>
        <Text style={styles.galaxy}>{`${t(language, "profileTotalStardust")}: ${formatNumber(language, user.totalStardust)} ✦`}</Text>

        <View style={styles.headerStats}>
          <View style={styles.pstat}>
            <Text style={styles.pstatVal}>{formatDuration(language, totalFocusedMinutes)}</Text>
            <Text style={styles.pstatLabel}>{t(language, "totalFocus")}</Text>
          </View>
          <View style={styles.pstat}>
            <Text style={styles.pstatVal}>{formatNumber(language, sessions.length)}</Text>
            <Text style={styles.pstatLabel}>{t(language, "totalSessions")}</Text>
          </View>
          <View style={styles.pstat}>
            <Text style={styles.pstatVal}>{formatNumber(language, analyticsSummary?.streakCount ?? user.currentStreak)}</Text>
            <Text style={styles.pstatLabel}>{t(language, "currentStreak")}</Text>
          </View>
        </View>
      </View>

      <SurfaceCard style={styles.progressCard} borderVariant="strong">
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.cardLabel}>{t(language, "todayProgress")}</Text>
            <Text style={styles.cardTitle}>{formatDuration(language, dailySummary.totalMinutes)}</Text>
          </View>
          <Text style={styles.progressPercent}>{`%${Math.round(goalProgress * 100)}`}</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.round(goalProgress * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{`${formatDuration(language, user.dailyGoalMinutes)} ${t(language, "dailyGoal")} · ${dailySummary.completedSessions} ${t(language, "sessionsToday")}`}</Text>
      </SurfaceCard>

      {piePreview.length > 0 ? (
        <SurfaceCard style={styles.distributionCard}>
          <Text style={styles.cardLabel}>{t(language, "categoryDistribution")}</Text>
          {piePreview.map((row) => (
            <Text key={row.categoryId} style={styles.distributionRow}>
              {`${t(language, `category_${row.categoryId}` as never)} · ${formatDuration(language, row.minutes)} (${row.percentage}%)`}
            </Text>
          ))}
        </SurfaceCard>
      ) : null}

      <View style={styles.listCard}>
        <View style={styles.listItem}>
          <View style={styles.listIcon}>
            <MaterialCommunityIcons name="medal-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.listText}>{t(language, "badges")}</Text>
          <Text style={styles.listMeta}>{`${achievements.filter((item) => item.unlocked).length} / ${achievements.length}`}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(language, "myConstellation")}
          onPress={() => router.push("/(tabs)/galaxy")}
          style={styles.listItem}
        >
          <View style={styles.listIcon}>
            <MaterialCommunityIcons name="star-four-points-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.listText}>{t(language, "myConstellation")}</Text>
          <Text style={styles.listMeta}>{`${unlockedStarIds.length} ${t(language, "starsUnlocked")}`}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textFaint} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(language, "privacyPolicy")}
          onPress={() => router.push("/legal/privacy-policy")}
          style={styles.listItem}
        >
          <View style={styles.listIcon}>
            <MaterialCommunityIcons name="cog-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.listText}>{t(language, "settingsRow")}</Text>
          <Text style={styles.listMeta}>{t(language, "settingsPrivacy")}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textFaint} />
        </Pressable>
      </View>

      <View style={styles.sectionTop}>
        <Text style={styles.sectionTitle}>{t(language, "badges")}</Text>
        <Text style={styles.sectionMeta}>{`${achievements.filter((item) => item.unlocked).length}/${achievements.length}`}</Text>
      </View>

      <View style={styles.badgeGrid}>
        {achievements.map((achievement) => (
          <View key={achievement.title} style={[styles.badgeCard, !achievement.unlocked ? styles.badgeCardLocked : null]}>
            <CelestialVisual variant={achievement.variant} size={68} muted={!achievement.unlocked} />
            <Text style={styles.badgeTitle}>{achievement.title}</Text>
            <Text style={styles.badgeDetail}>{achievement.unlocked ? t(language, "badgeUnlocked") : achievement.detail}</Text>
            {!achievement.unlocked ? (
              <View style={styles.badgeLock}>
                <MaterialCommunityIcons name="lock-outline" size={12} color={colors.textFaint} />
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.sectionTop}>
        <Text style={styles.sectionTitle}>{t(language, "settings")}</Text>
      </View>

      <SurfaceCard style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>{t(language, "language")}</Text>
            <Text style={styles.settingSubtitle}>{t(language, "appLanguageSubtitle")}</Text>
          </View>
          <View style={styles.languageSelector}>
            {(["tr", "en"] as const).map((item) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${t(language, "selectLanguageA11y")} ${item.toUpperCase()}`}
                key={item}
                style={[styles.languageChip, language === item ? styles.languageChipActive : null]}
                onPress={() => setLanguage(item)}
              >
                <Text style={[styles.languageText, language === item ? styles.languageTextActive : null]}>{item.toUpperCase()}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.settingBlock}>
          <Text style={styles.settingTitle}>{t(language, "avatar")}</Text>
          <Text style={styles.settingSubtitle}>{t(language, "avatarSwipeHint")}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.avatarScrollContent}
            style={styles.avatarScroll}
          >
            {PRESET_AVATARS.map((preset) => {
              const selected = resolveAvatarId(user.avatar) === preset.id;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`${t(language, preset.labelKey as TranslationKey)} ${t(language, "selectAvatarA11y")}`}
                  key={preset.id}
                  style={[styles.avatarOption, selected ? styles.avatarOptionActive : null]}
                  onPress={() => updateProfile({ avatar: preset.id })}
                >
                  <UserAvatar avatar={preset.id} size={52} style={styles.avatarOptionImage} />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>{t(language, "offlineSessions")}</Text>
            <Text style={styles.settingSubtitle}>{`${formatNumber(language, pendingSessions.length)} ${t(language, "pendingRecords")}`}</Text>
          </View>
          <GradientButton
            label={t(language, "syncNow")}
            onPress={handleSync}
            variant="soft"
            style={styles.syncButton}
            accessibilityLabel={t(language, "syncOffline")}
          />
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.legalColumn}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "privacyPolicy")}
            onPress={() => router.push("/legal/privacy-policy")}
          >
            <Text style={styles.legalLink}>{t(language, "privacyPolicy")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "openSourceCredits")}
            onPress={() => router.push("/legal/acknowledgments")}
          >
            <Text style={styles.legalLinkMuted}>{t(language, "openSourceCredits")}</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "deleteAccount")}
            onPress={() => router.push("/legal/delete-account")}
          >
            <Text style={styles.legalDanger}>{t(language, "deleteAccount")}</Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <Pressable accessibilityRole="button" style={styles.signOutButton} onPress={logout}>
        <Text style={styles.signOutText}>{t(language, "signOut")}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.md,
  },
  profileTopBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    maxHeight: layout.topBarMaxHeight,
    paddingBottom: spacing.xxs,
  },
  profileTopBarLeft: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  profileTopBarLabel: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  heroCard: {
    alignItems: "center",
    backgroundColor: "rgba(5, 7, 23, 0.78)",
    borderColor: colors.border,
    borderRadius: 28,
    borderWidth: 1,
    overflow: "hidden",
    padding: spacing.lg,
    position: "relative",
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    height: layout.touchTargetMin,
    justifyContent: "center",
    position: "absolute",
    left: spacing.sm,
    top: spacing.sm,
    width: layout.touchTargetMin,
  },
  heroGlow: {
    backgroundColor: "rgba(131,135,195,0.12)",
    borderRadius: 999,
    height: 220,
    position: "absolute",
    top: -50,
    width: 220,
  },
  avatarHalo: {
    alignItems: "center",
    height: 126,
    justifyContent: "center",
    marginBottom: spacing.sm,
    width: 126,
  },
  avatarShell: {
    alignItems: "center",
    backgroundColor: "rgba(5,7,23,0.78)",
    borderColor: "rgba(232,230,200,0.24)",
    borderRadius: 999,
    borderWidth: 1,
    height: 58,
    justifyContent: "center",
    position: "absolute",
    width: 58,
  },
  username: {
    ...typography.h2,
    color: colors.text,
  },
  galaxy: {
    color: colors.textMuted,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    marginTop: 4,
  },
  headerStats: {
    flexDirection: "row",
    gap: 8,
    marginTop: spacing.lg,
    width: "100%",
  },
  pstat: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  pstatVal: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 15,
    fontWeight: "800",
  },
  pstatLabel: {
    color: colors.textFaint,
    fontSize: 9,
    marginTop: 4,
    textAlign: "center",
  },
  progressCard: {
    gap: spacing.sm,
  },
  distributionCard: {
    gap: 6,
  },
  distributionRow: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  cardTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  cardTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 24,
    fontWeight: "800",
    marginTop: 3,
  },
  progressPercent: {
    color: colors.primary,
    fontFamily: fontFamilies.mono,
    fontSize: 20,
    fontWeight: "800",
  },
  progressBg: {
    backgroundColor: "rgba(149,155,181,0.12)",
    borderRadius: 999,
    height: 7,
    overflow: "hidden",
  },
  progressFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: "100%",
  },
  progressLabel: {
    color: colors.textFaint,
    fontSize: 11,
  },
  listCard: {
    backgroundColor: "rgba(13, 11, 43, 0.88)",
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  listItem: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 15,
  },
  listIcon: {
    alignItems: "center",
    backgroundColor: "rgba(131,135,195,0.14)",
    borderRadius: radii.pill,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  listText: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
  },
  listMeta: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: "700",
  },
  sectionTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 17,
    fontWeight: "800",
  },
  sectionMeta: {
    color: colors.textFaint,
    fontFamily: fontFamilies.monoRegular,
    fontSize: 12,
  },
  badgeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  badgeCard: {
    alignItems: "center",
    backgroundColor: "rgba(13, 11, 43, 0.88)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: 132,
    padding: 10,
    position: "relative",
    width: "31.7%",
  },
  badgeCardLocked: {
    opacity: 0.68,
  },
  badgeTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
  },
  badgeDetail: {
    color: colors.textFaint,
    fontSize: 9,
    marginTop: 3,
    textAlign: "center",
  },
  badgeLock: {
    alignItems: "center",
    backgroundColor: "rgba(5,7,23,0.7)",
    borderRadius: radii.pill,
    height: 22,
    justifyContent: "center",
    position: "absolute",
    right: 7,
    top: 7,
    width: 22,
  },
  settingsCard: {
    gap: spacing.md,
  },
  settingRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  settingBlock: {
    gap: spacing.sm,
  },
  settingTitle: {
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
  },
  settingSubtitle: {
    color: colors.textFaint,
    fontSize: 11,
    marginTop: 3,
  },
  settingDivider: {
    backgroundColor: colors.border,
    height: 1,
  },
  languageSelector: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 3,
  },
  languageChip: {
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  languageChipActive: {
    backgroundColor: colors.primary,
  },
  languageText: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: "800",
  },
  languageTextActive: {
    color: colors.warmOffWhite,
  },
  avatarScroll: {
    marginHorizontal: -4,
    marginTop: spacing.sm,
  },
  avatarScrollContent: {
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  avatarOption: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 64,
    justifyContent: "center",
    width: 64,
  },
  avatarOptionActive: {
    backgroundColor: "rgba(131,135,195,0.22)",
    borderColor: colors.primary,
    borderWidth: 2,
  },
  avatarOptionImage: {
    borderWidth: 0,
  },
  syncButton: {
    minWidth: 78,
  },
  legalColumn: {
    gap: spacing.sm,
  },
  legalLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
  },
  legalLinkMuted: {
    color: colors.textFaint,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 12,
  },
  legalDanger: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "700",
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: "rgba(13, 11, 43, 0.72)",
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    paddingVertical: spacing.md,
  },
  signOutText: { color: colors.textMuted, fontWeight: "800" },
});
