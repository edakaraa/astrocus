import theme from "../../theme";

export type BadgeIconConfig = {
  symbol: string;
  color: string;
};

export const BADGE_ICONS: Record<string, BadgeIconConfig> = {
  first_step: { symbol: "⭐", color: theme.colors.textPrimary },
  focus_master: { symbol: "🎯", color: theme.colors.accent },
  discipline: { symbol: "🔥", color: theme.colors.badgeDiscipline },
  cst_aries: { symbol: "♈", color: theme.colors.accent },
  cst_taurus: { symbol: "♉", color: theme.colors.textSecondary },
  cst_gemini: { symbol: "♊", color: theme.colors.accent },
  cst_cancer: { symbol: "♋", color: theme.colors.textSecondary },
  cst_leo: { symbol: "♌", color: theme.colors.badgeLeo },
  cst_virgo: { symbol: "♍", color: theme.colors.textSecondary },
  cst_libra: { symbol: "♎", color: theme.colors.accent },
  cst_scorpio: { symbol: "♏", color: theme.colors.badgeScorpio },
  cst_sagittarius: { symbol: "♐", color: theme.colors.badgeDiscipline },
  cst_capricorn: { symbol: "♑", color: theme.colors.textSecondary },
  cst_aquarius: { symbol: "♒", color: theme.colors.accent },
  cst_pisces: { symbol: "♓", color: theme.colors.badgePisces },
  cst_ophiuchus: { symbol: "⛎", color: theme.colors.muted },
};

export const getBadgeIcon = (id: string): BadgeIconConfig =>
  BADGE_ICONS[id] ?? { symbol: "✦", color: theme.colors.muted };
