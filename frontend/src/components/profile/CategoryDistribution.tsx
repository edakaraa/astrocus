import React from "react";
import { StyleSheet, View } from "react-native";
import { useAppContext } from "../../context/AppContext";
import { formatDuration } from "../../shared/formatLocale";
import { t } from "../../shared/i18n";
import theme from "../../theme";
import { AppText } from "../ui/AppText";
import { Card } from "../ui/Card";
import { ProgressBar } from "../ui/ProgressBar";

export type CategoryDistributionItem = {
  name: string;
  minutes: number;
  color: string;
  percentage: number;
};

type CategoryDistributionProps = {
  categories: CategoryDistributionItem[];
};

export const CategoryDistribution: React.FC<CategoryDistributionProps> = ({ categories }) => {
  const { language } = useAppContext();

  if (categories.length === 0) {
    return null;
  }

  return (
    <Card>
      <AppText variant="body" style={styles.header}>
        {t(language, "categoryDistribution")}
      </AppText>
      {categories.map((row) => (
        <View key={row.name} style={styles.row}>
          <View style={styles.rowTop}>
            <View style={styles.nameWrap}>
              <View style={[styles.dot, { backgroundColor: row.color }]} />
              <AppText variant="body">{row.name}</AppText>
            </View>
            <AppText variant="numericCompact" color={theme.colors.textSecondary}>
              {`${formatDuration(language, row.minutes)} (${row.percentage}%)`}
            </AppText>
          </View>
          <ProgressBar progress={row.percentage / 100} height={4} />
        </View>
      ))}
    </Card>
  );
};

const styles = StyleSheet.create({
  header: {
    fontWeight: "600",
    marginBottom: theme.spacing.md,
  },
  row: {
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  rowTop: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  nameWrap: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    gap: theme.spacing.sm,
  },
  dot: {
    borderRadius: theme.layout.categoryDotSize / 2,
    height: theme.layout.categoryDotSize,
    width: theme.layout.categoryDotSize,
  },
});
