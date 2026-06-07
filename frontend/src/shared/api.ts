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
  mapDailyGoalClaim,
  mapDailyGoalHistory,
  mapDailyGoalProgress,
  type DailyGoalClaimResult,
} from "../services/dailyGoalMapper";
import { getDeviceTimeZone } from "./timezone";
import {
  EmailConfirmationRequiredError,
  mapSupabaseAuthError,
} from "../lib/authErrors";
import { signInWithApple } from "../lib/appleAuth";
import { getAuthEmailRedirectUri } from "../lib/authRedirect";
import { signInWithGoogle } from "../lib/oauth";
import { getDateKey } from "../context/session/dateKey";
import { isFocusedDurationPlausible } from "../context/session/duration";
import { createDailySummary } from "../context/session/stardust";
import { t } from "./i18n";
import type { Language } from "./types";
import { isUsernameTakenError, normalizeUsername, validateUsername } from "./username";
import { asyncStorage } from "./storage";
import { STORAGE_KEYS } from "./constants";
import {
  appendDemoCompletedSession,
  appendDemoPartialSession,
  createDevDemoPayload,
  isDevDemoToken,
  simulatePartialCancelReward,
} from "../context/auth/devDemo";
import { getApiUrl } from "./config";
import {
  AuthPayload,
  CancelSessionResult,
  DailyGoalHistoryDay,
  DailyGoalProgress,
  PendingSession,
  SessionRecord,
  UnlockStarResult,
  User,
} from "./types";

const MIGRATION_HINT =
  "Supabase şeması güncel değil. SQL Editor'da backend/supabase/migrations/011, 012 ve 016 dosyalarını uygulayın.";

export const isTransientNetworkError = (error: unknown): boolean => {
  const msg = error instanceof Error ? error.message : String(error);
  if (
    /network|fetch|timeout|internet|failed to fetch|network request failed|econnrefused|enotfound|unable to resolve|load failed|offline|connection refused|temporarily unavailable|service unavailable|gateway timeout|bad gateway|socket/i.test(
      msg,
    )
  ) {
    return true;
  }
  if (error instanceof TypeError && /fetch|network|load|failed/i.test(msg)) {
    return true;
  }
  const coded = error as { code?: string; status?: number };
  if (coded.code === "ECONNABORTED" || coded.code === "ENOTFOUND" || coded.code === "ECONNREFUSED") {
    return true;
  }
  if (coded.status === 0) {
    return true;
  }
  return false;
};

export const isSchemaSessionError = (error: unknown): boolean => {
  const msg = error instanceof Error ? error.message : String(error);
  return /uuid = text|schema cache|migration/i.test(msg);
};

export const formatSessionSaveError = (error: unknown): string => {
  const msg = error instanceof Error ? error.message : String(error);
  if (/uuid = text/i.test(msg)) {
    if (/categories where id/i.test(msg)) {
      return `Kategori eşleşmesi hatası: sunucu slug bekliyor. Migration 012 uygulandığından emin olun. (${msg})`;
    }
    return `${MIGRATION_HINT} (${msg})`;
  }
  if (/invalid_category/i.test(msg)) {
    return `Geçersiz kategori. Uygulamayı yeniden başlatın veya farklı bir kategori seçin. (${msg})`;
  }
  if (/duration_mismatch/i.test(msg)) {
    return `Seans süresi doğrulanamadı. Timer bitene kadar bekleyin. (${msg})`;
  }
  if (/profile_not_found/i.test(msg)) {
    return `Profil bulunamadı. Çıkış yapıp tekrar giriş yapın. (${msg})`;
  }
  return msg;
};

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
    stardust_earned: num(row, "stardust_earned"),
    streak_count: num(row, "streak_count"),
    longest_streak: num(row, "longest_streak"),
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
  const timezone = getDeviceTimeZone();
  const [profileRes, sessionsRes, starsRes, badgesRes, constellationsRes, dailyGoalRes] =
    await Promise.all([
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
        .select("*")
        .eq("user_id", userId),
      supabase.rpc("get_daily_goal_progress", { p_timezone: timezone }),
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

  const dailyGoalToday =
    dailyGoalRes.error || dailyGoalRes.data == null
      ? null
      : mapDailyGoalProgress(dailyGoalRes.data);

  return buildAuthPayload(
    accessToken,
    profileRes.data as ProfileRow,
    (sessionsRes.data ?? []) as SessionRow[],
    fromDb,
    earnedBadgeIds,
    constellationRows,
    dailyGoalToday,
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
  base: AuthPayload,
  patchUser: (user: User) => User,
): AuthPayload => ({
  ...base,
  token,
  user: patchUser(base.user),
});

const mergeCompleteSessionIntoPayload = (
  payload: AuthPayload,
  result: ReturnType<typeof parseCompleteFocusSessionResult>,
  input: {
    categoryId: string;
    durationMinutes: number;
    startedAt: string;
    completedAt: string;
    pauseCount: number;
  },
  userId: string,
): AuthPayload => {
  const sessionRecord: SessionRecord = {
    id: result.session_id,
    userId,
    categoryId: input.categoryId,
    durationMinutes: input.durationMinutes,
    stardustEarned: result.stardust_earned,
    pauseUsed: input.pauseCount > 0,
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    isOffline: false,
  };

  const hasSession = payload.sessions.some((session) => session.id === result.session_id);
  const newBadges = normalizeBadgeList(result.new_badges);
  const earnedBadgeIds = [...new Set([...payload.earnedBadgeIds, ...newBadges])];

  return {
    ...payload,
    user: {
      ...payload.user,
      totalStardust: result.total_stardust,
      currentStreak: result.streak_count,
      longestStreak: Math.max(payload.user.longestStreak, result.longest_streak),
      lastSessionDate: getDateKey(input.completedAt),
    },
    sessions: hasSession ? payload.sessions : [sessionRecord, ...payload.sessions],
    earnedBadgeIds,
  };
};

const hydratePayloadAfterSessionWrite = async (
  current: AuthPayload,
  result: ReturnType<typeof parseCompleteFocusSessionResult>,
  input: {
    categoryId: string;
    durationMinutes: number;
    startedAt: string;
    completedAt: string;
    pauseCount: number;
  },
  userId: string,
  accessToken: string,
): Promise<AuthPayload> => {
  let payload = mergeCompleteSessionIntoPayload(current, result, input, userId);
  try {
    const fetched = await fetchUserData(userId, accessToken);
    payload = mergeCompleteSessionIntoPayload(fetched, result, input, userId);
  } catch (error) {
    if (__DEV__) {
      console.warn("[Astrocus session hydrate fallback]", error);
    }
  }
  return { ...payload, token: accessToken };
};

const ensureOAuthProfile = async (): Promise<void> => {
  const { error } = await supabase.rpc("ensure_oauth_profile");
  if (error && !/ensure_oauth_profile|schema cache/i.test(error.message)) {
    throw new Error(error.message);
  }
};

/** OAuth deep-link veya WebBrowser dönüşü — profil tetikleyicisi için retry. */
export const loadAuthPayloadFromSession = async (session: Session): Promise<AuthPayload> => {
  try {
    await ensureOAuthProfile();
  } catch (error) {
    if (__DEV__) {
      console.warn("[Astrocus OAuth profile]", error);
    }
  }
  return fetchUserDataWithRetry(session.user.id, session.access_token);
};

const applyRegistrationProfile = async (
  userId: string,
  input: { username: string; displayName: string; galaxyName?: string; language: Language },
) => {
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      username: normalizeUsername(input.username),
      galaxy_name: input.galaxyName?.trim() || "Astrocus",
      display_name: input.displayName.trim(),
      language: input.language,
    })
    .eq("id", userId);

  if (profileError) {
    if (isUsernameTakenError(profileError.message)) {
      throw new Error("username_taken");
    }
    if (!/column/i.test(profileError.message)) {
      throw new Error(profileError.message);
    }
  }
};

export const api = {
  async register(
    input: {
      email: string;
      password: string;
      username: string;
      displayName: string;
      galaxyName?: string;
    },
    language: Language,
  ): Promise<AuthPayload> {
    const email = input.email.trim();
    const { data, error } = await supabase.auth.signUp({
      email,
      password: input.password,
      options: {
        emailRedirectTo: getAuthEmailRedirectUri("verify-success"),
        data: {
          username: normalizeUsername(input.username),
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
      throw new Error(mapSupabaseAuthError(error.message, "register", language));
    }
    if (!data.user) {
      throw new Error(t(language, "registerFailed"));
    }

    // Supabase e-posta onayı KAPALI → oturum direkt gelir
    if (data.session) {
      await applyRegistrationProfile(data.user.id, { ...input, language });
      return fetchUserDataWithRetry(data.user.id, data.session.access_token);
    }

    // Oturum yok → ya e-posta doğrulaması bekleniyor ya da e-posta zaten kayıtlı.
    // Supabase, enum koruması için her iki durumda da aynı yanıtı döndürür.
    // identities listesi dolu  → yeni kayıt, onay bekleniyor
    // identities listesi boş   → mevcut kullanıcı (enum koruması)
    const identities = data.user.identities ?? [];

    if (identities.length > 0) {
      // Gerçek yeni kullanıcı; onay maili gönderildi
      throw new EmailConfirmationRequiredError(email, language);
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
      throw new EmailConfirmationRequiredError(email, language);
    }

    throw new Error(mapSupabaseAuthError("User already registered", "register", language));
  },

  async login(
    input: { email: string; password: string },
    language: Language,
  ): Promise<AuthPayload> {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email.trim(),
      password: input.password,
    });
    if (error) {
      throw new Error(mapSupabaseAuthError(error.message, "login", language));
    }
    if (!data.session) {
      throw new Error(t(language, "loginFailed"));
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
      redirectTo: getAuthEmailRedirectUri("reset-password"),
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

  async isUsernameAvailable(username: string, userId?: string): Promise<boolean> {
    const validation = validateUsername(username);
    if (!validation.ok) {
      return false;
    }
    const { data, error } = await supabase.rpc("is_username_available", {
      p_username: validation.normalized,
      p_user_id: userId ?? null,
    });
    if (error) {
      if (/is_username_available|schema cache/i.test(error.message)) {
        return false;
      }
      throw new Error(error.message);
    }
    return Boolean(data);
  },

  async updateProfile(token: string, input: Partial<User>): Promise<AuthPayload> {
    const normalizedInput =
      input.username !== undefined
        ? { ...input, username: normalizeUsername(input.username) }
        : input;

    if (isDevDemoToken(token)) {
      const stored = await asyncStorage.get<AuthPayload | null>(STORAGE_KEYS.demoAuthPayload, null);
      const base =
        stored?.token === token
          ? stored
          : createDevDemoPayload({ email: stored?.user.email ?? "demo@astrocus.dev" });
      return withDemoPayload(token, base, (user) => ({ ...user, ...normalizedInput }));
    }
    const session = await requireSession();
    const patch = profileUpdateFromUser(normalizedInput);
    if (Object.keys(patch).length > 0) {
      const { error } = await supabase.from("profiles").update(patch).eq("id", session.user.id);
      if (error) {
        if (isUsernameTakenError(error.message)) {
          throw new Error("username_taken");
        }
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
    current: AuthPayload,
    previousUnlockedStarIds: readonly string[],
    previousEarnedBadgeIds: readonly string[],
  ): Promise<{
    payload: AuthPayload;
    stardustEarned: number;
    streakCount: number;
    durationMinutes: number;
    todayTotalMinutes: number;
    unlockedStarId: string | null;
    newBadges: string[];
  }> {
    if (isDevDemoToken(token)) {
      const demoResult = appendDemoCompletedSession(current, input);
      const { payload, durationMinutes, todayTotalMinutes, streakCount, stardustEarned } = demoResult;
      const before = new Set(previousUnlockedStarIds);
      const unlockedStarId = payload.unlockedStarIds.find((id) => !before.has(id)) ?? null;

      if (__DEV__) {
        console.info("[Astrocus completeSession demo]", {
          stardustEarned,
          totalStardust: payload.user.totalStardust,
          sessionCount: payload.sessions.length,
          streakCount,
          durationMinutes,
          todayTotalMinutes,
        });
      }

      return {
        payload,
        stardustEarned,
        streakCount,
        durationMinutes,
        todayTotalMinutes,
        unlockedStarId,
        newBadges: [],
      };
    }

    if (
      !isFocusedDurationPlausible(input.durationMinutes, input.startedAt, input.completedAt)
    ) {
      throw new Error("duration_mismatch");
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

    if (__DEV__) {
      console.info("[Astrocus completeSession rpc]", { data, error: error?.message ?? null });
    }

    if (error) {
      throw new Error(formatSessionSaveError(error));
    }

    const result = parseCompleteFocusSessionResult(data);
    const session = await requireSession();
    const payload = await hydratePayloadAfterSessionWrite(
      current,
      result,
      input,
      session.user.id,
      session.access_token,
    );

    const before = new Set(previousUnlockedStarIds);
    const unlockedStarId = payload.unlockedStarIds.find((id) => !before.has(id)) ?? null;
    const previousBadges = new Set(previousEarnedBadgeIds);
    const newBadges = payload.earnedBadgeIds.filter((id) => !previousBadges.has(id));

    const todaySummary = createDailySummary(payload.sessions, payload.user);

    if (__DEV__) {
      console.info("[Astrocus completeSession merged]", {
        stardustEarned: result.stardust_earned,
        totalStardust: payload.user.totalStardust,
        sessionCount: payload.sessions.length,
        streakCount: result.streak_count,
      });
    }

    return {
      payload,
      stardustEarned: result.stardust_earned,
      streakCount: result.streak_count,
      durationMinutes: input.durationMinutes,
      todayTotalMinutes: todaySummary.totalMinutes,
      unlockedStarId,
      newBadges,
    };
  },

  async cancelSession(
    token: string,
    input: {
      categoryId: string;
      startedAt: string;
      cancelledAt: string;
      plannedDurationMinutes: number;
      focusedMinutes: number;
    },
    current: AuthPayload,
  ): Promise<{ result: CancelSessionResult; payload: AuthPayload }> {
    if (isDevDemoToken(token)) {
      const partial = simulatePartialCancelReward({
        plannedDurationMinutes: input.plannedDurationMinutes,
        focusedMinutes: input.focusedMinutes,
      });
      if (!partial.saved) {
        return {
          result: {
            saved: false,
            stardustEarned: 0,
            minutesFocused: partial.minutesFocused,
          },
          payload: current,
        };
      }

      const payload = appendDemoPartialSession(current, input, partial);

      return {
        result: {
          saved: true,
          stardustEarned: partial.stardustEarned,
          minutesFocused: partial.minutesFocused,
          totalStardust: payload.user.totalStardust,
        },
        payload,
      };
    }

    if (
      !isFocusedDurationPlausible(input.focusedMinutes, input.startedAt, input.cancelledAt)
    ) {
      throw new Error("duration_mismatch");
    }

    const { data, error } = await supabase.rpc("cancel_focus_session", {
      p_category_id: input.categoryId,
      p_started_at: input.startedAt,
      p_cancelled_at: input.cancelledAt,
      p_planned_duration_minutes: input.plannedDurationMinutes,
      p_focused_minutes: input.focusedMinutes,
    });

    if (__DEV__) {
      console.info("[Astrocus cancelSession rpc]", { data, error: error?.message ?? null });
    }

    if (error) {
      throw new Error(error.message);
    }

    const result = parseCancelSessionResult(data);
    const session = await requireSession();
    let payload = await fetchUserData(session.user.id, session.access_token);

    if (result.saved && result.sessionId) {
      const hasSession = payload.sessions.some((row) => row.id === result.sessionId);
      if (!hasSession) {
        payload = {
          ...payload,
          sessions: [
            {
              id: result.sessionId,
              userId: session.user.id,
              categoryId: input.categoryId,
              durationMinutes: result.minutesFocused,
              stardustEarned: result.stardustEarned,
              pauseUsed: false,
              startedAt: input.startedAt,
              completedAt: input.cancelledAt,
              isOffline: false,
            },
            ...payload.sessions,
          ],
        };
      }
    }

    if (result.saved && typeof result.totalStardust === "number") {
      payload = {
        ...payload,
        user: {
          ...payload.user,
          totalStardust: result.totalStardust,
        },
      };
    }

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

  async syncSessions(
    token: string,
    sessions: PendingSession[],
    current: AuthPayload,
  ): Promise<{ payload: AuthPayload; syncedIds: string[]; error: Error | null }> {
    const syncedIds: string[] = [];
    let payload = current;

    const pushPending = async (pending: PendingSession): Promise<void> => {
      const pauseCount = pending.pauseCount ?? 0;
      if (
        !isFocusedDurationPlausible(
          pending.durationMinutes,
          pending.startedAt,
          pending.completedAt,
        )
      ) {
        throw new Error("duration_mismatch");
      }

      if (isDevDemoToken(token)) {
        const demoResult = appendDemoCompletedSession(payload, {
          categoryId: pending.categoryId,
          durationMinutes: pending.durationMinutes,
          startedAt: pending.startedAt,
          completedAt: pending.completedAt,
          pauseCount,
        });
        payload = demoResult.payload;
        syncedIds.push(pending.id);
        return;
      }

      const authSession = await requireSession();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data, error } = await supabase.rpc("complete_focus_session", {
        p_category_id: pending.categoryId,
        p_duration_minutes: pending.durationMinutes,
        p_started_at: pending.startedAt,
        p_completed_at: pending.completedAt,
        p_pause_used: pauseCount > 0,
        p_is_offline: true,
        p_timezone: tz,
      });
      if (error) {
        throw new Error(formatSessionSaveError(error));
      }

      const result = parseCompleteFocusSessionResult(data);
      payload = await hydratePayloadAfterSessionWrite(
        payload,
        result,
        {
          categoryId: pending.categoryId,
          durationMinutes: pending.durationMinutes,
          startedAt: pending.startedAt,
          completedAt: pending.completedAt,
          pauseCount,
        },
        authSession.user.id,
        authSession.access_token,
      );
      syncedIds.push(pending.id);
    };

    for (const pending of sessions) {
      try {
        await pushPending(pending);
      } catch (error) {
        return {
          payload,
          syncedIds,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      }
    }

    return { payload, syncedIds, error: null };
  },

  async fetchDailyGoalProgress(timezone = getDeviceTimeZone()): Promise<DailyGoalProgress> {
    const { data, error } = await supabase.rpc("get_daily_goal_progress", { p_timezone: timezone });
    if (error) {
      throw new Error(error.message);
    }
    const mapped = mapDailyGoalProgress(data);
    if (!mapped) {
      throw new Error("Invalid daily goal progress response");
    }
    return mapped;
  },

  async confirmDailyGoal(goalMinutes: number, timezone = getDeviceTimeZone()): Promise<void> {
    const { error } = await supabase.rpc("upsert_daily_goal", {
      p_goal_minutes: goalMinutes,
      p_timezone: timezone,
    });
    if (error) {
      if (/upsert_daily_goal|schema cache/i.test(error.message)) {
        throw new Error(`${MIGRATION_HINT} (${error.message})`);
      }
      throw new Error(error.message);
    }
  },

  async claimDailyGoalReward(timezone = getDeviceTimeZone()): Promise<DailyGoalClaimResult> {
    const { data, error } = await supabase.rpc("claim_daily_goal_reward", {
      p_timezone: timezone,
    });
    if (error) {
      if (/claim_daily_goal_reward|schema cache/i.test(error.message)) {
        throw new Error(`${MIGRATION_HINT} (${error.message})`);
      }
      throw new Error(error.message);
    }
    return mapDailyGoalClaim(data);
  },

  async fetchDailyGoalHistory(
    days = 30,
    timezone = getDeviceTimeZone(),
  ): Promise<DailyGoalHistoryDay[]> {
    const { data, error } = await supabase.rpc("list_daily_goal_history", {
      p_days: days,
      p_timezone: timezone,
    });
    if (error) {
      throw new Error(error.message);
    }
    return mapDailyGoalHistory(data);
  },

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  },
};
