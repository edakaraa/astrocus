import React from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { colors, spacing } from "../shared/theme";
import { t } from "../shared/i18n";
import { AVATARS } from "../shared/constants";

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
  } = useAppContext();

  if (!user) {
    return null;
  }

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
      <View style={styles.profileCard}>
        <Text style={styles.avatar}>{user.avatar}</Text>
        <Text style={styles.title}>{user.username}</Text>
        <Text style={styles.subtitle}>{user.galaxyName}</Text>
      </View>

      <View style={styles.metricRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>{t(language, "currentStreak")}</Text>
          <Text style={styles.metricValue}>{user.currentStreak}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>{t(language, "longestStreak")}</Text>
          <Text style={styles.metricValue}>{user.longestStreak}</Text>
        </View>
      </View>

      <View style={styles.metricCard}>
        <Text style={styles.metricLabel}>{t(language, "totalStardust")}</Text>
        <Text style={styles.metricValue}>{user.totalStardust}</Text>
        <Text style={styles.metricSubLabel}>{`${dailySummary.totalMinutes} ${t(language, "minutes")} bugun`}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(language, "language")}</Text>
        <View style={styles.metricRow}>
          {(["tr", "en"] as const).map((item) => (
            <Pressable
              accessibilityRole="button"
              key={item}
              style={[styles.selector, language === item ? styles.selectorActive : null]}
              onPress={() => setLanguage(item)}
            >
              <Text style={styles.selectorText}>{item.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Avatar</Text>
        <View style={styles.metricRow}>
          {AVATARS.map((avatar) => (
            <Pressable
              accessibilityRole="button"
              key={avatar}
              style={[styles.selector, user.avatar === avatar ? styles.selectorActive : null]}
              onPress={() => updateProfile({ avatar })}
            >
              <Text style={styles.selectorText}>{avatar}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={handleSync}>
        <Text style={styles.primaryButtonText}>{`${t(language, "syncOffline")} (${pendingSessions.length})`}</Text>
      </Pressable>

      <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={signOut}>
        <Text style={styles.secondaryButtonText}>{t(language, "signOut")}</Text>
      </Pressable>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.md,
    padding: spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
  },
  avatar: {
    fontSize: 52,
    marginBottom: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
  },
  subtitle: {
    color: colors.textMuted,
  },
  metricRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  metricCard: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    flex: 1,
    padding: spacing.lg,
  },
  metricLabel: {
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  metricValue: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "800",
  },
  metricSubLabel: {
    color: colors.primary,
    marginTop: spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  selector: {
    alignItems: "center",
    backgroundColor: colors.chip,
    borderRadius: 16,
    flex: 1,
    paddingVertical: spacing.md,
  },
  selectorActive: {
    backgroundColor: colors.primaryStrong,
  },
  selectorText: {
    color: colors.text,
    fontWeight: "700",
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primaryStrong,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  primaryButtonText: {
    color: colors.background,
    fontWeight: "700",
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderRadius: 16,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
});
