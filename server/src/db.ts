import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { stars } from "./constants";

export type ServerUser = {
  id: string;
  email: string;
  passwordHash: string;
  username: string;
  avatar: string;
  galaxyName: string;
  language: "tr" | "en";
  totalStardust: number;
  currentStreak: number;
  longestStreak: number;
  lastSessionDate: string | null;
  targetStarId: string;
  onboardingCompleted: boolean;
  dailyGoalMinutes: number;
};

export type ServerSession = {
  id: string;
  userId: string;
  categoryId: string;
  durationMinutes: number;
  stardustEarned: number;
  startedAt: string;
  completedAt: string;
  isOffline: boolean;
};

type DbShape = {
  users: ServerUser[];
  sessions: ServerSession[];
  tokens: Array<{ token: string; userId: string }>;
};

const dataDir = path.resolve(process.cwd(), "data");
const filePath = path.join(dataDir, "db.json");

const ensureDatabase = () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(filePath)) {
    const initialDb: DbShape = {
      users: [],
      sessions: [],
      tokens: [],
    };
    fs.writeFileSync(filePath, JSON.stringify(initialDb, null, 2));
  }
};

const readDb = (): DbShape => {
  ensureDatabase();
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as DbShape;
};

const writeDb = (db: DbShape) => {
  ensureDatabase();
  fs.writeFileSync(filePath, JSON.stringify(db, null, 2));
};

export const db = {
  readDb,
  writeDb,
  createToken(userId: string) {
    const currentDb = readDb();
    const token = randomUUID();
    currentDb.tokens = currentDb.tokens.filter((entry) => entry.userId !== userId);
    currentDb.tokens.push({ token, userId });
    writeDb(currentDb);
    return token;
  },
  getUserByToken(token: string) {
    const currentDb = readDb();
    const tokenEntry = currentDb.tokens.find((entry) => entry.token === token);

    if (!tokenEntry) {
      return null;
    }

    return currentDb.users.find((user) => user.id === tokenEntry.userId) ?? null;
  },
  getUnlockedStarIds(totalStardust: number) {
    return stars.filter((star) => star.requiredStardust <= totalStardust).map((star) => star.id);
  },
};
