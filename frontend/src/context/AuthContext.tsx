// [GÖREV 3] — Oturum state’i ayrı AuthContext’e taşındı; SecureStore ve kimlik API’leri burada

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Constants from "expo-constants";
import { api } from "../shared/api";
import { deleteRemoteAccount } from "../services/galacticAdvice";
import { supabase } from "../lib/supabase";
import { asyncStorage, secureStorage } from "../shared/storage";
import { STORAGE_KEYS } from "../shared/constants";
import { trackEvent } from "../shared/analytics";
import { AuthMode, AuthPayload, CelebrationPayload, PendingSession, User } from "../shared/types";
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
  isAuthenticated: boolean;
  authMode: AuthMode;
  setAuthMode: (mode: AuthMode) => void;
  setIsOnline: (online: boolean) => void;
  applyAuthPayload: (payload: AuthPayload) => Promise<void>;
  patchLocalUser: (nextUser: User) => void;
  register: (input: {
    email: string;
    password: string;
    username: string;
    galaxyName: string;
  }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  continueWithProvider: (provider: "google" | "apple") => Promise<void>;
  completeOnboarding: (targetStarId: string) => Promise<void>;
  updateProfile: (input: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const resolveApiUrl = (): string => {
  const raw = Constants.expoConfig?.extra?.apiUrl;
  return typeof raw === "string" ? raw.trim() : "";
};

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
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const apiUrl = useMemo(() => resolveApiUrl(), []);

  const applyAuthPayload = useCallback(
    async (payload: AuthPayload) => {
      setToken(payload.token);
      setUser(payload.user);
      sessionHydrateRef.current?.(payload);
      await secureStorage.set(STORAGE_KEYS.authToken, payload.token);
      uiSetLanguageRef.current?.(payload.user.language);
    },
    [sessionHydrateRef, uiSetLanguageRef],
  );

  const patchLocalUser = useCallback((nextUser: User) => {
    setUser(nextUser);
  }, []);

  useEffect(() => {
    const bootstrap = async () => {
      const [storedToken, storedLanguage, storedPendingSessions] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.authToken),
        asyncStorage.get<User["language"]>(STORAGE_KEYS.language, "tr"),
        asyncStorage.get<PendingSession[]>(STORAGE_KEYS.pendingSessions, []),
      ]);

      sessionSetPendingRef.current?.(storedPendingSessions);
      uiSetLanguageRef.current?.(storedLanguage);

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
    async (input: { email: string; password: string; username: string; galaxyName: string }) => {
      const payload = await api.register(input);
      await applyAuthPayload(payload);
      await trackEvent("signup_completed");
    },
    [applyAuthPayload],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      if (__DEV__ && matchesDevDemoCredentials(input)) {
        const payload = createDevDemoPayload({ email: input.email.trim() });
        await asyncStorage.set(STORAGE_KEYS.demoAuthPayload, payload);
        await applyAuthPayload(payload);
        setIsOnline(false);
        return;
      }

      const payload = await api.login(input);
      await applyAuthPayload(payload);
      setIsOnline(true);
    },
    [applyAuthPayload],
  );

  const continueWithProvider = useCallback(
    async (provider: "google" | "apple") => {
      const payload = await api.continueWithProvider({ provider });
      await applyAuthPayload(payload);
      setIsOnline(true);
    },
    [applyAuthPayload],
  );

  const completeOnboarding = useCallback(
    async (targetStarId: string) => {
      if (!token || !user) {
        return;
      }

      const payload = await api.updateProfile(token, {
        onboardingCompleted: true,
        targetStarId,
      });
      await applyAuthPayload(payload);
      await trackEvent("onboarding_completed");
    },
    [applyAuthPayload, token, user],
  );

  const updateProfile = useCallback(
    async (input: Partial<User>) => {
      if (!token) {
        return;
      }

      const payload = await api.updateProfile(token, input);
      await applyAuthPayload(payload);
    },
    [applyAuthPayload, token],
  );

  const logout = useCallback(async () => {
    setToken(null);
    setUser(null);
    uiSetCelebrationRef.current?.(null);
    try {
      await api.signOut();
    } catch {
      /* offline */
    }
    await secureStorage.remove(STORAGE_KEYS.authToken);
    await asyncStorage.remove(STORAGE_KEYS.demoAuthPayload);
    await asyncStorage.remove(STORAGE_KEYS.pendingSessions);
  }, [uiSetCelebrationRef]);

  const deleteAccount = useCallback(async () => {
    if (!token) {
      return;
    }

    if (!isDevDemoToken(token)) {
      await deleteRemoteAccount(token);
      await api.signOut();
    }

    await logout();
    await trackEvent("account_deleted");
  }, [logout, token]);

  const refreshUser = useCallback(async () => {
    if (!token || isDevDemoToken(token)) {
      return;
    }
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
      isAuthenticated: Boolean(token && user),
      authMode,
      setAuthMode,
      setIsOnline,
      applyAuthPayload,
      patchLocalUser,
      register,
      login,
      continueWithProvider,
      completeOnboarding,
      updateProfile,
      logout,
      refreshUser,
      deleteAccount,
    }),
    [
      apiUrl,
      applyAuthPayload,
      authMode,
      completeOnboarding,
      continueWithProvider,
      deleteAccount,
      isOnline,
      isReady,
      login,
      logout,
      patchLocalUser,
      refreshUser,
      register,
      token,
      updateProfile,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
