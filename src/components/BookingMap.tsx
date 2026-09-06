import { StyleSheet, View } from "react-native";
import {
  Map,
  Camera,
  Marker,
  GeoJSONSource,
  Layer,
  type LngLat,
  type PressEvent,
} from "@maplibre/maplibre-react-native";
import type { NativeSyntheticEvent } from "react-native";
import { MAP_STYLE_URL } from "@/constants/mapStyle";
import { SOCORRO_CENTER_LNGLAT, SOCORRO_BOUNDS, DEFAULT_ZOOM } from "@/constants/map";
import { ALL_SOCORRO_PLACES } from "@/lib/socorroPlaces";
import { colors } from "@/theme";
import type { NearbyDriver } from "@/types";

const PLACES_GEOJSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: ALL_SOCORRO_PLACES.map((p) => ({
    type: "Feature",
    properties: { name: p.name },
    geometry: { type: "Point", coordinates: [p.lng, p.lat] },
  })),
};

interface Point {
  lat: number;
  lng: number;
}

interface BookingMapProps {
  pickup: Point | null;
  dropoff: Point | null;
  /** Called with the tapped point — the caller decides whether it's the pickup or dropoff pin. */
  onSetPoint: (point: Point) => void;
  drivers?: NearbyDriver[];
  selectedDriverId?: string | null;
  onSelectDriver?: (driver: NearbyDriver) => void;
  routePolyline?: Point[];
}

function toLngLat(p: Point): LngLat {
  return [p.lng, p.lat];
}

function Pin({ color }: { color: string }) {
  return <View style={[pinStyles.dot, { backgroundColor: color }]} />;
}

/** Free CartoDB Voyager tiles via MapLibre — no API key, no billing account, no Google/Mapbox dependency. */
export function BookingMap({
  pickup,
  dropoff,
  onSetPoint,
  drivers = [],
  selectedDriverId,
  onSelectDriver,
  routePolyline,
}: BookingMapProps) {
  function handlePress(event: NativeSyntheticEvent<PressEvent>) {
    const [lng, lat] = event.nativeEvent.lngLat;
    onSetPoint({ lat, lng });
  }

  const routeGeoJson: GeoJSON.Feature | null =
    routePolyline && routePolyline.length > 1
      ? {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: routePolyline.map((p) => [p.lng, p.lat]),
          },
        }
      : null;

  return (
    <View style={styles.container}>
      <Map style={StyleSheet.absoluteFill} mapStyle={MAP_STYLE_URL} onPress={handlePress}>
        <Camera
          initialViewState={{ center: SOCORRO_CENTER_LNGLAT, zoom: DEFAULT_ZOOM }}
          maxBounds={SOCORRO_BOUNDS}
        />

        <GeoJSONSource id="places" data={PLACES_GEOJSON}>
          <Layer
            id="placesDot"
            type="circle"
            paint={{
              "circle-radius": 3,
              "circle-color": colors.inkMuted,
              "circle-stroke-width": 1,
              "circle-stroke-color": "#ffffff",
            }}
          />
          <Layer
            id="placesLabel"
            type="symbol"
            layout={{
              "text-field": ["get", "name"],
              "text-size": 11,
              "text-offset": [0, 0.8],
              "text-anchor": "top",
              "text-allow-overlap": false,
              "text-optional": true,
            }}
            paint={{
              "text-color": colors.inkMuted,
              "text-halo-color": "#ffffff",
              "text-halo-width": 1.2,
            }}
          />
        </GeoJSONSource>

        {pickup ? (
          <Marker lngLat={toLngLat(pickup)} id="pickup">
            <Pin color={colors.success} />
          </Marker>
        ) : null}

        {dropoff ? (
          <Marker lngLat={toLngLat(dropoff)} id="dropoff">
            <Pin color={colors.coral} />
          </Marker>
        ) : null}

        {drivers.map((d) => (
          <Marker
            key={d.driverId}
            id={d.driverId}
            lngLat={[d.lng, d.lat]}
            onPress={() => onSelectDriver?.(d)}
          >
            <Pin color={d.driverId === selectedDriverId ? colors.teal : colors.amber} />
          </Marker>
        ))}

        {routeGeoJson ? (
          <GeoJSONSource id="route" data={routeGeoJson}>
            <Layer
              id="routeLine"
              type="line"
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={{ "line-color": colors.teal, "line-width": 4 }}
            />
          </GeoJSONSource>
        ) : null}
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
});

const pinStyles = StyleSheet.create({
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
