import React, { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { useAuth } from "@/auth/AuthContext";
import { listBookings } from "@/api/bookings";
import type { Booking } from "@/types";
import { PASSENGER_OPEN_BOOKING_STATUSES } from "@/lib/bookingGuards";
import { colors } from "@/theme";

export default function PassengerHomeScreen() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await listBookings();
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const activeBooking = bookings.find((b) =>
    PASSENGER_OPEN_BOOKING_STATUSES.includes(b.status)
  );
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      <Text style={styles.greeting}>Hi, {user?.name?.split(" ")[0] ?? "there"} 👋</Text>

      {activeBooking ? (
        <View style={styles.activeCard}>
          <Text style={styles.activeLabel}>Active ride — {activeBooking.status}</Text>
          <Text style={styles.activeAddress}>{activeBooking.dropoffAddress}</Text>
          <Button title="View Trip" onPress={() => router.push("/passenger/trip")} />
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ready to go?</Text>
          <Button title="Book a Ride" onPress={() => router.push("/passenger/book")} />
        </View>
      )}

      <View style={styles.statsRow}>
        <Stat label="Total Trips" value={bookings.length} />
        <Stat label="Completed" value={completed} />
        <Stat label="Pending" value={pending} />
      </View>

      <Text style={styles.sectionTitle}>Recent Trips</Text>
      {bookings.slice(0, 5).map((b) => (
        <View key={b.id} style={styles.tripRow}>
          <Text style={styles.tripAddress} numberOfLines={1}>
            {b.dropoffAddress}
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
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "600", color: colors.text },
  activeCard: {
    backgroundColor: "#ecfeff",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    padding: 18,
    marginBottom: 20,
    gap: 8,
  },
  activeLabel: { color: colors.primary, fontWeight: "700" },
  activeAddress: { color: colors.text, marginBottom: 8 },
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
