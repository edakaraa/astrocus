import { Router } from "express";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { buildAuthPayload, getUnlockedStarIds } from "../authPayload";
import { calculateStardust, getDateKey, nextStreak } from "../helpers";
import { prisma } from "../lib/prisma";
import { getAuthContext } from "../middlewares/auth";

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

router.post("/sessions/complete", async (request, response) => {
  const { rawToken, user } = await getAuthContext(request.headers.authorization);

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
      (new Date(parsed.data.completedAt).getTime() - new Date(parsed.data.startedAt).getTime()) / (1000 * 60),
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

  const previousUnlocked = getUnlockedStarIds(user.totalStardust);
  const sessionId = randomUUID();

  const updatedUser = await prisma.$transaction(async (tx) => {
    await tx.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        categoryId: parsed.data.categoryId,
        durationMinutes: verifiedDuration,
        stardustEarned: stardust,
        startedAt: new Date(parsed.data.startedAt),
        completedAt: new Date(parsed.data.completedAt),
        isOffline: false,
      },
    });

    return tx.user.update({
      where: { id: user.id },
      data: {
        totalStardust: user.totalStardust + stardust,
        currentStreak: streak,
        longestStreak: Math.max(user.longestStreak, streak),
        lastSessionDate: getDateKey(parsed.data.completedAt),
      },
    });
  });

  const nextUnlocked = getUnlockedStarIds(updatedUser.totalStardust);
  const unlockedStarId = nextUnlocked.find((starId) => !previousUnlocked.includes(starId)) ?? null;

  const payload = await buildAuthPayload(updatedUser.id, rawToken);
  response.json({
    payload,
    stardustEarned: stardust,
    unlockedStarId,
  });
});

router.post("/sessions/sync", async (request, response) => {
  const { rawToken, user } = await getAuthContext(request.headers.authorization);

  if (!user) {
    response.status(401).send("Unauthorized");
    return;
  }

  const parsed = syncSessionsSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).send(parsed.error.message);
    return;
  }

  let nextUser = user;

  for (const syncedSession of parsed.data.sessions) {
    const alreadyExists = await prisma.session.findUnique({ where: { id: syncedSession.id } });

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

    nextUser = await prisma.$transaction(async (tx) => {
      await tx.session.create({
        data: {
          id: syncedSession.id,
          userId: user.id,
          categoryId: syncedSession.categoryId,
          durationMinutes: syncedSession.durationMinutes,
          stardustEarned: stardust,
          startedAt: new Date(syncedSession.startedAt),
          completedAt: new Date(syncedSession.completedAt),
          isOffline: true,
        },
      });

      return tx.user.update({
        where: { id: user.id },
        data: {
          totalStardust: nextUser.totalStardust + stardust,
          currentStreak: streak,
          longestStreak: Math.max(nextUser.longestStreak, streak),
          lastSessionDate: getDateKey(syncedSession.completedAt),
        },
      });
    });
  }

  const payload = await buildAuthPayload(nextUser.id, rawToken);
  response.json(payload);
});

export default router;
