import { useMap } from '../MapView/map-context.js'
import { PLACES, VIEW_LIMITS, boundsFromCenter } from '../../config/map-config.js'
import './PlacePicker.css'

// Jump between cities. Each switch re-bounds the camera to that city's area, so
// you stay over a finite, cacheable region (smooth movement, no rebuild).
const PlacePicker = ({ activeId, onChange }) => {
  const map = useMap()

  const go = (place) => {
    if (!place || !map) return
    // Jump straight there (no fly-over, so no trail of tiles loads en route),
    // then clamp the camera to the new city's area.
    map.setMaxBounds(null)
    map.jumpTo({
      center: place.center,
      zoom: place.zoom,
      pitch: place.pitch,
      bearing: place.bearing,
    })
    map.setMaxBounds(boundsFromCenter(place.center, VIEW_LIMITS.radiusKm))
    onChange(place)
  }

  return (
    <div className="place-picker">
      <select
        className="place-picker__select"
        value={activeId}
        onChange={(e) => go(PLACES.find((p) => p.id === e.target.value))}
        aria-label="Choose a city"
      >
        {PLACES.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export default PlacePicker
