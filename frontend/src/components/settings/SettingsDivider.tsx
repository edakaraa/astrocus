import React from "react";
import { StyleSheet, View } from "react-native";
import theme from "../../theme";

export const SettingsDivider: React.FC = () => <View style={styles.divider} />;

const styles = StyleSheet.create({
  divider: {
    backgroundColor: theme.colors.border,
    height: 1,
  },
});
