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
import { AppState, AppStateStatus, Alert } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import {
  PRESET_AVATARS,
  BACKGROUND_TOLERANCE_SECONDS,
  CATEGORIES,
  DEFAULT_DURATION_MINUTES,
  STORAGE_KEYS,
  STARS,
} from "../shared/constants";
import { api, formatSessionSaveError, isSchemaSessionError, isTransientNetworkError } from "../shared/api";
import { fetchAnalyticsSummary } from "../services/analyticsApi";
import { fetchGalacticAdvice } from "../services/galacticAdvice";
import { asyncStorage } from "../shared/storage";
import { t } from "../shared/i18n";
import { trackEvent } from "../shared/analytics";
import { cancelScheduledNotification, scheduleBackgroundWarning } from "../shared/notifications";
import { AnalyticsSummary, AuthPayload, PendingSession, SessionRecord } from "../shared/types";
import { useAuth } from "./AuthContext";
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
  analyticsSummary: AnalyticsSummary | null;
  refreshAnalytics: () => Promise<void>;
  setSelectedDurationMinutes: (minutes: number) => void;
  setSelectedCategoryId: (categoryId: string) => void;
  startSession: () => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  resetSession: () => void;
  /** Cancel an in-progress session. Applies the 10-min rule for stardust. */
  cancelSession: () => Promise<void>;
  endSession: () => void;
  syncOfflineQueue: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

const createGuestSessionState = (): SessionState => createIdleFocusTimerState();

type SessionProviderProps = PropsWithChildren<
  Pick<
    AstrocusInfraRefs,
    "sessionHydrateRef" | "sessionSetPendingRef" | "uiSetCelebrationRef" | "uiPatchCelebrationRef"
  >
>;

export const SessionProvider = ({
  children,
  sessionHydrateRef,
  sessionSetPendingRef,
  uiSetCelebrationRef,
  uiPatchCelebrationRef,
}: SessionProviderProps) => {
  const { token, user, isReady, applyAuthPayload, setIsOnline, apiUrl, constellationProgress } = useAuth();
  const prevTokenRef = useRef<string | null>(null);
  const sessionBootstrapPrimedRef = useRef(false);

  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [unlockedStarIds, setUnlockedStarIds] = useState<string[]>([STARS[0].id]);
  const [earnedBadgeIds, setEarnedBadgeIds] = useState<string[]>([]);
  const [pendingSessions, setPendingSessions] = useState<PendingSession[]>([]);
  const [sessionState, setSessionState] = useState<SessionState>(createGuestSessionState());
  const [analyticsSummary, setAnalyticsSummary] = useState<AnalyticsSummary | null>(null);
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

        const next = heartbeatTick(current, Date.now());
        if (next.status === "completed" && current.status === "running") {
          completionSnapshotRef.current = buildCompletionSnapshot(next) ?? null;
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

      const completedAt = new Date().toISOString();
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
        if (!isDevDemoToken(token)) {
          void fetchGalacticAdvice(token, {
            language: user.language,
            durationMinutes: response.durationMinutes,
            categoryId: sessionInput.categoryId,
            currentStreak: response.payload.user.currentStreak,
            todayTotalMinutes: response.todayTotalMinutes,
            totalStardust: response.payload.user.totalStardust,
          })
            .then((galacticAdvice) => {
              uiPatchCelebrationRef.current?.({ galacticAdvice });
            })
            .catch(() => undefined);
        }
        await trackEvent("session_completed", {
          stardust: response.stardustEarned,
        });
      } catch (error) {
        if (__DEV__) {
          console.warn("[Astrocus session complete failed]", error);
        }

        const message = formatSessionSaveError(error);
        const language = user.language;

        if (isSchemaSessionError(error) || !isTransientNetworkError(error)) {
          Alert.alert(t(language, "sessionSaveFailedTitle"), message);
          return;
        }

        setIsOnline(false);
        const pendingSession: PendingSession = {
          id: `${Date.now()}`,
          categoryId: sessionInput.categoryId,
          durationMinutes: sessionInput.durationMinutes,
          startedAt: sessionInput.startedAt,
          completedAt,
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
      uiPatchCelebrationRef,
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
      completionSnapshotRef.current ?? buildCompletionSnapshot(sessionState, Date.now());
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
          await trackEvent("session_abandoned", { reason: "background_timeout" });
          return;
        }

        setSessionState((current) => {
          if (current.status !== "running") {
            return current;
          }

          const synced = syncFocusTimer(current, Date.now());
          if (synced.remainingSeconds <= 0) {
            const completed = completeFocusTimer(synced);
            completionSnapshotRef.current = buildCompletionSnapshot(completed) ?? null;
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
    setSessionState((current) => startFocusSession(current, Date.now()));
    await trackEvent("session_started", {
      duration: sessionState.selectedDurationMinutes,
      categoryId: sessionState.selectedCategoryId,
    });
  }, [sessionState.selectedCategoryId, sessionState.selectedDurationMinutes]);

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

    try {
      const payload = await api.syncSessions(token, pendingSessions, authSnapshot);
      await applyAuthPayload(payload);
      setPendingSessions([]);
      await asyncStorage.set(STORAGE_KEYS.pendingSessions, []);
      setIsOnline(true);
      void refreshAnalytics();
    } catch (error) {
      if (__DEV__) {
        console.warn("[Astrocus sync offline queue failed]", error);
      }
      if (isSchemaSessionError(error)) {
        Alert.alert(
          t(authSnapshot.user.language, "sessionSaveFailedTitle"),
          formatSessionSaveError(error),
        );
      }
    }
  }, [applyAuthPayload, buildAuthSnapshot, pendingSessions, refreshAnalytics, setIsOnline, token]);

  useEffect(() => {
    if (!token || pendingSessions.length === 0) {
      return;
    }

    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected) && state.isInternetReachable !== false;
      if (!online) {
        setIsOnline(false);
        return;
      }
      setIsOnline(true);
      void syncOfflineQueue();
    });

    return unsubscribe;
  }, [pendingSessions.length, setIsOnline, syncOfflineQueue, token]);

  const dailySummary = useMemo(() => createDailySummary(sessions, user), [sessions, user]);

  const value = useMemo<SessionContextValue>(
    () => ({
      sessions,
      unlockedStarIds,
      earnedBadgeIds,
      pendingSessions,
      sessionState,
      stars: STARS,
      categories: CATEGORIES,
      avatars: PRESET_AVATARS,
      dailySummary,
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
      cancelSession,
      pauseSession,
      pendingSessions,
      refreshAnalytics,
      resetSession,
      resumeSession,
      sessionState,
      earnedBadgeIds,
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
