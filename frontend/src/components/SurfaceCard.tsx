import React, { PropsWithChildren } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { colors, radii, spacing } from "../shared/theme";

type SurfaceCardProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
  borderVariant?: "subtle" | "strong";
  /** Inner padding — defaults to lg; hero cards use md to stay compact. */
  contentPadding?: number;
}>;

export const SurfaceCard = ({
  children,
  style,
  borderVariant = "subtle",
  contentPadding = spacing.lg,
}: SurfaceCardProps) => {
  return (
    <View
      style={[
        {
          backgroundColor: "rgba(58, 62, 108, 0.42)",
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: borderVariant === "strong" ? colors.borderStrong : colors.border,
          padding: contentPadding,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

