import { useEffect } from 'react'
import { MapboxOverlay } from '@deck.gl/mapbox'
import { Tile3DLayer } from '@deck.gl/geo-layers'
import { useMap } from '../MapView/map-context.js'
import { flyToLngLat } from '../MapView/fly-to.js'
import { GOOGLE_3D_TILES_URL, KEYS, PHOTOREAL } from '../../config/map-config.js'

// Overlays Google Photorealistic 3D Tiles ON the existing MapLibre map using an
// interleaved deck.gl overlay (correct depth occlusion with the basemap labels).
// Only mounted in 'photoreal' mode, which itself requires a Google key.
const Photoreal3DLayer = ({ onAttribution }) => {
  const map = useMap()

  useEffect(() => {
    if (!map || !KEYS.google) return

    const overlay = new MapboxOverlay({ interleaved: true, layers: [] })
    map.addControl(overlay)

    const layer = new Tile3DLayer({
      id: 'google-photoreal-3d',
      data: GOOGLE_3D_TILES_URL,
      loadOptions: {
        fetch: { headers: { 'X-GOOG-API-KEY': KEYS.google } },
      },
      onTilesetLoad: (ts) => {
        // One stable detail level (no mid-load sharpen → no visible rebuild),
        // and a big cache so zoom/pan doesn't re-download tiles.
        ts.options.maximumScreenSpaceError = PHOTOREAL.screenSpaceError
        ts.options.maximumMemoryUsage = PHOTOREAL.maxMemoryMB
        const credits = ts?.credits?.attributions
        if (credits) onAttribution?.(credits)
      },
      // Click a building/the mesh to zoom into it.
      pickable: true,
      autoHighlight: false,
      onClick: (info) => {
        if (info?.coordinate) flyToLngLat(map, info.coordinate)
      },
    })

    overlay.setProps({ layers: [layer] })

    return () => {
      try {
        map.removeControl(overlay)
      } catch {
        // ignore teardown races
      }
      onAttribution?.('')
    }
  }, [map, onAttribution])

  return null
}

export default Photoreal3DLayer
