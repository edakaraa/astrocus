import { STARS } from "../shared/constants";
import { AuthPayload, SessionRecord, User } from "../shared/types";
import { getUnlockedStars } from "../context/session/stardust";

export type ProfileRow = {
  id: string;
  email: string;
  username: string;
  avatar: string;
  galaxy_name: string;
  language: "tr" | "en";
  total_stardust: number;
  current_streak: number;
  longest_streak: number;
  last_session_date: string | null;
  target_star_id: string;
  onboarding_completed: boolean;
  daily_goal_minutes: number;
};

export type SessionRow = {
  id: string;
  user_id: string;
  category_id: string;
  duration_minutes: number;
  stardust_earned: number;
  started_at: string;
  completed_at: string;
  pause_count: number;
  is_offline: boolean;
};

export const mapProfileToUser = (row: ProfileRow): User => ({
  id: row.id,
  email: row.email,
  username: row.username,
  avatar: row.avatar,
  galaxyName: row.galaxy_name,
  language: row.language,
  totalStardust: row.total_stardust,
  currentStreak: row.current_streak,
  longestStreak: row.longest_streak,
  lastSessionDate: row.last_session_date,
  targetStarId: row.target_star_id,
  onboardingCompleted: row.onboarding_completed,
  dailyGoalMinutes: row.daily_goal_minutes,
});

export const mapSessionRow = (row: SessionRow): SessionRecord => ({
  id: row.id,
  userId: row.user_id,
  categoryId: row.category_id,
  durationMinutes: row.duration_minutes,
  stardustEarned: row.stardust_earned,
  startedAt: row.started_at,
  completedAt: row.completed_at,
  isOffline: row.is_offline,
});

export const buildAuthPayload = (
  accessToken: string,
  profile: ProfileRow,
  sessions: SessionRow[],
): AuthPayload => {
  const user = mapProfileToUser(profile);
  return {
    token: accessToken,
    user,
    sessions: sessions.map(mapSessionRow),
    unlockedStarIds: getUnlockedStars(user.totalStardust).length
      ? getUnlockedStars(user.totalStardust)
      : [STARS[0].id],
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
  return patch;
};
