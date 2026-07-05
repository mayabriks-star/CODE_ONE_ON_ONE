import { useState, useEffect } from 'react';
import type { CSSProperties } from 'react';
import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';
// @ts-ignore
import SimulationLayers from '../components/SimulationLayers/SimulationLayers';
// @ts-ignore
import { SIM_CAMERA } from '../components/SimulationLayers/simCameraConfig';
// @ts-ignore
import { SEA_WALL_CONFIG } from '../components/SimulationLayers/seaWallConfig';
// @ts-ignore
import { ELEVATED_BUILDINGS_CONFIG } from '../components/SimulationLayers/elevatedBuildingsConfig';
// @ts-ignore
import CameraDebugOverlay from '../components/SimulationLayers/CameraDebugOverlay';
import type { ScenarioData } from './CompareResponseScenariosPage';

interface Props {
  onBack: () => void;
  onCompare: (scenario: ScenarioData) => void;
  map?: any;
}

export type MeasureKey =
  | 'seaWall'
  | 'raisedRoads'
  | 'elevatedBuildings'
  | 'elevatedWalkways'
  | 'drainageUpgrade'
  | 'utilityProtection';

export interface Measure {
  key: MeasureKey;
  label: string;
  descriptor: string;
  color: string;
  cost: number;
  residents: number;
  risk: number;
  delay: number;
  timeMin: number;
  timeMax: number;
  defaultOn: boolean;
}

// Placeholder simulation model — realistic preset values, not a real GIS
// engine. Defaults (raisedRoads, drainageUpgrade, utilityProtection,
// residentSupport) are calibrated to sum to the spec's exact default
// scenario, matching CompareResponseScenariosPage's "Selected Scenario".
export const MEASURES: Measure[] = [
  { key: 'seaWall', label: 'Sea wall', descriptor: 'High cost · Strong protection', color: '#0b1f3a', cost: 18_000_000, residents: 240, risk: 22, delay: 5, timeMin: 10, timeMax: 16, defaultOn: false },
  { key: 'raisedRoads', label: 'Raised roads', descriptor: 'Medium-high cost · Improves access', color: '#ea7836', cost: 12_000_000, residents: 150, risk: 9, delay: 2, timeMin: 4, timeMax: 7, defaultOn: false },
  { key: 'elevatedBuildings', label: 'Elevated buildings', descriptor: 'High cost · Long-term resilience', color: '#bf5761', cost: 15_000_000, residents: 300, risk: 18, delay: 4, timeMin: 9, timeMax: 14, defaultOn: false },
  { key: 'elevatedWalkways', label: 'Elevated walkways', descriptor: 'Medium cost · Improves access', color: '#6b778a', cost: 3_400_000, residents: 70, risk: 5, delay: 1, timeMin: 4, timeMax: 6, defaultOn: false },
  { key: 'drainageUpgrade', label: 'Drainage upgrade', descriptor: 'Medium cost · Reduces street flooding', color: '#2864e4', cost: 5_000_000, residents: 160, risk: 11, delay: 2, timeMin: 3, timeMax: 6, defaultOn: false },
  { key: 'utilityProtection', label: 'Utility protection', descriptor: 'Medium cost · Protects power infrastructure', color: '#ffbb00', cost: 4_100_000, residents: 130, risk: 9, delay: 2, timeMin: 3, timeMax: 5, defaultOn: false },
];

const AVAILABLE_BUDGET = 60_000_000;
const TOGGLE_ON_COLOR = 'rgba(16,24,40,0.85)';
const TOGGLE_OFF_COLOR = '#C6C7C8';

function formatCost(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

// Fade + rise-into-place entrance for map overlay groups, instead of a flat
// fade — reads as the intervention being "added into the environment".
function overlayGroupStyle(isActive: boolean): CSSProperties {
  return {
    opacity: isActive ? 1 : 0,
    transform: isActive ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.96)',
    transformBox: 'fill-box',
    transformOrigin: 'center',
    transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
  } as CSSProperties;
}

function DonutChart({ pct, size = 130 }: { pct: number; size?: number }) {
  const cx = 93;
  const cy = 93;
  const r = 55;
  const circum = 2 * Math.PI * r;
  const dash = Math.min(1, Math.max(0, pct / 100)) * circum;
  const gap = circum - dash;

  return (
    <svg viewBox="0 0 186 186" width={size} height={size} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={30} />
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="#0b1f3a"
        strokeWidth={30}
        strokeDasharray={`${dash} ${gap}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cy})`}
        style={{ transition: 'stroke-dasharray 0.3s ease' }}
      />
    </svg>
  );
}

function ToggleRow({ measure, active, onToggle }: { measure: Measure; active: boolean; onToggle: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, fontSize: 15, fontWeight: 600, color: '#364153', letterSpacing: '-0.44px', lineHeight: '20px' }}>{measure.label}</div>
      <button
        onClick={onToggle}
        aria-label={`Toggle ${measure.label}`}
        style={{
          width: 32, height: 19, borderRadius: 100, border: 'none', padding: 2,
          background: active ? TOGGLE_ON_COLOR : TOGGLE_OFF_COLOR,
          cursor: 'pointer', transition: 'background 0.3s ease', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: active ? 'flex-end' : 'flex-start',
        }}
      >
        <div style={{ width: 15, height: 15, borderRadius: '50%', background: 'white' }} />
      </button>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 500, color: '#6b778a', letterSpacing: '-0.3px', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.44px' }}>{value}</div>
    </div>
  );
}

export default function SimulateResponseScenariosPage({ onBack, onCompare, map }: Props) {
  const [active, setActive] = useState<Record<MeasureKey, boolean>>(
    () => Object.fromEntries(MEASURES.map((m) => [m.key, m.defaultOn])) as Record<MeasureKey, boolean>
  );

  const [scale, setScale] = useState(() => {
    const sw = window.innerWidth / 1512;
    const sh = window.innerHeight / 1008;
    return Math.min(1.0, sw, sh);
  });
  useEffect(() => {
    const update = () => {
      const sw = window.innerWidth / 1512;
      const sh = window.innerHeight / 1008;
      setScale(Math.min(1.0, sw, sh));
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Fly to cinematic low-oblique camera on mount; restore on leave
  useEffect(() => {
    if (!map) return;
    const prev = {
      center:  map.getCenter(),
      zoom:    map.getZoom(),
      pitch:   map.getPitch(),
      bearing: map.getBearing(),
    };
    map.flyTo({
      center:   SIM_CAMERA.center,
      zoom:     SIM_CAMERA.zoom,
      pitch:    SIM_CAMERA.pitch,
      bearing:  SIM_CAMERA.bearing,
      duration: SIM_CAMERA.duration,
      essential: true,
    });
    return () => {
      map.flyTo({
        center:   [prev.center.lng, prev.center.lat],
        zoom:     prev.zoom,
        pitch:    prev.pitch,
        bearing:  prev.bearing,
        duration: 800,
        essential: true,
      });
    };
  }, [map]);

  // Fly to per-measure camera preset when elevated buildings toggle turns on/off
  useEffect(() => {
    if (!map) return;
    const cam = ELEVATED_BUILDINGS_CONFIG.camera;
    if (active.elevatedBuildings) {
      map.flyTo({ center: cam.center, zoom: cam.zoom, pitch: cam.pitch, bearing: cam.bearing, duration: cam.duration, essential: true });
    } else {
      map.flyTo({ center: SIM_CAMERA.center, zoom: SIM_CAMERA.zoom, pitch: SIM_CAMERA.pitch, bearing: SIM_CAMERA.bearing, duration: 1000, essential: true });
    }
  }, [map, active.elevatedBuildings]);

  function toggle(key: MeasureKey) {
    setActive((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const activeMeasures = MEASURES.filter((m) => active[m.key]);
  const offMeasures = MEASURES.filter((m) => !active[m.key]);
  const totalCost = activeMeasures.reduce((s, m) => s + m.cost, 0);
  const residentsProtected = activeMeasures.reduce((s, m) => s + m.residents, 0);
  const floodRiskReduction = Math.min(95, activeMeasures.reduce((s, m) => s + m.risk, 0));
  const delayYears = activeMeasures.reduce((s, m) => s + m.delay, 0);
  const timeMin = activeMeasures.reduce((s, m) => s + m.timeMin, 0);
  const timeMax = activeMeasures.reduce((s, m) => s + m.timeMax, 0);
  const budgetPct = Math.round((totalCost / AVAILABLE_BUDGET) * 100);
  const effortRatio = totalCost > 0 ? (residentsProtected / 100 + floodRiskReduction) / (totalCost / 1_000_000) : 0;
  const valueForEffort = activeMeasures.length === 0 ? '—' : effortRatio >= 2 ? 'Strong' : effortRatio >= 1.2 ? 'Moderate' : 'Limited';
  const mainTradeoff = offMeasures.length === 0
    ? 'Full coverage across all measures'
    : `Lower coverage: ${offMeasures.map((m) => m.label).join(', ')} not included`;

  function boolToMeasure(v: boolean): 'yes' | 'no' { return v ? 'yes' : 'no'; }
  function effortLevel(v: string): 'high' | 'moderate' | 'low' {
    return v === 'Strong' ? 'high' : v === 'Moderate' ? 'moderate' : 'low';
  }

  function buildScenario(): ScenarioData {
    return {
      id: 'selected',
      roleLabel: 'Your Simulation',
      name: activeMeasures.length === 0 ? 'No measures selected' : activeMeasures.map(m => m.label).join(', '),
      seaWall: boolToMeasure(active.seaWall),
      raisedRoads: boolToMeasure(active.raisedRoads),
      elevatedBuildings: boolToMeasure(active.elevatedBuildings),
      elevatedWalkways: boolToMeasure(active.elevatedWalkways),
      drainageUpgrade: boolToMeasure(active.drainageUpgrade),
      utilityProtection: boolToMeasure(active.utilityProtection),
      residentSupport: 'no',
      totalCost: formatCost(totalCost),
      totalCostValue: totalCost,
      budgetPct,
      residentsProtected,
      floodRiskReduction,
      delayToImpact: `+${delayYears} years`,
      implementationTime: `${timeMin}–${timeMax} months`,
      valueForEffort: effortLevel(valueForEffort),
      mainTradeoff,
    };
  }

  return (
    <>
      <SimulationLayers map={map} activeMeasures={active} />
      {(SEA_WALL_CONFIG.debugMode || (ELEVATED_BUILDINGS_CONFIG.cameraDebugMode && active.elevatedBuildings)) && <CameraDebugOverlay map={map} />}
      <ScaledLayout className="screen-enter">
        {/* Map overlays — layered "built asset" illustrations per active measure */}
        <svg
          className="absolute"
          style={{ left: 0, top: 0, width: 1512, height: 1008, pointerEvents: 'none' }}
          viewBox="0 0 1512 1008"
        >
          {/* Sea wall — replaced by 3D MapLibre layer in SimulationLayers.jsx */}

          {/* Raised roads — replaced by 3D MapLibre layer in SimulationLayers.jsx */}


          {/* Elevated walkways — boardwalk path with plank ticks + shadow */}
          <g style={overlayGroupStyle(active.elevatedWalkways)}>
            <path d="M 622,822 C 762,782 882,802 1022,742" fill="none" stroke="#000" strokeOpacity={0.14} strokeWidth={6} strokeLinecap="round" />
            <path d="M 620,820 C 760,780 880,800 1020,740" fill="none" stroke={MEASURES[3].color} strokeWidth={4} strokeLinecap="round" />
            {[[620, 820], [720, 795], [820, 790], [920, 765], [1020, 740]].map(([px, py], i) => (
              <line key={i} x1={px - 5} y1={py - 7} x2={px + 5} y2={py + 7} stroke={MEASURES[3].color} strokeWidth={3} strokeLinecap="round" />
            ))}
          </g>

          {/* Drainage upgrade — infrastructure marker: ring + core + funnel glyph */}
          <g style={overlayGroupStyle(active.drainageUpgrade)}>
            {[[700, 700], [820, 640], [950, 720]].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r={12} fill="#fff" fillOpacity={0.6} stroke={MEASURES[4].color} strokeWidth={3} />
                <circle cx={x} cy={y} r={4.5} fill={MEASURES[4].color} />
                <path d={`M ${x - 5},${y + 14} L ${x + 5},${y + 14} L ${x},${y + 21} Z`} fill={MEASURES[4].color} />
              </g>
            ))}
          </g>

          {/* Utility protection — shield marker with inner glyph */}
          <g style={overlayGroupStyle(active.utilityProtection)}>
            {[[980, 380], [1080, 460]].map(([x, y], i) => (
              <g key={i}>
                <path
                  d={`M ${x},${y - 13} L ${x + 10},${y - 8} L ${x + 10},${y + 4} C ${x + 10},${y + 11} ${x + 5},${y + 15} ${x},${y + 17} C ${x - 5},${y + 15} ${x - 10},${y + 11} ${x - 10},${y + 4} L ${x - 10},${y - 8} Z`}
                  fill={MEASURES[5].color}
                  fillOpacity={0.85}
                  stroke="#fff"
                  strokeWidth={1.5}
                />
                <circle cx={x} cy={y} r={2.5} fill="#fff" />
              </g>
            ))}
          </g>

        </svg>
      </ScaledLayout>

      {/* Progress bar — step 2 active */}
      <div
        className="glass-65 glass-shadow"
        style={{
          position: 'absolute',
          top: Math.round(93 * scale),
          left: 16 + Math.round(36 * scale) + 8,
          right: 16,
          height: Math.round(36 * scale),
          borderRadius: Math.round(18 * scale),
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        <svg
          width="100%" height="100%"
          viewBox="0 0 1426 36"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        >
          {/* Step 1 completed */}
          <polygon points="0,0 284,0 298,18 284,36 0,36" fill="rgba(30,41,57,0.25)" />
          {/* Step 2 active */}
          <polygon points="284,0 566,0 580,18 566,36 284,36 298,18" fill="#1e2939" />
          <path d="M284,0 L298,18 L284,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M566,0 L580,18 L566,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M848,0 L862,18 L848,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M1130,0 L1144,18 L1130,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
        </svg>

        {/* Step 1 */}
        <div style={{ position: 'absolute', left: '0%', top: 0, width: '20.90%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.7%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Assess critical zones
          </span>
        </div>
        {/* Step 2 — active */}
        <div style={{ position: 'absolute', left: '20.90%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 600, color: 'white', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Simulate response scenarios
          </span>
        </div>
        {/* Step 3 */}
        <div style={{ position: 'absolute', left: '40.67%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Compare intervention options
          </span>
        </div>
        {/* Step 4 */}
        <div style={{ position: 'absolute', left: '60.45%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Assign Teams & Tasks
          </span>
        </div>
        {/* Step 5 */}
        <div style={{ position: 'absolute', left: '80.22%', top: 0, width: '19.78%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.1%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Launch action plan
          </span>
        </div>
      </div>

      <HomePageHeader reducedShadow={active.seaWall || active.raisedRoads} />

      {/* Left-side column — toggle panel stacked above the data card, as a
          single flex column so the data card always sits directly below the
          toggle panel regardless of its content height (no hardcoded gap
          guessing). Rendered outside ScaledLayout with position:fixed so it
          stays flush with the true viewport left edge on any screen width
          (see ARCHITECTURE_AND_DESIGN_SYSTEM.md Section D pattern). */}
      {/* Back button — matches AssessCriticalZonesPage exactly */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute', top: Math.round(93 * scale), left: 16,
          width: Math.round(36 * scale), height: Math.round(36 * scale), borderRadius: '50%',
          background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(0,0,0,0.10)', cursor: 'pointer', pointerEvents: 'auto', zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.14), 0 8px 24px rgba(0,0,0,0.10)',
        }}
      >
        <span style={{ fontSize: Math.round(17 * scale), color: '#1e2939', lineHeight: 1 }}>←</span>
      </button>

      {/* Left column — scenario controls */}
      <div style={{ position: 'fixed', left: 16, top: 141, width: 360, display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
        <div
          className="glass-shadow"
          style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.3)',
            pointerEvents: 'auto',
            padding: '18px 20px 20px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div>
            <p className="font-semibold text-[18px] leading-[23px] tracking-[-0.44px] text-[#1e2939]" style={{ margin: 0 }}>
              Simulate Response Scenarios
            </p>
            <p className="font-medium text-[15px] leading-[21px]" style={{ margin: '6px 0 0 0', color: '#6b778a', letterSpacing: '-0.3px' }}>
              Toggle infrastructure measures to explore their combined impact on flood resilience, cost, and protected residents.
            </p>
          </div>
          <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />
          {MEASURES.map((m) => (
            <ToggleRow key={m.key} measure={m} active={active[m.key]} onToggle={() => toggle(m.key)} />
          ))}
          <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />
          <button
            onClick={() => onCompare(buildScenario())}
            className="w-full flex items-center justify-center"
            style={{ height: 44, borderRadius: 14, background: 'rgba(16,24,40,0.9)', border: 'none', cursor: 'pointer', pointerEvents: 'auto' }}
          >
            <span className="font-medium text-[14px] text-white">Compare Scenarios</span>
          </button>
        </div>
      </div>

      {/* Top-right — summary card, horizontal layout */}
      <div style={{ position: 'fixed', right: 16, top: 141, width: 520, pointerEvents: 'none' }}>
        <div
          className="glass-shadow"
          style={{
            borderRadius: 16,
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.3)',
            pointerEvents: 'auto',
            padding: '18px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p className="font-semibold text-[18px] leading-[23px] tracking-[-0.44px] text-[#1e2939]" style={{ margin: 0 }}>
                Current Simulated Scenario
              </p>
              <p className="font-medium text-[15px] leading-[21px]" style={{ margin: '5px 0 0 0', color: '#6b778a', letterSpacing: '-0.3px' }}>
                Live outcome of the active protection measures
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <DonutChart pct={budgetPct} size={64} />
              <div>
                <div style={{ fontSize: 20, fontWeight: 500, color: 'black', letterSpacing: '-0.44px', lineHeight: '24px' }}>{formatCost(totalCost)}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#6b778a' }}>of {formatCost(AVAILABLE_BUDGET)} · {budgetPct}%</div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            <MetricCell label="Residents" value={String(residentsProtected)} />
            <MetricCell label="Risk reduction" value={`${floodRiskReduction}%`} />
            <MetricCell label="Impact delay" value={`+${delayYears} yrs`} />
            <MetricCell label="Build time" value={`${timeMin}–${timeMax} mo`} />
          </div>
        </div>
      </div>
    </>
  );
}
