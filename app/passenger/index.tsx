import React, { useCallback, useState } from "react";
import { RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { StatTile } from "@/components/StatTile";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/auth/AuthContext";
import { listBookings } from "@/api/bookings";
import type { Booking } from "@/types";
import { PASSENGER_OPEN_BOOKING_STATUSES } from "@/lib/bookingGuards";
import { BOOKING_STATUS } from "@/lib/statusPresentation";
import { colors, radius, spacing, typography } from "@/theme";

function timeOfDayGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function PassengerHomeScreen() {
  const { user } = useAuth();
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

  const activeBooking = bookings.find((b) => PASSENGER_OPEN_BOOKING_STATUSES.includes(b.status));
  const completed = bookings.filter((b) => b.status === "COMPLETED").length;
  const pending = bookings.filter((b) => b.status === "PENDING").length;

  return (
    <View style={styles.flex}>
      <ScreenHeader
        title={`${timeOfDayGreeting()}, ${user?.name?.split(" ")[0] ?? "there"}`}
        subtitle="Where are you headed today?"
      />
      <Screen edges={["bottom"]} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
        {activeBooking ? (
          <Card variant="elevated" style={styles.activeCard}>
            <Badge {...BOOKING_STATUS[activeBooking.status]} />
            <Text style={styles.activeAddress} numberOfLines={1}>
              {activeBooking.dropoffAddress}
            </Text>
            <Button title="View Trip" icon="navigate" onPress={() => router.push("/passenger/trip")} />
          </Card>
        ) : (
          <Card variant="elevated" style={styles.promptCard}>
            <View style={styles.promptIconWrap}>
              <Ionicons name="car-sport" size={24} color={colors.teal} />
            </View>
            <View style={styles.promptTextCol}>
              <Text style={styles.promptTitle}>Ready to go?</Text>
              <Text style={styles.promptSubtitle}>Book a tricycle, habal-habal, or bao-bao.</Text>
            </View>
          </Card>
        )}
        {!activeBooking ? (
          <View style={styles.bookButtonWrap}>
            <Button title="Book a Ride" icon="add-circle" onPress={() => router.push("/passenger/book")} />
          </View>
        ) : null}

        <View style={styles.statsRow}>
          <StatTile icon="receipt-outline" value={bookings.length} label="Total Trips" tone="teal" />
          <StatTile icon="checkmark-done-outline" value={completed} label="Completed" tone="emerald" />
          <StatTile icon="time-outline" value={pending} label="Pending" tone="amber" />
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
                  {b.dropoffAddress}
                </Text>
                <Text style={[styles.tripStatusLabel, { color: status.color }]}>{status.label}</Text>
              </View>
            </Card>
          );
        })}
        {!isLoading && bookings.length === 0 ? (
          <EmptyState
            icon="map-outline"
            title="No trips yet"
            subtitle="Your first ride will show up here once you book one."
          />
        ) : null}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  activeCard: { gap: spacing.sm, marginBottom: spacing.lg },
  activeAddress: { ...typography.title, fontSize: 17 },
  promptCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  promptIconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  promptTextCol: { flex: 1 },
  promptTitle: { ...typography.title, fontSize: 17 },
  promptSubtitle: { ...typography.caption, marginTop: 2 },
  bookButtonWrap: { marginBottom: spacing.lg },
  statsRow: { flexDirection: "row", gap: spacing.sm, marginBottom: spacing.xl },
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
