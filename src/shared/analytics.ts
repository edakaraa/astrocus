import { asyncStorage } from "./storage";
import { STORAGE_KEYS } from "./constants";

type AnalyticsEvent = {
  name: string;
  createdAt: string;
  meta?: Record<string, string | number | boolean | null>;
};

export const trackEvent = async (
  name: string,
  meta?: Record<string, string | number | boolean | null>,
) => {
  const current = await asyncStorage.get<AnalyticsEvent[]>(STORAGE_KEYS.analyticsEvents, []);
  const nextEvent: AnalyticsEvent = {
    name,
    createdAt: new Date().toISOString(),
    meta,
  };

  await asyncStorage.set(STORAGE_KEYS.analyticsEvents, [...current, nextEvent]);
  console.log("analytics", nextEvent);
};
