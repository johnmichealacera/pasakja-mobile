import { Tabs } from "expo-router";
import { colors } from "@/theme";

export default function PassengerTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="book" options={{ title: "Book" }} />
      <Tabs.Screen name="trips" options={{ title: "Trips" }} />
      <Tabs.Screen name="sos" options={{ title: "SOS" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      {/* Reachable via router.push, not shown as a tab — live tracking for the active trip. */}
      <Tabs.Screen name="trip" options={{ href: null, title: "Trip" }} />
    </Tabs>
  );
}
