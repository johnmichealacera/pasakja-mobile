/**
 * Copied from ../pasakja/lib/verification-doc-types.ts (the web app, source
 * of truth). Keep the keys in sync — they're validated server-side.
 */
export const DRIVER_DOC_TYPES = [
  { key: "DRIVERS_LICENSE", label: "Driver's License", required: true },
  { key: "VEHICLE_REGISTRATION", label: "Vehicle Registration (OR/CR)", required: true },
  { key: "VALID_ID", label: "Government-Issued ID", required: false },
] as const;

export const DRIVER_DOC_TYPE_LABELS: Record<string, string> = {
  DRIVERS_LICENSE: "Driver's License",
  VEHICLE_REGISTRATION: "Vehicle Registration (OR/CR)",
  VALID_ID: "Government-Issued ID",
  OTHER: "Other Document",
};

export const PASSENGER_DOC_TYPES = [
  {
    key: "VALID_ID",
    label: "Government-Issued ID",
    hint: "UMID, PhilSys ID, Passport, Driver's License, etc.",
  },
  {
    key: "PROOF_OF_ADDRESS",
    label: "Proof of Address",
    hint: "Utility bill, barangay certificate, etc.",
  },
  {
    key: "SELFIE_WITH_ID",
    label: "Selfie with ID",
    hint: "Photo of you holding your government-issued ID",
  },
  {
    key: "OTHER",
    label: "Other Document",
    hint: "Any additional supporting document",
  },
] as const;

export const PASSENGER_DOC_TYPE_LABELS: Record<string, string> = {
  ...Object.fromEntries(PASSENGER_DOC_TYPES.map((d) => [d.key, d.label])),
  OTHER: "Other Document",
};
