/**
 * Copied from ../pasakja/lib/booking-guards.ts (the web app, source of
 * truth) — constants only; the Prisma query builders stay server-side.
 * Used here purely to disable/hide UI actions the server would reject
 * anyway (the server remains the authority on these rules).
 */
import type { BookingStatus } from "@/types";

/** Passenger cannot create a new booking while any of these exist. */
export const PASSENGER_OPEN_BOOKING_STATUSES: BookingStatus[] = [
  "PENDING",
  "ACCEPTED",
  "PICKED_UP",
  "IN_PROGRESS",
];

/** Driver cannot accept another booking while one of these is assigned to them. */
export const DRIVER_ACTIVE_BOOKING_STATUSES: BookingStatus[] = [
  "ACCEPTED",
  "PICKED_UP",
  "IN_PROGRESS",
];

export const PASSENGER_HAS_OPEN_BOOKING_MESSAGE =
  "You already have an active ride. Finish or cancel it before booking another.";

export const DRIVER_HAS_ACTIVE_BOOKING_MESSAGE =
  "Complete your current trip before accepting another booking.";
