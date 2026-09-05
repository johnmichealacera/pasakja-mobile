import { apiRequest } from "@/api/client";
import type { Booking, BookingStatus, DisputeStatus, PaymentMethod } from "@/types";

/** Mirrors app/api/bookings/route.ts (GET) — role-scoped on the server. `disputeStatus` is admin-only. */
export async function listBookings(params?: {
  status?: BookingStatus;
  disputeStatus?: DisputeStatus;
  limit?: number;
}) {
  const { bookings } = await apiRequest<{ bookings: Booking[] }>("/api/bookings", {
    query: params,
  });
  return bookings;
}

export interface CreateBookingInput {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  quotedFare: number;
  paymentMethod: PaymentMethod;
  isShared?: boolean;
  requestedDriverId?: string;
  notes?: string;
}

/** Cash bookings only — GCash bookings go through src/api/paymongo.ts. */
export async function createBooking(input: CreateBookingInput) {
  const { booking } = await apiRequest<{ booking: Booking }>("/api/bookings", {
    method: "POST",
    body: input,
  });
  return booking;
}

export type BookingPatch =
  | { status: "ACCEPTED" }
  | { action: "reject_request" }
  | { status: "PENDING" } // driver releases an accepted booking
  | { status: "PICKED_UP" }
  | { status: "IN_PROGRESS" }
  // baseFare/distance are optional — the server resolves baseFare from the
  // original quotedFare when omitted (see resolveBaseFare in lib/commission.ts).
  | { status: "COMPLETED"; baseFare?: number; distance?: number }
  | { status: "CANCELLED" };

export async function patchBooking(id: string, patch: BookingPatch) {
  const { booking } = await apiRequest<{ booking: Booking }>(`/api/bookings/${id}`, {
    method: "PATCH",
    body: patch,
  });
  return booking;
}

export interface Rating {
  id: string;
  bookingId: string;
  passengerId: string;
  driverId: string;
  score: number;
  comment: string | null;
  createdAt: string;
}

/** Response is the bare Rating row (not wrapped in an envelope). */
export function rateBooking(id: string, score: number, comment?: string) {
  return apiRequest<Rating>(`/api/bookings/${id}/rate`, {
    method: "POST",
    body: { score, comment },
  });
}

export function requestDispute(id: string, reason: string) {
  return apiRequest<{ success: true }>(`/api/bookings/${id}/dispute`, {
    method: "POST",
    body: { reason },
  });
}

/** Admin only. */
export function resolveDispute(id: string, action: "approve" | "deny") {
  return apiRequest<{ success: true; action: string; refundId?: string }>(
    `/api/bookings/${id}/dispute`,
    { method: "PATCH", body: { action } }
  );
}

export function getCounterparty(id: string) {
  return apiRequest(`/api/bookings/${id}/counterparty`);
}

/** Mirrors the flat {lat, lng, status, etaMinutes?, updatedAt?} shape both -location routes return. */
export interface LiveLocation {
  lat: number | null;
  lng: number | null;
  status: BookingStatus;
  etaMinutes?: number | null;
  updatedAt?: string;
}

export function getDriverLocation(bookingId: string) {
  return apiRequest<LiveLocation>(`/api/bookings/${bookingId}/driver-location`);
}

export function getPassengerLocation(bookingId: string) {
  return apiRequest<LiveLocation>(`/api/bookings/${bookingId}/passenger-location`);
}
