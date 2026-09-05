import { apiRequest } from "@/api/client";

/** Driver-only. Upserts DriverLocation; pass bookingId while on an active trip, omit while idle/available. */
export function postDriverLocation(latitude: number, longitude: number, bookingId?: string) {
  return apiRequest("/api/location", { method: "POST", body: { latitude, longitude, bookingId } });
}

export function clearDriverLocation() {
  return apiRequest("/api/location", { method: "DELETE" });
}

/** Passenger-only, requires an active bookingId. */
export function postPassengerLocation(latitude: number, longitude: number, bookingId: string) {
  return apiRequest("/api/passenger-location", {
    method: "POST",
    body: { latitude, longitude, bookingId },
  });
}

export function clearPassengerLocation() {
  return apiRequest("/api/passenger-location", { method: "DELETE" });
}
