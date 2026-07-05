import { useState, useEffect } from 'react'

// Shows real-time camera values and a Copy button.
// Only rendered when SEA_WALL_CONFIG.debugMode is true.
// Usage: drag / rotate / tilt the map to the angle you want,
//        then click "Copy preset" and paste the output into simCameraConfig.js.
export default function CameraDebugOverlay({ map }) {
  const [cam, setCam] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!map) return
    const update = () => {
      const c = map.getCenter()
      setCam({
        center:  [+c.lng.toFixed(6), +c.lat.toFixed(6)],
        zoom:    +map.getZoom().toFixed(2),
        pitch:   +map.getPitch().toFixed(1),
        bearing: +map.getBearing().toFixed(1),
      })
    }
    update()
    map.on('move', update)
    return () => map.off('move', update)
  }, [map])

  if (!cam) return null

  function copy() {
    const text = `export const SIM_CAMERA = {\n  center:   [${cam.center[0]}, ${cam.center[1]}],\n  zoom:     ${cam.zoom},\n  pitch:    ${cam.pitch},\n  bearing:  ${cam.bearing},\n  duration: 1400,\n}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{
      position: 'fixed', bottom: 100, right: 24, zIndex: 9999,
      background: 'rgba(10,12,18,0.88)', backdropFilter: 'blur(8px)',
      borderRadius: 12, padding: '12px 16px',
      border: '1px solid rgba(255,255,255,0.12)',
      fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0',
      display: 'flex', flexDirection: 'column', gap: 4, minWidth: 220,
      pointerEvents: 'auto',
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', letterSpacing: '0.5px', marginBottom: 4 }}>
        📷 CAMERA DEBUG
      </div>
      {[
        ['center',  `[${cam.center[0]}, ${cam.center[1]}]`],
        ['zoom',    cam.zoom],
        ['pitch',   `${cam.pitch}°`],
        ['bearing', `${cam.bearing}°`],
      ].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
          <span style={{ color: '#64748b' }}>{k}</span>
          <span style={{ color: '#f1f5f9' }}>{v}</span>
        </div>
      ))}
      <button onClick={copy} style={{
        marginTop: 8, padding: '6px 0', borderRadius: 7, border: 'none',
        background: copied ? 'rgba(0,166,62,0.3)' : 'rgba(255,255,255,0.1)',
        color: copied ? '#4ade80' : '#f1f5f9',
        cursor: 'pointer', fontSize: 11, fontWeight: 600,
        transition: 'background 0.2s',
      }}>
        {copied ? '✓ Copied!' : '📋 Copy preset'}
      </button>
    </div>
  )
}
