import { useEffect, useRef } from "react";
import * as Location from "expo-location";
import { postPassengerLocation, clearPassengerLocation } from "@/api/location";

const BROADCAST_INTERVAL_MS = 10000;

/** Mirrors components/passenger/passenger-location-sharer.tsx on the web — broadcasts while a trip is active. */
export function usePassengerLocationBroadcast(bookingId: string | null) {
  const watchRef = useRef<Location.LocationSubscription | null>(null);
  const lastBroadcastRef = useRef(0);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!bookingId) return;
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted || cancelled) return;
      watchRef.current = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: BROADCAST_INTERVAL_MS, distanceInterval: 15 },
        (position) => {
          const now = Date.now();
          if (now - lastBroadcastRef.current < BROADCAST_INTERVAL_MS) return;
          lastBroadcastRef.current = now;
          postPassengerLocation(position.coords.latitude, position.coords.longitude, bookingId).catch(
            () => {}
          );
        }
      );
    }

    start();
    return () => {
      cancelled = true;
      watchRef.current?.remove();
      watchRef.current = null;
      if (bookingId) clearPassengerLocation().catch(() => {});
    };
  }, [bookingId]);
}
