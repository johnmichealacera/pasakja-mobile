import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadow } from "@/theme";
import { DriverProfileProvider } from "@/auth/DriverProfileContext";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, [IconName, IconName]> = {
  index: ["home", "home-outline"],
  requests: ["notifications", "notifications-outline"],
  trip: ["navigate", "navigate-outline"],
  earnings: ["wallet", "wallet-outline"],
  profile: ["person-circle", "person-circle-outline"],
};

function tabIcon(routeName: string) {
  return ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => {
    const [filled, outline] = ICONS[routeName] ?? ["ellipse", "ellipse-outline"];
    return <Ionicons name={focused ? filled : outline} size={size} color={color as string} />;
  };
}

export default function DriverTabsLayout() {
  return (
    <DriverProfileProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.teal,
          tabBarInactiveTintColor: colors.inkFaint,
          tabBarStyle: { borderTopWidth: 0, height: 64, paddingBottom: 8, paddingTop: 6, ...shadow.sm },
          tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: tabIcon("index") }} />
        <Tabs.Screen
          name="requests"
          options={{ title: "Requests", tabBarIcon: tabIcon("requests") }}
        />
        <Tabs.Screen name="trip" options={{ title: "Trip", tabBarIcon: tabIcon("trip") }} />
        <Tabs.Screen
          name="earnings"
          options={{ title: "Earnings", tabBarIcon: tabIcon("earnings") }}
        />
        <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: tabIcon("profile") }} />
      </Tabs>
    </DriverProfileProvider>
  );
}
