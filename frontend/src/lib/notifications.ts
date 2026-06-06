import Constants, { ExecutionEnvironment } from "expo-constants";
import type { Router } from "expo-router";
import { Platform } from "react-native";
import { supabase } from "./supabase";

export const UNIVERSE_MESSAGE_ROUTE = "/universe-message" as const;

type NotificationResponseSubscription = {
  remove: () => void;
};

const isExpoGo = (): boolean =>
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

const shouldSkipPushRegistration = (): boolean => {
  if (__DEV__ && isExpoGo()) {
    return true;
  }
  if (Platform.OS !== "ios" && Platform.OS !== "android") {
    return true;
  }
  return false;
};

const resolveEasProjectId = (): string | null => {
  const projectId = (Constants.expoConfig?.extra?.eas as { projectId?: string } | undefined)?.projectId;
  return typeof projectId === "string" && projectId.length > 0 ? projectId : null;
};

/**
 * Requests push permission, registers the Expo push token, and persists it on the user's profile.
 * No-ops in Expo Go / unsupported platforms so auth flows are never blocked.
 */
export const requestPushPermissionAndSaveToken = async (): Promise<void> => {
  if (shouldSkipPushRegistration()) {
    return;
  }

  const projectId = resolveEasProjectId();
  if (!projectId) {
    return;
  }

  try {
    const Notifications = await import("expo-notifications");

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    const pushToken = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    if (!pushToken) {
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) {
      return;
    }

    const { error } = await supabase.from("profiles").upsert(
      {
        id: userId,
        expo_push_token: pushToken,
        notifications_enabled: true,
      },
      { onConflict: "id" },
    );

    if (error) {
      console.warn("[Astrocus] expo_push_token save failed:", error.message);
    }
  } catch (error) {
    console.warn(
      "[Astrocus] push registration failed:",
      error instanceof Error ? error.message : error,
    );
  }
};

const readNotificationScreen = (data: unknown): string | null => {
  if (typeof data !== "object" || data === null || !("screen" in data)) {
    return null;
  }
  const screen = (data as { screen?: unknown }).screen;
  return typeof screen === "string" ? screen : null;
};

/**
 * Navigates to the matching screen when the user taps a push notification.
 * Returns a subscription for cleanup; null when notifications are unavailable.
 */
export const setupNotificationResponseHandler = async (
  router: Router,
): Promise<NotificationResponseSubscription | null> => {
  if (shouldSkipPushRegistration()) {
    return null;
  }

  try {
    const Notifications = await import("expo-notifications");

    return Notifications.addNotificationResponseReceivedListener((response) => {
      const screen = readNotificationScreen(response.notification.request.content.data);
      if (screen === "universe-message") {
        router.push(UNIVERSE_MESSAGE_ROUTE);
      }
    });
  } catch (error) {
    console.warn(
      "[Astrocus] notification response handler setup failed:",
      error instanceof Error ? error.message : error,
    );
    return null;
  }
};
