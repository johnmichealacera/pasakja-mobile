import { useEffect } from "react";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useAuth } from "@/auth/AuthContext";
import { setupPushNotifications } from "@/notifications/setup";
import { routeForNotification } from "@/notifications/routeForNotification";

/** Registers the push token once logged in, and routes taps on a received notification. */
export function NotificationsGateway() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) setupPushNotifications();
  }, [user]);

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const target = routeForNotification(
        response.notification.request.content.data as Record<string, unknown>
      );
      if (target) router.push(target as never);
    });
    return () => subscription.remove();
  }, []);

  return null;
}
