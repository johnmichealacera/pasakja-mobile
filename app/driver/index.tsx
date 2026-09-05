import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, RefreshControl, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Card } from "@/components/Card";
import { StatTile } from "@/components/StatTile";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/auth/AuthContext";
import { useDriverProfile } from "@/auth/DriverProfileContext";
import { useDriverAvailability } from "@/hooks/useDriverAvailability";
import { listBookings } from "@/api/bookings";
import type { Booking } from "@/types";
import { BOOKING_STATUS, DRIVER_STATUS } from "@/lib/statusPresentation";
import { colors, radius, spacing, typography } from "@/theme";

function LivePulseDot() {
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }));
    loop.start();
    return () => loop.stop();
  }, [pulse]);
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.2] });
  const opacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.5, 0] });
  return (
    <View style={styles.pulseWrap}>
      <Animated.View style={[styles.pulseRing, { transform: [{ scale }], opacity }]} />
      <View style={styles.pulseDot} />
    </View>
  );
}

export default function DriverHomeScreen() {
  const { user } = useAuth();
  const { driver, isLoading: isDriverLoading } = useDriverProfile();
  const { isToggling, toggle } = useDriverAvailability();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setBookings(await listBookings());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function handleToggle(value: boolean) {
    try {
      await toggle(value);
    } catch (err) {
      Alert.alert("Could not update status", err instanceof Error ? err.message : "Please try again.");
    }
  }

  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const statusInfo = driver ? DRIVER_STATUS[driver.status] : null;

  return (
    <View style={styles.flex}>
      <ScreenHeader
        title={`Hi, ${user?.name?.split(" ")[0] ?? "driver"}`}
        subtitle={driver?.status === "VERIFIED" ? "Ready to earn today?" : statusInfo?.label}
      >
        {driver?.status === "VERIFIED" ? (
          <View style={styles.availabilityCard}>
            <View style={styles.availabilityLeft}>
              {driver.isAvailable ? <LivePulseDot /> : <View style={styles.offlineDot} />}
              <View>
                <Text style={styles.availabilityLabel}>
                  {driver.isAvailable ? "You're online" : "You're offline"}
                </Text>
                <Text style={styles.availabilityHint}>
                  {driver.isAvailable ? "Visible to nearby passengers" : "Go online to get requests"}
                </Text>
              </View>
            </View>
            <Switch
              value={driver.isAvailable}
              onValueChange={handleToggle}
              disabled={isToggling || isDriverLoading}
              trackColor={{ false: "rgba(255,255,255,0.3)", true: colors.amber }}
              thumbColor="#fff"
            />
          </View>
        ) : null}
      </ScreenHeader>

      <Screen edges={["bottom"]} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
        {statusInfo && driver?.status !== "VERIFIED" ? (
          <Card style={[styles.statusCard, { borderColor: statusInfo.color }]}>
            <Ionicons name={statusInfo.icon} size={18} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
          </Card>
        ) : null}

        <View style={styles.statsRow}>
          <StatTile icon="receipt-outline" value={bookings.length} label="Total Trips" tone="teal" />
          <StatTile icon="checkmark-done-outline" value={completed} label="Completed" tone="emerald" />
        </View>

        <Text style={styles.sectionTitle}>Recent Trips</Text>
        {bookings.slice(0, 5).map((b) => {
          const status = BOOKING_STATUS[b.status];
          return (
            <Card key={b.id} style={styles.tripRow}>
              <View style={[styles.tripIconWrap, { backgroundColor: status.bg }]}>
                <Ionicons name={status.icon} size={16} color={status.color} />
              </View>
              <View style={styles.tripTextCol}>
                <Text style={styles.tripAddress} numberOfLines={1}>
                  {b.pickupAddress} → {b.dropoffAddress}
                </Text>
                <Text style={[styles.tripStatusLabel, { color: status.color }]}>{status.label}</Text>
              </View>
            </Card>
          );
        })}
        {!isLoading && bookings.length === 0 ? (
          <EmptyState icon="car-outline" title="No trips yet" subtitle="Go online to start receiving ride requests." />
        ) : null}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  availabilityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
    borderRadius: radius.lg,
    padding: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  availabilityLeft: { flexDirection: "row", alignItems: "center", gap: spacing.md, flex: 1 },
  pulseWrap: { width: 14, height: 14, alignItems: "center", justifyContent: "center" },
  pulseRing: { position: "absolute", width: 14, height: 14, borderRadius: radius.full, backgroundColor: colors.amber },
  pulseDot: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: colors.amber },
  offlineDot: { width: 10, height: 10, borderRadius: radius.full, backgroundColor: "rgba(255,255,255,0.4)" },
  availabilityLabel: { ...typography.subtitle, color: "#fff" },
  availabilityHint: { ...typography.caption, color: "rgba(255,255,255,0.75)", marginTop: 2 },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    borderWidth: 1,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  statusText: { ...typography.bodyStrong, flex: 1 },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.xl },
  sectionTitle: { ...typography.title, fontSize: 16, marginBottom: spacing.md },
  tripRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.sm },
  tripIconWrap: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  tripTextCol: { flex: 1 },
  tripAddress: { ...typography.bodyStrong },
  tripStatusLabel: { ...typography.caption, marginTop: 2, fontWeight: "700" },
});
