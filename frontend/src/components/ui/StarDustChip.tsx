import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { formatNumber } from "../../shared/formatLocale";
import theme from "../../theme";
import { AppText } from "./AppText";

type StarDustChipProps = {
  amount: number;
};

export const StarDustChip: React.FC<StarDustChipProps> = ({ amount }) => {
  const { language } = useAppContext();

  return (
    <View style={styles.chip}>
      <AppText variant="numeric" color={theme.colors.textPrimary}>
        {`✦ ${formatNumber(language, amount)}`}
      </AppText>
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
});
