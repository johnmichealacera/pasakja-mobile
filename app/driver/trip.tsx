import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { TrackingMap } from "@/components/TrackingMap";
import { usePolling } from "@/hooks/usePolling";
import { listBookings, patchBooking, getPassengerLocation } from "@/api/bookings";
import type { LiveLocation } from "@/api/bookings";
import { postDriverLocation } from "@/api/location";
import { getRoute } from "@/api/maps";
import { ApiError } from "@/api/client";
import type { Booking, BookingStatus } from "@/types";
import { colors } from "@/theme";

const ACTIVE_STATUSES: BookingStatus[] = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"];
const BROADCAST_INTERVAL_MS = 10000;
const PASSENGER_POLL_MS = 10000;

const STATUS_LABEL: Record<BookingStatus, string> = {
  PENDING: "Pending",
  ACCEPTED: "Accepted — head to pickup",
  PICKED_UP: "Passenger picked up",
  IN_PROGRESS: "Trip in progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export default function DriverTripScreen() {
  const [trip, setTrip] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [passengerLocation, setPassengerLocation] = useState<LiveLocation | null>(null);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastBroadcastRef = useRef(0);

  const load = useCallback(async () => {
    try {
      const bookings = await listBookings();
      setTrip(bookings.find((b) => ACTIVE_STATUSES.includes(b.status)) ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Broadcast this driver's live GPS while a trip is active, scoped to this booking.
  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!trip) return;
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted || cancelled) return;
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: BROADCAST_INTERVAL_MS, distanceInterval: 15 },
        (position) => {
          const now = Date.now();
          if (now - lastBroadcastRef.current < BROADCAST_INTERVAL_MS) return;
          lastBroadcastRef.current = now;
          postDriverLocation(position.coords.latitude, position.coords.longitude, trip.id).catch(
            () => {}
          );
        }
      );
    }

    start();
    return () => {
      cancelled = true;
      watchRef.current?.remove();
      watchRef.current = null;
    };
  }, [trip?.id]);

  const refreshPassengerLocation = useCallback(async () => {
    if (!trip) return;
    try {
      setPassengerLocation(await getPassengerLocation(trip.id));
    } catch {
      // Non-critical — keep the last known position.
    }
  }, [trip]);

  usePolling(refreshPassengerLocation, PASSENGER_POLL_MS, !!trip);

  async function advance(next: "PICKED_UP" | "IN_PROGRESS") {
    if (!trip) return;
    setIsActing(true);
    try {
      const updated = await patchBooking(trip.id, { status: next });
      setTrip(updated);
    } catch (err) {
      Alert.alert("Could not update trip", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setIsActing(false);
    }
  }

  async function handleComplete() {
    if (!trip) return;
    setIsActing(true);
    try {
      let distance: number | undefined;
      try {
        const route = await getRoute(trip.pickupLat, trip.pickupLng, trip.dropoffLat, trip.dropoffLng);
        distance = route.distanceKm;
      } catch {
        // Best-effort — the server still completes the trip without a distance.
      }
      await patchBooking(trip.id, { status: "COMPLETED", distance });
      Alert.alert("Trip completed", "Fare has been finalized.");
      setTrip(null);
      load();
    } catch (err) {
      Alert.alert("Could not complete trip", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setIsActing(false);
    }
  }

  async function handleRelease() {
    if (!trip) return;
    setIsActing(true);
    try {
      await patchBooking(trip.id, { status: "PENDING" });
      setTrip(null);
      load();
    } catch (err) {
      Alert.alert("Could not release trip", err instanceof ApiError ? err.message : "Please try again.");
    } finally {
      setIsActing(false);
    }
  }

  if (!isLoading && !trip) {
    return (
      <Screen refreshControl={<RefreshControl refreshing={isLoading} onRefresh={load} />}>
        <Text style={styles.title}>Active Trip</Text>
        <Text style={{ color: colors.muted }}>
          No active trip — accept a request from the Requests tab to get started.
        </Text>
      </Screen>
    );
  }

  const hasPassengerFix = passengerLocation?.lat != null && passengerLocation?.lng != null;

  return (
    <Screen scroll={false}>
      {trip ? (
        <>
          <View style={styles.mapWrap}>
            <TrackingMap
              pickup={{ lat: trip.pickupLat, lng: trip.pickupLng }}
              dropoff={{ lat: trip.dropoffLat, lng: trip.dropoffLng }}
              liveMarker={
                hasPassengerFix
                  ? {
                      point: { lat: passengerLocation!.lat!, lng: passengerLocation!.lng! },
                      label: "Passenger",
                    }
                  : null
              }
            />
          </View>

          <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
          <Text style={styles.statusBadge}>{STATUS_LABEL[trip.status]}</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Passenger</Text>
            <Text style={styles.value}>{trip.passenger?.user?.name ?? "Passenger"}</Text>
            {trip.passenger?.user?.phone ? (
              <Text style={styles.subvalue}>{trip.passenger.user.phone}</Text>
            ) : null}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Pickup</Text>
            <Text style={styles.value}>{trip.pickupAddress}</Text>
            <Text style={[styles.label, { marginTop: 10 }]}>Dropoff</Text>
            <Text style={styles.value}>{trip.dropoffAddress}</Text>
          </View>

          {trip.notes ? (
            <View style={styles.card}>
              <Text style={styles.label}>Notes</Text>
              <Text style={styles.value}>{trip.notes}</Text>
            </View>
          ) : null}

          <View style={{ gap: 10, marginTop: 12 }}>
            {trip.status === "ACCEPTED" ? (
              <>
                <Button title="Confirm Pickup" onPress={() => advance("PICKED_UP")} loading={isActing} />
                <Button title="Release Booking" variant="outline" onPress={handleRelease} disabled={isActing} />
              </>
            ) : null}
            {trip.status === "PICKED_UP" ? (
              <Button title="Start Trip" onPress={() => advance("IN_PROGRESS")} loading={isActing} />
            ) : null}
            {trip.status === "IN_PROGRESS" ? (
              <Button title="Complete Trip" onPress={handleComplete} loading={isActing} />
            ) : null}
          </View>
          </ScrollView>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "700", color: colors.text, marginBottom: 12 },
  mapWrap: { height: "40%" },
  sheet: { flex: 1 },
  sheetContent: { padding: 20, paddingBottom: 40 },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.primary,
    color: "#fff",
    fontWeight: "700",
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 16,
  },
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
