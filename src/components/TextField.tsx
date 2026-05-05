import React from "react";
import { TextInput, View } from "react-native";
import { colors, fontFamilies, radii, spacing } from "../shared/theme";

type TextFieldProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  accessibilityLabel: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  autoCapitalize?: "none" | "sentences";
};

export const TextField = ({
  value,
  onChangeText,
  placeholder,
  accessibilityLabel,
  secureTextEntry,
  keyboardType = "default",
  autoCapitalize = "sentences",
}: TextFieldProps) => {
  return (
    <View
      style={{
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: "rgba(21, 18, 63, 0.55)",
      }}
    >
      <TextInput
        accessibilityLabel={accessibilityLabel}
        placeholder={placeholder}
        placeholderTextColor={colors.textFaint}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        style={{
          color: colors.text,
          paddingHorizontal: spacing.md,
          paddingVertical: 13,
          fontSize: 13,
          fontFamily: fontFamilies.bodyRegular,
        }}
      />
    </View>
  );
};

