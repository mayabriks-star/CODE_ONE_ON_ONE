import { CLICK_ZOOM } from '../../config/map-config.js'

// Smoothly recenters on a clicked point and zooms in a little (gentle, not a
// full slam-in). Used by the deck.gl photoreal mesh on click.
export const flyToLngLat = (map, lngLat, { duration = 900 } = {}) => {
  if (!map || !lngLat) return
  const targetZoom = Math.min(map.getZoom() + CLICK_ZOOM.zoomIncrement, CLICK_ZOOM.maxZoom)
  map.flyTo({
    center: lngLat,
    zoom: Math.max(targetZoom, map.getZoom()), // never zoom out
    duration,
    essential: true,
  })
}
