import { useState, useRef, useEffect } from 'react';
import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';
import { TriangleAlert, MapPin, Star } from 'lucide-react';

interface Props {
  onZoomOut: () => void;
  onPlan: () => void;
}

const STEPS = [
  'Assess critical zones',
  'Simulate response scenarios',
  'Compare intervention options',
  'Allocate budget & teams',
  'Launch action plan',
];

const X_LABELS = ['Today', '2030', '2040', '2050', '2060', '2070', '2080', '2090'];
const X_POSITIONS = [107, 207, 329, 451, 573, 695, 817, 939];

// Layout constants
const LEFT = 16;
const W = 386;
const GAP = 12;
const CHIP_TOP = 93;
const CARD1_TOP = 140;

export default function AlertPageV2({ onZoomOut, onPlan }: Props) {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [showCard2, setShowCard2] = useState(false);
  const card1Ref = useRef<HTMLDivElement>(null);
  const [card2Top, setCard2Top] = useState(CARD1_TOP + 292 + GAP);

  useEffect(() => {
    if (card1Ref.current) {
      setCard2Top(CARD1_TOP + card1Ref.current.offsetHeight + GAP);
    }
    const t = setTimeout(() => setShowCard2(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <ScaledLayout className="screen-enter">

        {/* ── Location chip — identical style to HomePageAlert chip ── */}
        <div
          className="absolute glass-65 glass-shadow flex items-center gap-[8px]"
          style={{
            left: LEFT, top: CHIP_TOP,
            width: W,
            borderRadius: 100,
            padding: '7px 14px 7px 16px',
            pointerEvents: 'auto',
          }}
        >
          <MapPin size={17} color="#1e2939" strokeWidth={2} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.2px' }}>
            Harbor District
          </span>
          <span style={{ fontSize: 14, color: 'rgba(0,0,0,0.35)' }}>,</span>
          <span style={{ fontSize: 15, fontWeight: 500, color: '#6b7280', letterSpacing: '-0.2px' }}>
            Miami Beach, FL
          </span>
        </div>

        {/* ── Card 1: Risk Status ── */}
        <div
          ref={card1Ref}
          className="absolute glass-65 glass-shadow"
          style={{ left: LEFT, top: CARD1_TOP, width: W, borderRadius: 16, pointerEvents: 'auto' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-[16px] pt-[13px] pb-[12px]">
            <div className="flex items-center gap-[8px]">
              <TriangleAlert size={17} color="#1e2939" strokeWidth={2} />
              <span style={{ fontSize: 16, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.44px', lineHeight: '28px' }}>
                Early Warning
              </span>
            </div>
            {/* HIGH RISK tab badge */}
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1px',
              color: '#b91d1d',
              background: 'rgba(185,29,29,0.10)',
              border: '1px solid rgba(185,29,29,0.20)',
              borderRadius: 100,
              padding: '4px 11px',
            }}>
              High Risk
            </span>
          </div>

          <div className="h-px bg-[rgba(0,0,0,0.07)] mx-[12px]" />

          {/* Description */}
          <p style={{
            margin: '12px 16px 12px',
            fontSize: 17, fontWeight: 500, color: '#6b7280',
            lineHeight: '24px', letterSpacing: '-0.44px',
          }}>
            Harbor District's sea level has breached the critical threshold, placing the area at immediate risk of coastal flooding.
          </p>

          {/* Stat grid 2×2 */}
          <div className="grid grid-cols-2 gap-[10px] mx-[16px] mb-[16px]">

            {/* 1 — When */}
            <div className="rounded-[11px] flex flex-col gap-[4px]"
              style={{ background: 'rgba(185,29,29,0.07)', padding: '10px 13px' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#b91d1d', letterSpacing: '-0.1px' }}>
                Projected impact
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#b91d1d', letterSpacing: '-0.6px', lineHeight: 1, marginTop: 2 }}>
                12 mo
              </span>
            </div>

            {/* 2 — How many */}
            <div className="rounded-[11px] flex flex-col gap-[4px]"
              style={{ background: 'rgba(0,0,0,0.04)', padding: '10px 13px' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', letterSpacing: '-0.1px' }}>
                People at risk
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1e2939', letterSpacing: '-0.6px', lineHeight: 1, marginTop: 2 }}>
                8,400
              </span>
            </div>

            {/* 3 — When to respond */}
            <div className="rounded-[11px] flex flex-col gap-[4px]"
              style={{ background: 'rgba(0,0,0,0.04)', padding: '10px 13px' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', letterSpacing: '-0.1px' }}>
                Response start
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1e2939', letterSpacing: '-0.6px', lineHeight: 1, marginTop: 2 }}>
                Immediate
              </span>
            </div>

            {/* 4 — What type of response */}
            <div className="rounded-[11px] flex flex-col gap-[4px]"
              style={{ background: 'rgba(0,0,0,0.04)', padding: '10px 13px' }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', letterSpacing: '-0.1px' }}>
                Action level
              </span>
              <span style={{ fontSize: 18, fontWeight: 700, color: '#1e2939', letterSpacing: '-0.6px', lineHeight: 1, marginTop: 2, whiteSpace: 'nowrap' }}>
                Protect & Adapt
              </span>
            </div>

          </div>
        </div>

        {/* ── Card 2: Action Plan — slides in after 2s ── */}
        <div
          className="absolute glass-65 glass-shadow"
          style={{
            left: LEFT, top: card2Top, width: W, borderRadius: 16, pointerEvents: 'auto',
            opacity: showCard2 ? 1 : 0,
            transform: showCard2 ? 'translateY(0)' : 'translateY(10px)',
            transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.4,0,0.2,1)',
          }}
        >
          {/* Header */}
          <div className="px-[16px] pt-[13px] pb-[12px]">
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.44px', lineHeight: '28px' }}>
              Recommended Action Plan
            </span>
          </div>

          <div className="h-px bg-[rgba(0,0,0,0.07)] mx-[12px]" />

          {/* Body */}
          <p style={{
            margin: '14px 16px 0',
            fontSize: 17, fontWeight: 500, color: '#6b7280',
            lineHeight: '24px', letterSpacing: '-0.44px',
          }}>
            The system built a recommended action plan for this situation. Acting now can delay the projected flood impact by over a year.
          </p>


          {/* Buttons */}
          <div className="mx-[16px] mt-[14px] mb-[16px] flex flex-col gap-[10px]">
            <button
              onClick={onPlan}
              className="w-full h-[44px] rounded-[12px] flex items-center justify-center"
              style={{ background: 'rgba(16,24,40,0.90)' }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: 'white', letterSpacing: '-0.3px' }}>
                View Recommended Plan
              </span>
            </button>
            <button
              className="w-full h-[44px] rounded-[12px] flex items-center justify-center"
              style={{ background: 'transparent', border: '1px solid rgba(30,41,57,0.25)' }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.3px' }}>
                Build your own plan
              </span>
            </button>
          </div>
        </div>

        {/* ── Impact Timeline overlay ── */}
        {isTimelineOpen && (
          <div style={{
            position: 'absolute', left: 438, top: 549, width: 1056, height: 367,
            borderRadius: 16, background: 'rgba(255,255,255,0.82)',
            border: '1px solid rgba(255,255,255,0.3)', boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            alignItems: 'flex-start', gap: 20, pointerEvents: 'auto',
          }}>
            <button onClick={() => setIsTimelineOpen(false)} aria-label="Close" style={{ position: 'absolute', top: 8, left: 9, width: 23, height: 23, background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}>
              <svg width="23" height="23" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="nonzero" fill="#1e2939" d="M11.5 12.4047 L15.6477 16.5523 C15.7669 16.6716 15.9134 16.7355 16.0872 16.744 C16.261 16.7525 16.416 16.6886 16.5523 16.5523 C16.6886 16.416 16.7568 16.2653 16.7568 16.1 C16.7568 15.9347 16.6886 15.784 16.5523 15.6477 L12.4047 11.5 L16.5523 7.35233 C16.6716 7.23307 16.7355 7.08656 16.744 6.91278 C16.7525 6.739 16.6886 6.58396 16.5523 6.44767 C16.416 6.31137 16.2653 6.24322 16.1 6.24322 C15.9347 6.24322 15.784 6.31137 15.6477 6.44767 L11.5 10.5953 L7.35233 6.44767 C7.23307 6.32841 7.08656 6.26452 6.91278 6.256 C6.739 6.24748 6.58396 6.31137 6.44767 6.44767 C6.31137 6.58396 6.24322 6.73474 6.24322 6.9 C6.24322 7.06526 6.31137 7.21604 6.44767 7.35233 L10.5953 11.5 L6.44767 15.6477 C6.32841 15.7669 6.26452 15.9139 6.256 16.0885 C6.24748 16.2614 6.31137 16.416 6.44767 16.5523 C6.58396 16.6886 6.73474 16.7568 6.9 16.7568 C7.06526 16.7568 7.21604 16.6886 7.35233 16.5523 L11.5 12.4047 Z M11.5038 23 C9.91343 23 8.41843 22.6984 7.01883 22.0953 C5.61924 21.4914 4.40152 20.6719 3.36567 19.6369 C2.32981 18.6019 1.50991 17.3854 0.905945 15.9876 C0.301982 14.5897 5.67447e-16 13.0951 0 11.5038 C-5.67447e-16 9.91257 0.301982 8.41757 0.905945 7.01883 C1.50906 5.61924 2.32726 4.40152 3.36056 3.36567 C4.39385 2.32981 5.61072 1.50991 7.01117 0.905945 C8.41161 0.301982 9.90661 0 11.4962 0 C13.0857 0 14.5807 0.301982 15.9812 0.905945 C17.3808 1.50906 18.5985 2.32769 19.6343 3.36183 C20.6702 4.39598 21.4901 5.61285 22.0941 7.01244 C22.698 8.41204 23 9.90661 23 11.4962 C23 13.0857 22.6984 14.5807 22.0953 15.9812 C21.4922 17.3816 20.6727 18.5993 19.6369 19.6343 C18.601 20.6693 17.3846 21.4892 15.9876 22.0941 C14.5905 22.6989 13.0959 23.0009 11.5038 23 Z" />
              </svg>
            </button>
            <div style={{ width: 944, height: 64, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: 88 }}>
              <div style={{ padding: '0 25px' }}>
                <p style={{ fontWeight: 600, fontSize: 16, lineHeight: '28px', letterSpacing: '-0.44px', color: '#364153', margin: 0 }}>Impact Timeline: Compare projected impact</p>
                <p style={{ fontWeight: 500, fontSize: 16, lineHeight: '28px', letterSpacing: '-0.44px', color: '#364153', margin: 0 }}>The timeline updates as protection measures progress</p>
              </div>
              <div style={{ position: 'relative', width: 153, height: 64, flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 20, height: 2, background: '#468137', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#364153', whiteSpace: 'nowrap' }}>With protection</span>
                </div>
                <div style={{ position: 'absolute', top: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 20, height: 2, background: '#c0392b', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#364153', whiteSpace: 'nowrap' }}>Without protection</span>
                </div>
              </div>
            </div>
            <div style={{ width: 1056, height: 238, flexShrink: 0, position: 'relative' }}>
              <svg viewBox="0 0 960 238" width={944} height={238} style={{ position: 'absolute', top: 0, left: 56, overflow: 'hidden' }}>
                <style>{`@keyframes drawLine { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }`}</style>
                <text x={67} y={25} textAnchor="end" fontSize={16} fontWeight={500} fill="#1e2939">High</text>
                <text x={67} y={79} textAnchor="end" fontSize={16} fontWeight={500} fill="#1e2939">Moderate</text>
                <text x={67} y={133} textAnchor="end" fontSize={16} fontWeight={500} fill="#1e2939">Low</text>
                <line x1={85} y1={20} x2={940} y2={20} stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={85} y1={74} x2={940} y2={74} stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={85} y1={128} x2={940} y2={128} stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={85} y1={8} x2={85} y2={140} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />
                <path d="M 107 74 C 200 79, 330 82, 450 78 C 560 72, 630 61, 668 53 C 750 48, 860 46, 939 45" stroke="#468137" strokeWidth={2.5} fill="none" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'drawLine 1.2s ease-out forwards' }} />
                <path d="M 107 74 C 160 55, 195 42, 228 34 C 295 20, 360 8, 430 4 C 520 2, 680 5, 939 7" stroke="#c0392b" strokeWidth={2.5} fill="none" pathLength={1} style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'drawLine 1.2s ease-out 0.1s forwards' }} />
                <circle cx={107} cy={73} r={7} fill="#1a1a1a" />
                <circle cx={228} cy={34} r={7} fill="#1a1a1a" />
                <circle cx={668} cy={53} r={7} fill="#1a1a1a" />
                {X_LABELS.map((label, i) => (
                  <text key={label} x={X_POSITIONS[i]} y={160} textAnchor="middle" fontSize={16} fontWeight={label === 'Today' ? 700 : 500} fill={label === 'Today' ? '#120101' : 'rgba(20,2,2,0.8)'}>{label}</text>
                ))}
              </svg>
            </div>
          </div>
        )}

      </ScaledLayout>

      <HomePageHeader onMinus={onZoomOut} />
    </>
  );
}
