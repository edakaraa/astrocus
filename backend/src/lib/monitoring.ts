import * as Sentry from "@sentry/node";
import { expressIntegration, setupExpressErrorHandler } from "@sentry/node";
import type { Express } from "express";

let monitoringReady = false;

export const initMonitoring = (): void => {
  const dsn = process.env.SENTRY_DSN?.trim();
  if (!dsn || monitoringReady) {
    return;
  }

  const appEnv = process.env.APP_ENV?.trim();
  const nodeEnv = process.env.NODE_ENV?.trim();
  const environment =
    appEnv === "production" || nodeEnv === "production"
      ? "production"
      : appEnv || nodeEnv || "development";

  Sentry.init({
    dsn,
    environment,
    enabled: environment === "production",
    tracesSampleRate: 0.1,
    integrations: [expressIntegration()],
  });

  monitoringReady = true;
};

export const attachExpressErrorHandler = (app: Express): void => {
  if (!monitoringReady) {
    return;
  }
  setupExpressErrorHandler(app);
};

export const captureException = (
  error: unknown,
  context?: Record<string, string>,
): void => {
  if (!monitoringReady) {
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
