import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import { WARNING_THRESHOLD_SECONDS } from "./constants";
import type { Language } from "./types";

/** Matches `theme.colors.bg` / Android adaptive icon background. */
export const FOCUS_SESSION_NOTIFICATION_BG = "#0A1123";

export const FOCUS_SESSION_ONGOING_ID = "focus-session-ongoing";

const FOCUS_SESSION_ONGOING_CHANNEL = "focus-session-ongoing";

/**
 * Expo Go (SDK 53+) Android: `expo-notifications` import edilince console.error atar → kırmızı ekran.
 * OAuth dönüşünde uygulama yeniden bundle edildiğinde bu çökme Google girişi sanılıyor.
 * Yerel arka plan uyarısı yalnızca development/production build'de çalışır.
 */
const canUseNotifications = !isRunningInExpoGo();

let handlerInstalled = false;
let ongoingChannelReady = false;

type NotificationsModule = typeof import("expo-notifications");

const installNotificationHandler = (Notifications: NotificationsModule) => {
  if (handlerInstalled) {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
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

const ensureOngoingChannel = async (Notifications: NotificationsModule): Promise<void> => {
  if (ongoingChannelReady) {
    return;
  }

  await Notifications.setNotificationChannelAsync(FOCUS_SESSION_ONGOING_CHANNEL, {
    name: "Odak Seansı Durumu",
    importance: Notifications.AndroidImportance.LOW,
    sound: null,
    vibrationPattern: null,
    showBadge: false,
    lightColor: FOCUS_SESSION_NOTIFICATION_BG,
    enableVibrate: false,
    enableLights: false,
  });
  ongoingChannelReady = true;
};

const presentFocusSessionNotification = async (
  remainingSeconds: number,
  language: Language = "tr",
): Promise<void> => {
  const Notifications = await loadAndroidNotifications();
  if (!Notifications) {
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

export const scheduleBackgroundWarning = async (message: string): Promise<string | null> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("focus-session", {
      name: "Odak Seansı",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default",
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#7B61FF",
    });
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Odak Seansı",
      body: message,
      sound: true,
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: WARNING_THRESHOLD_SECONDS,
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
