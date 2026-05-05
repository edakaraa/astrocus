export const colors = {
  // Palette (from provided image)
  mediumSlateBlue: "#5866FF",
  periwinkle: "#B3BFFF",
  columbiaBlue: "#C0E8FF",
  richBlack: "#01001C",
  celadon: "#B9F0D7",

  // App semantic colors
  background: "#03020A",
  surface: "#0B0A1F",
  surfaceMuted: "#121033",
  border: "rgba(179, 191, 255, 0.14)",
  borderStrong: "rgba(179, 191, 255, 0.26)",

  text: "#F0ECFF",
  textMuted: "#9B93CC",
  textFaint: "#5A5480",

  primary: "#5866FF",
  primarySoft: "rgba(88, 102, 255, 0.18)",
  success: "#B9F0D7",
  warning: "#FFD166",
  danger: "#FF6B9D",

  chip: "rgba(179, 191, 255, 0.10)",
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
    shadowColor: colors.periwinkle,
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
