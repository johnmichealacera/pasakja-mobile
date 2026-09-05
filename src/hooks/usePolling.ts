import { useEffect, useRef } from "react";

/**
 * Runs `callback` immediately, then every `intervalMs`, for as long as the
 * calling component is mounted and `enabled` is true. Mirrors the web app's
 * plain `setInterval` polling (see the mobile plan, Section 9) — no
 * websocket/push replacement here yet.
 */
export function usePolling(callback: () => void, intervalMs: number, enabled = true) {
  const savedCallback = useRef(callback);
  savedCallback.current = callback;

  useEffect(() => {
    if (!enabled) return;
    savedCallback.current();
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
