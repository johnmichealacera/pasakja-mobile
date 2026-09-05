import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { EmptyState } from "@/components/EmptyState";
import { TrackingMap } from "@/components/TrackingMap";
import { usePolling } from "@/hooks/usePolling";
import { listBookings, patchBooking, getPassengerLocation } from "@/api/bookings";
import type { LiveLocation } from "@/api/bookings";
import { postDriverLocation } from "@/api/location";
import { getRoute } from "@/api/maps";
import { ApiError } from "@/api/client";
import type { Booking, BookingStatus } from "@/types";
import { BOOKING_STATUS } from "@/lib/statusPresentation";
import { colors, radius, spacing, typography } from "@/theme";

const ACTIVE_STATUSES: BookingStatus[] = ["ACCEPTED", "PICKED_UP", "IN_PROGRESS"];
const BROADCAST_INTERVAL_MS = 10000;
const PASSENGER_POLL_MS = 10000;

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
        <EmptyState
          icon="navigate-outline"
          title="No active trip"
          subtitle="Accept a request from the Requests tab to get started."
        />
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

          <View style={styles.sheetOuter}>
            <View style={styles.grabber} />
            <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
              <Badge {...BOOKING_STATUS[trip.status]} />

              <Card style={styles.passengerCard}>
                <Avatar name={trip.passenger?.user?.name} uri={trip.passenger?.user?.profileImage} size={44} />
                <View style={styles.passengerTextCol}>
                  <Text style={styles.value}>{trip.passenger?.user?.name ?? "Passenger"}</Text>
                  {trip.passenger?.user?.phone ? (
                    <Text style={styles.subvalue}>{trip.passenger.user.phone}</Text>
                  ) : null}
                </View>
                {trip.passenger?.user?.phone ? (
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${trip.passenger!.user.phone}`)}
                    style={styles.callButton}
                  >
                    <Ionicons name="call" size={18} color={colors.teal} />
                  </Pressable>
                ) : null}
              </Card>

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

              {trip.notes ? (
                <Card style={styles.notesCard}>
                  <Ionicons name="chatbubble-ellipses-outline" size={16} color={colors.inkFaint} />
                  <Text style={styles.notesText}>{trip.notes}</Text>
                </Card>
              ) : null}

              <View style={styles.actions}>
                {trip.status === "ACCEPTED" ? (
                  <>
                    <Button title="Confirm Pickup" icon="checkmark-circle" onPress={() => advance("PICKED_UP")} loading={isActing} />
                    <Button title="Release Booking" variant="outline" onPress={handleRelease} disabled={isActing} />
                  </>
                ) : null}
                {trip.status === "PICKED_UP" ? (
                  <Button title="Start Trip" icon="play-circle" onPress={() => advance("IN_PROGRESS")} loading={isActing} />
                ) : null}
                {trip.status === "IN_PROGRESS" ? (
                  <Button title="Complete Trip" icon="flag" onPress={handleComplete} loading={isActing} />
                ) : null}
              </View>
            </ScrollView>
          </View>
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.display, fontSize: 22, marginBottom: spacing.lg },
  mapWrap: { height: "40%" },
  sheetOuter: {
    flex: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    marginTop: -radius.xl,
  },
  grabber: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: radius.full,
    backgroundColor: colors.borderStrong,
    marginTop: spacing.sm,
  },
  sheet: { flex: 1 },
  sheetContent: { padding: spacing.xl, paddingBottom: 40, gap: spacing.md },
  passengerCard: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  passengerTextCol: { flex: 1 },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: "center",
    justifyContent: "center",
  },
  routeCard: {},
  routeRow: { flexDirection: "row", alignItems: "flex-start", gap: spacing.md },
  routeConnector: { width: 1, height: 14, backgroundColor: colors.border, marginLeft: 4, marginVertical: 2 },
  routeTextCol: { flex: 1 },
  notesCard: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  notesText: { ...typography.body, flex: 1 },
  label: { ...typography.caption },
  value: { ...typography.bodyStrong, marginTop: 2 },
  subvalue: { ...typography.caption, marginTop: 2 },
  actions: { gap: spacing.sm, marginTop: spacing.sm },
});
