import { useState, useRef, useCallback, useEffect } from 'react';

type PtKey = 'p0' | 'c0' | 'c1' | 'p1' | 'c2' | 'c3' | 'p2' | 'c4' | 'c5' | 'p3';
type Pt = { x: number; y: number };
type Pts = Record<PtKey, Pt>;

const DEFAULT_PTS: Pts = {
  p0: { x: 20,  y: 218 },
  c0: { x: 120, y: 222 },
  c1: { x: 240, y: 228 },
  p1: { x: 370, y: 232 },
  c2: { x: 480, y: 236 },
  c3: { x: 580, y: 238 },
  p2: { x: 680, y: 236 },
  c4: { x: 780, y: 234 },
  c5: { x: 880, y: 228 },
  p3: { x: 980, y: 222 },
};

function buildPath(pts: Pts) {
  return `M ${pts.p0.x},${pts.p0.y} C ${pts.c0.x},${pts.c0.y} ${pts.c1.x},${pts.c1.y} ${pts.p1.x},${pts.p1.y} C ${pts.c2.x},${pts.c2.y} ${pts.c3.x},${pts.c3.y} ${pts.p2.x},${pts.p2.y} C ${pts.c4.x},${pts.c4.y} ${pts.c5.x},${pts.c5.y} ${pts.p3.x},${pts.p3.y}`;
}

const ROAD_GLOW_STYLE = `
@keyframes roadPulse {
  0%, 100% { opacity: 0.55; }
  50%       { opacity: 0.85; }
}
.road-glow-outer { animation: roadPulse 3.2s ease-in-out infinite; }
.road-glow-mid   { animation: roadPulse 3.2s ease-in-out infinite 0.5s; }
`;
import { Menu, Bell, ArrowLeft, Pencil } from 'lucide-react';

interface Props {
  onBack: () => void;
  onApprove: () => void;
  embedded?: boolean;
  containerHeight?: number;
}

function RiskGauge() {
  const cx = 50;
  const cy = 46;       // Figma arc center at y≈46
  const r = 34;        // Figma arc radius ≈34
  const strokeW = 7;
  const startAngle = 215; // lower-left
  const endAngle = 145;   // lower-right (was 325 = upper-left — wrong direction)
  const fillPct = 9.2 / 10;

  function polarToXY(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function arcPath(from: number, to: number) {
    const s = polarToXY(from, r);
    const e = polarToXY(to, r);
    const clockwiseSpan = ((to - from) % 360 + 360) % 360;
    const large = clockwiseSpan > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y}`;
  }

  const totalSpan = ((endAngle - startAngle) % 360 + 360) % 360; // 290°
  const activeEnd = (startAngle + totalSpan * fillPct) % 360;     // 121.8°

  return (
    <svg viewBox="0 0 100 82" width={100} height={82}>
      <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#e5e7eb" strokeWidth={strokeW} strokeLinecap="round" />
      <path d={arcPath(startAngle, activeEnd)} fill="none" stroke="#0b1f3a" strokeWidth={strokeW} strokeLinecap="round" />
      <text x={cx} y={52} textAnchor="middle" fontSize={19} fontWeight="bold" fill="#0b1f3a" fontFamily="Inter, sans-serif">9.2</text>
      <text x={cx} y={64} textAnchor="middle" fontSize={6.5} fill="#6b778a" fontFamily="Inter, sans-serif">Risk Score</text>
    </svg>
  );
}

function DonutChart({ size = 186 }: { size?: number }) {
  const cx = 93;
  const cy = 93;
  const r = 55;
  const circum = 2 * Math.PI * r;

  const segments = [
    { pct: 0.20, color: '#F5D4A0', label: '20%', lx: 125, ly: 49 },
    { pct: 0.30, color: '#F5A06E', label: '30%', lx: 138, ly: 125 },
    { pct: 0.50, color: '#E87840', label: '50%', lx: 38,  ly: 93  },
  ];

  let offset = 0;
  const arcs = segments.map((seg) => {
    const dash = seg.pct * circum;
    const gap = circum - dash;
    const rotation = (offset / circum) * 360 - 90;
    offset += dash;
    return { ...seg, dash, gap, rotation };
  });

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg viewBox="0 0 186 186" width={size} height={size}>
        <circle cx={cx} cy={cy} r={55} fill="none" stroke="#f3f4f6" strokeWidth={30} />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={arc.color}
            strokeWidth={30}
            strokeDasharray={`${arc.dash} ${arc.gap}`}
            strokeDashoffset={0}
            transform={`rotate(${arc.rotation} ${cx} ${cy})`}
          />
        ))}
        {segments.map((seg) => (
          <text key={seg.label} x={seg.lx} y={seg.ly} fontSize={12} fontWeight="600" fill="#364153" fontFamily="Inter, sans-serif" textAnchor="middle">
            {seg.label}
          </text>
        ))}
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontSize: 20, fontWeight: 700, color: '#323232', pointerEvents: 'none' }}>
        9M
      </div>
    </div>
  );
}

const implementationSteps = [
  { n: 1, label: 'Raise Road Elevation:', desc: 'Elevate the coastal road to 2.6 m above MSL using pile-supported structures to withstand surge events.' },
  { n: 2, label: 'Upgrade Drainage & Shoreline:', desc: 'Expand culvert capacity, connect outfalls to a dedicated pump station, and reinforce embankments against storm surge.' },
  { n: 3, label: 'Relocate & Protect Utilities:', desc: 'Move exposed utilities outside the surge zone and elevate critical infrastructure above the design flood elevation.' },
  { n: 4, label: 'Ensure Emergency Access:', desc: 'Maintain continuous emergency access throughout all construction phases, coordinated with local services.' },
];

export default function CoastalRoadAccessPage({ onBack, onApprove, embedded, containerHeight }: Props) {
  const embH = containerHeight ?? 826;
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPath, setIsEditingPath] = useState(false);
  const [animKey, setAnimKey] = useState(0);
  const [pts, setPts] = useState<Pts>(() => {
    try {
      const saved = localStorage.getItem('coastal-road-pts');
      return saved ? JSON.parse(saved) : DEFAULT_PTS;
    } catch { return DEFAULT_PTS; }
  });
  const [pathLen, setPathLen] = useState(1500);
  const [dashOffset, setDashOffset] = useState(1500);
  const svgRef = useRef<SVGSVGElement>(null);
  const measureRef = useRef<SVGPathElement>(null);
  const dragging = useRef<{ key: PtKey; startMx: number; startMy: number; startPt: Pt } | null>(null);

  useEffect(() => {
    if (isEditingPath) return;
    const run = () => {
      const len = measureRef.current?.getTotalLength() ?? 1500;
      setPathLen(len);
      setDashOffset(len);
      requestAnimationFrame(() => requestAnimationFrame(() => setDashOffset(0)));
    };
    // Small delay on first mount so the SVG path is in the DOM
    const t = setTimeout(run, 80);
    return () => clearTimeout(t);
  }, [animKey, isEditingPath]);

  const toSvgCoords = useCallback((mx: number, my: number): Pt => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: (mx - rect.left) / rect.width * 1000, y: (my - rect.top) / rect.height * 260 };
  }, []);

  function onHandleDown(key: PtKey, e: React.MouseEvent) {
    e.stopPropagation();
    dragging.current = { key, startMx: e.clientX, startMy: e.clientY, startPt: { ...pts[key] } };
  }

  function onSvgMouseMove(e: React.MouseEvent) {
    if (!dragging.current) return;
    const { key, startMx, startMy, startPt } = dragging.current;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = (e.clientX - startMx) / rect.width * 1000;
    const dy = (e.clientY - startMy) / rect.height * 260;
    setPts(p => {
      const updated = { ...p, [key]: { x: +(startPt.x + dx).toFixed(1), y: +(startPt.y + dy).toFixed(1) } };
      localStorage.setItem('coastal-road-pts', JSON.stringify(updated));
      return updated;
    });
  }

  function onSvgMouseUp() { dragging.current = null; }

  const pathD = buildPath(pts);

  const ANCHOR_KEYS: PtKey[] = ['p0', 'p1', 'p2', 'p3'];
  const CTRL_KEYS: PtKey[] = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];


  return (
    <>
    <style>{`
      .editable-field { border-radius: 4px; transition: background 0.15s; }
      .editable-field:hover { background: rgba(16,24,40,0.06); cursor: text; }
      .editable-field:focus { background: rgba(16,24,40,0.05); outline: none; cursor: text; }
    `}</style>
    <div
      className="screen-enter"
      style={{ height: embedded ? `${embH}px` : '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: embedded ? 'transparent' : '#f8f8f8', position: 'relative' }}
    >
      {!embedded && (
        <div style={{ flexShrink: 0, paddingLeft: '28px', paddingRight: '70px', paddingTop: '33px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '21px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#364153', padding: 0, display: 'flex' }}>
              <Menu size={20} />
            </button>
            <div style={{ background: 'rgba(247,247,247,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bell size={20} color="#364153" />
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '19px' }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#364153', padding: 0, display: 'flex' }}>
              <ArrowLeft size={20} />
            </button>
            <span style={{ fontSize: '26px', fontWeight: 600, color: '#364153', letterSpacing: '-0.44px', lineHeight: '28px' }}>
              Assess Critical Zones — Costal Road Access
            </span>
          </div>
        </div>
      )}

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          paddingLeft: embedded ? '20px' : '70px',
          paddingRight: embedded ? '20px' : '70px',
          paddingTop: '16px',
          paddingBottom: '16px',
          gap: '14px',
          boxSizing: 'border-box',
        }}
      >
        {/* Top card — full-width image, text below */}
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', flexShrink: 0 }}>
          {/* Image full width */}
          <div style={{ position: 'relative' }}>
            <style>{ROAD_GLOW_STYLE}</style>
            <img
              src="/coastal-road-tab.png"
              alt="Coastal road aerial view"
              style={{ width: '100%', height: 340, objectFit: 'cover', objectPosition: 'center 50%', display: 'block' }}
            />
            {/* Orange road highlight + path editor */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: isEditingPath ? 'all' : 'none', overflow: 'hidden' }}>
              <svg
                ref={svgRef}
                width="100%" height="100%" viewBox="0 0 1000 260" preserveAspectRatio="none"
                style={{ position: 'absolute', inset: 0, display: 'block', cursor: isEditingPath ? 'crosshair' : 'default' }}
                onMouseMove={onSvgMouseMove}
                onMouseUp={onSvgMouseUp}
                onMouseLeave={onSvgMouseUp}
              >
                <defs>
                  <filter id="rg-outer" x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="18" />
                  </filter>
                  <filter id="rg-mid" x="-30%" y="-30%" width="160%" height="160%">
                    <feGaussianBlur stdDeviation="8" />
                  </filter>
                </defs>

                {/* Hidden path used only to measure total length */}
                <path ref={measureRef} d={pathD} stroke="none" fill="none" />

                {/* Glow layers — dash-animated along the actual path */}
                <path className={isEditingPath ? undefined : 'road-glow-outer'}
                  d={pathD} stroke="rgba(234,120,54,0.55)" strokeWidth="80" fill="none" strokeLinecap="round"
                  filter="url(#rg-outer)"
                  strokeDasharray={isEditingPath ? undefined : pathLen}
                  strokeDashoffset={isEditingPath ? undefined : dashOffset}
                  style={isEditingPath ? undefined : { transition: 'stroke-dashoffset 2.2s cubic-bezier(0.4,0,0.2,1)' }} />
                <path className={isEditingPath ? undefined : 'road-glow-mid'}
                  d={pathD} stroke="rgba(251,146,60,0.65)" strokeWidth="32" fill="none" strokeLinecap="round"
                  filter="url(#rg-mid)"
                  strokeDasharray={isEditingPath ? undefined : pathLen}
                  strokeDashoffset={isEditingPath ? undefined : dashOffset}
                  style={isEditingPath ? undefined : { transition: 'stroke-dashoffset 2.2s cubic-bezier(0.4,0,0.2,1)' }} />

                {/* Edit handles — only in path-edit mode */}
                {isEditingPath && (
                  <>
                    {/* Control-point guide lines */}
                    <line x1={pts.p0.x} y1={pts.p0.y} x2={pts.c0.x} y2={pts.c0.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1={pts.p1.x} y1={pts.p1.y} x2={pts.c1.x} y2={pts.c1.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1={pts.p1.x} y1={pts.p1.y} x2={pts.c2.x} y2={pts.c2.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1={pts.p2.x} y1={pts.p2.y} x2={pts.c3.x} y2={pts.c3.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1={pts.p2.x} y1={pts.p2.y} x2={pts.c4.x} y2={pts.c4.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />
                    <line x1={pts.p3.x} y1={pts.p3.y} x2={pts.c5.x} y2={pts.c5.y} stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" strokeDasharray="4 3" />

                    {/* Control points — hollow */}
                    {CTRL_KEYS.map(k => (
                      <circle key={k} cx={pts[k].x} cy={pts[k].y} r={7}
                        fill="rgba(255,255,255,0.15)" stroke="white" strokeWidth="1.5"
                        style={{ cursor: 'grab' }}
                        onMouseDown={e => onHandleDown(k, e)} />
                    ))}

                    {/* Anchor points — filled orange */}
                    {ANCHOR_KEYS.map(k => (
                      <circle key={k} cx={pts[k].x} cy={pts[k].y} r={9}
                        fill="#fb923c" stroke="white" strokeWidth="2"
                        style={{ cursor: 'grab' }}
                        onMouseDown={e => onHandleDown(k, e)} />
                    ))}
                  </>
                )}
              </svg>
            </div>

            {/* Path-edit toggle — bottom-left of image */}
            <button
              onClick={() => { setIsEditingPath(e => { if (e) setAnimKey(k => k + 1); return !e; }); }}
              style={{
                position: 'absolute', bottom: 12, left: 12, zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 100,
                background: isEditingPath ? '#fb923c' : 'rgba(255,255,255,0.9)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
                border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
                color: isEditingPath ? 'white' : '#364153',
              }}
            >
              {isEditingPath ? 'Done' : 'Edit road line'}
            </button>
            {/* Edit button — over image, top-right */}
            <button
              onClick={() => setIsEditing(e => !e)}
              style={{
                position: 'absolute', top: 12, right: 12, zIndex: 10,
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 14px 6px 10px', borderRadius: 100,
                background: isEditing ? '#101828' : 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
                border: 'none', cursor: 'pointer',
                transition: 'background 0.2s ease',
              }}
            >
              <Pencil size={13} color={isEditing ? 'white' : '#101828'} />
              <span style={{ fontSize: 13, fontWeight: 500, color: isEditing ? 'white' : '#101828', letterSpacing: '-0.2px', transition: 'color 0.2s ease' }}>Edit</span>
            </button>
          </div>
          {/* Text below image */}
          <div style={{ padding: '20px 28px 24px' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px', lineHeight: '30px' }}>Action Plan Overview</p>
            <p contentEditable={isEditing} suppressContentEditableWarning className={isEditing ? 'editable-field' : undefined} style={{ margin: '10px 0 0 0', fontSize: 20, fontWeight: 400, color: '#505153', lineHeight: '30px', letterSpacing: '-0.08px' }}>
              The coastal road serves 620 residents as a primary evacuation and emergency access corridor. Exposed to storm surge and rising sea levels, it faces critical elevation vulnerabilities — without intervention, access to the Harbor District will be compromised during high-water events, disrupting evacuation routes and daily mobility.
            </p>
          </div>
        </div>

        {/* Bottom two columns */}
        <div style={{ flex: 1, display: 'flex', gap: '14px', overflow: 'hidden', minHeight: 0 }}>

          {/* Left — Implementation Steps */}
          <div className="no-scrollbar" style={{ flex: 1, background: 'white', borderRadius: 16, padding: '22px 26px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px', lineHeight: '28px' }}>Implementation Steps</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {implementationSteps.map((step) => (
                <div key={step.n} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, paddingTop: 3 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'rgba(234,120,54,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#ea7836' }}>{step.n}</span>
                    </div>
                  </div>
                  <p contentEditable={isEditing} suppressContentEditableWarning className={isEditing ? 'editable-field' : undefined} style={{ margin: 0, fontSize: 20, lineHeight: '30px', letterSpacing: '-0.08px' }}>
                    <span style={{ fontWeight: 600, color: '#364153' }}>{step.label}</span>
                    {' '}
                    <span style={{ fontWeight: 400, color: '#505153' }}>{step.desc}</span>
                  </p>
                </div>
              ))}
            </div>
            {!embedded && (
              <>
                <div style={{ borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />
                <p style={{ margin: '0 0 10px 0', fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px' }}>Implementation Approach</p>
                <p contentEditable={isEditing} suppressContentEditableWarning className={isEditing ? 'editable-field' : undefined} style={{ margin: 0, fontSize: 20, fontWeight: 400, color: '#505153', lineHeight: '30px', letterSpacing: '-0.08px' }}>
                  Construction will be completed in phased segments to maintain at least one travel lane at all times. Work will prioritize the lowest elevation areas and critical access points.
                </p>
              </>
            )}
          </div>

          {/* Right — Cost & Budget + Schedule + Approve */}
          <div className="no-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>

            {/* Cost & Budget */}
            <div style={{ background: 'white', borderRadius: 16, padding: '18px 22px', flexShrink: 0 }}>
              <p style={{ margin: '0 0 12px 0', fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px' }}>Cost &amp; Budget</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <DonutChart size={146} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 16 }}>
                  {[
                    { color: '#E87840', text: 'Road Elevation & Structural Works', value: '4.5M' },
                    { color: '#F5A06E', text: 'Drainage & Coastal Protection', value: '3M' },
                    { color: '#F5D4A0', text: 'Utilities, Access & Safety Upgrades', value: '1.5M' },
                  ].map((item) => (
                    <div key={item.value} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 400, color: '#505153', lineHeight: 'normal' }}>
                        {item.text} <span style={{ fontWeight: 600, color: '#364153' }}>{item.value}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Implementation Schedule */}
            <div style={{ background: 'white', borderRadius: 16, padding: '18px 26px', flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: '0 0 14px 0', fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px' }}>Implementation Schedule</p>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ position: 'absolute', left: 9, top: 10, width: 1.5, height: 'calc(100% - 20px)', background: '#364153', zIndex: 0 }} />
                {[
                  { label: 'Planning & Approval', value: '0–4 months' },
                  { label: 'Site Preparation', value: '4–16 months' },
                  { label: 'Construction & Adaptation Works', value: '16–20 months' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', gap: 14, alignItems: 'center', position: 'relative', zIndex: 1 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid #364153', flexShrink: 0, background: 'white' }} />
                    <p style={{ margin: 0, fontSize: 20, color: '#364153' }}>
                      <span style={{ color: '#505153' }}>{item.label}</span>{' '}
                      <span style={{ fontWeight: 700 }}>{item.value}</span>
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    </>
  );
}
