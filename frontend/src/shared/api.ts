import { supabase } from "../lib/supabase";
import {
  buildAuthPayload,
  mapProfileToUser,
  profileUpdateFromUser,
  type ProfileRow,
  type SessionRow,
} from "../services/profileMapper";
import { calculateStardust, getUnlockedStars } from "../context/session/stardust";
import { getDateKey } from "../context/session/dateKey";
import { createDevDemoPayload, isDevDemoToken, matchesDevDemoCredentials } from "../context/auth/devDemo";
import { AuthPayload, PendingSession, User } from "./types";

const fetchUserData = async (userId: string, accessToken: string): Promise<AuthPayload> => {
  const [profileRes, sessionsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(200),
  ]);

  if (profileRes.error || !profileRes.data) {
    throw new Error(profileRes.error?.message ?? "Profile not found");
  }
  if (sessionsRes.error) {
    throw new Error(sessionsRes.error.message);
  }

  return buildAuthPayload(
    accessToken,
    profileRes.data as ProfileRow,
    (sessionsRes.data ?? []) as SessionRow[],
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
  ): Promise<{
    payload: AuthPayload;
    stardustEarned: number;
    unlockedStarId: string | null;
  }> {
    if (isDevDemoToken(token)) {
      const stardustEarned = calculateStardust({
        durationMinutes: input.durationMinutes,
        categoryId: input.categoryId,
        currentStreak: user.currentStreak + 1,
        pauseCount: input.pauseCount,
        completedAt: input.completedAt,
      });
      const nextUser: User = {
        ...user,
        totalStardust: user.totalStardust + stardustEarned,
        currentStreak: user.currentStreak + 1,
        longestStreak: Math.max(user.longestStreak, user.currentStreak + 1),
        lastSessionDate: getDateKey(input.completedAt),
      };
      const demo = createDevDemoPayload({ email: user.email });
      return {
        payload: {
          ...demo,
          token,
          user: nextUser,
          unlockedStarIds: getUnlockedStars(nextUser.totalStardust),
        },
        stardustEarned,
        unlockedStarId: null,
      };
    }

    const stardustEarned = calculateStardust({
      durationMinutes: input.durationMinutes,
      categoryId: input.categoryId,
      currentStreak: user.currentStreak,
      pauseCount: input.pauseCount,
      completedAt: input.completedAt,
    });

    const { data, error } = await supabase.rpc("complete_focus_session", {
      p_category_id: input.categoryId,
      p_duration_minutes: input.durationMinutes,
      p_started_at: input.startedAt,
      p_completed_at: input.completedAt,
      p_pause_count: input.pauseCount,
      p_stardust_earned: stardustEarned,
    });

    if (error) {
      throw new Error(error.message);
    }

    const result = data as { stardust_earned: number; unlocked_star_id: string | null };
    const session = await requireSession();
    const payload = await fetchUserData(session.user.id, session.access_token);

    return {
      payload,
      stardustEarned: result.stardust_earned ?? stardustEarned,
      unlockedStarId: result.unlocked_star_id ?? null,
    };
  },

  async syncSessions(token: string, sessions: PendingSession[]): Promise<AuthPayload> {
    if (isDevDemoToken(token)) {
      return createDevDemoPayload({ email: "demo@astrocus.dev" });
    }

    const authSession = await requireSession();
    const profileRes = await supabase.from("profiles").select("*").eq("id", authSession.user.id).single();
    if (profileRes.error || !profileRes.data) {
      throw new Error(profileRes.error?.message ?? "Profile not found");
    }

    const profile = mapProfileToUser(profileRes.data as ProfileRow);

    for (const pending of sessions) {
      const stardust = calculateStardust({
        durationMinutes: pending.durationMinutes,
        categoryId: pending.categoryId,
        currentStreak: profile.currentStreak,
        pauseCount: 0,
        completedAt: pending.completedAt,
      });

      await supabase.rpc("complete_focus_session", {
        p_category_id: pending.categoryId,
        p_duration_minutes: pending.durationMinutes,
        p_started_at: pending.startedAt,
        p_completed_at: pending.completedAt,
        p_pause_count: 0,
        p_stardust_earned: stardust,
      });
    }

    return fetchUserData(authSession.user.id, authSession.access_token);
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },
};
