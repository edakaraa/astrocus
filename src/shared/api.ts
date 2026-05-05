import { API_URL } from "./constants";
import { AuthPayload, PendingSession, User } from "./types";

type ApiOptions = {
  method?: "GET" | "POST" | "PATCH";
  token?: string | null;
  body?: unknown;
};

const request = async <T>(path: string, options: ApiOptions = {}): Promise<T> => {
  const url = `${API_URL}${path}`;
  let response: Response;

  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch (error) {
    throw new Error(
      `Network request failed (${url}). ` +
        (error instanceof Error ? error.message : "Please check API URL / LAN access / firewall."),
    );
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `API request failed (${url})`);
  }

  return response.json() as Promise<T>;
};

export const api = {
  register(input: {
    email: string;
    password: string;
    username: string;
    galaxyName: string;
  }) {
    return request<AuthPayload>("/auth/register", { method: "POST", body: input });
  },
  login(input: { email: string; password: string }) {
    return request<AuthPayload>("/auth/login", { method: "POST", body: input });
  },
  continueWithProvider(input: { provider: "google" | "apple" }) {
    return request<AuthPayload>("/auth/provider", { method: "POST", body: input });
  },
  bootstrap(token: string) {
    return request<AuthPayload>("/bootstrap", { token });
  },
  updateProfile(token: string, input: Partial<User>) {
    return request<AuthPayload>("/profile", { method: "PATCH", token, body: input });
  },
  completeSession(
    token: string,
    input: {
      categoryId: string;
      durationMinutes: number;
      startedAt: string;
      completedAt: string;
      pauseCount: number;
    },
  ) {
    return request<{
      payload: AuthPayload;
      stardustEarned: number;
      unlockedStarId: string | null;
    }>("/sessions/complete", { method: "POST", token, body: input });
  },
  syncSessions(token: string, sessions: PendingSession[]) {
    return request<AuthPayload>("/sessions/sync", {
      method: "POST",
      token,
      body: { sessions },
    });
  },
};
