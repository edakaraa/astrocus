import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { t } from "../shared/i18n";
import type { Language, WeeklyReportStats } from "../shared/types";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { colors, fontFamilies, radii, screenBlock, spacing, typography } from "../shared/theme";
import { SurfaceCard } from "./SurfaceCard";

type WeeklyReportCardProps = {
  language: Language;
  reportText: string | null;
  weekLabel: string | null;
  stats?: WeeklyReportStats;
  loading: boolean;
  onPress?: () => void;
};

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({
  language,
  reportText,
  weekLabel,
  stats,
  loading,
  onPress,
}) => {
  if (!loading && !reportText) {
    return null;
  }

  const content = (
    <>
      <View style={styles.header}>
        <MaterialCommunityIcons name="chart-timeline-variant" size={20} color={colors.primary} />
        <View style={styles.headerText}>
          <Text style={styles.title}>{t(language, "weeklyReportTitle")}</Text>
          {weekLabel ? <Text style={styles.weekLabel}>{weekLabel}</Text> : null}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <>
          <Text style={styles.body} numberOfLines={4}>
            {reportText}
          </Text>
          {stats ? (
            <View style={styles.statsRow}>
              <Text style={styles.statChip}>
                {formatDuration(language, stats.total_minutes)}
              </Text>
              <Text style={styles.statChip}>
                {`${formatNumber(language, stats.completed_sessions)} ${t(language, "weeklyReportSessions")}`}
              </Text>
            </View>
          ) : null}
          {onPress ? (
            <Text style={styles.cta}>{t(language, "weeklyReportOpen")}</Text>
          ) : null}
        </>
      )}
    </>
  );

  if (onPress && !loading) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(language, "weeklyReportOpen")}
        onPress={onPress}
      >
        <SurfaceCard contentPadding={spacing.md} style={[screenBlock, styles.card]} borderVariant="strong">
          {content}
        </SurfaceCard>
      </Pressable>
    );
  }

  return (
    <SurfaceCard contentPadding={spacing.md} style={[screenBlock, styles.card]} borderVariant="strong">
      {content}
    </SurfaceCard>
  );
};

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  weekLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  loader: {
    marginVertical: spacing.sm,
  },
  body: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  statChip: {
    ...typography.caption,
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    color: colors.textMuted,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  cta: {
    color: colors.primary,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
});
