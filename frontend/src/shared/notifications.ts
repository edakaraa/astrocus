import { isRunningInExpoGo } from "expo";
import { Platform } from "react-native";
import { WARNING_THRESHOLD_SECONDS } from "./constants";
import type { Language } from "./types";

/** Matches `theme.colors.bg` / Android adaptive icon background. */
export const FOCUS_SESSION_NOTIFICATION_BG = "#0A1123";

export const FOCUS_SESSION_ONGOING_ID = "focus-session-ongoing";
export const FOCUS_SESSION_COMPLETE_ID = "focus-session-complete";
export const FOCUS_SESSION_WARNING_ID = "focus-session-warning";
export const FOCUS_SESSION_FAILED_ID = "focus-session-failed";

const FOCUS_SESSION_ONGOING_CHANNEL = "focus-session-ongoing";
const FOCUS_SESSION_COMPLETE_CHANNEL = "focus-session-complete";
const FOCUS_SESSION_ALERT_CHANNEL = "focus-session";

/**
 * Expo Go (SDK 53+) Android: `expo-notifications` import edilince console.error atar → kırmızı ekran.
 * Yerel arka plan uyarısı yalnızca development/production build'de çalışır.
 */
const canUseNotifications = !isRunningInExpoGo();

let handlerInstalled = false;
let ongoingChannelReady = false;
let completeChannelReady = false;
let alertChannelReady = false;

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
        shouldPlaySound: isSessionComplete || id === FOCUS_SESSION_FAILED_ID,
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

/** Ongoing lock-screen notification — Android only. */
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

export const ensureNotificationPermission = async (): Promise<boolean> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return false;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });
  return status === "granted";
};

export const formatRemainingTime = (seconds: number, language: Language = "tr"): string => {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const secs = total % 60;
  const clock = `${minutes}:${secs.toString().padStart(2, "0")}`;
  return language === "en" ? `${clock} remaining` : `${clock} kaldı`;
};

export const FOCUS_SESSION_ROUTE = "/(tabs)/session" as const;

const focusSessionBrandTitle = (): string => "Astrocus";

const focusSessionNotificationTitle = (language: Language = "tr"): string =>
  language === "en" ? "Focus session" : "Odak seansı";

import { buildFocusSessionCelebrationBody } from "../context/session/focusSessionNotifications";

export { buildFocusSessionCelebrationBody };

const focusSessionCompletedTitle = (language: Language = "tr"): string =>
  language === "en" ? "🎉 Session complete!" : "🎉 Seans tamamlandı!";

const focusSessionFailedTitle = (language: Language = "tr"): string =>
  language === "en" ? "Focus session lost" : "Odak seansı kaybedildi";

const focusSessionFailedBody = (seconds: number, language: Language = "tr"): string =>
  language === "en"
    ? `You left the app for more than ${seconds} seconds.`
    : `Uygulamadan ${seconds} saniyeden fazla uzak kaldın.`;

export const focusSessionAwayWarningTitle = (language: Language = "tr"): string =>
  language === "en" ? "⚠️ Focus session at risk!" : "⚠️ Odak seansın tehlikede!";

export const focusSessionAwayWarningBody = (language: Language = "tr"): string =>
  language === "en"
    ? "Return within 10 seconds or the session will end."
    : "Geri dönmezsen 10 saniye içinde seans sona erer.";

const ensureOngoingChannel = async (Notifications: NotificationsModule): Promise<void> => {
  if (ongoingChannelReady) {
    return;
  }

  await Notifications.setNotificationChannelAsync(FOCUS_SESSION_ONGOING_CHANNEL, {
    name: "Odak Seansı Durumu",
    importance: Notifications.AndroidImportance.HIGH,
    sound: null,
    vibrationPattern: null,
    showBadge: false,
    lightColor: FOCUS_SESSION_NOTIFICATION_BG,
    enableVibrate: false,
    enableLights: false,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
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
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  completeChannelReady = true;
};

const ensureAlertChannel = async (Notifications: NotificationsModule): Promise<void> => {
  if (alertChannelReady) {
    return;
  }

  await Notifications.setNotificationChannelAsync(FOCUS_SESSION_ALERT_CHANNEL, {
    name: "Odak Seansı",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
    lightColor: "#7B61FF",
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  alertChannelReady = true;
};

const presentFocusSessionNotificationFallback = async (
  remainingSeconds: number,
  language: Language = "tr",
): Promise<void> => {
  const Notifications = await loadAndroidNotifications();
  if (!Notifications) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return;
  }

  await ensureOngoingChannel(Notifications);

  const sessionLabel = focusSessionNotificationTitle(language);
  const remainingLabel = formatRemainingTime(remainingSeconds, language);

  await Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_ONGOING_ID,
    content: {
      title: focusSessionBrandTitle(),
      subtitle: sessionLabel,
      body: remainingLabel,
      sticky: true,
      autoDismiss: false,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      ...(Platform.OS === "android" && {
        color: FOCUS_SESSION_NOTIFICATION_BG,
        channelId: FOCUS_SESSION_ONGOING_CHANNEL,
      }),
    },
    trigger: null,
  });
};

const presentFocusTimerService = async (
  remainingSeconds: number,
  language: Language = "tr",
  mode: "start" | "update" = "start",
): Promise<boolean> => {
  if (Platform.OS !== "android" || remainingSeconds <= 0) {
    return false;
  }

  try {
    const focusTimer = await import("astrocus-focus-timer");
    const endTimeMs = Date.now() + remainingSeconds * 1000;
    const sessionTitle = focusSessionNotificationTitle(language);
    const sessionSubtitle = formatRemainingTime(remainingSeconds, language);

    if (mode === "update" && focusTimer.isFocusTimerServiceAvailable()) {
      return await focusTimer.updateFocusTimerNotification(
        endTimeMs,
        sessionTitle,
        sessionSubtitle,
      );
    }

    return await focusTimer.startFocusTimerNotification(
      endTimeMs,
      sessionTitle,
      sessionSubtitle,
    );
  } catch {
    return false;
  }
};

export const startFocusSessionNotification = async (
  remainingSeconds: number,
  language: Language = "tr",
): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }

  const started = await presentFocusTimerService(remainingSeconds, language);
  if (!started) {
    await presentFocusSessionNotificationFallback(remainingSeconds, language);
  }
};

export const updateFocusSessionNotification = async (
  remainingSeconds: number,
  language: Language = "tr",
): Promise<void> => {
  if (Platform.OS !== "android" || remainingSeconds <= 0) {
    return;
  }

  const bodyText =
    language === "en"
      ? "Your star is shining ✨ Keep focusing"
      : "Yıldızın parlıyor ✨ Odaklanmaya devam et";

  let started = false;
  try {
    const focusTimer = await import("astrocus-focus-timer");
    const endTimeMs = Date.now() + remainingSeconds * 1000;
    if (focusTimer.isFocusTimerServiceAvailable()) {
      started = await focusTimer.updateFocusTimerNotification(endTimeMs, "", bodyText);
    }
  } catch {
    started = false;
  }

  if (!started) {
    const Notifications = await loadAndroidNotifications();
    if (!Notifications) {
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      return;
    }

    await ensureOngoingChannel(Notifications);

    const sessionLabel = focusSessionNotificationTitle(language);

    await Notifications.scheduleNotificationAsync({
      identifier: FOCUS_SESSION_ONGOING_ID,
      content: {
        title: "",
        subtitle: sessionLabel,
        body: bodyText,
        sticky: true,
        autoDismiss: false,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ...(Platform.OS === "android" && {
          color: FOCUS_SESSION_NOTIFICATION_BG,
          channelId: FOCUS_SESSION_ONGOING_CHANNEL,
        }),
      },
      trigger: null,
    });
  }
};

/** Immediate celebration notification when JS timer completes (not lock-screen scheduled). */
export const presentFocusSessionCompletedNotification = async (input: {
  durationMinutes: number;
  stardustEarned: number;
  language: Language;
}): Promise<void> => {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return;
  }

  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  if (Platform.OS === "android") {
    await ensureCompleteChannel(Notifications);
  }

  await Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_COMPLETE_ID,
    content: {
      title: focusSessionCompletedTitle(input.language),
      body: buildFocusSessionCelebrationBody(
        input.durationMinutes,
        input.stardustEarned,
        input.language,
      ),
      sound: true,
      autoDismiss: false,
      data: { type: "focus-session-complete", route: FOCUS_SESSION_ROUTE },
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
        channelId: FOCUS_SESSION_COMPLETE_CHANNEL,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      }),
    },
    trigger: null,
  });
};

export const scheduleFocusSessionCompletedNotification = async (
  remainingSeconds: number,
  plannedDurationMinutes: number,
  language: Language = "tr",
): Promise<string | null> => {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
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
      body: buildFocusSessionCelebrationBody(
        plannedDurationMinutes,
        plannedDurationMinutes * 10,
        language,
      ),
      sound: true,
      autoDismiss: false,
      data: { type: "focus-session-complete", route: FOCUS_SESSION_ROUTE },
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
        channelId: FOCUS_SESSION_COMPLETE_CHANNEL,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: Math.max(1, Math.ceil(remainingSeconds)),
      ...(Platform.OS === "android" && {
        channelId: FOCUS_SESSION_COMPLETE_CHANNEL,
      }),
    },
  });
};

export const scheduleSessionFailedNotification = async (
  language: Language = "tr",
): Promise<void> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return;
  }

  if (Platform.OS === "android") {
    await ensureAlertChannel(Notifications);
  }

  await Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_FAILED_ID,
    content: {
      title: focusSessionFailedTitle(language),
      body: focusSessionFailedBody(WARNING_THRESHOLD_SECONDS, language),
      sound: true,
      data: { type: "focus-session-failed" },
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
        channelId: FOCUS_SESSION_ALERT_CHANNEL,
      }),
    },
    trigger: null,
  });
};

/** Native scheduler: fires fail notification after `delaySeconds` from `backgroundedAtMs`. */
export const scheduleSessionFailedNotificationDelayed = async (
  delaySeconds: number,
  backgroundedAtMs?: number,
  language: Language = "tr",
): Promise<string | null> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return null;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await ensureAlertChannel(Notifications);
  }

  const elapsedSeconds = backgroundedAtMs ? (Date.now() - backgroundedAtMs) / 1000 : 0;
  const triggerSeconds = Math.max(1, Math.ceil(delaySeconds - elapsedSeconds));

  return Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_FAILED_ID,
    content: {
      title: focusSessionFailedTitle(language),
      body: focusSessionFailedBody(WARNING_THRESHOLD_SECONDS, language),
      sound: true,
      data: { type: "focus-session-failed" },
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
        channelId: FOCUS_SESSION_ALERT_CHANNEL,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: triggerSeconds,
      ...(Platform.OS === "android" && {
        channelId: FOCUS_SESSION_ALERT_CHANNEL,
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

export const setupFocusSessionCompleteTapHandler = async (
  onTap: (route?: string) => void,
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
      const route = typeof content.data?.route === "string" ? content.data.route : undefined;
      onTap(route);
    }
  };

  const lastResponse = await Notifications.getLastNotificationResponseAsync();
  if (lastResponse) {
    const { identifier, content } = lastResponse.notification.request;
    if (isFocusSessionCompleteNotification(identifier, content.data)) {
      const route = typeof content.data?.route === "string" ? content.data.route : undefined;
      onTap(route);
    }
  }

  return Notifications.addNotificationResponseReceivedListener(handleResponse);
};

export const stopFocusSessionNotification = async (): Promise<void> => {
  if (Platform.OS !== "android") {
    return;
  }

  try {
    const { stopFocusTimerNotification } = await import("astrocus-focus-timer");
    await stopFocusTimerNotification();
  } catch {
    /* native module optional */
  }

  const Notifications = await loadAndroidNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.dismissNotificationAsync(FOCUS_SESSION_ONGOING_ID);
};

/** Immediate away warning at the 10s mark (foreground JS timeout). */
export const presentFocusSessionAwayWarning = async (
  language: Language = "tr",
): Promise<void> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return;
  }

  if (Platform.OS === "android") {
    await ensureAlertChannel(Notifications);
  }

  await Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_WARNING_ID,
    content: {
      title: focusSessionAwayWarningTitle(language),
      body: focusSessionAwayWarningBody(language),
      sound: true,
      data: { type: "focus-session-warning" },
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
        channelId: FOCUS_SESSION_ALERT_CHANNEL,
      }),
    },
    trigger: null,
  });
};

export const scheduleBackgroundWarning = async (
  message: string,
  backgroundedAt?: number,
  language: Language = "tr",
): Promise<string | null> => {
  const Notifications = await loadNotifications();
  if (!Notifications) return null;

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== "granted") {
    return null;
  }

  if (Platform.OS === "android") {
    await ensureAlertChannel(Notifications);
  }

  const elapsedSeconds = backgroundedAt ? (Date.now() - backgroundedAt) / 1000 : 0;
  const triggerSeconds = Math.max(2, Math.ceil(WARNING_THRESHOLD_SECONDS - elapsedSeconds));

  return Notifications.scheduleNotificationAsync({
    identifier: FOCUS_SESSION_WARNING_ID,
    content: {
      title: focusSessionAwayWarningTitle(language),
      body: message || focusSessionAwayWarningBody(language),
      sound: true,
      data: { type: "focus-session-warning" },
      ...(Platform.OS === "android" && {
        color: "#7B61FF",
        channelId: FOCUS_SESSION_ALERT_CHANNEL,
      }),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: triggerSeconds,
      ...(Platform.OS === "android" && {
        channelId: FOCUS_SESSION_ALERT_CHANNEL,
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

export const dismissNotification = async (notificationId: string): Promise<void> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return;
  }

  await Notifications.dismissNotificationAsync(notificationId);
};

/** Create Android channels early so permission prompt and scheduling work reliably. */
export const bootstrapNotificationChannels = async (): Promise<void> => {
  if (Platform.OS !== "android" || !canUseNotifications) {
    return;
  }

  const Notifications = await loadAndroidNotifications();
  if (!Notifications) {
    return;
  }

  await ensureOngoingChannel(Notifications);
  await ensureCompleteChannel(Notifications);
  await ensureAlertChannel(Notifications);
};
