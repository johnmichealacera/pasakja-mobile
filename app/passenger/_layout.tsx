import { Tabs } from "expo-router";
import type { ColorValue } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colors, shadow } from "@/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const ICONS: Record<string, [IconName, IconName]> = {
  index: ["home", "home-outline"],
  book: ["car", "car-outline"],
  trips: ["receipt", "receipt-outline"],
  sos: ["warning", "warning-outline"],
  profile: ["person-circle", "person-circle-outline"],
};

function tabIcon(routeName: string) {
  return ({ focused, color, size }: { focused: boolean; color: ColorValue; size: number }) => {
    const [filled, outline] = ICONS[routeName] ?? ["ellipse", "ellipse-outline"];
    // SOS always reads as urgent, whether or not it's the active tab.
    const iconColor = routeName === "sos" && !focused ? colors.coral : color;
    return <Ionicons name={focused ? filled : outline} size={size} color={iconColor as string} />;
  };
}

export default function PassengerTabsLayout() {
  return (
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
      <Tabs.Screen name="book" options={{ title: "Book", tabBarIcon: tabIcon("book") }} />
      <Tabs.Screen name="trips" options={{ title: "Trips", tabBarIcon: tabIcon("trips") }} />
      <Tabs.Screen name="sos" options={{ title: "SOS", tabBarIcon: tabIcon("sos") }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: tabIcon("profile") }} />
      {/* Reachable via router.push, not shown as a tab — live tracking for the active trip. */}
      <Tabs.Screen name="trip" options={{ href: null, title: "Trip" }} />
    </Tabs>
  );
}
