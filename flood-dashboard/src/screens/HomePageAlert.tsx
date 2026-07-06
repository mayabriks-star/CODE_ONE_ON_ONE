import { useState, useEffect, useRef } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapPin } from 'lucide-react';
import ScaledLayout from '../components/layout/ScaledLayout';
import FloodDepthScale from '../components/shared/FloodDepthScale';
import HomePageHeader from '../components/shared/HomePageHeader';
import LiveMonitoringPanelV2 from '../components/dashboard/LiveMonitoringPanelV2';
import AlertBanner from '../components/alert/AlertBanner';

const USE_PREVIEW = new URLSearchParams(window.location.search).has('preview');

interface Props {
  onRedZoneClick: () => void;
  map?: any;
  planActivated?: boolean;
  onMenu?: () => void;
}

// Hazard-zone outline, captured as real lng/lat via the click-to-pin debug tool
// (map.unproject() on each click) - geo-anchored so it stays glued to these
// buildings regardless of window size, zoom, or pitch.
const HAZARD_ZONE_RING: [number, number][] = [
  [-80.188278, 25.765910],
  [-80.188168, 25.767006],
  [-80.188057, 25.767800],
  [-80.187928, 25.768676],
  [-80.188198, 25.769299],
  [-80.188884, 25.769573],
  [-80.189475, 25.769296],
  [-80.189987, 25.769369],
  [-80.190784, 25.769663],
  [-80.191933, 25.769706],
  [-80.192639, 25.769549],
  [-80.193311, 25.769065],
  [-80.193846, 25.768602],
  [-80.194387, 25.768238],
  [-80.195025, 25.768215],
  [-80.195720, 25.768124],
  [-80.195491, 25.766947],
  [-80.195441, 25.765439],
  [-80.195261, 25.764489],
  [-80.195285, 25.763629],
  [-80.195429, 25.762488],
  [-80.195385, 25.761484],
  [-80.195490, 25.760598],
  [-80.195863, 25.759720],
  [-80.193459, 25.758311],
  [-80.192616, 25.757874],
  [-80.192063, 25.757488],
  [-80.191003, 25.756932],
  [-80.190440, 25.756559],
  [-80.189114, 25.757544],
  [-80.188890, 25.758690],
  [-80.189100, 25.759462],
  [-80.188818, 25.759733],
  [-80.188599, 25.762642],
  [-80.188588, 25.762877],
];

export const HAZARD_ZONE_CENTROID: [number, number] = (() => {
  const sum = HAZARD_ZONE_RING.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
  return [sum[0] / HAZARD_ZONE_RING.length, sum[1] / HAZARD_ZONE_RING.length];
})();

// Catmull-Rom spline through a closed ring of control points - lets a handful
// of loosely-placed points produce an actual smooth curve (e.g. a rounded
// waterfront edge) instead of straight segments between them. Near-straight
// runs of points stay effectively straight, so this is safe to apply to the
// whole ring rather than needing to special-case which part is curved.
function smoothRing(points: [number, number][], segmentsPerSpan = 8): [number, number][] {
  if (points.length < 3) return points;
  const n = points.length;
  const result: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const p0 = points[(i - 1 + n) % n];
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    const p3 = points[(i + 2) % n];
    for (let s = 0; s < segmentsPerSpan; s++) {
      const t = s / segmentsPerSpan;
      const t2 = t * t;
      const t3 = t2 * t;
      const lng =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lat =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      result.push([lng, lat]);
    }
  }
  return result;
}

// Production polygon uses the smoothed ring directly, so the rounded
// waterfront edge actually curves instead of cutting straight across it.
const HAZARD_ZONE_SMOOTHED = smoothRing(HAZARD_ZONE_RING);

const HAZARD_ZONE_POLYGON = {
  type: 'Feature' as const,
  geometry: { type: 'Polygon' as const, coordinates: [[...HAZARD_ZONE_SMOOTHED, HAZARD_ZONE_SMOOTHED[0]]] },
  properties: {},
};

// Click-to-pin debug tool (?debug=1): captures real lng/lat via map.unproject()
// on each map click, so the hazard-zone ring can be recalibrated by hand.
// Strip this whole block out once the new HAZARD_ZONE_RING is hardcoded.
const DEBUG_MODE = new URLSearchParams(window.location.search).get('debug') === '1';

export default function HomePageAlert({ onRedZoneClick, map, planActivated, onMenu }: Props) {
  const [zoneVisible, setZoneVisible] = useState(DEBUG_MODE);
  const [zoneHovered, setZoneHovered] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(null);
  // Start from the current hazard-zone ring so the existing shape can be
  // dragged/adjusted directly, or cleared to mark a fresh shape from scratch.
  const [debugPoints, setDebugPoints] = useState<[number, number][]>(
    DEBUG_MODE ? HAZARD_ZONE_RING : []
  );
  const draggingIndexRef = useRef<number | null>(null);
  const zoneVisibleRef = useRef(DEBUG_MODE);
  const onRedZoneClickRef = useRef(onRedZoneClick);
  onRedZoneClickRef.current = onRedZoneClick;
  const revealRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!zoneVisible) return;
    setShowBanner(true);
    const t = setTimeout(() => setShowBanner(false), 5000);
    return () => clearTimeout(t);
  }, [zoneVisible]);

  useEffect(() => {
    if (!map || !DEBUG_MODE) return;
    const handleDebugClick = (e: any) => {
      if (draggingIndexRef.current !== null) return;
      const { lng, lat } = map.unproject(e.point);
      setDebugPoints((prev) => [...prev, [lng, lat]]);
    };
    map.on('click', handleDebugClick);

    const handleMouseMove = (e: MouseEvent) => {
      if (draggingIndexRef.current === null) return;
      const rect = map.getCanvas().getBoundingClientRect();
      const { lng, lat } = map.unproject([e.clientX - rect.left, e.clientY - rect.top]);
      const idx = draggingIndexRef.current;
      setDebugPoints((prev) => prev.map((p, i) => (i === idx ? [lng, lat] : p)));
    };
    const handleMouseUp = () => {
      if (draggingIndexRef.current === null) return;
      draggingIndexRef.current = null;
      map.dragPan.enable();
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      map.off('click', handleDebugClick);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;

    // Non-interleaved overlay: renders as a flat, always-on-top 2D screen
    // layer, immune to depth-occlusion from the interleaved 3D building
    // tiles (a native MapLibre fill layer at ground level gets hidden under
    // the buildings from this oblique camera - this overlay doesn't).
    const overlay = new MapboxOverlay({ interleaved: false, layers: [] });
    map.addControl(overlay);

    const setLayers = (opacity: number, lineWidth = 2.5) => {
      overlay.setProps({
        layers: [
          new GeoJsonLayer({
            id: 'hazard-zone',
            data: HAZARD_ZONE_POLYGON,
            filled: true,
            stroked: true,
            getFillColor: [220, 40, 40, Math.round(opacity * 0.22 * 255)],
            getLineColor: [220, 40, 40, Math.round(opacity * 0.75 * 255)],
            lineWidthMinPixels: lineWidth,
            pickable: true,
            onClick: () => {
              if (DEBUG_MODE) return;
              if (zoneVisibleRef.current) onRedZoneClickRef.current();
            },
            onHover: (info: any) => {
              if (!zoneVisibleRef.current) return;
              setZoneHovered(!!info.picked);
              map.getCanvas().style.cursor = info.picked ? 'pointer' : '';
            },
          }),
        ],
      });
    };
    setLayers(DEBUG_MODE ? 1 : 0);

    revealRef.current = () => {
      if (zoneVisibleRef.current) return;

      // Step 1 - card + banner switch immediately
      setZoneVisible(true);

      // Step 2 - map zone fades in after 900ms (as a result of the alert)
      const DELAY_MS  = 900;
      const FADE_MS   = 1300;
      const PULSE_MS  = 900;
      let rafId: number;
      let startTime: number | null = null;

      const animate = (ts: number) => {
        if (!startTime) startTime = ts;
        const elapsed = ts - startTime;

        if (elapsed < FADE_MS) {
          const t = elapsed / FADE_MS;
          const eased = 1 - Math.pow(1 - t, 3);
          setLayers(eased, 2.5);
          rafId = requestAnimationFrame(animate);
        } else if (elapsed < FADE_MS + PULSE_MS) {
          const t = (elapsed - FADE_MS) / PULSE_MS;
          const pulse = Math.sin(t * Math.PI) * 4;
          setLayers(1, 2.5 + pulse);
          rafId = requestAnimationFrame(animate);
        } else {
          setLayers(1, 2.5);
          zoneVisibleRef.current = true;
        }
      };

      setTimeout(() => {
        rafId = requestAnimationFrame(animate);
      }, DELAY_MS);
    };

    const updateCardPos = () => {
      const { x, y } = map.project(HAZARD_ZONE_CENTROID);
      setCardPos({ x, y });
    };
    updateCardPos();
    map.on('move', updateCardPos);

    return () => {
      map.off('move', updateCardPos);
      map.removeControl(overlay);
    };
  }, [map]);

  return (
    <>
      <ScaledLayout className="screen-enter">
        <LiveMonitoringPanelV2 alert={zoneVisible} nudgeDown={showBanner} planActivated={planActivated} />
        <div
          className="absolute glass-65 glass-shadow flex items-center gap-[7px]"
          style={{
            left: 21,
            top: showBanner ? 145 : 93,
            transition: 'top 0.35s cubic-bezier(0.4,0,0.2,1)',
            width: 326,
            borderRadius: 100,
            padding: '7px 14px 7px 11px',
            pointerEvents: 'none',
          }}
        >
          <MapPin size={13} color="#6b7280" strokeWidth={2.2} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.2px' }}>
            Miami Beach
          </span>
          <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.35)' }}>,</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', letterSpacing: '-0.2px' }}>
            Florida, US
          </span>
        </div>
      </ScaledLayout>

      {/* Blocks the very first click from ever reaching the map canvas, so the
          Photoreal3DLayer's own click-to-zoom can't fire on the reveal click.
          A real DOM element is the only reliable way to stop this - deck.gl's
          picking resolves on pointerdown/pointerup, before any 'click' event
          could be intercepted via JS event listeners. Unmounts after one click. */}
      {!zoneVisible && !DEBUG_MODE && (
        <div
          onClick={() => revealRef.current()}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer', pointerEvents: 'auto' }}
        />
      )}

      {/* Debug click-to-pin markers + smoothed-curve preview + readout panel
          (?debug=1 only). The dashed preview is a Catmull-Rom spline through
          the raw control points, not straight segments - lets a handful of
          loosely-placed points produce an actual smooth curve. */}
      {DEBUG_MODE && map && (
        <>
          <svg
            className="fixed inset-0"
            style={{ width: '100vw', height: '100vh', pointerEvents: 'none', zIndex: 9997 }}
          >
            <polygon
              points={smoothRing(debugPoints).map(([lng, lat]) => {
                const { x, y } = map.project([lng, lat]);
                return `${x},${y}`;
              }).join(' ')}
              fill="rgba(34,211,238,0.12)"
              stroke="#22d3ee"
              strokeWidth={2}
              strokeDasharray="6 4"
            />
          </svg>

          {debugPoints.map(([lng, lat], i) => {
            const { x, y } = map.project([lng, lat]);
            return (
              <div
                key={i}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  draggingIndexRef.current = i;
                  map.dragPan.disable();
                }}
                style={{
                  position: 'fixed', left: x - 6, top: y - 6, width: 12, height: 12,
                  borderRadius: '50%', background: '#22d3ee', border: '2px solid white',
                  pointerEvents: 'auto', cursor: 'grab', zIndex: 9998,
                }}
              />
            );
          })}
          <div
            style={{
              position: 'fixed', right: 16, bottom: 16, width: 380, maxHeight: 320,
              overflowY: 'auto', background: 'rgba(0,0,0,0.85)', color: 'white',
              fontSize: 11, fontFamily: 'monospace', padding: 12, borderRadius: 8,
              zIndex: 10000, pointerEvents: 'auto',
            }}
          >
            <p style={{ margin: '0 0 8px 0', color: '#9ca3af' }}>
              Drag a dot to move it · click empty map to add a point at the end ·
              dashed line is the smoothed curve that will be exported
            </p>
            <div style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' as const }}>
              <button
                onClick={() => setDebugPoints((prev) => prev.slice(0, -1))}
                style={{ background: '#374151', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
              >
                Undo
              </button>
              <button
                onClick={() => setDebugPoints([])}
                style={{ background: '#374151', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
              >
                Clear (start fresh)
              </button>
              <button
                onClick={() => setDebugPoints(HAZARD_ZONE_RING)}
                style={{ background: '#374151', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
              >
                Reload current zone
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(
                  smoothRing(debugPoints).map(([lng, lat]) => `[${lng.toFixed(6)}, ${lat.toFixed(6)}]`).join(', ')
                )}
                style={{ background: '#374151', color: 'white', border: 'none', borderRadius: 4, padding: '4px 8px', cursor: 'pointer' }}
              >
                Copy smoothed
              </button>
              <span>{debugPoints.length} control points · {smoothRing(debugPoints).length} smoothed</span>
            </div>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              {debugPoints.map(([lng, lat]) => `[${lng.toFixed(6)}, ${lat.toFixed(6)}],`).join('\n')}
            </pre>
          </div>
        </>
      )}

      {/* Zone detail card - pinned to bottom-right of the zone via map.project().
          Appears together with the red zone and stays anchored as the map moves. */}
      {zoneVisible && zoneHovered && cardPos && (
        <div
          style={{
            position: 'fixed',
            left: cardPos.x + 140,
            top: cardPos.y + 210,
            zIndex: 8000,
            pointerEvents: 'auto',
            animation: 'zoneCardIn 0.2s cubic-bezier(0.2,0,0.1,1) both',
          }}
          onClick={onRedZoneClick}
        >
          <style>{`
            @keyframes zoneCardIn {
              from { opacity: 0; transform: translateY(8px) scale(0.96); }
              to   { opacity: 1; transform: translateY(0) scale(1); }
            }
          `}</style>
          <div
            className="glass-shadow"
            style={{
              width: 340,
              background: 'rgba(164, 22, 30, 0.92)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              borderRadius: 16,
              padding: '13px 15px 12px',
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              cursor: 'pointer',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 20, color: 'white', letterSpacing: '-0.4px' }}>
                Harbor District
              </span>
              <span style={{
                fontSize: 12, fontWeight: 700, color: 'white', letterSpacing: '0.5px',
                background: 'rgba(255,255,255,0.22)', borderRadius: 100, padding: '4px 10px', flexShrink: 0,
              }}>
                HIGH RISK
              </span>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', marginBottom: 10 }} />

            {/* Explanatory text */}
            <p style={{ margin: '0 0 11px', fontSize: 17, fontWeight: 500, color: 'rgba(255,255,255,0.85)', lineHeight: '25px', letterSpacing: '-0.2px' }}>
              Sea levels rose <strong style={{ color: 'white' }}>38 mm above baseline</strong>, putting <strong style={{ color: 'white' }}>8,400 residents</strong> at risk. First flooding expected within <strong style={{ color: 'white' }}>18–24 months</strong> - critical deadline <strong style={{ color: 'white' }}>May 2027</strong>.
            </p>

            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: 'rgba(255,255,255,0.55)', letterSpacing: '-0.1px' }}>
              Click the zone to open full assessment
            </p>
          </div>
        </div>
      )}

      {showBanner && (
        <AlertBanner
          onAssess={() => { setShowBanner(false); onRedZoneClick(); }}
          onDismiss={() => setShowBanner(false)}
        />
      )}

      <HomePageHeader showBadge map={map} onMenu={onMenu} />
    </>
  );
}
