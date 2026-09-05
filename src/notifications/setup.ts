import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { registerPushToken } from "@/api/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Best-effort — requires an EAS project id (app.json/app.config.ts
 * `extra.eas.projectId`, set by `eas init`) to mint a real Expo push token.
 * Without one this silently no-ops; every other mobile feature works fine
 * without push, so a missing/failed registration must never block login.
 */
export async function setupPushNotifications(): Promise<void> {
  try {
    const permission = await Notifications.requestPermissionsAsync();
    if (!permission.granted) return;

    const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
    if (!projectId) {
      console.warn("No EAS project configured (run `eas init`) — skipping push registration.");
      return;
    }

    const { data: token } = await Notifications.getExpoPushTokenAsync({ projectId });
    await registerPushToken(token);
  } catch (error) {
    console.warn("Push notification setup failed:", error);
  }
}
