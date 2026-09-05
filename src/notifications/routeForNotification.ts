/** Maps a notification's `data.type` (set by lib/notifications.ts on the backend) to a screen. */
export function routeForNotification(data: Record<string, unknown> | undefined): string | null {
  switch (data?.type) {
    case "booking_request":
      return "/driver/requests";
    case "booking_accepted":
      return "/passenger/trip";
    case "booking_completed":
    case "booking_cancelled":
    case "dispute_denied":
    case "dispute_refunded":
      return "/passenger/trips";
    case "sos":
    case "dispute":
      return "/admin/sos";
    case "sos_resolved":
      return "/passenger";
    default:
      return null;
  }
}
