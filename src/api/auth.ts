import { apiRequest } from "@/api/client";
import type { AuthUser, UserRole } from "@/types";

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

/**
 * Calls POST /api/mobile/session — a planned additive endpoint on the
 * existing Pasakja backend (see the mobile plan, Section 5A) that mirrors
 * auth.ts's authorize() logic but returns a Bearer JWT instead of a cookie
 * session. Does not exist on the backend yet as of this scaffold.
 */
export function login(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/api/mobile/session", {
    method: "POST",
    body: { email, password },
    skipAuth: true,
  });
}

export interface RegisterPassengerInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "PASSENGER";
  documents?: { type: string; url: string; filename: string }[];
}

export interface RegisterDriverInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: "DRIVER";
  licenseNo: string;
  vehicleType: string;
  vehiclePlate: string;
  vehicleModel: string;
  documents?: { type: string; url: string; filename: string }[];
}

export type RegisterInput = RegisterPassengerInput | RegisterDriverInput;

/** Matches app/api/register/route.ts on the existing backend, unchanged. */
export function register(
  input: RegisterInput
): Promise<{ message: string; userId: string }> {
  return apiRequest("/api/register", { method: "POST", body: input, skipAuth: true });
}

export function roleHome(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "DRIVER":
      return "/driver";
    case "PASSENGER":
    default:
      return "/passenger";
  }
}
