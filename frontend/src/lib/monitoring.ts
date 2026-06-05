/**
 * Optional crash reporting — active when EXPO_PUBLIC_SENTRY_DSN is set.
 * Install: npx expo install @sentry/react-native
 * Full native capture requires EAS/production build (not Expo Go).
 */

type SentryScope = {
  setTag: (key: string, value: string) => void;
};

type SentryModule = {
  init: (options: Record<string, unknown>) => void;
  captureException: (error: unknown) => void;
  withScope: (callback: (scope: SentryScope) => void) => void;
};

let sentry: SentryModule | null = null;
let sentryReady = false;

const loadSentry = (): SentryModule | null => {
  if (sentry) {
    return sentry;
  }
  try {
    // Optional peer — not required for dev/typecheck when package absent
    sentry = require("@sentry/react-native") as SentryModule;
    return sentry;
  } catch {
    return null;
  }
};

export const initMonitoring = (): void => {
  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim();
  if (!dsn || sentryReady) {
    return;
  }

  const Sentry = loadSentry();
  if (!Sentry) {
    if (__DEV__) {
      console.warn("[Astrocus] Sentry not installed — run: npx expo install @sentry/react-native");
    }
    return;
  }

  Sentry.init({
    dsn,
    enabled: !__DEV__,
    tracesSampleRate: 0.1,
    enableAutoSessionTracking: true,
  });
  sentryReady = true;
};

export const captureException = (error: unknown, context?: Record<string, string>): void => {
  if (!sentryReady) {
    if (__DEV__) {
      console.warn("[Astrocus] captureException (no Sentry):", error, context);
    }
    return;
  }

  const Sentry = loadSentry();
  if (!Sentry) {
    return;
  }

  if (context) {
    Sentry.withScope((scope) => {
      Object.entries(context).forEach(([key, value]) => scope.setTag(key, value));
      Sentry.captureException(error);
    });
    return;
  }

  Sentry.captureException(error);
};
