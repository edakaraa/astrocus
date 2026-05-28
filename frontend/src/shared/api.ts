import type { Session } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import {
  buildAuthPayload,
  profileUpdateFromUser,
  type ProfileRow,
  type SessionRow,
  type UserConstellationDbRow,
} from "../services/profileMapper";
import {
  EmailConfirmationRequiredError,
  mapSupabaseAuthError,
} from "../lib/authErrors";
import { signInWithApple } from "../lib/appleAuth";
import { getOAuthRedirectUri, signInWithGoogle } from "../lib/oauth";
import { getDateKey } from "../context/session/dateKey";
import {
  createDevDemoPayload,
  isDevDemoToken,
  simulateDemoSessionReward,
} from "../context/auth/devDemo";
import { getApiUrl } from "./config";
import {
  AuthPayload,
  CancelSessionResult,
  PendingSession,
  UnlockStarResult,
  User,
} from "./types";

const MIGRATION_HINT =
  "Supabase şeması güncel değil. SQL Editor'da backend/supabase/migrations/008 ve 009 dosyalarını uygulayın.";

const rpcRow = (data: unknown, label: string): Record<string, unknown> => {
  if (!data || typeof data !== "object") {
    throw new Error(`${label}: geçersiz yanıt`);
  }
  return data as Record<string, unknown>;
};

const num = (row: Record<string, unknown>, key: string, fallback = 0): number => {
  const v = row[key];
  if (typeof v === "number" && Number.isFinite(v)) {
    return v;
  }
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const parseCompleteFocusSessionResult = (data: unknown) => {
  const row = rpcRow(data, "complete_focus_session");
  const sessionId = row.session_id;
  if (typeof sessionId !== "string" || !sessionId) {
    throw new Error("complete_focus_session: session_id eksik");
  }
  return {
    session_id: sessionId,
    xp_earned: num(row, "xp_earned"),
    stardust_earned: num(row, "stardust_earned"),
    streak_count: num(row, "streak_count"),
    longest_streak: num(row, "longest_streak"),
    level: num(row, "level", 1),
    total_xp: num(row, "total_xp"),
    total_stardust: num(row, "total_stardust"),
    new_badges: row.new_badges,
  };
};

const parseCancelSessionResult = (data: unknown): CancelSessionResult => {
  const row = rpcRow(data, "cancel_focus_session");
  return {
    saved: Boolean(row.saved),
    sessionId: typeof row.session_id === "string" ? row.session_id : undefined,
    stardustEarned: num(row, "stardust_earned"),
    minutesFocused: num(row, "minutes_focused"),
    totalStardust: typeof row.total_stardust === "number" ? row.total_stardust : undefined,
  };
};

const parseUnlockStarResult = (data: unknown): UnlockStarResult => {
  const row = rpcRow(data, "unlock_star");
  return {
    starId: String(row.star_id ?? ""),
    cost: num(row, "cost"),
    totalStardust: num(row, "total_stardust"),
    targetStarId: String(row.target_star_id ?? ""),
    constellationCompleted: Boolean(row.constellation_completed),
    newBadgeId: typeof row.new_badge_id === "string" ? row.new_badge_id : null,
    nextConstellationId:
      typeof row.next_constellation_id === "string" ? row.next_constellation_id : null,
  };
};

const normalizeBadgeList = (raw: unknown): string[] =>
  Array.isArray(raw) ? raw.filter((item): item is string => typeof item === "string") : [];

const fetchUserData = async (userId: string, accessToken: string): Promise<AuthPayload> => {
  const [profileRes, sessionsRes, starsRes, badgesRes, constellationsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(200),
    supabase.from("user_stars").select("star_id").eq("user_id", userId).order("unlocked_at", { ascending: true }),
    supabase.from("user_badges").select("badge_id").eq("user_id", userId),
    supabase
      .from("user_constellations")
      .select("constellation_id, started_at, completed_at, is_starter, unlock_order")
      .eq("user_id", userId),
  ]);

  if (profileRes.error || !profileRes.data) {
    throw new Error(profileRes.error?.message ?? "Profile not found");
  }
  if (sessionsRes.error) {
    throw new Error(sessionsRes.error.message);
  }

  const fromDb =
    !starsRes.error && starsRes.data?.length
      ? starsRes.data.map((r) => (r as { star_id: string }).star_id)
      : null;

  const earnedBadgeIds =
    !badgesRes.error && badgesRes.data
      ? badgesRes.data.map((row) => (row as { badge_id: string }).badge_id)
      : [];

  const constellationRows: UserConstellationDbRow[] =
    !constellationsRes.error && constellationsRes.data
      ? (constellationsRes.data as UserConstellationDbRow[])
      : [];

  return buildAuthPayload(
    accessToken,
    profileRes.data as ProfileRow,
    (sessionsRes.data ?? []) as SessionRow[],
    fromDb,
    earnedBadgeIds,
    constellationRows,
  );
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchUserDataWithRetry = async (userId: string, accessToken: string): Promise<AuthPayload> => {
  let lastError: Error | null = null;
  for (const delay of [0, 400, 800, 1200]) {
    if (delay > 0) {
      await sleep(delay);
    }
    try {
      return await fetchUserData(userId, accessToken);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error("Profile not found");
      if (!/profile not found/i.test(lastError.message)) {
        throw lastError;
      }
    }
  }
  throw new Error(
    "Hesap oluştu ama profil henüz hazır değil. Supabase’de migration 004 uygulandığından emin ol, birkaç saniye sonra tekrar giriş yap.",
  );
};

const requireSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error("Not authenticated");
  }
  return data.session;
};

const withDemoPayload = (
  token: string,
  patchUser: (user: User) => User,
  patchPayload?: Partial<AuthPayload>,
): AuthPayload => {
  const demo = createDevDemoPayload({ email: "demo@astrocus.dev" });
  return { ...demo, ...patchPayload, token, user: patchUser(demo.user) };
};

/** OAuth deep-link veya WebBrowser dönüşü — profil tetikleyicisi için retry. */
export const loadAuthPayloadFromSession = (session: Session): Promise<AuthPayload> =>
  fetchUserDataWithRetry(session.user.id, session.access_token);

const applyRegistrationProfile = async (
  userId: string,
  input: { username: string; displayName: string; galaxyName?: string },
) => {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username: input.username.trim(),
      galaxy_name: input.galaxyName?.trim() || "Astrocus",
      display_name: input.displayName.trim(),
    })
    .eq("id", userId);

  if (profileError && !/column/i.test(profileError.message)) {
    throw new Error(profileError.message);
  }
};

export const api = {
  async register(input: {
    email: string;
    password: string;
    username: string;
    displayName: string;
    galaxyName?: string;
  }): Promise<AuthPayload> {
    const email = input.email.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          username: input.username.trim(),
          galaxy_name: input.galaxyName?.trim() || "Astrocus",
          display_name: input.displayName.trim(),
        },
      },
    });

    if (__DEV__) {
      console.info("[Astrocus register]", {
        error: error?.message ?? null,
        identities: data.user?.identities?.length ?? "no-user",
        hasSession: Boolean(data.session),
        createdAt: data.user?.created_at ?? null,
        userId: data.user?.id ?? null,
      });
    }

    if (error) {
      throw new Error(mapSupabaseAuthError(error.message, "register"));
    }
    if (!data.user) {
      throw new Error("Kayıt tamamlanamadı. Lütfen tekrar dene.");
    }

    // Supabase e-posta onayı KAPALI → oturum direkt gelir
    if (data.session) {
      await applyRegistrationProfile(data.user.id, input);
      return fetchUserDataWithRetry(data.user.id, data.session.access_token);
    }

    // Oturum yok → ya e-posta doğrulaması bekleniyor ya da e-posta zaten kayıtlı.
    // Supabase, enum koruması için her iki durumda da aynı yanıtı döndürür.
    // identities listesi dolu  → yeni kayıt, onay bekleniyor
    // identities listesi boş   → mevcut kullanıcı (enum koruması)
    const identities = data.user.identities ?? [];

    if (identities.length > 0) {
      // Gerçek yeni kullanıcı; onay maili gönderildi
      throw new EmailConfirmationRequiredError(email);
    }

    // identities boş: e-posta zaten kayıtlı olabilir — giriş dene
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password: input.password,
    });

    if (__DEV__) {
      console.info("[Astrocus register] login-probe", {
        loginError: loginError?.message ?? null,
        hasSession: Boolean(loginData.session),
      });
    }

    if (loginData.session && loginData.user) {
      return fetchUserDataWithRetry(loginData.user.id, loginData.session.access_token);
    }

    const loginMsg = loginError?.message ?? "";
    if (/email not confirmed/i.test(loginMsg)) {
      throw new EmailConfirmationRequiredError(email);
    }

    throw new Error(mapSupabaseAuthError("User already registered", "register"));
  },

  async login(input: { email: string; password: string }): Promise<AuthPayload> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });
    if (error) {
      throw new Error(mapSupabaseAuthError(error.message, "login"));
    }
    if (!data.session) {
      throw new Error("Giriş yapılamadı.");
    }
    return fetchUserDataWithRetry(data.user.id, data.session.access_token);
  },

  async continueWithGoogle(): Promise<AuthPayload> {
    const session = await signInWithGoogle();
    return loadAuthPayloadFromSession(session);
  },

  async continueWithApple(): Promise<AuthPayload> {
    const session = await signInWithApple();
    return loadAuthPayloadFromSession(session);
  },

  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: "astrocus://auth/reset",
    });
    if (error) {
      throw new Error(error.message);
    }
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
      return withDemoPayload(token, (user) => ({ ...user, ...input }));
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

  async startConstellation(constellationId: string): Promise<AuthPayload> {
    const session = await requireSession();
    const userId = session.user.id;

    const { data: rpcData, error: rpcError } = await supabase.rpc("initialize_user_constellations", {
      p_selected_constellation_id: constellationId,
      p_user_id: userId,
    });

    if (rpcError) {
      const msg = rpcError.message.toLowerCase();
      if (
        msg.includes("initialize_user_constellations") ||
        msg.includes("unlock_order") ||
        msg.includes("schema cache")
      ) {
        throw new Error(`${MIGRATION_HINT} (${rpcError.message})`);
      }
      throw new Error(rpcError.message);
    }

    const rpcRow = rpcData as { success?: boolean; error?: string } | null;
    if (rpcRow?.success === false) {
      throw new Error(rpcRow.error ?? "Takımyıldızları başlatılamadı.");
    }

    return fetchUserDataWithRetry(userId, session.access_token);
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
    previousEarnedBadgeIds: readonly string[],
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
      const demo = createDevDemoPayload({ email: user.email });
      const before = new Set(previousUnlockedStarIds);
      return {
        payload: {
          ...demo,
          token,
          user: {
            ...user,
            totalStardust: user.totalStardust + stardustEarned,
            totalXp,
            level: Math.max(1, Math.floor(totalXp / 250) + 1),
            currentStreak: streakCount,
            longestStreak: Math.max(user.longestStreak, streakCount),
            lastSessionDate: getDateKey(input.completedAt),
          },
        },
        stardustEarned,
        xpEarned,
        streakCount,
        unlockedStarId: before.size < 1 ? demo.unlockedStarIds[1] ?? null : null,
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
    const previousBadges = new Set(previousEarnedBadgeIds);
    const newBadges = normalizeBadgeList(result.new_badges).filter((id) => !previousBadges.has(id));

    return {
      payload,
      stardustEarned: result.stardust_earned,
      xpEarned: result.xp_earned,
      streakCount: result.streak_count,
      unlockedStarId,
      newBadges,
    };
  },

  async cancelSession(
    token: string,
    input: { categoryId: string; startedAt: string; cancelledAt: string },
  ): Promise<{ result: CancelSessionResult; payload: AuthPayload }> {
    if (isDevDemoToken(token)) {
      return {
        result: { saved: false, stardustEarned: 0, minutesFocused: 0 },
        payload: createDevDemoPayload({ email: "demo@astrocus.dev" }),
      };
    }

    const { data, error } = await supabase.rpc("cancel_focus_session", {
      p_category_id: input.categoryId,
      p_started_at: input.startedAt,
      p_cancelled_at: input.cancelledAt,
    });
    if (error) {
      throw new Error(error.message);
    }

    const result = parseCancelSessionResult(data);
    const session = await requireSession();
    const payload = await fetchUserData(session.user.id, session.access_token);
    return { result, payload };
  },

  async unlockStar(token: string, starId: string): Promise<{ result: UnlockStarResult; payload: AuthPayload }> {
    if (isDevDemoToken(token)) {
      throw new Error("Yıldız açma demo modunda kullanılamaz.");
    }

    const { data, error } = await supabase.rpc("unlock_star", { p_star_id: starId });
    if (error) {
      const msg = error.message.toLowerCase();
      if (msg.includes("insufficient_stardust")) {
        throw new Error("Yeterli Yıldız Tozu yok.");
      }
      if (msg.includes("already_unlocked")) {
        throw new Error("Bu yıldız zaten açık.");
      }
      if (msg.includes("wrong_constellation") || msg.includes("previous_star_locked")) {
        throw new Error("Bu yıldızı henüz açamazsın — sırayı takip et.");
      }
      if (msg.includes("unlock_star") || msg.includes("schema cache")) {
        throw new Error(`${MIGRATION_HINT} (${error.message})`);
      }
      throw new Error(error.message);
    }

    const result = parseUnlockStarResult(data);
    const session = await requireSession();
    const payload = await fetchUserData(session.user.id, session.access_token);
    return { result, payload };
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
