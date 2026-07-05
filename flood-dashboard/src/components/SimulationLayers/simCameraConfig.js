// ─── SIMULATION CAMERA PRESET ───────────────────────────────────────────────
//
// Camera is positioned on the city/land side (west) looking east-northeast
// toward Biscayne Bay, so the sea wall's height and side faces are clearly
// visible against the water.
//
// Tuning:
//   center   [lng, lat] — point the camera aims at. Move east (increase lng)
//                         to frame more water; west for more city.
//   zoom     15 = neighbourhood block, 16 = building scale, 17 = close-up
//   pitch    0 = top-down, 85 = nearly horizontal. 65–78 = cinematic oblique.
//   bearing  compass direction camera faces: 0=N, 90=E, 180=S, 270=W
//            80 = looking ENE (from city toward bay, wall in mid-ground)
//   duration flyTo animation in ms

export const SIM_CAMERA = {
  center:   [-80.189597, 25.762573],
  zoom:     16.53,
  pitch:    85,
  bearing:  0,
  duration: 1400,
}
