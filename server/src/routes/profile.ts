import { Router } from "express";
import { z } from "zod";
import { buildAuthPayload } from "../authPayload";
import { prisma } from "../lib/prisma";
import { getAuthContext } from "../middlewares/auth";

const router = Router();

const profileSchema = z
  .object({
    username: z.string().min(2).optional(),
    avatar: z.string().optional(),
    galaxyName: z.string().min(2).optional(),
    language: z.enum(["tr", "en"]).optional(),
    targetStarId: z.string().optional(),
    onboardingCompleted: z.boolean().optional(),
    dailyGoalMinutes: z.number().min(15).max(480).optional(),
  })
  .partial();

router.patch("/profile", async (request, response) => {
  const { rawToken, user } = await getAuthContext(request.headers.authorization);

  if (!user) {
    response.status(401).send("Unauthorized");
    return;
  }

  const parsed = profileSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).send(parsed.error.message);
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: parsed.data,
  });

  const payload = await buildAuthPayload(user.id, rawToken);
  response.json(payload);
});

export default router;
