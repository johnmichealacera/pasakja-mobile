import { Stack } from "expo-router";
import { colors } from "@/theme";

export default function AdminLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: colors.teal },
        headerTintColor: "#ffffff",
        headerTitleStyle: { fontWeight: "700" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "Admin Dashboard" }} />
      <Stack.Screen name="bookings" options={{ title: "Bookings" }} />
      <Stack.Screen name="drivers" options={{ title: "Drivers" }} />
      <Stack.Screen name="sos" options={{ title: "SOS & Disputes" }} />
      <Stack.Screen name="profile" options={{ title: "Profile" }} />
    </Stack>
  );
}
