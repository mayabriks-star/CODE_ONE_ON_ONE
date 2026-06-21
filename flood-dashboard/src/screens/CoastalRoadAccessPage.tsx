import { useState, useEffect } from 'react';
import { Menu, Bell, ArrowLeft, Pencil } from 'lucide-react';

interface Props {
  onBack: () => void;
  onApprove: () => void;
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

function DonutChart() {
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
    <div style={{ position: 'relative', width: 186, height: 186, flexShrink: 0 }}>
      <svg viewBox="0 0 186 186" width={186} height={186}>
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
  { n: 1, label: 'Raise Low Road Segments:', desc: 'Raise the coastal road segment to a target elevation of 2.6 m above MSL using pile-supported structures.' },
  { n: 2, label: 'Upgrade Drainage Capacity and Outfalls:', desc: 'Increase drainage capacity with larger culverts and connect outfalls to a dedicated pump station for flood prevention.' },
  { n: 3, label: 'Reinforce Shoreline Edge Protection:', desc: 'Strengthen embankments and install scour protection at vulnerable sections exposed to storm surge.' },
  { n: 4, label: 'Protect and Adjust Adjacent Infrastructure:', desc: 'Relocate exposed utilities out of the surge zone and elevate critical lines above the design flood elevation.' },
  { n: 5, label: 'Protect and Relocate Utilities:', desc: 'Relocate exposed utilities out of the surge zone and elevate critical infrastructure along the corridor.' },
  { n: 6, label: 'Maintain Emergency Access:', desc: 'Ensure continuous access for emergency services through all stages of construction.' },
];

export default function CoastalRoadAccessPage({ onBack, onApprove }: Props) {
  const DESIGN_RIGHT_HEIGHT = 788;
  const [rightScale, setRightScale] = useState(() =>
    Math.min(1, (window.innerHeight - 170) / DESIGN_RIGHT_HEIGHT)
  );
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    const update = () =>
      setRightScale(Math.min(1, (window.innerHeight - 170) / DESIGN_RIGHT_HEIGHT));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const editStyle: React.CSSProperties = isEditing ? {
    outline: '1.5px dashed rgba(0,0,0,0.18)',
    borderRadius: 4,
    padding: '2px 4px',
    cursor: 'text',
  } : {};

  return (
    <div
      className="screen-enter"
      style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8f8f8' }}
    >
      {/* Header */}
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
            Assess Critical Zones- Costal Road Access
          </span>
        </div>
      </div>

      {/* Body */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          paddingLeft: '70px',
          paddingRight: '70px',
          paddingTop: '20px',
          paddingBottom: '35px',
          gap: '42px',
          boxSizing: 'border-box',
        }}
      >
        {/* Left column — scrollable */}
        <div className="no-scrollbar" style={{ width: '724px', flexShrink: 0, overflowY: 'auto' }}>

          {/* Map image with overlay tab */}
          <div style={{ position: 'relative' }}>
            <img
              src="/costal-road-map.jpg"
              alt="Coastal road aerial view"
              style={{ width: '100%', height: '341px', objectFit: 'cover', borderRadius: '20px 20px 0 0', display: 'block' }}
            />
            {/* Map marker tab */}
            <div style={{ position: 'absolute', bottom: '30px', left: '365px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.9)', borderRadius: '9999px', padding: '4px 10px 4px 4px' }}>
                <img src="/icons/costal-road-access.svg" alt="" width={27} height={27} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: 600, color: '#101828', lineHeight: '14px' }}>Costal Road Access</p>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: 500, color: '#505153', lineHeight: '14px' }}>Potential disruption</p>
                </div>
              </div>
              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.7)', marginLeft: 18 }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', marginLeft: 14 }} />
            </div>
          </div>

          {/* White action plan card */}
          <div style={{ background: 'white', borderRadius: '0 0 20px 20px', padding: '20px 24px 24px 24px', boxSizing: 'border-box' }}>

            {/* Action Plan Overview */}
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#364153', letterSpacing: '-0.31px', lineHeight: '24px' }}>Action Plan Overview</p>
            <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '20.8px', letterSpacing: '-0.08px', width: '512px', ...editStyle }}>
              The coastal road segment provides critical connectivity for 620 residents and is a primary evacuation and emergency access route. It is exposed to storm surge and sea level rise, with multiple elevation and infrastructure vulnerabilities.
            </p>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #cfcccc', marginTop: '20px' }} />

            {/* Implementation Steps */}
            <p style={{ margin: '20px 0 0 0', fontSize: '18px', fontWeight: 600, color: '#364153', letterSpacing: '-0.31px', lineHeight: '24px' }}>Implementation Steps</p>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', width: '512px' }}>
              {implementationSteps.map((step) => (
                <div key={step.n} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(234,120,54,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8.8px', fontWeight: 700, color: '#ea7836', letterSpacing: '0.18px' }}>{step.n}</span>
                    </div>
                  </div>
                  <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: 0, fontSize: '13px', lineHeight: '20.15px', letterSpacing: '-0.08px', ...editStyle }}>
                    <span style={{ fontWeight: 600, color: '#364153' }}>{step.label}</span>
                    {' '}
                    <span style={{ fontWeight: 400, color: '#505153' }}>{step.desc}</span>
                  </p>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ borderTop: '1px solid #cfcccc', marginTop: '20px' }} />

            {/* Implementation Approach */}
            <p style={{ margin: '20px 0 0 0', fontSize: '18px', fontWeight: 600, color: '#364153', letterSpacing: '-0.31px', lineHeight: '24px' }}>Implementation Approach</p>
            <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '20.8px', letterSpacing: '-0.08px', width: '578px', ...editStyle }}>
              Construction will be completed in phased segments to maintain at least one travel lane at all times. Work will prioritize the lowest elevation areas and critical access points. Coordination with utility providers and emergency services will minimize disruptions.
            </p>
            <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '10px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '20.8px', letterSpacing: '-0.08px', width: '579px', ...editStyle }}>
              Implementation is designed to align with storm season windows and permit approval timelines. Coordination with utility providers and emergency services will minimize disruptions.
            </p>

            {/* Bottom image card */}
            <div style={{ marginTop: '16px', border: '1px solid #cfcccc', borderRadius: '15px', display: 'flex', overflow: 'hidden', alignItems: 'stretch', width: '100%' }}>
              <img
                src="/costal-road-pile.jpg"
                alt="Elevated roadway"
                style={{ width: '325px', flexShrink: 0, objectFit: 'cover' }}
              />
              <div style={{ flex: 1, padding: '20px 20px 20px 24px' }}>
                <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#364153', lineHeight: '20px', letterSpacing: '-0.44px', ...editStyle }}>
                  Elevated Roadway on Pile-Supported Structure
                </p>
                <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: 400, color: '#505153', lineHeight: '20px', letterSpacing: '-0.44px', ...editStyle }}>
                  Raising the roadway on piles allows storm surge and wave energy to pass beneath, reducing overtopping while maintaining connectivity and long-term resilience.
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Right column — proportionally scaled to viewport height */}
        <div style={{ flex: 1, overflow: 'hidden', minWidth: 0, position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: `${100 / rightScale}%`,
              transformOrigin: 'top left',
              transform: `scale(${rightScale})`,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Cards section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

              {/* Problem Summary */}
              <div style={{ background: 'white', borderRadius: '20px', height: '151px', display: 'flex', alignItems: 'center', gap: '45px', padding: '0 16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: '12px', paddingBottom: '16px' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#364153', lineHeight: '19.5px', letterSpacing: '-0.08px', whiteSpace: 'nowrap' }}>Problem Summary</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '19.2px', width: '359px' }}>
                    The coastal road is exposed to storm surge and rising sea levels. Without adaptation, access to the Harbor District may become limited during high-water events, affecting evacuation routes, emergency access, and daily mobility.
                  </p>
                </div>
                <div style={{ width: '1px', height: '91px', background: 'rgba(0,0,0,0.1)', flexShrink: 0 }} />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100px', flexShrink: 0 }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#364153', lineHeight: '19.5px', whiteSpace: 'nowrap' }}>Risk Level</p>
                  <RiskGauge />
                </div>
              </div>

              {/* Cost & Budget */}
              <div style={{ background: 'white', borderRadius: '20px', height: '286px', padding: '0 18px', display: 'flex', flexDirection: 'column', justifyContent: 'center', flexShrink: 0 }}>
                <div style={{ paddingLeft: '25px' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#364153', lineHeight: '18px', letterSpacing: '-0.15px', whiteSpace: 'nowrap' }}>Cost &amp; Budget</p>
                  <p style={{ margin: '10px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '16px', letterSpacing: '0.06px', maxWidth: '519px' }}>
                    Implementation is estimated over 12–20 months with an estimated total budget of $18.6M, funded through a combination of municipal funds and grants.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '25px', gap: '75px' }}>
                  <DonutChart />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '17px', width: '280px', flexShrink: 0 }}>
                    {[
                      { color: '#E87840', text: 'Road Elevation & Structural Works', value: '4.5M' },
                      { color: '#F5A06E', text: 'Drainage & Coastal Protection', value: '3M' },
                      { color: '#F5D4A0', text: 'Utilities, Access & Safety Upgrades', value: '1.5M' },
                    ].map((item) => (
                      <div key={item.value} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                        <div style={{ width: 17, height: 17, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: 'normal', whiteSpace: 'nowrap' }}>
                          {item.text} <span style={{ fontWeight: 600, color: '#364153' }}>{item.value}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Implementation Schedule */}
              <div style={{ background: 'white', borderRadius: '20px', height: '196px', paddingLeft: '43px', paddingRight: '43px', display: 'flex', flexDirection: 'column', gap: '20px', justifyContent: 'center', flexShrink: 0 }}>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#364153' }}>Implementation Schedule</p>
                <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '38px' }}>
                  {/* Vertical line */}
                  <div style={{ position: 'absolute', left: '10px', top: '10px', width: '1.5px', height: '116px', background: '#364153', zIndex: 0 }} />
                  {[
                    { label: 'Planning & Approval', value: '0-4 months', bold: true },
                    { label: 'Site Preparation', value: '4-16 months', bold: true },
                    { label: 'Construction & Adaptation Works', value: '16-20 months', bold: true },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', gap: '15px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid #364153', flexShrink: 0, background: 'white' }} />
                      <p style={{ margin: 0, fontSize: '14px', color: '#364153', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#505153' }}>{item.label}</span>
                        {' '}
                        <span style={{ fontWeight: item.bold ? 700 : 600 }}>{item.value}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Buttons — 55px below last card (matches Figma gap) */}
            <div style={{ marginTop: '55px', display: 'flex', gap: '30px', justifyContent: 'center' }}>
              <button
                onClick={() => setIsEditing(e => !e)}
                style={{
                  width: '233px',
                  height: '40px',
                  border: '1px solid #323232',
                  borderRadius: '100px',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '17px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#323232',
                  letterSpacing: '-0.44px',
                }}
              >
                <Pencil size={16} />
                {isEditing ? 'Done' : 'Edit plan'}
              </button>
              <button
                onClick={onApprove}
                style={{
                  width: '233px',
                  height: '40px',
                  background: '#323232',
                  border: '1px solid #323232',
                  borderRadius: '100px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#f8f8f8',
                  letterSpacing: '-0.44px',
                }}
              >
                Approve area plan
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
