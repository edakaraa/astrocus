import React from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { colors, fontFamilies, layout, radii, spacing, typography } from "../shared/theme";

type TextFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
  right?: React.ReactNode;
  editable?: boolean;
  onPress?: () => void;
};

export const TextField = ({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
  right,
  editable = true,
  onPress,
}: TextFieldProps) => {
  const input = (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      placeholder={placeholder}
      placeholderTextColor={colors.textFaint}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      editable={editable}
      style={[styles.input, right ? styles.inputWithRight : null]}
    />
  );

  return (
    <View style={styles.shell}>
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          hitSlop={layout.hitSlop}
          onPress={onPress}
          style={styles.pressableRow}
        >
          <View style={styles.inputFlex}>{input}</View>
        </Pressable>
      ) : (
        input
      )}

      {right ? <View style={styles.rightSlot}>{right}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  shell: {
    backgroundColor: "rgba(21, 18, 63, 0.55)",
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    minHeight: layout.touchTargetMin,
    overflow: "hidden",
  },
  input: {
    color: colors.text,
    flex: 1,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: typography.bodyLarge.fontSize,
    lineHeight: typography.bodyLarge.lineHeight,
    minHeight: layout.touchTargetMin,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWithRight: {
    paddingRight: 48,
  },
  pressableRow: {
    alignItems: "center",
    flexDirection: "row",
  },
  inputFlex: {
    flex: 1,
  },
  rightSlot: {
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    right: spacing.sm,
    top: 0,
  },
});
