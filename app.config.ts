import "dotenv/config";
import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  extra: {
    ...config.extra,
    // Overridable per machine/build via .env — see NEXT_STEPS.md. Defaults to
    // localhost only for the iOS/Android simulator case (never reachable
    // from a physical phone).
    apiBaseUrl: process.env.API_BASE_URL ?? config.extra?.apiBaseUrl ?? "http://localhost:3000",
  },
});
