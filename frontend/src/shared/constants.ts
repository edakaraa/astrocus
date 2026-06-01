import { Category, Language, Star, StarCostInfo, StarCostTier } from "./types";

export const STORAGE_KEYS = {
  authToken: "astrocus.authToken",
  language: "astrocus.language",
  onboardingSeen: "astrocus.onboardingSeen",
  pendingSessions: "astrocus.pendingSessions",
  analyticsEvents: "astrocus.analyticsEvents",
  demoAuthPayload: "astrocus.demoAuthPayload",
  oauthPending: "astrocus.oauthPending",
} as const;

export const DEFAULT_DURATION_MINUTES = 25;
/** PRD: 5–120 dakika arası seans süreleri */
export const SESSION_DURATION_OPTIONS = [5, 15, 25, 45, 60, 90, 120] as const;
export const BACKGROUND_TOLERANCE_SECONDS = 20;
export const WARNING_THRESHOLD_SECONDS = 10;
export const PAUSE_LIMIT = 1;
/** Tamamlanan seanslarda kazanç: 2 ✦/dk (migration 003 ile uyumlu) */
export const STARDUST_PER_MINUTE = 2;
/** Erken bitirmede kısmi ödül eşiği: en az 5 dk veya planlanan sürenin %50'si */
export const MIN_PARTIAL_STARDUST_MINUTES = 5;
export const PARTIAL_STARDUST_DURATION_RATIO = 0.5;

export const getPartialStardustThresholdMinutes = (plannedDurationMinutes: number): number =>
  Math.max(
    MIN_PARTIAL_STARDUST_MINUTES,
    plannedDurationMinutes * PARTIAL_STARDUST_DURATION_RATIO,
  );

// ---------------------------------------------------------------------------
// Dynamic pricing — mirrors compute_star_cost SQL function
// ---------------------------------------------------------------------------
export const STAR_COST_EASY    = 100;  // 0–3 constellations completed
export const STAR_COST_MEDIUM  = 350;  // 4–8 constellations completed
export const STAR_COST_MASTERY = 800;  // 9+ constellations completed

export const getStarCostInfo = (completedCount: number): StarCostInfo => {
  if (completedCount < 4) {
    return { tier: "easy" as StarCostTier, completedCount, costPerStar: STAR_COST_EASY };
  }
  if (completedCount < 9) {
    return { tier: "medium" as StarCostTier, completedCount, costPerStar: STAR_COST_MEDIUM };
  }
  return { tier: "mastery" as StarCostTier, completedCount, costPerStar: STAR_COST_MASTERY };
};

// ---------------------------------------------------------------------------
// Categories
// ---------------------------------------------------------------------------
export const CATEGORIES: Category[] = [
  { id: "work",       key: "category.work",       emoji: "💼" },
  { id: "reading",    key: "category.reading",     emoji: "📚" },
  { id: "project",    key: "category.project",     emoji: "🛠" },
  { id: "creativity", key: "category.creativity",  emoji: "🎨" },
  { id: "sports",     key: "category.sports",      emoji: "🏃" },
  { id: "meditation", key: "category.meditation",  emoji: "🧘" },
  { id: "coding",     key: "category.coding",      emoji: "💻" },
  { id: "general",    key: "category.general",     emoji: "✨" },
];

// ---------------------------------------------------------------------------
// Legacy stars (kept for backward compatibility with existing user data)
// ---------------------------------------------------------------------------
export const LEGACY_STARS: Star[] = [
  { id: "luna",   name: "İlk Adım",    description: "Odak yolculuğunun ilk yıldızı.",             requiredStardust: 0,    constellationId: null, starSortOrder: 1 },
  { id: "solis",  name: "Odak Ustası", description: "Düzenli seanslarla açılan güçlü yıldız.",    requiredStardust: 250,  constellationId: null, starSortOrder: 2 },
  { id: "nova",   name: "Gece Kuşu",   description: "Sessiz saatlerde istikrar kazananlara.",      requiredStardust: 600,  constellationId: null, starSortOrder: 3 },
  { id: "aurora", name: "Derin Uzay",  description: "Uzun odak serilerinin mor ışıltısı.",         requiredStardust: 1000, constellationId: null, starSortOrder: 4 },
  { id: "zenith", name: "Yıldız Tozu", description: "Galaksini büyüten son parlak ödül.",          requiredStardust: 1500, constellationId: null, starSortOrder: 5 },
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
