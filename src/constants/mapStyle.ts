import type { StyleSpecification } from "@maplibre/maplibre-react-native";

/**
 * Free CartoDB Voyager raster tiles — no API key, no billing account, ever.
 * Mirrors the exact fallback the web app already uses when no Mapbox token is
 * set (see ../pasakja/lib/map-tiles.ts). Chosen deliberately over a Google
 * Maps or Mapbox integration to avoid any signup/billing dependency.
 */
export const VOYAGER_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    voyager: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
        "https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [{ id: "voyager-layer", type: "raster", source: "voyager" }],
};
