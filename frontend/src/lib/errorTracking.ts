/**
 * Sentry crash & error reporting — active when EXPO_PUBLIC_SENTRY_DSN is set.
 * Full native capture requires EAS/production build (not Expo Go).
 */
import type { ComponentType } from "react";
import * as Sentry from "@sentry/react-native";
import { supabase } from "./supabase";

let sentryReady = false;
let authBindingActive = false;

export const initSentry = (): void => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn || sentryReady) {
    return;
  }

  Sentry.init({
    dsn,
    environment: __DEV__ ? "development" : "production",
    tracesSampleRate: 0.2,
    enableNativeFramesTracking: true,
    enableAutoSessionTracking: true,
    sendDefaultPii: false,
  });
  sentryReady = true;
};

export const wrapRootWithSentry = <P extends Record<string, unknown>>(
  RootComponent: ComponentType<P>,
): ComponentType<P> => Sentry.wrap(RootComponent);

export const captureError = (error: Error, context?: Record<string, unknown>): void => {
  if (!sentryReady) {
    if (__DEV__) {
      console.warn("[Astrocus] captureError (no Sentry):", error, context);
    }
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      scope.setExtras(context);
      Sentry.captureException(error);
    });
    return;
  }

  Sentry.captureException(error);
};

export const captureMessage = (
  message: string,
  level: "info" | "warning" | "error",
): void => {
  if (!sentryReady) {
    if (__DEV__) {
      console.warn("[Astrocus] captureMessage (no Sentry):", level, message);
    }
    return;
  }

  Sentry.captureMessage(message, level);
};

export const setUserContext = (userId: string, email?: string): void => {
  if (!sentryReady) {
    return;
  }

  Sentry.setUser({ id: userId, email });
};

export const clearUserContext = (): void => {
  if (!sentryReady) {
    return;
  }

  Sentry.setUser(null);
};

/** Sync Sentry user scope with Supabase auth session (login, logout, token refresh). */
export const bindSentryToSupabaseAuth = (): void => {
  if (authBindingActive) {
    return;
  }
  authBindingActive = true;

  supabase.auth.onAuthStateChange((_event, session) => {
    const user = session?.user;
    if (user) {
      setUserContext(user.id, user.email ?? undefined);
      return;
    }
    clearUserContext();
  });
};
