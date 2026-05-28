import { Category, Star, StarCostInfo, StarCostTier } from "./types";

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
  description: string;
};

export const BADGES: BadgeDefinition[] = [
  { id: "first_step",        name: "İlk Adım",            description: "İlk odak seansını tamamla." },
  { id: "focus_master",      name: "Odak Ustası",          description: "Toplam 10 saat odaklan." },
  { id: "discipline",        name: "Disiplin",             description: "7 günlük seri yakala." },
  // Constellation completion badges
  { id: "cst_aries",         name: "Koç Ustası",           description: "Koç takımyıldızını tamamla." },
  { id: "cst_taurus",        name: "Boğa Ustası",          description: "Boğa takımyıldızını tamamla." },
  { id: "cst_gemini",        name: "İkizler Ustası",       description: "İkizler takımyıldızını tamamla." },
  { id: "cst_cancer",        name: "Yengeç Ustası",        description: "Yengeç takımyıldızını tamamla." },
  { id: "cst_leo",           name: "Aslan Ustası",         description: "Aslan takımyıldızını tamamla." },
  { id: "cst_virgo",         name: "Başak Ustası",         description: "Başak takımyıldızını tamamla." },
  { id: "cst_libra",         name: "Terazi Ustası",        description: "Terazi takımyıldızını tamamla." },
  { id: "cst_scorpio",       name: "Akrep Ustası",         description: "Akrep takımyıldızını tamamla." },
  { id: "cst_sagittarius",   name: "Yay Ustası",           description: "Yay takımyıldızını tamamla." },
  { id: "cst_capricorn",     name: "Oğlak Ustası",         description: "Oğlak takımyıldızını tamamla." },
  { id: "cst_aquarius",      name: "Kova Ustası",          description: "Kova takımyıldızını tamamla." },
  { id: "cst_pisces",        name: "Balık Ustası",         description: "Balık takımyıldızını tamamla." },
  { id: "cst_ophiuchus",     name: "Yılantaşıyıcı Ustası", description: "Yılantaşıyıcı takımyıldızını tamamla." },
];

export const AVATARS = ["🌙", "🪐", "☄️", "🌠", "✨"];
