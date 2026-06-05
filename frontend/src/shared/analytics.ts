import { asyncStorage } from "./storage";
import { STORAGE_KEYS } from "./constants";

type AnalyticsEvent = {
  name: string;
  createdAt: string;
  meta?: Record<string, string | number | boolean | null>;
};

let distinctId: string | null = null;

/** Call after auth bootstrap so PostHog events attach to the user. */
export const setAnalyticsUserId = (userId: string | null): void => {
  distinctId = userId;
};

const posthogCapture = async (name: string, meta?: AnalyticsEvent["meta"]): Promise<void> => {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY?.trim();
  if (!apiKey || !distinctId) {
    return;
  }

  const host = process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

  try {
    await fetch(`${host}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        event: name,
        distinct_id: distinctId,
        properties: {
          ...meta,
          $lib: "astrocus-rn",
        },
      }),
    });
  } catch {
    // Non-blocking — local queue remains source of truth offline
  }
};

export const trackEvent = async (
  name: string,
  meta?: Record<string, string | number | boolean | null>,
): Promise<void> => {
  const nextEvent: AnalyticsEvent = {
    name,
    createdAt: new Date().toISOString(),
    meta,
  };

  const current = await asyncStorage.get<AnalyticsEvent[]>(STORAGE_KEYS.analyticsEvents, []);
  await asyncStorage.set(STORAGE_KEYS.analyticsEvents, [...current, nextEvent]);

  if (__DEV__) {
    console.log("analytics", nextEvent);
  }

  void posthogCapture(name, meta);
};
