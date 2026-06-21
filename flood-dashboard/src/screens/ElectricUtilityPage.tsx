import { useState, useEffect } from 'react';
import { Menu, Bell, ArrowLeft, Pencil } from 'lucide-react';

interface Props {
  onBack: () => void;
  onApprove: () => void;
}

function RiskGauge() {
  const cx = 50;
  const cy = 46;
  const r = 34;
  const strokeW = 7;
  const startAngle = 215;
  const endAngle = 145;
  const fillPct = 8.6 / 10;

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

  const totalSpan = ((endAngle - startAngle) % 360 + 360) % 360;
  const activeEnd = (startAngle + totalSpan * fillPct) % 360;

  return (
    <svg viewBox="0 0 100 82" width={100} height={82}>
      <path d={arcPath(startAngle, endAngle)} fill="none" stroke="#e5e7eb" strokeWidth={strokeW} strokeLinecap="round" />
      <path d={arcPath(startAngle, activeEnd)} fill="none" stroke="#0b1f3a" strokeWidth={strokeW} strokeLinecap="round" />
      <text x={cx} y={52} textAnchor="middle" fontSize={19} fontWeight="bold" fill="#0b1f3a" fontFamily="Inter, sans-serif">8.6</text>
      <text x={cx} y={64} textAnchor="middle" fontSize={6.5} fill="#6b778a" fontFamily="Inter, sans-serif">Risk Score</text>
    </svg>
  );
}

function DonutChart() {
  const cx = 93;
  const cy = 93;
  const r = 55;
  const circum = 2 * Math.PI * r;

  // 42% dark amber, 27% medium yellow, 31% light yellow
  const segments = [
    { pct: 0.42, color: '#D4A000', label: '42%', lx: 146, ly: 79 },
    { pct: 0.27, color: '#F5C200', label: '27%', lx: 74,  ly: 145 },
    { pct: 0.31, color: '#FFE580', label: '31%', lx: 47,  ly: 62 },
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
        7.4M
      </div>
    </div>
  );
}

const implementationSteps = [
  { n: 1, label: 'Identify exposed electrical assets:', desc: 'Map electrical cabinets, distribution points, and building-level power connections exposed to projected flood levels.' },
  { n: 2, label: 'Raise electrical cabinets:', desc: 'Elevate vulnerable electrical cabinets above projected flood height and protect them from direct water exposure.' },
  { n: 3, label: 'Add protected building power points:', desc: 'Install protected power access points in selected buildings to support essential services during disruption.' },
  { n: 4, label: 'Improve backup power readiness:', desc: 'Add backup power support and monitoring for critical service continuity during high-water events.' },
  { n: 5, label: 'Coordinate utility shutdown protocols:', desc: 'Define safe shutdown and restart procedures with utility providers and emergency teams.' },
];

const ACCENT = '#ffbb00';
const ACCENT_BG = 'rgba(255,187,0,0.2)';

export default function ElectricUtilityPage({ onBack, onApprove }: Props) {
  const DESIGN_RIGHT_HEIGHT = 788;
  const [rightScale, setRightScale] = useState(() =>
    Math.min(1, (window.innerHeight - 135) / DESIGN_RIGHT_HEIGHT)
  );
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    const update = () =>
      setRightScale(Math.min(1, (window.innerHeight - 135) / DESIGN_RIGHT_HEIGHT));
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
            Assess Critical Zones- Electric Utility Point
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
          paddingBottom: 0,
          gap: '42px',
          boxSizing: 'border-box',
        }}
      >
        {/* Left column — scrollable */}
        <div className="no-scrollbar" style={{ width: '724px', flexShrink: 0, overflowY: 'auto', paddingBottom: '35px' }}>

          {/* Map image with overlay tab */}
          <div style={{ position: 'relative' }}>
            <img
              src="/costal-road-map.jpg"
              alt="Electric utility area aerial view"
              style={{ width: '100%', height: '341px', objectFit: 'cover', borderRadius: '20px 20px 0 0', display: 'block' }}
            />
            <div style={{ position: 'absolute', bottom: '30px', left: '365px', display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.9)', borderRadius: '9999px', padding: '4px 10px 4px 4px' }}>
                <img src="/icons/tab-electric.svg" alt="" width={27} height={27} style={{ flexShrink: 0 }} />
                <div>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: 600, color: '#101828', lineHeight: '14px' }}>Electric Utility Point</p>
                  <p style={{ margin: 0, fontSize: '9px', fontWeight: 500, color: '#505153', lineHeight: '14px' }}>Changing the defense system</p>
                </div>
              </div>
              <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,0.7)', marginLeft: 18 }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'rgba(255,255,255,0.7)', marginLeft: 14 }} />
            </div>
          </div>

          {/* White action plan card */}
          <div style={{ background: 'white', borderRadius: '0 0 20px 20px', padding: '20px 24px 24px 24px', boxSizing: 'border-box' }}>

            <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#364153', letterSpacing: '-0.31px', lineHeight: '24px' }}>Action Plan Overview</p>
            <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '20.8px', letterSpacing: '-0.08px', width: '512px', ...editStyle }}>
              The utility point supports nearby residential and public-service areas. The response focuses on keeping essential power available during flood conditions by raising exposed electrical components, adding protected power points in buildings, and improving backup power reliability.
            </p>

            <div style={{ borderTop: '1px solid #cfcccc', marginTop: '20px' }} />

            <p style={{ margin: '20px 0 0 0', fontSize: '18px', fontWeight: 600, color: '#364153', letterSpacing: '-0.31px', lineHeight: '24px' }}>Implementation Steps</p>
            <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '10px', width: '512px' }}>
              {implementationSteps.map((step) => (
                <div key={step.n} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, paddingTop: '2px' }}>
                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: ACCENT_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontSize: '8.8px', fontWeight: 700, color: ACCENT, letterSpacing: '0.18px' }}>{step.n}</span>
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

            <div style={{ borderTop: '1px solid #cfcccc', marginTop: '20px' }} />

            <p style={{ margin: '20px 0 0 0', fontSize: '18px', fontWeight: 600, color: '#364153', letterSpacing: '-0.31px', lineHeight: '24px' }}>Implementation Approach</p>
            <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '8px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '20.8px', letterSpacing: '-0.08px', width: '578px', ...editStyle }}>
              Work should be coordinated with utility providers, building managers, and emergency services. Priority should be given to assets that support residential blocks, emergency access, and essential services.
            </p>
            <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '10px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '20.8px', letterSpacing: '-0.08px', width: '579px', ...editStyle }}>
              Installation should be phased to reduce disruption and maintain service continuity wherever possible. Testing and commissioning of backup systems should be completed before storm season.
            </p>

            {/* Bottom image card */}
            <div style={{ marginTop: '16px', border: '1px solid #cfcccc', borderRadius: '15px', display: 'flex', overflow: 'hidden', alignItems: 'stretch', width: '100%' }}>
              <img
                src="/costal-road-pile.jpg"
                alt="Flood-resilient utility upgrade"
                style={{ width: '325px', flexShrink: 0, objectFit: 'cover' }}
              />
              <div style={{ flex: 1, padding: '20px 20px 20px 24px' }}>
                <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#364153', lineHeight: '20px', letterSpacing: '-0.44px', ...editStyle }}>
                  Flood-Resilient Utility Upgrade
                </p>
                <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '8px 0 0 0', fontSize: '11px', fontWeight: 400, color: '#505153', lineHeight: '20px', letterSpacing: '-0.44px', ...editStyle }}>
                  Raising electrical cabinets and adding protected building power points helps maintain essential services during high-water events.
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

              {/* Problem Summary */}
              <div style={{ background: 'white', borderRadius: '20px', height: '151px', display: 'flex', alignItems: 'center', gap: '45px', padding: '0 16px', flexShrink: 0 }}>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, paddingTop: '12px', paddingBottom: '16px' }}>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#364153', lineHeight: '19.5px', letterSpacing: '-0.08px', whiteSpace: 'nowrap' }}>Problem Summary</p>
                  <p style={{ margin: '6px 0 0 0', fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: '19.2px', width: '359px' }}>
                    A key electrical utility point is located within the projected flood-impact area. Flood exposure can interrupt local power supply, affect nearby buildings, and reduce service continuity during high-water events.
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
                    Implementation is estimated over 9–12 months with an estimated total budget of $7.4M, allocated across electrical asset elevation, protected power points, and backup power systems.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', paddingLeft: '25px', gap: '75px' }}>
                  <DonutChart />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '17px', width: '280px', flexShrink: 0 }}>
                    {[
                      { color: '#D4A000', text: 'Electrical Cabinet Elevation', value: '$3.1M' },
                      { color: '#F5C200', text: 'Protected Building Power Points', value: '$2.0M' },
                      { color: '#FFE580', text: 'Backup Power & Monitoring', value: '$2.3M' },
                    ].map((item) => (
                      <div key={item.value} style={{ display: 'flex', gap: '15px', alignItems: 'flex-start' }}>
                        <div style={{ width: 17, height: 17, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                        <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: '#505153', lineHeight: 'normal' }}>
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
                  <div style={{ position: 'absolute', left: '10px', top: '10px', width: '1.5px', height: '116px', background: '#364153', zIndex: 0 }} />
                  {[
                    { label: 'Planning & Utility Coordination', value: '0–3 months' },
                    { label: 'Electrical Cabinet Elevation', value: '3–9 months' },
                    { label: 'Backup Power & Testing', value: '9–12 months' },
                  ].map((item) => (
                    <div key={item.label} style={{ display: 'flex', gap: '15px', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: '1.5px solid #364153', flexShrink: 0, background: 'white' }} />
                      <p style={{ margin: 0, fontSize: '14px', color: '#364153', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#505153' }}>{item.label}</span>
                        {' '}
                        <span style={{ fontWeight: 700 }}>{item.value}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Buttons */}
            <div style={{ marginTop: '55px', display: 'flex', gap: '30px', justifyContent: 'center' }}>
              <button
                onClick={() => setIsEditing(e => !e)}
                style={{
                  width: '233px', height: '40px',
                  border: '1px solid #323232', borderRadius: '100px',
                  background: 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '17px',
                  cursor: 'pointer', fontSize: '16px', fontWeight: 500, color: '#323232', letterSpacing: '-0.44px',
                }}
              >
                <Pencil size={16} />
                {isEditing ? 'Done' : 'Edit plan'}
              </button>
              <button
                onClick={onApprove}
                style={{
                  width: '233px', height: '40px',
                  background: '#323232', border: '1px solid #323232', borderRadius: '100px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: '16px', fontWeight: 500, color: '#f8f8f8', letterSpacing: '-0.44px',
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
