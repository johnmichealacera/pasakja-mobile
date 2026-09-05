import type { ComponentProps } from "react";
import type { Ionicons } from "@expo/vector-icons";
import { colors } from "@/theme";
import type { BookingStatus, DriverStatus, DisputeStatus } from "@/types";

type IconName = ComponentProps<typeof Ionicons>["name"];

export interface StatusPresentation {
  /** Humanized for display — never show a raw enum value like "IN_PROGRESS" to a user. */
  label: string;
  color: string;
  bg: string;
  icon: IconName;
}

export const BOOKING_STATUS: Record<BookingStatus, StatusPresentation> = {
  PENDING: { label: "Finding a driver", color: colors.warning, bg: colors.warningBg, icon: "time-outline" },
  ACCEPTED: { label: "Driver on the way", color: colors.teal, bg: colors.surfaceMuted, icon: "navigate-outline" },
  PICKED_UP: { label: "Picked up", color: colors.teal, bg: colors.surfaceMuted, icon: "person-outline" },
  IN_PROGRESS: { label: "In progress", color: colors.emerald, bg: colors.surfaceMuted, icon: "car-outline" },
  COMPLETED: { label: "Completed", color: colors.success, bg: colors.successBg, icon: "checkmark-circle-outline" },
  CANCELLED: { label: "Cancelled", color: colors.danger, bg: colors.dangerBg, icon: "close-circle-outline" },
};

export const DRIVER_STATUS: Record<DriverStatus, StatusPresentation> = {
  PENDING: { label: "Verification pending", color: colors.warning, bg: colors.warningBg, icon: "hourglass-outline" },
  VERIFIED: { label: "Verified", color: colors.success, bg: colors.successBg, icon: "shield-checkmark-outline" },
  SUSPENDED: { label: "Suspended", color: colors.danger, bg: colors.dangerBg, icon: "ban-outline" },
};

export const DISPUTE_STATUS: Record<DisputeStatus, StatusPresentation> = {
  NONE: { label: "No dispute", color: colors.inkMuted, bg: colors.surfaceMuted, icon: "remove-circle-outline" },
  REQUESTED: { label: "Refund requested", color: colors.warning, bg: colors.warningBg, icon: "alert-circle-outline" },
  REFUNDED: { label: "Refunded", color: colors.success, bg: colors.successBg, icon: "checkmark-circle-outline" },
  DENIED: { label: "Denied", color: colors.danger, bg: colors.dangerBg, icon: "close-circle-outline" },
};

export const PAYMENT_METHOD_ICON: Record<"CASH" | "ONLINE", IconName> = {
  CASH: "cash-outline",
  ONLINE: "phone-portrait-outline",
};

export const VEHICLE_ICON_NAME: IconName = "bicycle-outline";
