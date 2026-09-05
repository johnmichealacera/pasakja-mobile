import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, type LatLng, type MapPressEvent } from "react-native-maps";
import { SOCORRO_INITIAL_REGION } from "@/constants/map";
import { colors } from "@/theme";
import type { NearbyDriver } from "@/types";

interface Point {
  lat: number;
  lng: number;
}

interface BookingMapProps {
  pickup: Point | null;
  dropoff: Point | null;
  /** Called with the tapped/dragged point — the caller decides whether it's the pickup or dropoff pin. */
  onSetPoint: (point: Point) => void;
  drivers?: NearbyDriver[];
  selectedDriverId?: string | null;
  onSelectDriver?: (driver: NearbyDriver) => void;
  routePolyline?: Point[];
}

export function BookingMap({
  pickup,
  dropoff,
  onSetPoint,
  drivers = [],
  selectedDriverId,
  onSelectDriver,
  routePolyline,
}: BookingMapProps) {
  function handlePress(event: MapPressEvent) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    onSetPoint({ lat: latitude, lng: longitude });
  }

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={SOCORRO_INITIAL_REGION}
        onPress={handlePress}
      >
        {pickup ? (
          <Marker
            coordinate={{ latitude: pickup.lat, longitude: pickup.lng }}
            pinColor={colors.success}
            title="Pickup"
            draggable
            onDragEnd={(e) =>
              onSetPoint({
                lat: e.nativeEvent.coordinate.latitude,
                lng: e.nativeEvent.coordinate.longitude,
              })
            }
          />
        ) : null}

        {dropoff ? (
          <Marker
            coordinate={{ latitude: dropoff.lat, longitude: dropoff.lng }}
            pinColor={colors.danger}
            title="Dropoff"
            draggable
            onDragEnd={(e) =>
              onSetPoint({
                lat: e.nativeEvent.coordinate.latitude,
                lng: e.nativeEvent.coordinate.longitude,
              })
            }
          />
        ) : null}

        {drivers.map((d) => (
          <Marker
            key={d.driverId}
            coordinate={{ latitude: d.lat, longitude: d.lng }}
            pinColor={d.driverId === selectedDriverId ? colors.teal : colors.warning}
            title={d.name}
            description={`${d.vehicleType} · ${d.etaMinutes ?? "?"} min away`}
            onPress={() => onSelectDriver?.(d)}
          />
        ))}

        {routePolyline && routePolyline.length > 1 ? (
          <Polyline
            coordinates={routePolyline.map(
              (p): LatLng => ({ latitude: p.lat, longitude: p.lng })
            )}
            strokeColor={colors.teal}
            strokeWidth={4}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
});
