import { STARS } from "../shared/constants";
import { AuthPayload, SessionRecord, User, UserConstellationRow } from "../shared/types";

export type ProfileRow = {
  id: string;
  email: string;
  username: string;
  avatar: string;
  galaxy_name: string;
  language: "tr" | "en";
  total_stardust: number;
  /** Supabase migration uses streak_count; legacy drafts used current_streak */
  streak_count?: number | null;
  current_streak?: number | null;
  longest_streak: number;
  last_session_date: string | null;
  target_star_id: string;
  active_constellation_id?: string | null;
  onboarding_completed: boolean;
  daily_goal_minutes: number;
  display_name?: string | null;
  birthdate?: string | null;
  favorite_planet?: string | null;
};

export type SessionRow = {
  id: string;
  user_id: string;
  category_id: string;
  duration_minutes: number;
  stardust_earned: number;
  pause_used?: boolean | null;
  started_at: string;
  completed_at: string;
  is_offline: boolean;
};

export type UserConstellationDbRow = {
  constellation_id: string;
  started_at: string | null;
  completed_at: string | null;
  is_starter?: boolean | null;
  unlock_order?: number | null;
};

const streakFromProfile = (row: ProfileRow): number =>
  row.streak_count ?? row.current_streak ?? 0;

export const mapProfileToUser = (row: ProfileRow): User => ({
  id: row.id,
  email: row.email,
  username: row.username,
  displayName: row.display_name ?? null,
  birthdate: row.birthdate ?? null,
  favoritePlanet: row.favorite_planet ?? null,
  avatar: row.avatar,
  galaxyName: row.galaxy_name,
  language: row.language,
  totalStardust: row.total_stardust,
  currentStreak: streakFromProfile(row),
  longestStreak: row.longest_streak,
  lastSessionDate: row.last_session_date,
  targetStarId: row.target_star_id,
  activeConstellationId: row.active_constellation_id ?? null,
  onboardingCompleted: row.onboarding_completed,
  dailyGoalMinutes: row.daily_goal_minutes,
});

export const mapSessionRow = (row: SessionRow): SessionRecord => ({
  id: row.id,
  userId: row.user_id,
  categoryId: row.category_id,
  durationMinutes: row.duration_minutes,
  stardustEarned: row.stardust_earned,
  pauseUsed: Boolean(row.pause_used),
  startedAt: row.started_at,
  completedAt: row.completed_at,
  isOffline: row.is_offline,
});

export const mapConstellationProgressRow = (row: UserConstellationDbRow): UserConstellationRow => ({
  constellationId: row.constellation_id,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  isStarter: Boolean(row.is_starter),
  unlockOrder: row.unlock_order ?? 0,
});

export const buildAuthPayload = (
  accessToken: string,
  profile: ProfileRow,
  sessions: SessionRow[],
  unlockedStarIdsFromDb: string[] | null,
  earnedBadgeIds: string[],
  constellationProgressRows: UserConstellationDbRow[],
): AuthPayload => {
  const user = mapProfileToUser(profile);
  const unlockedStarIds =
    unlockedStarIdsFromDb && unlockedStarIdsFromDb.length > 0
      ? unlockedStarIdsFromDb
      : [STARS[0].id];

  return {
    token: accessToken,
    user,
    sessions: sessions.map(mapSessionRow),
    unlockedStarIds,
    earnedBadgeIds,
    constellationProgress: constellationProgressRows.map(mapConstellationProgressRow),
  };
};

export const profileUpdateFromUser = (input: Partial<User>): Record<string, unknown> => {
  const patch: Record<string, unknown> = {};
  if (input.username !== undefined) patch.username = input.username;
  if (input.avatar !== undefined) patch.avatar = input.avatar;
  if (input.galaxyName !== undefined) patch.galaxy_name = input.galaxyName;
  if (input.language !== undefined) patch.language = input.language;
  if (input.targetStarId !== undefined) patch.target_star_id = input.targetStarId;
  if (input.onboardingCompleted !== undefined) patch.onboarding_completed = input.onboardingCompleted;
  if (input.dailyGoalMinutes !== undefined) patch.daily_goal_minutes = input.dailyGoalMinutes;
  if (input.displayName !== undefined) patch.display_name = input.displayName;
  if (input.birthdate !== undefined) patch.birthdate = input.birthdate;
  if (input.favoritePlanet !== undefined) patch.favorite_planet = input.favoritePlanet;
  if (input.activeConstellationId !== undefined) patch.active_constellation_id = input.activeConstellationId;
  return patch;
};
