import React, { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { t } from "../../shared/i18n";
import theme from "../../theme";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";
import { RewardToast } from "../ui/RewardToast";

type DailyGoalCardProps = {
  goalMinutes: number;
  elapsedMinutes: number;
  sessionCount: number;
  onSetGoal: () => void;
  onGoalReached?: () => void;
};

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  goalMinutes,
  elapsedMinutes,
  sessionCount,
  onSetGoal,
  onGoalReached,
}) => {
  const { language } = useAppContext();
  const [showReward, setShowReward] = useState(false);
  const rewardedRef = useRef(false);

  const hasGoal = goalMinutes > 0;
  const pct = hasGoal ? Math.round(Math.min(elapsedMinutes / goalMinutes, 1) * 100) : 0;
  const progress = hasGoal ? Math.min(elapsedMinutes / goalMinutes, 1) : 0;
  const goalReached = hasGoal && elapsedMinutes >= goalMinutes;

  useEffect(() => {
    if (!goalReached || rewardedRef.current) {
      return;
    }
    rewardedRef.current = true;
    setShowReward(true);
    onGoalReached?.();
  }, [goalReached, onGoalReached]);

  useEffect(() => {
    if (!hasGoal) {
      rewardedRef.current = false;
      setShowReward(false);
    }
  }, [hasGoal]);

  return (
    <>
      <Card>
        {!hasGoal ? (
          <View style={styles.noGoal}>
            <AppText variant="body">{t(language, "dailyGoalSetPrompt")}</AppText>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(language, "dailyGoalSetButton")}
              onPress={onSetGoal}
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
              <AppText variant="hero">
                {`${elapsedMinutes} ${t(language, "minuteUnit")}`}
              </AppText>
              <AppText variant="card" color={theme.colors.accent}>{`%${pct}`}</AppText>
            </View>
            {goalReached ? (
              <View style={styles.reachedRow}>
                <AppText variant="card">✦</AppText>
                <AppText variant="card">{t(language, "dailyGoalReached")}</AppText>
              </View>
            ) : (
              <ProgressBar progress={progress} />
            )}
            <AppText variant="caption" style={styles.caption}>
              {t(language, "dailyGoalProgressCaption")
                .replace("{goal}", String(goalMinutes))
                .replace("{sessions}", String(sessionCount))}
            </AppText>
          </View>
        )}
      </Card>
      <RewardToast
        visible={showReward}
        message={t(language, "dailyGoalRewardToast")}
        icon="✦"
      />
    </>
  );
};

const styles = StyleSheet.create({
  noGoal: {
    gap: theme.spacing.lg,
  },
  setButton: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.sm,
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
  reachedRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
    paddingVertical: theme.spacing.sm,
  },
  caption: {
    marginTop: theme.spacing.xs,
  },
});
