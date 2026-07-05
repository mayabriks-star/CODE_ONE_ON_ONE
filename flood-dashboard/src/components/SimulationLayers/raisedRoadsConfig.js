// ─── RAISED ROADS CONFIG ─────────────────────────────────────────────────────
//
// Edit pathCoordinates to reposition the road. Set debugMode: true to show
// draggable yellow control points you can drag on the map.
// Set debugMode: false when placement is confirmed.

export const RAISED_ROADS_CONFIG = {

  // ── PATH ──────────────────────────────────────────────────────────────────
  // Centerline ordered along the road. Drag numbered dots on the map to
  // reposition, then copy the output into pathCoordinates.
  pathCoordinates: [
    [-80.190648, 25.755889],  // P0
    [-80.190200, 25.756011],  // P1
    [-80.189830, 25.756211],  // P2
    [-80.189399, 25.756610],  // P3
    [-80.189198, 25.757317],  // P4
  ],

  // ── GEOMETRY ──────────────────────────────────────────────────────────────
  roadWidthMeters:      20,   // width of the road deck
  roadHeightMeters:     18,   // elevation of the road surface
  slabThicknessMeters:   3,   // thickness of the road deck slab
  columnWidthMeters:     5,   // square column width
  columnSpacingMeters:  12,   // distance between column centers

  // ── APPEARANCE ────────────────────────────────────────────────────────────
  roadColor:    '#a0a0a0',   // concrete road deck
  columnColor:  '#7d7d7d',   // slightly darker columns
  opacity:      0.92,
  transitionDuration: 500,

  // ── DEBUG ─────────────────────────────────────────────────────────────────
  debugMode: false,
}
