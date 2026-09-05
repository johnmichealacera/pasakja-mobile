import { apiRequest } from "@/api/client";
import type { Driver, DriverStatus, NearbyDriver } from "@/types";

export async function listDrivers(params?: { status?: DriverStatus; available?: boolean }) {
  const { drivers } = await apiRequest<{ drivers: Driver[] }>("/api/drivers", { query: params });
  return drivers;
}

/** No "self" filter exists server-side — fetches all drivers and matches by userId client-side. */
export async function getMyDriverProfile(userId: string) {
  const drivers = await listDrivers();
  return drivers.find((d) => d.userId === userId) ?? null;
}

export async function getNearbyDrivers(lat: number, lng: number) {
  const { drivers } = await apiRequest<{ drivers: NearbyDriver[] }>(
    "/api/drivers/available",
    { query: { lat, lng } }
  );
  return drivers;
}

export interface UpdateDriverInput {
  isAvailable?: boolean;
  currentLat?: number;
  currentLng?: number;
  status?: DriverStatus; // admin only
}

export async function updateDriver(id: string, input: UpdateDriverInput) {
  const { driver } = await apiRequest<{ driver: Driver }>(`/api/drivers/${id}`, {
    method: "PATCH",
    body: input,
  });
  return driver;
}
