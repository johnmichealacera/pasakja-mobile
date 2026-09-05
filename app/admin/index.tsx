import React, { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { getAdminStats } from "@/api/admin";
import type { AdminStats } from "@/api/admin";
import { colors, radius, spacing, typography } from "@/theme";

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const SECTIONS: { title: string; href: "/admin/bookings" | "/admin/drivers" | "/admin/sos" | "/admin/profile"; icon: IconName }[] = [
  { title: "Bookings", href: "/admin/bookings", icon: "receipt-outline" },
  { title: "Drivers (KYC approval)", href: "/admin/drivers", icon: "shield-checkmark-outline" },
  { title: "SOS & Disputes", href: "/admin/sos", icon: "warning-outline" },
  { title: "Profile", href: "/admin/profile", icon: "person-circle-outline" },
];

export default function AdminDashboardScreen() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setStats(await getAdminStats());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const items: { icon: IconName; label: string; value: string | number; color: string }[] = stats
    ? [
        { icon: "receipt-outline", label: "Total Bookings", value: stats.totalBookings, color: colors.teal },
        { icon: "checkmark-done-outline", label: "Completed", value: stats.completedBookings, color: colors.emerald },
        { icon: "time-outline", label: "Pending", value: stats.pendingBookings, color: colors.amberDark },
        { icon: "close-circle-outline", label: "Cancelled", value: stats.cancelledBookings, color: colors.coral },
        { icon: "radio-outline", label: "Active Drivers", value: stats.activeDrivers, color: colors.teal },
        { icon: "car-outline", label: "Total Drivers", value: stats.totalDrivers, color: colors.teal },
        { icon: "person-outline", label: "Total Passengers", value: stats.totalPassengers, color: colors.emerald },
        { icon: "cash-outline", label: "Revenue", value: `₱${stats.totalRevenue.toFixed(0)}`, color: colors.amberDark },
      ]
    : [];

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      <View style={styles.statsGrid}>
        {items.map((item) => (
          <Card key={item.label} style={styles.stat}>
            <View style={[styles.statIconWrap, { backgroundColor: `${item.color}1a` }]}>
              <Ionicons name={item.icon} size={16} color={item.color} />
            </View>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
              {item.value}
            </Text>
            <Text style={styles.statLabel}>{item.label}</Text>
          </Card>
        ))}
      </View>

      <Card variant="muted" style={styles.notice}>
        <Ionicons name="information-circle-outline" size={16} color={colors.teal} />
        <Text style={styles.noticeText}>
          Fare/zone rates, full reports, and remittances stay web-only.
        </Text>
      </Card>

      <View style={{ gap: spacing.md }}>
        {SECTIONS.map((s) => (
          <Button key={s.href} title={s.title} variant="outline" icon={s.icon} onPress={() => router.push(s.href)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  stat: {
    width: "47%",
    alignItems: "center",
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.sm,
  },
  statValue: { ...typography.title, fontSize: 18 },
  statLabel: { ...typography.caption, marginTop: 2 },
  notice: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.xl },
  noticeText: { ...typography.caption, flex: 1 },
});
