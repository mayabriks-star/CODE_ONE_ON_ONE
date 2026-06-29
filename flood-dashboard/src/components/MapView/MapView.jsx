import { useEffect, useRef, useState } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { BASEMAP_STYLE, CITY, VIEW_LIMITS, boundsFromCenter } from '../../config/map-config.js'
import { MapContext } from './map-context.js'
import './MapView.css'

// Boots a single MapLibre map (the base for the deck.gl photoreal overlay) and
// exposes it via context once loaded. Children render only after 'load' so they
// can safely add sources/layers.
const MapView = ({ children, onReady }) => {
  const containerRef = useRef(null)
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)

  useEffect(() => {
    const instance = new maplibregl.Map({
      container: containerRef.current,
      style: BASEMAP_STYLE,
      center: CITY.center,
      zoom: CITY.zoom,
      pitch: CITY.pitch,
      bearing: CITY.bearing,
      maxPitch: 85,
      minZoom: VIEW_LIMITS.minZoom,
      maxZoom: VIEW_LIMITS.maxZoom,
      maxBounds: boundsFromCenter(CITY.center, VIEW_LIMITS.radiusKm),
      antialias: true,
      attributionControl: false,
    })
    mapRef.current = instance

    instance.on('load', () => {
      setMap(instance)
      onReady?.(instance)
    })

    return () => {
      instance.remove()
      mapRef.current = null
      setMap(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="map-view">
      <div ref={containerRef} className="map-view__canvas" />
      <MapContext.Provider value={map}>
        {map ? children : null}
      </MapContext.Provider>
    </div>
  )
}

export default MapView
