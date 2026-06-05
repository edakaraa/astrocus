import React from "react";
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, layout, radii, spacing } from "../shared/theme";
import { AppText } from "./ui/AppText";

type GradientButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "soft";
  accessibilityLabel?: string;
  fullWidth?: boolean;
  hideHighlight?: boolean;
};

export const GradientButton = ({
  label,
  onPress,
  disabled,
  style,
  variant = "primary",
  accessibilityLabel,
  fullWidth,
  hideHighlight = false,
}: GradientButtonProps) => {
  const isPrimary = variant === "primary";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled}
      hitSlop={layout.hitSlop}
      onPress={onPress}
      style={({ pressed }) => [
        fullWidth ? styles.fullWidth : null,
        {
          opacity: disabled ? 0.55 : 1,
          transform: [{ scale: pressed && !disabled ? 0.98 : 1 }],
        },
        style,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.shadowWrap,
          isPrimary ? styles.shadowPrimary : styles.shadowSoft,
        ]}
      >
        <LinearGradient
          colors={
            isPrimary
              ? ["rgba(232,230,200,0.14)", "rgba(131,135,195,0.95)", "rgba(58,62,108,0.96)"]
              : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0.04)"]
          }
          start={{ x: 0.08, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {!hideHighlight ? <View style={styles.highlight} /> : null}
          <AppText variant="buttonLabel">{label}</AppText>
        </LinearGradient>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: "stretch",
    width: "100%",
  },
  shadowWrap: {
    borderRadius: radii.pill,
    padding: 1,
  },
  shadowPrimary: {
    backgroundColor: "rgba(131,135,195,0.18)",
    elevation: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.34,
    shadowRadius: 26,
  },
  shadowSoft: {
    backgroundColor: "rgba(255,255,255,0.04)",
    elevation: 5,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.14,
    shadowRadius: 14,
  },
  gradient: {
    alignItems: "center",
    borderRadius: radii.pill,
    justifyContent: "center",
    minHeight: layout.touchTargetMin,
    overflow: "hidden",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  highlight: {
    backgroundColor: "rgba(232,230,200,0.34)",
    height: 1,
    left: 22,
    position: "absolute",
    right: 34,
    top: 0,
  },
});
