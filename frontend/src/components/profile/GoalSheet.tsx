import React, { forwardRef, useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { Slider } from "@miblanchard/react-native-slider";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAppContext } from "../../context/AppContext";
import { asyncStorage } from "../../shared/storage";
import { STORAGE_KEYS } from "../../constants/storageKeys";
import { t } from "../../shared/i18n";
import theme from "../../theme";
import { AppText } from "../ui/AppText";

type GoalSheetProps = {
  initialMinutes: number;
  onSaved: (minutes: number) => void;
};

export const GoalSheet = forwardRef<BottomSheet, GoalSheetProps>(
  ({ initialMinutes, onSaved }, ref) => {
    const { language } = useAppContext();
    const insets = useSafeAreaInsets();
    const snapPoints = useMemo(() => ["42%"], []);
    const [value, setValue] = useState(
      initialMinutes > 0 ? initialMinutes : theme.layout.goalSheetDefaultMinutes,
    );

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.55} />
      ),
      [],
    );

    const save = async () => {
      const rounded =
        Math.round(value / theme.layout.goalSheetStep) * theme.layout.goalSheetStep;
      await asyncStorage.set(STORAGE_KEYS.dailyGoalMinutes, rounded);
      onSaved(rounded);
      if (ref && "current" in ref && ref.current) {
        ref.current.close();
      }
    };

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.handle}
      >
        <View style={[styles.content, { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }]}>
          <AppText variant="card">{t(language, "dailyGoalSheetTitle")}</AppText>
          <AppText variant="body" style={styles.subtitle}>
            {t(language, "dailyGoalSheetQuestion")}
          </AppText>
          <AppText variant="hero" style={styles.value}>
            {`${value} ${t(language, "minuteUnit")}`}
          </AppText>
          <Slider
            value={value}
            onValueChange={(v: number | number[]) => setValue(Array.isArray(v) ? v[0] : v)}
            minimumValue={theme.layout.goalSheetMinMinutes}
            maximumValue={theme.layout.goalSheetMaxMinutes}
            step={theme.layout.goalSheetStep}
            minimumTrackTintColor={theme.colors.accent}
            maximumTrackTintColor={theme.colors.surface}
            thumbTintColor={theme.colors.textPrimary}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t(language, "save")}
            onPress={() => void save()}
            style={({ pressed }) => [styles.saveBtn, pressed ? styles.pressed : null]}
          >
            <AppText variant="card" color={theme.colors.bg}>
              {t(language, "save")}
            </AppText>
          </Pressable>
        </View>
      </BottomSheet>
    );
  },
);

GoalSheet.displayName = "GoalSheet";

const styles = StyleSheet.create({
  sheetBg: {
    backgroundColor: theme.colors.bg,
  },
  handle: {
    backgroundColor: theme.colors.surface,
  },
  content: {
    gap: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.md,
  },
  subtitle: {
    marginTop: theme.spacing.xs,
  },
  value: {
    textAlign: "center",
  },
  saveBtn: {
    alignItems: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.lg,
    width: "100%",
  },
  pressed: {
    opacity: 0.9,
  },
});
