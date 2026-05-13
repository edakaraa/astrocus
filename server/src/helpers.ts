import type { User } from "@prisma/client";

export const getDateKey = (value: string) => new Date(value).toLocaleDateString("en-CA");

export type StreakUser = Pick<User, "lastSessionDate" | "currentStreak" | "longestStreak">;

export const categoryBonus = (categoryId: string, completedAt: string) => {
  const hour = new Date(completedAt).getHours();

  if (hour >= 6 && hour < 9 && ["meditation", "sports", "reading"].includes(categoryId)) {
    return 0.2;
  }

  if (hour >= 9 && hour < 17 && ["work", "coding", "project"].includes(categoryId)) {
    return 0.2;
  }

  if (hour >= 20 && hour < 23 && categoryId === "creativity") {
    return 0.2;
  }

  return 0;
};

export const nextStreak = (user: StreakUser, completedAt: string) => {
  const completedDate = getDateKey(completedAt);

  if (!user.lastSessionDate) {
    return 1;
  }

  const lastDate = new Date(user.lastSessionDate);
  const currentDate = new Date(completedDate);
  const diffDays = Math.round((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return user.currentStreak;
  }

  if (diffDays === 1) {
    return user.currentStreak + 1;
  }

  return 1;
};

export const calculateStardust = (input: {
  durationMinutes: number;
  categoryId: string;
  completedAt: string;
  streak: number;
  pauseCount: number;
}) => {
  const base = input.durationMinutes * 10;
  const streakBonus = Math.min(input.streak * 0.1, 0.5);
  const fullSessionBonus = input.pauseCount === 0 ? 0.1 : 0;
  const totalBonus = streakBonus + categoryBonus(input.categoryId, input.completedAt) + fullSessionBonus;
  return Math.round(base + base * totalBonus);
};
