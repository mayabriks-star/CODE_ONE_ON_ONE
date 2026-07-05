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
import CameraDebugOverlay from '../components/SimulationLayers/CameraDebugOverlay';

interface Props {
  onBack: () => void;
  onCompare: () => void;
  map?: any;
}

export type MeasureKey =
  | 'seaWall'
  | 'raisedRoads'
  | 'elevatedBuildings'
  | 'elevatedWalkways'
  | 'drainageUpgrade'
  | 'utilityProtection'
  | 'residentSupport';

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
  { key: 'seaWall', label: 'Sea wall', descriptor: 'High cost · Strong protection', color: '#0b1f3a', cost: 9_500_000, residents: 240, risk: 22, delay: 5, timeMin: 10, timeMax: 16, defaultOn: false },
  { key: 'raisedRoads', label: 'Raised roads', descriptor: 'Medium-high cost · Improves access', color: '#ea7836', cost: 6_500_000, residents: 150, risk: 9, delay: 2, timeMin: 4, timeMax: 7, defaultOn: false },
  { key: 'elevatedBuildings', label: 'Elevated buildings', descriptor: 'High cost · Long-term resilience', color: '#bf5761', cost: 8_200_000, residents: 300, risk: 18, delay: 4, timeMin: 9, timeMax: 14, defaultOn: false },
  { key: 'elevatedWalkways', label: 'Elevated walkways', descriptor: 'Medium cost · Improves access', color: '#6b778a', cost: 3_400_000, residents: 70, risk: 5, delay: 1, timeMin: 4, timeMax: 6, defaultOn: false },
  { key: 'drainageUpgrade', label: 'Drainage upgrade', descriptor: 'Medium cost · Reduces street flooding', color: '#2864e4', cost: 5_000_000, residents: 160, risk: 11, delay: 2, timeMin: 3, timeMax: 6, defaultOn: false },
  { key: 'utilityProtection', label: 'Utility protection', descriptor: 'Medium cost · Protects power infrastructure', color: '#ffbb00', cost: 4_100_000, residents: 130, risk: 9, delay: 2, timeMin: 3, timeMax: 5, defaultOn: false },
  { key: 'residentSupport', label: 'Resident support measures', descriptor: 'Low cost · Fast implementation', color: '#84af79', cost: 3_000_000, residents: 180, risk: 5, delay: 2, timeMin: 2, timeMax: 2, defaultOn: false },
];

const AVAILABLE_BUDGET = 24_000_000;
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
      <div style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#364153', letterSpacing: '-0.44px', lineHeight: '17px' }}>{measure.label}</div>
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
      <div style={{ fontSize: 12, fontWeight: 500, color: '#505153', letterSpacing: '-0.44px', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#364153', letterSpacing: '-0.44px' }}>{value}</div>
    </div>
  );
}

export default function SimulateResponseScenariosPage({ onBack, onCompare, map }: Props) {
  const [active, setActive] = useState<Record<MeasureKey, boolean>>(
    () => Object.fromEntries(MEASURES.map((m) => [m.key, m.defaultOn])) as Record<MeasureKey, boolean>
  );

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

  // Structured the same way CompareResponseScenariosPage.ScenarioData expects,
  // so a future round can pass this straight through as the Selected Scenario.
  const selectedScenario = {
    seaWall: active.seaWall, raisedRoads: active.raisedRoads, elevatedBuildings: active.elevatedBuildings,
    elevatedWalkways: active.elevatedWalkways, drainageUpgrade: active.drainageUpgrade,
    utilityProtection: active.utilityProtection, residentSupport: active.residentSupport,
    totalCost: formatCost(totalCost), totalCostValue: totalCost, budgetPct, residentsProtected,
    floodRiskReduction, delayToImpact: `+${delayYears} years`, implementationTime: `${timeMin}–${timeMax} months`,
    valueForEffort, mainTradeoff,
  };
  void selectedScenario;

  return (
    <>
      <SimulationLayers map={map} activeMeasures={active} />
      {SEA_WALL_CONFIG.debugMode && <CameraDebugOverlay map={map} />}
      <ScaledLayout className="screen-enter">
        {/* Map overlays — layered "built asset" illustrations per active measure */}
        <svg
          className="absolute"
          style={{ left: 0, top: 0, width: 1512, height: 1008, pointerEvents: 'none' }}
          viewBox="0 0 1512 1008"
        >
          {/* Sea wall — replaced by 3D MapLibre layer in SimulationLayers.jsx */}

          {/* Raised roads — elevated deck band with shadow, highlight, and pier ticks */}
          <g style={overlayGroupStyle(active.raisedRoads)}>
            {[[560, 760, 700, 660], [700, 660, 860, 600], [860, 600, 1000, 560]].map(([x1, y1, x2, y2], i) => {
              const dx = x2 - x1, dy = y2 - y1;
              const len = Math.hypot(dx, dy) || 1;
              const nx = -dy / len, ny = dx / len;
              return (
                <g key={i}>
                  <line x1={x1 + 2} y1={y1 + 4} x2={x2 + 2} y2={y2 + 4} stroke="#000" strokeOpacity={0.16} strokeWidth={9} strokeLinecap="round" />
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={MEASURES[1].color} strokeWidth={8} strokeLinecap="round" />
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#fff" strokeOpacity={0.35} strokeWidth={2} strokeLinecap="round" />
                  {[0.25, 0.5, 0.75].map((t, j) => {
                    const px = x1 + dx * t, py = y1 + dy * t;
                    return <line key={j} x1={px - nx * 7} y1={py - ny * 7} x2={px + nx * 7} y2={py + ny * 7} stroke={MEASURES[1].color} strokeWidth={3} strokeLinecap="round" />;
                  })}
                </g>
              );
            })}
          </g>

          {/* Elevated buildings — footprint on stilts with corner legs + ground shadow */}
          <g style={overlayGroupStyle(active.elevatedBuildings)}>
            {[[640, 420], [780, 520], [690, 610]].map(([x, y], i) => {
              const w = 46, h = 46;
              return (
                <g key={i}>
                  <ellipse cx={x + w / 2} cy={y + h + 9} rx={w / 2 - 3} ry={5} fill="#000" opacity={0.15} />
                  {[[x + 5, y + h], [x + w - 5, y + h], [x + 5, y + h - 4], [x + w - 5, y + h - 4]].map(([lx, ly], k) => (
                    <line key={k} x1={lx} y1={ly} x2={lx} y2={ly + 9} stroke={MEASURES[2].color} strokeWidth={2.5} strokeLinecap="round" />
                  ))}
                  <rect x={x} y={y} width={w} height={h} rx={8} fill={MEASURES[2].color} fillOpacity={0.22} stroke={MEASURES[2].color} strokeWidth={3} />
                  <rect x={x + 6} y={y + 6} width={w - 12} height={5} fill="#fff" opacity={0.4} rx={2} />
                </g>
              );
            })}
          </g>

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

          {/* Resident support — service-point clusters within a soft support zone */}
          <g style={overlayGroupStyle(active.residentSupport)}>
            {[[600, 350], [560, 470]].map(([cx, cy], i) => (
              <g key={i}>
                <circle cx={cx} cy={cy} r={19} fill={MEASURES[6].color} fillOpacity={0.14} />
                {[[-6, 0], [5, -5], [3, 6]].map(([dx, dy], k) => (
                  <g key={k}>
                    <rect x={cx + dx - 4} y={cy + dy - 3} width={8} height={7} rx={1.5} fill={MEASURES[6].color} />
                    <path d={`M ${cx + dx - 5},${cy + dy - 3} L ${cx + dx},${cy + dy - 7} L ${cx + dx + 5},${cy + dy - 3} Z`} fill={MEASURES[6].color} />
                  </g>
                ))}
              </g>
            ))}
          </g>
        </svg>

        {/* Back arrow */}
        <button
          onClick={onBack}
          aria-label="Back"
          className="absolute flex items-center left-[32px] top-[99px]"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', pointerEvents: 'auto' }}
        >
          <span className="font-semibold text-[26px] leading-[28px] text-white">←</span>
        </button>
      </ScaledLayout>

      <HomePageHeader />

      {/* Left-side column — toggle panel stacked above the data card, as a
          single flex column so the data card always sits directly below the
          toggle panel regardless of its content height (no hardcoded gap
          guessing). Rendered outside ScaledLayout with position:fixed so it
          stays flush with the true viewport left edge on any screen width
          (see ARCHITECTURE_AND_DESIGN_SYSTEM.md Section D pattern). */}
      <div style={{ position: 'fixed', left: 16, top: 93, width: 360, display: 'flex', flexDirection: 'column', gap: 12, pointerEvents: 'none' }}>
        {/* Scenario controls — step title + sub-heading live at the top of
            this card, matching AssessCriticalZonesPage's title→divider→content
            pattern (Section H), instead of a separate floating title box. */}
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
          <p className="font-semibold text-[18px] leading-[23px] tracking-[-0.44px] text-[#1e2939]" style={{ margin: 0 }}>
            2. Simulate Response Scenarios
          </p>
          <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />
          <p className="font-semibold text-[16px] leading-[20px] tracking-[-0.44px] text-[#1e2939]" style={{ margin: 0 }}>
            Scenario controls
          </p>
          {MEASURES.map((m) => (
            <ToggleRow key={m.key} measure={m} active={active[m.key]} onToggle={() => toggle(m.key)} />
          ))}
        </div>

        {/* Current Simulated Scenario — live impact */}
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
              Current Simulated Scenario
            </p>
            <p className="font-medium text-[12px] leading-[16px]" style={{ margin: '2px 0 0 0', color: '#6b778a' }}>
              Live outcome of the active protection measures
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <DonutChart pct={budgetPct} size={84} />
            <div>
              <div style={{ fontSize: 24, fontWeight: 500, color: 'black', letterSpacing: '-0.44px', lineHeight: '27px' }}>{formatCost(totalCost)}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#6b778a', marginTop: 2 }}>of {formatCost(AVAILABLE_BUDGET)} available</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: '#6b778a' }}>{budgetPct}% used</div>
            </div>
          </div>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.08)' }} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 12, columnGap: 16 }}>
            <MetricCell label="Residents protected" value={String(residentsProtected)} />
            <MetricCell label="Flood-risk reduction" value={`${floodRiskReduction}%`} />
            <MetricCell label="Delay to first impact" value={`+${delayYears} years`} />
            <MetricCell label="Implementation time" value={`${timeMin}–${timeMax} months`} />
            <MetricCell label="Value for effort" value={valueForEffort} />
          </div>

          <p className="font-medium text-[12px] leading-[17px]" style={{ margin: 0, color: '#505153', letterSpacing: '-0.44px' }}>
            {mainTradeoff}
          </p>

          <button
            onClick={onCompare}
            className="w-full flex items-center justify-center"
            style={{ height: 36, borderRadius: 14, background: 'rgba(16,24,40,0.9)', border: 'none', cursor: 'pointer' }}
          >
            <span className="font-medium text-[14px] text-white">Compare Scenarios</span>
          </button>
        </div>
      </div>
    </>
  );
}
