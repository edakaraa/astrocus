import React, { type PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import theme from "../../theme";

type IconTitleRowProps = PropsWithChildren<{
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"];
  iconColor?: string;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
  textColumnStyle?: StyleProp<ViewStyle>;
}>;

export const IconTitleRow: React.FC<IconTitleRowProps> = ({
  children,
  icon,
  iconColor = theme.colors.accent,
  iconSize = 20,
  style,
  textColumnStyle,
}) => (
  <View style={[styles.row, style]}>
    <MaterialCommunityIcons name={icon} size={iconSize} color={iconColor} />
    <View style={[styles.textColumn, textColumnStyle]}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
  },
  textColumn: {
    flex: 1,
    gap: theme.spacing.xs,
  },
});
