/**
 * Pasakja's visual identity: a coastal Philippine transit app, not a generic
 * SaaS palette. Teal/emerald (water, movement, trust) carry the brand;
 * amber is spent narrowly — ratings, live-status pulses, celebratory
 * moments — never as a second competing call-to-action color. Coral is
 * reserved for real alarm (SOS, cancel) so it stays meaningful.
 */
export const colors = {
  // Brand
  teal: "#0d9488",
  tealDark: "#0f766e",
  tealLight: "#5eead4",
  emerald: "#059669",
  emeraldDark: "#047857",
  amber: "#f59e0b",
  amberDark: "#b45309",
  coral: "#e11d48",
  coralDark: "#9f1239",

  // Surfaces
  background: "#f3faf8",
  surface: "#ffffff",
  surfaceMuted: "#eaf4f2",
  border: "#dbe8e5",
  borderStrong: "#b9d3ce",

  // Text
  ink: "#0b201c",
  inkMuted: "#5b7570",
  inkFaint: "#8ba39d",
  onBrand: "#ffffff",

  // Semantic
  success: "#059669",
  successBg: "#ecfdf5",
  danger: "#e11d48",
  dangerBg: "#fdf1f4",
  warning: "#b45309",
  warningBg: "#fffaeb",
} as const;

export const gradients = {
  brand: [colors.teal, colors.emerald] as const,
  brandDeep: [colors.tealDark, colors.emeraldDark] as const,
  amber: [colors.amber, "#f97316"] as const,
  danger: [colors.coral, colors.coralDark] as const,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 36,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  full: 999,
};

export const typography = {
  display: { fontSize: 28, fontWeight: "800" as const, letterSpacing: -0.5, color: colors.ink },
  title: { fontSize: 20, fontWeight: "700" as const, letterSpacing: -0.2, color: colors.ink },
  subtitle: { fontSize: 15, fontWeight: "600" as const, color: colors.ink },
  body: { fontSize: 14, fontWeight: "400" as const, color: colors.ink },
  bodyStrong: { fontSize: 14, fontWeight: "600" as const, color: colors.ink },
  caption: { fontSize: 12, fontWeight: "500" as const, color: colors.inkMuted },
  micro: { fontSize: 11, fontWeight: "700" as const, color: colors.inkMuted },
};

/** Shadow is reserved for genuinely elevated content (active trip, totals) — not applied uniformly to every card. */
export const shadow = {
  sm: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
};
