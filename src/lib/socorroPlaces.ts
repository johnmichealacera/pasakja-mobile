/**
 * Copied verbatim from ../pasakja/lib/socorro-places.ts (the web app,
 * source of truth). Keep in sync with that file.
 */
export interface SocorroPlace {
  name: string;
  lat: number;
  lng: number;
}

export interface SocorroBarangay {
  barangay: string;
  places: SocorroPlace[];
}

export const SOCORRO_PLACES: SocorroBarangay[] = [
  {
    barangay: "Poblacion (Town Proper)",
    places: [
      { name: "Municipal Hall", lat: 9.6181, lng: 125.9659 },
      { name: "Public Market (Palengke)", lat: 9.6172, lng: 125.9665 },
      { name: "Port / Pier (Pantalan)", lat: 9.6168, lng: 125.9666 },
      { name: "Bucas Grande Foundation College", lat: 9.6159, lng: 125.9630 },
      { name: "Socorro National High School", lat: 9.6146, lng: 125.9631 },
      { name: "Socorro Central Elementary School", lat: 9.6194, lng: 125.9646 },
      { name: "Municipal Plaza / Covered Court", lat: 9.6184, lng: 125.9662 },
      { name: "Rizal Gym", lat: 9.6241, lng: 125.9673 },
    ],
  },
  { barangay: "Songkoy", places: [{ name: "Songkoy Elementary School", lat: 9.6303, lng: 125.9512 }] },
  {
    barangay: "Nueva Estrella",
    places: [{ name: "Nueva Estrella Elementary School", lat: 9.6291, lng: 125.9382 }],
  },
  { barangay: "San Roque", places: [{ name: "San Roque Elementary School", lat: 9.6246, lng: 125.9201 }] },
  {
    barangay: "Pamosaingan",
    places: [{ name: "Pamosaingan Elementary School", lat: 9.6487, lng: 125.9235 }],
  },
  { barangay: "Santa Cruz", places: [{ name: "Santa Cruz Elementary School", lat: 9.6468, lng: 125.9102 }] },
  { barangay: "Honrado", places: [{ name: "Honrado Elementary School", lat: 9.6443, lng: 125.9433 }] },
  {
    barangay: "Salog",
    places: [
      { name: "Atoyay Elementary School", lat: 9.6822, lng: 125.9353 },
      { name: "Atoyay National High School", lat: 9.6811, lng: 125.9352 },
    ],
  },
  { barangay: "Sering", places: [{ name: "Near North Sering Elementary School", lat: 9.6843, lng: 125.9748 }] },
  { barangay: "Sudlon", places: [{ name: "Sudlon Elementary School", lat: 9.6121, lng: 125.9393 }] },
];

/** Flat array of all places — useful for search/lookup by name. */
export const ALL_SOCORRO_PLACES: (SocorroPlace & { barangay: string })[] = SOCORRO_PLACES.flatMap(
  (b) => b.places.map((p) => ({ ...p, barangay: b.barangay }))
);
