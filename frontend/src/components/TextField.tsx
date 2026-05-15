import React from "react";
import { Pressable, TextInput, View } from "react-native";
import { colors, fontFamilies, radii, spacing } from "../shared/theme";

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
      style={{
        color: colors.text,
        paddingHorizontal: spacing.md,
        paddingVertical: 13,
        fontSize: 13,
        fontFamily: fontFamilies.bodyRegular,
        paddingRight: right ? 44 : spacing.md,
      }}
    />
  );

  return (
    <View
      style={{
        borderRadius: radii.md,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: "rgba(21, 18, 63, 0.55)",
        overflow: "hidden",
      }}
    >
      {onPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <View style={{ flex: 1 }}>{input}</View>
        </Pressable>
      ) : (
        input
      )}

      {right ? (
        <View style={{ position: "absolute", right: 10, top: 0, bottom: 0, justifyContent: "center" }}>{right}</View>
      ) : null}
    </View>
  );
};

