import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { getMyDriverProfile, updateDriver } from "@/api/drivers";
import type { Driver } from "@/types";

interface DriverProfileContextValue {
  driver: Driver | null;
  isLoading: boolean;
  refresh: () => Promise<void>;
  /** Optimistically patches the local copy after a successful /api/drivers/:id PATCH. */
  applyUpdate: (patch: Partial<Driver>) => void;
}

const DriverProfileContext = createContext<DriverProfileContextValue | undefined>(undefined);

/**
 * There is no "my driver profile" endpoint — GET /api/drivers lists every
 * driver, so we fetch it once and match by userId (see getMyDriverProfile).
 */
export function DriverProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      setDriver(await getMyDriverProfile(user.id));
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<DriverProfileContextValue>(
    () => ({
      driver,
      isLoading,
      refresh,
      applyUpdate: (patch) => setDriver((current) => (current ? { ...current, ...patch } : current)),
    }),
    [driver, isLoading, refresh]
  );

  return <DriverProfileContext.Provider value={value}>{children}</DriverProfileContext.Provider>;
}

export function useDriverProfile(): DriverProfileContextValue {
  const ctx = useContext(DriverProfileContext);
  if (!ctx) throw new Error("useDriverProfile must be used within a DriverProfileProvider");
  return ctx;
}

/** Convenience wrapper — toggles isAvailable and keeps context in sync. */
export async function toggleDriverAvailability(
  driver: Driver,
  isAvailable: boolean,
  applyUpdate: (patch: Partial<Driver>) => void,
  point?: { lat: number; lng: number }
) {
  const updated = await updateDriver(driver.id, {
    isAvailable,
    ...(point ? { currentLat: point.lat, currentLng: point.lng } : {}),
  });
  applyUpdate(updated);
  return updated;
}
