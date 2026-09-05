import { Tabs } from "expo-router";
import { colors } from "@/theme";
import { DriverProfileProvider } from "@/auth/DriverProfileContext";

export default function DriverTabsLayout() {
  return (
    <DriverProfileProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home" }} />
        <Tabs.Screen name="requests" options={{ title: "Requests" }} />
        <Tabs.Screen name="trip" options={{ title: "Trip" }} />
        <Tabs.Screen name="earnings" options={{ title: "Earnings" }} />
        <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      </Tabs>
    </DriverProfileProvider>
  );
}
