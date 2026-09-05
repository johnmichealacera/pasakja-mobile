/**
 * Mirrors prisma/schema.prisma enums and shapes from the Pasakja web app
 * (../pasakja). The Next.js backend is the source of truth — keep these in
 * sync with that file rather than re-deriving them independently.
 */

export type UserRole = "PASSENGER" | "DRIVER" | "ADMIN";

export type DriverStatus = "PENDING" | "VERIFIED" | "SUSPENDED";

export type RemittanceStatus = "PENDING" | "PAID";

export type DisputeStatus = "NONE" | "REQUESTED" | "REFUNDED" | "DENIED";

export type BookingStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PICKED_UP"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "ONLINE";

export type PaymentStatus = "UNPAID" | "PAID" | "REFUNDED";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

/**
 * Different endpoints select different subsets of User for a counterparty
 * (GET /api/drivers selects {name,email,phone}; a booking's nested
 * driver/passenger uses SAFE_USER_SELECT = {id,name,phone,profileImage}).
 * All fields besides name/phone are optional so either shape fits.
 */
export interface BasicUserInfo {
  id?: string;
  name: string;
  email?: string;
  phone: string | null;
  profileImage?: string | null;
}

export interface Driver {
  id: string;
  userId: string;
  licenseNo: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleModel: string;
  status: DriverStatus;
  isAvailable: boolean;
  currentLat: number | null;
  currentLng: number | null;
  /** Prisma Decimal — serializes as a numeric string over JSON, not a number. */
  totalEarnings: string;
  createdAt?: string;
  updatedAt?: string;
  /** Absent on a driver's own PATCH self-update. */
  user?: BasicUserInfo;
  _count?: { bookings: number; ratings: number };
}

export interface Booking {
  id: string;
  passengerId: string;
  driverId: string | null;
  pickupLat: number;
  pickupLng: number;
  pickupAddress: string;
  dropoffLat: number;
  dropoffLng: number;
  dropoffAddress: string;
  status: BookingStatus;
  /** Prisma Decimal fields — serialize as numeric strings over JSON, not numbers. Wrap in Number() before math/formatting. */
  fare: string | null;
  quotedFare: string | null;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymongoPaymentIntentId: string | null;
  isShared: boolean;
  requestedDriverId: string | null;
  notes: string | null;
  disputeStatus: DisputeStatus;
  disputeReason: string | null;
  disputeAt: string | null;
  refundId: string | null;
  createdAt: string;
  updatedAt: string;
  passenger?: {
    user: BasicUserInfo;
  };
  driver?: Driver;
  trip?: {
    startTime: string | null;
    endTime: string | null;
    distance: number | null;
  } | null;
  rating?: { score: number; comment: string | null } | null;
}

/** Mirrors app/api/drivers/available/route.ts's response shape exactly. */
export interface NearbyDriver {
  driverId: string;
  userId: string;
  name: string;
  vehicleType: string;
  vehicleModel: string;
  vehiclePlate: string;
  avgRating: number | null;
  lat: number;
  lng: number;
  distanceKm: number | null;
  etaMinutes: number | null;
  updatedAt: string;
}

export interface RouteResult {
  polyline: { lat: number; lng: number }[];
  distanceKm: number;
  durationMinutes: number;
}

/** Mirrors app/api/fares/estimate/route.ts's response shape exactly. */
export interface FareEstimate {
  estimatedFare: number;
  baseFare: number;
  platformFee: number;
  passengerTotal: number;
  centavos: number;
  zoneBaseFare: number;
  perKmRate: number;
  distanceKm: number;
  zoneName: string;
}

export interface SosAlert {
  id: string;
  passengerId: string;
  bookingId: string | null;
  lat: number;
  lng: number;
  message: string | null;
  isResolved: boolean;
  createdAt: string;
}
