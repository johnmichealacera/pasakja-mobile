import { apiRequest } from "@/api/client";
import type { Booking } from "@/types";

export interface CheckoutInput {
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  isShared?: boolean;
  notes?: string;
  /** The driver's base fare (FareEstimate.baseFare) — server adds the platform fee on top. */
  estimatedFare: number;
  /** FareEstimate.centavos — must be >= 2000 (₱20) per the server's minimum-charge check. */
  centavos: number;
}

export interface CheckoutResponse {
  booking: Booking;
  clientKey: string;
  paymentIntentId: string;
}

/** Creates the Booking (paymentMethod=ONLINE, UNPAID) + a PayMongo PaymentIntent. Mirrors app/api/paymongo/checkout/route.ts exactly. */
export function checkout(input: CheckoutInput) {
  return apiRequest<CheckoutResponse>("/api/paymongo/checkout", { method: "POST", body: input });
}

export interface AttachResponse {
  status: string;
  redirectUrl: string | null;
}

/**
 * `returnUrl` must start with `pasakja://payment-return` (see the allowlist
 * in app/api/paymongo/attach/route.ts) — anything else falls back to the
 * web return page server-side.
 */
export function attachGcash(paymentIntentId: string, clientKey: string, returnUrl: string) {
  return apiRequest<AttachResponse>("/api/paymongo/attach", {
    method: "POST",
    body: { paymentIntentId, clientKey, returnUrl },
  });
}

export function getPaymentStatus(paymentIntentId: string) {
  return apiRequest<{ piStatus: string; paymentStatus: Booking["paymentStatus"] }>(
    "/api/paymongo/status",
    { query: { pi: paymentIntentId } }
  );
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Mirrors the web return page's poll loop: every 2s, up to 10 attempts. */
export async function pollPaymentStatus(
  paymentIntentId: string,
  { attempts = 10, intervalMs = 2000 }: { attempts?: number; intervalMs?: number } = {}
): Promise<boolean> {
  for (let i = 0; i < attempts; i++) {
    const { paymentStatus, piStatus } = await getPaymentStatus(paymentIntentId);
    if (paymentStatus === "PAID" || piStatus === "succeeded") return true;
    await wait(intervalMs);
  }
  return false;
}
