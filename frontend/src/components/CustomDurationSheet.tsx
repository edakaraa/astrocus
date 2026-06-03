import React, { useEffect, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";
import { colors, fontFamilies, layout, numericTypography, radii, spacing } from "../shared/theme";
import { PillChip } from "./ui/PillChip";
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
              <Text style={styles.title}>{t(language, "durationSheetTitle")}</Text>

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

              <Text style={styles.customLabel}>{t(language, "customDurationInputLabel")}</Text>
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
                  <Text style={styles.applyText}>{t(language, "customDurationConfirm")}</Text>
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
    backgroundColor: "rgba(5, 7, 23, 0.72)",
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
    color: colors.text,
    fontFamily: fontFamilies.displayBold,
    fontSize: 18,
    fontWeight: "800",
    textAlign: "center",
  },
  optionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    justifyContent: "center",
  },
  customLabel: {
    color: colors.textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginTop: spacing.xs,
    textTransform: "uppercase",
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
  applyText: {
    color: colors.warmOffWhite,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
  },
});
