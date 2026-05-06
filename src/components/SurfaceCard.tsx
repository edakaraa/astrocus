import React, { PropsWithChildren } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { colors, radii, spacing } from "../shared/theme";

type SurfaceCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  borderVariant?: "subtle" | "strong";
}>;

export const SurfaceCard = ({ children, style, borderVariant = "subtle" }: SurfaceCardProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: "rgba(13, 11, 43, 0.88)",
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: borderVariant === "strong" ? colors.borderStrong : colors.border,
          padding: spacing.lg,
          shadowColor: colors.primary,
          shadowOpacity: borderVariant === "strong" ? 0.14 : 0.08,
          shadowRadius: borderVariant === "strong" ? 18 : 12,
          shadowOffset: { width: 0, height: 10 },
          elevation: borderVariant === "strong" ? 8 : 4,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

