// [GÖREV 3] — Üç context barrel + useAppContext birleşimi + ref köprüsü hook’u

import React, { PropsWithChildren, useMemo, useRef } from "react";
import { AuthProvider, useAuth, type AstrocusInfraRefs } from "./AuthContext";
import { SessionProvider, useSession } from "./SessionContext";
import { UIProvider, useUI } from "./UIContext";
import { AuthPayload, CelebrationPayload, Language, PendingSession } from "../shared/types";

export { AuthProvider, useAuth, type AstrocusInfraRefs } from "./AuthContext";
export { SessionProvider, useSession } from "./SessionContext";
export { UIProvider, useUI } from "./UIContext";

export const useAstrocusInfrastructureRefs = (): AstrocusInfraRefs => {
  const sessionHydrateRef = useRef<((payload: AuthPayload) => void) | null>(null);
  const sessionSetPendingRef = useRef<((sessions: PendingSession[]) => void) | null>(null);
  const uiSetLanguageRef = useRef<((language: Language) => void) | null>(null);
  const uiSetCelebrationRef = useRef<
    ((state: CelebrationPayload) => void) | null
  >(null);

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

export const AppProvider = ({ children }: PropsWithChildren) => {
  const refs = useAstrocusInfrastructureRefs();
  return (
    <AuthProvider {...refs}>
      <SessionProvider {...refs}>
        <UIProvider {...refs}>{children}</UIProvider>
      </SessionProvider>
    </AuthProvider>
  );
};

export const useAppContext = () => {
  const auth = useAuth();
  const session = useSession();
  const ui = useUI();

  return {
    isReady: auth.isReady,
    isOnline: auth.isOnline,
    apiUrl: auth.apiUrl,
    token: auth.token,
    user: auth.user,
    sessions: session.sessions,
    unlockedStarIds: session.unlockedStarIds,
    pendingSessions: session.pendingSessions,
    language: ui.language,
    authMode: auth.authMode,
    celebration: ui.celebration,
    sessionState: session.sessionState,
    stars: session.stars,
    categories: session.categories,
    avatars: session.avatars,
    dailySummary: session.dailySummary,
    analyticsSummary: session.analyticsSummary,
    refreshAnalytics: session.refreshAnalytics,
    setAuthMode: auth.setAuthMode,
    setLanguage: ui.setLanguage,
    setSelectedDurationMinutes: session.setSelectedDurationMinutes,
    setSelectedCategoryId: session.setSelectedCategoryId,
    register: auth.register,
    login: auth.login,
    continueWithProvider: auth.continueWithProvider,
    completeOnboarding: auth.completeOnboarding,
    updateProfile: auth.updateProfile,
    startSession: session.startSession,
    pauseSession: session.pauseSession,
    resumeSession: session.resumeSession,
    resetSession: session.resetSession,
    dismissCelebration: ui.dismissCelebration,
    syncOfflineSessions: session.syncOfflineQueue,
    signOut: auth.logout,
    deleteAccount: auth.deleteAccount,
  };
};
