import "dotenv/config";
import type { ConfigContext, ExpoConfig } from "expo/config";

// EAS Build sets this automatically during cloud builds.
const isProductionBuild = process.env.EAS_BUILD_PROFILE === "production";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...(config as ExpoConfig),
  extra: {
    ...config.extra,
    // Overridable per machine/build via .env — see NEXT_STEPS.md. Defaults to
    // localhost only for the iOS/Android simulator case (never reachable
    // from a physical phone).
    apiBaseUrl: process.env.API_BASE_URL ?? config.extra?.apiBaseUrl ?? "http://localhost:3000",
  },
  plugins: (config.plugins ?? []).map((plugin) => {
    if (Array.isArray(plugin) && plugin[0] === "expo-build-properties") {
      return [
        "expo-build-properties",
        {
          android: {
            // Cleartext (plain HTTP) is only needed for local LAN dev/preview
            // testing against a non-HTTPS dev server. Production always talks
            // to the HTTPS Vercel deployment, so keep it HTTPS-only there —
            // this is also what backs the Play Console Data Safety answer
            // that all collected data is encrypted in transit.
            usesCleartextTraffic: !isProductionBuild,
          },
        },
      ];
    }
    return plugin;
  }),
});
