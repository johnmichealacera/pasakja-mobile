import { apiRequest } from "@/api/client";
import type { FareEstimate } from "@/types";

/** Public endpoint, no auth. Authoritative fare is only finalized server-side at trip COMPLETED. */
export function estimateFare(distanceKm: number) {
  return apiRequest<FareEstimate>("/api/fares/estimate", { query: { distanceKm } });
}
