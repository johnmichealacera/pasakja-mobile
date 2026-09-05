import React, { useCallback, useState } from "react";
import { Alert, RefreshControl, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { ScreenHeader } from "@/components/ScreenHeader";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import { usePolling } from "@/hooks/usePolling";
import { useDriverProfile } from "@/auth/DriverProfileContext";
import { listBookings, patchBooking } from "@/api/bookings";
import { ApiError } from "@/api/client";
import type { Booking } from "@/types";
import { PAYMENT_METHOD_ICON } from "@/lib/statusPresentation";
import { colors, radius, spacing, typography } from "@/theme";

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
    <View style={styles.flex}>
      <ScreenHeader title="Requests" subtitle={`${bookings.length} open right now`} />
      <Screen edges={["bottom"]} refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
        {driver?.status !== "VERIFIED" ? (
          <Card style={styles.notice}>
            <Ionicons name="hourglass-outline" size={16} color={colors.warning} />
            <Text style={styles.noticeText}>You need to be verified before you can accept rides.</Text>
          </Card>
        ) : null}

        {bookings.map((b) => {
          const isRequestedForMe = b.requestedDriverId === driver?.id;
          return (
            <Card key={b.id} style={[styles.card, isRequestedForMe && styles.cardHighlighted]}>
              {isRequestedForMe ? (
                <View style={styles.badge}>
                  <Ionicons name="star" size={11} color={colors.amberDark} />
                  <Text style={styles.badgeText}>Requested for you</Text>
                </View>
              ) : null}

              <View style={styles.routeRow}>
                <Ionicons name="ellipse" size={9} color={colors.emerald} />
                <Text style={styles.address} numberOfLines={1}>
                  {b.pickupAddress}
                </Text>
              </View>
              <View style={styles.routeConnector} />
              <View style={styles.routeRow}>
                <Ionicons name="location" size={12} color={colors.coral} />
                <Text style={styles.address} numberOfLines={1}>
                  {b.dropoffAddress}
                </Text>
              </View>

              <View style={styles.rowBetween}>
                <Text style={styles.fare}>
                  {b.quotedFare != null ? `₱${Number(b.quotedFare).toFixed(2)}` : "Fare TBD"}
                </Text>
                <View style={styles.paymentBadge}>
                  <Ionicons name={PAYMENT_METHOD_ICON[b.paymentMethod]} size={13} color={colors.inkMuted} />
                  <Text style={styles.paymentText}>{b.paymentMethod === "CASH" ? "Cash" : "GCash"}</Text>
                </View>
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
                    icon="checkmark-circle"
                    onPress={() => handleAccept(b.id)}
                    loading={actioningId === b.id}
                    disabled={driver?.status !== "VERIFIED"}
                  />
                </View>
              </View>
            </Card>
          );
        })}

        {!isLoading && bookings.length === 0 ? (
          <EmptyState icon="file-tray-outline" title="No open requests" subtitle="New ride requests will appear here." />
        ) : null}
      </Screen>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  notice: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  noticeText: { ...typography.bodyStrong, color: colors.warning, flex: 1 },
  card: { marginBottom: spacing.md },
  cardHighlighted: { borderColor: colors.amber, borderWidth: 1.5 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginBottom: spacing.sm,
  },
  badgeText: { ...typography.micro, color: colors.amberDark },
  routeRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  routeConnector: { width: 1, height: 10, backgroundColor: colors.border, marginLeft: 4, marginVertical: 1 },
  address: { ...typography.body, flex: 1 },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: spacing.sm },
  fare: { ...typography.title, fontSize: 16 },
  paymentBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  paymentText: { ...typography.caption, fontWeight: "600" },
  actions: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.md },
});
