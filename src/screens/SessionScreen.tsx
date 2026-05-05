import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useAppContext } from "../context/AppContext";
import { BACKGROUND_TOLERANCE_SECONDS, PAUSE_LIMIT } from "../shared/constants";
import { t } from "../shared/i18n";
import { colors, fontFamilies, radii, spacing, typography } from "../shared/theme";
import { StarfieldBackground } from "../components/StarfieldBackground";
import { SurfaceCard } from "../components/SurfaceCard";
import { CelebrationModal } from "../components/CelebrationModal";
import { ProgressRing } from "../components/ProgressRing";

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
    unlockedStarIds,
    stars,
  } = useAppContext();

  const actionButton = useMemo(() => {
    if (sessionState.status === "running") {
      return { label: "⏸", onPress: pauseSession, a11y: t(language, "pause") };
    }

    if (sessionState.status === "paused") {
      return { label: "▶", onPress: resumeSession, a11y: t(language, "resume") };
    }

    return { label: "▶", onPress: startSession, a11y: t(language, "startSession") };
  }, [language, pauseSession, resumeSession, sessionState.status, startSession]);

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

  const progressRatio = useMemo(() => {
    const totalSeconds = sessionState.selectedDurationMinutes * 60;
    if (totalSeconds <= 0) {
      return 0;
    }
    return 1 - Math.min(sessionState.remainingSeconds / totalSeconds, 1);
  }, [sessionState.remainingSeconds, sessionState.selectedDurationMinutes]);

  const ringColor = sessionState.status === "running" ? colors.periwinkle : colors.borderStrong;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StarfieldBackground density={28} />

      <View style={styles.topRow}>
        <View style={styles.categoryChip}>
          <Text style={styles.categoryChipText}>{`${selectedCategory.emoji} ${t(language, `category_${selectedCategory.id}` as never)}`}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{`Tolerans: ${BACKGROUND_TOLERANCE_SECONDS}s`}</Text>
        </View>
      </View>

      <SurfaceCard style={styles.timerCard} borderVariant="strong">
        <Text style={styles.galaxyName}>{user?.galaxyName ?? "Astrocus"}</Text>

        <ProgressRing size={240} strokeWidth={3} progress={progressRatio} progressColor={ringColor}>
          <View style={styles.ringCenter}>
            <Text style={styles.timerStar}>⭐</Text>
            <Text style={styles.timerText}>{formatSeconds(sessionState.remainingSeconds)}</Text>
            <Text style={styles.timerLabel}>dakika kaldı</Text>
          </View>
        </ProgressRing>

        <Text style={styles.stardustPreview}>
          {`✦ ~${sessionState.selectedDurationMinutes * 10} ✦ kazanacaksın`}
        </Text>
      </SurfaceCard>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Süre</Text>
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
                styles.categoryOptionChip,
                sessionState.selectedCategoryId === category.id ? styles.chipActive : null,
              ]}
            >
              <Text style={styles.chipText}>{`${category.emoji} ${t(language, `category_${category.id}` as never)}`}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.controls}>
        <Pressable accessibilityRole="button" accessibilityLabel="İstatistikler" style={styles.ctrlSm}>
          <Text style={styles.ctrlText}>📊</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionButton.a11y}
          style={styles.ctrlMain}
          onPress={actionButton.onPress}
        >
          <Text style={styles.ctrlMainText}>{actionButton.label}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t(language, "reset")}
          style={styles.ctrlSm}
          onPress={resetSession}
        >
          <Text style={styles.ctrlText}>↺</Text>
        </Pressable>
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statItem}>{`◎ ${sessionState.pauseCount} ara / ${PAUSE_LIMIT}`}</Text>
        <Text style={styles.statItem}>{`⏱ ${sessionState.selectedDurationMinutes}:00 hedef`}</Text>
        <Text style={styles.statItem}>{`🔥 Seri: ${user?.currentStreak ?? 0}`}</Text>
      </View>

      <SurfaceCard style={styles.summaryCard}>
        <Text style={styles.sectionTitle}>{t(language, "dailySummary")}</Text>
        <Text style={styles.summaryValue}>{`${dailySummary.totalMinutes} dk`}</Text>
        <Text style={styles.summaryMeta}>{`${dailySummary.completedSessions} tamamlanan seans`}</Text>
        <Text style={styles.summaryMeta}>{`Açık yıldız: ${unlockedStarIds.length}`}</Text>
      </SurfaceCard>

      <CelebrationModal
        visible={Boolean(celebration)}
        stardustEarned={celebration?.stardustEarned ?? 0}
        unlockedStarLabel={unlockedStarLabel}
        durationMinutes={sessionState.selectedDurationMinutes}
        currentStreak={user?.currentStreak ?? 0}
        todayTotalMinutes={dailySummary.totalMinutes}
        onClose={dismissCelebration}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    gap: spacing.lg,
    padding: spacing.lg,
    paddingTop: 54,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: "rgba(88, 102, 255, 0.16)",
    borderColor: "rgba(88, 102, 255, 0.30)",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  categoryChipText: {
    color: colors.periwinkle,
    fontSize: 11,
    fontWeight: "700",
  },
  statusPill: {
    backgroundColor: "rgba(21, 18, 63, 0.55)",
    borderColor: "rgba(179, 191, 255, 0.12)",
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  statusText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  timerCard: {
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  galaxyName: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  timerStar: { fontSize: 46, marginBottom: 4 },
  timerText: {
    fontSize: 42,
    fontWeight: "800",
    color: colors.text,
    letterSpacing: -0.6,
    fontFamily: fontFamilies.mono,
  },
  timerLabel: {
    marginTop: 5,
    fontSize: 11,
    color: colors.textFaint,
  },
  stardustPreview: {
    marginTop: 8,
    fontSize: 12,
    color: colors.periwinkle,
    fontWeight: "700",
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
    backgroundColor: "rgba(21, 18, 63, 0.55)",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.10)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryOptionChip: {
    backgroundColor: "rgba(21, 18, 63, 0.55)",
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.10)",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipActive: {
    backgroundColor: "rgba(88, 102, 255, 0.22)",
    borderColor: "rgba(179, 191, 255, 0.24)",
  },
  chipText: {
    color: colors.text,
    fontWeight: "600",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginTop: 2,
  },
  ctrlSm: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(21, 18, 63, 0.55)",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(179, 191, 255, 0.10)",
  },
  ctrlMain: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(21, 18, 63, 0.80)",
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: "rgba(179, 191, 255, 0.25)",
    shadowColor: colors.periwinkle,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  ctrlText: { fontSize: 16, color: colors.textMuted },
  ctrlMainText: { fontSize: 22, color: colors.text },
  statsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  statItem: {
    fontSize: 11,
    color: colors.textFaint,
    fontWeight: "600",
  },
  summaryCard: {
    gap: spacing.sm,
  },
  summaryValue: {
    color: colors.celadon,
    fontSize: 28,
    fontWeight: "800",
  },
  summaryMeta: {
    color: colors.textMuted,
  },
});
