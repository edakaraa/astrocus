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
import { useRouter, type Href } from "expo-router";
import { AppState, AppStateStatus, Platform } from "react-native";
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
import { isFocusSessionScreenLock } from "../lib/deviceScreen";
import {
  FOCUS_SESSION_FAILED_ID,
  FOCUS_SESSION_WARNING_ID,
  cancelFocusSessionCompletedNotification,
  cancelScheduledNotification,
  dismissNotification,
  ensureNotificationPermission,
  presentFocusSessionCompletedNotification,
  scheduleBackgroundWarning,
  scheduleFocusSessionCompletedNotification,
  scheduleSessionFailedNotification,
  scheduleSessionFailedNotificationDelayed,
  setupFocusSessionCompleteTapHandler,
  startFocusSessionNotification,
  stopFocusSessionNotification,
  updateFocusSessionNotification,
} from "../shared/notifications";
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
  freezeFocusTimer,
  heartbeatTick,
  isFocusTimerFrozenForAway,
  materializeFocusTimer,
  pauseFocusSession,
  resumeFocusSession,
  snapshotFocusedMinutes,
  startFocusSession,
  syncFocusTimer,
  unfreezeFocusTimer,
  type FocusTimerState,
  type SessionCompletionSnapshot,
} from "./session/sessionTimer";
import {
  bindSessionMonotonicAnchor,
  clearSessionMonotonicAnchor,
  sessionMonotonicNowMs,
} from "./session/monotonicNow";
import { persistLocalDailyGoal } from "../lib/dailyGoalStorage";
import { mergeSessionsWithPending } from "./session/offlineSessions";
import {
  OFFLINE_SESSION_SYNC_ENABLED,
  shouldQueueSessionAfterSaveFailure,
} from "./session/offlineQueue";
import { shouldResumeAwaySession } from "./session/focusBackgroundAway";
import { onFocusSessionTimerCompleted } from "./session/focusSessionNotifications";
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
  const router = useRouter();
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
  const backgroundEventTimeRef = useRef<number | null>(null);
  const scheduledNotificationRef = useRef<string | null>(null);
  const scheduledSessionCompleteRef = useRef<string | null>(null);
  const screenLockedSessionRef = useRef(false);
  const backgroundCheckTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backgroundWarningTimeoutRef = useRef<string | null>(null);
  const backgroundFailTimeoutRef = useRef<string | null>(null);
  const ongoingNotificationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completionSnapshotRef = useRef<SessionCompletionSnapshot | null>(null);
  const completionNotificationSentRef = useRef(false);
  const finalizingRef = useRef(false);
  const finalizationStartedRef = useRef(false);
  const sessionStateRef = useRef(sessionState);
  sessionStateRef.current = sessionState;
  const prevAppStateRef = useRef<AppStateStatus>(AppState.currentState);

  const notificationLanguage = user?.language ?? "tr";

  const clearOngoingNotificationInterval = useCallback(() => {
    if (ongoingNotificationIntervalRef.current) {
      clearInterval(ongoingNotificationIntervalRef.current);
      ongoingNotificationIntervalRef.current = null;
    }
  }, []);

  const clearBackgroundWarningTimeout = useCallback(() => {
    const scheduledId = backgroundWarningTimeoutRef.current;
    backgroundWarningTimeoutRef.current = null;
    void cancelScheduledNotification(scheduledId);
  }, []);

  const clearBackgroundFailTimeout = useCallback(() => {
    const scheduledId = backgroundFailTimeoutRef.current;
    backgroundFailTimeoutRef.current = null;
    void cancelScheduledNotification(scheduledId);
    void dismissNotification(FOCUS_SESSION_FAILED_ID);
  }, []);

  const clearBackgroundAwayTimeouts = useCallback(() => {
    clearBackgroundWarningTimeout();
    clearBackgroundFailTimeout();
  }, [clearBackgroundFailTimeout, clearBackgroundWarningTimeout]);

  const notifyFocusSessionCompleted = useCallback(
    async (snapshot: SessionCompletionSnapshot) => {
      if (completionNotificationSentRef.current) {
        return;
      }
      completionNotificationSentRef.current = true;
      scheduledSessionCompleteRef.current = null;

      const durationMinutes = snapshotFocusedMinutes(snapshot);
      let stardustEarned = durationMinutes * 10;
      if (token && user) {
        const authSnapshot: AuthPayload = {
          token,
          user,
          sessions,
          unlockedStarIds,
          earnedBadgeIds,
          constellationProgress,
        };
        stardustEarned = estimateSessionCelebration(authSnapshot, {
          durationMinutes,
          startedAt: snapshot.startedAt,
          completedAt: snapshot.completedAt,
          pauseCount: snapshot.pauseCount,
        }).stardustEarned;
      }

      await onFocusSessionTimerCompleted(snapshot, notificationLanguage, stardustEarned, {
        stopFocusSessionNotification,
        cancelFocusSessionCompletedNotification,
        presentFocusSessionCompletedNotification,
        clearOngoingNotificationInterval,
      });
    },
    [
      clearOngoingNotificationInterval,
      constellationProgress,
      earnedBadgeIds,
      notificationLanguage,
      sessions,
      token,
      unlockedStarIds,
      user,
    ],
  );

  const syncSessionAfterForeground = useCallback(
    (options?: { skipOngoingNotification?: boolean; unfreezeAway?: boolean }) => {
      if (options?.unfreezeAway) {
        clearBackgroundAwayTimeouts();
        void dismissNotification(FOCUS_SESSION_WARNING_ID);
        void dismissNotification(FOCUS_SESSION_FAILED_ID);
      }

      setSessionState((state) => {
        if (state.status !== "running" && state.status !== "paused") {
          return state;
        }

        const nowMs = sessionMonotonicNowMs();
        let current = state;
        if (
          options?.unfreezeAway &&
          state.status === "running" &&
          isFocusTimerFrozenForAway(state)
        ) {
          current = unfreezeFocusTimer(state, nowMs);
        }

        const synced = syncFocusTimer(current, nowMs);
        if (current.status === "running" && synced.remainingSeconds <= 0) {
          const completed = completeFocusTimer(synced, nowMs);
          const snapshot = buildCompletionSnapshot(completed, nowMs, true);
          completionSnapshotRef.current = snapshot;
          if (snapshot) {
            void notifyFocusSessionCompleted(snapshot);
          }
          return completed;
        }

        const next =
          current.status === "running"
            ? materializeFocusTimer(synced, nowMs)
            : synced;

        if (Platform.OS === "android" && !options?.skipOngoingNotification) {
          void updateFocusSessionNotification(next.remainingSeconds, notificationLanguage);
        }

        return next;
      });
    },
    [clearBackgroundAwayTimeouts, notificationLanguage, notifyFocusSessionCompleted],
  );

  const startOngoingNotificationInterval = useCallback(
    (intervalMs = 1000, forceRestart = false) => {
      if (Platform.OS !== "android") {
        return;
      }

      if (screenLockedSessionRef.current) {
        return;
      }

      if (forceRestart) {
        clearOngoingNotificationInterval();
      }

      if (ongoingNotificationIntervalRef.current) {
        return;
      }

      void (async () => {
        try {
          const { isFocusTimerServiceAvailable } = await import("astrocus-focus-timer");
          if (isFocusTimerServiceAvailable()) {
            return;
          }
        } catch {
          /* fallback interval below */
        }

        ongoingNotificationIntervalRef.current = setInterval(() => {
          const current = sessionStateRef.current;
          if (current.status !== "running" && current.status !== "paused") {
            clearOngoingNotificationInterval();
            return;
          }

          if (backgroundedAtRef.current || screenLockedSessionRef.current) {
            return;
          }

          const synced = syncFocusTimer(current, sessionMonotonicNowMs());
          if (current.status === "running" && synced.remainingSeconds <= 0) {
            clearOngoingNotificationInterval();
            void cancelFocusSessionCompletedNotification();
            scheduledSessionCompleteRef.current = null;
            const completed = completeFocusTimer(synced, sessionMonotonicNowMs());
            const snapshot = buildCompletionSnapshot(completed, sessionMonotonicNowMs(), true);
            completionSnapshotRef.current = snapshot;
            if (snapshot) {
              void notifyFocusSessionCompleted(snapshot);
            }
            setSessionState(completed);
            return;
          }

          void updateFocusSessionNotification(synced.remainingSeconds, notificationLanguage);
        }, intervalMs);
      })();
    },
    [clearOngoingNotificationInterval, notificationLanguage, notifyFocusSessionCompleted],
  );

  const enterScreenLockMode = useCallback(async () => {
    if (screenLockedSessionRef.current) {
      return;
    }

    screenLockedSessionRef.current = true;
    clearBackgroundAwayTimeouts();
    void dismissNotification(FOCUS_SESSION_WARNING_ID);

    if (backgroundedAtRef.current) {
      backgroundedAtRef.current = null;
    }

    const current = sessionStateRef.current;
    if (current.status !== "running") {
      return;
    }

    const synced = syncFocusTimer(current, sessionMonotonicNowMs());
    const plannedDurationMinutes =
      synced.plannedDurationMinutes ?? current.plannedDurationMinutes ?? current.selectedDurationMinutes;

    void cancelFocusSessionCompletedNotification();
    if (synced.remainingSeconds > 0) {
      scheduledSessionCompleteRef.current = await scheduleFocusSessionCompletedNotification(
        synced.remainingSeconds,
        plannedDurationMinutes,
        notificationLanguage,
      );
    }

    if (Platform.OS === "android") {
      clearOngoingNotificationInterval();
      await startFocusSessionNotification(synced.remainingSeconds, notificationLanguage);
    }
  }, [clearBackgroundAwayTimeouts, clearOngoingNotificationInterval, notificationLanguage]);

  const enterAppBackgroundAwayMode = useCallback(async () => {
    if (backgroundedAtRef.current || screenLockedSessionRef.current) {
      return;
    }

    const current = sessionStateRef.current;
    if (current.status !== "running") {
      return;
    }

    clearOngoingNotificationInterval();
    void stopFocusSessionNotification();

    setSessionState((state) => freezeFocusTimer(state, sessionMonotonicNowMs()));

    const backgroundedAtMs = Date.now();
    backgroundedAtRef.current = new Date(backgroundedAtMs).toISOString();

    clearBackgroundAwayTimeouts();

    backgroundWarningTimeoutRef.current = await scheduleBackgroundWarning(
      "",
      backgroundedAtMs,
      notificationLanguage,
    );
    backgroundFailTimeoutRef.current = await scheduleSessionFailedNotificationDelayed(
      BACKGROUND_TOLERANCE_SECONDS,
      backgroundedAtMs,
      notificationLanguage,
    );
  }, [clearBackgroundAwayTimeouts, clearOngoingNotificationInterval, notificationLanguage]);

  const isActiveFocusSession =
    sessionState.status === "running" || sessionState.status === "paused";

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

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    void setupFocusSessionCompleteTapHandler((route) => {
      if (screenLockedSessionRef.current) {
        screenLockedSessionRef.current = false;
        clearOngoingNotificationInterval();
        void cancelFocusSessionCompletedNotification();
        scheduledSessionCompleteRef.current = null;
        if (Platform.OS === "android") {
          void stopFocusSessionNotification();
        }
      }
      syncSessionAfterForeground({ skipOngoingNotification: true });
      if (route) {
        router.push(route as Href);
      }
    }).then((listener) => {
      subscription = listener;
    });

    return () => {
      subscription?.remove();
    };
  }, [clearOngoingNotificationInterval, router, syncSessionAfterForeground]);

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
      void cancelFocusSessionCompletedNotification();
      void stopFocusSessionNotification();
      backgroundedAtRef.current = null;
      scheduledNotificationRef.current = null;
      scheduledSessionCompleteRef.current = null;
      screenLockedSessionRef.current = false;
      if (backgroundCheckTimeoutRef.current) {
        clearTimeout(backgroundCheckTimeoutRef.current);
        backgroundCheckTimeoutRef.current = null;
      }
      clearBackgroundAwayTimeouts();
      clearOngoingNotificationInterval();
      clearSessionMonotonicAnchor();
    }
  }, [clearBackgroundAwayTimeouts, clearOngoingNotificationInterval, isReady, token]);

  useEffect(() => {
    if (Platform.OS !== "android") {
      return;
    }

    if (!isActiveFocusSession) {
      void stopFocusSessionNotification();
      return;
    }

    const synced = syncFocusTimer(sessionStateRef.current, sessionMonotonicNowMs());
    void startFocusSessionNotification(synced.remainingSeconds, notificationLanguage);
    if (sessionStateRef.current.status === "running") {
      startOngoingNotificationInterval();
    }

    return () => {
      clearOngoingNotificationInterval();
      void stopFocusSessionNotification();
    };
  }, [
    clearOngoingNotificationInterval,
    isActiveFocusSession,
    notificationLanguage,
    sessionState.status,
    startOngoingNotificationInterval,
  ]);

  useEffect(() => {
    if (sessionState.status !== "running") {
      return;
    }

    const intervalId = setInterval(() => {
      setSessionState((current) => {
        if (current.status !== "running") {
          return current;
        }

        const nowMs = sessionMonotonicNowMs();
        const next = heartbeatTick(current, nowMs);
        if (next.status === "completed" && current.status === "running") {
          const snapshot = buildCompletionSnapshot(next, nowMs, true);
          completionSnapshotRef.current = snapshot;
          if (snapshot) {
            void notifyFocusSessionCompleted(snapshot);
          }
        } else if (
          next.status === "running" &&
          Platform.OS === "android" &&
          !backgroundedAtRef.current &&
          !screenLockedSessionRef.current
        ) {
          void updateFocusSessionNotification(next.remainingSeconds, notificationLanguage);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [notificationLanguage, notifyFocusSessionCompleted, sessionState.status]);

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
        setPendingSessions([]);
        void asyncStorage.set(STORAGE_KEYS.pendingSessions, []);
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
        clearSessionMonotonicAnchor();
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

    if (finalizationStartedRef.current) {
      return;
    }
    finalizationStartedRef.current = true;

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

    if (!completionNotificationSentRef.current) {
      void notifyFocusSessionCompleted(snapshot);
    }

    void finalizeSession(snapshot);
  }, [finalizeSession, notifyFocusSessionCompleted, sessionState.status]);

  useEffect(() => {
    if (sessionState.status === "idle") {
      finalizationStartedRef.current = false;
    }
  }, [sessionState.status]);

  useEffect(() => {
    const resolveLockOrAway = async (): Promise<"lock" | "away" | "abort"> => {
      for (let attempt = 0; attempt < 6; attempt += 1) {
        if (attempt > 0) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        if (AppState.currentState === "active") {
          return "abort";
        }
        if (sessionStateRef.current.status !== "running") {
          return "abort";
        }
        try {
          const isScreenLock = await isFocusSessionScreenLock();
          if (isScreenLock) {
            return "lock";
          }
        } catch {
          // retry
        }
      }
      return "away";
    };

    const scheduleLockOrAwayCheck = () => {
      if (backgroundCheckTimeoutRef.current) {
        clearTimeout(backgroundCheckTimeoutRef.current);
      }

      backgroundCheckTimeoutRef.current = setTimeout(() => {
        backgroundCheckTimeoutRef.current = null;
        void (async () => {
          const outcome = await resolveLockOrAway();
          if (outcome === "abort") {
            return;
          }
          if (outcome === "lock") {
            await enterScreenLockMode();
            return;
          }
          await enterAppBackgroundAwayMode();
        })();
      }, 150);
    };

    const handleAppState = (nextState: AppStateStatus) => {
      const prevState = prevAppStateRef.current;
      prevAppStateRef.current = nextState;

      const current = sessionStateRef.current;
      const isActiveSession = current.status === "running" || current.status === "paused";
      if (!isActiveSession) {
        return;
      }

      const leftForeground = prevState === "active" && nextState !== "active";
      const returnedToForeground = prevState !== "active" && nextState === "active";

      const shouldScheduleLockOrAway =
        current.status === "running" &&
        leftForeground &&
        (Platform.OS === "android"
          ? nextState === "background"
          : nextState === "inactive" || nextState === "background");

      if (shouldScheduleLockOrAway) {
        backgroundEventTimeRef.current = Date.now();
        void (async () => {
          const isScreenLock = await isFocusSessionScreenLock();
          if (isScreenLock) {
            await enterScreenLockMode();
            return;
          }
          await enterAppBackgroundAwayMode();
        })();
      }

      if (
        Platform.OS === "android" &&
        current.status === "paused" &&
        (nextState === "inactive" || nextState === "background")
      ) {
        const synced = syncFocusTimer(current, sessionMonotonicNowMs());
        void updateFocusSessionNotification(synced.remainingSeconds, notificationLanguage);
        return;
      }

      if (!returnedToForeground) {
        return;
      }

      if (backgroundCheckTimeoutRef.current) {
        clearTimeout(backgroundCheckTimeoutRef.current);
        backgroundCheckTimeoutRef.current = null;
      }

      clearBackgroundAwayTimeouts();
      void dismissNotification(FOCUS_SESSION_WARNING_ID);
      void dismissNotification(FOCUS_SESSION_FAILED_ID);

      if (screenLockedSessionRef.current) {
        screenLockedSessionRef.current = false;
        clearOngoingNotificationInterval();
        void cancelFocusSessionCompletedNotification();
        scheduledSessionCompleteRef.current = null;
        if (Platform.OS === "android") {
          void stopFocusSessionNotification();
        }
        syncSessionAfterForeground({ skipOngoingNotification: true });
        if (Platform.OS === "android" && sessionStateRef.current.status === "running") {
          startOngoingNotificationInterval();
        }
        return;
      }

      const wasAway = Boolean(backgroundedAtRef.current);

      if (!wasAway) {
        syncSessionAfterForeground();
        if (Platform.OS === "android" && sessionStateRef.current.status === "running") {
          startOngoingNotificationInterval();
        }
        return;
      }

      void (async () => {
        clearBackgroundAwayTimeouts();
        void dismissNotification(FOCUS_SESSION_WARNING_ID);
        void dismissNotification(FOCUS_SESSION_FAILED_ID);

        const elapsed = Math.floor(
          (Date.now() - new Date(backgroundedAtRef.current!).getTime()) / 1000,
        );
        backgroundedAtRef.current = null;

        if (!shouldResumeAwaySession(elapsed)) {
          void dismissNotification(FOCUS_SESSION_WARNING_ID);
          clearSessionMonotonicAnchor();
          setSessionState((state) => failFocusSession(state));
          void stopFocusSessionNotification();
          void scheduleSessionFailedNotification(notificationLanguage);
          return;
        }

        syncSessionAfterForeground({ unfreezeAway: true });
        if (Platform.OS === "android") {
          startOngoingNotificationInterval();
        }
      })();
    };

    const subscription = AppState.addEventListener("change", handleAppState);
    return () => {
      subscription.remove();
      if (backgroundCheckTimeoutRef.current) {
        clearTimeout(backgroundCheckTimeoutRef.current);
        backgroundCheckTimeoutRef.current = null;
      }
      clearBackgroundAwayTimeouts();
      clearOngoingNotificationInterval();
    };
  }, [
    clearBackgroundAwayTimeouts,
    clearOngoingNotificationInterval,
    enterAppBackgroundAwayMode,
    enterScreenLockMode,
    notificationLanguage,
    startOngoingNotificationInterval,
    syncSessionAfterForeground,
  ]);

  const startSession = useCallback(async () => {
    await ensureNotificationPermission();

    completionSnapshotRef.current = null;
    completionNotificationSentRef.current = false;
    const wallNow = Date.now();
    bindSessionMonotonicAnchor(wallNow);
    setSessionState((current) => startFocusSession(current, wallNow));
    void trackFirstSessionStarted();
  }, []);

  const pauseSession = useCallback(() => {
    setSessionState((current) => pauseFocusSession(current, sessionMonotonicNowMs()));
  }, []);

  const resumeSession = useCallback(() => {
    setSessionState((current) => resumeFocusSession(current, sessionMonotonicNowMs()));
  }, []);

  const resetSession = useCallback(() => {
    void cancelScheduledNotification(scheduledNotificationRef.current);
    void cancelFocusSessionCompletedNotification();
    void stopFocusSessionNotification();
    backgroundedAtRef.current = null;
    scheduledNotificationRef.current = null;
    scheduledSessionCompleteRef.current = null;
    screenLockedSessionRef.current = false;
    if (backgroundCheckTimeoutRef.current) {
      clearTimeout(backgroundCheckTimeoutRef.current);
      backgroundCheckTimeoutRef.current = null;
    }
    clearBackgroundAwayTimeouts();
    clearOngoingNotificationInterval();
    completionSnapshotRef.current = null;
    completionNotificationSentRef.current = false;
    finalizingRef.current = false;
    clearSessionMonotonicAnchor();
    setSessionState(createGuestSessionState());
  }, [clearBackgroundAwayTimeouts, clearOngoingNotificationInterval]);

  /**
   * Cancel the active session applying the dynamic partial-stardust rule:
   * – elapsed < max(5 min, 50% of planned duration) → 0 ✦
   * – otherwise → proportional Stardust via cancel_focus_session RPC
   */
  const cancelSession = useCallback(async () => {
    void cancelScheduledNotification(scheduledNotificationRef.current);
    void cancelFocusSessionCompletedNotification();
    void stopFocusSessionNotification();
    backgroundedAtRef.current = null;
    scheduledNotificationRef.current = null;
    scheduledSessionCompleteRef.current = null;
    screenLockedSessionRef.current = false;
    if (backgroundCheckTimeoutRef.current) {
      clearTimeout(backgroundCheckTimeoutRef.current);
      backgroundCheckTimeoutRef.current = null;
    }
    clearBackgroundAwayTimeouts();
    clearOngoingNotificationInterval();

    if (!token || !sessionState.startedAt || sessionState.plannedDurationMinutes === null) {
      setSessionState(createGuestSessionState());
      return;
    }

    const cancelledAt = new Date().toISOString();
    const cancelSnapshot =
      buildCompletionSnapshot(
        syncFocusTimer(sessionState, sessionMonotonicNowMs()),
        sessionMonotonicNowMs(),
      ) ?? null;
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
    clearBackgroundAwayTimeouts,
    clearOngoingNotificationInterval,
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
    if (!OFFLINE_SESSION_SYNC_ENABLED || !token || pendingSessions.length === 0) {
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

  const displaySessions = useMemo(() => {
    if (!OFFLINE_SESSION_SYNC_ENABLED || !user) {
      return sessions;
    }
    return mergeSessionsWithPending(sessions, pendingSessions, user.id);
  }, [pendingSessions, sessions, user]);

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
