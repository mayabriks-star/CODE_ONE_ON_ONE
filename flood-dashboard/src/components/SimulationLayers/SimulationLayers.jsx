import { useState, useEffect, useRef } from 'react'
import maplibregl from 'maplibre-gl'
import { SEA_WALL_CONFIG } from './seaWallConfig.js'
import { RAISED_ROADS_CONFIG } from './raisedRoadsConfig.js'
import { ELEVATED_BUILDINGS_CONFIG } from './elevatedBuildingsConfig.js'
import { ELEVATED_WALKWAY_CONFIG } from './elevatedWalkwayConfig.js'

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


// ─── Elevated walkway helpers ─────────────────────────────────────────────────

function offsetPath(path, offsetMeters) {
  const { mPerLng, mPerLat } = pathScale(path)
  return path.map((pt, i) => {
    const a = path[Math.max(0, i - 1)]
    const b = path[Math.min(path.length - 1, i + 1)]
    const dx = (b[0] - a[0]) * mPerLng
    const dy = (b[1] - a[1]) * mPerLat
    const len = Math.hypot(dx, dy) || 1
    const px = -dy / len, py = dx / len
    return [pt[0] + px * offsetMeters / mPerLng, pt[1] + py * offsetMeters / mPerLat]
  })
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

  // ── Elevated buildings state ───────────────────────────────────────────────
  const ebCornersRefs = useRef(ELEVATED_BUILDINGS_CONFIG.buildings.map(b => [...b.corners]))
  const [ebDisplay, setEbDisplay] = useState(ebCornersRefs.current)
  const [ebCopied, setEbCopied] = useState(false)
  const ebElevationRef = useRef(ELEVATED_BUILDINGS_CONFIG.buildings[0].elevationMeters)
  const [ebElevation, setEbElevation] = useState(ebElevationRef.current)
  const ebCornerMarkersRef = useRef([])  // [building][corner] → Marker
  const ebHeightHandleRef  = useRef([])  // [building] → Marker

  // ── Elevated walkway state ─────────────────────────────────────────────────
  const ewPathRef = useRef([...ELEVATED_WALKWAY_CONFIG.pathCoordinates])
  const [ewDisplay, setEwDisplay] = useState(ewPathRef.current)
  const [ewCopied, setEwCopied] = useState(false)

  // ── Elevated buildings: add layers ────────────────────────────────────────
  useEffect(() => {
    if (!map) return
    const cfg = ELEVATED_BUILDINGS_CONFIG

    const add = () => {
      const deckLayerId = map.getStyle()?.layers?.find(l => l.type === 'custom')?.id

      cfg.buildings.forEach((bldg, i) => {
        const corners = ebCornersRefs.current[i]
        const elev = bldg.elevationMeters
        const top  = elev + bldg.currentHeightMeters

        // Corner columns — extend 1m into the block to eliminate gap
        const colsId  = `eb-cols-${i}`
        const colsSrc = `eb-cols-src-${i}`
        const { mPerLng, mPerLat } = pathScale(corners)
        const hw = cfg.columnWidthMeters / 2
        const colFeatures = corners.map(([lng, lat]) => ({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[
            [lng - hw / mPerLng, lat - hw / mPerLat],
            [lng + hw / mPerLng, lat - hw / mPerLat],
            [lng + hw / mPerLng, lat + hw / mPerLat],
            [lng - hw / mPerLng, lat + hw / mPerLat],
          ]]}, properties: {},
        }))
        try {
          if (!map.getSource(colsSrc))
            map.addSource(colsSrc, { type: 'geojson', data: { type: 'FeatureCollection', features: colFeatures } })
          if (!map.getLayer(colsId))
            map.addLayer({ id: colsId, type: 'fill-extrusion', source: colsSrc, paint: {
              'fill-extrusion-color': cfg.columnColor, 'fill-extrusion-base': 0,
              'fill-extrusion-height': elev, 'fill-extrusion-opacity': 0,
              'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
            }}, deckLayerId)
        } catch (e) { console.warn('[EB] columns error:', e) }

        // Building block
        const blkId  = `eb-block-${i}`
        const blkSrc = `eb-block-src-${i}`
        try {
          if (!map.getSource(blkSrc))
            map.addSource(blkSrc, { type: 'geojson',
              data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [corners] }, properties: {} } })
          if (!map.getLayer(blkId))
            map.addLayer({ id: blkId, type: 'fill-extrusion', source: blkSrc, paint: {
              'fill-extrusion-color': cfg.buildingColor, 'fill-extrusion-base': elev,
              'fill-extrusion-height': top, 'fill-extrusion-opacity': 0,
              'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
            }}, deckLayerId)
        } catch (e) { console.warn('[EB] block error:', e) }

        // Debug dots
        if (cfg.debugMode) {
          const dbgId  = `eb-debug-${i}`
          const dbgSrc = `eb-debug-src-${i}`
          if (!map.getSource(dbgSrc))
            map.addSource(dbgSrc, { type: 'geojson', data: debugGeoJSON(corners) })
          if (!map.getLayer(dbgId))
            map.addLayer({ id: dbgId, type: 'circle', source: dbgSrc,
              paint: { 'circle-radius': 7, 'circle-color': '#00ff88', 'circle-stroke-color': '#000', 'circle-stroke-width': 1.5 } })
        }
      })
    }

    const tryAdd = () => { if (!map.getSource('eb-block-src-0')) add() }
    tryAdd()
    map.on('styledata', tryAdd)
    return () => {
      map.off('styledata', tryAdd)
      cfg.buildings.forEach((_, i) => {
        ;[`eb-debug-${i}`, `eb-block-${i}`, `eb-cols-${i}`].forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
        ;[`eb-debug-src-${i}`, `eb-block-src-${i}`, `eb-cols-src-${i}`].forEach(id => { if (map.getSource(id)) map.removeSource(id) })
      })
    }
  }, [map])

  // ── Elevated buildings: opacity toggle ────────────────────────────────────
  useEffect(() => {
    if (!map) return
    const v = activeMeasures?.elevatedBuildings ? ELEVATED_BUILDINGS_CONFIG.opacity : 0
    ELEVATED_BUILDINGS_CONFIG.buildings.forEach((_, i) => {
      ;[`eb-block-${i}`, `eb-cols-${i}`].forEach(id => {
        if (map.getLayer(id)) map.setPaintProperty(id, 'fill-extrusion-opacity', v)
      })
    })
  }, [map, activeMeasures?.elevatedBuildings])

  // ── Elevated buildings: remove debug layers when debugMode is off ─────────
  useEffect(() => {
    if (!map || ELEVATED_BUILDINGS_CONFIG.debugMode) return
    ELEVATED_BUILDINGS_CONFIG.buildings.forEach((_, i) => {
      if (map.getLayer(`eb-debug-${i}`)) map.removeLayer(`eb-debug-${i}`)
      if (map.getSource(`eb-debug-src-${i}`)) map.removeSource(`eb-debug-src-${i}`)
    })
  }, [map])

  // ── Elevated buildings: draggable corner markers ──────────────────────────
  useEffect(() => {
    if (!map || !ELEVATED_BUILDINGS_CONFIG.debugMode) return
    const cfg = ELEVATED_BUILDINGS_CONFIG
    const allMarkers = []
    ebCornerMarkersRef.current = []

    cfg.buildings.forEach((bldg, bi) => {
      const corners = ebCornersRefs.current[bi]
      const buildingMarkers = corners.map(([lng, lat], ci) => {
        const el = document.createElement('div')
        Object.assign(el.style, {
          width: '16px', height: '16px', borderRadius: '50%',
          background: '#00ff88', border: '2.5px solid rgba(0,0,0,0.85)',
          cursor: 'grab', boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '8px', fontWeight: 'bold', color: '#000',
        })
        el.textContent = `${bi}.${ci}`
        const marker = new maplibregl.Marker({ element: el, draggable: true })
          .setLngLat([lng, lat]).addTo(map)

        const redrawBuilding = (bi, updatedCorners) => {
          const hw = cfg.columnWidthMeters / 2
          const { mPerLng, mPerLat } = pathScale(updatedCorners)
          const colFeatures = updatedCorners.map(([cLng, cLat]) => ({
            type: 'Feature',
            geometry: { type: 'Polygon', coordinates: [[
              [cLng - hw / mPerLng, cLat - hw / mPerLat],
              [cLng + hw / mPerLng, cLat - hw / mPerLat],
              [cLng + hw / mPerLng, cLat + hw / mPerLat],
              [cLng - hw / mPerLng, cLat + hw / mPerLat],
            ]]}, properties: {},
          }))
          map.getSource(`eb-cols-src-${bi}`)?.setData({ type: 'FeatureCollection', features: colFeatures })
          map.getSource(`eb-block-src-${bi}`)?.setData({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [updatedCorners] }, properties: {} })
          map.getSource(`eb-debug-src-${bi}`)?.setData(debugGeoJSON(updatedCorners))
        }

        marker.on('drag', () => {
          const { lng: nx, lat: ny } = marker.getLngLat()
          ebCornersRefs.current[bi] = ebCornersRefs.current[bi].map((c, j) =>
            j === ci ? [+nx.toFixed(6), +ny.toFixed(6)] : c)
          redrawBuilding(bi, ebCornersRefs.current[bi])
          setEbDisplay(ebCornersRefs.current.map(c => [...c]))
        })
        return marker
      })
      ebCornerMarkersRef.current[bi] = buildingMarkers
      allMarkers.push(...buildingMarkers)
    })
    return () => { allMarkers.forEach(m => m.remove()); ebCornerMarkersRef.current = [] }
  }, [map])

  // ── Elevated buildings: height drag handle ────────────────────────────────
  useEffect(() => {
    if (!map || !ELEVATED_BUILDINGS_CONFIG.debugMode) return
    const cfg = ELEVATED_BUILDINGS_CONFIG

    ebHeightHandleRef.current = []

    cfg.buildings.forEach((bldg, i) => {
      const corners = ebCornersRefs.current[i]
      const centerLng = corners.reduce((s, c) => s + c[0], 0) / corners.length
      const centerLat = corners.reduce((s, c) => s + c[1], 0) / corners.length

      const el = document.createElement('div')
      Object.assign(el.style, {
        width: '22px', height: '22px', borderRadius: '50%',
        background: '#ff9f00', border: '2.5px solid rgba(0,0,0,0.85)',
        cursor: 'ns-resize', boxShadow: '0 2px 10px rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '11px', color: '#000', fontWeight: '900',
      })
      el.textContent = '↕'
      el.title = `בניין ${i} — גרור צפונה להאריך / דרומה לקצר`

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([centerLng, centerLat]).addTo(map)
      ebHeightHandleRef.current[i] = marker

      let startLat = centerLat, startElev = ebElevationRef.current
      marker.on('dragstart', () => { startLat = marker.getLngLat().lat; startElev = ebElevationRef.current })
      marker.on('drag', () => {
        const { lat: curLat, lng: curLng } = marker.getLngLat()
        const newElev = Math.max(1, Math.round(startElev + (curLat - startLat) * 111000))
        ebElevationRef.current = newElev
        cfg.buildings.forEach((b, j) => {
          if (map.getLayer(`eb-cols-${j}`)) map.setPaintProperty(`eb-cols-${j}`, 'fill-extrusion-height', newElev)
          if (map.getLayer(`eb-block-${j}`)) {
            map.setPaintProperty(`eb-block-${j}`, 'fill-extrusion-base', newElev)
            map.setPaintProperty(`eb-block-${j}`, 'fill-extrusion-height', newElev + b.currentHeightMeters)
          }
        })
        marker.setLngLat([curLng, curLat])
        setEbElevation(newElev)
      })
    })

    return () => { ebHeightHandleRef.current.forEach(m => m?.remove()); ebHeightHandleRef.current = [] }
  }, [map])

  // ── Elevated buildings: translate handle (per building) ───────────────────
  useEffect(() => {
    if (!map || !ELEVATED_BUILDINGS_CONFIG.debugMode) return
    const cfg = ELEVATED_BUILDINGS_CONFIG
    const allHandles = []

    cfg.buildings.forEach((_, bi) => {
      const corners = ebCornersRefs.current[bi]
      const centerLng = corners.reduce((s, c) => s + c[0], 0) / corners.length
      const centerLat = corners.reduce((s, c) => s + c[1], 0) / corners.length

      const el = document.createElement('div')
      Object.assign(el.style, {
        width: '26px', height: '26px', borderRadius: '6px',
        background: '#7c3aed', border: '2.5px solid rgba(0,0,0,0.85)',
        cursor: 'move', boxShadow: '0 2px 10px rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '14px', color: '#fff',
      })
      el.textContent = '✥'
      el.title = `גרור להזזת בניין ${bi}`

      const marker = new maplibregl.Marker({ element: el, draggable: true })
        .setLngLat([centerLng, centerLat]).addTo(map)
      allHandles.push(marker)

      let startLng = centerLng, startLat = centerLat
      let startCorners = ebCornersRefs.current[bi].map(c => [...c])

      marker.on('dragstart', () => {
        const pos = marker.getLngLat()
        startLng = pos.lng; startLat = pos.lat
        startCorners = ebCornersRefs.current[bi].map(c => [...c])
      })

      marker.on('drag', () => {
        const { lng: curLng, lat: curLat } = marker.getLngLat()
        const dLng = curLng - startLng
        const dLat = curLat - startLat

        ebCornersRefs.current[bi] = startCorners.map(([lng, lat]) =>
          [+(lng + dLng).toFixed(6), +(lat + dLat).toFixed(6)])

        const updatedCorners = ebCornersRefs.current[bi]
        const hw = cfg.columnWidthMeters / 2
        const { mPerLng, mPerLat } = pathScale(updatedCorners)
        const colFeatures = updatedCorners.map(([cLng, cLat]) => ({
          type: 'Feature',
          geometry: { type: 'Polygon', coordinates: [[
            [cLng - hw / mPerLng, cLat - hw / mPerLat],
            [cLng + hw / mPerLng, cLat - hw / mPerLat],
            [cLng + hw / mPerLng, cLat + hw / mPerLat],
            [cLng - hw / mPerLng, cLat + hw / mPerLat],
          ]]}, properties: {},
        }))
        map.getSource(`eb-cols-src-${bi}`)?.setData({ type: 'FeatureCollection', features: colFeatures })
        map.getSource(`eb-block-src-${bi}`)?.setData({ type: 'Feature', geometry: { type: 'Polygon', coordinates: [updatedCorners] }, properties: {} })
        map.getSource(`eb-debug-src-${bi}`)?.setData(debugGeoJSON(updatedCorners))

        // Reposition corner markers for this building
        const cornerMarkers = ebCornerMarkersRef.current[bi] ?? []
        updatedCorners.forEach(([lng, lat], ci) => cornerMarkers[ci]?.setLngLat([lng, lat]))

        // Reposition height handle for this building
        const newCenterLng = updatedCorners.reduce((s, c) => s + c[0], 0) / updatedCorners.length
        const newCenterLat = updatedCorners.reduce((s, c) => s + c[1], 0) / updatedCorners.length
        ebHeightHandleRef.current[bi]?.setLngLat([newCenterLng, newCenterLat])

        setEbDisplay(ebCornersRefs.current.map(c => [...c]))
      })
    })

    return () => allHandles.forEach(m => m.remove())
  }, [map])

  // ── Elevated walkway: add layers ───────────────────────────────────────────
  useEffect(() => {
    if (!map) return
    const cfg = ELEVATED_WALKWAY_CONFIG
    const slabBase = cfg.deckHeightMeters - cfg.slabThicknessMeters
    const railingTop = cfg.deckHeightMeters + cfg.railingHeightMeters
    const edgeOffset = (cfg.deckWidthMeters / 2) - (cfg.railingWidthMeters / 2)

    const add = () => {
      const deckLayerId = map.getStyle()?.layers?.find(l => l.type === 'custom')?.id

      try {
        if (!map.getSource('ew-cols-src'))
          map.addSource('ew-cols-src', { type: 'geojson', data: buildColumnsGeoJSON(ewPathRef.current, cfg) })
        if (!map.getLayer('ew-cols-layer'))
          map.addLayer({ id: 'ew-cols-layer', type: 'fill-extrusion', source: 'ew-cols-src', paint: {
            'fill-extrusion-color': cfg.columnColor, 'fill-extrusion-base': 0,
            'fill-extrusion-height': slabBase, 'fill-extrusion-opacity': 0,
            'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
          }}, deckLayerId)
      } catch (e) { console.warn('[EW] columns error:', e) }

      try {
        if (!map.getSource('ew-deck-src'))
          map.addSource('ew-deck-src', { type: 'geojson',
            data: polygonFeature(buildRibbonPolygon(ewPathRef.current, cfg.deckWidthMeters)) })
        if (!map.getLayer('ew-deck-layer'))
          map.addLayer({ id: 'ew-deck-layer', type: 'fill-extrusion', source: 'ew-deck-src', paint: {
            'fill-extrusion-color': cfg.deckColor, 'fill-extrusion-base': slabBase,
            'fill-extrusion-height': cfg.deckHeightMeters, 'fill-extrusion-opacity': 0,
            'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
          }}, deckLayerId)
      } catch (e) { console.warn('[EW] deck error:', e) }

      try {
        if (!map.getSource('ew-rail-left-src'))
          map.addSource('ew-rail-left-src', { type: 'geojson',
            data: polygonFeature(buildRibbonPolygon(offsetPath(ewPathRef.current, edgeOffset), cfg.railingWidthMeters)) })
        if (!map.getLayer('ew-rail-left-layer'))
          map.addLayer({ id: 'ew-rail-left-layer', type: 'fill-extrusion', source: 'ew-rail-left-src', paint: {
            'fill-extrusion-color': cfg.railingColor, 'fill-extrusion-base': cfg.deckHeightMeters,
            'fill-extrusion-height': railingTop, 'fill-extrusion-opacity': 0,
            'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
          }}, deckLayerId)
      } catch (e) { console.warn('[EW] left railing error:', e) }

      try {
        if (!map.getSource('ew-rail-right-src'))
          map.addSource('ew-rail-right-src', { type: 'geojson',
            data: polygonFeature(buildRibbonPolygon(offsetPath(ewPathRef.current, -edgeOffset), cfg.railingWidthMeters)) })
        if (!map.getLayer('ew-rail-right-layer'))
          map.addLayer({ id: 'ew-rail-right-layer', type: 'fill-extrusion', source: 'ew-rail-right-src', paint: {
            'fill-extrusion-color': cfg.railingColor, 'fill-extrusion-base': cfg.deckHeightMeters,
            'fill-extrusion-height': railingTop, 'fill-extrusion-opacity': 0,
            'fill-extrusion-opacity-transition': { duration: cfg.transitionDuration, delay: 0 },
          }}, deckLayerId)
      } catch (e) { console.warn('[EW] right railing error:', e) }

      if (cfg.debugMode) {
        if (!map.getSource('ew-debug-src'))
          map.addSource('ew-debug-src', { type: 'geojson', data: debugGeoJSON(ewPathRef.current) })
        if (!map.getLayer('ew-debug-dots'))
          map.addLayer({ id: 'ew-debug-dots', type: 'circle', source: 'ew-debug-src',
            paint: { 'circle-radius': 7, 'circle-color': '#ffd700', 'circle-stroke-color': '#000', 'circle-stroke-width': 1.5 } })
      }
      console.log('[EW] layers added. deck src:', !!map.getSource('ew-deck-src'), 'deck layer:', !!map.getLayer('ew-deck-layer'))
    }

    const tryAdd = () => { if (!map.getSource('ew-deck-src')) add() }
    tryAdd()
    map.on('styledata', tryAdd)
    return () => {
      map.off('styledata', tryAdd)
      ;['ew-debug-dots', 'ew-rail-right-layer', 'ew-rail-left-layer', 'ew-deck-layer', 'ew-cols-layer'].forEach(id => { if (map.getLayer(id)) map.removeLayer(id) })
      ;['ew-debug-src', 'ew-rail-right-src', 'ew-rail-left-src', 'ew-deck-src', 'ew-cols-src'].forEach(id => { if (map.getSource(id)) map.removeSource(id) })
    }
  }, [map])

  // ── Elevated walkway: opacity toggle ───────────────────────────────────────
  useEffect(() => {
    if (!map) return
    const v = activeMeasures?.elevatedWalkways ? ELEVATED_WALKWAY_CONFIG.opacity : 0
    ;['ew-cols-layer', 'ew-deck-layer', 'ew-rail-left-layer', 'ew-rail-right-layer'].forEach(id => {
      if (map.getLayer(id)) map.setPaintProperty(id, 'fill-extrusion-opacity', v)
    })
  }, [map, activeMeasures?.elevatedWalkways])

  // ── Elevated walkway: draggable markers ────────────────────────────────────
  useEffect(() => {
    if (!map || !ELEVATED_WALKWAY_CONFIG.debugMode) return
    const cfg = ELEVATED_WALKWAY_CONFIG
    const edgeOffset = (cfg.deckWidthMeters / 2) - (cfg.railingWidthMeters / 2)

    const markers = makeDraggableMarkers(map, ewPathRef, () => {
      map.getSource('ew-cols-src')?.setData(buildColumnsGeoJSON(ewPathRef.current, cfg))
      map.getSource('ew-deck-src')?.setData(polygonFeature(buildRibbonPolygon(ewPathRef.current, cfg.deckWidthMeters)))
      map.getSource('ew-rail-left-src')?.setData(polygonFeature(buildRibbonPolygon(offsetPath(ewPathRef.current, edgeOffset), cfg.railingWidthMeters)))
      map.getSource('ew-rail-right-src')?.setData(polygonFeature(buildRibbonPolygon(offsetPath(ewPathRef.current, -edgeOffset), cfg.railingWidthMeters)))
      map.getSource('ew-debug-src')?.setData(debugGeoJSON(ewPathRef.current))
      setEwDisplay([...ewPathRef.current])
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
      {ELEVATED_WALKWAY_CONFIG.debugMode && (
        <div style={panelStyle(RAISED_ROADS_CONFIG.debugMode ? 280 : 24, '#ffd700')}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: 4 }}>
            🚶 ELEVATED WALKWAY — drag gold dots
          </div>
          {ewDisplay.map(([lng, lat], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <span style={dotStyle('#ffd700')}>{i}</span>
              <span style={{ color: '#94a3b8' }}>{lng}, {lat}</span>
            </div>
          ))}
          <button onClick={() => copyPath(ewPathRef, setEwCopied, 'pathCoordinates')} style={btnStyle(ewCopied, '#ffd700')}>
            {ewCopied ? '✓ Copied!' : '📋 Copy path'}
          </button>
        </div>
      )}
      {ELEVATED_BUILDINGS_CONFIG.debugMode && (
        <div style={panelStyle(SEA_WALL_CONFIG.debugMode ? 480 : 240, '#00ff88')}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: 4 }}>
            🏢 ELEVATED BUILDINGS — drag green dots
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
            <span style={{ ...dotStyle('#ff9f00'), borderRadius: 4, fontSize: 10 }}>↕</span>
            <span style={{ color: '#ff9f00', fontWeight: 700 }}>עמודים: {ebElevation}מ'</span>
            <span style={{ color: '#64748b', fontSize: 10 }}>(גרור סמן כתום)</span>
          </div>
          {ebDisplay.map((corners, bi) => (
            <div key={bi}>
              {bi > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.1)', margin: '4px 0' }} />}
              {corners.map(([lng, lat], ci) => (
                <div key={ci} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={dotStyle('#00ff88')}>{bi}.{ci}</span>
                  <span style={{ color: '#94a3b8' }}>{lng}, {lat}</span>
                </div>
              ))}
            </div>
          ))}
          <button
            onClick={() => {
              const lines = ebDisplay.map((corners, bi) =>
                `    // Building ${bi}\n` + corners.map(([lng, lat], ci) => `    [${lng}, ${lat}],  // C${ci}`).join('\n')
              ).join('\n')
              navigator.clipboard.writeText(`corners: [\n${lines}\n  ],`).then(() => {
                setEbCopied(true); setTimeout(() => setEbCopied(false), 2500)
              })
            }}
            style={btnStyle(ebCopied, '#00ff88')}
          >
            {ebCopied ? '✓ Copied!' : '📋 Copy corners'}
          </button>
        </div>
      )}
    </>
  )
}

export default SimulationLayers
