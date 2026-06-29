// Central map configuration. Edit `CITY` to recenter the whole app.

// Places you can jump between. Each becomes a bounded, cacheable area.
export const PLACES = [
  { id: 'miami', name: 'Miami', center: [-80.1918, 25.765], zoom: 16, pitch: 50, bearing: -20 },
  { id: 'nyc', name: 'New York', center: [-73.9857, 40.7484], zoom: 16, pitch: 50, bearing: 0 },
  { id: 'sf', name: 'San Francisco', center: [-122.4012, 37.7946], zoom: 16, pitch: 50, bearing: 0 },
  { id: 'london', name: 'London', center: [-0.1246, 51.5007], zoom: 16, pitch: 50, bearing: 30 },
  { id: 'dubai', name: 'Dubai', center: [55.2744, 25.1972], zoom: 16, pitch: 50, bearing: 0 },
]

// Default place on load.
export const CITY = PLACES[0]

// Constrain the camera so you stay over one city — this keeps the set of 3D
// tiles finite, so the area stays cached and movement is smooth (no rebuild).
//   radiusKm: half-width of the allowed box around a place's center.
//   minZoom: can't zoom out far enough to pull in a huge region.
export const VIEW_LIMITS = {
  radiusKm: 3,
  minZoom: 14,
  maxZoom: 18.5,
}

// Axis-aligned bounds box around a center point, for map.setMaxBounds().
export const boundsFromCenter = ([lng, lat], radiusKm) => {
  const dLat = radiusKm / 111
  const dLng = radiusKm / (111 * Math.cos((lat * Math.PI) / 180))
  return [
    [lng - dLng, lat - dLat],
    [lng + dLng, lat + dLat],
  ]
}

// The app renders Google Photoreal 3D on top, which covers the ground entirely,
// so we use an empty base (no OpenFreeMap tiles to download) for a faster load.
// The dark background shows only past the edge of the 3D tiles, like sky.
export const BASEMAP_STYLE = {
  version: 8,
  sources: {},
  layers: [{ id: 'bg', type: 'background', paint: { 'background-color': '#0b0e14' } }],
}

// Google Photorealistic 3D Tiles (key-gated, paid).
export const GOOGLE_3D_TILES_URL = 'https://tile.googleapis.com/v1/3dtiles/root.json'

// Photoreal load/stability tuning.
//   screenSpaceError: ONE stable detail level. Higher = fewer tiles = faster
//     first load, but more to fill in when you zoom IN. Lower = fuller detail
//     loaded up front, so less rebuilding on zoom (but slower first load).
//     ~28 = fast, ~20 = fuller/stabler, ~16 = sharpest.
//   maxMemoryMB: tile cache size. Big = areas you've already seen stay loaded
//     (no re-download / rebuild when you pan or zoom back), and avoids the
//     memory-pressure tile coarsening that also looks like a rebuild.
export const PHOTOREAL = {
  screenSpaceError: 24,
  maxMemoryMB: 4096,
}

// Click-to-zoom behaviour. Gentle: nudge in a little toward the clicked spot
// rather than slamming all the way in.
//   zoomIncrement: how many zoom levels to add per click.
//   maxZoom: never auto-zoom past this.
export const CLICK_ZOOM = {
  zoomIncrement: 0.6,
  maxZoom: 17.5,
}

// Google Maps key (required for the photoreal tiles). Empty when not provided.
export const KEYS = {
  google: import.meta.env.VITE_GOOGLE_MAPS_KEY ?? '',
}
