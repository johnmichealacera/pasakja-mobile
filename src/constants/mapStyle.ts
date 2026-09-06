/**
 * Free, key-less vector map style for the app.
 *
 * CARTO retired anonymous access to its old raster basemaps.cartocdn.com
 * tiles (unauthenticated requests now render an "API key required"
 * watermark over the map), so we use OpenFreeMap instead — a sponsored,
 * genuinely free, no-signup, no-key vector tile service built for MapLibre.
 * https://openfreemap.org
 */
export const MAP_STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";
