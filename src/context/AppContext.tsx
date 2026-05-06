import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  API_URL,
  AVATARS,
  BACKGROUND_TOLERANCE_SECONDS,
  CATEGORIES,
  DEFAULT_DURATION_MINUTES,
  PAUSE_LIMIT,
  STORAGE_KEYS,
  STARS,
} from "../shared/constants";
import { api } from "../shared/api";
import { asyncStorage, secureStorage } from "../shared/storage";
import { trackEvent } from "../shared/analytics";
import { cancelScheduledNotification, scheduleBackgroundWarning } from "../shared/notifications";
import {
  AuthMode,
  AuthPayload,
  DailySummary,
  Language,
  PendingSession,
  SessionRecord,
  TimerStatus,
  User,
} from "../shared/types";

type CelebrationState = {
  stardustEarned: number;
  unlockedStarId: string | null;
} | null;

type SessionState = {
  selectedDurationMinutes: number;
  selectedCategoryId: string;
  status: TimerStatus;
  remainingSeconds: number;
  pauseCount: number;
  startedAt: string | null;
};

type AppContextValue = {
  isReady: boolean;
  isOnline: boolean;
  apiUrl: string;
  token: string | null;
  user: User | null;
  sessions: SessionRecord[];
  unlockedStarIds: string[];
  pendingSessions: PendingSession[];
  language: Language;
  authMode: AuthMode;
  celebration: CelebrationState;
  sessionState: SessionState;
  stars: typeof STARS;
  categories: typeof CATEGORIES;
  avatars: typeof AVATARS;
  dailySummary: DailySummary;
  setAuthMode: (mode: AuthMode) => void;
  setLanguage: (language: Language) => Promise<void>;
  setSelectedDurationMinutes: (minutes: number) => void;
  setSelectedCategoryId: (categoryId: string) => void;
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
  startSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  dismissCelebration: () => void;
  syncOfflineSessions: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

const createGuestSessionState = (): SessionState => ({
  selectedDurationMinutes: DEFAULT_DURATION_MINUTES,
  selectedCategoryId: "general",
  status: "idle",
  remainingSeconds: DEFAULT_DURATION_MINUTES * 60,
  pauseCount: 0,
  startedAt: null,
});

const getDateKey = (value: string) => new Date(value).toLocaleDateString("en-CA");

const DEV_DEMO = {
  tokenPrefix: "dev-demo",
  emailAliases: ["demo", "demo@astrocus.dev"] as string[],
  password: "demo1234",
} as const;

const createDevDemoPayload = (input: { email: string }): AuthPayload => {
  const now = Date.now();
  const user: User = {
    id: `${DEV_DEMO.tokenPrefix}-user`,
    email: input.email.includes("@") ? input.email : "demo@astrocus.dev",
    username: "demo",
    avatar: "🌙",
    galaxyName: "Astrocus",
    language: "tr",
    totalStardust: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastSessionDate: null,
    targetStarId: STARS[0].id,
    onboardingCompleted: true,
    dailyGoalMinutes: 120,
  };

  return {
    token: `${DEV_DEMO.tokenPrefix}:${now}`,
    user,
    sessions: [],
    unlockedStarIds: [STARS[0].id],
  };
};

const isDevDemoToken = (token: string | null) => Boolean(token && token.startsWith(`${DEV_DEMO.tokenPrefix}:`));

const matchesDevDemoCredentials = (input: { email: string; password: string }) => {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();
  return DEV_DEMO.emailAliases.includes(email) && password === DEV_DEMO.password;
};

const getCategoryBonus = (categoryId: string, completedAt: string) => {
  const hours = new Date(completedAt).getHours();

  if (hours >= 6 && hours < 9 && ["meditation", "sports", "reading"].includes(categoryId)) {
    return 0.2;
  }

  if (hours >= 9 && hours < 17 && ["work", "coding", "project"].includes(categoryId)) {
    return 0.2;
  }

  if (hours >= 20 && hours < 23 && categoryId === "creativity") {
    return 0.2;
  }

  return 0;
};

const calculateStardust = (input: {
  durationMinutes: number;
  categoryId: string;
  currentStreak: number;
  pauseCount: number;
  completedAt: string;
}) => {
  const base = input.durationMinutes * 10;
  const streakBonus = Math.min(input.currentStreak * 0.1, 0.5);
  const categoryBonus = getCategoryBonus(input.categoryId, input.completedAt);
  const fullSessionBonus = input.pauseCount === 0 ? 0.1 : 0;
  const totalBonus = streakBonus + categoryBonus + fullSessionBonus;

  return Math.round(base + base * totalBonus);
};

const getUnlockedStars = (totalStardust: number) => {
  return STARS.filter((star) => star.requiredStardust <= totalStardust).map((star) => star.id);
};

const createDailySummary = (sessions: SessionRecord[], user: User | null): DailySummary => {
  const todayKey = getDateKey(new Date().toISOString());
  const todaySessions = sessions.filter((session) => getDateKey(session.completedAt) === todayKey);
  const totalMinutes = todaySessions.reduce((sum, session) => sum + session.durationMinutes, 0);
  const categoryBreakdown = CATEGORIES.map((category) => ({
    categoryId: category.id,
    minutes: todaySessions
      .filter((session) => session.categoryId === category.id)
      .reduce((sum, session) => sum + session.durationMinutes, 0),
  })).filter((item) => item.minutes > 0);

  return {
    totalMinutes,
    completedSessions: todaySessions.length,
    goalProgress: user ? Math.min(totalMinutes / user.dailyGoalMinutes, 1) : 0,
    categoryBreakdown,
  };
};

const mapPayload = (payload: AuthPayload) => {
  const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];
  const unlockedStarIds = Array.isArray(payload.unlockedStarIds) ? payload.unlockedStarIds : getUnlockedStars(payload.user?.totalStardust ?? 0);

  return {
    token: payload.token,
    user: payload.user,
    sessions,
    unlockedStarIds,
  };
};

export const AppProvider = ({ children }: PropsWithChildren) => {
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [unlockedStarIds, setUnlockedStarIds] = useState<string[]>([STARS[0].id]);
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [language, setLanguageState] = useState<Language>("tr");
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [celebration, setCelebration] = useState<CelebrationState>(null);
  const [sessionState, setSessionState] = useState<SessionState>(createGuestSessionState());
  const [isOnline, setIsOnline] = useState(true);
  const backgroundedAtRef = useRef<string | null>(null);
  const scheduledNotificationRef = useRef<string | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      const [storedToken, storedLanguage, storedPendingSessions] = await Promise.all([
        secureStorage.get(STORAGE_KEYS.authToken),
        asyncStorage.get<Language>(STORAGE_KEYS.language, "tr"),
        asyncStorage.get<PendingSession[]>(STORAGE_KEYS.pendingSessions, []),
      ]);

      setLanguageState(storedLanguage);
      setPendingSessions(storedPendingSessions);

      if (storedToken) {
        if (isDevDemoToken(storedToken)) {
          const storedDemoPayload = await asyncStorage.get<AuthPayload | null>(STORAGE_KEYS.demoAuthPayload, null);
          if (storedDemoPayload?.token === storedToken) {
            const nextState = mapPayload(storedDemoPayload);
            setToken(nextState.token);
            setUser(nextState.user);
            setSessions(nextState.sessions);
            setUnlockedStarIds(nextState.unlockedStarIds);
            setSessionState((current) => ({
              ...current,
              selectedDurationMinutes: DEFAULT_DURATION_MINUTES,
              remainingSeconds: DEFAULT_DURATION_MINUTES * 60,
            }));
            setIsOnline(false);
            setIsReady(true);
            return;
          }
        }

        try {
          const payload = await api.bootstrap(storedToken);
          const nextState = mapPayload(payload);
          setToken(nextState.token);
          setUser(nextState.user);
          setSessions(nextState.sessions);
          setUnlockedStarIds(nextState.unlockedStarIds);
          setSessionState((current) => ({
            ...current,
            selectedDurationMinutes: DEFAULT_DURATION_MINUTES,
            remainingSeconds: DEFAULT_DURATION_MINUTES * 60,
          }));
          setIsOnline(true);
        } catch {
          await secureStorage.remove(STORAGE_KEYS.authToken);
          await asyncStorage.remove(STORAGE_KEYS.demoAuthPayload);
          setIsOnline(false);
        }
      }

      setIsReady(true);
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (sessionState.status !== "running") {
      return;
    }

    const intervalId = setInterval(() => {
      setSessionState((current) => {
        if (current.status !== "running") {
          return current;
        }

        if (current.remainingSeconds <= 1) {
          return {
            ...current,
            remainingSeconds: 0,
            status: "completed",
          };
        }

        return {
          ...current,
          remainingSeconds: current.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionState.status]);

  useEffect(() => {
    if (sessionState.status !== "completed") {
      return;
    }

    void finalizeSession();
  }, [sessionState.status]);

  useEffect(() => {
    const handleAppState = async (nextState: AppStateStatus) => {
      if (sessionState.status !== "running") {
        return;
      }

      if (nextState === "background" || nextState === "inactive") {
        backgroundedAtRef.current = new Date().toISOString();
        scheduledNotificationRef.current = await scheduleBackgroundWarning("Astrocus: Yıldızın sönmek üzere - geri dön!");
        return;
      }

      if (nextState === "active" && backgroundedAtRef.current) {
        await cancelScheduledNotification(scheduledNotificationRef.current);
        scheduledNotificationRef.current = null;

        const elapsedSeconds = Math.floor(
          (Date.now() - new Date(backgroundedAtRef.current).getTime()) / 1000,
        );
        backgroundedAtRef.current = null;

        if (elapsedSeconds >= BACKGROUND_TOLERANCE_SECONDS) {
          setSessionState((current) => ({
            ...current,
            status: "failed",
            remainingSeconds: 0,
          }));
          await trackEvent("session_abandoned", { reason: "background_timeout" });
          return;
        }

        setSessionState((current) => ({
          ...current,
          remainingSeconds: Math.max(current.remainingSeconds - elapsedSeconds, 0),
        }));
      }
    };

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [sessionState.status]);

  const applyAuthPayload = async (payload: AuthPayload) => {
    const nextState = mapPayload(payload);
    setToken(nextState.token);
    setUser(nextState.user);
    setSessions(nextState.sessions);
    setUnlockedStarIds(nextState.unlockedStarIds);
    await secureStorage.set(STORAGE_KEYS.authToken, nextState.token);
    await asyncStorage.set(STORAGE_KEYS.language, nextState.user.language);
    setLanguageState(nextState.user.language);
    setIsOnline(true);
  };

  const register = async (input: {
    email: string;
    password: string;
    username: string;
    galaxyName: string;
  }) => {
    const payload = await api.register(input);
    await applyAuthPayload(payload);
    await trackEvent("signup_completed");
  };

  const login = async (input: { email: string; password: string }) => {
    if (__DEV__ && matchesDevDemoCredentials(input)) {
      const payload = createDevDemoPayload({ email: input.email.trim() });
      await asyncStorage.set(STORAGE_KEYS.demoAuthPayload, payload);
      await applyAuthPayload(payload);
      setIsOnline(false);
      return;
    }

    const payload = await api.login(input);
    await applyAuthPayload(payload);
  };

  const continueWithProvider = async (provider: "google" | "apple") => {
    const payload = await api.continueWithProvider({ provider });
    await applyAuthPayload(payload);
  };

  const completeOnboarding = async (targetStarId: string) => {
    if (!token || !user) {
      return;
    }

    const payload = await api.updateProfile(token, {
      onboardingCompleted: true,
      targetStarId,
    });
    await applyAuthPayload(payload);
    await trackEvent("onboarding_completed");
  };

  const updateProfile = async (input: Partial<User>) => {
    if (!token) {
      return;
    }

    const payload = await api.updateProfile(token, input);
    await applyAuthPayload(payload);
  };

  const setLanguage = async (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    await asyncStorage.set(STORAGE_KEYS.language, nextLanguage);

    if (token) {
      try {
        const payload = await api.updateProfile(token, { language: nextLanguage });
        await applyAuthPayload(payload);
      } catch {
        setIsOnline(false);
      }
    }
  };

  const startSession = async () => {
    const startedAt = new Date().toISOString();
    setSessionState((current) => ({
      ...current,
      status: "running",
      remainingSeconds: current.selectedDurationMinutes * 60,
      pauseCount: 0,
      startedAt,
    }));
    await trackEvent("session_started", {
      duration: sessionState.selectedDurationMinutes,
      categoryId: sessionState.selectedCategoryId,
    });
  };

  const pauseSession = () => {
    setSessionState((current) => {
      if (current.status !== "running" || current.pauseCount >= PAUSE_LIMIT) {
        return current;
      }

      return {
        ...current,
        status: "paused",
        pauseCount: current.pauseCount + 1,
      };
    });
  };

  const resumeSession = () => {
    setSessionState((current) => {
      if (current.status !== "paused") {
        return current;
      }

      return {
        ...current,
        status: "running",
      };
    });
  };

  const resetSession = () => {
    void cancelScheduledNotification(scheduledNotificationRef.current);
    backgroundedAtRef.current = null;
    scheduledNotificationRef.current = null;
    setSessionState(createGuestSessionState());
  };

  const applyOptimisticSession = async (pendingSession: PendingSession) => {
    if (!user) {
      return;
    }

    const nextStardust = calculateStardust({
      durationMinutes: pendingSession.durationMinutes,
      categoryId: pendingSession.categoryId,
      currentStreak: user.currentStreak + 1,
      pauseCount: sessionState.pauseCount,
      completedAt: pendingSession.completedAt,
    });
    const nextSession: SessionRecord = {
      id: pendingSession.id,
      userId: user.id,
      categoryId: pendingSession.categoryId,
      durationMinutes: pendingSession.durationMinutes,
      stardustEarned: nextStardust,
      startedAt: pendingSession.startedAt,
      completedAt: pendingSession.completedAt,
      isOffline: true,
    };
    const nextUser: User = {
      ...user,
      totalStardust: user.totalStardust + nextStardust,
      currentStreak: user.currentStreak + 1,
      longestStreak: Math.max(user.longestStreak, user.currentStreak + 1),
      lastSessionDate: getDateKey(pendingSession.completedAt),
    };

    setSessions((current) => [...current, nextSession]);
    setUser(nextUser);
    setUnlockedStarIds(getUnlockedStars(nextUser.totalStardust));
    setCelebration({
      stardustEarned: nextStardust,
      unlockedStarId: null,
    });
  };

  const finalizeSession = async () => {
    if (!token || !user || !sessionState.startedAt) {
      resetSession();
      return;
    }

    const completedAt = new Date().toISOString();
    const payload = {
      categoryId: sessionState.selectedCategoryId,
      durationMinutes: sessionState.selectedDurationMinutes,
      startedAt: sessionState.startedAt,
      completedAt,
      pauseCount: sessionState.pauseCount,
    };

    try {
      const response = await api.completeSession(token, payload);
      await applyAuthPayload(response.payload);
      setCelebration({
        stardustEarned: response.stardustEarned,
        unlockedStarId: response.unlockedStarId,
      });
      await trackEvent("session_completed", {
        stardust: response.stardustEarned,
      });
    } catch {
      setIsOnline(false);
      const pendingSession: PendingSession = {
        id: `${Date.now()}`,
        categoryId: payload.categoryId,
        durationMinutes: payload.durationMinutes,
        startedAt: payload.startedAt,
        completedAt,
      };
      const nextPendingSessions = [...pendingSessions, pendingSession];
      setPendingSessions(nextPendingSessions);
      await asyncStorage.set(STORAGE_KEYS.pendingSessions, nextPendingSessions);
      await applyOptimisticSession(pendingSession);
    } finally {
      setSessionState(createGuestSessionState());
    }
  };

  const syncOfflineSessions = async () => {
    if (!token || pendingSessions.length === 0) {
      return;
    }

    const payload = await api.syncSessions(token, pendingSessions);
    await applyAuthPayload(payload);
    setPendingSessions([]);
    await asyncStorage.set(STORAGE_KEYS.pendingSessions, []);
    setIsOnline(true);
  };

  const signOut = async () => {
    setToken(null);
    setUser(null);
    setSessions([]);
    setUnlockedStarIds([STARS[0].id]);
    setPendingSessions([]);
    setCelebration(null);
    setSessionState(createGuestSessionState());
    await secureStorage.remove(STORAGE_KEYS.authToken);
    await asyncStorage.remove(STORAGE_KEYS.demoAuthPayload);
    await asyncStorage.remove(STORAGE_KEYS.pendingSessions);
  };

  const dailySummary = useMemo(() => createDailySummary(sessions, user), [sessions, user]);

  const value = useMemo<AppContextValue>(
    () => ({
      isReady,
      isOnline,
      apiUrl: API_URL,
      token,
      user,
      sessions,
      unlockedStarIds,
      pendingSessions,
      language,
      authMode,
      celebration,
      sessionState,
      stars: STARS,
      categories: CATEGORIES,
      avatars: AVATARS,
      dailySummary,
      setAuthMode,
      setLanguage,
      setSelectedDurationMinutes: (minutes: number) =>
        setSessionState((current) => ({
          ...current,
          selectedDurationMinutes: minutes,
          remainingSeconds: minutes * 60,
        })),
      setSelectedCategoryId: (categoryId: string) =>
        setSessionState((current) => ({
          ...current,
          selectedCategoryId: categoryId,
        })),
      register,
      login,
      continueWithProvider,
      completeOnboarding,
      updateProfile,
      startSession,
      pauseSession,
      resumeSession,
      resetSession,
      dismissCelebration: () => setCelebration(null),
      syncOfflineSessions,
      signOut,
    }),
    [
      authMode,
      celebration,
      dailySummary,
      isOnline,
      isReady,
      language,
      pendingSessions,
      sessionState,
      sessions,
      token,
      unlockedStarIds,
      user,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used inside AppProvider");
  }

  return context;
};
