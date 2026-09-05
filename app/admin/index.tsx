import React, { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { getAdminStats } from "@/api/admin";
import type { AdminStats } from "@/api/admin";
import { colors } from "@/theme";

const SECTIONS = [
  { title: "Bookings", href: "/admin/bookings" as const },
  { title: "Drivers (KYC approval)", href: "/admin/drivers" as const },
  { title: "SOS & Disputes", href: "/admin/sos" as const },
  { title: "Profile", href: "/admin/profile" as const },
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

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      {stats ? (
        <View style={styles.statsGrid}>
          <Stat label="Total Bookings" value={stats.totalBookings} />
          <Stat label="Completed" value={stats.completedBookings} />
          <Stat label="Pending" value={stats.pendingBookings} />
          <Stat label="Cancelled" value={stats.cancelledBookings} />
          <Stat label="Active Drivers" value={stats.activeDrivers} />
          <Stat label="Total Drivers" value={stats.totalDrivers} />
          <Stat label="Total Passengers" value={stats.totalPassengers} />
          <Stat label="Revenue" value={`₱${stats.totalRevenue.toFixed(0)}`} isText />
        </View>
      ) : null}

      <Text style={styles.notice}>
        Fare/zone rates, full reports, and remittances stay web-only (see the mobile plan,
        Section 9).
      </Text>
      <View style={{ gap: 12 }}>
        {SECTIONS.map((s) => (
          <Button key={s.href} title={s.title} variant="outline" onPress={() => router.push(s.href)} />
        ))}
      </View>
    </Screen>
  );
}

function Stat({ label, value, isText }: { label: string; value: number | string; isText?: boolean }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit={!isText}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  stat: {
    width: "47%",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  notice: { color: colors.muted, fontSize: 13, marginBottom: 20 },
});
