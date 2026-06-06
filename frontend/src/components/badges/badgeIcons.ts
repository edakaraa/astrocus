import type { AppIconName } from "../../shared/appIcons";

export type BadgeIconConfig = {
  icon: AppIconName;
};

export const BADGE_ICONS: Record<string, BadgeIconConfig> = {
  first_step: { icon: "star-outline" },
  focus_master: { icon: "target" },
  discipline: { icon: "fire" },
  cst_aries: { icon: "zodiac-aries" },
  cst_taurus: { icon: "zodiac-taurus" },
  cst_gemini: { icon: "zodiac-gemini" },
  cst_cancer: { icon: "zodiac-cancer" },
  cst_leo: { icon: "zodiac-leo" },
  cst_virgo: { icon: "zodiac-virgo" },
  cst_libra: { icon: "zodiac-libra" },
  cst_scorpio: { icon: "zodiac-scorpio" },
  cst_sagittarius: { icon: "zodiac-sagittarius" },
  cst_capricorn: { icon: "zodiac-capricorn" },
  cst_aquarius: { icon: "zodiac-aquarius" },
  cst_pisces: { icon: "zodiac-pisces" },
  cst_ophiuchus: { icon: "snake" },
};

export const getBadgeIcon = (id: string): BadgeIconConfig =>
  BADGE_ICONS[id] ?? { icon: "star-four-points" };
