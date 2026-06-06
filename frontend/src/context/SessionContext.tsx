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
import NetInfo from "@react-native-community/netinfo";
import {
  PRESET_AVATARS,
  BACKGROUND_TOLERANCE_SECONDS,
  CATEGORIES,
  STORAGE_KEYS,
  STARS,
} from "../shared/constants";
import { api, formatSessionSaveError } from "../shared/api";
import { fetchAnalyticsSummary } from "../services/analyticsApi";
import { asyncStorage } from "../shared/storage";
import { t } from "../shared/i18n";
import {
  trackFirstSessionStarted,
  trackSessionCompleted,
  trackStreakIncreased,
} from "../lib/analytics";
import { cancelScheduledNotification, scheduleBackgroundWarning } from "../shared/notifications";
import {
  AnalyticsSummary,
  AuthPayload,
  DailyGoalProgress,
  PendingSession,
  SessionRecord,
} from "../shared/types";
import { useAuth } from "./AuthContext";
import { toastTone, useAppNotifier } from "./NotificationContext";
import { isDevDemoToken } from "./auth/devDemo";
import type { AstrocusInfraRefs } from "./AuthContext";
import {
  buildCompletionSnapshot,
  completeFocusTimer,
  createIdleFocusTimerState,
  failFocusSession,
  heartbeatTick,
  pauseFocusSession,
  resumeFocusSession,
  snapshotFocusedMinutes,
  startFocusSession,
  syncFocusTimer,
  type FocusTimerState,
  type SessionCompletionSnapshot,
} from "./session/sessionTimer";
import { persistLocalDailyGoal } from "../lib/dailyGoalStorage";
import { mergeSessionsWithPending } from "./session/offlineSessions";
import { shouldQueueSessionAfterSaveFailure } from "./session/offlineQueue";
import { createDailySummary, estimateSessionCelebration } from "./session/stardust";

type SessionState = FocusTimerState;

export type SessionContextValue = {
  sessions: SessionRecord[];
  unlockedStarIds: string[];
  earnedBadgeIds: string[];
  pendingSessions: PendingSession[];
  sessionState: SessionState;
  stars: typeof STARS;
  categories: typeof CATEGORIES;
  avatars: typeof PRESET_AVATARS;
  dailySummary: ReturnType<typeof createDailySummary>;
  dailyGoalToday: DailyGoalProgress | null;
  analyticsSummary: AnalyticsSummary | null;
  refreshAnalytics: () => Promise<void>;
  setSelectedDurationMinutes: (minutes: number) => void;
  setSelectedCategoryId: (categoryId: string) => void;
  startSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  /** Cancel an in-progress session. Applies partial-stardust threshold (min 5 min or 50% of plan). */
  cancelSession: () => Promise<void>;
  endSession: () => void;
  syncOfflineQueue: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const createGuestSessionState = (): SessionState => createIdleFocusTimerState();

type SessionProviderProps = PropsWithChildren<
  Pick<
    AstrocusInfraRefs,
    "sessionHydrateRef" | "sessionSetPendingRef" | "uiSetCelebrationRef"
  >
>;

export const SessionProvider = ({
  children,
  sessionHydrateRef,
  sessionSetPendingRef,
  uiSetCelebrationRef,
}: SessionProviderProps) => {
  const { token, user, isReady, applyAuthPayload, setIsOnline, apiUrl, constellationProgress } = useAuth();
  const { showAlert, showToast } = useAppNotifier();
  const prevTokenRef = useRef<string | null>(null);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [unlockedStarIds, setUnlockedStarIds] = useState<string[]>([STARS[0].id]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [sessionState, setSessionState] = useState<SessionState>(createGuestSessionState());
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
  const [dailyGoalToday, setDailyGoalToday] = useState<DailyGoalProgress | null>(null);
  const backgroundedAtRef = useRef<string | null>(null);
  const scheduledNotificationRef = useRef<string | null>(null);
  const completionSnapshotRef = useRef<SessionCompletionSnapshot | null>(null);
  const finalizingRef = useRef(false);

  const refreshAnalytics = useCallback(async () => {
    if (!token || !apiUrl?.trim() || isDevDemoToken(token)) {
      setAnalyticsSummary(null);
      return;
    }
    try {
      const data = await fetchAnalyticsSummary(apiUrl, token);
      setAnalyticsSummary(data);
    } catch {
      setAnalyticsSummary(null);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    void refreshAnalytics();
  }, [refreshAnalytics]);

  useLayoutEffect(() => {
    sessionHydrateRef.current = (payload: AuthPayload) => {
      const nextSessions = Array.isArray(payload.sessions) ? payload.sessions : [];
      const nextUnlocked =
        Array.isArray(payload.unlockedStarIds) && payload.unlockedStarIds.length > 0
          ? payload.unlockedStarIds
          : [STARS[0].id];
      setSessions(nextSessions);
      setUnlockedStarIds(nextUnlocked);
      setEarnedBadgeIds(Array.isArray(payload.earnedBadgeIds) ? payload.earnedBadgeIds : []);
      const nextDailyGoal = payload.dailyGoalToday ?? null;
      setDailyGoalToday(nextDailyGoal);
      if (nextDailyGoal && nextDailyGoal.goalMinutes > 0) {
        void persistLocalDailyGoal(nextDailyGoal.goalMinutes, nextDailyGoal);
      }
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
      setSessions([]);
      setDailyGoalToday(null);
      setUnlockedStarIds([STARS[0].id]);
      setPendingSessions([]);
      setSessionState(createGuestSessionState());
      void cancelScheduledNotification(scheduledNotificationRef.current);
      backgroundedAtRef.current = null;
      scheduledNotificationRef.current = null;
    }
  }, [isReady, token]);

  useEffect(() => {
    if (sessionState.status !== "running") {
      return;
    }

    const intervalId = setInterval(() => {
      setSessionState((current) => {
        if (current.status !== "running") {
          return current;
        }

        const next = heartbeatTick(current, Date.now());
        if (next.status === "completed" && current.status === "running") {
          completionSnapshotRef.current =
            buildCompletionSnapshot(next, Date.now(), true) ?? null;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionState.status]);

  const notifyQueuedForSync = useCallback(
    (meta: {
      durationMinutes: number;
      todayTotalMinutes: number;
      streakCount: number;
      stardustEarned: number;
    }) => {
      uiSetCelebrationRef.current?.({
        pendingSync: true,
        stardustEarned: meta.stardustEarned,
        durationMinutes: meta.durationMinutes,
        todayTotalMinutes: meta.todayTotalMinutes,
        streakCount: meta.streakCount,
        unlockedStarId: null,
      });
    },
    [uiSetCelebrationRef],
  );

  const buildAuthSnapshot = useCallback((): AuthPayload | null => {
    if (!token || !user) {
      return null;
    }
    return {
      token,
      user,
      sessions,
      unlockedStarIds,
      earnedBadgeIds,
      constellationProgress,
    };
  }, [constellationProgress, earnedBadgeIds, sessions, token, unlockedStarIds, user]);

  const finalizeSession = useCallback(
    async (snapshot: SessionCompletionSnapshot) => {
      if (finalizingRef.current) {
        return;
      }
      finalizingRef.current = true;

      if (!token || !user) {
        finalizingRef.current = false;
        completionSnapshotRef.current = null;
        setSessionState(createGuestSessionState());
        return;
      }

      const completedAt = snapshot.completedAt;
      const durationMinutes = snapshotFocusedMinutes(snapshot);
      if (durationMinutes < 1) {
        finalizingRef.current = false;
        completionSnapshotRef.current = null;
        setSessionState(createGuestSessionState());
        return;
      }

      const sessionInput = {
        categoryId: snapshot.categoryId,
        durationMinutes,
        startedAt: snapshot.startedAt,
        completedAt,
        pauseCount: snapshot.pauseCount,
      };
      const authSnapshot = buildAuthSnapshot();
      if (!authSnapshot) {
        finalizingRef.current = false;
        completionSnapshotRef.current = null;
        setSessionState(createGuestSessionState());
        return;
      }

      try {
        const response = await api.completeSession(
          token,
          sessionInput,
          authSnapshot,
          unlockedStarIds,
          earnedBadgeIds,
        );
        await applyAuthPayload(response.payload);
        void refreshAnalytics();
        uiSetCelebrationRef.current?.({
          stardustEarned: response.stardustEarned,
          streakCount: response.streakCount,
          durationMinutes: response.durationMinutes,
          todayTotalMinutes: response.todayTotalMinutes,
          unlockedStarId: response.unlockedStarId,
          newBadgeIds: response.newBadges.length > 0 ? response.newBadges : undefined,
        });
        const durationSeconds = durationMinutes * 60;
        const plannedSeconds = snapshot.plannedDurationMinutes * 60;
        const focusScore =
          plannedSeconds > 0
            ? Math.min(100, Math.round((snapshot.focusedSeconds / plannedSeconds) * 100))
            : 100;
        trackSessionCompleted(durationSeconds, focusScore);
        if (response.streakCount > user.currentStreak) {
          trackStreakIncreased(response.streakCount);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn("[Astrocus session complete failed]", error);
        }

        const message = formatSessionSaveError(error);
        const language = user.language;
        const shouldQueue = await shouldQueueSessionAfterSaveFailure(error);

        if (!shouldQueue) {
          void showAlert({
            title: t(language, "sessionSaveFailedTitle"),
            message,
            confirmLabel: t(language, "ok"),
            icon: toastTone.error.icon,
          });
          return;
        }

        setIsOnline(false);
        const pendingSession: PendingSession = {
          id: `${Date.now()}`,
          categoryId: sessionInput.categoryId,
          durationMinutes: sessionInput.durationMinutes,
          startedAt: sessionInput.startedAt,
          completedAt,
          pauseCount: sessionInput.pauseCount,
        };
        setPendingSessions((current) => {
          const nextPendingSessions = [...current, pendingSession];
          void asyncStorage.set(STORAGE_KEYS.pendingSessions, nextPendingSessions);
          return nextPendingSessions;
        });

        const estimate = estimateSessionCelebration(authSnapshot, {
          durationMinutes: sessionInput.durationMinutes,
          startedAt: sessionInput.startedAt,
          completedAt,
          pauseCount: sessionInput.pauseCount,
        });
        notifyQueuedForSync(estimate);
        showToast({
          title: t(language, "celebrationQueued"),
          subtitle: t(language, "celebrationPendingSync"),
          ...toastTone.success,
        });
      } finally {
        finalizingRef.current = false;
        completionSnapshotRef.current = null;
        setSessionState(createGuestSessionState());
      }
    },
    [
      applyAuthPayload,
      buildAuthSnapshot,
      notifyQueuedForSync,
      refreshAnalytics,
      setIsOnline,
      token,
      showAlert,
      showToast,
      uiSetCelebrationRef,
      earnedBadgeIds,
      unlockedStarIds,
      user,
    ],
  );

  useEffect(() => {
    if (sessionState.status !== "completed") {
      return;
    }

    const snapshot =
      completionSnapshotRef.current ??
      buildCompletionSnapshot(
        sessionState,
        Date.now(),
        sessionState.status === "completed",
      );
    if (!snapshot) {
      setSessionState(createGuestSessionState());
      return;
    }

    void finalizeSession(snapshot);
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
          setSessionState((current) => failFocusSession(current));
          return;
        }

        setSessionState((current) => {
          if (current.status !== "running") {
            return current;
          }

          const synced = syncFocusTimer(current, Date.now());
          if (synced.remainingSeconds <= 0) {
            const completed = completeFocusTimer(synced);
            completionSnapshotRef.current =
              buildCompletionSnapshot(completed, Date.now(), true) ?? null;
            return completed;
          }

          return synced;
        });
      }
    };

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => subscription.remove();
  }, [sessionState.status]);

  const startSession = useCallback(async () => {
    completionSnapshotRef.current = null;
    setSessionState((current) => startFocusSession(current, Date.now()));
    void trackFirstSessionStarted();
  }, []);

  const pauseSession = useCallback(() => {
    setSessionState((current) => pauseFocusSession(current, Date.now()));
  }, []);

  const resumeSession = useCallback(() => {
    setSessionState((current) => resumeFocusSession(current, Date.now()));
  }, []);

  const resetSession = useCallback(() => {
    void cancelScheduledNotification(scheduledNotificationRef.current);
    backgroundedAtRef.current = null;
    scheduledNotificationRef.current = null;
    completionSnapshotRef.current = null;
    finalizingRef.current = false;
    setSessionState(createGuestSessionState());
  }, []);

  /**
   * Cancel the active session applying the dynamic partial-stardust rule:
   * – elapsed < max(5 min, 50% of planned duration) → 0 ✦
   * – otherwise → proportional Stardust via cancel_focus_session RPC
   */
  const cancelSession = useCallback(async () => {
    void cancelScheduledNotification(scheduledNotificationRef.current);
    backgroundedAtRef.current = null;
    scheduledNotificationRef.current = null;

    if (!token || !sessionState.startedAt || sessionState.plannedDurationMinutes === null) {
      setSessionState(createGuestSessionState());
      return;
    }

    const cancelledAt = new Date().toISOString();
    const cancelSnapshot =
      buildCompletionSnapshot(syncFocusTimer(sessionState, Date.now()), Date.now()) ?? null;
    if (!cancelSnapshot) {
      setSessionState(createGuestSessionState());
      return;
    }

    const focusedMinutes = snapshotFocusedMinutes(cancelSnapshot);
    const categoryId = cancelSnapshot.categoryId;
    const startedAt = cancelSnapshot.startedAt;
    const plannedDurationMinutes = cancelSnapshot.plannedDurationMinutes;

    setSessionState(createGuestSessionState());

    if (focusedMinutes >= 1) {
      try {
        const authSnapshot = buildAuthSnapshot();
        if (!authSnapshot) {
          return;
        }
        const { result, payload } = await api.cancelSession(
          token,
          {
            categoryId,
            startedAt,
            cancelledAt,
            plannedDurationMinutes,
            focusedMinutes,
          },
          authSnapshot,
        );
        await applyAuthPayload(payload);
        if (result.saved && result.stardustEarned > 0) {
          const todaySummary = createDailySummary(payload.sessions, payload.user);
          uiSetCelebrationRef.current?.({
            stardustEarned: result.stardustEarned,
            durationMinutes: result.minutesFocused,
            todayTotalMinutes: todaySummary.totalMinutes,
            unlockedStarId: null,
          });
        }
        void refreshAnalytics();
      } catch (error) {
        if (__DEV__) {
          console.warn("[Astrocus session cancel failed]", error);
        }
      }
    }
  }, [
    applyAuthPayload,
    buildAuthSnapshot,
    refreshAnalytics,
    sessionState,
    token,
    uiSetCelebrationRef,
  ]);

  const syncOfflineQueue = useCallback(async () => {
    if (!token || pendingSessions.length === 0) {
      return;
    }

    const authSnapshot = buildAuthSnapshot();
    if (!authSnapshot) {
      return;
    }

    const result = await api.syncSessions(token, pendingSessions, authSnapshot);
    const language = authSnapshot.user.language;

    if (result.syncedIds.length > 0) {
      await applyAuthPayload(result.payload);
      const syncedIdSet = new Set(result.syncedIds);
      setPendingSessions((current) => {
        const remaining = current.filter((session) => !syncedIdSet.has(session.id));
        void asyncStorage.set(STORAGE_KEYS.pendingSessions, remaining);
        return remaining;
      });
      void refreshAnalytics();
    }

    if (result.error) {
      if (__DEV__) {
        console.warn("[Astrocus sync offline queue failed]", result.error);
      }
      const remainingCount = pendingSessions.length - result.syncedIds.length;
      if (result.syncedIds.length > 0 && remainingCount > 0) {
        showToast({
          title: t(language, "syncPartialSuccess"),
          subtitle: t(language, "syncPartialSuccessDetail")
            .replace("{synced}", String(result.syncedIds.length))
            .replace("{pending}", String(remainingCount)),
          ...toastTone.success,
        });
      }
      throw result.error;
    }

    setIsOnline(true);
  }, [
    applyAuthPayload,
    buildAuthSnapshot,
    pendingSessions,
    refreshAnalytics,
    setIsOnline,
    showToast,
    token,
  ]);

  useEffect(() => {
    if (!token || pendingSessions.length === 0) {
      return;
    }

    const handleConnectivity = (online: boolean) => {
      if (!online) {
        setIsOnline(false);
        return;
      }
      setIsOnline(true);
      void syncOfflineQueue().catch(() => undefined);
    };

    void NetInfo.fetch().then((state) => {
      handleConnectivity(Boolean(state.isConnected) && state.isInternetReachable !== false);
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      handleConnectivity(Boolean(state.isConnected) && state.isInternetReachable !== false);
    });

    return unsubscribe;
  }, [pendingSessions.length, setIsOnline, syncOfflineQueue, token]);

  const displaySessions = useMemo(
    () => (user ? mergeSessionsWithPending(sessions, pendingSessions, user.id) : sessions),
    [pendingSessions, sessions, user],
  );

  const dailySummary = useMemo(
    () => createDailySummary(displaySessions, user, dailyGoalToday),
    [displaySessions, user, dailyGoalToday],
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      sessions: displaySessions,
      unlockedStarIds,
      earnedBadgeIds,
      pendingSessions,
      sessionState,
      stars: STARS,
      categories: CATEGORIES,
      avatars: PRESET_AVATARS,
      dailySummary,
      dailyGoalToday,
      analyticsSummary,
      refreshAnalytics,
      setSelectedDurationMinutes: (minutes: number) =>
        setSessionState((current) => {
          if (current.status !== "idle" && current.status !== "failed") {
            return current;
          }
          return {
            ...current,
            selectedDurationMinutes: minutes,
            remainingSeconds: minutes * 60,
          };
        }),
      setSelectedCategoryId: (categoryId: string) =>
        setSessionState((current) => ({
          ...current,
          selectedCategoryId: categoryId,
        })),
      startSession,
      pauseSession,
      resumeSession,
      resetSession,
      cancelSession,
      endSession: resetSession,
      syncOfflineQueue,
    }),
    [
      analyticsSummary,
      dailySummary,
      dailyGoalToday,
      cancelSession,
      pauseSession,
      pendingSessions,
      refreshAnalytics,
      resetSession,
      resumeSession,
      sessionState,
      earnedBadgeIds,
      displaySessions,
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
