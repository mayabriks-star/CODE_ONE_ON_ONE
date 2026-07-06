import { useState } from 'react';
import { Menu, Bell, ArrowLeft, Pencil, MapPin, DoorOpen, Shield, Siren, Users } from 'lucide-react';

interface Props {
  onBack: () => void;
  onApprove: () => void;
}

function DonutChart() {
  const cx = 73, cy = 73, r = 43, circum = 2 * Math.PI * r;
  const segments = [
    { pct: 0.52, color: '#527A44' },
    { pct: 0.28, color: '#79A86A' },
    { pct: 0.20, color: '#AECFA8' },
  ];
  let offset = 0;
  const arcs = segments.map(seg => {
    const dash = seg.pct * circum, gap = circum - dash;
    const rotation = (offset / circum) * 360 - 90;
    offset += dash;
    return { ...seg, dash, gap, rotation };
  });
  return (
    <div style={{ position: 'relative', width: 146, height: 146, flexShrink: 0 }}>
      <svg viewBox="0 0 146 146" width={146} height={146}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f3f4f6" strokeWidth={24} />
        {arcs.map((arc, i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={arc.color} strokeWidth={24}
            strokeDasharray={`${arc.dash} ${arc.gap}`} strokeDashoffset={0}
            transform={`rotate(${arc.rotation} ${cx} ${cy})`} />
        ))}
      </svg>
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', fontSize: 17, fontWeight: 700, color: '#323232' }}>5M</div>
    </div>
  );
}

const implementationSteps = [
  { icon: MapPin,    label: 'Map Priority Resident Clusters:', desc: 'Identify buildings with elderly, disabled, or ground-floor residents and locate the main access constraints.' },
  { icon: DoorOpen,  label: 'Adapt Building Entrances and Access Routes:', desc: 'Install ramps, raise thresholds, add handrails, and improve slip-resistant paths.' },
  { icon: Shield,    label: 'Protect Ground-Floor Units and Shared Areas:', desc: 'Add flood barriers, elevate critical equipment, and seal vulnerable utility points.' },
  { icon: Siren,     label: 'Improve Emergency Access and Pick-Up Points:', desc: 'Define protected drop-off zones, evacuation assembly points, and assisted transport routes.' },
  { icon: Users,     label: 'Strengthen Community Support Systems:', desc: 'Coordinate outreach, welfare checks, multilingual alerts, and neighborhood response teams.' },
];

const ACCENT = '#84af79';
const ACCENT_BG = 'rgba(132,175,121,0.2)';

export default function VulnerableResidentsPage({ onBack, onApprove: _onApprove }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="screen-enter" style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8f8f8' }}>
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
            Assess Critical Zones — Vulnerable Residents
          </span>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingLeft: '70px', paddingRight: '70px', paddingTop: '16px', paddingBottom: '16px', gap: '14px', boxSizing: 'border-box' }}>

        {/* Top card — text left (1/3) + image right (2/3) */}
        <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', flexShrink: 0, display: 'flex', flexDirection: 'row', height: 395 }}>
          <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
            <p style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px', lineHeight: '30px' }}>Action Plan Overview</p>
            <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: '10px 0 0 0', fontSize: 20, fontWeight: 400, color: '#505153', lineHeight: '30px', letterSpacing: '-0.08px' }}>
              The Harbor District includes a concentration of elderly residents, mobility-limited households, and ground-floor apartments exposed to coastal flooding. This plan focuses on safer access, building-entry adaptation, emergency support, and continuity of essential services during high-water events.
            </p>
          </div>
          <div style={{ flex: 2, position: 'relative' }}>
            <img src="/vulnerable-residents-tab.png" alt="Vulnerable residents area"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: '20% 19%', display: 'block' }} />
            <button onClick={() => setIsEditing(e => !e)} style={{
              position: 'absolute', top: 12, right: 12, zIndex: 10,
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 14px 6px 10px', borderRadius: 100,
              background: isEditing ? '#101828' : 'white',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)', border: 'none', cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}>
              <Pencil size={13} color={isEditing ? 'white' : '#101828'} />
              <span style={{ fontSize: 13, fontWeight: 500, color: isEditing ? 'white' : '#101828', letterSpacing: '-0.2px', transition: 'color 0.2s ease' }}>Edit</span>
            </button>
          </div>
        </div>

        {/* Bottom two columns */}
        <div style={{ flex: 1, display: 'flex', gap: '14px', overflow: 'hidden', minHeight: 0 }}>

          {/* Left — Implementation Steps */}
          <div className="no-scrollbar" style={{ flex: 1, background: 'white', borderRadius: 16, padding: '22px 26px', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            <p style={{ margin: '0 0 16px 0', fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px', lineHeight: '28px' }}>Implementation Steps</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {implementationSteps.map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <div style={{ flexShrink: 0, paddingTop: 2 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: ACCENT_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <step.icon size={18} color={ACCENT} strokeWidth={1.8} />
                    </div>
                  </div>
                  <p contentEditable={isEditing} suppressContentEditableWarning style={{ margin: 0, fontSize: 20, lineHeight: '30px', letterSpacing: '-0.08px' }}>
                    <span style={{ fontWeight: 600, color: '#364153' }}>{step.label}</span>{' '}
                    <span style={{ fontWeight: 400, color: '#505153' }}>{step.desc}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Cost & Budget + Schedule */}
          <div className="no-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflow: 'hidden' }}>

            <div style={{ background: 'white', borderRadius: 16, padding: '18px 22px', flexShrink: 0 }}>
              <p style={{ margin: '0 0 12px 0', fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px' }}>Cost &amp; Budget</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <DonutChart />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingLeft: 16 }}>
                  {[
                    { color: '#527A44', text: 'Temporary Access Support', value: '2.6M' },
                    { color: '#79A86A', text: 'Building Adaptation Works', value: '1.4M' },
                    { color: '#AECFA8', text: 'Public Updates', value: '1M' },
                  ].map(item => (
                    <div key={item.text} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <div style={{ width: 14, height: 14, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
                      <p style={{ margin: 0, fontSize: 18, fontWeight: 400, color: '#505153', lineHeight: 'normal' }}>
                        {item.text} <span style={{ fontWeight: 600, color: '#364153' }}>{item.value}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: 16, padding: '18px 26px', flex: 1, overflow: 'hidden' }}>
              <p style={{ margin: '0 0 14px 0', fontSize: 22, fontWeight: 600, color: '#364153', letterSpacing: '-0.4px' }}>Implementation Schedule</p>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { label: 'Planning & Resident Notification', value: '0–2 months' },
                  { label: 'Ground-Floor Adaptation Works', value: '2–8 months' },
                  { label: 'Review & Adjustment', value: '8–10 months' },
                ].map((item, i, arr) => {
                  const isLast = i === arr.length - 1;
                  return (
                    <div key={item.label} style={{ display: 'flex', gap: 14 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 20, height: 20, borderRadius: '50%', flexShrink: 0, background: ACCENT_BG, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: '#3d6b31' }}>{i + 1}</span>
                        </div>
                        {!isLast && <div style={{ width: 2, flex: 1, minHeight: 20, background: '#3d6b31' }} />}
                      </div>
                      <p style={{ margin: 0, paddingBottom: isLast ? 0 : 24, fontSize: 20, color: '#364153' }}>
                        <span style={{ color: '#505153' }}>{item.label}</span>{' '}
                        <span style={{ fontWeight: 700 }}>{item.value}</span>
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
