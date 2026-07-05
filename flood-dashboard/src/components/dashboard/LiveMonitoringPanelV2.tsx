import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

interface Props { alert?: boolean; nudgeDown?: boolean; planActivated?: boolean; }

function MonitorIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" strokeLinecap="round">
      <path className="mon-inner" d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"  stroke="#1e2939" strokeWidth="2"/>
      <path className="mon-inner" d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"   stroke="#1e2939" strokeWidth="2"/>
      <path className="mon-outer" d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"    stroke="#1e2939" strokeWidth="2"/>
      <path className="mon-outer" d="M19.1 4.9C23 8.8 23 15.1 19.1 19"  stroke="#1e2939" strokeWidth="2"/>
      <circle cx="12" cy="12" r="2" fill="#1e2939"/>
    </svg>
  );
}

// Normal baseline oscillates tide-like, stays well below 12mm so status never turns red on its own
const BASE_NORMAL: number[] = [
  4.5,5.8,7.2,8.9,9.1,8.4,7.0,5.9,4.8,5.2,
  6.7,8.1,9.4,9.8,8.6,7.3,6.1,5.4,6.2,7.8,
];
const BASE_ALERT: number[] = [
  2.0,2.8,3.5,4.9,4.1,6.3,5.8,8.1,7.3,10.5,
  9.2,12.4,11.1,15.3,13.8,18.6,16.2,22.1,28.4,38.0,
];
// Plan activated: starts at alert peak, live ticks drive it down gradually
const BASE_ACTIVATED: number[] = [
  28.4,30.2,31.8,33.1,34.3,35.2,35.9,36.5,36.9,37.2,
  37.5,37.8,37.9,38.1,37.8,38.0,37.7,38.1,37.9,38.0,
];

const VW = 292, VH = 72;
const ML = 28, MT = 4, MB = 4;
const PW = VW - ML;
const PH = VH - MT - MB;

function toY(v: number, yMax: number) {
  return MT + PH - Math.min(Math.max(v, 0) / yMax, 1) * PH;
}

function buildPaths(data: number[], yMax: number) {
  const n = data.length;
  const pts: [number, number][] = data.map((v, i) => [ML + (i / (n - 1)) * PW, toY(v, yMax)]);
  let line = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const cx = (pts[i][0] - pts[i - 1][0]) / 2.5;
    line += ` C${(pts[i-1][0]+cx).toFixed(1)},${pts[i-1][1].toFixed(1)} ${(pts[i][0]-cx).toFixed(1)},${pts[i][1].toFixed(1)} ${pts[i][0].toFixed(1)},${pts[i][1].toFixed(1)}`;
  }
  const last = pts[pts.length - 1];
  return { line, area: `${line} L${last[0].toFixed(1)},${MT+PH} L${ML},${MT+PH} Z`, last };
}

interface Tracked { curr: number; prev: number; }

// Only colored arrows, no arrow when status is Normal
function Arrow({ delta }: { delta: number }) {
  const up = delta >= 0;
  return (
    <span style={{ fontSize: 13, fontWeight: 800, color: up ? '#dc2626' : '#16a34a' }}>
      {up ? '↑' : '↓'}
    </span>
  );
}

export default function LiveMonitoringPanelV2({ alert, nudgeDown, planActivated }: Props) {
  const alertRef = useRef(alert);
  alertRef.current = alert;
  const activatedRef = useRef(planActivated);
  activatedRef.current = planActivated;

  const [seaData, setSeaData] = useState<number[]>(() =>
    planActivated ? [...BASE_ACTIVATED] : alert ? [...BASE_ALERT] : [...BASE_NORMAL]
  );
  const [waveH, setWaveH]     = useState<Tracked>({ curr: 1.2, prev: 1.0 });
  const [waveP, setWaveP]     = useState<Tracked>({ curr: 8.4, prev: 9.1 });
  const [tick, setTick]       = useState(0);
  const [flash, setFlash]     = useState(false);

  useEffect(() => {
    setSeaData(planActivated ? [...BASE_ACTIVATED] : alert ? [...BASE_ALERT] : [...BASE_NORMAL]);
  }, [alert, planActivated]);

  useEffect(() => {
    const intervalMs = 2000;
    const t = setInterval(() => {
      setSeaData(prev => {
        const last = prev[prev.length - 1];
        const isAlt = alertRef.current;
        let next: number;
        if (activatedRef.current) {
          if (last > 8.0) {
            // Fast enough to reach normal in ~5s (3 ticks × 2s), same tick rhythm
            const noise = (Math.random() - 0.5) * 1.5;
            next = Math.max(7, +(last - 13.0 + noise).toFixed(2));
          } else {
            // Reached normal — gentle oscillation like the first screen
            const t = Date.now() / 8000;
            const tide = 7.0 + Math.sin(t) * 2.2 + Math.cos(t * 2.1) * 1.0;
            next = Math.max(4, +(tide + (Math.random() - 0.5) * 0.7).toFixed(2));
          }
        } else if (!isAlt) {
          // Normal: pure tide oscillation around ~7mm — never drifts above 11mm
          const t = Date.now() / 8000;
          const tide = 7.0 + Math.sin(t) * 2.2 + Math.cos(t * 2.1) * 1.0;
          next = Math.max(0.5, +(tide + (Math.random() - 0.5) * 0.7).toFixed(2));
        } else {
          // Alert: keeps rising with noise
          const wave  = Math.sin(Date.now() / 4000) * 3.0;
          const noise = (Math.random() - 0.42) * 2.5;
          next = Math.max(0, +(last + 0.4 + noise + wave * 0.3).toFixed(2));
        }
        return [...prev.slice(-19), next];
      });
      setWaveH(p => {
        const next = +Math.max(0.3, Math.min(4.5, p.curr + (Math.random() - 0.5) * 0.6)).toFixed(1);
        return { curr: next, prev: p.curr };
      });
      setWaveP(p => {
        const next = +Math.max(4, Math.min(18, p.curr + (Math.random() - 0.5) * 2.0)).toFixed(1);
        return { curr: next, prev: p.curr };
      });
      setTick(n => n + 1);
      setFlash(true);
      setTimeout(() => setFlash(false), 600);
    }, intervalMs);
    return () => clearInterval(t);
  }, [planActivated]);

  const current   = seaData[seaData.length - 1];
  const seaDelta  = seaData.length >= 2 ? current - seaData[seaData.length - 2] : 0.1;
  const isAlert   = !!(alert || current >= 15);
  const accent    = isAlert ? '#b91d1d' : '#1e2939';
  const yMax      = Math.max(alert || planActivated ? 55 : 18, current * 1.35);
  const isNormal  = !isAlert;

  const seaStatus =
    current < 12 ? 'Normal' :
    current < 30 ? 'High'   : 'Critical';

  const yRef = [0, Math.round(yMax / 2), Math.round(yMax * 0.88)];
  const { line, area, last } = buildPaths(seaData, yMax);

  return (
    <>
      <style>{`
        @keyframes monInner {
          0%,100% { opacity:0; }
          10% { opacity:1; } 45% { opacity:1; } 65% { opacity:0; }
        }
        @keyframes monOuter {
          0%,30% { opacity:0; } 45% { opacity:1; } 62% { opacity:1; } 78% { opacity:0; } 100% { opacity:0; }
        }
        .mon-inner { animation: monInner 3.2s ease-in-out infinite; }
        .mon-outer { animation: monOuter 3.2s ease-in-out infinite; }
        @keyframes chartIn { from { opacity:0.5; } to { opacity:1; } }
        .chart-tick { animation: chartIn 0.5s ease-out; }
      `}</style>

      <div
        className="absolute left-[21px] w-[326px] glass-65 glass-shadow rounded-[16px] py-[10px] flex flex-col gap-[10px]"
        style={{ top: nudgeDown ? 192 : 140, transition: 'top 0.35s cubic-bezier(0.4,0,0.2,1)' }}
      >

        {/* Header */}
        <div className="flex items-center gap-[12px] px-[11px]">
          <MonitorIcon />
          <span className="font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">
            Live Monitoring
          </span>
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[7px]" />

        {/* City Status */}
        <div className="flex items-baseline gap-[10px] px-[11px]">
          <span className="font-semibold text-[20px] leading-[28px] tracking-[-0.44px] text-[#1e2939]">
            City Status
          </span>
          <span className="font-semibold text-[20px] leading-[28px] tracking-[-0.44px]"
            style={{ color: isAlert ? '#b91d1d' : '#1e2939' }}>
            {isAlert ? 'Severe' : 'Moderate'}
          </span>
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[7px]" />

        {/* Sea Level */}
        <div className="px-[11px]">
          <span className="font-semibold text-[17px] leading-[1] tracking-[-0.44px] text-[#6b7280]">Sea Level</span>
          <div className="flex items-end mt-[3px]">
            <span className="font-semibold text-[36px] leading-[1] tracking-[-1px]"
              style={{ color: accent, fontVariantNumeric: 'tabular-nums' }}>
              {current.toFixed(1)}
            </span>
            <span className="font-medium text-[15px] leading-[28px] tracking-[-0.44px] text-[#6b7280] ml-[5px] mb-[1px]">
              mm
            </span>
            <div className="flex-1" />
            {/* Status word + arrow share the same semantic color.
                Normal = no arrow (neutral). High/Critical = always red word + red arrow,
                direction based on delta — "High" can never appear green. */}
            <div className="flex items-center gap-[6px] mb-[3px]">
              <span className="font-medium text-[14px] leading-[21px] tracking-[-0.44px]"
                style={{ color: isNormal ? '#1e2939' : '#dc2626' }}>
                {seaStatus}
              </span>
              {!isNormal && (
                <span style={{ fontSize: 13, fontWeight: 800, color: '#dc2626' }}>
                  {seaDelta >= 0 ? '↑' : '↓'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Chart — key on tick to trigger CSS re-animation each update */}
        <div className="px-[11px]">
          <svg key={tick} width="100%" height={VH}
            viewBox={`0 0 ${VW} ${VH}`} className="chart-tick" style={{ display: 'block' }}>
            <defs>
              <linearGradient id="lg5" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accent} stopOpacity={0.20} />
                <stop offset="100%" stopColor={accent} stopOpacity={0.01} />
              </linearGradient>
              <clipPath id="cp5"><rect x={ML} y={MT} width={PW} height={PH} /></clipPath>
            </defs>

            {yRef.map(v => {
              const y = toY(v, yMax);
              if (y < MT - 2 || y > MT + PH + 2) return null;
              return (
                <g key={v}>
                  <line x1={ML} y1={y} x2={VW} y2={y} stroke="rgba(0,0,0,0.06)" strokeWidth={1} />
                  <text x={ML - 5} y={y + 3.5} textAnchor="end"
                    fontSize={9} fontWeight="500" fill="#9ca3af" fontFamily="inherit">
                    {v}
                  </text>
                </g>
              );
            })}

            <g clipPath="url(#cp5)">
              <path d={area} fill="url(#lg5)" />
              <path d={line} fill="none" stroke={accent} strokeWidth={2}
                strokeLinecap="round" strokeLinejoin="round" />
            </g>

            {flash && (
              <circle cx={last[0]} cy={last[1]} r={9}
                fill="none" stroke={accent} strokeWidth={1} opacity={0.18} />
            )}
            <circle cx={last[0]} cy={last[1]} r={4} fill="white" stroke={accent} strokeWidth={2} />
          </svg>
        </div>

        <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[7px]" />

        {/* Wave metrics — larger values + label hierarchy */}
        <div className="flex flex-col mx-[11px] rounded-[12px]" style={{ background: 'rgba(0,0,0,0.025)' }}>
          {/* Wave Height */}
          <div className="flex items-center justify-between px-[13px] pt-[12px] pb-[8px]"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <span className="font-semibold text-[17px] leading-[1] tracking-[-0.44px] text-[#6b7280]">
              Wave Height
            </span>
            <div className="flex items-center gap-[7px]">
              <span className="font-semibold text-[17px] leading-[1] tracking-[-0.5px] text-[#1e2939]"
                style={{ fontVariantNumeric: 'tabular-nums' }}>
                {waveH.curr} m
              </span>
              <Arrow delta={waveH.curr - waveH.prev} />
            </div>
          </div>

          {/* Wave Frequency */}
          <div className="flex items-center justify-between px-[13px] pt-[8px] pb-[12px]">
            <span className="font-semibold text-[17px] leading-[1] tracking-[-0.44px] text-[#6b7280]">
              Wave Frequency
            </span>
            <div className="flex items-center gap-[7px]">
              <span className="font-semibold text-[17px] leading-[1] tracking-[-0.5px] text-[#1e2939]"
                style={{ fontVariantNumeric: 'tabular-nums' }}>
                {waveP.curr} s
              </span>
              <Arrow delta={waveP.curr - waveP.prev} />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="h-px bg-[rgba(0,0,0,0.08)] mx-[7px]" />
        <div className="flex justify-end items-center px-[11px] gap-[4px] pb-[2px] cursor-pointer">
          <span className="font-medium text-[14px] leading-[20px] tracking-[-0.44px] text-[#1e2939]">
            View full analysis
          </span>
          <ChevronDown size={13} color="#1e2939" strokeWidth={2} />
        </div>

      </div>
    </>
  );
}
