import React, { useCallback, useState } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { router, useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { TrackingMap } from "@/components/TrackingMap";
import { TripStatusTimeline } from "@/components/TripStatusTimeline";
import { usePolling } from "@/hooks/usePolling";
import { usePassengerLocationBroadcast } from "@/hooks/usePassengerLocationBroadcast";
import { listBookings, patchBooking, getDriverLocation } from "@/api/bookings";
import type { LiveLocation } from "@/api/bookings";
import { PASSENGER_OPEN_BOOKING_STATUSES } from "@/lib/bookingGuards";
import { ApiError } from "@/api/client";
import type { Booking } from "@/types";
import { colors } from "@/theme";

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
          <ActivityIndicator />
        </View>
      </Screen>
    );
  }

  if (!trip) {
    return (
      <Screen>
        <Text style={styles.title}>No Active Trip</Text>
        <Text style={{ color: colors.muted, marginBottom: 20 }}>
          Book a ride to see live tracking here.
        </Text>
        <Button title="Book a Ride" onPress={() => router.replace("/passenger/book")} />
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
          <Text style={styles.waiting}>Waiting for a driver to accept your request…</Text>
        ) : null}

        {trip.status === "ACCEPTED" && driverLocation?.etaMinutes != null ? (
          <Text style={styles.eta}>Driver is about {driverLocation.etaMinutes} min away</Text>
        ) : null}

        {trip.driver?.user ? (
          <View style={styles.card}>
            <Text style={styles.label}>Driver</Text>
            <Text style={styles.value}>{trip.driver.user.name}</Text>
            <Text style={styles.subvalue}>
              {trip.driver.vehicleType} · {trip.driver.vehiclePlate}
            </Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Pickup</Text>
          <Text style={styles.value}>{trip.pickupAddress}</Text>
          <Text style={[styles.label, { marginTop: 10 }]}>Dropoff</Text>
          <Text style={styles.value}>{trip.dropoffAddress}</Text>
        </View>

        {canCancel ? (
          <Button title="Cancel Ride" variant="danger" onPress={handleCancel} loading={isCancelling} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 8 },
  mapWrap: { height: "45%" },
  sheet: { padding: 20 },
  waiting: { color: colors.warning, fontWeight: "600", marginBottom: 16 },
  eta: { color: colors.primary, fontWeight: "700", marginBottom: 16 },
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  label: { fontSize: 12, color: colors.muted },
  value: { fontSize: 15, color: colors.text, fontWeight: "600", marginTop: 2 },
  subvalue: { fontSize: 13, color: colors.muted, marginTop: 2 },
});
