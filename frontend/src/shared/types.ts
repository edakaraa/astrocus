export type Language = "tr" | "en";
export type AuthMode = "login" | "register";

export type Category = {
  id: string;
  key: string;
  emoji: string;
};

// ---------------------------------------------------------------------------
// Constellation catalog type (mirrors DB constellations table)
// ---------------------------------------------------------------------------
export type Constellation = {
  id: string;
  /** Legacy / DB column; avoid in UI (burç-style Turkish labels). */
  nameTr: string;
  nameEn: string;
  /** IAU Latin constellation name shown in the app (e.g. Capricornus). */
  nameAstronomical: string;
  /** Genitive form used in star atlases (e.g. "Orionis"). */
  genitiveEn: string;
  /** Deprecated in UI — horoscope glyph; kept for DB compat only. */
  symbol: string;
  descriptionTr: string;
  descriptionEn: string;
  sortOrder: number;
  starCount: number;
  badgeId: string;
};

// ---------------------------------------------------------------------------
// Star — extended with constellation linking
// ---------------------------------------------------------------------------
export type Star = {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  /** Per-star unlock cost from catalog; legacy stars use static values. */
  requiredStardust: number;
  constellationId: string | null;
  /** Sort order within its constellation (1–N). Null for legacy stars. */
  starSortOrder: number;
};

// Star enriched with the user's unlock status
export type StarWithProgress = Star & {
  isUnlocked: boolean;
  unlockedAt: string | null;
};

// ---------------------------------------------------------------------------
// Constellation with full star progress for the Sky screen
// ---------------------------------------------------------------------------
export type ConstellationProgress = {
  constellation: Constellation;
  stars: StarWithProgress[];
  isActive: boolean;
  isCompleted: boolean;
  isStarter: boolean;
  /** 0 = onboarding seçimi; 1–12 = kilit sırası (star_count artan) */
  unlockOrder: number;
  isLocked: boolean;
  startedAt: string | null;
  completedAt: string | null;
  unlockedCount: number;
};

// ---------------------------------------------------------------------------
// Dynamic pricing tier (3-tier curve)
// ---------------------------------------------------------------------------
export type StarCostTier = "easy" | "medium" | "mastery";

export type StarCostInfo = {
  tier: StarCostTier;
  completedCount: number;
  costPerStar: number;
};

// ---------------------------------------------------------------------------
// RPC response types
// ---------------------------------------------------------------------------
export type UnlockStarResult = {
  starId: string;
  cost: number;
  totalStardust: number;
  targetStarId: string;
  constellationCompleted: boolean;
  newBadgeId: string | null;
  nextConstellationId: string | null;
};

export type CancelSessionResult = {
  saved: boolean;
  sessionId?: string;
  stardustEarned: number;
  minutesFocused: number;
  totalStardust?: number;
};

// User constellation progress row (mirrors user_constellations table)
export type UserConstellationRow = {
  constellationId: string;
  startedAt: string | null;
  completedAt: string | null;
  isStarter: boolean;
  unlockOrder: number;
};

// ---------------------------------------------------------------------------
// Core domain types (unchanged or backwards-compatible)
// ---------------------------------------------------------------------------
export type User = {
  id: string;
  email: string;
  username: string;
  displayName?: string | null;
  birthdate?: string | null;
  favoritePlanet?: string | null;
  avatar: string;
  galaxyName: string;
  language: Language;
  totalStardust: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  targetStarId: string;
  /** Currently active constellation the user is working through */
  activeConstellationId: string | null;
  onboardingCompleted: boolean;
  dailyGoalMinutes: number;
};

export type SessionRecord = {
  id: string;
  userId: string;
  categoryId: string;
  durationMinutes: number;
  stardustEarned: number;
  pauseUsed: boolean;
  startedAt: string;
  completedAt: string;
  isOffline: boolean;
};

export type PendingSession = {
  id: string;
  categoryId: string;
  durationMinutes: number;
  startedAt: string;
  completedAt: string;
};

export type DailySummary = {
  totalMinutes: number;
  completedSessions: number;
  goalProgress: number;
  categoryBreakdown: Array<{ categoryId: string; minutes: number }>;
};

/** Express GET /analytics/summary */
export type AnalyticsSummary = {
  totalFocusMinutes: number;
  weekFocusMinutes: number[];
  categoryDistribution: Array<{ categoryId: string; minutes: number; percentage: number }>;
  streakCount: number;
  longestStreak: number;
  totalStardust: number;
};

export type CelebrationPayload = {
  stardustEarned: number;
  streakCount?: number;
  pendingSync?: boolean;
  unlockedStarId: string | null;
  newBadgeIds?: string[];
  galacticAdvice?: string;
  /** Set when a full constellation was just completed */
  completedConstellationId?: string | null;
} | null;

export type AuthPayload = {
  token: string;
  user: User;
  sessions: SessionRecord[];
  unlockedStarIds: string[];
  earnedBadgeIds: string[];
  /** User's constellation progress rows */
  constellationProgress: UserConstellationRow[];
};

export type TimerStatus = "idle" | "running" | "paused" | "completed" | "failed";
