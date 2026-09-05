import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { BookingMap } from "@/components/BookingMap";
import { DestinationSearchModal } from "@/components/DestinationSearchModal";
import { useCurrentLocation } from "@/hooks/useCurrentLocation";
import { usePolling } from "@/hooks/usePolling";
import { getRoute, reverseGeocode } from "@/api/maps";
import { estimateFare } from "@/api/fares";
import { getNearbyDrivers } from "@/api/drivers";
import { createBooking } from "@/api/bookings";
import { checkout, attachGcash, pollPaymentStatus } from "@/api/paymongo";
import { ApiError } from "@/api/client";
import type { FareEstimate, NearbyDriver, PaymentMethod, RouteResult } from "@/types";
import type { SocorroPlace } from "@/lib/socorroPlaces";
import { colors } from "@/theme";

const MIN_GCASH_CENTAVOS = 2000; // ₱20 — PayMongo checkout's own floor

interface Point {
  lat: number;
  lng: number;
}

type Field = "pickup" | "dropoff";

export default function BookRideScreen() {
  const { location: gpsLocation } = useCurrentLocation();

  const [pickup, setPickup] = useState<Point | null>(null);
  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoff, setDropoff] = useState<Point | null>(null);
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [activeField, setActiveField] = useState<Field>("dropoff");
  const [searchModalFor, setSearchModalFor] = useState<Field | null>(null);

  const [route, setRoute] = useState<RouteResult | null>(null);
  const [fare, setFare] = useState<FareEstimate | null>(null);
  const [isQuoting, setIsQuoting] = useState(false);

  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyDriver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const [isShared, setIsShared] = useState(false);
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [isBooking, setIsBooking] = useState(false);

  // Seed pickup from GPS once, unless the passenger has already set one manually.
  useEffect(() => {
    if (gpsLocation && !pickup) {
      applyPoint("pickup", gpsLocation);
    }
  }, [gpsLocation]);

  async function applyPoint(field: Field, point: Point, placeName?: string) {
    if (field === "pickup") {
      setPickup(point);
      setPickupAddress(placeName ?? "Locating address…");
    } else {
      setDropoff(point);
      setDropoffAddress(placeName ?? "Locating address…");
    }

    if (!placeName) {
      try {
        const { address } = await reverseGeocode(point.lat, point.lng, field);
        if (field === "pickup") setPickupAddress(address);
        else setDropoffAddress(address);
      } catch {
        const fallback = `${point.lat.toFixed(5)}, ${point.lng.toFixed(5)}`;
        if (field === "pickup") setPickupAddress(fallback);
        else setDropoffAddress(fallback);
      }
    }
  }

  function handleMapPoint(point: Point) {
    applyPoint(activeField, point);
  }

  function handleSelectPlace(place: SocorroPlace) {
    const field = searchModalFor ?? activeField;
    applyPoint(field, { lat: place.lat, lng: place.lng }, place.name);
  }

  // Quote route + fare whenever both points are set.
  useEffect(() => {
    if (!pickup || !dropoff) {
      setRoute(null);
      setFare(null);
      return;
    }
    let cancelled = false;
    setIsQuoting(true);
    (async () => {
      try {
        const routeResult = await getRoute(pickup.lat, pickup.lng, dropoff.lat, dropoff.lng);
        if (cancelled) return;
        setRoute(routeResult);
        const fareResult = await estimateFare(routeResult.distanceKm);
        if (cancelled) return;
        setFare(fareResult);
      } catch (err) {
        if (cancelled) return;
        setFare(null);
        Alert.alert(
          "Could not get a fare estimate",
          err instanceof ApiError ? err.message : "Please try again."
        );
      } finally {
        if (!cancelled) setIsQuoting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [pickup, dropoff]);

  const refreshNearbyDrivers = useCallback(async () => {
    if (!pickup) return;
    try {
      setNearbyDrivers(await getNearbyDrivers(pickup.lat, pickup.lng));
    } catch {
      // Non-critical — keep showing the last known list.
    }
  }, [pickup]);

  usePolling(refreshNearbyDrivers, 15000, !!pickup);

  function handleSelectDriver(driver: NearbyDriver) {
    setSelectedDriverId((current) => (current === driver.driverId ? null : driver.driverId));
  }

  async function handleConfirmCash() {
    if (!pickup || !dropoff || !fare) return;

    setIsBooking(true);
    try {
      await createBooking({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupAddress,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        dropoffAddress,
        quotedFare: fare.passengerTotal,
        paymentMethod: "CASH",
        isShared,
        requestedDriverId: selectedDriverId ?? undefined,
        notes: notes || undefined,
      });
      Alert.alert("Ride booked!", "Waiting for a driver to accept your request.");
      router.replace("/passenger/trip");
    } catch (err) {
      Alert.alert(
        "Could not book your ride",
        err instanceof ApiError ? err.message : "Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  }

  async function handleConfirmGcash() {
    if (!pickup || !dropoff || !fare) return;
    if (fare.centavos < MIN_GCASH_CENTAVOS) {
      Alert.alert("Amount too small", "GCash requires a minimum of ₱20.00 — try a longer trip or pay cash.");
      return;
    }

    setIsBooking(true);
    try {
      const { paymentIntentId, clientKey } = await checkout({
        pickupLat: pickup.lat,
        pickupLng: pickup.lng,
        pickupAddress,
        dropoffLat: dropoff.lat,
        dropoffLng: dropoff.lng,
        dropoffAddress,
        isShared,
        notes: notes || undefined,
        estimatedFare: fare.baseFare,
        centavos: fare.centavos,
      });

      const returnUrl = Linking.createURL("payment-return");
      const { redirectUrl } = await attachGcash(paymentIntentId, clientKey, returnUrl);
      if (!redirectUrl) {
        throw new Error("PayMongo did not return a GCash redirect URL.");
      }

      await WebBrowser.openAuthSessionAsync(redirectUrl, returnUrl);

      const isPaid = await pollPaymentStatus(paymentIntentId);
      if (isPaid) {
        Alert.alert("Payment received!", "Waiting for a driver to accept your request.");
      } else {
        Alert.alert(
          "Payment not confirmed yet",
          "If you completed the GCash payment, it may take a moment to reflect. Check My Trips shortly, or cancel the ride there if it didn't go through."
        );
      }
      router.replace("/passenger/trip");
    } catch (err) {
      Alert.alert(
        "GCash checkout failed",
        err instanceof ApiError || err instanceof Error ? err.message : "Please try again."
      );
    } finally {
      setIsBooking(false);
    }
  }

  const handleConfirm = paymentMethod === "CASH" ? handleConfirmCash : handleConfirmGcash;
  const canConfirm = !!pickup && !!dropoff && !!fare && !isBooking;

  return (
    <Screen scroll={false}>
      <View style={styles.mapWrap}>
        <BookingMap
          pickup={pickup}
          dropoff={dropoff}
          onSetPoint={handleMapPoint}
          drivers={nearbyDrivers}
          selectedDriverId={selectedDriverId}
          onSelectDriver={handleSelectDriver}
          routePolyline={route?.polyline}
        />
      </View>

      <ScrollView style={styles.sheet} contentContainerStyle={styles.sheetContent}>
        <View style={styles.fieldToggle}>
          <FieldButton
            label="📍 Pickup"
            active={activeField === "pickup"}
            onPress={() => setActiveField("pickup")}
          />
          <FieldButton
            label="🏁 Dropoff"
            active={activeField === "dropoff"}
            onPress={() => setActiveField("dropoff")}
          />
        </View>
        <Text style={styles.hint}>
          Tap the map (or drag a pin) to set the highlighted point, or search a place below.
        </Text>

        <AddressRow
          label="Pickup"
          address={pickupAddress}
          onSearch={() => setSearchModalFor("pickup")}
        />
        <AddressRow
          label="Dropoff"
          address={dropoffAddress}
          onSearch={() => setSearchModalFor("dropoff")}
        />

        {isQuoting ? (
          <View style={styles.quotingRow}>
            <ActivityIndicator />
            <Text style={styles.quotingText}>Getting route and fare…</Text>
          </View>
        ) : null}

        {route && fare ? (
          <View style={styles.fareCard}>
            <Text style={styles.fareTitle}>
              {route.distanceKm.toFixed(1)} km · ~{route.durationMinutes} min
            </Text>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Trip fare</Text>
              <Text style={styles.fareValue}>₱{fare.baseFare.toFixed(2)}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Platform fee</Text>
              <Text style={styles.fareValue}>₱{fare.platformFee.toFixed(2)}</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabelTotal}>You pay</Text>
              <Text style={styles.fareValueTotal}>₱{fare.passengerTotal.toFixed(2)}</Text>
            </View>
          </View>
        ) : null}

        {nearbyDrivers.length > 0 ? (
          <>
            <Text style={styles.sectionTitle}>Nearby Drivers ({nearbyDrivers.length})</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {nearbyDrivers.map((d) => (
                <Pressable
                  key={d.driverId}
                  onPress={() => handleSelectDriver(d)}
                  style={[
                    styles.driverChip,
                    selectedDriverId === d.driverId && styles.driverChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.driverChipName,
                      selectedDriverId === d.driverId && styles.driverChipTextActive,
                    ]}
                  >
                    {d.name}
                  </Text>
                  <Text
                    style={[
                      styles.driverChipMeta,
                      selectedDriverId === d.driverId && styles.driverChipTextActive,
                    ]}
                  >
                    {d.vehicleType} · {d.etaMinutes ?? "?"} min
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        ) : null}

        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Shared ride</Text>
          <Switch value={isShared} onValueChange={setIsShared} />
        </View>

        <Text style={styles.label}>Notes for the driver (optional)</Text>
        <TextInput
          style={styles.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. Meet me at the covered court entrance"
          placeholderTextColor={colors.muted}
          multiline
        />

        <Text style={styles.label}>Payment</Text>
        <View style={styles.fieldToggle}>
          <FieldButton
            label="💵 Cash"
            active={paymentMethod === "CASH"}
            onPress={() => setPaymentMethod("CASH")}
          />
          <FieldButton
            label="📱 GCash"
            active={paymentMethod === "ONLINE"}
            onPress={() => setPaymentMethod("ONLINE")}
          />
        </View>

        <Button
          title={
            isBooking ? "Booking…" : paymentMethod === "CASH" ? "Confirm Booking" : "Pay with GCash"
          }
          onPress={handleConfirm}
          disabled={!canConfirm}
          loading={isBooking}
        />
      </ScrollView>

      <DestinationSearchModal
        visible={searchModalFor !== null}
        title={searchModalFor === "pickup" ? "Set Pickup" : "Set Dropoff"}
        onClose={() => setSearchModalFor(null)}
        onSelect={handleSelectPlace}
      />
    </Screen>
  );
}

function FieldButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.fieldButton, active && styles.fieldButtonActive]}
    >
      <Text style={[styles.fieldButtonText, active && styles.fieldButtonTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function AddressRow({
  label,
  address,
  onSearch,
}: {
  label: string;
  address: string;
  onSearch: () => void;
}) {
  return (
    <View style={styles.addressRow}>
      <View style={{ flex: 1 }}>
        <Text style={styles.addressLabel}>{label}</Text>
        <Text style={styles.addressValue} numberOfLines={1}>
          {address || "Not set"}
        </Text>
      </View>
      <Pressable onPress={onSearch}>
        <Text style={styles.searchLink}>Search</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: { height: "42%" },
  sheet: { flex: 1 },
  sheetContent: { padding: 20, paddingBottom: 40 },
  fieldToggle: { flexDirection: "row", gap: 10, marginBottom: 10 },
  fieldButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
  },
  fieldButtonActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  fieldButtonText: { color: colors.text, fontWeight: "600" },
  fieldButtonTextActive: { color: "#fff" },
  hint: { fontSize: 12, color: colors.muted, marginBottom: 16 },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  addressLabel: { fontSize: 12, color: colors.muted },
  addressValue: { fontSize: 14, color: colors.text, fontWeight: "600" },
  searchLink: { color: colors.primary, fontWeight: "600", marginLeft: 12 },
  quotingRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 },
  quotingText: { color: colors.muted },
  fareCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  fareTitle: { fontWeight: "700", color: colors.text, marginBottom: 10 },
  fareRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 4 },
  fareLabel: { color: colors.muted },
  fareValue: { color: colors.text },
  fareLabelTotal: { color: colors.text, fontWeight: "700", marginTop: 6 },
  fareValueTotal: { color: colors.text, fontWeight: "700", marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: "700", color: colors.text, marginTop: 20, marginBottom: 10 },
  driverChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    minWidth: 120,
  },
  driverChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  driverChipName: { fontWeight: "600", color: colors.text },
  driverChipMeta: { fontSize: 12, color: colors.muted, marginTop: 2 },
  driverChipTextActive: { color: "#fff" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
  },
  label: { fontSize: 14, fontWeight: "600", color: colors.text, marginBottom: 8, marginTop: 12 },
  notesInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: 12,
    color: colors.text,
    minHeight: 60,
    marginBottom: 12,
  },
});
