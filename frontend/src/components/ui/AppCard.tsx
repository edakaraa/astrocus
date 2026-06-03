import React, { type PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import theme from "../../theme";
import { colors, radii, spacing } from "../../shared/theme";

export type AppCardVariant = "card" | "surface";

export type AppCardBorderVariant = "subtle" | "strong";

type AppCardProps = PropsWithChildren<{
  variant?: AppCardVariant;
  style?: StyleProp<ViewStyle>;
  /** `card` — corner radius (default theme.radii.lg). */
  radius?: number;
  /** `card` — inner padding (default theme.spacing.xl). */
  padding?: number;
  /** `surface` — inner padding (default spacing.lg). */
  contentPadding?: number;
  /** `surface` — border emphasis. */
  borderVariant?: AppCardBorderVariant;
}>;

const SURFACE_BACKGROUND = "rgba(58, 62, 108, 0.42)";

export const AppCard: React.FC<AppCardProps> = ({
  children,
  variant = "card",
  style,
  radius = theme.radii.lg,
  padding = theme.spacing.xl,
  contentPadding = spacing.lg,
  borderVariant = "subtle",
}) => {
  if (variant === "surface") {
    return (
      <View
        style={[
          styles.surface,
          {
            borderRadius: radii.lg,
            borderColor: borderVariant === "strong" ? colors.borderStrong : colors.border,
            padding: contentPadding,
          },
          style,
        ]}
      >
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.card, { borderRadius: radius, padding }, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderWidth: 1,
    width: "100%",
  },
  surface: {
    backgroundColor: SURFACE_BACKGROUND,
    borderWidth: 1,
  },
});
