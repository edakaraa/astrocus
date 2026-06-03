/**
 * Legacy design tokens — canonical palette lives in `src/theme/index.ts`.
 * New screens should import `theme` from `../theme` directly.
 */
import appTheme from "../theme";
import {
  fontFamilies as canonicalFontFamilies,
  numericTypography as canonicalNumericTypography,
  typographyTokens,
} from "../theme/typography";

export const colors = {
  cadetGrey: appTheme.colors.textSecondary,
  chineseBlack: appTheme.colors.bg,
  americanBlue: appTheme.colors.surface,
  ube: appTheme.colors.accent,
  coolGrey: appTheme.colors.muted,
  warmOffWhite: appTheme.colors.textPrimary,

  background: appTheme.colors.bg,
  surface: appTheme.colors.overlay,
  surfaceMuted: appTheme.colors.overlay,
  surfaceElevated: appTheme.colors.surfaceCard,
  border: appTheme.colors.border,
  borderStrong: appTheme.colors.border,

  text: appTheme.colors.textPrimary,
  textMuted: appTheme.colors.textSecondary,
  textFaint: appTheme.colors.muted,

  primary: appTheme.colors.accent,
  primarySoft: appTheme.colors.surfaceCard,
  focusRing: appTheme.colors.textPrimary,
  success: "#B9F0D7",
  warning: "#FFD166",
  danger: appTheme.colors.badgeScorpio,

  chip: appTheme.colors.overlay,
};

/** 4px base grid */
export const spacing = {
  xxs: appTheme.spacing.xs,
  xs: appTheme.spacing.sm,
  sm: appTheme.spacing.md,
  md: appTheme.spacing.lg,
  lg: appTheme.spacing.xl,
  xl: appTheme.spacing.xxl,
  "2xl": 48,
  "3xl": 64,
} as const;

export const radii = {
  sm: appTheme.radii.sm,
  md: appTheme.radii.md,
  lg: appTheme.radii.lg,
  xl: appTheme.radii.xl,
  pill: 999,
};

export const layout = {
  maxContentWidth: 1280,
  /** Visible tab bar pill height (icons + labels only; safe area is separate). */
  tabBarHeight: 52,
  topBarMaxHeight: 56,
  touchTargetMin: 48,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

/** Floating tab bar geometry — keep in sync with app/(tabs)/_layout.tsx */
export const getTabBarMetrics = (bottomInset: number) => {
  const bottomOffset = Math.max(spacing.sm, bottomInset);
  const height = layout.tabBarHeight;
  /** Space reserved above the home indicator for tab bar + breathing room for footer CTAs */
  const clearance = height + bottomOffset + spacing.sm;
  return { bottomOffset, height, clearance };
};

/** Full-width block inside screen horizontal gutter (Session, Profile, Galaxy, etc.). */
export const screenBlock = {
  alignSelf: "stretch" as const,
  width: "100%" as const,
};

export const motion = {
  durationFast: 200,
  durationNormal: 280,
} as const;

export const fontFamilies = canonicalFontFamilies;

/** Same face as the session countdown — for StyleSheet numeric labels. */
export const numericTypography = canonicalNumericTypography;

/** @deprecated Prefer AppText + theme.typography — kept for FocusSectionCard and legacy imports. */
export const typography = typographyTokens;

export const shadows = {
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  soft: {
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
};
