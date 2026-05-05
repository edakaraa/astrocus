import { Router } from "express";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { stars } from "../constants";
import { db, ServerUser } from "../db";
import { payloadForUser } from "../helpers";

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  username: z.string().min(2),
  galaxyName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const providerSchema = z.object({
  provider: z.enum(["google", "apple"]),
});

router.post("/auth/register", async (request, response) => {
  const parsed = registerSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).send(parsed.error.message);
    return;
  }

  const currentDb = db.readDb();
  const existingUser = currentDb.users.find((user) => user.email === parsed.data.email);

  if (existingUser) {
    response.status(409).send("User already exists");
    return;
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user: ServerUser = {
    id: randomUUID(),
    email: parsed.data.email,
    passwordHash,
    username: parsed.data.username,
    avatar: "🌙",
    galaxyName: parsed.data.galaxyName,
    language: "tr",
    totalStardust: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    targetStarId: stars[0].id,
    onboardingCompleted: false,
    dailyGoalMinutes: 120,
  };

  currentDb.users.push(user);
  db.writeDb(currentDb);
  const token = db.createToken(user.id);
  response.json(payloadForUser(user, token));
});

router.post("/auth/login", async (request, response) => {
  const parsed = loginSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).send(parsed.error.message);
    return;
  }

  const currentDb = db.readDb();
  const user = currentDb.users.find((item) => item.email === parsed.data.email);

  if (!user) {
    response.status(404).send("User not found");
    return;
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);

  if (!matches) {
    response.status(401).send("Invalid credentials");
    return;
  }

  const token = db.createToken(user.id);
  response.json(payloadForUser(user, token));
});

router.post("/auth/provider", (request, response) => {
  const parsed = providerSchema.safeParse(request.body);

  if (!parsed.success) {
    response.status(400).send(parsed.error.message);
    return;
  }

  const currentDb = db.readDb();
  const providerEmail = `${parsed.data.provider}-${Date.now()}@astrocus.dev`;
  const user: ServerUser = {
    id: randomUUID(),
    email: providerEmail,
    passwordHash: "provider-auth",
    username: `${parsed.data.provider}_explorer`,
    avatar: parsed.data.provider === "google" ? "☄️" : "🪐",
    galaxyName: `${parsed.data.provider} galaxy`,
    language: "tr",
    totalStardust: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    targetStarId: stars[0].id,
    onboardingCompleted: false,
    dailyGoalMinutes: 120,
  };

  currentDb.users.push(user);
  db.writeDb(currentDb);
  const token = db.createToken(user.id);
  response.json(payloadForUser(user, token));
});

export default router;
