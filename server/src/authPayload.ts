import { randomUUID } from "node:crypto";
import type { Session, User } from "@prisma/client";
import { stars } from "./constants";
import { prisma } from "./lib/prisma";

export type PublicUser = Omit<User, "passwordHash">;

export type ClientSessionRecord = {
  id: string;
  userId: string;
  categoryId: string;
  durationMinutes: number;
  stardustEarned: number;
  startedAt: string;
  completedAt: string;
  isOffline: boolean;
};

export type AuthPayload = {
  token: string;
  user: PublicUser;
  sessions: ClientSessionRecord[];
  unlockedStarIds: string[];
};

export const getUnlockedStarIds = (totalStardust: number) =>
  stars.filter((star) => star.requiredStardust <= totalStardust).map((star) => star.id);

export const toPublicUser = (user: User): PublicUser => {
  const { passwordHash: _omit, ...rest } = user;
  return rest;
};

export const toClientSession = (session: Session): ClientSessionRecord => ({
  id: session.id,
  userId: session.userId,
  categoryId: session.categoryId,
  durationMinutes: session.durationMinutes,
  stardustEarned: session.stardustEarned,
  startedAt: session.startedAt.toISOString(),
  completedAt: session.completedAt.toISOString(),
  isOffline: session.isOffline,
});

export const findUserByBearerToken = async (rawToken: string): Promise<User | null> => {
  const row = await prisma.authToken.findUnique({
    where: { token: rawToken },
    include: { user: true },
  });
  return row?.user ?? null;
};

export const createAuthTokenForUser = async (userId: string): Promise<string> => {
  const token = randomUUID();
  await prisma.$transaction([
    prisma.authToken.deleteMany({ where: { userId } }),
    prisma.authToken.create({ data: { token, userId } }),
  ]);
  return token;
};

export const buildAuthPayload = async (userId: string, token: string): Promise<AuthPayload> => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("User not found");
  }

  const sessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { completedAt: "asc" },
  });

  return {
    token,
    user: toPublicUser(user),
    sessions: sessions.map(toClientSession),
    unlockedStarIds: getUnlockedStarIds(user.totalStardust),
  };
};
