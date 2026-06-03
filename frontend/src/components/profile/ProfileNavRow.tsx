import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../../theme";
import { AppText } from "../ui/AppText";

type ProfileNavRowProps = {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  meta: string;
  onPress: () => void;
  accessibilityLabel: string;
  isLast?: boolean;
};

export const ProfileNavRow: React.FC<ProfileNavRowProps> = ({
  icon,
  label,
  meta,
  onPress,
  accessibilityLabel,
  isLast = false,
}) => (
  <Pressable
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    onPress={onPress}
    style={({ pressed }) => [styles.row, isLast ? styles.rowLast : null, pressed ? styles.rowPressed : null]}
  >
    <View style={styles.iconWrap}>
      <MaterialCommunityIcons name={icon} size={18} color={theme.colors.accent} />
    </View>
    <AppText variant="card" style={styles.label}>
      {label}
    </AppText>
    <AppText variant="caption">{meta}</AppText>
    <MaterialCommunityIcons name="chevron-right" size={20} color={theme.colors.muted} />
  </Pressable>
);

const styles = StyleSheet.create({
  row: {
    alignItems: "center",
    borderBottomColor: theme.colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  rowPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    alignItems: "center",
    backgroundColor: theme.colors.overlay,
    borderRadius: theme.radii.lg,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  label: {
    flex: 1,
  },
});
