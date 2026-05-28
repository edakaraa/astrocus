import { isRunningInExpoGo } from "expo";
import { WARNING_THRESHOLD_SECONDS } from "./constants";

/**
 * Expo Go (SDK 53+) Android: `expo-notifications` import edilince console.error atar → kırmızı ekran.
 * OAuth dönüşünde uygulama yeniden bundle edildiğinde bu çökme Google girişi sanılıyor.
 * Yerel arka plan uyarısı yalnızca development/production build'de çalışır.
 */
const canUseNotifications = !isRunningInExpoGo();

let handlerInstalled = false;

type NotificationsModule = typeof import("expo-notifications");

const loadNotifications = async (): Promise<NotificationsModule | null> => {
  if (!canUseNotifications) {
    return null;
  }

  const Notifications = await import("expo-notifications");

  if (!handlerInstalled) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
    handlerInstalled = true;
  }

  return Notifications;
};

export const scheduleBackgroundWarning = async (message: string): Promise<string | null> => {
  const Notifications = await loadNotifications();
  if (!Notifications) {
    return null;
  }

  return Notifications.scheduleNotificationAsync({
    content: {
      title: "Astrocus",
      body: message,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
      seconds: WARNING_THRESHOLD_SECONDS,
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
