import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as authApi from "@/api/auth";
import { unregisterPushToken } from "@/api/notifications";
import { clearToken, getToken, setToken } from "@/auth/tokenStorage";
import type { AuthUser } from "@/types";

interface AuthContextValue {
  user: AuthUser | null;
  /** True while restoring a persisted session on app boot. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

/** Minimal base64 (RFC 4648) decoder — Hermes has no `atob`/`Buffer` by default. */
function base64Decode(input: string): string {
  const clean = input.replace(/-/g, "+").replace(/_/g, "/").replace(/[^A-Za-z0-9+/]/g, "");
  let output = "";
  for (let i = 0; i < clean.length; i += 4) {
    const chunk = clean.slice(i, i + 4);
    const bits = chunk
      .split("")
      .map((c) => BASE64_ALPHABET.indexOf(c).toString(2).padStart(6, "0"))
      .join("");
    for (let j = 0; j + 8 <= bits.length; j += 8) {
      output += String.fromCharCode(parseInt(bits.slice(j, j + 8), 2));
    }
  }
  return decodeURIComponent(
    output
      .split("")
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join("")
  );
}

/**
 * There is no `/api/auth/session`-style endpoint for Bearer tokens on the
 * backend today — the JWT payload itself (`{id, role, name, email}`, set by
 * the planned `/api/mobile/session` endpoint) is decoded client-side to
 * restore `user` on boot, since decoding doesn't require a network call or
 * the signing secret.
 */
function decodeJwtPayload(token: string): AuthUser | null {
  try {
    const [, payload] = token.split(".");
    const json = JSON.parse(base64Decode(payload));
    if (!json?.id || !json?.role) return null;
    return { id: json.id, role: json.role, name: json.name ?? "", email: json.email ?? "" };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      if (token) setUser(decodeJwtPayload(token));
      setIsLoading(false);
    })();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      login: async (email, password) => {
        const { token, user: loggedInUser } = await authApi.login(email, password);
        await setToken(token);
        setUser(loggedInUser);
        return loggedInUser;
      },
      logout: async () => {
        // Best-effort, and must happen before the token is cleared (needs auth).
        await unregisterPushToken().catch(() => {});
        await clearToken();
        setUser(null);
      },
    }),
    [user, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
