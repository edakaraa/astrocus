// Günlük özet ve yıldız eşikleri (sunucu ödülleri burada hesaplanmaz)

import { CATEGORIES, STARS } from "../../shared/constants";
import { SessionRecord, User } from "../../shared/types";
import { getDateKey } from "./dateKey";

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
