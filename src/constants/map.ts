import type { LngLat, LngLatBounds } from "@maplibre/maplibre-react-native";

/** Copied from ../pasakja/components/maps/map-picker.tsx (the web app, source of truth). */
export const SOCORRO_CENTER = { lat: 9.6234, lng: 125.9685 };

export const SOCORRO_CENTER_LNGLAT: LngLat = [SOCORRO_CENTER.lng, SOCORRO_CENTER.lat];

/** [west, south, east, north] — matches the web app's Leaflet maxBounds. */
export const SOCORRO_BOUNDS: LngLatBounds = [125.87, 9.52, 126.07, 9.72];

export const DEFAULT_ZOOM = 13;
