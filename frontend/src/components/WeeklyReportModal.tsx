import React from "react";
import { Modal, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAppContext } from "../context/AppContext";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { t } from "../shared/i18n";
import type { WeeklyReport } from "../shared/types";
import { useModalLayout } from "../shared/responsive";
import { colors, radii, spacing } from "../shared/theme";
import { GradientButton } from "./GradientButton";
import { AppText } from "./ui/AppText";
import theme from "../theme";

type WeeklyReportModalProps = {
  visible: boolean;
  report: WeeklyReport | null;
  onClose: () => void;
};

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({ visible, report, onClose }) => {
  const { language } = useAppContext();
  const modal = useModalLayout();

  if (!report) {
    return null;
  }

  const { stats } = report;
  const weekLabel = language === "tr" ? stats.week_label_tr : stats.week_label_en;
  const body = language === "tr" ? report.reportText.tr : report.reportText.en;

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(language, "weeklyReportClose")}
        onPress={onClose}
        style={[styles.backdrop, { paddingHorizontal: modal.horizontalPad }]}
      >
        <Pressable
          accessibilityRole="none"
          onPress={() => {}}
          style={[styles.cardWrap, { maxWidth: modal.cardMaxWidth, width: modal.cardWidth }]}
        >
          <BlurView intensity={42} tint="dark" style={styles.blur}>
            <View style={styles.glassTint} />
            <View style={styles.content}>
              <View style={styles.header}>
                <View style={styles.headerIcon}>
                  <MaterialCommunityIcons name="chart-timeline-variant" size={22} color={theme.colors.accent} />
                </View>
                <View style={styles.headerText}>
                  <AppText variant="card">{t(language, "weeklyReportTitle")}</AppText>
                  <AppText variant="caption" color={theme.colors.textSecondary}>
                    {weekLabel}
                  </AppText>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t(language, "weeklyReportClose")}
                  onPress={onClose}
                  hitSlop={12}
                  style={styles.closeBtn}
                >
                  <MaterialCommunityIcons name="close" size={22} color={theme.colors.muted} />
                </Pressable>
              </View>

              <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
                <AppText variant="body" color={theme.colors.textPrimary} style={styles.body}>
                  {body}
                </AppText>

                <View style={styles.statsGrid}>
                  <View style={styles.statCell}>
                    <AppText variant="numeric" color={theme.colors.accent}>
                      {formatDuration(language, stats.total_minutes)}
                    </AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>
                      {t(language, "weeklyReportMinutes")}
                    </AppText>
                  </View>
                  <View style={styles.statCell}>
                    <AppText variant="numeric" color={theme.colors.accent}>
                      {formatNumber(language, stats.completed_sessions)}
                    </AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>
                      {t(language, "weeklyReportSessions")}
                    </AppText>
                  </View>
                  <View style={styles.statCell}>
                    <AppText variant="numeric" color={theme.colors.accent}>
                      {formatNumber(language, stats.goal_met_days)}
                    </AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>
                      {t(language, "weeklyReportGoalDays")}
                    </AppText>
                  </View>
                  <View style={styles.statCell}>
                    <AppText variant="numeric" color={theme.colors.accent}>
                      {formatNumber(language, stats.current_streak)}
                    </AppText>
                    <AppText variant="caption" color={theme.colors.textSecondary}>
                      {t(language, "weeklyReportStreak")}
                    </AppText>
                  </View>
                </View>

                {report.fallbackUsed ? (
                  <AppText variant="caption" color={theme.colors.muted} style={styles.fallbackNote}>
                    {t(language, "weeklyReportFallbackNote")}
                  </AppText>
                ) : null}
              </ScrollView>

              <GradientButton label={t(language, "weeklyReportClose")} onPress={onClose} fullWidth />
            </View>
          </BlurView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(5, 8, 18, 0.62)",
    flex: 1,
    justifyContent: "center",
  },
  cardWrap: {
    alignSelf: "center",
    borderColor: colors.borderStrong,
    borderRadius: radii.xl,
    borderWidth: 1,
    maxHeight: "85%",
    overflow: "hidden",
  },
  blur: {
    borderRadius: radii.xl,
    overflow: "hidden",
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(10, 17, 35, 0.55)",
  },
  content: {
    gap: spacing.md,
    padding: spacing.lg,
  },
  header: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerIcon: {
    alignItems: "center",
    backgroundColor: "rgba(131,135,195,0.18)",
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  closeBtn: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  scroll: {
    maxHeight: 360,
  },
  body: {
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
    backgroundColor: theme.colors.overlay,
    borderColor: theme.colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    gap: 2,
    padding: spacing.sm,
    width: "47%",
  },
  fallbackNote: {
    fontStyle: "italic",
  },
});
