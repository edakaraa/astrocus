import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { payloadForUser, requireUser } from "../helpers";

const router = Router();

const profileSchema = z.object({
  username: z.string().min(2).optional(),
  avatar: z.string().optional(),
  galaxyName: z.string().min(2).optional(),
  language: z.enum(["tr", "en"]).optional(),
  targetStarId: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
  dailyGoalMinutes: z.number().min(15).max(480).optional(),
}).partial();

router.patch("/profile", (request, response) => {
  const { rawToken, user } = requireUser(request.headers.authorization);

  if (!user) {
    response.status(401).send("Unauthorized");
    return;
  }

  const parsed = profileSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).send(parsed.error.message);
    return;
  }

  const currentDb = db.readDb();
  const nextUsers = currentDb.users.map((item) =>
    item.id === user.id
      ? {
          ...item,
          ...parsed.data,
        }
      : item,
  );

  currentDb.users = nextUsers;
  db.writeDb(currentDb);

  const updatedUser = nextUsers.find((item) => item.id === user.id)!;
  response.json(payloadForUser(updatedUser, rawToken));
});

export default router;
