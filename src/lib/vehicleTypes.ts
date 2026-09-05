/**
 * Copied verbatim from ../pasakja/lib/vehicle-types.ts (the web app, source
 * of truth). Keep in sync with that file.
 */
export const VEHICLE_TYPES = ["Tricycle", "Habal-habal", "Bao-bao"] as const;

export type VehicleType = (typeof VEHICLE_TYPES)[number];

export const VEHICLE_ICONS: Record<VehicleType, string> = {
  "Habal-habal": "🏍",
  Tricycle: "🛺",
  "Bao-bao": "🛺",
};

export function vehicleLabel(type: string): string {
  const icon = VEHICLE_ICONS[type as VehicleType];
  return icon ? `${icon} ${type}` : type;
}
