import React, { type ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { AppText } from "../ui/AppText";
import theme from "../../theme";

type SettingsRowProps = {
  label: string;
  caption?: string;
  control?: ReactNode;
  labelsFlex?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Horizontal settings row: label stack on the left, optional control on the right. */
export const SettingsRow: React.FC<SettingsRowProps> = ({
  label,
  caption,
  control,
  labelsFlex = false,
  style,
}) => (
  <View style={[styles.row, style]}>
    <View style={labelsFlex ? styles.labelsFlex : styles.labels}>
      <AppText variant="card">{label}</AppText>
      {caption ? <AppText variant="caption">{caption}</AppText> : null}
    </View>
    {control}
  </View>
);

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    justifyContent: "space-between",
  },
  labels: {
    flexShrink: 1,
  },
  labelsFlex: {
    flex: 1,
  },
});
