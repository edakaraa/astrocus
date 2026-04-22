import * as Notifications from "expo-notifications";
import { WARNING_THRESHOLD_SECONDS } from "./constants";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const scheduleBackgroundWarning = async (message: string) => {
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

  await Notifications.cancelScheduledNotificationAsync(notificationId);
};
