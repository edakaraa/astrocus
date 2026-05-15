import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { colors, fontFamilies, radii, spacing, typography } from "../shared/theme";
import { t } from "../shared/i18n";
import { AVATARS } from "../shared/constants";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { SurfaceCard } from "../components/SurfaceCard";
import { GradientButton } from "../components/GradientButton";
import { CelestialVisual } from "../components/CelestialVisual";

const formatMinutes = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} dk`;
  }

  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}s` : `${hours}s ${remainder}dk`;
};

export const ProfileScreen = () => {
  const router = useRouter();
  const {
    dailySummary,
    language,
    pendingSessions,
    sessions,
    setLanguage,
    signOut,
    syncOfflineSessions,
    updateProfile,
    user,
    unlockedStarIds,
  } = useAppContext();

  if (!user) {
    return null;
  }

  const goalProgress = user.dailyGoalMinutes > 0 ? Math.min(dailySummary.totalMinutes / user.dailyGoalMinutes, 1) : 0;
  const totalFocusedMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const achievements = [
    { title: "İlk Adım", detail: "İlk yıldızı aç", unlocked: unlockedStarIds.length >= 1, variant: "badge" as const },
    { title: "Odak Ustası", detail: "3 seans tamamla", unlocked: sessions.length >= 3, variant: "star" as const },
    { title: "Gece Kuşu", detail: "7 gün seri", unlocked: user.currentStreak >= 7, variant: "planet" as const },
    { title: "Derin Uzay", detail: "10 saat odak", unlocked: totalFocusedMinutes >= 600, variant: "galaxy" as const },
    { title: "Yıldız Tozu", detail: "1000 ✦ kazan", unlocked: user.totalStardust >= 1000, variant: "badge" as const },
    { title: "Zaman Bükücü", detail: "50 seans", unlocked: sessions.length >= 50, variant: "star" as const },
  ];

  const handleSync = async () => {
    try {
      await syncOfflineSessions();
      Alert.alert("Astrocus", "Offline seanslar senkronize edildi.");
    } catch (error) {
      Alert.alert("Astrocus", error instanceof Error ? error.message : "Sync failed");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={34} />

      <View style={styles.heroCard}>
        <View style={styles.settingsButton}>
          <MaterialCommunityIcons name="cog-outline" size={18} color={colors.textMuted} />
        </View>
        <View style={styles.heroGlow} pointerEvents="none" />
        <View style={styles.avatarHalo}>
          <CelestialVisual variant="planet" size={124} />
          <View style={styles.avatarShell}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
        </View>
        <Text style={styles.username}>{user.username || "Kaşif"}</Text>
        <Text style={styles.galaxy}>{`Seviye ${Math.max(unlockedStarIds.length, 1)} · ${user.totalStardust.toLocaleString()} XP`}</Text>

        <View style={styles.headerStats}>
          <View style={styles.pstat}>
            <Text style={styles.pstatVal}>{formatMinutes(totalFocusedMinutes)}</Text>
            <Text style={styles.pstatLabel}>Toplam Odak</Text>
          </View>
          <View style={styles.pstat}>
            <Text style={styles.pstatVal}>{sessions.length}</Text>
            <Text style={styles.pstatLabel}>Seans</Text>
          </View>
          <View style={styles.pstat}>
            <Text style={styles.pstatVal}>{user.currentStreak}</Text>
            <Text style={styles.pstatLabel}>Gün Seri</Text>
          </View>
        </View>
      </View>

      <SurfaceCard style={styles.progressCard} borderVariant="strong">
        <View style={styles.cardTop}>
          <View>
            <Text style={styles.cardLabel}>Bugünkü İlerleme</Text>
            <Text style={styles.cardTitle}>{formatMinutes(dailySummary.totalMinutes)}</Text>
          </View>
          <Text style={styles.progressPercent}>{`%${Math.round(goalProgress * 100)}`}</Text>
        </View>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.round(goalProgress * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>{`${formatMinutes(user.dailyGoalMinutes)} günlük hedef · ${dailySummary.completedSessions} seans bugün`}</Text>
      </SurfaceCard>

      <View style={styles.listCard}>
        <View style={styles.listItem}>
          <View style={styles.listIcon}>
            <MaterialCommunityIcons name="medal-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.listText}>Rozetler</Text>
          <Text style={styles.listMeta}>{`${achievements.filter((item) => item.unlocked).length} / ${achievements.length}`}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textFaint} />
        </View>

        <View style={styles.listItem}>
          <View style={styles.listIcon}>
            <MaterialCommunityIcons name="star-four-points-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.listText}>Takımyıldızım</Text>
          <Text style={styles.listMeta}>{`${unlockedStarIds.length} yıldız`}</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textFaint} />
        </View>

        <View style={styles.listItem}>
          <View style={styles.listIcon}>
            <MaterialCommunityIcons name="cog-outline" size={18} color={colors.primary} />
          </View>
          <Text style={styles.listText}>Ayarlar</Text>
          <Text style={styles.listMeta}>Profil</Text>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textFaint} />
        </View>
      </View>

      <View style={styles.sectionTop}>
        <Text style={styles.sectionTitle}>Rozetler</Text>
        <Text style={styles.sectionMeta}>{`${achievements.filter((item) => item.unlocked).length}/${achievements.length}`}</Text>
      </View>

      <View style={styles.badgeGrid}>
        {achievements.map((achievement) => (
          <View key={achievement.title} style={[styles.badgeCard, !achievement.unlocked ? styles.badgeCardLocked : null]}>
            <CelestialVisual variant={achievement.variant} size={68} muted={!achievement.unlocked} />
            <Text style={styles.badgeTitle}>{achievement.title}</Text>
            <Text style={styles.badgeDetail}>{achievement.unlocked ? "Açık" : achievement.detail}</Text>
            {!achievement.unlocked ? (
              <View style={styles.badgeLock}>
                <MaterialCommunityIcons name="lock-outline" size={12} color={colors.textFaint} />
              </View>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.sectionTop}>
        <Text style={styles.sectionTitle}>Ayarlar</Text>
      </View>

      <SurfaceCard style={styles.settingsCard}>
        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Dil</Text>
            <Text style={styles.settingSubtitle}>Uygulama metin dili</Text>
          </View>
          <View style={styles.languageSelector}>
            {(["tr", "en"] as const).map((item) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${item.toUpperCase()} dilini seç`}
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
          <Text style={styles.settingTitle}>Avatar</Text>
          <View style={styles.avatarRow}>
            {AVATARS.map((avatar) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${avatar} avatarını seç`}
                key={avatar}
                style={[styles.avatarOption, user.avatar === avatar ? styles.avatarOptionActive : null]}
                onPress={() => updateProfile({ avatar })}
              >
                <Text style={styles.avatarOptionText}>{avatar}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.settingRow}>
          <View>
            <Text style={styles.settingTitle}>Offline Seanslar</Text>
            <Text style={styles.settingSubtitle}>{`${pendingSessions.length} bekleyen kayıt`}</Text>
          </View>
          <GradientButton
            label="Sync"
            onPress={handleSync}
            variant="soft"
            style={styles.syncButton}
            accessibilityLabel={t(language, "syncOffline")}
          />
        </View>

        <View style={styles.settingDivider} />

        <View style={styles.legalRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={language === "en" ? "Privacy policy" : "Gizlilik politikası"}
            onPress={() => router.push("/legal/privacy-policy")}
          >
            <Text style={styles.legalLink}>
              {language === "en" ? "Privacy Policy" : "Gizlilik Politikası"}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={language === "en" ? "Delete account" : "Hesabı sil"}
            onPress={() => router.push("/legal/delete-account")}
          >
            <Text style={styles.legalDanger}>
              {language === "en" ? "Delete Account" : "Hesabı Sil"}
            </Text>
          </Pressable>
        </View>
      </SurfaceCard>

      <Pressable accessibilityRole="button" style={styles.signOutButton} onPress={signOut}>
        <Text style={styles.signOutText}>{t(language, "signOut")}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.md,
    paddingBottom: 104,
    paddingTop: 44,
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
    height: 34,
    justifyContent: "center",
    position: "absolute",
    left: 14,
    top: 14,
    width: 34,
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
  avatarText: { fontSize: 27 },
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
  avatarRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  avatarOption: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  avatarOptionActive: {
    backgroundColor: "rgba(131,135,195,0.2)",
    borderColor: "rgba(232,230,200,0.24)",
  },
  avatarOptionText: {
    fontSize: 20,
  },
  syncButton: {
    minWidth: 78,
  },
  legalRow: {
    gap: spacing.sm,
  },
  legalLink: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "700",
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
