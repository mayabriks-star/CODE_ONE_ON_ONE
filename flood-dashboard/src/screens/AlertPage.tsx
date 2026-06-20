import { useState } from 'react';
import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';

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

export default function AlertPage({ onZoomOut, onPlan }: Props) {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  return (
    <>
      <ScaledLayout className="screen-enter">
        <h1 className="absolute left-[32px] top-[99px] font-semibold text-[26px] leading-[28px] tracking-[-0.44px] text-white">
          Harbor District
        </h1>

        <div
          className="absolute glass-shadow"
          style={{
            left: 16, top: 138, width: 386, height: 778,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {/* Header */}
          <div
            className="absolute flex items-center gap-[8px]"
            style={{ left: 19, top: 15, width: 290, paddingRight: 22 }}
          >
            <img src="/icons/warning-rounded.svg" alt="" width={28} height={28} className="flex-shrink-0" />
            <span className="font-semibold text-[18px] leading-[28px] tracking-[-0.44px] text-[#1e2939] whitespace-nowrap">
              Early Warning - Harbor District
            </span>
          </div>

          {/* Divider 1 */}
          <div className="absolute bg-[rgba(0,0,0,0.08)]" style={{ top: 59, left: 0, right: 0, height: 1 }} />

          {/* Risk → Divider 2 → Recommended — flow wrapper for exact 25px gaps */}
          <div style={{ position: 'absolute', top: 84, left: 0, right: 0 }}>
            {/* Risk section */}
            <div className="flex flex-col gap-[8px]" style={{ paddingLeft: 17, paddingRight: 46, paddingBottom: 25 }}>
              <div className="flex flex-col gap-[3px]">
                <div className="flex gap-[15px] items-start">
                  <div className="w-[24px] h-[24px] rounded-full bg-[#ff6b00] flex-shrink-0" />
                  <div>
                    <p className="font-medium text-[20px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">High</p>
                    <p className="font-medium text-[14px] leading-[28px] tracking-[-0.44px] text-[#505153]">Overall risk level</p>
                  </div>
                </div>
                <div className="flex gap-[14px] items-center">
                  <div className="w-[24px] h-[14px] flex-shrink-0" />
                  <p className="font-medium text-[16px] leading-[21px] tracking-[-0.44px] text-[#505153]">
                    Sea level has reached the city's early action threshold. This district now requires preventive review before coastal impact begins.
                  </p>
                </div>
              </div>
              <p className="font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#1e2939]" style={{ marginLeft: 38 }}>
                Projected Impact:{' '}
                <span className="font-bold text-[#b91d1d]">12 months (May 2027)</span>
              </p>
            </div>

            {/* Divider 2 — sits exactly 25px below risk content, 25px above recommended */}
            <div className="bg-[rgba(0,0,0,0.08)]" style={{ margin: '0 14px 0 12px', height: 1 }} />

            {/* Recommended response plan section */}
            <div className="flex flex-col gap-[17px]" style={{ paddingLeft: 41, paddingTop: 25, paddingRight: 31 }}>
              <p className="font-semibold text-[18px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">
                Recommended response plan:
              </p>
              <p className="font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">
                Projected Impact:{' '}
                <span className="font-bold text-[#468137]">6-8 yrs (~2033)</span>
              </p>
              <button
                onClick={() => setIsTimelineOpen(true)}
                className="w-full h-[37px] rounded-[14px] border border-[#1e2939] flex items-center justify-center"
              >
                <span className="font-medium text-[14px] tracking-[-0.15px] text-[#1e2939]"> Watch Impact Timeline</span>
              </button>
              <div>
                <p className="font-semibold text-[18px] leading-[28px] tracking-[-0.44px] text-[#1e2939] ml-[13px]">
                  Program stages:
                </p>
                <div className="relative mt-[14px]" style={{ height: 178, width: 289 }}>
                  {STEPS.map((step, i) => (
                    <div
                      key={i}
                      className="absolute flex gap-[17px] items-center"
                      style={{ left: 0, right: 0, top: i * 32, height: 67, paddingLeft: 13, paddingRight: 32, borderRadius: 20 }}
                    >
                      <span className="font-medium text-[16px] text-[#505153] leading-[1.25] flex-shrink-0">{i + 1}</span>
                      <span className="font-medium text-[16px] text-[#505153] leading-[1.3]">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Start Response Plan button */}
          <button
            onClick={onPlan}
            className="absolute w-[313px] h-[37px] rounded-[14px] bg-[rgba(16,24,40,0.9)] flex items-center justify-center"
            style={{ left: 41, top: 722 }}
          >
            <span className="font-medium text-[14px] text-white">Start Response Plan</span>
          </button>
        </div>

        {/* Impact Timeline overlay — Figma node 396:1047 */}
        {isTimelineOpen && (
          <div
            style={{
              position: 'absolute',
              left: 438, top: 549, width: 1056, height: 367,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.82)',
              border: '1px solid rgba(255,255,255,0.3)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: 20,
            }}
          >
            {/* X close button — Figma node 396:1307, absolute x:9 y:8, 23×23 */}
            <button
              onClick={() => setIsTimelineOpen(false)}
              aria-label="Close"
              style={{
                position: 'absolute', top: 8, left: 9,
                width: 23, height: 23,
                background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', lineHeight: 0,
              }}
            >
              <svg width="23" height="23" viewBox="0 0 23 23" xmlns="http://www.w3.org/2000/svg">
                <path
                  fillRule="nonzero"
                  fill="#1e2939"
                  d="M11.5 12.4047 L15.6477 16.5523 C15.7669 16.6716 15.9134 16.7355 16.0872 16.744 C16.261 16.7525 16.416 16.6886 16.5523 16.5523 C16.6886 16.416 16.7568 16.2653 16.7568 16.1 C16.7568 15.9347 16.6886 15.784 16.5523 15.6477 L12.4047 11.5 L16.5523 7.35233 C16.6716 7.23307 16.7355 7.08656 16.744 6.91278 C16.7525 6.739 16.6886 6.58396 16.5523 6.44767 C16.416 6.31137 16.2653 6.24322 16.1 6.24322 C15.9347 6.24322 15.784 6.31137 15.6477 6.44767 L11.5 10.5953 L7.35233 6.44767 C7.23307 6.32841 7.08656 6.26452 6.91278 6.256 C6.739 6.24748 6.58396 6.31137 6.44767 6.44767 C6.31137 6.58396 6.24322 6.73474 6.24322 6.9 C6.24322 7.06526 6.31137 7.21604 6.44767 7.35233 L10.5953 11.5 L6.44767 15.6477 C6.32841 15.7669 6.26452 15.9139 6.256 16.0885 C6.24748 16.2614 6.31137 16.416 6.44767 16.5523 C6.58396 16.6886 6.73474 16.7568 6.9 16.7568 C7.06526 16.7568 7.21604 16.6886 7.35233 16.5523 L11.5 12.4047 Z M11.5038 23 C9.91343 23 8.41843 22.6984 7.01883 22.0953 C5.61924 21.4914 4.40152 20.6719 3.36567 19.6369 C2.32981 18.6019 1.50991 17.3854 0.905945 15.9876 C0.301982 14.5897 5.67447e-16 13.0951 0 11.5038 C-5.67447e-16 9.91257 0.301982 8.41757 0.905945 7.01883 C1.50906 5.61924 2.32726 4.40152 3.36056 3.36567 C4.39385 2.32981 5.61072 1.50991 7.01117 0.905945 C8.41161 0.301982 9.90661 0 11.4962 0 C13.0857 0 14.5807 0.301982 15.9812 0.905945 C17.3808 1.50906 18.5985 2.32769 19.6343 3.36183 C20.6702 4.39598 21.4901 5.61285 22.0941 7.01244 C22.698 8.41204 23 9.90661 23 11.4962 C23 13.0857 22.6984 14.5807 22.0953 15.9812 C21.4922 17.3816 20.6727 18.5993 19.6369 19.6343 C18.601 20.6693 17.3846 21.4892 15.9876 22.0941 C14.5905 22.6989 13.0959 23.0009 11.5038 23 Z"
                />
              </svg>
            </button>

            {/* Header — Figma node 416:74, 944×64, paddingLeft:88, flex justify-between */}
            <div
              style={{
                width: 944, height: 64, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                paddingLeft: 88,
              }}
            >
              {/* Title + subtitle */}
              <div style={{ padding: '0 25px' }}>
                <p style={{ fontWeight: 600, fontSize: 16, lineHeight: '28px', letterSpacing: '-0.44px', color: '#364153', margin: 0 }}>
                  Impact Timeline: Compare projected impact
                </p>
                <p style={{ fontWeight: 500, fontSize: 16, lineHeight: '28px', letterSpacing: '-0.44px', color: '#364153', margin: 0 }}>
                  The timeline updates as protection measures progress
                </p>
              </div>
              {/* Legend — 153×64 */}
              <div style={{ position: 'relative', width: 153, height: 64, flexShrink: 0 }}>
                <div style={{ position: 'absolute', top: 0, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 20, height: 2, background: '#468137', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '28px', letterSpacing: '-0.44px', color: '#364153', whiteSpace: 'nowrap' }}>With protection</span>
                </div>
                <div style={{ position: 'absolute', top: 36, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 20, height: 2, background: '#c0392b', flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 400, lineHeight: '28px', letterSpacing: '-0.44px', color: '#364153', whiteSpace: 'nowrap' }}>Without protection</span>
                </div>
              </div>
            </div>

            {/* Chart area — Figma node 396:1051, 1056×238, full card width */}
            <div style={{ width: 1056, height: 238, flexShrink: 0, position: 'relative' }}>
              <svg
                viewBox="0 0 960 238"
                width={944}
                height={238}
                style={{ position: 'absolute', top: 0, left: 56, overflow: 'hidden' }}
              >
                <style>{`
                  @keyframes drawLine {
                    from { stroke-dashoffset: 1; }
                    to   { stroke-dashoffset: 0; }
                  }
                `}</style>

                {/* Y-axis labels */}
                <text x={67} y={25} textAnchor="end" fontSize={16} fontWeight={500} fill="#1e2939">High</text>
                <text x={67} y={79} textAnchor="end" fontSize={16} fontWeight={500} fill="#1e2939">Moderate</text>
                <text x={67} y={133} textAnchor="end" fontSize={16} fontWeight={500} fill="#1e2939">Low</text>

                {/* Horizontal grid lines */}
                <line x1={85} y1={20} x2={940} y2={20} stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={85} y1={74} x2={940} y2={74} stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="4 4" />
                <line x1={85} y1={128} x2={940} y2={128} stroke="rgba(0,0,0,0.12)" strokeWidth={1} strokeDasharray="4 4" />

                {/* Y-axis vertical spine */}
                <line x1={85} y1={8} x2={85} y2={140} stroke="rgba(0,0,0,0.18)" strokeWidth={1} />

                {/* Green path — With protection */}
                <path
                  d="M 107 74 C 200 79, 330 82, 450 78 C 560 72, 630 61, 668 53 C 750 48, 860 46, 939 45"
                  stroke="#468137"
                  strokeWidth={2.5}
                  fill="none"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: 'drawLine 1.2s ease-out forwards',
                  }}
                />

                {/* Red path — Without protection */}
                <path
                  d="M 107 74 C 160 55, 195 42, 228 34 C 295 20, 360 8, 430 4 C 520 2, 680 5, 939 7"
                  stroke="#c0392b"
                  strokeWidth={2.5}
                  fill="none"
                  pathLength={1}
                  style={{
                    strokeDasharray: 1,
                    strokeDashoffset: 1,
                    animation: 'drawLine 1.2s ease-out 0.1s forwards',
                  }}
                />

                {/* Dots — Figma cx≈107,228,668 cy≈73,34,53 */}
                <circle cx={107} cy={73} r={7} fill="#1a1a1a" />
                <circle cx={228} cy={34} r={7} fill="#1a1a1a" />
                <circle cx={668} cy={53} r={7} fill="#1a1a1a" />

                {/* X-axis labels */}
                {X_LABELS.map((label, i) => (
                  <text
                    key={label}
                    x={X_POSITIONS[i]}
                    y={160}
                    textAnchor="middle"
                    fontSize={16}
                    fontWeight={label === 'Today' ? 700 : 500}
                    fill={label === 'Today' ? '#120101' : 'rgba(20,2,2,0.8)'}
                  >
                    {label}
                  </text>
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
