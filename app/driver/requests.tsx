import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { usePolling } from "@/hooks/usePolling";
import { useDriverProfile } from "@/auth/DriverProfileContext";
import { listBookings, patchBooking } from "@/api/bookings";
import { ApiError } from "@/api/client";
import type { Booking } from "@/types";
import { colors } from "@/theme";

export default function DriverRequestsScreen() {
  const { driver } = useDriverProfile();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actioningId, setActioningId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const pending = await listBookings({ status: "PENDING" });
      // Hide requests locked to a different driver — accepting them would 403 anyway.
      setBookings(
        pending.filter((b) => !b.requestedDriverId || b.requestedDriverId === driver?.id)
      );
    } finally {
      setIsLoading(false);
    }
  }, [driver?.id]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  usePolling(load, 10000, true);

  async function handleAccept(id: string) {
    setActioningId(id);
    try {
      await patchBooking(id, { status: "ACCEPTED" });
      router.push("/driver/trip");
    } catch (err) {
      Alert.alert(
        "Could not accept",
        err instanceof ApiError ? err.message : "This ride may no longer be available."
      );
      load();
    } finally {
      setActioningId(null);
    }
  }

  async function handleDecline(id: string) {
    setActioningId(id);
    try {
      await patchBooking(id, { action: "reject_request" });
      load();
    } catch (err) {
      Alert.alert("Could not decline", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setActioningId(null);
    }
  }

  return (
    <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
      <Text style={styles.title}>Booking Requests</Text>

      {driver?.status !== "VERIFIED" ? (
        <Text style={styles.notice}>You need to be verified before you can accept rides.</Text>
      ) : null}

      {bookings.map((b) => {
        const isRequestedForMe = b.requestedDriverId === driver?.id;
        return (
          <View key={b.id} style={[styles.card, isRequestedForMe && styles.cardHighlighted]}>
            {isRequestedForMe ? <Text style={styles.badge}>Requested for you</Text> : null}
            <Text style={styles.address} numberOfLines={1}>
              📍 {b.pickupAddress}
            </Text>
            <Text style={styles.address} numberOfLines={1}>
              🏁 {b.dropoffAddress}
            </Text>
            <View style={styles.rowBetween}>
              <Text style={styles.fare}>
                {b.quotedFare != null ? `₱${Number(b.quotedFare).toFixed(2)}` : "Fare TBD"}
              </Text>
              <Text style={styles.paymentBadge}>{b.paymentMethod}</Text>
            </View>
            <View style={styles.actions}>
              {isRequestedForMe ? (
                <View style={{ flex: 1 }}>
                  <Button
                    title="Decline"
                    variant="outline"
                    onPress={() => handleDecline(b.id)}
                    loading={actioningId === b.id}
                    disabled={driver?.status !== "VERIFIED"}
                  />
                </View>
              ) : null}
              <View style={{ flex: 1 }}>
                <Button
                  title="Accept"
                  onPress={() => handleAccept(b.id)}
                  loading={actioningId === b.id}
                  disabled={driver?.status !== "VERIFIED"}
                />
              </View>
            </View>
          </View>
        );
      })}

      {!isLoading && bookings.length === 0 ? (
        <Text style={{ color: colors.muted }}>No open requests right now.</Text>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", color: colors.text, marginBottom: 12 },
  notice: {
    color: colors.warning,
    fontSize: 13,
    marginBottom: 16,
    fontWeight: "600",
  },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    gap: 6,
  },
  cardHighlighted: { borderColor: colors.warning, borderWidth: 2 },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#fffbeb",
    color: colors.warning,
    fontSize: 11,
    fontWeight: "700",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 4,
  },
  address: { color: colors.text },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  fare: { fontWeight: "700", color: colors.text },
  paymentBadge: { color: colors.muted, fontSize: 12, fontWeight: "600" },
  actions: { flexDirection: "row", gap: 10, marginTop: 8 },
});
