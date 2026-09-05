import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { colors } from "@/theme";

interface Point {
  lat: number;
  lng: number;
}

interface TrackingMapProps {
  pickup: Point;
  dropoff: Point;
  /** The other party's live position — null while unavailable/stale. */
  liveMarker?: { point: Point; label: string } | null;
}

/** Read-only map for an in-progress trip: fixed pickup/dropoff pins + one live marker. */
export function TrackingMap({ pickup, dropoff, liveMarker }: TrackingMapProps) {
  const initialRegion = useMemo(
    () => ({
      latitude: pickup.lat,
      longitude: pickup.lng,
      latitudeDelta: 0.03,
      longitudeDelta: 0.03,
    }),
    [pickup.lat, pickup.lng]
  );

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={initialRegion}>
        <Marker
          coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
          pinColor={colors.success}
          title="Pickup"
        />
        <Marker
          coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
          pinColor={colors.danger}
          title="Dropoff"
        />
        {liveMarker ? (
          <Marker
            coordinate={{ latitude: liveMarker.point.lat, longitude: liveMarker.point.lng }}
            pinColor={colors.primary}
            title={liveMarker.label}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
});
