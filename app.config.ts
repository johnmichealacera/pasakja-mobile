import "dotenv/config";
import type { ConfigContext, ExpoConfig } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  android: {
    ...config.android,
    config: {
      ...config.android?.config,
      googleMaps: {
        apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID ?? "",
      },
    },
  },
  extra: {
    ...config.extra,
    // Overridable per machine/build via .env — see NEXT_STEPS.md. Defaults to
    // localhost only for the iOS/Android simulator case (never reachable
    // from a physical phone).
    apiBaseUrl: process.env.API_BASE_URL ?? config.extra?.apiBaseUrl ?? "http://localhost:3000",
  },
});
