import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import { WARNING_THRESHOLD_SECONDS } from "./constants";
import type { Language } from "./types";

/** Matches `theme.colors.bg` / Android adaptive icon background. */
export const FOCUS_SESSION_NOTIFICATION_BG = "#0A1123";

export const FOCUS_SESSION_ONGOING_ID = "focus-session-ongoing";
export const FOCUS_SESSION_COMPLETE_ID = "focus-session-complete";
export const FOCUS_SESSION_WARNING_ID = "focus-session-warning";

const FOCUS_SESSION_ONGOING_CHANNEL = "focus-session-ongoing";
const FOCUS_SESSION_COMPLETE_CHANNEL = "focus-session-complete";

/**
 * Expo Go (SDK 53+) Android: `expo-notifications` import edilince console.error atar → kırmızı ekran.
 * OAuth dönüşünde uygulama yeniden bundle edildiğinde bu çökme Google girişi sanılıyor.
 * Yerel arka plan uyarısı yalnızca development/production build'de çalışır.
 */
const canUseNotifications = !isRunningInExpoGo();

let handlerInstalled = false;
let ongoingChannelReady = false;
let completeChannelReady = false;

type NotificationsModule = typeof import("expo-notifications");

const installNotificationHandler = (Notifications: NotificationsModule) => {
  if (handlerInstalled) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      const id = notification.request.identifier;
      const isOngoingFocus = id === FOCUS_SESSION_ONGOING_ID;
      const isSessionComplete = id === FOCUS_SESSION_COMPLETE_ID;
      return {
        shouldPlaySound: isSessionComplete,
        shouldSetBadge: false,
        shouldShowBanner: !isOngoingFocus,
        shouldShowList: !isOngoingFocus,
      };
    },
  });
  handlerInstalled = true;
};

const loadNotifications = async (): Promise<NotificationsModule | null> => {
  if (!canUseNotifications) {
    return null;
  }

  const Notifications = await import("expo-notifications");
  installNotificationHandler(Notifications);
  return Notifications;
};

export const ensureNotificationPermission = async (): Promise<boolean> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

/** Ongoing lock-screen notification — Android only; tries in __DEV__ / Expo Go when permitted. */
const loadAndroidNotifications = async (): Promise<NotificationsModule | null> => {
  if (Platform.OS !== "android") {
    return null;
  }

  try {
    const Notifications = await import("expo-notifications");
    installNotificationHandler(Notifications);
    return Notifications;
  } catch {
    return null;
  }
};

export const formatRemainingTime = (seconds: number, language: Language = "tr"): string => {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  const clock = `${minutes}:${secs.toString().padStart(2, "0")}`;
  return language === "en" ? `${clock} remaining` : `${clock} kaldı`;
};

const focusSessionNotificationTitle = (language: Language = "tr"): string =>
  language === "en" ? "⏱ Focus Session" : "⏱ Odak Seansı";

const focusSessionCompletedTitle = (language: Language = "tr"): string =>
  language === "en" ? "🎉 Focus Session Complete!" : "🎉 Odak Seansı Tamamlandı!";

const focusSessionCompletedBody = (
  plannedDurationMinutes: number,
  language: Language = "tr",
): string =>
  language === "en"
    ? `You focused for ${plannedDurationMinutes} minutes. Amazing!`
    : `${plannedDurationMinutes} dakika odaklandın. Harikasın!`;

const ensureOngoingChannel = async (Notifications: NotificationsModule): Promise<void> => {
  if (ongoingChannelReady) {
    return;
  }

  await Notifications.setNotificationChannelAsync(FOCUS_SESSION_ONGOING_CHANNEL, {
    name: "Odak Seansı Durumu",
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: null,
    vibrationPattern: null,
    showBadge: false,
    lightColor: FOCUS_SESSION_NOTIFICATION_BG,
    enableVibrate: false,
    enableLights: false,
  });
  ongoingChannelReady = true;
};

const ensureCompleteChannel = async (Notifications: NotificationsModule): Promise<void> => {
  if (completeChannelReady) {
    return;
  }

  await Notifications.setNotificationChannelAsync(FOCUS_SESSION_COMPLETE_CHANNEL, {
    name: "Odak Seansı Tamamlandı",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 200, 120, 200],
    lightColor: "#7B61FF",
  });
  completeChannelReady = true;
};

const presentFocusSessionNotification = async (
  remainingSeconds: number,
  language: Language = "tr",
): Promise<void> => {
  const Notifications = await loadAndroidNotifications();
  if (!Notifications) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    if (__DEV__) {
      console.warn("[notifications] No permission for ongoing notification");
    }
    return;
  }

  await ensureOngoingChannel(Notifications);

  await Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_ONGOING_ID,
    content: {
      title: focusSessionNotificationTitle(language),
      body: formatRemainingTime(remainingSeconds, language),
      sticky: true,
      autoDismiss: false,
      ...(Platform.OS === "android" && {
        color: FOCUS_SESSION_NOTIFICATION_BG,
        channelId: FOCUS_SESSION_ONGOING_CHANNEL,
        ongoing: true,
      }),
    },
    trigger: null,
  });
};

export const startFocusSessionNotification = async (
  remainingSeconds: number,
  language: Language = "tr",
): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }
  await presentFocusSessionNotification(remainingSeconds, language);
};

export const updateFocusSessionNotification = async (
  remainingSeconds: number,
  language: Language = "tr",
): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }
  await presentFocusSessionNotification(remainingSeconds, language);
};

/** Schedules a one-shot alert when the focus session ends while the screen is locked. */
export const scheduleFocusSessionCompletedNotification = async (
  remainingSeconds: number,
  plannedDurationMinutes: number,
  language: Language = "tr",
): Promise<string | null> => {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    if (__DEV__) {
      console.warn("[notifications] No permission for completion notification");
    }
    return null;
  }

  const Notifications = await loadNotifications();
  if (!Notifications || remainingSeconds <= 0) {
    return null;
  }

  if (Platform.OS === "android") {
    await ensureCompleteChannel(Notifications);
  }

  return Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_COMPLETE_ID,
    content: {
      title: focusSessionCompletedTitle(language),
      body: focusSessionCompletedBody(plannedDurationMinutes, language),
      sound: true,
      autoDismiss: false,
      data: { type: "focus-session-complete" },
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
        channelId: FOCUS_SESSION_COMPLETE_CHANNEL,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: remainingSeconds,
      ...(Platform.OS === "android" && {
        channelId: FOCUS_SESSION_COMPLETE_CHANNEL,
      }),
    },
  });
};

export const cancelFocusSessionCompletedNotification = async (): Promise<void> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(FOCUS_SESSION_COMPLETE_ID);
  await Notifications.dismissNotificationAsync(FOCUS_SESSION_COMPLETE_ID);
};

const isFocusSessionCompleteNotification = (
  identifier: string,
  data: Record<string, unknown> | undefined,
): boolean =>
  identifier === FOCUS_SESSION_COMPLETE_ID || data?.type === "focus-session-complete";

/** Tap on lock-screen completion alert → sync session and show in-app celebration. */
export const setupFocusSessionCompleteTapHandler = async (
  onTap: () => void,
): Promise<{ remove: () => void } | null> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return null;
  }

  const handleResponse = (response: {
    notification: { request: { identifier: string; content: { data?: Record<string, unknown> } } };
  }) => {
    const { identifier, content } = response.notification.request;
    if (isFocusSessionCompleteNotification(identifier, content.data)) {
      onTap();
    }
  };

  const lastResponse = await Notifications.getLastNotificationResponseAsync();
  if (lastResponse) {
    const { identifier, content } = lastResponse.notification.request;
    if (isFocusSessionCompleteNotification(identifier, content.data)) {
      onTap();
    }
  }

  return Notifications.addNotificationResponseReceivedListener(handleResponse);
};

export const stopFocusSessionNotification = async (): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }

  const Notifications = await loadAndroidNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.dismissNotificationAsync(FOCUS_SESSION_ONGOING_ID);
};

let warningChannelReady = false;

/**
 * Schedules the "geri dön" background warning.
 * @param backgroundedAt  Epoch ms when the `background` event fired. Used to subtract
 *                        elapsed detection time so the notification fires exactly
 *                        WARNING_THRESHOLD_SECONDS from when the app left the foreground.
 */
export const scheduleBackgroundWarning = async (
  message: string,
  backgroundedAt?: number,
): Promise<string | null> => {
  const Notifications = await loadNotifications();
  if (!Notifications) return null;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    if (__DEV__) console.warn("[notifications] permission not granted:", status);
    return null;
  }

  if (Platform.OS === "android" && !warningChannelReady) {
    await Notifications.setNotificationChannelAsync("focus-session", {
      name: "Odak Seansı",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7B61FF",
    });
    warningChannelReady = true;
  }

  // Subtract elapsed time so the alert fires WARNING_THRESHOLD_SECONDS after the app
  // actually went to background, not after we finish detecting it.
  const elapsedSeconds = backgroundedAt ? (Date.now() - backgroundedAt) / 1000 : 0;
  const triggerSeconds = Math.max(2, Math.ceil(WARNING_THRESHOLD_SECONDS - elapsedSeconds));

  return Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_WARNING_ID,
    content: {
      title: "Odak Seansı",
      body: message,
      sound: true,
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
        channelId: "focus-session",
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: triggerSeconds,
      ...(Platform.OS === "android" && {
        channelId: "focus-session",
      }),
    },
  });
};

export const cancelScheduledNotification = async (notificationId: string | null) => {
  if (!notificationId) {
    return;
  }

  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(notificationId);
};
