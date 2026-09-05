import Constants from "expo-constants";

/**
 * Points at the existing Pasakja Next.js backend (../pasakja). Override for
 * a device/emulator via `extra.apiBaseUrl` in app.json, or an EAS build
 * profile env var — never hardcode a second backend.
 */
export const API_BASE_URL: string =
  (Constants.expoConfig?.extra?.apiBaseUrl as string | undefined) ??
  "http://localhost:3000";
