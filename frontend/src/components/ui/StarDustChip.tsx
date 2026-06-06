import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { formatNumber } from "../../shared/formatLocale";
import { spacing } from "../../shared/theme";
import theme from "../../theme";
import { StardustInfoButton } from "../StardustInfoButton";
import { AppText } from "./AppText";
import { StardustMark } from "./StardustMark";

type StarDustChipProps = {
  amount: number;
  /** Compact padding for inline use (e.g. sky progress card). */
  compact?: boolean;
  /** Show ! button that opens stardust earning guide. */
  showInfo?: boolean;
};

export const StarDustChip: React.FC<StarDustChipProps> = ({
  amount,
  compact = false,
  showInfo = false,
}) => {
  const { language } = useAppContext();

  return (
    <View style={[styles.chip, compact ? styles.chipCompact : null]}>
      <View style={styles.row}>
        <StardustMark size={14} />
        <AppText variant="numeric" color={theme.colors.textPrimary}>
          {formatNumber(language, amount)}
        </AppText>
        {showInfo ? <StardustInfoButton size={16} /> : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    backgroundColor: theme.colors.surfaceCard,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: theme.layout.topBarMinHeight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  chipCompact: {
    minHeight: undefined,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xxs,
  },
});
