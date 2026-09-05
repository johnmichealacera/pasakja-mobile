import { apiRequest } from "@/api/client";
import type { RouteResult } from "@/types";

/** Proxies to the public OSRM demo server server-side — no key needed. */
export function getRoute(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
) {
  return apiRequest<RouteResult>("/api/maps/route", {
    query: { fromLat, fromLng, toLat, toLng },
  });
}

export function snapToNearestRoad(lat: number, lng: number) {
  return apiRequest<{ lat: number; lng: number }>("/api/maps/nearest", {
    query: { lat, lng },
  });
}

export function reverseGeocode(
  lat: number,
  lng: number,
  role: "pickup" | "dropoff" = "dropoff"
) {
  return apiRequest<{ address: string; landmark: string | null }>("/api/maps/reverse", {
    query: { lat, lng, role },
  });
}
