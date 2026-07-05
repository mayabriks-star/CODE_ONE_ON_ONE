// ─── SEA WALL CONFIG ────────────────────────────────────────────────────────
//
// Edit this file to reposition, resize, or restyle the sea wall layer.
// Set debugMode: true to see control points + centerline drawn on the map.

export const SEA_WALL_CONFIG = {

  // ── PATH ──────────────────────────────────────────────────────────────────
  // Centerline ordered N→S along the bay-facing (eastern) edge of the
  // Brickell / Harbor District flood zone.
  // In Miami Brickell: EAST = less-negative longitude = toward Biscayne Bay.
  // Move any point EAST (increase lng, e.g. -80.187 → -80.186) to push it
  // further into the bay; move WEST (decrease) to pull it landward.

  seaWallPathCoordinates: [
    [-80.187523, 25.760104],  // P0
    [-80.187538, 25.759791],  // P1
    [-80.187567, 25.759180],  // P2
    [-80.187651, 25.758398],  // P3
    [-80.187723, 25.757876],  // P4
    [-80.187884, 25.757001],  // P5
    [-80.188197, 25.756020],  // P6
    [-80.188566, 25.755103],  // P7
  ],

  // ── GEOMETRY ──────────────────────────────────────────────────────────────
  seaWallWidthMeters:      8,   // top section width
  seaWallBaseWidthMeters: 22,   // base section width — wider for tapered look
  seaWallHeightMeters:    20,   // total height
  seaWallBaseHeightMeters: 5,   // height of the wide base section
  seaWallTaperSteps:      14,   // intermediate steps between base and top — higher = smoother taper

  // ── APPEARANCE ────────────────────────────────────────────────────────────
  seaWallColor:        '#b8b0a8',  // warm light gray — weathered coastal concrete
  seaWallBaseColor:    '#9e9690',  // slightly darker for the base
  seaWallOpacity:      0.92,
  transitionDuration:  500,        // toggle fade in ms

  // ── DEBUG ─────────────────────────────────────────────────────────────────
  // true  → draws the centerline (magenta line) + each control point (yellow dot)
  //         so you can verify placement against the actual 3D tiles.
  // false → only the extruded wall is visible.
  debugMode: true,
}
