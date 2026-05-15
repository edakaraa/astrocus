export const colors = {
  // Palette (from latest onboarding/auth mock)
  cadetGrey: "#959BB5",
  chineseBlack: "#0A1123",
  americanBlue: "#3A3E6C",
  ube: "#8387C3",
  coolGrey: "#A8ACAC",
  warmOffWhite: "#E8E6C8",

  // App semantic colors
  background: "#0A1123",
  surface: "rgba(255,255,255,0.04)",
  surfaceMuted: "rgba(255,255,255,0.06)",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",

  text: "#E8E6C8",
  textMuted: "#959BB5",
  textFaint: "rgba(149,155,181,0.70)",

  primary: "#8387C3",
  primarySoft: "rgba(131,135,195,0.22)",
  success: "#B9F0D7",
  warning: "#FFD166",
  danger: "#FF6B9D",

  chip: "rgba(255,255,255,0.06)",
};

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
};

export const radii = {
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const fontFamilies = {
  display: "Outfit_800ExtraBold",
  displayBold: "Outfit_700Bold",
  body: "DMSans_500Medium",
  bodyRegular: "DMSans_400Regular",
  mono: "SpaceMono_700Bold",
  monoRegular: "SpaceMono_400Regular",
} as const;

export const typography = {
  title: {
    fontSize: 30,
    fontWeight: "800" as const,
    letterSpacing: -0.4,
    fontFamily: fontFamilies.display,
  },
  h2: {
    fontSize: 22,
    fontWeight: "800" as const,
    letterSpacing: -0.2,
    fontFamily: fontFamilies.display,
  },
  h3: {
    fontSize: 18,
    fontWeight: "700" as const,
    fontFamily: fontFamilies.displayBold,
  },
  body: {
    fontSize: 13,
    fontWeight: "500" as const,
    lineHeight: 19,
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
