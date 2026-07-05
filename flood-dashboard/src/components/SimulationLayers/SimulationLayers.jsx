import { useState, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { SEA_WALL_CONFIG } from './seaWallConfig.js'
import { RAISED_ROADS_CONFIG } from './raisedRoadsConfig.js'

// ─── Shared geometry helpers ──────────────────────────────────────────────────

function lerp(a, b, t) { return a + (b - a) * t }

function hexToRgb(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16) / 255,
    g: parseInt(hex.slice(3, 5), 16) / 255,
    b: parseInt(hex.slice(5, 7), 16) / 255,
  }
}
function rgbToHex({ r, g, b }) {
  const h = v => Math.round(v * 255).toString(16).padStart(2, '0')
  return `#${h(r)}${h(g)}${h(b)}`
}
function lerpColor(a, b, t) {
  const ca = hexToRgb(a), cb = hexToRgb(b)
  return rgbToHex({ r: lerp(ca.r, cb.r, t), g: lerp(ca.g, cb.g, t), b: lerp(ca.b, cb.b, t) })
}

function pathScale(path) {
  const midLat = path.reduce((s, p) => s + p[1], 0) / path.length
  return {
    mPerLng: 111320 * Math.cos(midLat * Math.PI / 180),
    mPerLat: 111320,
  }
}

function buildRibbonPolygon(path, widthMeters) {
  const { mPerLng, mPerLat } = pathScale(path)
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

function debugGeoJSON(path) {
  return {
    type: 'FeatureCollection',
    features: path.map(([lng, lat], i) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: { i },
    })),
  }
}

function polygonFeature(ring) {
  return { type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} }
}

// ─── Sea wall helpers ─────────────────────────────────────────────────────────

function buildTaperLayers(cfg) {
  const { seaWallBaseHeightMeters: baseH, seaWallHeightMeters: fullH,
          seaWallBaseWidthMeters: baseW, seaWallWidthMeters: topW,
          seaWallTaperSteps: N = 1, seaWallColor, seaWallBaseColor } = cfg
  const layers = [{ id: 'sw-0', srcId: 'sw-src-0', width: baseW, base: 0, top: baseH, color: seaWallBaseColor }]
  const stepH = (fullH - baseH) / N
  for (let i = 0; i < N; i++) {
    const t = (i + 1) / N
    layers.push({
      id: `sw-${i + 1}`, srcId: `sw-src-${i + 1}`,
      width: lerp(baseW, topW, t),
      base:  baseH + i * stepH,
      top:   baseH + (i + 1) * stepH,
      color: lerpColor(seaWallBaseColor, seaWallColor, t),
    })
  }
  return layers
}

// ─── Raised roads helpers ─────────────────────────────────────────────────────

function buildColumnPolygons(path, spacingM, colWidthM) {
  const { mPerLng, mPerLat } = pathScale(path)
  const hw = colWidthM / 2
  const dists = [0]
  for (let i = 1; i < path.length; i++) {
    const dx = (path[i][0] - path[i - 1][0]) * mPerLng
    const dy = (path[i][1] - path[i - 1][1]) * mPerLat
    dists.push(dists[i - 1] + Math.hypot(dx, dy))
  }
  const total = dists[dists.length - 1]
  const cols = []
  for (let d = spacingM / 2; d < total; d += spacingM) {
    let seg = 0
    while (seg < dists.length - 2 && dists[seg + 1] < d) seg++
    const segLen = dists[seg + 1] - dists[seg]
    if (segLen === 0) continue
    const t = (d - dists[seg]) / segLen
    const lng = lerp(path[seg][0], path[seg + 1][0], t)
    const lat = lerp(path[seg][1], path[seg + 1][1], t)
    const a = path[seg], b = path[seg + 1]
    const dx = (b[0] - a[0]) * mPerLng, dy = (b[1] - a[1]) * mPerLat
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len, py = dx / len
    const fx =  dx / len, fy = dy / len
    cols.push([
      [lng + (px - fx) * hw / mPerLng, lat + (py - fy) * hw / mPerLat],
      [lng + (px + fx) * hw / mPerLng, lat + (py + fy) * hw / mPerLat],
      [lng + (-px + fx) * hw / mPerLng, lat + (-py + fy) * hw / mPerLat],
      [lng + (-px - fx) * hw / mPerLng, lat + (-py - fy) * hw / mPerLat],
    ])
  }
  return cols
}

function buildColumnsGeoJSON(path, cfg) {
  return {
    type: 'FeatureCollection',
    features: buildColumnPolygons(path, cfg.columnSpacingMeters, cfg.columnWidthMeters)
      .map(ring => ({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [ring] }, properties: {} })),
  }
}


// ─── Draggable marker factory ─────────────────────────────────────────────────

function makeDraggableMarkers(map, pathRef, onDrag) {
  return pathRef.current.map(([lng, lat], i) => {
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
      .setLngLat([lng, lat]).addTo(map)
    marker.on('drag', () => {
      const { lng: nx, lat: ny } = marker.getLngLat()
      pathRef.current = pathRef.current.map((p, j) =>
        j === i ? [+nx.toFixed(6), +ny.toFixed(6)] : p)
      onDrag()
    })
    return marker
  })
}

// ─── Component ────────────────────────────────────────────────────────────────

const SimulationLayers = ({ map, activeMeasures }) => {
  const swPathRef = useRef([...SEA_WALL_CONFIG.seaWallPathCoordinates])
  const rrPathRef = useRef([...RAISED_ROADS_CONFIG.pathCoordinates])
  const [swDisplay, setSwDisplay] = useState(swPathRef.current)
  const [rrDisplay, setRrDisplay] = useState(rrPathRef.current)
  const [swCopied, setSwCopied] = useState(false)
  const [rrCopied, setRrCopied] = useState(false)
  const taperLayers = buildTaperLayers(SEA_WALL_CONFIG)

  // ── Sea wall: add layers ───────────────────────────────────────────────────
  useEffect(() => {
    if (!map) return
    const cfg = SEA_WALL_CONFIG
    const add = () => {
      taperLayers.forEach(({ id, srcId, width, base, top, color }) => {
        if (!map.getSource(srcId))
          map.addSource(srcId, { type: 'geojson', data: polygonFeature(buildRibbonPolygon(swPathRef.current, width)) })
        if (!map.getLayer(id))
          map.addLayer({ id, type: 'fill-extrusion', source: srcId, paint: {
            'fill-extrusion-color': color, 'fill-extrusion-base': base,
            'fill-extrusion-height': top, 'fill-extrusion-opacity': 0,
            'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
          }})
      })
      if (cfg.debugMode) {
        if (!map.getSource('sw-debug-src'))
          map.addSource('sw-debug-src', { type: 'geojson', data: debugGeoJSON(swPathRef.current) })
        if (!map.getLayer('sw-debug-dots'))
          map.addLayer({ id: 'sw-debug-dots', type: 'circle', source: 'sw-debug-src',
            paint: { 'circle-radius': 7, 'circle-color': '#ffee00', 'circle-stroke-color': '#000', 'circle-stroke-width': 1.5 } })
      }
    }
    if (map.isStyleLoaded()) add(); else map.once('style.load', add)
    return () => {
      ;['sw-debug-dots', ...taperLayers.map(l => l.id)].forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
      ;['sw-debug-src', ...taperLayers.map(l => l.srcId)].forEach(id => { if (map.getSource(id)) map.removeSource(id) })
    }
  }, [map])

  // ── Sea wall: opacity toggle ───────────────────────────────────────────────
  useEffect(() => {
    if (!map) return
    const v = activeMeasures?.seaWall ? SEA_WALL_CONFIG.seaWallOpacity : 0
    taperLayers.forEach(({ id }) => { if (map.getLayer(id)) map.setPaintProperty(id, 'fill-extrusion-opacity', v) })
  }, [map, activeMeasures?.seaWall])

  // ── Sea wall: draggable markers ────────────────────────────────────────────
  useEffect(() => {
    if (!map || !SEA_WALL_CONFIG.debugMode) return
    const markers = makeDraggableMarkers(map, swPathRef, () => {
      taperLayers.forEach(({ srcId, width }) =>
        map.getSource(srcId)?.setData(polygonFeature(buildRibbonPolygon(swPathRef.current, width))))
      map.getSource('sw-debug-src')?.setData(debugGeoJSON(swPathRef.current))
      setSwDisplay([...swPathRef.current])
    })
    return () => markers.forEach(m => m.remove())
  }, [map])

  // ── Raised roads: add layers ───────────────────────────────────────────────
  useEffect(() => {
    if (!map) return
    const cfg = RAISED_ROADS_CONFIG
    const slabBase = cfg.roadHeightMeters - cfg.slabThicknessMeters

const add = () => {
      const deckLayerId = map.getStyle()?.layers?.find(l => l.type === 'custom')?.id

      // Support columns
      try {
        if (!map.getSource('rr-cols-src'))
          map.addSource('rr-cols-src', { type: 'geojson', data: buildColumnsGeoJSON(rrPathRef.current, cfg) })
        if (!map.getLayer('rr-cols-layer'))
          map.addLayer({ id: 'rr-cols-layer', type: 'fill-extrusion', source: 'rr-cols-src', paint: {
            'fill-extrusion-color': cfg.columnColor, 'fill-extrusion-base': 0,
            'fill-extrusion-height': slabBase, 'fill-extrusion-opacity': 0,
            'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
          }}, deckLayerId)
      } catch (e) { console.warn('[SimulationLayers] column layer error:', e) }

      // Road deck slab
      try {
        if (!map.getSource('rr-slab-src'))
          map.addSource('rr-slab-src', { type: 'geojson',
            data: polygonFeature(buildRibbonPolygon(rrPathRef.current, cfg.roadWidthMeters)) })
        if (!map.getLayer('rr-slab-layer'))
          map.addLayer({ id: 'rr-slab-layer', type: 'fill-extrusion', source: 'rr-slab-src', paint: {
            'fill-extrusion-color': cfg.roadColor, 'fill-extrusion-base': slabBase,
            'fill-extrusion-height': cfg.roadHeightMeters, 'fill-extrusion-opacity': 0,
            'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
          }}, deckLayerId)
      } catch (e) { console.warn('[SimulationLayers] slab layer error:', e) }

      // Debug dots (all points including P0)
      if (cfg.debugMode) {
        if (!map.getSource('rr-debug-src'))
          map.addSource('rr-debug-src', { type: 'geojson', data: debugGeoJSON(rrPathRef.current) })
        if (!map.getLayer('rr-debug-dots'))
          map.addLayer({ id: 'rr-debug-dots', type: 'circle', source: 'rr-debug-src',
            paint: { 'circle-radius': 7, 'circle-color': '#00ddff', 'circle-stroke-color': '#000', 'circle-stroke-width': 1.5 } })
      }
    }

    const tryAdd = () => { if (!map.getSource('rr-slab-src')) add() }
    tryAdd()
    map.on('styledata', tryAdd)
    return () => {
      map.off('styledata', tryAdd)
      ;['rr-debug-dots', 'rr-slab-layer', 'rr-cols-layer'].forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
      ;['rr-debug-src', 'rr-slab-src', 'rr-cols-src'].forEach(id => { if (map.getSource(id)) map.removeSource(id) })
    }
  }, [map])

  // ── Raised roads: opacity toggle ───────────────────────────────────────────
  useEffect(() => {
    if (!map) return
    const v = activeMeasures?.raisedRoads ? RAISED_ROADS_CONFIG.opacity : 0
    ;['rr-cols-layer', 'rr-slab-layer'].forEach(id => {
      if (map.getLayer(id)) map.setPaintProperty(id, 'fill-extrusion-opacity', v)
    })
  }, [map, activeMeasures?.raisedRoads])

  // ── Raised roads: draggable markers ───────────────────────────────────────
  useEffect(() => {
    if (!map || !RAISED_ROADS_CONFIG.debugMode) return
    const cfg = RAISED_ROADS_CONFIG
    const markers = makeDraggableMarkers(map, rrPathRef, () => {
      map.getSource('rr-slab-src')?.setData(polygonFeature(buildRibbonPolygon(rrPathRef.current, cfg.roadWidthMeters)))
      map.getSource('rr-cols-src')?.setData(buildColumnsGeoJSON(rrPathRef.current, cfg))
      map.getSource('rr-debug-src')?.setData(debugGeoJSON(rrPathRef.current))
      setRrDisplay([...rrPathRef.current])
    })
    return () => markers.forEach(m => m.remove())
  }, [map])

  // ── Copy helpers ───────────────────────────────────────────────────────────
  function copyPath(pathRef, setCopied, key) {
    const lines = pathRef.current.map(([lng, lat], i) => `    [${lng}, ${lat}],  // P${i}`).join('\n')
    navigator.clipboard.writeText(`${key}: [\n${lines}\n  ],`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    })
  }

  // ── Debug panels ───────────────────────────────────────────────────────────
  const panelStyle = (bottom, accent) => ({
    position: 'fixed', bottom, right: 24, zIndex: 9999,
    background: 'rgba(10,12,18,0.9)', backdropFilter: 'blur(10px)',
    borderRadius: 12, padding: '12px 16px',
    border: `1px solid ${accent}33`,
    fontFamily: 'monospace', fontSize: 11, color: '#e2e8f0',
    display: 'flex', flexDirection: 'column', gap: 3,
    minWidth: 250, maxHeight: 300, overflowY: 'auto',
    pointerEvents: 'auto',
  })

  const dotStyle = (color) => ({
    background: color, color: '#000', borderRadius: '50%',
    width: 16, height: 16, display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center',
    fontSize: 9, fontWeight: 700, flexShrink: 0,
  })

  const btnStyle = (copied, accent) => ({
    marginTop: 8, padding: '7px 0', borderRadius: 7, border: 'none',
    background: copied ? 'rgba(0,166,62,0.3)' : 'rgba(255,255,255,0.1)',
    color: copied ? '#4ade80' : '#f1f5f9',
    cursor: 'pointer', fontSize: 11, fontWeight: 600,
    transition: 'background 0.2s',
  })

  return (
    <>
      {SEA_WALL_CONFIG.debugMode && (
        <div style={panelStyle(240, '#ffee00')}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: 4 }}>
            🧱 SEA WALL — drag yellow dots
          </div>
          {swDisplay.map(([lng, lat], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={dotStyle('#ffee00')}>{i}</span>
              <span style={{ color: '#94a3b8' }}>{lng}, {lat}</span>
            </div>
          ))}
          <button onClick={() => copyPath(swPathRef, setSwCopied, 'seaWallPathCoordinates')} style={btnStyle(swCopied, '#ffee00')}>
            {swCopied ? '✓ Copied!' : '📋 Copy path'}
          </button>
        </div>
      )}
      {RAISED_ROADS_CONFIG.debugMode && (
        <div style={panelStyle(24, '#00ddff')}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: 4 }}>
            🛣️ RAISED ROADS — drag cyan dots
          </div>
          {rrDisplay.map(([lng, lat], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={dotStyle('#00ddff')}>{i}</span>
              <span style={{ color: '#94a3b8' }}>{lng}, {lat}</span>
            </div>
          ))}
          <button onClick={() => copyPath(rrPathRef, setRrCopied, 'pathCoordinates')} style={btnStyle(rrCopied, '#00ddff')}>
            {rrCopied ? '✓ Copied!' : '📋 Copy path'}
          </button>
        </div>
      )}
    </>
  )
}

export default SimulationLayers
