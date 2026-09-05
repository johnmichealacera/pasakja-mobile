import { apiRequest } from "@/api/client";
import type { SosAlert } from "@/types";

export async function sendSos(input: {
  lat: number;
  lng: number;
  message?: string;
  bookingId?: string;
}) {
  const { alert } = await apiRequest<{ alert: SosAlert }>("/api/sos", {
    method: "POST",
    body: input,
  });
  return alert;
}

/** Admin only. */
export async function listSosAlerts() {
  const { alerts } = await apiRequest<{ alerts: SosAlert[] }>("/api/sos");
  return alerts;
}

/** Admin only. */
export function resolveSos(id: string, isResolved: boolean) {
  return apiRequest<SosAlert>(`/api/sos/${id}`, { method: "PATCH", body: { isResolved } });
}
