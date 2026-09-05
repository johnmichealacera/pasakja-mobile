import { apiRequest } from "@/api/client";

export interface AdminStats {
  totalBookings: number;
  completedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  activeDrivers: number;
  totalPassengers: number;
  totalDrivers: number;
  totalRevenue: number;
}

export async function getAdminStats() {
  const { stats } = await apiRequest<{ stats: AdminStats }>("/api/admin/stats");
  return stats;
}
