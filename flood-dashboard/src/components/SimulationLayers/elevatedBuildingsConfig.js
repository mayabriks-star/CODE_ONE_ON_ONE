// ─── ELEVATED BUILDINGS CONFIG ───────────────────────────────────────────────
//
// camera: flyTo preset when the Elevated buildings toggle turns ON.
//   Set cameraDebugMode: true to see the live camera overlay + copy button.
//
// buildings: each entry has:
//   corners          — 4 draggable [lng,lat] points defining the building footprint
//   currentHeightMeters — height of the building block
//   elevationMeters  — how high it's lifted on stilts

export const ELEVATED_BUILDINGS_CONFIG = {

  // ── CAMERA ────────────────────────────────────────────────────────────────
  camera: {
    center:   [-80.18849, 25.762179],
    zoom:     17.67,
    pitch:    80,
    bearing:  -34.8,
    duration: 1400,
  },
  cameraDebugMode: false,

  // ── BUILDINGS ─────────────────────────────────────────────────────────────
  buildings: [
    {
      corners: [
        [-80.188886, 25.761574],  // C0
        [-80.188858, 25.761199],  // C1
        [-80.188120, 25.761062],  // C2
        [-80.188088, 25.761304],  // C3
      ],
      currentHeightMeters: 120,
      elevationMeters:      12,
    },
    {
      corners: [
        [-80.188977, 25.762266],  // C0
        [-80.188949, 25.761891],  // C1
        [-80.188211, 25.761754],  // C2
        [-80.188179, 25.761996],  // C3
      ],
      currentHeightMeters: 120,
      elevationMeters:      12,
    },
    {
      corners: [
        [-80.189121, 25.763047],  // C0
        [-80.189093, 25.762672],  // C1
        [-80.188355, 25.762535],  // C2
        [-80.188323, 25.762777],  // C3
      ],
      currentHeightMeters: 120,
      elevationMeters:      12,
    },
  ],

  // ── GEOMETRY ──────────────────────────────────────────────────────────────
  columnWidthMeters:  4,    // stilt column width at each corner
  opacity:            0.85,
  transitionDuration: 500,

  // ── APPEARANCE ────────────────────────────────────────────────────────────
  buildingColor: '#c8c0b4',
  columnColor:   '#a89e94',

  // ── DEBUG ─────────────────────────────────────────────────────────────────
  debugMode: true,
}
