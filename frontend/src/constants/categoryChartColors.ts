import theme from "../theme";

/**
 * Kategori dağılımı — ana paletten türetilmiş pastel tonlar.
 * Kaynak: ube, success, warning, badge*, americanBlue, cadetGrey.
 */
export const CATEGORY_CHART_COLORS: Record<string, string> = {
  work: "#AEB2E8",
  reading: "#9FDEC4",
  project: "#E8B898",
  creativity: "#F5E09A",
  sports: "#F0A4A4",
  meditation: "#9ECFEE",
  coding: "#8FAEDB",
  general: "#C4C8DA",
  learning: "#B8A8E8",
};

export const getCategoryChartColor = (categoryId: string): string =>
  CATEGORY_CHART_COLORS[categoryId] ?? theme.colors.accent;
