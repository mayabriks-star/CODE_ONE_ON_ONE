import { useState, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { SEA_WALL_CONFIG } from './seaWallConfig.js'

const SOURCE_DEBUG     = 'sim-wall-debug-src'
const LAYER_DEBUG_DOTS = 'sim-wall-debug-dots'

function lerp(a, b, t) { return a + (b - a) * t }

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  return { r, g, b }
}

function rgbToHex({ r, g, b }) {
  const toHex = v => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`
}

function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB)
  return rgbToHex({ r: lerp(a.r, b.r, t), g: lerp(a.g, b.g, t), b: lerp(a.b, b.b, t) })
}

/**
 * Build taper layer descriptors from config.
 * Layer 0: full-width base (0 → baseH)
 * Layers 1…N: linearly narrowing from baseWidth → topWidth (baseH → fullH)
 */
function buildTaperLayers(cfg) {
  const {
    seaWallBaseHeightMeters: baseH,
    seaWallHeightMeters:     fullH,
    seaWallBaseWidthMeters:  baseW,
    seaWallWidthMeters:      topW,
    seaWallTaperSteps:       N = 1,
    seaWallColor, seaWallBaseColor,
  } = cfg

  const layers = []
  // Base layer
  layers.push({ id: 'sim-wall-0', srcId: 'sim-wall-src-0', width: baseW, base: 0, top: baseH, color: seaWallBaseColor })

  const stepH = (fullH - baseH) / N
  for (let i = 0; i < N; i++) {
    const t = (i + 1) / N   // t=1 at top = full topWidth
    layers.push({
      id:    `sim-wall-${i + 1}`,
      srcId: `sim-wall-src-${i + 1}`,
      width: lerp(baseW, topW, t),
      base:  baseH + i * stepH,
      top:   baseH + (i + 1) * stepH,
      color: lerpColor(seaWallBaseColor, seaWallColor, t),
    })
  }
  return layers
}

function buildWallPolygon(path, widthMeters) {
  const midLat = path.reduce((s, p) => s + p[1], 0) / path.length
  const mPerLng = 111320 * Math.cos(midLat * Math.PI / 180)
  const mPerLat = 111320
  const hw = widthMeters / 2
  const left = [], right = []

  for (let i = 0; i < path.length; i++) {
    const [lng, lat] = path[i]
    const a = path[Math.max(0, i - 1)]
    const b = path[Math.min(path.length - 1, i + 1)]
    const dx = (b[0] - a[0]) * mPerLng
    const dy = (b[1] - a[1]) * mPerLat
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len, py = dx / len
    left.push([lng + px * hw / mPerLng, lat + py * hw / mPerLat])
    right.push([lng - px * hw / mPerLng, lat - py * hw / mPerLat])
  }
  return [...left, ...right.reverse()]
}

function buildDebugGeoJSON(path) {
  return {
    type: 'FeatureCollection',
    features: path.map(([lng, lat], i) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: { label: `P${i}` },
    })),
  }
}

function wallFeature(polygon) {
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [polygon] }, properties: {} }
}

const SimulationLayers = ({ map, activeMeasures }) => {
  const pathRef = useRef([...SEA_WALL_CONFIG.seaWallPathCoordinates])
  const [displayPath, setDisplayPath] = useState(pathRef.current)
  const [copied, setCopied] = useState(false)
  const taperLayers = buildTaperLayers(SEA_WALL_CONFIG)

  useEffect(() => {
    if (!map) return
    const cfg = SEA_WALL_CONFIG

    const addLayers = () => {
      // Add each taper layer
      taperLayers.forEach(({ id, srcId, width, base, top, color }) => {
        const polygon = buildWallPolygon(pathRef.current, width)
        if (!map.getSource(srcId)) {
          map.addSource(srcId, { type: 'geojson', data: wallFeature(polygon) })
        }
        if (!map.getLayer(id)) {
          map.addLayer({
            id, type: 'fill-extrusion', source: srcId,
            paint: {
              'fill-extrusion-color':   color,
              'fill-extrusion-base':    base,
              'fill-extrusion-height':  top,
              'fill-extrusion-opacity': 0,
              'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
            },
          })
        }
      })

      // Debug dots
      if (cfg.debugMode) {
        if (!map.getSource(SOURCE_DEBUG)) {
          map.addSource(SOURCE_DEBUG, { type: 'geojson', data: buildDebugGeoJSON(pathRef.current) })
        }
        if (!map.getLayer(LAYER_DEBUG_DOTS)) {
          map.addLayer({
            id: LAYER_DEBUG_DOTS, type: 'circle', source: SOURCE_DEBUG,
            paint: {
              'circle-radius': 7, 'circle-color': '#ffee00',
              'circle-stroke-color': '#000', 'circle-stroke-width': 1.5,
            },
          })
        }
      }
    }

    if (map.isStyleLoaded()) addLayers()
    else map.once('style.load', addLayers)

    return () => {
      ;[LAYER_DEBUG_DOTS, ...taperLayers.map(l => l.id)].forEach(id => {
        if (map.getLayer(id)) map.removeLayer(id)
      })
      ;[SOURCE_DEBUG, ...taperLayers.map(l => l.srcId)].forEach(id => {
        if (map.getSource(id)) map.removeSource(id)
      })
    }
  }, [map])

  // Toggle opacity on all taper layers
  useEffect(() => {
    if (!map) return
    const target = activeMeasures?.seaWall ? SEA_WALL_CONFIG.seaWallOpacity : 0
    taperLayers.forEach(({ id }) => {
      if (map.getLayer(id)) map.setPaintProperty(id, 'fill-extrusion-opacity', target)
    })
  }, [map, activeMeasures?.seaWall])

  // Draggable control point markers (debug mode only)
  useEffect(() => {
    if (!map || !SEA_WALL_CONFIG.debugMode) return

    const markers = pathRef.current.map(([lng, lat], i) => {
      const el = document.createElement('div')
      Object.assign(el.style, {
        width: '16px', height: '16px', borderRadius: '50%',
        background: '#ffee00', border: '2.5px solid rgba(0,0,0,0.85)',
        cursor: 'grab', boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '8px', fontWeight: 'bold', color: '#000',
      })
      el.textContent = i

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([lng, lat])
        .addTo(map)

      marker.on('drag', () => {
        const { lng: newLng, lat: newLat } = marker.getLngLat()
        pathRef.current = pathRef.current.map((p, j) =>
          j === i ? [+newLng.toFixed(6), +newLat.toFixed(6)] : p
        )
        // Update all taper layer sources
        taperLayers.forEach(({ srcId, width }) => {
          map.getSource(srcId)?.setData(wallFeature(buildWallPolygon(pathRef.current, width)))
        })
        map.getSource(SOURCE_DEBUG)?.setData(buildDebugGeoJSON(pathRef.current))
        setDisplayPath([...pathRef.current])
      })

      return marker
    })

    return () => markers.forEach(m => m.remove())
  }, [map])

  function copyPath() {
    const lines = pathRef.current
      .map(([lng, lat], i) => `    [${lng}, ${lat}],  // P${i}`)
      .join('\n')
    const text = `seaWallPathCoordinates: [\n${lines}\n  ],`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    })
  }

  if (!SEA_WALL_CONFIG.debugMode) return null

  return (
    <div style={{
      position: 'fixed', bottom: 220, right: 24, zIndex: 9999,
      background: 'rgba(10,12,18,0.9)', backdropFilter: 'blur(10px)',
      borderRadius: 12, padding: '12px 16px',
      border: '1px solid rgba(255,255,255,0.1)',
      fontFamily: 'monospace', fontSize: 11, color: '#e2e8f0',
      display: 'flex', flexDirection: 'column', gap: 3,
      minWidth: 250, maxHeight: 320, overflowY: 'auto',
      pointerEvents: 'auto',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: 4 }}>
        🧱 SEA WALL — drag numbered dots to reposition
      </div>
      {displayPath.map(([lng, lat], i) => (
        <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{
            background: '#ffee00', color: '#000', borderRadius: '50%',
            width: 16, height: 16, display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, flexShrink: 0,
          }}>{i}</span>
          <span style={{ color: '#94a3b8', flex: 1 }}>{lng}, {lat}</span>
        </div>
      ))}
      <button onClick={copyPath} style={{
        marginTop: 8, padding: '7px 0', borderRadius: 7, border: 'none',
        background: copied ? 'rgba(0,166,62,0.3)' : 'rgba(255,255,255,0.1)',
        color: copied ? '#4ade80' : '#f1f5f9',
        cursor: 'pointer', fontSize: 11, fontWeight: 600,
        transition: 'background 0.2s',
      }}>
        {copied ? '✓ Copied!' : '📋 Copy path to seaWallConfig'}
      </button>
    </div>
  )
}

export default SimulationLayers
