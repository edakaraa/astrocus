/**
 * Design tokens — 4px spacing grid, typography scale, layout & motion.
 * Colors tuned for WCAG AA on dark background (#0A1123).
 */
export const colors = {
  cadetGrey: "#959BB5",
  chineseBlack: "#0A1123",
  americanBlue: "#3A3E6C",
  ube: "#8387C3",
  coolGrey: "#A8ACAC",
  warmOffWhite: "#E8E6C8",

  background: "#0A1123",
  surface: "rgba(255,255,255,0.04)",
  surfaceMuted: "rgba(255,255,255,0.06)",
  surfaceElevated: "rgba(255,255,255,0.08)",
  border: "rgba(255,255,255,0.10)",
  borderStrong: "rgba(255,255,255,0.18)",

  /** ~7.2:1 on background */
  text: "#E8E6C8",
  /** ~4.6:1 on background */
  textMuted: "#959BB5",
  textFaint: "rgba(149,155,181,0.75)",

  primary: "#8387C3",
  primarySoft: "rgba(131,135,195,0.22)",
  focusRing: "rgba(232,230,200,0.55)",
  success: "#B9F0D7",
  warning: "#FFD166",
  danger: "#FF6B9D",

  chip: "rgba(255,255,255,0.06)",
};

/** 4px base grid */
export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const layout = {
  maxContentWidth: 1280,
  tabBarHeight: 70,
  topBarMaxHeight: 56,
  touchTargetMin: 48,
  hitSlop: { top: 8, bottom: 8, left: 8, right: 8 },
} as const;

export const motion = {
  durationFast: 200,
  durationNormal: 280,
} as const;

export const fontFamilies = {
  display: "Outfit_800ExtraBold",
  displayBold: "Outfit_700Bold",
  body: "DMSans_500Medium",
  bodyRegular: "DMSans_400Regular",
  mono: "SpaceMono_700Bold",
  monoRegular: "SpaceMono_400Regular",
} as const;

const titleStyle = {
  fontSize: 30,
  lineHeight: 36,
  fontWeight: "800" as const,
  letterSpacing: -0.4,
  fontFamily: fontFamilies.display,
};

export const typography = {
  title: titleStyle,
  h1: titleStyle,
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
    fontFamily: fontFamilies.display,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700" as const,
    fontFamily: fontFamilies.displayBold,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500" as const,
    fontFamily: fontFamilies.body,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400" as const,
    fontFamily: fontFamilies.bodyRegular,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500" as const,
    fontFamily: fontFamilies.body,
  },
  label: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "800" as const,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
    fontFamily: fontFamilies.body,
  },
  mono: {
    fontSize: 40,
    fontWeight: "700" as const,
    letterSpacing: -0.3,
    fontFamily: fontFamilies.mono,
  },
};

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
