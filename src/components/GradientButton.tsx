import React from "react";
import { Pressable, StyleProp, Text, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fontFamilies, radii, spacing, typography } from "../shared/theme";

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "soft";
  accessibilityLabel?: string;
};

export const GradientButton = ({
  label,
  onPress,
  disabled,
  style,
  variant = "primary",
  accessibilityLabel,
}: GradientButtonProps) => {
  const gradientColors =
    variant === "primary"
      ? ([colors.mediumSlateBlue, colors.periwinkle, colors.danger] as const)
      : ([
          "rgba(88, 102, 255, 0.16)",
          "rgba(179, 191, 255, 0.10)",
          "rgba(255, 107, 157, 0.08)",
        ] as const);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={[
        {
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: radii.xl,
          paddingVertical: spacing.md,
          alignItems: "center",
          justifyContent: "center",
          borderWidth: 1,
          borderColor: variant === "primary" ? "rgba(255,255,255,0.06)" : colors.border,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 15,
            fontWeight: typography.h3.fontWeight,
            letterSpacing: -0.2,
            fontFamily: fontFamilies.displayBold,
          }}
        >
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
};

