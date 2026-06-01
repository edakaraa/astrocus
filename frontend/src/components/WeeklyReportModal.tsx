import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { t } from "../shared/i18n";
import type { WeeklyReport } from "../shared/types";
import { colors, radii, spacing, typography } from "../shared/theme";
import { GradientButton } from "./GradientButton";

type WeeklyReportModalProps = {
  visible: boolean;
  report: WeeklyReport | null;
  onClose: () => void;
};

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ visible, report, onClose }) => {
  const { language } = useAppContext();

  if (!report) {
    return null;
  }

  const { stats } = report;
  const weekLabel = language === "tr" ? stats.week_label_tr : stats.week_label_en;
  const body = language === "tr" ? report.reportText.tr : report.reportText.en;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={colors.primary} />
            <View style={styles.headerText}>
              <Text style={styles.title}>{t(language, "weeklyReportTitle")}</Text>
              <Text style={styles.subtitle}>{weekLabel}</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(language, "weeklyReportClose")}
              onPress={onClose}
              hitSlop={12}
            >
              <MaterialCommunityIcons name="close" size={22} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            <Text style={styles.body}>{body}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{formatDuration(language, stats.total_minutes)}</Text>
                <Text style={styles.statLabel}>{t(language, "weeklyReportMinutes")}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{formatNumber(language, stats.completed_sessions)}</Text>
                <Text style={styles.statLabel}>{t(language, "weeklyReportSessions")}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{formatNumber(language, stats.goal_met_days)}</Text>
                <Text style={styles.statLabel}>{t(language, "weeklyReportGoalDays")}</Text>
              </View>
              <View style={styles.statCell}>
                <Text style={styles.statValue}>{formatNumber(language, stats.current_streak)}</Text>
                <Text style={styles.statLabel}>{t(language, "weeklyReportStreak")}</Text>
              </View>
            </View>

            {report.fallbackUsed ? (
              <Text style={styles.fallbackNote}>{t(language, "weeklyReportFallbackNote")}</Text>
            ) : null}
          </ScrollView>

          <GradientButton label={t(language, "weeklyReportClose")} onPress={onClose} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(6, 8, 20, 0.72)",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.lg,
    maxHeight: "85%",
    gap: spacing.md,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.h3,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textMuted,
  },
  scroll: {
    maxHeight: 360,
  },
  body: {
    ...typography.body,
    color: colors.text,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statCell: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    ...typography.h3,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: 2,
  },
  fallbackNote: {
    ...typography.caption,
    color: colors.textFaint,
    fontStyle: "italic",
  },
});
