import type { Request } from "express";
import type { User } from "@prisma/client";
import { findUserByBearerToken } from "../authPayload";

export type AuthContext = {
  rawToken: string;
  user: User | null;
};

export const parseBearerToken = (authorizationHeader?: string | string[]) => {
  return typeof authorizationHeader === "string" ? authorizationHeader.replace("Bearer ", "") : "";
};

export const getAuthContext = async (authorizationHeader?: string | string[]): Promise<AuthContext> => {
  const rawToken = parseBearerToken(authorizationHeader);
  if (!rawToken) {
    return { rawToken: "", user: null };
  }

  const user = await findUserByBearerToken(rawToken);
  return { rawToken, user };
};

export const requireAuth = async (request: Request): Promise<AuthContext> => {
  return getAuthContext(request.headers.authorization);
};
