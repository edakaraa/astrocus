import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { db, ServerSession } from "../db";
import {
  calculateStardust,
  getDateKey,
  nextStreak,
  payloadForUser,
  requireUser,
} from "../helpers";

const router = Router();

const completeSessionSchema = z.object({
  categoryId: z.string(),
  durationMinutes: z.number().min(5).max(120),
  startedAt: z.string(),
  completedAt: z.string(),
  pauseCount: z.number().min(0).max(1),
});

const syncSessionsSchema = z.object({
  sessions: z.array(
    z.object({
      id: z.string(),
      categoryId: z.string(),
      durationMinutes: z.number().min(5).max(120),
      startedAt: z.string(),
      completedAt: z.string(),
    }),
  ),
});

router.post("/sessions/complete", (request, response) => {
  const { rawToken, user } = requireUser(request.headers.authorization);

  if (!user) {
    response.status(401).send("Unauthorized");
    return;
  }

  const parsed = completeSessionSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).send(parsed.error.message);
    return;
  }

  const verifiedDuration = Math.max(
    5,
    Math.round(
      (new Date(parsed.data.completedAt).getTime() - new Date(parsed.data.startedAt).getTime()) /
        (1000 * 60),
    ),
  );
  const streak = nextStreak(user, parsed.data.completedAt);
  const stardust = calculateStardust({
    durationMinutes: verifiedDuration,
    categoryId: parsed.data.categoryId,
    completedAt: parsed.data.completedAt,
    streak,
    pauseCount: parsed.data.pauseCount,
  });

  const currentDb = db.readDb();
  const session: ServerSession = {
    id: randomUUID(),
    userId: user.id,
    categoryId: parsed.data.categoryId,
    durationMinutes: verifiedDuration,
    stardustEarned: stardust,
    startedAt: parsed.data.startedAt,
    completedAt: parsed.data.completedAt,
    isOffline: false,
  };

  currentDb.sessions.push(session);
  currentDb.users = currentDb.users.map((item) => {
    if (item.id !== user.id) {
      return item;
    }

    const nextTotalStardust = item.totalStardust + stardust;

    return {
      ...item,
      totalStardust: nextTotalStardust,
      currentStreak: streak,
      longestStreak: Math.max(item.longestStreak, streak),
      lastSessionDate: getDateKey(parsed.data.completedAt),
    };
  });
  db.writeDb(currentDb);

  const updatedUser = currentDb.users.find((item) => item.id === user.id)!;
  const previousUnlocked = db.getUnlockedStarIds(user.totalStardust);
  const nextUnlocked = db.getUnlockedStarIds(updatedUser.totalStardust);
  const unlockedStarId = nextUnlocked.find((starId) => !previousUnlocked.includes(starId)) ?? null;

  response.json({
    payload: payloadForUser(updatedUser, rawToken),
    stardustEarned: stardust,
    unlockedStarId,
  });
});

router.post("/sessions/sync", (request, response) => {
  const { rawToken, user } = requireUser(request.headers.authorization);

  if (!user) {
    response.status(401).send("Unauthorized");
    return;
  }

  const parsed = syncSessionsSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).send(parsed.error.message);
    return;
  }

  const currentDb = db.readDb();
  let nextUser = user;

  for (const syncedSession of parsed.data.sessions) {
    const alreadyExists = currentDb.sessions.some((session) => session.id === syncedSession.id);

    if (alreadyExists) {
      continue;
    }

    const streak = nextStreak(nextUser, syncedSession.completedAt);
    const stardust = calculateStardust({
      durationMinutes: syncedSession.durationMinutes,
      categoryId: syncedSession.categoryId,
      completedAt: syncedSession.completedAt,
      streak,
      pauseCount: 0,
    });

    currentDb.sessions.push({
      id: syncedSession.id,
      userId: user.id,
      categoryId: syncedSession.categoryId,
      durationMinutes: syncedSession.durationMinutes,
      stardustEarned: stardust,
      startedAt: syncedSession.startedAt,
      completedAt: syncedSession.completedAt,
      isOffline: true,
    });

    nextUser = {
      ...nextUser,
      totalStardust: nextUser.totalStardust + stardust,
      currentStreak: streak,
      longestStreak: Math.max(nextUser.longestStreak, streak),
      lastSessionDate: getDateKey(syncedSession.completedAt),
    };
  }

  currentDb.users = currentDb.users.map((item) => (item.id === user.id ? nextUser : item));
  db.writeDb(currentDb);
  response.json(payloadForUser(nextUser, rawToken));
});

export default router;
