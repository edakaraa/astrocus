import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import type { Language, WeeklyReport, WeeklyReportStats } from "../shared/types";
import { t } from "../shared/i18n";
import { formatDuration, formatNumber } from "../shared/formatLocale";
import { colors, radii, screenBlock, spacing } from "../shared/theme";
import { Card } from "./ui/Card";
import { AppText } from "./ui/AppText";
import { IconTitleRow } from "./ui/IconTitleRow";
import { GradientButton } from "./GradientButton";
import { AppCard } from "./ui/AppCard";
import theme from "../theme";

export type WeeklyReportCardMode = "session" | "profile";

type WeeklyReportCardBaseProps = {
  language: Language;
  loading: boolean;
  reportText: string | null;
};

type WeeklyReportCardSessionProps = WeeklyReportCardBaseProps & {
  mode?: "session";
  weekLabel: string | null;
  stats?: WeeklyReportStats;
  onPress?: () => void;
};

type WeeklyReportCardProfileProps = WeeklyReportCardBaseProps & {
  mode: "profile";
  report: WeeklyReport | null;
  onOpen: () => void;
};

export type WeeklyReportCardProps = WeeklyReportCardSessionProps | WeeklyReportCardProfileProps;

const ReportHeader = ({
  language,
  weekLabel,
}: {
  language: Language;
  weekLabel?: string | null;
}) => (
  <IconTitleRow icon="chart-timeline-variant" iconColor={theme.colors.accent} textColumnStyle={styles.headerTextGap}>
    <AppText variant={weekLabel ? "weeklyReportTitle" : "card"}>
      {t(language, "weeklyReportTitle")}
    </AppText>
    {weekLabel ? (
      <AppText variant="caption">{weekLabel}</AppText>
    ) : (
      <AppText variant="caption">{t(language, "weeklyReportSubtitle")}</AppText>
    )}
  </IconTitleRow>
);

const ProfileWeeklyReportCard: React.FC<WeeklyReportCardProfileProps> = ({
  language,
  loading,
  report,
  reportText,
  onOpen,
}) => (
  <Card style={styles.profileCard}>
    <ReportHeader language={language} />
    {loading ? (
      <AppText variant="body">…</AppText>
    ) : report && reportText ? (
      <>
        <AppText variant="body" numberOfLines={3}>
          {reportText}
        </AppText>
        <GradientButton
          label={t(language, "weeklyReportOpen")}
          onPress={onOpen}
          variant="soft"
          accessibilityLabel={t(language, "weeklyReportOpen")}
        />
      </>
    ) : (
      <AppText variant="body" style={styles.italic}>
        {t(language, "weeklyReportEmpty")}
      </AppText>
    )}
  </Card>
);

const SessionWeeklyReportCard: React.FC<WeeklyReportCardSessionProps> = ({
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
      <ReportHeader language={language} weekLabel={weekLabel} />
      {loading ? (
        <ActivityIndicator color={colors.primary} style={styles.loader} />
      ) : (
        <>
          <AppText variant="weeklyReportBody" numberOfLines={4}>
            {reportText}
          </AppText>
          {stats ? (
            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <AppText variant="weeklyReportStatChip">
                  {formatDuration(language, stats.total_minutes)}
                </AppText>
              </View>
              <View style={styles.statChip}>
                <AppText variant="weeklyReportStatChip">
                  {`${formatNumber(language, stats.completed_sessions)} ${t(language, "weeklyReportSessions")}`}
                </AppText>
              </View>
            </View>
          ) : null}
          {onPress ? (
            <AppText variant="weeklyReportCta" style={styles.cta}>
              {t(language, "weeklyReportOpen")}
            </AppText>
          ) : null}
        </>
      )}
    </>
  );

  const card = (
    <AppCard variant="surface" contentPadding={spacing.md} borderVariant="strong" style={[screenBlock, styles.sessionCard]}>
      {content}
    </AppCard>
  );

  if (onPress && !loading) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t(language, "weeklyReportOpen")}
        onPress={onPress}
      >
        {card}
      </Pressable>
    );
  }

  return card;
};

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = (props) => {
  if (props.mode === "profile") {
    return <ProfileWeeklyReportCard {...props} />;
  }
  return <SessionWeeklyReportCard {...props} />;
};

const styles = StyleSheet.create({
  profileCard: {
    gap: theme.spacing.md,
  },
  sessionCard: {
    gap: spacing.sm,
  },
  headerTextGap: {
    gap: 2,
  },
  italic: {
    fontStyle: "italic",
  },
  loader: {
    marginVertical: spacing.sm,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  statChip: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    overflow: "hidden",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
  },
  cta: {
    marginTop: 2,
  },
});
