import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, StyleSheet, Switch, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { useAuth } from "@/auth/AuthContext";
import { useDriverProfile } from "@/auth/DriverProfileContext";
import { useDriverAvailability } from "@/hooks/useDriverAvailability";
import { listBookings } from "@/api/bookings";
import type { Booking } from "@/types";
import { colors } from "@/theme";

const STATUS_COPY: Record<string, { label: string; tone: string }> = {
  PENDING: { label: "Verification pending — an admin needs to approve your documents.", tone: colors.warning },
  VERIFIED: { label: "You're verified and can accept rides.", tone: colors.success },
  SUSPENDED: { label: "Your account is suspended. Contact an admin.", tone: colors.danger },
};

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
  const statusCopy = driver ? STATUS_COPY[driver.status] : null;

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      <Text style={styles.greeting}>Hi, {user?.name?.split(" ")[0] ?? "driver"} 👋</Text>

      {statusCopy ? (
        <View style={[styles.statusCard, { borderColor: statusCopy.tone }]}>
          <Text style={[styles.statusText, { color: statusCopy.tone }]}>{statusCopy.label}</Text>
        </View>
      ) : null}

      {driver?.status === "VERIFIED" ? (
        <View style={styles.availabilityCard}>
          <View>
            <Text style={styles.availabilityLabel}>
              {driver.isAvailable ? "You're online" : "You're offline"}
            </Text>
            <Text style={styles.availabilityHint}>
              {driver.isAvailable
                ? "Passengers can see you and send requests."
                : "Go online to start receiving ride requests."}
            </Text>
          </View>
          <Switch
            value={driver.isAvailable}
            onValueChange={handleToggle}
            disabled={isToggling || isDriverLoading}
          />
        </View>
      ) : null}

      <View style={styles.statsRow}>
        <Stat label="Total Trips" value={bookings.length} />
        <Stat label="Completed" value={completed} />
      </View>

      <Text style={styles.sectionTitle}>Recent Trips</Text>
      {bookings.slice(0, 5).map((b) => (
        <View key={b.id} style={styles.tripRow}>
          <Text style={styles.tripAddress} numberOfLines={1}>
            {b.pickupAddress} → {b.dropoffAddress}
          </Text>
          <Text style={styles.tripStatus}>{b.status}</Text>
        </View>
      ))}
      {!isLoading && bookings.length === 0 ? (
        <Text style={{ color: colors.muted }}>No trips yet.</Text>
      ) : null}
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 16 },
  statusCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  statusText: { fontSize: 13, fontWeight: "600" },
  availabilityCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  availabilityLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  availabilityHint: { fontSize: 12, color: colors.muted, marginTop: 2, maxWidth: 220 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  stat: {
    flex: 1,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  statValue: { fontSize: 20, fontWeight: "700", color: colors.text },
  statLabel: { fontSize: 12, color: colors.muted, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: colors.text, marginBottom: 10 },
  tripRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tripAddress: { color: colors.text, flex: 1, marginRight: 8 },
  tripStatus: { color: colors.muted, fontSize: 12, fontWeight: "600" },
});
