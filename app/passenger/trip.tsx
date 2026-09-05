import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { EmptyState } from "@/components/EmptyState";
import { TrackingMap } from "@/components/TrackingMap";
import { TripStatusTimeline } from "@/components/TripStatusTimeline";
import { usePolling } from "@/hooks/usePolling";
import { usePassengerLocationBroadcast } from "@/hooks/usePassengerLocationBroadcast";
import { listBookings, patchBooking, getDriverLocation } from "@/api/bookings";
import type { LiveLocation } from "@/api/bookings";
import { PASSENGER_OPEN_BOOKING_STATUSES } from "@/lib/bookingGuards";
import { ApiError } from "@/api/client";
import type { Booking } from "@/types";
import { colors, radius, spacing, typography } from "@/theme";

const DRIVER_POLL_MS = 10000;
const LIVE_STATUSES: Booking["status"][] = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"];

export default function PassengerTripScreen() {
  const [trip, setTrip] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [driverLocation, setDriverLocation] = useState<LiveLocation | null>(null);

  const load = useCallback(async () => {
    try {
      const bookings = await listBookings();
      setTrip(bookings.find((b) => PASSENGER_OPEN_BOOKING_STATUSES.includes(b.status)) ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const refreshDriverLocation = useCallback(async () => {
    if (!trip || !LIVE_STATUSES.includes(trip.status)) return;
    try {
      setDriverLocation(await getDriverLocation(trip.id));
    } catch {
      // Non-critical — keep the last known position.
    }
  }, [trip]);

  usePolling(refreshDriverLocation, DRIVER_POLL_MS, !!trip && LIVE_STATUSES.includes(trip.status));
  usePassengerLocationBroadcast(trip && LIVE_STATUSES.includes(trip.status) ? trip.id : null);

  async function handleCancel() {
    if (!trip) return;
    setIsCancelling(true);
    try {
      await patchBooking(trip.id, { status: "CANCELLED" });
      Alert.alert("Ride cancelled");
      setTrip(null);
      load();
    } catch (err) {
      Alert.alert("Could not cancel", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setIsCancelling(false);
    }
  }

  if (isLoading) {
    return (
      <Screen scroll={false}>
        <View style={styles.center}>
          <ActivityIndicator color={colors.teal} />
        </View>
      </Screen>
    );
  }

  if (!trip) {
    return (
      <Screen>
        <Text style={styles.title}>Your Trip</Text>
        <EmptyState
          icon="navigate-outline"
          title="No active trip"
          subtitle="Book a ride to see live tracking here."
        />
        <View style={styles.spacer} />
        <Button title="Book a Ride" icon="add-circle" onPress={() => router.replace("/passenger/book")} />
      </Screen>
    );
  }

  const canCancel = trip.status === "PENDING" || trip.status === "ACCEPTED";
  const showMap = LIVE_STATUSES.includes(trip.status);
  const hasDriverFix = driverLocation?.lat != null && driverLocation?.lng != null;

  return (
    <Screen scroll={!showMap}>
      {showMap ? (
        <View style={styles.mapWrap}>
          <TrackingMap
            pickup={{ lat: trip.pickupLat, lng: trip.pickupLng }}
            dropoff={{ lat: trip.dropoffLat, lng: trip.dropoffLng }}
            liveMarker={
              hasDriverFix
                ? { point: { lat: driverLocation!.lat!, lng: driverLocation!.lng! }, label: "Driver" }
                : null
            }
          />
        </View>
      ) : null}

      <View style={showMap ? styles.sheet : undefined}>
        <TripStatusTimeline status={trip.status} />

        {trip.status === "PENDING" ? (
          <View style={styles.waitingRow}>
            <ActivityIndicator size="small" color={colors.warning} />
            <Text style={styles.waiting}>Finding a driver near you…</Text>
          </View>
        ) : null}

        {trip.status === "ACCEPTED" && driverLocation?.etaMinutes != null ? (
          <View style={styles.etaBadge}>
            <Ionicons name="time" size={14} color={colors.teal} />
            <Text style={styles.eta}>Driver is about {driverLocation.etaMinutes} min away</Text>
          </View>
        ) : null}

        {trip.driver?.user ? (
          <Card style={styles.driverCard}>
            <Avatar name={trip.driver.user.name} uri={trip.driver.user.profileImage} size={48} />
            <View style={styles.driverTextCol}>
              <Text style={styles.value}>{trip.driver.user.name}</Text>
              <Text style={styles.subvalue}>
                {trip.driver.vehicleType} · {trip.driver.vehiclePlate}
              </Text>
            </View>
          </Card>
        ) : null}

        <Card style={styles.routeCard}>
          <View style={styles.routeRow}>
            <Ionicons name="ellipse" size={10} color={colors.emerald} />
            <View style={styles.routeTextCol}>
              <Text style={styles.label}>Pickup</Text>
              <Text style={styles.value}>{trip.pickupAddress}</Text>
            </View>
          </View>
          <View style={styles.routeConnector} />
          <View style={styles.routeRow}>
            <Ionicons name="location" size={13} color={colors.coral} />
            <View style={styles.routeTextCol}>
              <Text style={styles.label}>Dropoff</Text>
              <Text style={styles.value}>{trip.dropoffAddress}</Text>
            </View>
          </View>
        </Card>

        {canCancel ? (
          <Button title="Cancel Ride" variant="danger" icon="close-circle-outline" onPress={handleCancel} loading={isCancelling} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { ...typography.display, fontSize: 22, marginBottom: spacing.lg },
  spacer: { height: spacing.lg },
  mapWrap: { height: "45%" },
  sheet: { padding: spacing.xl },
  waitingRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginBottom: spacing.lg },
  waiting: { ...typography.bodyStrong, color: colors.warning },
  etaBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    marginBottom: spacing.lg,
  },
  eta: { ...typography.bodyStrong, color: colors.teal },
  driverCard: { flexDirection: "row", alignItems: "center", gap: spacing.md, marginBottom: spacing.md },
  driverTextCol: { flex: 1 },
  routeCard: { marginBottom: spacing.lg },
  routeRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  routeConnector: { width: 1, height: 14, backgroundColor: colors.border, marginLeft: 4, marginVertical: 2 },
  routeTextCol: { flex: 1 },
  label: { ...typography.caption },
  value: { ...typography.bodyStrong, marginTop: 2 },
  subvalue: { ...typography.caption, marginTop: 2 },
});
