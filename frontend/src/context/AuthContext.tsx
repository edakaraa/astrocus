import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api } from "../shared/api";
import { getApiUrl } from "../shared/config";
import { deleteRemoteAccount } from "../services/accountApi";
import { supabase } from "../lib/supabase";
import { asyncStorage, secureStorage } from "../shared/storage";
import { STORAGE_KEYS } from "../shared/constants";
import { resolveInitialLanguage } from "../shared/resolveLanguage";
import { trackEvent } from "../shared/analytics";
import { AuthMode, AuthPayload, CelebrationPayload, PendingSession, UnlockStarResult, User, UserConstellationRow } from "../shared/types";
import { createDevDemoPayload, isDevDemoToken, matchesDevDemoCredentials } from "./auth/devDemo";

export type AstrocusInfraRefs = {
  sessionHydrateRef: React.MutableRefObject<((payload: AuthPayload) => void) | null>;
  sessionSetPendingRef: React.MutableRefObject<((sessions: PendingSession[]) => void) | null>;
  uiSetLanguageRef: React.MutableRefObject<((language: User["language"]) => void) | null>;
  uiSetCelebrationRef: React.MutableRefObject<((state: CelebrationPayload) => void) | null>;
};

export type AuthContextValue = {
  isReady: boolean;
  isOnline: boolean;
  apiUrl: string;
  token: string | null;
  user: User | null;
  constellationProgress: UserConstellationRow[];
  isAuthenticated: boolean;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  setIsOnline: (online: boolean) => void;
  applyAuthPayload: (payload: AuthPayload) => Promise<void>;
  register: (
    input: {
      email: string;
      password: string;
      username: string;
      displayName: string;
      galaxyName?: string;
    },
    language: User["language"],
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  unlockStar: (starId: string) => Promise<UnlockStarResult | null>;
  login: (input: { email: string; password: string }, language: User["language"]) => Promise<void>;
  continueWithGoogle: () => Promise<void>;
  continueWithApple: () => Promise<void>;
  completeOnboarding: (constellationId: string) => Promise<void>;
  updateProfile: (input: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = PropsWithChildren<AstrocusInfraRefs>;

export const AuthProvider = ({
  children,
  sessionHydrateRef,
  sessionSetPendingRef,
  uiSetLanguageRef,
  uiSetCelebrationRef,
}: AuthProviderProps) => {
  const [isReady, setIsReady] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [constellationProgress, setConstellationProgress] = useState<UserConstellationRow[]>([]);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const apiUrl = useMemo(() => getApiUrl(), []);

  const applyAuthPayload = useCallback(
    async (payload: AuthPayload) => {
      setToken(payload.token);
      setUser(payload.user);
      setConstellationProgress(payload.constellationProgress ?? []);
      sessionHydrateRef.current?.(payload);
      await secureStorage.set(STORAGE_KEYS.authToken, payload.token);
      uiSetLanguageRef.current?.(payload.user.language);
    },
    [sessionHydrateRef, uiSetLanguageRef],
  );

  useEffect(() => {
    const bootstrap = async () => {
      const [storedToken, initialLanguage, storedPendingSessions] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.authToken),
        resolveInitialLanguage(),
        asyncStorage.get<PendingSession[]>(STORAGE_KEYS.pendingSessions, []),
      ]);

      sessionSetPendingRef.current?.(storedPendingSessions);
      uiSetLanguageRef.current?.(initialLanguage);

      if (storedToken) {
        if (isDevDemoToken(storedToken)) {
          const storedDemoPayload = await asyncStorage.get<AuthPayload | null>(STORAGE_KEYS.demoAuthPayload, null);
          if (storedDemoPayload?.token === storedToken) {
            await applyAuthPayload(storedDemoPayload);
            setIsOnline(false);
            setIsReady(true);
            return;
          }
        }
        try {
          const { data: liveSession } = await supabase.auth.getSession();
          const activeToken = liveSession.session?.access_token ?? storedToken;
          const payload = await api.bootstrap(activeToken);
          await applyAuthPayload(payload);
          setIsOnline(true);
        } catch {
          await secureStorage.remove(STORAGE_KEYS.authToken);
          await asyncStorage.remove(STORAGE_KEYS.demoAuthPayload);
          setIsOnline(false);
        }
      }

      setIsReady(true);
    };

    void bootstrap();
  }, [applyAuthPayload, sessionSetPendingRef, uiSetLanguageRef]);

  const register = useCallback(
    async (
      input: { email: string; password: string; username: string; displayName: string; galaxyName?: string },
      language: User["language"],
    ) => {
      const payload = await api.register(input, language);
      await applyAuthPayload(payload);
      await trackEvent("signup_completed");
    },
    [applyAuthPayload],
  );

  const resetPassword = useCallback(async (email: string) => {
    await api.resetPassword(email);
  }, []);

  const unlockStar = useCallback(
    async (starId: string): Promise<UnlockStarResult | null> => {
      if (!token || isDevDemoToken(token)) return null;
      const { result, payload } = await api.unlockStar(token, starId);
      await applyAuthPayload(payload);
      if (result.constellationCompleted) {
        uiSetCelebrationRef.current?.({
          stardustEarned: 0,
          unlockedStarId: starId,
          newBadgeIds: result.newBadgeId ? [result.newBadgeId] : undefined,
          completedConstellationId: starId.split("_")[0],
        });
      }
      return result;
    },
    [applyAuthPayload, token, uiSetCelebrationRef],
  );

  const login = useCallback(
    async (input: { email: string; password: string }, language: User["language"]) => {
      if (__DEV__ && matchesDevDemoCredentials(input)) {
        const payload = createDevDemoPayload({ email: input.email.trim() });
        await asyncStorage.set(STORAGE_KEYS.demoAuthPayload, payload);
        await applyAuthPayload(payload);
        setIsOnline(false);
        return;
      }
      const payload = await api.login(input, language);
      await applyAuthPayload(payload);
      setIsOnline(true);
    },
    [applyAuthPayload],
  );

  const continueWithGoogle = useCallback(async () => {
    const payload = await api.continueWithGoogle();
    await applyAuthPayload(payload);
    setIsOnline(true);
  }, [applyAuthPayload]);

  const continueWithApple = useCallback(async () => {
    const payload = await api.continueWithApple();
    await applyAuthPayload(payload);
    setIsOnline(true);
  }, [applyAuthPayload]);

  /**
   * Onboarding completion: user picks their first constellation.
   * Calls the secure start_constellation RPC which sets active_constellation_id
   * and inserts a user_constellations row atomically.
   */
  const completeOnboarding = useCallback(
    async (constellationId: string) => {
      if (!token || !user) return;
      if (isDevDemoToken(token)) {
        const demoPayload = createDevDemoPayload({ email: user.email });
        await applyAuthPayload({ ...demoPayload, user: { ...demoPayload.user, onboardingCompleted: true, activeConstellationId: constellationId } });
        await asyncStorage.set(STORAGE_KEYS.onboardingSeen, true);
        return;
      }
      const payload = await api.startConstellation(constellationId);
      await applyAuthPayload(payload);
      await asyncStorage.set(STORAGE_KEYS.onboardingSeen, true);
      await trackEvent("onboarding_completed", { constellation: constellationId });
    },
    [applyAuthPayload, token, user],
  );

  const updateProfile = useCallback(
    async (input: Partial<User>) => {
      if (!token) return;
      const payload = await api.updateProfile(token, input);
      await applyAuthPayload(payload);
    },
    [applyAuthPayload, token],
  );

  const logout = useCallback(async () => {
    uiSetCelebrationRef.current?.(null);
    try {
      await api.signOut();
    } catch {
      /* offline */
    }
    setToken(null);
    setUser(null);
    setConstellationProgress([]);
    await secureStorage.remove(STORAGE_KEYS.authToken);
    await asyncStorage.remove(STORAGE_KEYS.demoAuthPayload);
    await asyncStorage.remove(STORAGE_KEYS.pendingSessions);
  }, [uiSetCelebrationRef]);

  const deleteAccount = useCallback(async () => {
    if (!token) return;
    if (!isDevDemoToken(token)) await deleteRemoteAccount(token);
    try {
      await api.signOut();
    } catch {
      /* session may already be invalid */
    }
    await logout();
    await trackEvent("account_deleted");
  }, [logout, token]);

  const refreshUser = useCallback(async () => {
    if (!token || isDevDemoToken(token)) return;
    try {
      const payload = await api.bootstrap(token);
      await applyAuthPayload(payload);
      setIsOnline(true);
    } catch {
      setIsOnline(false);
    }
  }, [applyAuthPayload, token]);

  const value = useMemo<AuthContextValue>(
    () => ({
      isReady,
      isOnline,
      apiUrl,
      token,
      user,
      constellationProgress,
      isAuthenticated: Boolean(token && user),
      authMode,
      setAuthMode,
      setIsOnline,
      applyAuthPayload,
      register,
      resetPassword,
      login,
      continueWithGoogle,
      continueWithApple,
      completeOnboarding,
      updateProfile,
      unlockStar,
      logout,
      refreshUser,
      deleteAccount,
    }),
    [
      apiUrl,
      applyAuthPayload,
      authMode,
      completeOnboarding,
      constellationProgress,
      continueWithGoogle,
      continueWithApple,
      deleteAccount,
      isOnline,
      isReady,
      login,
      logout,
      refreshUser,
      register,
      resetPassword,
      token,
      unlockStar,
      updateProfile,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
