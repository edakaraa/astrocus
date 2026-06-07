import { CATEGORY_ICON } from "./appIcons";
import { Category, Language, Star } from "./types";
import {
  STARDUST_PER_MINUTE,
  STAR_COST_EASY,
  STAR_COST_MASTERY,
  STAR_COST_MEDIUM,
  getStarCostInfo,
} from "./stardustEconomy";

export {
  calculateDailyGoalReward,
  STARDUST_PER_MINUTE,
  STARDUST_STREAK_BONUS_MAX,
  STARDUST_STREAK_BONUS_PER_DAY,
  STARDUST_NO_PAUSE_BONUS,
  STAR_COST_EASY,
  STAR_COST_MEDIUM,
  STAR_COST_MASTERY,
  STAR_COST_TIER_THRESHOLDS,
  formatBonusPercent,
  formatStreakBonusPercent,
  getStarCostInfo,
} from "./stardustEconomy";
export type { StarCostInfo, StarCostTier } from "./stardustEconomy";

export { STORAGE_KEYS } from "../constants/storageKeys";

export const DEFAULT_DURATION_MINUTES = 25;
/** Idle setup: no duration chosen until the user picks one. */
export const NO_SESSION_DURATION_SELECTED = 0;
/** PRD: 5–120 dakika arası seans süreleri */
export const SESSION_DURATION_OPTIONS = [5, 15, 25, 45, 60, 90, 120] as const;
export const BACKGROUND_TOLERANCE_SECONDS = 20;
export const WARNING_THRESHOLD_SECONDS = 10;
/** Throttle Android lock-screen ongoing notification updates during focus sessions. */
export const FOCUS_SESSION_NOTIFICATION_UPDATE_SECONDS = 5;
export const PAUSE_LIMIT = 1;
/** Erken bitirmede kısmi ödül eşiği: en az 5 dk veya planlanan sürenin %50'si */
export const MIN_PARTIAL_STARDUST_MINUTES = 5;
export const PARTIAL_STARDUST_DURATION_RATIO = 0.5;

export const getPartialStardustThresholdMinutes = (plannedDurationMinutes: number): number =>
  Math.max(
    MIN_PARTIAL_STARDUST_MINUTES,
    plannedDurationMinutes * PARTIAL_STARDUST_DURATION_RATIO,
  );

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  { id: "work", key: "category.work", icon: CATEGORY_ICON.work },
  { id: "reading", key: "category.reading", icon: CATEGORY_ICON.reading },
  { id: "project", key: "category.project", icon: CATEGORY_ICON.project },
  { id: "creativity", key: "category.creativity", icon: CATEGORY_ICON.creativity },
  { id: "sports", key: "category.sports", icon: CATEGORY_ICON.sports },
  { id: "meditation", key: "category.meditation", icon: CATEGORY_ICON.meditation },
  { id: "coding", key: "category.coding", icon: CATEGORY_ICON.coding },
  { id: "general", key: "category.general", icon: CATEGORY_ICON.general },
];

// ---------------------------------------------------------------------------
// Legacy stars (kept for backward compatibility with existing user data)
// ---------------------------------------------------------------------------
export const LEGACY_STARS: Star[] = [
  { id: "luna",   name: "İlk Adım",    description: "Odak yolculuğunun ilk yıldızı.",             requiredStardust: 0,    constellationId: null, starSortOrder: 1 },
  { id: "solis",  name: "Odak Ustası", description: "Düzenli seanslarla açılan güçlü yıldız.",    requiredStardust: 1250, constellationId: null, starSortOrder: 2 },
  { id: "nova",   name: "Gece Kuşu",   description: "Sessiz saatlerde istikrar kazananlara.",      requiredStardust: 3000, constellationId: null, starSortOrder: 3 },
  { id: "aurora", name: "Derin Uzay",  description: "Uzun odak serilerinin mor ışıltısı.",         requiredStardust: 5000, constellationId: null, starSortOrder: 4 },
  { id: "zenith", name: "Yıldız Tozu", description: "Galaksini büyüten son parlak ödül.",          requiredStardust: 7500, constellationId: null, starSortOrder: 5 },
];

// Takımyıldız + gök yıldızları Supabase'den yüklenir (skyCatalog.ts).
export const STARS: Star[] = [...LEGACY_STARS];

// ---------------------------------------------------------------------------
// Badges
// ---------------------------------------------------------------------------
export type BadgeDefinition = {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
};

export const getBadgeLabel = (badge: BadgeDefinition, language: Language) => ({
  name: language === "en" ? badge.nameEn : badge.name,
  description: language === "en" ? badge.descriptionEn : badge.description,
});

export const BADGES: BadgeDefinition[] = [
  { id: "first_step", name: "İlk Adım", nameEn: "First Step", description: "İlk odak seansını tamamla.", descriptionEn: "Complete your first focus session." },
  { id: "focus_master", name: "Odak Ustası", nameEn: "Focus Master", description: "Toplam 10 saat odaklan.", descriptionEn: "Focus for 10 hours total." },
  { id: "discipline", name: "Disiplin", nameEn: "Discipline", description: "7 günlük seri yakala.", descriptionEn: "Reach a 7-day streak." },
  { id: "cst_aries", name: "Koç Ustası", nameEn: "Aries Master", description: "Koç takımyıldızını tamamla.", descriptionEn: "Complete the Aries constellation." },
  { id: "cst_taurus", name: "Boğa Ustası", nameEn: "Taurus Master", description: "Boğa takımyıldızını tamamla.", descriptionEn: "Complete the Taurus constellation." },
  { id: "cst_gemini", name: "İkizler Ustası", nameEn: "Gemini Master", description: "İkizler takımyıldızını tamamla.", descriptionEn: "Complete the Gemini constellation." },
  { id: "cst_cancer", name: "Yengeç Ustası", nameEn: "Cancer Master", description: "Yengeç takımyıldızını tamamla.", descriptionEn: "Complete the Cancer constellation." },
  { id: "cst_leo", name: "Aslan Ustası", nameEn: "Leo Master", description: "Aslan takımyıldızını tamamla.", descriptionEn: "Complete the Leo constellation." },
  { id: "cst_virgo", name: "Başak Ustası", nameEn: "Virgo Master", description: "Başak takımyıldızını tamamla.", descriptionEn: "Complete the Virgo constellation." },
  { id: "cst_libra", name: "Terazi Ustası", nameEn: "Libra Master", description: "Terazi takımyıldızını tamamla.", descriptionEn: "Complete the Libra constellation." },
  { id: "cst_scorpio", name: "Akrep Ustası", nameEn: "Scorpius Master", description: "Akrep takımyıldızını tamamla.", descriptionEn: "Complete the Scorpius constellation." },
  { id: "cst_sagittarius", name: "Yay Ustası", nameEn: "Sagittarius Master", description: "Yay takımyıldızını tamamla.", descriptionEn: "Complete the Sagittarius constellation." },
  { id: "cst_capricorn", name: "Oğlak Ustası", nameEn: "Capricornus Master", description: "Oğlak takımyıldızını tamamla.", descriptionEn: "Complete the Capricornus constellation." },
  { id: "cst_aquarius", name: "Kova Ustası", nameEn: "Aquarius Master", description: "Kova takımyıldızını tamamla.", descriptionEn: "Complete the Aquarius constellation." },
  { id: "cst_pisces", name: "Balık Ustası", nameEn: "Pisces Master", description: "Balık takımyıldızını tamamla.", descriptionEn: "Complete the Pisces constellation." },
  { id: "cst_ophiuchus", name: "Yılantaşıyıcı Ustası", nameEn: "Ophiuchus Master", description: "Yılantaşıyıcı takımyıldızını tamamla.", descriptionEn: "Complete the Ophiuchus constellation." },
];

import {
  DEFAULT_AVATAR_ID,
  PRESET_AVATAR_IDS,
  PRESET_AVATARS,
  resolveAvatarId,
  type PresetAvatarId,
} from "./presetAvatars";

export {
  DEFAULT_AVATAR_ID,
  PRESET_AVATAR_IDS,
  PRESET_AVATARS,
  resolveAvatarId,
  type PresetAvatarId,
};

/** @deprecated Preset id listesi için `PRESET_AVATAR_IDS` kullan. */
export const AVATARS = PRESET_AVATAR_IDS;
