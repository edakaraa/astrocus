// [GÖREV 1] — API_URL kaldırıldı; taban URL artık yalnızca api.ts içinde extra.apiUrl ile

import { Category, Star } from "./types";

export const STORAGE_KEYS = {
  authToken: "astrocus.authToken",
  language: "astrocus.language",
  onboardingSeen: "astrocus.onboardingSeen",
  pendingSessions: "astrocus.pendingSessions",
  analyticsEvents: "astrocus.analyticsEvents",
  demoAuthPayload: "astrocus.demoAuthPayload",
} as const;

export const DEFAULT_DURATION_MINUTES = 25;
export const BACKGROUND_TOLERANCE_SECONDS = 20;
export const WARNING_THRESHOLD_SECONDS = 10;
export const PAUSE_LIMIT = 1;

export const CATEGORIES: Category[] = [
  { id: "work", key: "category.work", emoji: "💼" },
  { id: "reading", key: "category.reading", emoji: "📚" },
  { id: "project", key: "category.project", emoji: "🛠" },
  { id: "creativity", key: "category.creativity", emoji: "🎨" },
  { id: "sports", key: "category.sports", emoji: "🏃" },
  { id: "meditation", key: "category.meditation", emoji: "🧘" },
  { id: "coding", key: "category.coding", emoji: "💻" },
  { id: "general", key: "category.general", emoji: "✨" },
];

export const STARS: Star[] = [
  { id: "luna", name: "İlk Adım", description: "Odak yolculuğunun ilk yıldızı.", requiredStardust: 0 },
  { id: "solis", name: "Odak Ustası", description: "Düzenli seanslarla açılan güçlü yıldız.", requiredStardust: 250 },
  { id: "nova", name: "Gece Kuşu", description: "Sessiz saatlerde istikrar kazananlara.", requiredStardust: 600 },
  { id: "aurora", name: "Derin Uzay", description: "Uzun odak serilerinin mor ışıltısı.", requiredStardust: 1000 },
  { id: "zenith", name: "Yıldız Tozu", description: "Galaksini büyüten son parlak ödül.", requiredStardust: 1500 },
];

export const AVATARS = ["🌙", "🪐", "☄️", "🌠", "✨"];
