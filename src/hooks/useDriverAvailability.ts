import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import { useDriverProfile, toggleDriverAvailability } from "@/auth/DriverProfileContext";
import { postDriverLocation, clearDriverLocation } from "@/api/location";

const BROADCAST_INTERVAL_MS = 15000;

/**
 * Mirrors the web app's components/driver/availability-toggle.tsx: going
 * online grabs a GPS fix, flips isAvailable, then broadcasts position every
 * ~15s while idle (no active bookingId); going offline stops the watch and
 * clears the live location row.
 */
export function useDriverAvailability() {
  const { driver, applyUpdate } = useDriverProfile();
  const [isToggling, setIsToggling] = useState(false);
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastBroadcastRef = useRef(0);

  function stopBroadcast() {
    watchRef.current?.remove();
    watchRef.current = null;
  }

  async function startBroadcast() {
    watchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: BROADCAST_INTERVAL_MS, distanceInterval: 20 },
      (position) => {
        const now = Date.now();
        if (now - lastBroadcastRef.current < BROADCAST_INTERVAL_MS) return;
        lastBroadcastRef.current = now;
        postDriverLocation(position.coords.latitude, position.coords.longitude).catch(() => {
          // Non-critical — next tick retries.
        });
      }
    );
  }

  useEffect(() => stopBroadcast, []);

  async function toggle(nextValue: boolean) {
    if (!driver) return;
    setIsToggling(true);
    try {
      if (nextValue) {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!permission.granted) {
          throw new Error("Location permission is required to go online.");
        }
        const position = await Location.getCurrentPositionAsync({});
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        await toggleDriverAvailability(driver, true, applyUpdate, point);
        await postDriverLocation(point.lat, point.lng);
        await startBroadcast();
      } else {
        stopBroadcast();
        await toggleDriverAvailability(driver, false, applyUpdate);
        await clearDriverLocation();
      }
    } finally {
      setIsToggling(false);
    }
  }

  return { isToggling, toggle };
}
