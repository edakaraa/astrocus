import React, { type PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import theme from "../../theme";

type CardProps = PropsWithChildren<{
  radius?: number;
  padding?: number;
  style?: StyleProp<ViewStyle>;
}>;

export const Card: React.FC<CardProps> = ({
  children,
  radius = theme.radii.lg,
  padding = theme.spacing.xl,
  style,
}) => (
  <View
    style={[
      styles.card,
      { borderRadius: radius, padding },
      style,
    ]}
  >
    {children}
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderWidth: 1,
    width: "100%",
  },
});
