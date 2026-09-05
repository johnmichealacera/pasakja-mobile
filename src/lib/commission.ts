/**
 * Copied verbatim from ../pasakja/lib/commission.ts (the web app, source of
 * truth). Used here only to preview fares client-side — the server always
 * recomputes and persists the authoritative fare at trip completion, so
 * drift here affects preview accuracy only, never correctness.
 *
 * Pasakja platform commission — added on top of the trip fare (passenger pays).
 * The driver receives the full base trip fare; the platform fee is not deducted.
 */
export const PLATFORM_COMMISSION_RATE = 0.15;

export function platformFee(baseFare: number): number {
  return Math.round(baseFare * PLATFORM_COMMISSION_RATE * 100) / 100;
}

export function passengerTotal(baseFare: number): number {
  return Math.round((baseFare + platformFee(baseFare)) * 100) / 100;
}

/** Driver receives the full base trip fare. */
export function driverAmount(baseFare: number): number {
  return Math.round(baseFare * 100) / 100;
}

export function baseFareFromPassengerTotal(total: number): number {
  return Math.round((total / (1 + PLATFORM_COMMISSION_RATE)) * 100) / 100;
}
