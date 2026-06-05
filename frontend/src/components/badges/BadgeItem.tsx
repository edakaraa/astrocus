import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../../theme";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { getBadgeIcon } from "./badgeIcons";

type BadgeItemProps = {
  id: string;
  title: string;
  description: string;
  isUnlocked: boolean;
};

export const BadgeItem: React.FC<BadgeItemProps> = ({
  id,
  title,
  description,
  isUnlocked,
}) => {
  const icon = getBadgeIcon(id);

  return (
    <Card
      radius={theme.radii.lg}
      padding={theme.spacing.lg}
      style={[styles.wrap, !isUnlocked ? styles.locked : styles.unlocked]}
    >
      {!isUnlocked ? (
        <View style={styles.lock}>
          <MaterialCommunityIcons
            name="lock-outline"
            size={theme.layout.lockIconSize}
            color={theme.colors.muted}
          />
        </View>
      ) : null}
      <AppText variant="card" color={icon.color} style={styles.symbol}>
        {icon.symbol}
      </AppText>
      <AppText variant="card" style={styles.title}>
        {title}
      </AppText>
      <AppText variant="caption" style={styles.description}>
        {description}
      </AppText>
    </Card>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    minHeight: 148,
  },
  locked: {
    opacity: 0.35,
  },
  unlocked: {
    borderColor: theme.colors.accent,
  },
  lock: {
    position: "absolute",
    right: theme.spacing.sm,
    top: theme.spacing.sm,
  },
  symbol: {
    fontSize: 48,
    lineHeight: 52,
    marginBottom: theme.spacing.sm,
    textAlign: "center",
  },
  title: {
    fontSize: 14,
    lineHeight: 18,
    textAlign: "center",
  },
  description: {
    marginTop: theme.spacing.xs,
    textAlign: "center",
  },
});
