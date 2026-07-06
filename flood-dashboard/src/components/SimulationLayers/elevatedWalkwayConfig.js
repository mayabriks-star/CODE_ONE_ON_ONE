// ─── ELEVATED WALKWAY CONFIG ─────────────────────────────────────────────────
//
// Edit pathCoordinates to reposition the walkway. Set debugMode: true to show
// draggable gold control points you can drag on the map, then copy output into
// pathCoordinates. Set debugMode: false when placement is confirmed.

export const ELEVATED_WALKWAY_CONFIG = {

  // ── PATH ──────────────────────────────────────────────────────────────────
  pathCoordinates: [
    [-80.188289, 25.765179],  // P0
    [-80.187953, 25.765011],  // P1
    [-80.187010, 25.764942],  // P2
    [-80.186516, 25.764986],  // P3
    [-80.185310, 25.765314],  // P4
  ],

  // ── GEOMETRY ──────────────────────────────────────────────────────────────
  deckWidthMeters:      12,   // width of the walkway deck
  deckHeightMeters:     20,   // elevation of deck surface above ground
  slabThicknessMeters:  1.5,  // thickness of deck slab
  columnWidthMeters:    4,    // square column footprint
  columnSpacingMeters:  12,   // distance between column centers
  railingWidthMeters:   2,    // thickness of each railing strip
  railingHeightMeters:  2.5,  // railing height above deck surface

  // ── APPEARANCE ────────────────────────────────────────────────────────────
  deckColor:    '#b8b2a8',   // concrete deck
  columnColor:  '#8a8480',   // darker concrete columns
  railingColor: '#ccc8c2',   // light concrete railings
  opacity:      0.92,
  transitionDuration: 500,

  // ── CAMERA ────────────────────────────────────────────────────────────────
  // Activated when the utility protection toggle is turned on.
  // Set cameraDebugMode: true to show the CameraDebugOverlay, then adjust
  // these values and set false when satisfied.
  camera: {
    center:   [-80.187406, 25.765223],
    zoom:     18.28,
    pitch:    74,
    bearing:  -19.9,
    duration: 1400,
  },
  cameraDebugMode: false,

  // ── DEBUG ─────────────────────────────────────────────────────────────────
  debugMode: false,
}
