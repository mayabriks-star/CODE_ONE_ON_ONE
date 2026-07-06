import { useState } from 'react';
import HomePageHeader from '../components/shared/HomePageHeader';

interface Props {
  onBack: () => void;
  onLaunch: () => void;
}

const STYLES = `
@keyframes successPop {
  0%   { transform: scale(0.88); opacity: 0; }
  100% { transform: scale(1);    opacity: 1; }
}
@keyframes overlayFade {
  from { opacity: 0; }
  to   { opacity: 1; }
}
.launch-success-enter { animation: successPop 0.42s cubic-bezier(0.16,1,0.3,1) both; }
.launch-overlay-enter { animation: overlayFade 0.28s ease both; }
`;

const SECONDARY_METRICS = [
  { label: 'Residents Protected', value: '620' },
  { label: 'Risk Reduction',      value: '34%' },
  { label: 'Implementation',      value: '12–20 mo.' },
];

const READINESS = [
  '5 response leads assigned',
  'All critical zones reviewed',
  'Monitoring remains active',
];


export default function LaunchActionPlanPage({ onBack, onLaunch }: Props) {
  const [launched, setLaunched] = useState(false);

  function handleLaunch() {
    if (launched) return;
    setLaunched(true);
  }

  return (
    <div className="screen-enter">
      <style>{STYLES}</style>
      <HomePageHeader />

      {/* Back button */}
      <button onClick={onBack} style={{
        position: 'fixed', left: 16, top: 93, width: 36, height: 36, zIndex: 30,
        background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
        border: 'none', borderRadius: '50%', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}>
        <span style={{ fontSize: 17, color: '#1e2939' }}>←</span>
      </button>

      {/* Progress bar - step 5 active */}
      <div className="glass-65 glass-shadow" style={{
        position: 'fixed', top: 93, left: 60, right: 16, height: 36,
        borderRadius: 18, overflow: 'hidden', pointerEvents: 'none', zIndex: 20,
      }}>
        <svg width="100%" height="100%" viewBox="0 0 1426 36" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, display: 'block' }}>
          <polygon points="0,0 284,0 298,18 284,36 0,36"               fill="rgba(30,41,57,0.18)" />
          <polygon points="284,0 566,0 580,18 566,36 284,36 298,18"    fill="rgba(30,41,57,0.18)" />
          <polygon points="566,0 848,0 862,18 848,36 566,36 580,18"    fill="rgba(30,41,57,0.18)" />
          <polygon points="848,0 1130,0 1144,18 1130,36 848,36 862,18" fill="rgba(30,41,57,0.18)" />
          <polygon points="1130,0 1426,0 1426,36 1130,36 1144,18"      fill="#1e2939" />
          {[284, 566, 848, 1130].map(x => (
            <path key={x} d={`M${x},0 L${x + 14},18 L${x},36`}
              stroke="rgba(30,41,57,0.22)" strokeWidth="1.5" fill="none"
              style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          ))}
        </svg>
        {[
          { label: 'Assess critical zones',        pct: '0%',     w: '20.90%' },
          { label: 'Simulate response scenarios',  pct: '20.90%', w: '19.77%' },
          { label: 'Compare intervention options', pct: '40.67%', w: '19.77%' },
          { label: 'Assign Teams & Tasks',         pct: '60.45%', w: '19.77%' },
          { label: 'Launch action plan',           pct: '80.22%', w: '19.78%', active: true },
        ].map(s => (
          <div key={s.label} style={{ position: 'absolute', left: s.pct, top: 0, width: s.w, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
            <span style={{ fontSize: 13, fontWeight: (s as any).active ? 600 : 500, color: (s as any).active ? 'white' : '#1e2939', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.2px' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── Launch card ── */}
      <div className="glass-65 glass-shadow" style={{
        position: 'fixed', left: 16, top: 137, width: 386,
        borderRadius: 16, pointerEvents: 'auto', zIndex: 10,
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* 1 - Header */}
        <div style={{ padding: '14px 16px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: '0 0 3px', fontSize: 16, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.44px' }}>
              Activate Response Plan
            </p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, color: '#6b7280', letterSpacing: '-0.3px', lineHeight: '21px' }}>
              The selected adaptation plan is ready for activation.
            </p>
          </div>
          <div style={{
            flexShrink: 0, marginTop: 2,
            background: 'rgba(0,166,62,0.1)', border: '1px solid rgba(0,166,62,0.22)',
            borderRadius: 20, padding: '4px 10px',
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00a63e' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#00a63e', letterSpacing: '0.1px', whiteSpace: 'nowrap' }}>Ready</span>
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '0 14px' }} />

        {/* 2 - Plan context */}
        <div style={{ padding: '10px 16px 0' }}>
          <p style={{ margin: '0 0 1px', fontSize: 15, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.3px' }}>
            Adaptation Plan · Harbor District
          </p>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 400, color: '#6b7280', letterSpacing: '-0.2px' }}>
            Selected after scenario comparison
          </p>
        </div>

        {/* 3 - Hero outcome */}
        <div style={{ margin: '12px 12px 0', borderRadius: 12, background: 'rgba(30,41,57,0.055)', padding: '13px 14px 12px' }}>
          <p style={{ margin: '0 0 5px', fontSize: 10, fontWeight: 700, color: '#6b7280', letterSpacing: '0.8px', textTransform: 'uppercase' }}>
            Protected time gained
          </p>
          <p style={{ margin: '0 0 3px', fontSize: 42, fontWeight: 800, color: '#1e2939', letterSpacing: '-2px', lineHeight: 1 }}>
            6–8 years
          </p>
          <p style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 400, color: '#6b7280', letterSpacing: '-0.1px' }}>
            with selected adaptation plan
          </p>
          {/* Before / after comparison */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <div style={{
              flex: 1, background: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: '7px 10px', textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.3px', textTransform: 'uppercase' }}>Without plan</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#6b7280', letterSpacing: '-0.3px' }}>12 months</p>
            </div>
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" style={{ flexShrink: 0 }}>
              <path d="M1 5h13M9 1l5 4-5 4" stroke="#9ca3af" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div style={{
              flex: 1, background: 'rgba(0,166,62,0.07)', border: '1px solid rgba(0,166,62,0.18)', borderRadius: 8, padding: '7px 10px', textAlign: 'center',
            }}>
              <p style={{ margin: '0 0 2px', fontSize: 10, fontWeight: 600, color: '#9ca3af', letterSpacing: '0.3px', textTransform: 'uppercase' }}>With this plan</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#00a63e', letterSpacing: '-0.3px' }}>6–8 years</p>
            </div>
          </div>
        </div>

        {/* 4 - Secondary metrics - 3 compact equal columns */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 5, padding: '9px 12px 0' }}>
          {SECONDARY_METRICS.map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(255,255,255,0.55)', borderRadius: 9, padding: '8px 9px' }}>
              <p style={{ margin: '0 0 2px', fontSize: 11, fontWeight: 500, color: '#6b7280', letterSpacing: '-0.1px', lineHeight: '14px' }}>{label}</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e2939', letterSpacing: '-0.3px' }}>{value}</p>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '11px 14px 0' }} />

        {/* 5 - Readiness */}
        <div style={{ padding: '10px 16px 0', display: 'flex', flexDirection: 'column', gap: 6 }}>
          {READINESS.map((item) => (
            <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 15, height: 15, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(30,41,57,0.09)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="7" height="5.5" viewBox="0 0 8 6" fill="none">
                  <path d="M1 3L3 5L7 1" stroke="#1e2939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px' }}>{item}</p>
            </div>
          ))}
        </div>

        {/* 6 - Consequence line */}
        <p style={{ margin: '10px 16px 0', fontSize: 13, fontWeight: 400, color: '#6b7280', lineHeight: '18px', letterSpacing: '-0.1px' }}>
          Activating this plan will notify assigned leads and start the first 30-day response window.
        </p>

        {/* 7 - CTA */}
        <div style={{ padding: '12px 14px 16px' }}>
          <button onClick={handleLaunch} style={{
            width: '100%', height: 44, borderRadius: 11,
            background: 'rgba(16,24,40,0.92)',
            border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, color: 'white', letterSpacing: '-0.2px',
          }}>
            Activate Response Plan
          </button>
        </div>
      </div>

      {/* ── Success overlay ── */}
      {launched && (
        <div
          className="launch-overlay-enter"
          style={{
            position: 'fixed', inset: 0, zIndex: 100,
            background: 'rgba(15,23,36,0.45)', backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'auto',
          }}
        >
          <div
            className="glass-80 glass-shadow launch-success-enter"
            style={{ borderRadius: 20, padding: '32px 36px', maxWidth: 400, width: '90%', textAlign: 'center' }}
          >
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#00a63e', margin: '0 auto 16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
                <path d="M2 8.5L8 14.5L20 2.5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p style={{ margin: '0 0 5px', fontSize: 18, fontWeight: 700, color: '#1e2939', letterSpacing: '-0.44px' }}>
              Plan is now active
            </p>
            <p style={{ margin: '0 0 22px', fontSize: 13, color: '#6b7280', letterSpacing: '-0.1px', lineHeight: '19px' }}>
              Harbor District Action Plan activated. All 5 leads have been notified.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 7, marginBottom: 22 }}>
              {[
                { label: 'Status',         value: 'In progress' },
                { label: 'First review',   value: '30 days' },
                { label: 'Monitoring',     value: 'Active' },
                { label: 'Teams notified', value: '5 / 5' },
              ].map(({ label, value }) => (
                <div key={label} style={{ background: 'rgba(30,41,57,0.05)', borderRadius: 9, padding: '10px 12px', textAlign: 'left' }}>
                  <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px' }}>{label}</p>
                  <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#1e2939', letterSpacing: '-0.25px' }}>{value}</p>
                </div>
              ))}
            </div>
            <button
              onClick={onLaunch}
              style={{
                width: '100%', height: 44,
                background: 'rgba(16,24,40,0.92)',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                fontSize: 14, fontWeight: 600, color: 'white', letterSpacing: '-0.2px',
              }}
            >
              View Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
