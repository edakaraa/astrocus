import React from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { AppText } from "./AppText";
import { AppIcon } from "./AppIcon";
import { STARDUST_ICON } from "../../shared/appIcons";
import { spacing } from "../../shared/theme";
import theme from "../../theme";

type StardustMarkProps = {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
};

/** Yıldız tozu birimi — ✦ emoji yerine vektör ikon. */
export const StardustMark: React.FC<StardustMarkProps> = ({
  size = 14,
  color = theme.colors.textPrimary,
  style,
}) => (
  <View style={[styles.wrap, style]}>
    <AppIcon name={STARDUST_ICON} size={size} color={color} />
  </View>
);

type StardustAmountProps = {
  amount: string;
  iconSize?: number;
  color?: string;
  variant?: "numeric" | "numericCompact";
  style?: StyleProp<ViewStyle>;
};

/** İkon + miktar (ör. profil, gökyüzü kartları). */
export const StardustAmount: React.FC<StardustAmountProps> = ({
  amount,
  iconSize = 14,
  color = theme.colors.textPrimary,
  variant = "numericCompact",
  style,
}) => (
  <View style={[styles.amountRow, style]}>
    <StardustMark size={iconSize} color={color} />
    <AppText variant={variant} color={color}>
      {amount}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  amountRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
});
