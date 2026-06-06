import React from "react";
import { StyleSheet, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import theme from "../../theme";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { AppIcon } from "../ui/AppIcon";
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
  const iconColor = isUnlocked ? theme.colors.accent : theme.colors.muted;

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
      <View style={styles.symbol}>
        <AppIcon name={icon.icon} size={48} color={iconColor} />
      </View>
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing.sm,
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
