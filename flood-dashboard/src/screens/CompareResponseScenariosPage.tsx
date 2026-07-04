import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import HomePageHeader from '../components/shared/HomePageHeader';

interface Props {
  onBack: () => void;
  onContinue?: () => void;
}

type MeasureValue = 'yes' | 'no' | 'partial';
type EffortLevel = 'high' | 'moderate' | 'low';

export interface ScenarioData {
  id: string;
  roleLabel: string;
  name: string;
  seaWall: MeasureValue;
  raisedRoads: MeasureValue;
  elevatedBuildings: MeasureValue;
  elevatedWalkways: MeasureValue;
  drainageUpgrade: MeasureValue;
  utilityProtection: MeasureValue;
  residentSupport: MeasureValue;
  totalCost: string;
  totalCostValue: number;
  budgetPct: number;
  residentsProtected: number;
  floodRiskReduction: number;
  delayToImpact: string;
  implementationTime: string;
  valueForEffort: EffortLevel;
  mainTradeoff: string;
}

export const AVAILABLE_BUDGET = 24_000_000;

const SCENARIOS: ScenarioData[] = [
  {
    id: 'selected',
    roleLabel: 'Your Simulation',
    name: 'Balanced Approach',
    seaWall: 'yes',
    raisedRoads: 'yes',
    elevatedBuildings: 'partial',
    elevatedWalkways: 'yes',
    drainageUpgrade: 'yes',
    utilityProtection: 'yes',
    residentSupport: 'yes',
    totalCost: '$18.6M',
    totalCostValue: 18_600_000,
    budgetPct: 78,
    residentsProtected: 620,
    floodRiskReduction: 65,
    delayToImpact: '2034',
    implementationTime: '18 months',
    valueForEffort: 'high',
    mainTradeoff: 'Partial building coverage',
  },
  {
    id: 'option-a',
    roleLabel: 'Most Cost-Effective',
    name: 'Minimal Footprint',
    seaWall: 'yes',
    raisedRoads: 'no',
    elevatedBuildings: 'no',
    elevatedWalkways: 'partial',
    drainageUpgrade: 'yes',
    utilityProtection: 'no',
    residentSupport: 'yes',
    totalCost: '$9.2M',
    totalCostValue: 9_200_000,
    budgetPct: 38,
    residentsProtected: 310,
    floodRiskReduction: 30,
    delayToImpact: '2029',
    implementationTime: '9 months',
    valueForEffort: 'moderate',
    mainTradeoff: 'Low long-term protection',
  },
  {
    id: 'option-b',
    roleLabel: 'Fastest Deployment',
    name: 'Rapid Response',
    seaWall: 'yes',
    raisedRoads: 'partial',
    elevatedBuildings: 'no',
    elevatedWalkways: 'yes',
    drainageUpgrade: 'partial',
    utilityProtection: 'partial',
    residentSupport: 'yes',
    totalCost: '$14.1M',
    totalCostValue: 14_100_000,
    budgetPct: 59,
    residentsProtected: 480,
    floodRiskReduction: 50,
    delayToImpact: '2032',
    implementationTime: '10 months',
    valueForEffort: 'moderate',
    mainTradeoff: 'Partial measures only',
  },
];

// Reused by AllocateBudgetTeamsPage so its budget total/measures match
// exactly what was selected on this screen, instead of new arbitrary numbers.
export const SELECTED_SCENARIO = SCENARIOS.find((s) => s.id === 'selected')!;

function CheckCell({ v }: { v: MeasureValue }) {
  if (v === 'yes') return <span style={{ color: '#00a63e', fontSize: 19, fontWeight: 700, lineHeight: 1 }}>✓</span>;
  if (v === 'no') return <span style={{ color: '#b91d1d', fontSize: 19, fontWeight: 700, lineHeight: 1 }}>✗</span>;
  return <span style={{ fontSize: 13, fontWeight: 600, color: '#101828', letterSpacing: '-0.2px' }}>Partial</span>;
}

function RiskBar({ pct }: { pct: number }) {
  const color = pct >= 60 ? '#00a63e' : pct >= 40 ? '#b45309' : '#b91d1d';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 52, height: 4, borderRadius: 4, background: 'rgba(0,0,0,0.08)', flexShrink: 0 }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: 4, background: color }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, letterSpacing: '-0.2px' }}>{pct}%</span>
    </div>
  );
}

function MiniBar({ pct, isOver }: { pct: number; isOver: boolean }) {
  const color = isOver ? '#b91d1d' : '#364153';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 52, height: 4, borderRadius: 4, background: 'rgba(0,0,0,0.08)', flexShrink: 0 }}>
        <div style={{ width: `${Math.min(100, pct)}%`, height: '100%', borderRadius: 4, background: color }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 600, color, letterSpacing: '-0.3px' }}>{pct}%</span>
    </div>
  );
}

export function BudgetDonut({ usedPct, costLabel, availLabel, remainLabel }: {
  usedPct: number; costLabel: string; availLabel: string; remainLabel: string;
}) {
  const size = 76, r = 30, cx = 38, cy = 38;
  const circum = 2 * Math.PI * r;
  const usedDash = (usedPct / 100) * circum;
  const remainDash = circum - usedDash;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(0,0,0,0.07)" strokeWidth={9} />
          <circle
            cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth={9}
            strokeDasharray={`${remainDash} ${usedDash}`}
            transform={`rotate(${-90 + (usedPct / 100) * 360} ${cx} ${cy})`}
          />
          <circle
            cx={cx} cy={cy} r={r} fill="none" stroke="#364153" strokeWidth={9}
            strokeDasharray={`${usedDash} ${remainDash}`}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        </svg>
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: '#364153', lineHeight: 1 }}>{usedPct}%</div>
          <div style={{ fontSize: 8, color: '#6b778a', marginTop: 2 }}>used</div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#6b778a', letterSpacing: '-0.2px', marginBottom: 2 }}>Selected cost</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#364153', letterSpacing: '-0.44px', lineHeight: 1 }}>{costLabel}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#364153', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#505153', letterSpacing: '-0.2px' }}>Budget used · {usedPct}%</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e5e7eb', border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#505153', letterSpacing: '-0.2px' }}>Remaining · {remainLabel}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, flexShrink: 0 }} />
            <span style={{ fontSize: 12, color: '#6b778a', letterSpacing: '-0.2px' }}>Available budget · {availLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CompareResponseScenariosPage({ onBack, onContinue }: Props) {
  const [hoveredCol, setHoveredCol] = useState<string | null>(null);

  const activeCol = hoveredCol ?? 'selected';
  const sel = SCENARIOS.find(s => s.id === 'selected')!;
  const remainLabel = `$${((AVAILABLE_BUDGET - sel.totalCostValue) / 1_000_000).toFixed(1)}M`;
  const availLabel = `$${(AVAILABLE_BUDGET / 1_000_000).toFixed(0)}M`;

  const measureRows: { label: string; render: (s: ScenarioData) => React.ReactNode }[] = [
    { label: 'Sea wall', render: s => <CheckCell v={s.seaWall} /> },
    { label: 'Raised roads', render: s => <CheckCell v={s.raisedRoads} /> },
    { label: 'Elevated buildings', render: s => <CheckCell v={s.elevatedBuildings} /> },
    { label: 'Elevated walkways', render: s => <CheckCell v={s.elevatedWalkways} /> },
    { label: 'Drainage upgrade', render: s => <CheckCell v={s.drainageUpgrade} /> },
    { label: 'Utility protection', render: s => <CheckCell v={s.utilityProtection} /> },
  ];

  const outcomeRows: { label: string; render: (s: ScenarioData) => React.ReactNode }[] = [
    { label: 'Total cost', render: s => <span style={{ fontSize: 13, fontWeight: 700, color: '#364153', letterSpacing: '-0.44px' }}>{s.totalCost}</span> },
    { label: 'Residents protected', render: s => <span style={{ fontSize: 13, fontWeight: 600, color: '#364153', letterSpacing: '-0.44px' }}>{s.residentsProtected.toLocaleString()}</span> },
    { label: 'Flood-risk reduction', render: s => <RiskBar pct={s.floodRiskReduction} /> },
    { label: 'First impact year', render: s => <span style={{ fontSize: 13, fontWeight: 500, color: '#364153', letterSpacing: '-0.44px' }}>{s.delayToImpact}</span> },
    { label: 'Implementation time', render: s => <span style={{ fontSize: 13, fontWeight: 500, color: '#364153', letterSpacing: '-0.44px' }}>{s.implementationTime}</span> },
    { label: 'Main trade-off', render: s => <span style={{ fontSize: 12, color: '#505153', letterSpacing: '-0.2px', lineHeight: 1.4 }}>{s.mainTradeoff}</span> },
  ];

  const tableSections = [
    { title: 'Chosen Measures', rows: measureRows },
    { title: 'Outcomes', rows: outcomeRows },
  ];

  function getHeaderStyle(s: ScenarioData): React.CSSProperties {
    const active = s.id === activeCol;
    return {
      flex: 1,
      padding: '8px 12px',
      background: active ? '#364153' : 'transparent',
      borderTop: `2px solid ${active ? '#364153' : 'transparent'}`,
      borderLeft: '1px solid rgba(0,0,0,0.06)',
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
      cursor: 'default',
      transition: 'background 0.15s ease',
    };
  }

  function getCellStyle(s: ScenarioData): React.CSSProperties {
    const active = s.id === activeCol;
    return {
      flex: 1,
      padding: '13px 12px',
      background: active ? 'rgba(40,100,228,0.04)' : 'transparent',
      boxShadow: active ? 'inset 1px 0 0 rgba(40,100,228,0.2), inset -1px 0 0 rgba(40,100,228,0.2)' : undefined,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderLeft: '1px solid rgba(0,0,0,0.04)',
      transition: 'background 0.15s ease',
    };
  }

  return (
    <div className="screen-enter">
      <HomePageHeader />

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: 'fixed', left: 16, top: 93, width: 36, height: 36, zIndex: 30,
          background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
          border: 'none', borderRadius: '50%',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'auto',
        }}
      >
        <span style={{ fontSize: 17, color: '#1e2939', lineHeight: 1 }}>←</span>
      </button>

      {/* Progress bar — step 3 (Compare) active, steps 1+2 completed */}
      <div
        className="glass-65 glass-shadow"
        style={{
          position: 'fixed', top: 93, left: 60, right: 16, height: 36,
          borderRadius: 18, overflow: 'hidden', pointerEvents: 'none', zIndex: 20,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1426 36" preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, display: 'block' }}>
          {/* Steps 1+2 completed */}
          <polygon points="0,0 284,0 298,18 284,36 0,36" fill="rgba(30,41,57,0.25)" />
          <polygon points="284,0 566,0 580,18 566,36 284,36 298,18" fill="rgba(30,41,57,0.25)" />
          {/* Step 3 current */}
          <polygon points="566,0 848,0 862,18 848,36 566,36 580,18" fill="#1e2939" />
          {/* Dividers */}
          <path d="M284,0 L298,18 L284,36" stroke="rgba(30,41,57,0.3)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M566,0 L580,18 L566,36" stroke="rgba(30,41,57,0.3)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M848,0 L862,18 L848,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M1130,0 L1144,18 L1130,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
        </svg>
        <div style={{ position: 'absolute', left: '0%', top: 0, width: '20.90%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.7%' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#101828', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Assess critical zones</span>
        </div>
        <div style={{ position: 'absolute', left: '20.90%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#101828', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Simulate response scenarios</span>
        </div>
        <div style={{ position: 'absolute', left: '40.67%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'white', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Compare intervention options</span>
        </div>
        <div style={{ position: 'absolute', left: '60.45%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Assign Teams &amp; Tasks</span>
        </div>
        <div style={{ position: 'absolute', left: '80.22%', top: 0, width: '19.78%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.1%' }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Launch action plan</span>
        </div>
      </div>

      {/* Large card floating over the map */}
      <div
        className="glass-shadow"
        style={{
          position: 'fixed', left: 16, right: 16, top: 137, bottom: 32,
          background: 'rgba(255,255,255,0.92)', borderRadius: 20,
          padding: '24px 28px', boxSizing: 'border-box' as const,
          display: 'flex', flexDirection: 'column', gap: 14,
          overflowY: 'auto', pointerEvents: 'auto',
        }}
      >
            {/* Page header */}
            <div style={{ flexShrink: 0, paddingBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.44px', lineHeight: '23px' }}>
                Compare Intervention Options
              </p>
              <p style={{ margin: '8px 0 0', fontSize: 17, fontWeight: 500, color: '#6b7280', letterSpacing: '-0.44px', lineHeight: '24px', whiteSpace: 'pre-line' }}>
                Comparing your simulation against two optimized alternatives.{'\n'}Each scenario reflects a different balance of cost, deployment speed, and flood protection coverage.
              </p>
            </div>

            {/* Comparison table */}
            <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

              {/* Column headers */}
              <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ width: 168, flexShrink: 0, padding: '8px 14px' }} />
                {SCENARIOS.map(s => (
                  <div
                    key={s.id}
                    style={getHeaderStyle(s)}
                    onMouseEnter={() => setHoveredCol(s.id)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <span style={{
                      fontSize: 15, fontWeight: 600,
                      color: s.id === activeCol ? 'white' : '#364153',
                      letterSpacing: '-0.3px', lineHeight: 1.3, textAlign: 'center',
                    }}>
                      {s.roleLabel}
                    </span>
                  </div>
                ))}
              </div>

              {/* Chosen Measures rows */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {measureRows.map((row, rowIdx) => (
                  <div key={row.label} style={{ display: 'flex', alignItems: 'stretch', borderBottom: rowIdx < measureRows.length - 1 ? '1px solid rgba(0,0,0,0.05)' : undefined }}>
                    <div style={{ width: 168, flexShrink: 0, padding: '13px 14px', display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: 15, fontWeight: 500, color: '#364153', letterSpacing: '-0.3px' }}>{row.label}</span>
                    </div>
                    {SCENARIOS.map(s => (
                      <div key={s.id} style={getCellStyle(s)} onMouseEnter={() => setHoveredCol(s.id)} onMouseLeave={() => setHoveredCol(null)}>
                        {row.render(s)}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

            </div>

            {/* Outcomes — separate white card, one panel per scenario */}
            <div style={{ background: 'white', borderRadius: 12, flexShrink: 0, display: 'flex', overflow: 'hidden' }}>
              {/* Label column */}
              <div style={{ width: 168, flexShrink: 0, padding: '16px 14px', display: 'flex', alignItems: 'flex-start', borderRight: '1px solid rgba(0,0,0,0.06)' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#1e2939', letterSpacing: '-0.2px' }}>Outcomes</span>
              </div>
              {/* One summary card per scenario */}
              {SCENARIOS.map(s => {
                const isActive = s.id === activeCol;
                return (
                  <div
                    key={s.id}
                    onMouseEnter={() => setHoveredCol(s.id)}
                    onMouseLeave={() => setHoveredCol(null)}
                    style={{
                      flex: 1, padding: '14px 16px',
                      borderLeft: '1px solid rgba(0,0,0,0.06)',
                      background: isActive ? 'rgba(40,100,228,0.04)' : 'transparent',
                      display: 'flex', flexDirection: 'column', gap: 6,
                      transition: 'background 0.15s ease',
                    }}
                  >
                    {/* Primary metric */}
                    <div style={{ marginBottom: 1 }}>
                      <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#364153', letterSpacing: '-0.5px', lineHeight: 1.1 }}>{s.totalCost}</p>
                      <p style={{ margin: '2px 0 0', fontSize: 11, fontWeight: 500, color: '#6b778a', letterSpacing: '-0.1px' }}>Total investment</p>
                    </div>
                    {/* Metric rows — label + value tight on same row */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {[
                        { label: 'Residents protected', value: s.residentsProtected.toLocaleString() },
                        { label: 'Risk reduction', value: `−${s.floodRiskReduction}%` },
                        { label: 'First impact year', value: s.delayToImpact },
                        { label: 'Timeline', value: s.implementationTime },
                      ].map(m => (
                        <div key={m.label} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                          <span style={{ fontSize: 14, color: '#6b778a', flex: 1, minWidth: 0 }}>{m.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: '#364153', flexShrink: 0 }}>{m.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

      </div>

      {/* Continue — pinned to bottom-right */}
      <button onClick={onContinue} style={{
        position: 'fixed', bottom: 48, right: 32, zIndex: 25,
        width: '223px', height: '40px',
        background: '#101828', borderRadius: '100px', border: 'none',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: 500, color: 'white', letterSpacing: '-0.44px',
        pointerEvents: 'auto', boxShadow: '0 2px 12px rgba(16,24,40,0.18)',
      }}>
        Continue
      </button>
    </div>
  );
}
