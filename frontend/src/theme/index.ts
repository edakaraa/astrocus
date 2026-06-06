import { DAILY_GOAL_STARDUST_REWARD } from "../shared/stardustEconomy";
import { typographyTokens, type TypographyVariant } from "./typography";

const textPrimary = "#E8E4C0";
const textSecondary = "#959BB5";
const surface = "#3A3E6C";
const accent = "#8387C3";
const bg = "#0A1123";

const theme = {
  colors: {
    bg,
    surface,
    accent,
    textPrimary,
    textSecondary,
    muted: "#8A8CAC",
    border: "rgba(131,135,195,0.25)",
    overlay: "rgba(10,17,35,0.5)",
    surfaceCard: "rgba(58, 62, 108, 0.6)",
    starGradientMid: "#1a1f3a",
    badgeDiscipline: "#FF8C42",
    badgeLeo: "#FFD700",
    badgeScorpio: "#FF6B6B",
    badgePisces: "#87CEEB",
  },
  radii: {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 28,
  },
  typography: typographyTokens,
  layout: {
    avatarSize: 80,
    avatarRingWidth: 2,
    avatarGlowRadius: 12,
    avatarGlowOpacity: 0.6,
    settingsIconSize: 22,
    topBarMinHeight: 40,
    topBarActionSize: 40,
    topBarSettingsOffsetTop: 6,
    topBarBottomGap: 12,
    lockIconSize: 16,
    categoryDotSize: 10,
    rewardToastBottom: 90,
    goalSheetMinMinutes: 15,
    /** Upper bound = one full day (24 × 60). */
    goalSheetMaxMinutes: 24 * 60,
    goalSheetStep: 5,
    goalSheetDefaultMinutes: 60,
    starCount: 80,
    starCountNormal: 65,
    starDelayMaxMs: 3000,
    starSizeNormalMin: 1,
    starSizeNormalMax: 2.5,
    starSizeHeroMin: 3,
    starSizeHeroMax: 5,
    rewardToastDurationMs: 3000,
    dailyGoalStardustReward: DAILY_GOAL_STARDUST_REWARD,
  },
} as const;

export type ThemeTypographyVariant = TypographyVariant;

export { typographyTokens, fontFamilies, numericTypography } from "./typography";
export default theme;
