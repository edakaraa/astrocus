import theme from "../theme";

/** Category bar/dot colors — single map for analytics charts. */
export const CATEGORY_CHART_COLORS: Record<string, string> = {
  work: theme.colors.accent,
  reading: theme.colors.textSecondary,
  project: theme.colors.textPrimary,
  creativity: theme.colors.badgeLeo,
  sports: theme.colors.badgeDiscipline,
  meditation: theme.colors.badgePisces,
  coding: theme.colors.muted,
  general: theme.colors.textSecondary,
};

export const getCategoryChartColor = (categoryId: string): string =>
  CATEGORY_CHART_COLORS[categoryId] ?? theme.colors.accent;
