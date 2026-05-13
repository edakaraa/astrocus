import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { stars } from "../constants";
import { buildAuthPayload, createAuthTokenForUser } from "../authPayload";
import { prisma } from "../lib/prisma";
import { sendError } from "../lib/http";

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

export const postRegister = async (request: Request, response: Response) => {
  const parsed = registerSchema.safeParse(request.body);
  if (!parsed.success) {
    return sendError(response, 400, parsed.error.message);
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return sendError(response, 409, "User already exists");
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      username: parsed.data.username,
      avatar: "🌙",
      galaxyName: parsed.data.galaxyName,
      language: "tr",
      targetStarId: stars[0].id,
    },
  });

  const token = await createAuthTokenForUser(user.id);
  const payload = await buildAuthPayload(user.id, token);
  return response.json(payload);
};

export const postLogin = async (request: Request, response: Response) => {
  const parsed = loginSchema.safeParse(request.body);
  if (!parsed.success) {
    return sendError(response, 400, parsed.error.message);
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) {
    return sendError(response, 404, "User not found");
  }

  const matches = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!matches) {
    return sendError(response, 401, "Invalid credentials");
  }

  const token = await createAuthTokenForUser(user.id);
  const payload = await buildAuthPayload(user.id, token);
  return response.json(payload);
};

export const postProvider = async (request: Request, response: Response) => {
  const parsed = providerSchema.safeParse(request.body);
  if (!parsed.success) {
    return sendError(response, 400, parsed.error.message);
  }

  const providerEmail = `${parsed.data.provider}-${Date.now()}@astrocus.dev`;
  const user = await prisma.user.create({
    data: {
      email: providerEmail,
      passwordHash: "provider-auth",
      username: `${parsed.data.provider}_explorer`,
      avatar: parsed.data.provider === "google" ? "☄️" : "🪐",
      galaxyName: `${parsed.data.provider} galaxy`,
      language: "tr",
      targetStarId: stars[0].id,
    },
  });

  const token = await createAuthTokenForUser(user.id);
  const payload = await buildAuthPayload(user.id, token);
  return response.json(payload);
};
