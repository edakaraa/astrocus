import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { categories, stars } from "./constants";
import { db, ServerSession, ServerUser } from "./db";

const app = express();
app.use(cors());
app.use(express.json());

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

const profileSchema = z.object({
  username: z.string().min(2).optional(),
  avatar: z.string().optional(),
  galaxyName: z.string().min(2).optional(),
  language: z.enum(["tr", "en"]).optional(),
  targetStarId: z.string().optional(),
  onboardingCompleted: z.boolean().optional(),
  dailyGoalMinutes: z.number().min(15).max(480).optional(),
}).partial();

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

const getDateKey = (value: string) => new Date(value).toLocaleDateString("en-CA");

const categoryBonus = (categoryId: string, completedAt: string) => {
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

const nextStreak = (user: ServerUser, completedAt: string) => {
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

const calculateStardust = (input: {
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

const payloadForUser = (user: ServerUser, token: string) => {
  const currentDb = db.readDb();
  return {
    token,
    user,
    sessions: currentDb.sessions.filter((session) => session.userId === user.id),
    unlockedStarIds: db.getUnlockedStarIds(user.totalStardust),
  };
};

const requireUser = (authorizationHeader?: string | string[]) => {
  const rawToken = typeof authorizationHeader === "string" ? authorizationHeader.replace("Bearer ", "") : "";
  const user = db.getUserByToken(rawToken);
  return { rawToken, user };
};

app.get("/health", (_request, response) => {
  response.json({ status: "ok", categories, stars });
});

app.get("/bootstrap", (request, response) => {
  const { rawToken, user } = requireUser(request.headers.authorization);

  if (!user) {
    response.status(401).send("Unauthorized");
    return;
  }

  response.json(payloadForUser(user, rawToken));
});

app.post("/auth/register", async (request, response) => {
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

app.post("/auth/login", async (request, response) => {
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

app.post("/auth/provider", (request, response) => {
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

app.patch("/profile", (request, response) => {
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

app.post("/sessions/complete", (request, response) => {
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

app.post("/sessions/sync", (request, response) => {
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

app.listen(4000, () => {
  console.log("Astrocus API listening on http://localhost:4000");
});
