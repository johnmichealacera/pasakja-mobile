import React from "react";
import { StyleSheet, View } from "react-native";
import { Map, Camera, Marker, type LngLat } from "@maplibre/maplibre-react-native";
import { MAP_STYLE_URL } from "@/constants/mapStyle";
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

function toLngLat(p: Point): LngLat {
  return [p.lng, p.lat];
}

function Pin({ color }: { color: string }) {
  return <View style={[styles.dot, { backgroundColor: color }]} />;
}

/** Read-only map for an in-progress trip: fixed pickup/dropoff pins + one live marker. Free CartoDB tiles via MapLibre — no API key needed. */
export function TrackingMap({ pickup, dropoff, liveMarker }: TrackingMapProps) {
  return (
    <View style={styles.container}>
      <Map style={StyleSheet.absoluteFill} mapStyle={MAP_STYLE_URL}>
        <Camera initialViewState={{ center: toLngLat(pickup), zoom: 15 }} />

        <Marker lngLat={toLngLat(pickup)} id="pickup">
          <Pin color={colors.success} />
        </Marker>
        <Marker lngLat={toLngLat(dropoff)} id="dropoff">
          <Pin color={colors.coral} />
        </Marker>
        {liveMarker ? (
          <Marker lngLat={toLngLat(liveMarker.point)} id="live">
            <Pin color={colors.teal} />
          </Marker>
        ) : null}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
});
