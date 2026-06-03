import React from "react";
import { Pressable, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppText } from "../ui/AppText";
import theme from "../../theme";

type SettingsNavLinkProps = {
  label: string;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: "default" | "destructive";
  isLast?: boolean;
};

export const SettingsNavLink: React.FC<SettingsNavLinkProps> = ({
  label,
  onPress,
  accessibilityLabel,
  variant = "default",
  isLast = false,
}) => {
  const labelColor = variant === "destructive" ? theme.colors.badgeScorpio : theme.colors.textPrimary;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        !isLast ? styles.rowBorder : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <AppText variant="card" color={labelColor} style={styles.label}>
        {label}
      </AppText>
      <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.muted} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.md,
  },
  rowBorder: {
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
  },
  label: {
    flex: 1,
  },
  pressed: {
    opacity: 0.88,
  },
});
