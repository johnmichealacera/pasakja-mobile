import { useCallback, useEffect, useState } from "react";
import * as Location from "expo-location";

interface LatLng {
  lat: number;
  lng: number;
}

export function useCurrentLocation() {
  const [location, setLocation] = useState<LatLng | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setError("Location permission denied");
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
      setError(null);
    } catch {
      setError("Could not get your location");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { location, isLoading, error, refresh };
}
