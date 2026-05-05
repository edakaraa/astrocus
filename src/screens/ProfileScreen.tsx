import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { colors, fontFamilies, radii, spacing, typography } from "../shared/theme";
import { t } from "../shared/i18n";
import { AVATARS } from "../shared/constants";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { SurfaceCard } from "../components/SurfaceCard";
import { GradientButton } from "../components/GradientButton";

export const ProfileScreen = () => {
  const {
    dailySummary,
    language,
    pendingSessions,
    setLanguage,
    signOut,
    syncOfflineSessions,
    updateProfile,
    user,
    unlockedStarIds,
    categories,
  } = useAppContext();

  if (!user) {
    return null;
  }

  const goalProgress = user.dailyGoalMinutes > 0 ? Math.min(dailySummary.totalMinutes / user.dailyGoalMinutes, 1) : 0;

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
      <StarfieldBackground density={22} />

      <View style={styles.header}>
        <View style={styles.headerNebula} pointerEvents="none" />
        <View style={styles.profileRow}>
          <View style={styles.avatarShell}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{`@${user.username}`}</Text>
            <Text style={styles.galaxy}>{`✦ ${user.galaxyName}`}</Text>
          </View>
        </View>

        <View style={styles.headerStats}>
          <View style={styles.pstat}>
            <Text style={styles.pstatVal}>{unlockedStarIds.length}</Text>
            <Text style={styles.pstatLabel}>Yıldız Açık</Text>
          </View>
          <View style={styles.pstat}>
            <Text style={[styles.pstatVal, { color: colors.danger }]}>{`🔥 ${user.currentStreak}`}</Text>
            <Text style={styles.pstatLabel}>Günlük Seri</Text>
          </View>
          <View style={styles.pstat}>
            <Text style={[styles.pstatVal, { fontSize: 16, color: colors.periwinkle }]}>{user.totalStardust.toLocaleString()}</Text>
            <Text style={styles.pstatLabel}>Yıldız Tozu</Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Bugün</Text>
      <SurfaceCard style={styles.dailyCard}>
        <Text style={styles.dailyTotal}>{`🎯 ${dailySummary.totalMinutes} dk odaklandın`}</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${Math.round(goalProgress * 100)}%` }]} />
        </View>
        <Text style={styles.progressLabel}>
          {`Günlük hedefe %${Math.round(goalProgress * 100)} ulaşıldı · ${Math.round(user.dailyGoalMinutes / 60)} saat hedef`}
        </Text>

        {dailySummary.categoryBreakdown.slice(0, 3).map((item) => {
          const category = categories.find((c) => c.id === item.categoryId);
          const ratio = dailySummary.totalMinutes > 0 ? item.minutes / dailySummary.totalMinutes : 0;
          const barColor = item.categoryId === "coding" ? colors.mediumSlateBlue : item.categoryId === "reading" ? colors.celadon : colors.periwinkle;

          return (
            <View key={item.categoryId} style={styles.catRow}>
              <Text style={styles.catIcon}>{category?.emoji ?? "✨"}</Text>
              <Text style={styles.catName}>{t(language, `category_${item.categoryId}` as never)}</Text>
              <Text style={styles.catDur}>{`${item.minutes}dk`}</Text>
              <View style={styles.catBarBg}>
                <View style={[styles.catBarFill, { width: `${Math.round(ratio * 100)}%`, backgroundColor: barColor }]} />
              </View>
            </View>
          );
        })}
      </SurfaceCard>

      <Text style={styles.sectionTitle}>Seri</Text>
      <SurfaceCard style={styles.streakCard} borderVariant="strong">
        <Text style={styles.streakIcon}>🔥</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.streakCount}>{`${user.currentStreak} Gün!`}</Text>
          <Text style={styles.streakLabel}>{`En uzun: ${user.longestStreak} gün`}</Text>
        </View>
      </SurfaceCard>

      <Text style={styles.sectionTitle}>{t(language, "language")}</Text>
      <View style={styles.selectorRow}>
        {(["tr", "en"] as const).map((item) => (
          <Pressable
            accessibilityRole="button"
            key={item}
            style={[styles.selector, language === item ? styles.selectorActive : null]}
            onPress={() => setLanguage(item)}
          >
            <Text style={[styles.selectorText, language === item ? styles.selectorTextActive : null]}>{item.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Avatar</Text>
      <View style={styles.selectorRow}>
        {AVATARS.map((avatar) => (
          <Pressable
            accessibilityRole="button"
            key={avatar}
            style={[styles.selector, user.avatar === avatar ? styles.selectorActive : null]}
            onPress={() => updateProfile({ avatar })}
          >
            <Text style={[styles.selectorText, user.avatar === avatar ? styles.selectorTextActive : null]}>{avatar}</Text>
          </Pressable>
        ))}
      </View>

      <GradientButton
        label={`${t(language, "syncOffline")} (${pendingSessions.length})`}
        onPress={handleSync}
      />

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
    paddingTop: 0,
    paddingBottom: 28,
  },
  header: {
    paddingTop: 56,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(179, 191, 255, 0.10)",
    backgroundColor: "rgba(13, 11, 43, 0.75)",
    overflow: "hidden",
  },
  headerNebula: {
    position: "absolute",
    top: -40,
    right: -30,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(88, 102, 255, 0.12)",
  },
  profileRow: { flexDirection: "row", alignItems: "center", gap: 14, marginBottom: spacing.md },
  avatarShell: {
    width: 60,
    height: 60,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(88, 102, 255, 0.22)",
    borderWidth: 2,
    borderColor: "rgba(179, 191, 255, 0.30)",
  },
  avatarText: { fontSize: 28 },
  username: { ...typography.h3, color: colors.text },
  galaxy: { marginTop: 2, color: colors.textMuted, fontSize: 12 },
  headerStats: { flexDirection: "row", gap: 8 },
  pstat: {
    flex: 1,
    backgroundColor: "rgba(7, 5, 26, 0.55)",
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.08)",
    borderRadius: radii.sm,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  pstatVal: { fontSize: 20, fontWeight: "800", color: colors.text },
  pstatLabel: { marginTop: 2, fontSize: 9, color: colors.textFaint, textAlign: "center" },
  sectionTitle: {
    paddingHorizontal: spacing.xl,
    paddingTop: 10,
    paddingBottom: 6,
    fontSize: 11,
    fontWeight: "700",
    color: colors.textFaint,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontFamily: fontFamilies.body,
  },
  dailyCard: { marginHorizontal: 16, padding: 16 },
  dailyTotal: { ...typography.h3, color: colors.text, marginBottom: 10 },
  progressBg: {
    height: 6,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "rgba(179, 191, 255, 0.10)",
    marginBottom: 6,
  },
  progressFill: { height: "100%", backgroundColor: colors.mediumSlateBlue, borderRadius: 999 },
  progressLabel: { fontSize: 10, color: colors.textFaint, marginBottom: 14 },
  catRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 },
  catIcon: { width: 20, textAlign: "center", fontSize: 14, color: colors.textMuted },
  catName: { width: 70, color: colors.textMuted, fontSize: 11, fontFamily: fontFamilies.bodyRegular },
  catDur: { width: 42, color: colors.text, fontSize: 11, fontWeight: "800", fontFamily: fontFamilies.monoRegular },
  catBarBg: { flex: 1, height: 4, borderRadius: 999, backgroundColor: "rgba(179, 191, 255, 0.08)", overflow: "hidden" },
  catBarFill: { height: "100%", borderRadius: 999 },
  streakCard: {
    marginHorizontal: 16,
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderColor: "rgba(255, 107, 157, 0.20)",
  },
  streakIcon: { fontSize: 34 },
  streakCount: { fontSize: 26, fontWeight: "900", color: colors.danger, letterSpacing: -0.4 },
  streakLabel: { marginTop: 3, fontSize: 11, color: colors.textMuted },
  selectorRow: { flexDirection: "row", gap: 10, paddingHorizontal: spacing.xl },
  selector: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.10)",
    backgroundColor: "rgba(21, 18, 63, 0.45)",
  },
  selectorActive: {
    backgroundColor: "rgba(88, 102, 255, 0.22)",
    borderColor: "rgba(179, 191, 255, 0.26)",
  },
  selectorText: { color: colors.textMuted, fontWeight: "800" },
  selectorTextActive: { color: colors.text },
  signOutButton: {
    marginTop: 6,
    marginHorizontal: spacing.xl,
    borderRadius: radii.xl,
    paddingVertical: spacing.md,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.10)",
    backgroundColor: "rgba(13, 11, 43, 0.55)",
  },
  signOutText: { color: colors.textMuted, fontWeight: "800" },
});
