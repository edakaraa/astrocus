import React from "react";
import { Pressable, StyleProp, Text, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, fontFamilies, radii, spacing } from "../shared/theme";

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
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: disabled ? 0.55 : 1,
          transform: [{ scale: pressed && !disabled ? 0.985 : 1 }],
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={{
          borderRadius: radii.pill,
          shadowColor: colors.primary,
          shadowOpacity: isPrimary ? 0.34 : 0.14,
          shadowRadius: isPrimary ? 26 : 14,
          shadowOffset: { width: 0, height: 0 },
          elevation: isPrimary ? 12 : 5,
          backgroundColor: isPrimary ? "rgba(131,135,195,0.18)" : "rgba(255,255,255,0.04)",
          padding: 1,
        }}
      >
        <LinearGradient
          colors={
            isPrimary
              ? ["rgba(232,230,200,0.14)", "rgba(131,135,195,0.95)", "rgba(58,62,108,0.96)"]
              : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"]
          }
          start={{ x: 0.08, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            borderRadius: radii.pill,
            paddingVertical: spacing.md,
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 22,
              right: 34,
              height: 1,
              backgroundColor: "rgba(232,230,200,0.34)",
            }}
          />
          <Text
            style={{
              color: colors.warmOffWhite,
              fontSize: 15,
              fontWeight: "700",
              letterSpacing: -0.1,
              fontFamily: fontFamilies.displayBold,
            }}
          >
            {label}
          </Text>
        </LinearGradient>
      </View>
    </Pressable>
  );
};
