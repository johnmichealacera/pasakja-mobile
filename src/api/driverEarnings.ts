import { apiRequest } from "@/api/client";

export interface EarningEntry {
  id: string;
  amount: number;
  platformFee: number;
  date: string;
}

export interface DriverEarnings {
  totalEarnings: number;
  weeklyNet: number;
  monthlyNet: number;
  totalGross: number;
  totalPlatformFees: number;
  completedTrips: number;
  history: EarningEntry[];
}

/** Mirrors app/api/driver/earnings/route.ts exactly. */
export function getDriverEarnings() {
  return apiRequest<DriverEarnings>("/api/driver/earnings");
}
