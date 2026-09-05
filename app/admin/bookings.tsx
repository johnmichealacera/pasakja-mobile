import React, { useCallback, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { listBookings } from "@/api/bookings";
import type { Booking, BookingStatus } from "@/types";
import { colors } from "@/theme";

const STATUS_COLORS: Record<BookingStatus, string> = {
  PENDING: colors.warning,
  ACCEPTED: colors.primary,
  PICKED_UP: colors.primary,
  IN_PROGRESS: colors.primary,
  COMPLETED: colors.success,
  CANCELLED: colors.danger,
};

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

      {bookings.map((b) => (
        <View key={b.id} style={styles.card}>
          <View style={styles.rowBetween}>
            <Text style={[styles.status, { color: STATUS_COLORS[b.status] }]}>{b.status}</Text>
            <Text style={styles.payment}>{b.paymentMethod}</Text>
          </View>
          <Text style={styles.name}>
            {b.passenger?.user?.name ?? "Passenger"} → {b.driver?.user?.name ?? "Unassigned"}
          </Text>
          <Text style={styles.address} numberOfLines={1}>
            {b.pickupAddress} → {b.dropoffAddress}
          </Text>
          <Text style={styles.fare}>{b.fare != null ? `₱${Number(b.fare).toFixed(2)}` : "—"}</Text>
        </View>
      ))}
      {!isLoading && bookings.length === 0 ? (
        <Text style={{ color: colors.muted }}>No bookings match this filter.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filterRow: { marginBottom: 16, flexGrow: 0 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  filterTextActive: { color: "#fff" },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  status: { fontWeight: "700" },
  payment: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  name: { color: colors.text, fontWeight: "600", marginBottom: 2 },
  address: { color: colors.muted, fontSize: 13, marginBottom: 4 },
  fare: { color: colors.text, fontWeight: "700" },
});
