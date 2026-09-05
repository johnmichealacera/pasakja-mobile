import { Stack } from "expo-router";
import { AuthProvider } from "@/auth/AuthContext";
import { NotificationsGateway } from "@/notifications/NotificationsGateway";

export default function RootLayout() {
  return (
    <AuthProvider>
      <NotificationsGateway />
      <Stack screenOptions={{ headerShown: false }} />
    </AuthProvider>
  );
}
