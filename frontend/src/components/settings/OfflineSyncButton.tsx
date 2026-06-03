import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AppText } from "../ui/AppText";
import theme from "../../theme";

type OfflineSyncButtonProps = {
  label: string;
  accessibilityLabel: string;
  disabled?: boolean;
  onPress: () => void;
};

export const OfflineSyncButton: React.FC<OfflineSyncButtonProps> = ({
  label,
  accessibilityLabel,
  disabled = false,
  onPress,
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ disabled }}
    disabled={disabled}
    onPress={onPress}
    style={({ pressed }) => [
      styles.button,
      disabled ? styles.buttonDisabled : null,
      pressed && !disabled ? styles.buttonPressed : null,
    ]}
  >
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons
        name="sync"
        size={18}
        color={disabled ? theme.colors.muted : theme.colors.accent}
      />
    </View>
    <AppText variant="card" color={disabled ? theme.colors.muted : theme.colors.textPrimary}>
      {label}
    </AppText>
  </Pressable>
);

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.accent,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.sm,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  buttonDisabled: {
    borderColor: theme.colors.border,
    opacity: 0.65,
  },
  buttonPressed: {
    opacity: 0.9,
  },
  iconWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
});
