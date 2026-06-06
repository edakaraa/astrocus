import React, { useMemo, useRef } from "react";
import { AuthProvider, useAuth, type AstrocusInfraRefs } from "./AuthContext";
import { SessionProvider, useSession } from "./SessionContext";
import { UIProvider, useUI } from "./UIContext";
import { NotificationProvider, useAppNotifier } from "./NotificationContext";
import { AuthPayload, CelebrationPayload, Language, PendingSession } from "../shared/types";

export { AuthProvider, useAuth, type AstrocusInfraRefs } from "./AuthContext";
export { SessionProvider, useSession } from "./SessionContext";
export { UIProvider, useUI } from "./UIContext";
export {
  NotificationProvider,
  useAppNotifier,
  toastTone,
  type AppAlertOptions,
  type AppConfirmOptions,
  type AppToastOptions,
  type ToastIcon,
} from "./NotificationContext";

export const useAstrocusInfrastructureRefs = (): AstrocusInfraRefs => {
  const sessionHydrateRef = useRef<((payload: AuthPayload) => void) | null>(null);
  const sessionSetPendingRef = useRef<((sessions: PendingSession[]) => void) | null>(null);
  const uiSetLanguageRef = useRef<((language: Language) => void) | null>(null);
  const uiSetCelebrationRef = useRef<((state: CelebrationPayload) => void) | null>(null);

  return useMemo(
    () => ({
      sessionHydrateRef,
      sessionSetPendingRef,
      uiSetLanguageRef,
      uiSetCelebrationRef,
    }),
    [],
  );
};

export const useAppContext = () => {
  const auth = useAuth();
  const session = useSession();
  const ui = useUI();
  const notifier = useAppNotifier();

  return {
    // Auth
    isReady: auth.isReady,
    isOnline: auth.isOnline,
    apiUrl: auth.apiUrl,
    token: auth.token,
    user: auth.user,
    constellationProgress: auth.constellationProgress,
    isAuthenticated: auth.isAuthenticated,
    authMode: auth.authMode,
    setAuthMode: auth.setAuthMode,
    setIsOnline: auth.setIsOnline,
    applyAuthPayload: auth.applyAuthPayload,
    register: auth.register,
    login: auth.login,
    continueWithGoogle: auth.continueWithGoogle,
    continueWithApple: auth.continueWithApple,
    resetPassword: auth.resetPassword,
    completeOnboarding: auth.completeOnboarding,
    updateProfile: auth.updateProfile,
    unlockStar: auth.unlockStar,
    logout: auth.logout,
    refreshUser: auth.refreshUser,
    deleteAccount: auth.deleteAccount,

    // Session
    sessions: session.sessions,
    unlockedStarIds: session.unlockedStarIds,
    earnedBadgeIds: session.earnedBadgeIds,
    pendingSessions: session.pendingSessions,
    sessionState: session.sessionState,
    stars: session.stars,
    categories: session.categories,
    avatars: session.avatars,
    dailySummary: session.dailySummary,
    dailyGoalToday: session.dailyGoalToday,
    analyticsSummary: session.analyticsSummary,
    refreshAnalytics: session.refreshAnalytics,
    setSelectedDurationMinutes: session.setSelectedDurationMinutes,
    setSelectedCategoryId: session.setSelectedCategoryId,
    startSession: session.startSession,
    pauseSession: session.pauseSession,
    resumeSession: session.resumeSession,
    resetSession: session.resetSession,
    cancelSession: session.cancelSession,
    endSession: session.endSession,
    syncOfflineSessions: session.syncOfflineQueue,

    // UI
    language: ui.language,
    celebration: ui.celebration,
    setLanguage: ui.setLanguage,
    dismissCelebration: ui.dismissCelebration,

    // Notifications
    showAlert: notifier.showAlert,
    showConfirm: notifier.showConfirm,
    showToast: notifier.showToast,
    dismissToast: notifier.dismissToast,
  };
};
