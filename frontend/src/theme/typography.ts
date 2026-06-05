import type { TextStyle } from "react-native";

export const fontFamilies = {
  display: "Outfit_800ExtraBold",
  displayBold: "Outfit_700Bold",
  body: "DMSans_500Medium",
  bodyRegular: "DMSans_400Regular",
  mono: "SpaceMono_700Bold",
  monoRegular: "SpaceMono_400Regular",
} as const;

const textPrimary = "#E8E4C0";
const textSecondary = "#959BB5";
const textMuted = textSecondary;
const textFaint = "#8A8CAC";
const accent = "#8387C3";
const warmOffWhite = textPrimary;
const success = "#B9F0D7";
const warning = "#FFD166";
const danger = "#FF6B6B";

const titleStyle: TextStyle = {
  fontSize: 30,
  lineHeight: 36,
  fontWeight: "800",
  letterSpacing: -0.4,
  fontFamily: fontFamilies.display,
  color: textPrimary,
};

/**
 * Active session countdown (`sessionDisplay`) — Outfit ExtraBold.
 * Spread on numeric UI app-wide; never mutate `sessionDisplay` itself.
 */
export const numericTypography: Pick<TextStyle, "fontFamily" | "letterSpacing"> = {
  fontFamily: fontFamilies.display,
  letterSpacing: -0.3,
};

/** Uppercase section headings (settings blocks, focus cards, galaxy sections). */
const sectionLabelStyle: TextStyle = {
  fontSize: 10,
  lineHeight: 13,
  fontWeight: "800",
  letterSpacing: 0.8,
  textTransform: "uppercase",
  fontFamily: fontFamilies.body,
  color: textFaint,
};

/** Filter / pill chip labels (inactive state). */
const chipLabelStyle: TextStyle = {
  fontSize: 11,
  lineHeight: 14,
  fontWeight: "800",
  fontFamily: fontFamilies.body,
  color: textFaint,
};

/** Canonical typography tokens — consumed by AppText and re-exported via shared/theme. */
export const typographyTokens = {
  hero: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "700",
    fontFamily: fontFamilies.displayBold,
    letterSpacing: -0.2,
    color: textPrimary,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    fontFamily: fontFamilies.displayBold,
    letterSpacing: -0.15,
    color: textPrimary,
  },
  card: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: "700",
    fontFamily: fontFamilies.displayBold,
    color: textPrimary,
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: fontFamilies.body,
    color: textPrimary,
  },
  bodyMuted: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: fontFamilies.body,
    color: textMuted,
  },
  bodyLarge: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "400",
    fontFamily: fontFamilies.bodyRegular,
    color: textPrimary,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "500",
    fontFamily: fontFamilies.body,
    color: textMuted,
  },
  micro: {
    fontSize: 11,
    lineHeight: 14,
    fontWeight: "500",
    fontFamily: fontFamilies.body,
    color: textSecondary,
  },

  h1: titleStyle,
  h2: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "800",
    letterSpacing: -0.2,
    fontFamily: fontFamilies.display,
    color: textPrimary,
  },
  h3: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    fontFamily: fontFamilies.displayBold,
    color: textPrimary,
  },
  label: sectionLabelStyle,
  buttonLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
    fontFamily: fontFamilies.displayBold,
    letterSpacing: -0.1,
    color: warmOffWhite,
  },
  link: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "700",
    fontFamily: fontFamilies.body,
    color: accent,
  },
  chipLabel: chipLabelStyle,
  chipLabelActive: {
    ...chipLabelStyle,
    color: warmOffWhite,
  },
  modalTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    fontFamily: fontFamilies.displayBold,
    color: textPrimary,
  },
  modalMessage: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    fontFamily: fontFamilies.body,
    color: textMuted,
  },
  sessionDisplay: {
    fontFamily: fontFamilies.display,
    letterSpacing: -0.3,
    color: textPrimary,
  },
  numeric: {
    ...numericTypography,
    fontSize: 16,
    color: textPrimary,
  },
  numericCompact: {
    ...numericTypography,
    fontSize: 12,
    lineHeight: 16,
    color: textPrimary,
  },
  numericLarge: {
    ...numericTypography,
    fontSize: 22,
    color: warmOffWhite,
    textAlign: "center",
  },
  numericHero: {
    ...numericTypography,
    fontSize: 28,
    color: textPrimary,
  },
  focusSectionLabel: sectionLabelStyle,
  focusCta: {
    fontSize: 15,
    lineHeight: 18,
    fontFamily: fontFamilies.displayBold,
    color: warmOffWhite,
    textAlign: "center",
  },
  mono: {
    ...numericTypography,
    fontSize: 40,
    color: textPrimary,
  },

  weeklyReportTitle: sectionLabelStyle,
  weeklyReportCta: {
    color: accent,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: "700",
  },
  weeklyReportStatChip: {
    ...numericTypography,
    fontSize: 12,
    lineHeight: 16,
    color: textMuted,
  },

  sessionGhostAction: {
    color: textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    fontWeight: "700",
  },
  sessionHeroSubtitle: {
    color: textMuted,
    fontFamily: fontFamilies.bodyRegular,
    lineHeight: 18,
    textAlign: "center",
  },
  sessionHeroStatNumber: {
    ...numericTypography,
    color: warmOffWhite,
  },
  sessionHeroStatLabel: {
    color: textMuted,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    marginTop: 4,
    textTransform: "uppercase",
  },
  sessionPresetTitle: {
    color: textPrimary,
    fontFamily: fontFamilies.displayBold,
    textAlign: "center",
  },
  sessionPresetDuration: {
    ...numericTypography,
    color: textSecondary,
    textAlign: "center",
  },
  sessionPresetEmoji: {
    fontSize: 20,
    lineHeight: 24,
  },
  sessionCosmicQuote: {
    color: textPrimary,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 15,
    fontStyle: "italic",
    lineHeight: 22,
    textAlign: "left",
  },
  sessionCosmicAttribution: {
    color: textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "left",
  },
  sessionWeekStars: {
    ...numericTypography,
    color: warning,
    fontSize: 14,
    letterSpacing: 0,
  },
  sessionWeekLabel: {
    color: textMuted,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
  },
  sessionWeekTotal: {
    ...numericTypography,
    fontSize: 22,
    color: warmOffWhite,
    textAlign: "center",
  },
  sessionFailedTitle: {
    color: danger,
    fontFamily: fontFamilies.displayBold,
    fontSize: 16,
    fontWeight: "800",
  },
  sessionFailedText: {
    color: textMuted,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
  },
  sessionSoftButtonText: {
    color: textPrimary,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "700",
  },
  weeklyReportBody: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
    fontFamily: fontFamilies.body,
    color: textPrimary,
  },
  sessionActiveSubtitle: {
    color: textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4,
    textAlign: "center",
  },

  galaxyLoading: {
    color: textMuted,
    fontFamily: fontFamilies.body,
    fontSize: 14,
  },
  galaxySummaryLabel: {
    color: textPrimary,
    fontFamily: fontFamilies.displayBold,
    fontSize: 14,
    fontWeight: "800",
  },
  galaxySummarySubtext: {
    color: textMuted,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    marginTop: 3,
  },
  galaxySectionTitle: {
    ...sectionLabelStyle,
    marginBottom: 2,
  },
  galaxyConstName: {
    color: textPrimary,
    fontFamily: fontFamilies.displayBold,
    fontSize: 15,
    fontWeight: "800",
  },
  galaxyConstSubname: {
    color: textFaint,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
    lineHeight: 14,
    marginTop: 1,
  },
  galaxyConstCount: {
    ...numericTypography,
    color: textMuted,
    fontSize: 13,
  },
  galaxyActivePillText: {
    color: accent,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
  },
  galaxyNextPillText: {
    color: warning,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
  },
  galaxyLockedPillText: {
    color: textFaint,
    fontFamily: fontFamilies.body,
    fontSize: 10,
    fontWeight: "800",
  },
  galaxyStarName: {
    color: textMuted,
    fontFamily: fontFamilies.displayBold,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 6,
    textAlign: "center",
  },
  galaxyStatusText: {
    ...numericTypography,
    fontSize: 9,
  },
  galaxyConstDesc: {
    color: textFaint,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
    lineHeight: 16,
  },
  galaxyLockedHint: {
    color: textFaint,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 11,
    fontStyle: "italic",
    lineHeight: 16,
    marginTop: 2,
  },
  galaxyCompletedBannerText: {
    color: success,
    fontFamily: fontFamilies.body,
    fontSize: 11,
    fontWeight: "800",
  },
  galaxyEmptyText: {
    color: textFaint,
    fontFamily: fontFamilies.bodyRegular,
    fontSize: 13,
    lineHeight: 18,
  },
  legalTitle: titleStyle,
  legalHeading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700",
    fontFamily: fontFamilies.displayBold,
    color: accent,
  },
  legalBody: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "400",
    fontFamily: fontFamilies.bodyRegular,
    color: textMuted,
  },
  legalDangerTitle: {
    ...titleStyle,
    color: danger,
  },
} as const satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typographyTokens;
