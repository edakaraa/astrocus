import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { toastTone, useAppContext } from "../../context/AppContext";
import { roundDailyGoalMinutes } from "../../lib/dailyGoalStorage";
import { t } from "../../shared/i18n";
import theme from "../../theme";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

type DailyGoalCardProps = {
  /** Confirmed goal for today; 0 means show inline picker. */
  goalMinutes: number;
  /** Slider default when picking (usually yesterday's choice or profile default). */
  pickerDefaultMinutes: number;
  elapsedMinutes: number;
  sessionCount: number;
  onConfirmGoal: (minutes: number) => void;
  onGoalReached?: () => void;
};

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  goalMinutes,
  pickerDefaultMinutes,
  elapsedMinutes,
  sessionCount,
  onConfirmGoal,
  onGoalReached,
}) => {
  const { language, showToast } = useAppContext();
  const rewardedRef = useRef(false);
  const [draftMinutes, setDraftMinutes] = useState(pickerDefaultMinutes);

  const hasGoalToday = goalMinutes > 0;
  const pct = hasGoalToday ? Math.round(Math.min(elapsedMinutes / goalMinutes, 1) * 100) : 0;
  const progress = hasGoalToday ? Math.min(elapsedMinutes / goalMinutes, 1) : 0;
  const goalReached = hasGoalToday && elapsedMinutes >= goalMinutes;

  useEffect(() => {
    if (!hasGoalToday) {
      setDraftMinutes(pickerDefaultMinutes);
      rewardedRef.current = false;
    }
  }, [hasGoalToday, pickerDefaultMinutes]);

  useEffect(() => {
    if (!goalReached || rewardedRef.current) {
      return;
    }
    rewardedRef.current = true;
    showToast({
      title: t(language, "dailyGoalRewardToast"),
      ...toastTone.trophy,
      placement: "bottom",
    });
    onGoalReached?.();
  }, [goalReached, language, onGoalReached, showToast]);

  const handleConfirm = () => {
    onConfirmGoal(roundDailyGoalMinutes(draftMinutes));
  };

  return (
    <Card>
      <AppText variant="focusSectionLabel" style={styles.cardLabel}>
        {t(language, "dailyGoal")}
      </AppText>

      {!hasGoalToday ? (
        <View style={styles.pickerBody}>
          <AppText variant="body">{t(language, "dailyGoalSetPrompt")}</AppText>
          <AppText variant="caption" color={theme.colors.textSecondary}>
            {t(language, "dailyGoalSheetQuestion")}
          </AppText>
          <AppText variant="numericHero" style={styles.pickerValue}>
            {`${draftMinutes} ${t(language, "minuteUnit")}`}
          </AppText>
          <Slider
            value={draftMinutes}
            onValueChange={(v: number | number[]) => setDraftMinutes(Array.isArray(v) ? v[0] : v)}
            minimumValue={theme.layout.goalSheetMinMinutes}
            maximumValue={theme.layout.goalSheetMaxMinutes}
            step={theme.layout.goalSheetStep}
            minimumTrackTintColor={theme.colors.accent}
            maximumTrackTintColor={theme.colors.surface}
            thumbTintColor={theme.colors.textPrimary}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "dailyGoalSetButton")}
            onPress={handleConfirm}
            style={({ pressed }) => [styles.setButton, pressed ? styles.pressed : null]}
          >
            <AppText variant="card" color={theme.colors.bg}>
              {t(language, "dailyGoalSetButton")}
            </AppText>
          </Pressable>
        </View>
      ) : (
        <View style={styles.goalBody}>
          <View style={styles.topRow}>
            {goalReached ? (
              <View style={styles.reachedRow}>
                <AppText variant="card">✦</AppText>
                <AppText variant="card">{t(language, "dailyGoalReached")}</AppText>
              </View>
            ) : (
              <AppText variant="numericHero" style={styles.elapsed}>
                {`${elapsedMinutes} ${t(language, "minuteUnit")}`}
              </AppText>
            )}
            <AppText variant="numeric" color={theme.colors.accent}>{`%${pct}`}</AppText>
          </View>
          {!goalReached ? <ProgressBar progress={progress} /> : null}
          <AppText variant="caption" style={styles.caption}>
            <AppText variant="numericCompact">{goalMinutes}</AppText>
            {language === "tr" ? " dk günlük hedef · " : " min daily goal · "}
            <AppText variant="numericCompact">{sessionCount}</AppText>
            {language === "tr" ? " seans bugün" : " sessions today"}
          </AppText>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  cardLabel: {
    marginBottom: theme.spacing.sm,
  },
  pickerBody: {
    gap: theme.spacing.md,
  },
  pickerValue: {
    textAlign: "center",
  },
  setButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.sm,
    marginTop: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
  },
  pressed: {
    opacity: 0.9,
  },
  goalBody: {
    gap: theme.spacing.md,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  elapsed: {
    flex: 1,
    fontSize: 22,
    lineHeight: 28,
  },
  reachedRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
  },
  caption: {
    marginTop: theme.spacing.xs,
  },
});
