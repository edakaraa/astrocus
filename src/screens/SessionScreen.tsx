import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { BACKGROUND_TOLERANCE_SECONDS, PAUSE_LIMIT } from "../shared/constants";
import { t } from "../shared/i18n";
import { colors, spacing } from "../shared/theme";

const formatSeconds = (seconds: number) => {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
};

export const SessionScreen = () => {
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
    celebration,
    dismissCelebration,
    user,
  } = useAppContext();

  const actionButton = useMemo(() => {
    if (sessionState.status === "running") {
      return { label: t(language, "pause"), onPress: pauseSession };
    }

    if (sessionState.status === "paused") {
      return { label: t(language, "resume"), onPress: resumeSession };
    }

    return { label: t(language, "startSession"), onPress: startSession };
  }, [language, pauseSession, resumeSession, sessionState.status, startSession]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.heroCard}>
        <Text style={styles.heroLabel}>{t(language, "targetStar")}</Text>
        <Text style={styles.heroTitle}>{user?.galaxyName ?? "Astrocus"}</Text>
        <Text style={styles.timer}>{formatSeconds(sessionState.remainingSeconds)}</Text>
        <Text style={styles.helperText}>
          {`AppState + timestamp ile korunan ${BACKGROUND_TOLERANCE_SECONDS} saniyelik tolerans.`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(language, "minutes")}</Text>
        <View style={styles.row}>
          {[15, 25, 45, 60].map((minutes) => (
            <Pressable
              accessibilityRole="button"
              key={minutes}
              onPress={() => setSelectedDurationMinutes(minutes)}
              style={[
                styles.chip,
                sessionState.selectedDurationMinutes === minutes ? styles.chipActive : null,
              ]}
            >
              <Text style={styles.chipText}>{minutes}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t(language, "category")}</Text>
        <View style={styles.rowWrap}>
          {categories.map((category) => (
            <Pressable
              accessibilityRole="button"
              key={category.id}
              onPress={() => setSelectedCategoryId(category.id)}
              style={[
                styles.categoryChip,
                sessionState.selectedCategoryId === category.id ? styles.chipActive : null,
              ]}
            >
              <Text style={styles.chipText}>{`${category.emoji} ${t(language, `category_${category.id}` as never)}`}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable accessibilityRole="button" style={styles.primaryButton} onPress={actionButton.onPress}>
          <Text style={styles.primaryButtonText}>{actionButton.label}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={resetSession}>
          <Text style={styles.secondaryButtonText}>{t(language, "reset")}</Text>
        </Pressable>
      </View>

      <Text style={styles.helperText}>
        {`Tek duraklatma hakkı: ${sessionState.pauseCount}/${PAUSE_LIMIT}`}
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>{t(language, "dailySummary")}</Text>
        <Text style={styles.summaryValue}>{`${dailySummary.totalMinutes} ${t(language, "minutes")}`}</Text>
        <Text style={styles.summaryMeta}>{`${dailySummary.completedSessions} tamamlanan seans`}</Text>
      </View>

      {celebration ? (
        <View style={styles.celebrationCard}>
          <Text style={styles.sectionTitle}>{t(language, "celebrationTitle")}</Text>
          <Text style={styles.celebrationValue}>{`+${celebration.stardustEarned} Stardust`}</Text>
          {celebration.unlockedStarId ? (
            <Text style={styles.summaryMeta}>{t(language, "unlockedStar")}</Text>
          ) : null}
          <Pressable accessibilityRole="button" style={styles.secondaryButton} onPress={dismissCelebration}>
            <Text style={styles.secondaryButtonText}>{t(language, "continue")}</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
  },
  heroCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
  },
  heroLabel: {
    color: colors.textMuted,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "700",
    marginTop: spacing.xs,
  },
  timer: {
    color: colors.primary,
    fontSize: 52,
    fontWeight: "800",
    marginVertical: spacing.md,
  },
  helperText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 20,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  rowWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    backgroundColor: colors.chip,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.chip,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: colors.primaryStrong,
  },
  chipText: {
    color: colors.text,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    gap: spacing.md,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primaryStrong,
    borderRadius: 16,
    flex: 1,
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  secondaryButtonText: {
    color: colors.text,
    fontWeight: "700",
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    gap: spacing.sm,
    padding: spacing.lg,
  },
  summaryValue: {
    color: colors.success,
    fontSize: 28,
    fontWeight: "800",
  },
  summaryMeta: {
    color: colors.textMuted,
  },
  celebrationCard: {
    backgroundColor: colors.surface,
    borderColor: colors.success,
    borderRadius: 20,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg,
  },
  celebrationValue: {
    color: colors.warning,
    fontSize: 32,
    fontWeight: "800",
  },
});
