import React, { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { listBookings } from "@/api/bookings";
import type { Booking, BookingStatus } from "@/types";
import { BOOKING_STATUS, PAYMENT_METHOD_ICON } from "@/lib/statusPresentation";
import { colors, radius, spacing, typography } from "@/theme";

const FILTERS: { label: string; value: BookingStatus | undefined }[] = [
  { label: "All", value: undefined },
  { label: "Pending", value: "PENDING" },
  { label: "Accepted", value: "ACCEPTED" },
  { label: "In Progress", value: "IN_PROGRESS" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminBookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filter, setFilter] = useState<BookingStatus | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  const load = useCallback(async (status?: BookingStatus) => {
    try {
      setBookings(await listBookings({ status, limit: 50 }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(filter);
    }, [filter, load])
  );

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => load(filter)} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.label}
            onPress={() => setFilter(f.value)}
            style={[styles.filterChip, filter === f.value && styles.filterChipActive]}
          >
            <Text style={[styles.filterText, filter === f.value && styles.filterTextActive]}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {bookings.map((b) => {
        const status = BOOKING_STATUS[b.status];
        return (
          <Card key={b.id} style={styles.card}>
            <View style={styles.rowBetween}>
              <Badge {...status} />
              <View style={styles.paymentBadge}>
                <Ionicons name={PAYMENT_METHOD_ICON[b.paymentMethod]} size={13} color={colors.inkMuted} />
                <Text style={styles.paymentText}>{b.paymentMethod === "CASH" ? "Cash" : "GCash"}</Text>
              </View>
            </View>
            <Text style={styles.name}>
              {b.passenger?.user?.name ?? "Passenger"} → {b.driver?.user?.name ?? "Unassigned"}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              {b.pickupAddress} → {b.dropoffAddress}
            </Text>
            <Text style={styles.fare}>{b.fare != null ? `₱${Number(b.fare).toFixed(2)}` : "—"}</Text>
          </Card>
        );
      })}
      {!isLoading && bookings.length === 0 ? (
        <EmptyState icon="receipt-outline" title="No bookings" subtitle="No bookings match this filter." />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: { marginBottom: spacing.lg, flexGrow: 0 },
  filterChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  filterChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  filterText: { ...typography.bodyStrong, fontSize: 13, color: colors.inkMuted },
  filterTextActive: { color: "#fff" },
  card: { marginBottom: spacing.md },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: spacing.sm },
  paymentBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  paymentText: { ...typography.caption, fontWeight: "600" },
  name: { ...typography.bodyStrong, marginBottom: 2 },
  address: { ...typography.caption, marginBottom: spacing.sm },
  fare: { ...typography.title, fontSize: 15 },
});
