import React, { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, StyleSheet, TextInput, View } from "react-native";
import { Slider } from "@miblanchard/react-native-slider";
import { toastTone, useAppContext } from "../../context/AppContext";
import {
  clampDailyGoalMinutes,
  normalizeDailyGoalMinutes,
  parseDailyGoalInput,
} from "../../lib/dailyGoalStorage";
import { t } from "../../shared/i18n";
import { colors, layout, numericTypography } from "../../shared/theme";
import theme from "../../theme";
import { AppText } from "../ui/AppText";
import { StardustMark } from "../ui/StardustMark";
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
  const inputRef = useRef<TextInput>(null);
  const [draftMinutes, setDraftMinutes] = useState(pickerDefaultMinutes);
  const [isEditingMinutes, setIsEditingMinutes] = useState(false);
  const [inputValue, setInputValue] = useState(String(pickerDefaultMinutes));

  const minMinutes = theme.layout.goalSheetMinMinutes;
  const maxMinutes = theme.layout.goalSheetMaxMinutes;

  const hasGoalToday = goalMinutes > 0;
  const pct = hasGoalToday ? Math.round(Math.min(elapsedMinutes / goalMinutes, 1) * 100) : 0;
  const progress = hasGoalToday ? Math.min(elapsedMinutes / goalMinutes, 1) : 0;
  const goalReached = hasGoalToday && elapsedMinutes >= goalMinutes;

  useEffect(() => {
    if (!hasGoalToday) {
      setDraftMinutes(pickerDefaultMinutes);
      setInputValue(String(pickerDefaultMinutes));
      setIsEditingMinutes(false);
      rewardedRef.current = false;
    }
  }, [hasGoalToday, pickerDefaultMinutes]);

  useEffect(() => {
    if (!isEditingMinutes) {
      setInputValue(String(draftMinutes));
    }
  }, [draftMinutes, isEditingMinutes]);

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

  const commitDraftInput = () => {
    const parsed = parseDailyGoalInput(inputValue);
    if (parsed != null) {
      const normalized = normalizeDailyGoalMinutes(parsed);
      setDraftMinutes(normalized);
      setInputValue(String(normalized));
    } else {
      setInputValue(String(draftMinutes));
    }
    setIsEditingMinutes(false);
    Keyboard.dismiss();
  };

  const handleConfirm = () => {
    let minutes = draftMinutes;
    if (isEditingMinutes) {
      const parsed = parseDailyGoalInput(inputValue);
      if (parsed != null) {
        minutes = normalizeDailyGoalMinutes(parsed);
        setDraftMinutes(minutes);
        setInputValue(String(minutes));
      }
      setIsEditingMinutes(false);
      Keyboard.dismiss();
    }
    onConfirmGoal(normalizeDailyGoalMinutes(minutes));
  };

  const handleSliderChange = (value: number | number[]) => {
    const next = Array.isArray(value) ? value[0] : value;
    setDraftMinutes(clampDailyGoalMinutes(next));
    setIsEditingMinutes(false);
  };

  const startEditingMinutes = () => {
    setInputValue(String(draftMinutes));
    setIsEditingMinutes(true);
    setTimeout(() => inputRef.current?.focus(), 0);
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

          {isEditingMinutes ? (
            <View style={styles.pickerValueRow}>
              <TextInput
                ref={inputRef}
                accessibilityLabel={t(language, "dailyGoalEditMinutesA11y")}
                keyboardType="decimal-pad"
                maxLength={6}
                value={inputValue}
                onChangeText={setInputValue}
                onBlur={commitDraftInput}
                onSubmitEditing={commitDraftInput}
                selectTextOnFocus
                style={styles.pickerInput}
              />
              <AppText variant="numericHero" style={styles.pickerUnit}>
                {t(language, "minuteUnit")}
              </AppText>
            </View>
          ) : (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t(language, "dailyGoalEditMinutesA11y")}
              onPress={startEditingMinutes}
              style={({ pressed }) => [styles.pickerValuePressable, pressed ? styles.pressed : null]}
            >
              <AppText variant="numericHero" style={styles.pickerValue}>
                {`${draftMinutes} ${t(language, "minuteUnit")}`}
              </AppText>
            </Pressable>
          )}

          <Slider
            value={draftMinutes}
            onValueChange={handleSliderChange}
            minimumValue={minMinutes}
            maximumValue={maxMinutes}
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
                <StardustMark size={16} color={theme.colors.bg} />
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
  pickerValuePressable: {
    alignSelf: "center",
  },
  pickerValue: {
    textAlign: "center",
  },
  pickerValueRow: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    gap: theme.spacing.sm,
    justifyContent: "center",
  },
  pickerInput: {
    ...numericTypography,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    minHeight: layout.touchTargetMin,
    minWidth: 88,
    paddingHorizontal: theme.spacing.md,
    textAlign: "center",
  },
  pickerUnit: {
    fontSize: 22,
    lineHeight: 28,
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
