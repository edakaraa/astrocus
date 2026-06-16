/**
 * Sentry crash & error reporting — active when EXPO_PUBLIC_SENTRY_DSN is set.
 * Full native capture requires EAS/production build (not Expo Go).
 */
import type { ComponentType } from "react";
import { ErrorUtils, Platform } from "react-native";
import * as Sentry from "@sentry/react-native";
import { supabase } from "./supabase";

let sentryReady = false;
let authBindingActive = false;
let globalHandlersBound = false;

const serializeUnknown = (value: unknown): string => {
  if (value instanceof Error) {
    return `${value.name}: ${value.message}\n${value.stack ?? ""}`;
  }
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

export const addBreadcrumb = (
  message: string,
  data?: Record<string, unknown>,
  category = "app",
): void => {
  if (__DEV__) {
    console.log(`[Astrocus breadcrumb:${category}]`, message, data ?? "");
  }

  if (!sentryReady) {
    return;
  }

  Sentry.addBreadcrumb({
    category,
    message,
    data,
    level: "info",
  });
};

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

/**
 * Capture JS fatals and unhandled promise rejections with full message + stack.
 * Call once after initSentry().
 */
export const initGlobalErrorHandlers = (): void => {
  if (globalHandlersBound) {
    return;
  }
  globalHandlersBound = true;

  const defaultHandler = ErrorUtils.getGlobalHandler?.();

  ErrorUtils.setGlobalHandler((error: unknown, isFatal?: boolean) => {
    const err = error instanceof Error ? error : new Error(serializeUnknown(error));

    captureError(err, {
      source: "ErrorUtils.globalHandler",
      isFatal: Boolean(isFatal),
      platform: Platform.OS,
      message: err.message,
      stack: err.stack,
      name: err.name,
    });

    if (__DEV__) {
      console.error("[Astrocus] Uncaught JS error:", err, { isFatal });
    }

    defaultHandler?.(error, isFatal);
  });

  try {
    // RN promise rejection tracker (Metro / Hermes).
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rejectionTracking = require("promise/setimmediate/rejection-tracking") as {
      enable: (options: {
        allRejections: boolean;
        onUnhandled: (id: number, error: unknown) => void;
        onHandled: (id: number) => void;
      }) => void;
    };

    rejectionTracking.enable({
      allRejections: true,
      onUnhandled: (id, rejection) => {
        const err =
          rejection instanceof Error
            ? rejection
            : new Error(`Unhandled promise rejection: ${serializeUnknown(rejection)}`);

        captureError(err, {
          source: "promise.unhandledRejection",
          rejectionId: id,
          platform: Platform.OS,
          message: err.message,
          stack: err.stack,
          name: err.name,
        });

        if (__DEV__) {
          console.error("[Astrocus] Unhandled promise rejection:", err, { id });
        }
      },
      onHandled: () => {
        /* no-op */
      },
    });
  } catch {
    if (__DEV__) {
      console.warn("[Astrocus] Promise rejection tracking unavailable");
    }
  }
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
