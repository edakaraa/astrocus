import React from "react";
import { StyleSheet, View } from "react-native";
import theme from "../../theme";
import { AppText } from "../ui/AppText";

type StatBoxProps = {
  value: string | number;
  label: string;
};

export const StatBox: React.FC<StatBoxProps> = ({ value, label }) => (
  <View style={styles.box}>
    <AppText variant="numeric" style={styles.value}>
      {value}
    </AppText>
    <AppText variant="caption" style={styles.label}>
      {label}
    </AppText>
  </View>
);

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.radii.md,
    flex: 1,
    padding: theme.spacing.md,
  },
  value: {
    fontSize: 15,
    lineHeight: 20,
  },
  label: {
    marginTop: theme.spacing.xs,
    textAlign: "center",
  },
});
