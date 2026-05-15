// [GÖREV 3] — Odak seansı, offline kuyruk ve stardust hesapları SessionContext’e taşındı

import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AppState, AppStateStatus } from "react-native";
import {
  AVATARS,
  BACKGROUND_TOLERANCE_SECONDS,
  CATEGORIES,
  DEFAULT_DURATION_MINUTES,
  PAUSE_LIMIT,
  STORAGE_KEYS,
  STARS,
} from "../shared/constants";
import { api } from "../shared/api";
import { fetchGalacticAdvice } from "../services/galacticAdvice";
import { asyncStorage } from "../shared/storage";
import { trackEvent } from "../shared/analytics";
import { cancelScheduledNotification, scheduleBackgroundWarning } from "../shared/notifications";
import { AuthPayload, PendingSession, SessionRecord, TimerStatus, User } from "../shared/types";
import { useAuth } from "./AuthContext";
import { isDevDemoToken } from "./auth/devDemo";
import type { AstrocusInfraRefs } from "./AuthContext";
import { calculateStardust, createDailySummary, getUnlockedStars } from "./session/stardust";
import { getDateKey } from "./session/dateKey";

type SessionState = {
  selectedDurationMinutes: number;
  selectedCategoryId: string;
  status: TimerStatus;
  remainingSeconds: number;
  pauseCount: number;
  startedAt: string | null;
};

export type SessionContextValue = {
  sessions: SessionRecord[];
  unlockedStarIds: string[];
  pendingSessions: PendingSession[];
  sessionState: SessionState;
  stars: typeof STARS;
  categories: typeof CATEGORIES;
  avatars: typeof AVATARS;
  dailySummary: ReturnType<typeof createDailySummary>;
  setSelectedDurationMinutes: (minutes: number) => void;
  setSelectedCategoryId: (categoryId: string) => void;
  startSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  endSession: () => void;
  syncOfflineQueue: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const createGuestSessionState = (): SessionState => ({
  selectedDurationMinutes: DEFAULT_DURATION_MINUTES,
  selectedCategoryId: "general",
  status: "idle",
  remainingSeconds: DEFAULT_DURATION_MINUTES * 60,
  pauseCount: 0,
  startedAt: null,
});

type SessionProviderProps = PropsWithChildren<
  Pick<AstrocusInfraRefs, "sessionHydrateRef" | "sessionSetPendingRef" | "uiSetCelebrationRef">
>;

export const SessionProvider = ({
  children,
  sessionHydrateRef,
  sessionSetPendingRef,
  uiSetCelebrationRef,
}: SessionProviderProps) => {
  const { token, user, isReady, applyAuthPayload, setIsOnline, patchLocalUser } = useAuth();
  const prevTokenRef = useRef<string | null>(null);
  const sessionBootstrapPrimedRef = useRef(false);

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [unlockedStarIds, setUnlockedStarIds] = useState<string[]>([STARS[0].id]);
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [sessionState, setSessionState] = useState<SessionState>(createGuestSessionState());
  const backgroundedAtRef = useRef<string | null>(null);
  const scheduledNotificationRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    sessionHydrateRef.current = (payload: AuthPayload) => {
      const nextSessions = Array.isArray(payload.sessions) ? payload.sessions : [];
      const nextUnlocked =
        Array.isArray(payload.unlockedStarIds) && payload.unlockedStarIds.length > 0
          ? payload.unlockedStarIds
          : getUnlockedStars(payload.user?.totalStardust ?? 0);
      setSessions(nextSessions);
      setUnlockedStarIds(nextUnlocked);
    };

    sessionSetPendingRef.current = (pending: PendingSession[]) => {
      setPendingSessions(pending);
    };

    return () => {
      sessionHydrateRef.current = null;
      sessionSetPendingRef.current = null;
    };
  }, [sessionHydrateRef, sessionSetPendingRef]);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    const prev = prevTokenRef.current;
    prevTokenRef.current = token;

    if (prev && !token) {
      sessionBootstrapPrimedRef.current = false;
      setSessions([]);
      setUnlockedStarIds([STARS[0].id]);
      setPendingSessions([]);
      setSessionState(createGuestSessionState());
      void cancelScheduledNotification(scheduledNotificationRef.current);
      backgroundedAtRef.current = null;
      scheduledNotificationRef.current = null;
    }
  }, [isReady, token]);

  useEffect(() => {
    if (!isReady || !token || !user) {
      return;
    }
    if (sessionBootstrapPrimedRef.current) {
      return;
    }
    sessionBootstrapPrimedRef.current = true;
    setSessionState((current) => ({
      ...current,
      selectedDurationMinutes: DEFAULT_DURATION_MINUTES,
      remainingSeconds: DEFAULT_DURATION_MINUTES * 60,
    }));
  }, [isReady, token, user]);

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

  const applyOptimisticSession = useCallback(
    (pendingSession: PendingSession, pauseCount: number) => {
      if (!user) {
        return;
      }

      const nextStardust = calculateStardust({
        durationMinutes: pendingSession.durationMinutes,
        categoryId: pendingSession.categoryId,
        currentStreak: user.currentStreak + 1,
        pauseCount,
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
      setUnlockedStarIds(getUnlockedStars(nextUser.totalStardust));
      patchLocalUser(nextUser);
      uiSetCelebrationRef.current?.({
        stardustEarned: nextStardust,
        unlockedStarId: null,
      });
    },
    [patchLocalUser, uiSetCelebrationRef, user],
  );

  const finalizeSession = useCallback(async () => {
    if (!token || !user || !sessionState.startedAt) {
      setSessionState(createGuestSessionState());
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
      const response = await api.completeSession(token, payload, user);
      await applyAuthPayload(response.payload);
      let galacticAdvice: string | undefined;
      if (!isDevDemoToken(token)) {
        try {
          galacticAdvice = await fetchGalacticAdvice(token, {
            language: user.language,
            durationMinutes: payload.durationMinutes,
            categoryId: payload.categoryId,
            currentStreak: response.payload.user.currentStreak,
            todayTotalMinutes: createDailySummary(response.payload.sessions, response.payload.user).totalMinutes,
            totalStardust: response.payload.user.totalStardust,
          });
        } catch {
          galacticAdvice = undefined;
        }
      }
      uiSetCelebrationRef.current?.({
        stardustEarned: response.stardustEarned,
        unlockedStarId: response.unlockedStarId,
        galacticAdvice,
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
      setPendingSessions((current) => {
        const nextPendingSessions = [...current, pendingSession];
        void asyncStorage.set(STORAGE_KEYS.pendingSessions, nextPendingSessions);
        return nextPendingSessions;
      });
      applyOptimisticSession(pendingSession, sessionState.pauseCount);
    } finally {
      setSessionState(createGuestSessionState());
    }
  }, [
    applyAuthPayload,
    applyOptimisticSession,
    sessionState.pauseCount,
    sessionState.selectedCategoryId,
    sessionState.selectedDurationMinutes,
    sessionState.startedAt,
    setIsOnline,
    token,
    uiSetCelebrationRef,
    user,
  ]);

  useEffect(() => {
    if (sessionState.status !== "completed") {
      return;
    }

    void finalizeSession();
  }, [finalizeSession, sessionState.status]);

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

  const startSession = useCallback(async () => {
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
  }, [sessionState.selectedCategoryId, sessionState.selectedDurationMinutes]);

  const pauseSession = useCallback(() => {
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
  }, []);

  const resumeSession = useCallback(() => {
    setSessionState((current) => {
      if (current.status !== "paused") {
        return current;
      }

      return {
        ...current,
        status: "running",
      };
    });
  }, []);

  const resetSession = useCallback(() => {
    void cancelScheduledNotification(scheduledNotificationRef.current);
    backgroundedAtRef.current = null;
    scheduledNotificationRef.current = null;
    setSessionState(createGuestSessionState());
  }, []);

  const syncOfflineQueue = useCallback(async () => {
    if (!token || pendingSessions.length === 0) {
      return;
    }

    const payload = await api.syncSessions(token, pendingSessions);
    await applyAuthPayload(payload);
    setPendingSessions([]);
    await asyncStorage.set(STORAGE_KEYS.pendingSessions, []);
    setIsOnline(true);
  }, [applyAuthPayload, pendingSessions, setIsOnline, token]);

  const dailySummary = useMemo(() => createDailySummary(sessions, user), [sessions, user]);

  const value = useMemo<SessionContextValue>(
    () => ({
      sessions,
      unlockedStarIds,
      pendingSessions,
      sessionState,
      stars: STARS,
      categories: CATEGORIES,
      avatars: AVATARS,
      dailySummary,
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
      startSession,
      pauseSession,
      resumeSession,
      resetSession,
      endSession: resetSession,
      syncOfflineQueue,
    }),
    [
      dailySummary,
      pauseSession,
      pendingSessions,
      resetSession,
      resumeSession,
      sessionState,
      sessions,
      startSession,
      syncOfflineQueue,
      unlockedStarIds,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
};

export const useSession = (): SessionContextValue => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within SessionProvider");
  }
  return context;
};
