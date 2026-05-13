import { CATEGORIES, STARS } from "../../shared/constants";
import { SessionRecord, User } from "../../shared/types";
import { getDateKey } from "./dateKey";

export const getCategoryBonus = (categoryId: string, completedAt: string) => {
  const hours = new Date(completedAt).getHours();

  if (hours >= 6 && hours < 9 && ["meditation", "sports", "reading"].includes(categoryId)) {
    return 0.2;
  }

  if (hours >= 9 && hours < 17 && ["work", "coding", "project"].includes(categoryId)) {
    return 0.2;
  }

  if (hours >= 20 && hours < 23 && categoryId === "creativity") {
    return 0.2;
  }

  return 0;
};

export const calculateStardust = (input: {
  durationMinutes: number;
  categoryId: string;
  currentStreak: number;
  pauseCount: number;
  completedAt: string;
}) => {
  const base = input.durationMinutes * 10;
  const streakBonus = Math.min(input.currentStreak * 0.1, 0.5);
  const categoryBonus = getCategoryBonus(input.categoryId, input.completedAt);
  const fullSessionBonus = input.pauseCount === 0 ? 0.1 : 0;
  const totalBonus = streakBonus + categoryBonus + fullSessionBonus;

  return Math.round(base + base * totalBonus);
};

export const getUnlockedStars = (totalStardust: number) => {
  return STARS.filter((star) => star.requiredStardust <= totalStardust).map((star) => star.id);
};

export const createDailySummary = (sessions: SessionRecord[], user: User | null) => {
  const todayKey = getDateKey(new Date().toISOString());
  const todaySessions = sessions.filter((session) => getDateKey(session.completedAt) === todayKey);
  const totalMinutes = todaySessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const categoryBreakdown = CATEGORIES.map((category) => ({
    categoryId: category.id,
    minutes: todaySessions
      .filter((session) => session.categoryId === category.id)
      .reduce((sum, session) => sum + session.durationMinutes, 0),
  })).filter((item) => item.minutes > 0);

  return {
    totalMinutes,
    completedSessions: todaySessions.length,
    goalProgress: user ? Math.min(totalMinutes / user.dailyGoalMinutes, 1) : 0,
    categoryBreakdown,
  };
};

