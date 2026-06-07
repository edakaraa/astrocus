import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { colors, layout, numericTypography, radii, spacing } from "../shared/theme";
import { PillChip } from "./ui/PillChip";
import { AppText } from "./ui/AppText";
import { t } from "../shared/i18n";
import type { Language } from "../shared/types";

const SHEET_OPTIONS = [10, 20, 30, 45, 60, 90] as const;
const MIN_MINUTES = 5;
const MAX_MINUTES = 120;

type CustomDurationSheetProps = {
  visible: boolean;
  language: Language;
  selectedMinutes: number;
  onSelect: (minutes: number) => void;
  onClose: () => void;
};

export const CustomDurationSheet = ({
  visible,
  language,
  selectedMinutes,
  onSelect,
  onClose,
}: CustomDurationSheetProps) => {
  const insets = useSafeAreaInsets();
  const [customValue, setCustomValue] = useState("");

  useEffect(() => {
    if (!visible) {
      setCustomValue("");
    }
  }, [visible]);

  const applyCustom = () => {
    const parsed = Number.parseInt(customValue.trim(), 10);
    if (!Number.isFinite(parsed) || parsed < MIN_MINUTES || parsed > MAX_MINUTES) {
      return;
    }
    onSelect(parsed);
    Keyboard.dismiss();
    onClose();
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <Pressable accessibilityRole="button" accessibilityLabel={t(language, "cancel")} onPress={onClose} style={styles.backdrop}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardWrap}
        >
          <Pressable onPress={() => {}} style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
            <BlurView intensity={72} tint="dark" style={styles.blur}>
              <View style={styles.handle} />
              <AppText variant="h3" style={styles.title}>{t(language, "durationSheetTitle")}</AppText>

              <View style={styles.optionGrid}>
                {SHEET_OPTIONS.map((minutes) => {
                  const active = selectedMinutes === minutes;
                  return (
                    <PillChip
                      key={minutes}
                      variant="duration"
                      gridCell
                      label={language === "tr" ? `${minutes} dk` : `${minutes} min`}
                      active={active}
                      accessibilityLabel={`${minutes} ${t(language, "selectSessionMinutesA11y")}`}
                      onPress={() => {
                        onSelect(minutes);
                        onClose();
                      }}
                    />
                  );
                })}
              </View>

              <AppText variant="label" style={styles.customLabel}>
                {t(language, "customDurationInputLabel")}
              </AppText>
              <View style={styles.customRow}>
                <TextInput
                  accessibilityLabel={t(language, "customDurationPlaceholder")}
                  keyboardType="number-pad"
                  placeholder={t(language, "customDurationPlaceholder")}
                  placeholderTextColor={colors.textFaint}
                  value={customValue}
                  onChangeText={setCustomValue}
                  style={styles.customInput}
                  maxLength={3}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t(language, "customDurationConfirm")}
                  onPress={applyCustom}
                  style={styles.applyBtn}
                >
                  <AppText variant="buttonLabel">{t(language, "customDurationConfirm")}</AppText>
                </Pressable>
              </View>
            </BlurView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    backgroundColor: "rgba(5, 8, 18, 0.92)",
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboardWrap: {
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    overflow: "hidden",
  },
  blur: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  handle: {
    alignSelf: "center",
    backgroundColor: "rgba(149,155,181,0.35)",
    borderRadius: 999,
    height: 4,
    marginBottom: spacing.xs,
    width: 40,
  },
  title: {
    textAlign: "center",
  },
  customLabel: {
    marginTop: spacing.xs,
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  customRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  customInput: {
    ...numericTypography,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 16,
    minHeight: layout.touchTargetMin,
    paddingHorizontal: spacing.md,
  },
  applyBtn: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    justifyContent: "center",
    minHeight: layout.touchTargetMin,
    paddingHorizontal: spacing.lg,
  },
});
