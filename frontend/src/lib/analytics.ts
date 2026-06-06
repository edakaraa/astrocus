import PostHog from "posthog-react-native";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { asyncStorage } from "../shared/storage";

const POSTHOG_KEY =
  process.env.EXPO_PUBLIC_POSTHOG_KEY?.trim() ||
  process.env.EXPO_PUBLIC_POSTHOG_API_KEY?.trim();
const POSTHOG_HOST =
  process.env.EXPO_PUBLIC_POSTHOG_HOST?.trim() || "https://us.i.posthog.com";

export const posthog = POSTHOG_KEY
  ? new PostHog(POSTHOG_KEY, {
      host: POSTHOG_HOST,
      captureAppLifecycleEvents: !__DEV__,
    })
  : null;

export const isPostHogEnabled = (): boolean => posthog !== null;

const capture = (
  event: string,
  properties?: Record<string, string | number | boolean>,
): void => {
  if (__DEV__) {
    console.log("[analytics]", event, properties);
  }
  posthog?.capture(event, properties);
};

export const identifyAnalyticsUser = (
  userId: string,
  properties?: Record<string, string>,
): void => {
  posthog?.identify(userId, properties);
};

export const resetAnalyticsUser = (): void => {
  posthog?.reset();
};

export type OnboardingMethod = "email" | "google";

export const trackOnboardingCompleted = (method: OnboardingMethod): void => {
  capture("onboarding_completed", { method });
};

export const trackFirstSessionStarted = async (): Promise<void> => {
  const alreadyTracked = await asyncStorage.get(STORAGE_KEYS.firstSessionTracked, false);
  if (alreadyTracked) {
    return;
  }
  capture("first_session_started");
  await asyncStorage.set(STORAGE_KEYS.firstSessionTracked, true);
};

export const trackSessionCompleted = (
  duration_seconds: number,
  focus_score: number,
): void => {
  capture("session_completed", { duration_seconds, focus_score });
};

export const trackStarUnlocked = (star_id: string, total_stars: number): void => {
  capture("star_unlocked", { star_id, total_stars });
};

export const trackWeeklyReportViewed = (): void => {
  capture("weekly_report_viewed");
};

export const trackGoalCompleted = (goal_type: string): void => {
  capture("goal_completed", { goal_type });
};

export const trackStreakIncreased = (new_streak: number): void => {
  capture("streak_increased", { new_streak });
};

export const trackScreen = (routeName: string): void => {
  if (__DEV__) {
    console.log("[analytics] screen", routeName);
  }
  posthog?.screen(routeName);
};
