import { supabase } from "../lib/supabase";
import {
  buildAuthPayload,
  profileUpdateFromUser,
  type ProfileRow,
  type SessionRow,
} from "../services/profileMapper";
import { getUnlockedStars } from "../context/session/stardust";
import { getDateKey } from "../context/session/dateKey";
import {
  createDevDemoPayload,
  isDevDemoToken,
  matchesDevDemoCredentials,
  simulateDemoSessionReward,
} from "../context/auth/devDemo";
import { AuthPayload, PendingSession, User } from "./types";

type CompleteFocusSessionRpc = {
  session_id: string;
  xp_earned: number;
  stardust_earned: number;
  streak_count: number;
  longest_streak: number;
  level: number;
  total_xp: number;
  total_stardust: number;
  new_badges: unknown;
};

const parseCompleteFocusSessionResult = (data: unknown): CompleteFocusSessionRpc => {
  if (!data || typeof data !== "object") {
    throw new Error("complete_focus_session: geçersiz yanıt");
  }
  const row = data as Record<string, unknown>;
  const num = (key: string, fallback = 0) => {
    const v = row[key];
    if (typeof v === "number" && Number.isFinite(v)) {
      return v;
    }
    const n = Number(v);
    return Number.isFinite(n) ? n : fallback;
  };
  const sessionId = row.session_id;
  if (typeof sessionId !== "string" || !sessionId) {
    throw new Error("complete_focus_session: session_id eksik");
  }

  return {
    session_id: sessionId,
    xp_earned: num("xp_earned"),
    stardust_earned: num("stardust_earned"),
    streak_count: num("streak_count"),
    longest_streak: num("longest_streak"),
    level: num("level", 1),
    total_xp: num("total_xp"),
    total_stardust: num("total_stardust"),
    new_badges: row.new_badges,
  };
};

const normalizeBadgeList = (raw: unknown): string[] => {
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw.filter((item): item is string => typeof item === "string");
};

export const fetchUserData = async (userId: string, accessToken: string): Promise<AuthPayload> => {
  const [profileRes, sessionsRes, starsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(200),
    supabase.from("user_stars").select("star_id").eq("user_id", userId).order("unlocked_at", { ascending: true }),
  ]);

  if (profileRes.error || !profileRes.data) {
    throw new Error(profileRes.error?.message ?? "Profile not found");
  }
  if (sessionsRes.error) {
    throw new Error(sessionsRes.error.message);
  }

  const fromDb =
    !starsRes.error && starsRes.data && starsRes.data.length > 0
      ? starsRes.data.map((r) => (r as { star_id: string }).star_id)
      : null;

  return buildAuthPayload(
    accessToken,
    profileRes.data as ProfileRow,
    (sessionsRes.data ?? []) as SessionRow[],
    fromDb,
  );
};

const requireSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error("Not authenticated");
  }
  return data.session;
};

export const api = {
  async register(input: {
    email: string;
    password: string;
    username: string;
    galaxyName: string;
  }): Promise<AuthPayload> {
    const { data, error } = await supabase.auth.signUp({
      email: input.email.trim(),
      password: input.password,
      options: {
        data: {
          username: input.username.trim(),
          galaxy_name: input.galaxyName.trim(),
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }
    if (!data.session || !data.user) {
      throw new Error("Kayıt tamamlandı; e-posta doğrulaması gerekebilir.");
    }

    await supabase
      .from("profiles")
      .update({
        username: input.username.trim(),
        galaxy_name: input.galaxyName.trim(),
      })
      .eq("id", data.user.id);

    return fetchUserData(data.user.id, data.session.access_token);
  },

  async login(input: { email: string; password: string }): Promise<AuthPayload> {
    if (__DEV__ && matchesDevDemoCredentials(input)) {
      return createDevDemoPayload({ email: input.email.trim() });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });

    if (error || !data.session) {
      throw new Error(error?.message ?? "Login failed");
    }

    return fetchUserData(data.user.id, data.session.access_token);
  },

  async continueWithProvider(input: { provider: "google" | "apple" }): Promise<AuthPayload> {
    const email = `${input.provider}-demo@astrocus.dev`;
    const password = `Astrocus_${input.provider}_2026!`;

    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData.session) {
      return fetchUserData(signInData.user.id, signInData.session.access_token);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: input.provider === "google" ? "Google Kaşifi" : "Apple Kaşifi",
          galaxy_name: "Astrocus",
        },
      },
    });

    if (error || !data.session || !data.user) {
      throw new Error(error?.message ?? "Provider sign-in failed");
    }

    return fetchUserData(data.user.id, data.session.access_token);
  },

  async bootstrap(token: string): Promise<AuthPayload> {
    if (isDevDemoToken(token)) {
      throw new Error("Demo session");
    }

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (!sessionError && sessionData.session) {
      return fetchUserData(sessionData.session.user.id, sessionData.session.access_token);
    }

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user) {
      throw new Error(userError?.message ?? "Session expired");
    }

    return fetchUserData(userData.user.id, token);
  },

  async updateProfile(token: string, input: Partial<User>): Promise<AuthPayload> {
    if (isDevDemoToken(token)) {
      const demo = createDevDemoPayload({ email: "demo@astrocus.dev" });
      return { ...demo, user: { ...demo.user, ...input } };
    }

    const session = await requireSession();
    const patch = profileUpdateFromUser(input);

    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from("profiles").update(patch).eq("id", session.user.id);
      if (error) {
        throw new Error(error.message);
      }
    }

    return fetchUserData(session.user.id, session.access_token);
  },

  async completeSession(
    token: string,
    input: {
      categoryId: string;
      durationMinutes: number;
      startedAt: string;
      completedAt: string;
      pauseCount: number;
    },
    user: User,
    previousUnlockedStarIds: readonly string[],
  ): Promise<{
    payload: AuthPayload;
    stardustEarned: number;
    xpEarned: number;
    streakCount: number;
    unlockedStarId: string | null;
    newBadges: string[];
  }> {
    if (isDevDemoToken(token)) {
      const streakAfter = user.currentStreak + 1;
      const { stardustEarned, xpEarned, streakCount } = simulateDemoSessionReward({
        durationMinutes: input.durationMinutes,
        pauseCount: input.pauseCount,
        streakAfterSession: streakAfter,
      });
      const totalXp = user.totalXp + xpEarned;
      const nextUser: User = {
        ...user,
        totalStardust: user.totalStardust + stardustEarned,
        totalXp,
        level: Math.max(1, Math.floor(totalXp / 250) + 1),
        currentStreak: streakCount,
        longestStreak: Math.max(user.longestStreak, streakCount),
        lastSessionDate: getDateKey(input.completedAt),
      };
      const demo = createDevDemoPayload({ email: user.email });
      const unlockedStarIds = getUnlockedStars(nextUser.totalStardust);
      const before = new Set(previousUnlockedStarIds);
      const unlockedStarId = unlockedStarIds.find((id) => !before.has(id)) ?? null;
      return {
        payload: {
          ...demo,
          token,
          user: nextUser,
          sessions: [...demo.sessions],
          unlockedStarIds: unlockedStarIds.length > 0 ? unlockedStarIds : [demo.unlockedStarIds[0]],
        },
        stardustEarned,
        xpEarned,
        streakCount,
        unlockedStarId,
        newBadges: [],
      };
    }

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data, error } = await supabase.rpc("complete_focus_session", {
      p_category_id: input.categoryId,
      p_duration_minutes: input.durationMinutes,
      p_started_at: input.startedAt,
      p_completed_at: input.completedAt,
      p_pause_used: input.pauseCount > 0,
      p_is_offline: false,
      p_timezone: tz,
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = parseCompleteFocusSessionResult(data);
    const session = await requireSession();
    const payload = await fetchUserData(session.user.id, session.access_token);
    const before = new Set(previousUnlockedStarIds);
    const unlockedStarId = payload.unlockedStarIds.find((id) => !before.has(id)) ?? null;

    return {
      payload,
      stardustEarned: result.stardust_earned,
      xpEarned: result.xp_earned,
      streakCount: result.streak_count,
      unlockedStarId,
      newBadges: normalizeBadgeList(result.new_badges),
    };
  },

  async syncSessions(token: string, sessions: PendingSession[]): Promise<AuthPayload> {
    if (isDevDemoToken(token)) {
      return createDevDemoPayload({ email: "demo@astrocus.dev" });
    }

    const authSession = await requireSession();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

    for (const pending of sessions) {
      const { error } = await supabase.rpc("complete_focus_session", {
        p_category_id: pending.categoryId,
        p_duration_minutes: pending.durationMinutes,
        p_started_at: pending.startedAt,
        p_completed_at: pending.completedAt,
        p_pause_used: false,
        p_is_offline: true,
        p_timezone: tz,
      });
      if (error) {
        throw new Error(error.message);
      }
    }

    return fetchUserData(authSession.user.id, authSession.access_token);
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },
};
