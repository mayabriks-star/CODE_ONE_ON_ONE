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
    roleLabel: 'Selected Scenario',
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
    delayToImpact: '+8 years',
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
    delayToImpact: '+3 years',
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
    delayToImpact: '+6 years',
    implementationTime: '10 months',
    valueForEffort: 'moderate',
    mainTradeoff: 'Partial measures only',
  },
];

// Reused by AllocateBudgetTeamsPage so its budget total/measures match
// exactly what was selected on this screen, instead of new arbitrary numbers.
export const SELECTED_SCENARIO = SCENARIOS.find((s) => s.id === 'selected')!;

function CheckCell({ v }: { v: MeasureValue }) {
  if (v === 'yes') return <span style={{ color: '#00a63e', fontSize: 17, fontWeight: 700, lineHeight: 1 }}>✓</span>;
  if (v === 'no') return <span style={{ color: '#b91d1d', fontSize: 17, fontWeight: 700, lineHeight: 1 }}>✗</span>;
  return <span style={{ fontSize: 13, fontWeight: 600, color: '#b45309', letterSpacing: '-0.2px' }}>Partial</span>;
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
    { label: 'Resident support', render: s => <CheckCell v={s.residentSupport} /> },
  ];

  const outcomeRows: { label: string; render: (s: ScenarioData) => React.ReactNode }[] = [
    { label: 'Total cost', render: s => <span style={{ fontSize: 13, fontWeight: 700, color: '#364153', letterSpacing: '-0.44px' }}>{s.totalCost}</span> },
    { label: 'Budget used', render: s => <MiniBar pct={s.budgetPct} isOver={s.budgetPct > 100} /> },
    { label: 'Residents protected', render: s => <span style={{ fontSize: 13, fontWeight: 600, color: '#364153', letterSpacing: '-0.44px' }}>{s.residentsProtected.toLocaleString()}</span> },
    { label: 'Flood-risk reduction', render: s => <RiskBar pct={s.floodRiskReduction} /> },
    { label: 'Delay to first impact', render: s => <span style={{ fontSize: 13, fontWeight: 500, color: '#364153', letterSpacing: '-0.44px' }}>{s.delayToImpact}</span> },
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
      gap: 4,
      cursor: 'default',
      transition: 'background 0.15s ease',
    };
  }

  function getCellStyle(s: ScenarioData): React.CSSProperties {
    const active = s.id === activeCol;
    return {
      flex: 1,
      padding: '5px 12px',
      background: active ? 'rgba(54,65,83,0.05)' : 'transparent',
      boxShadow: active ? 'inset 1px 0 0 rgba(54,65,83,0.18), inset -1px 0 0 rgba(54,65,83,0.18)' : undefined,
      display: 'flex',
      alignItems: 'center',
      borderLeft: '1px solid rgba(0,0,0,0.04)',
      transition: 'background 0.15s ease',
    };
  }

  return (
    <div className="screen-enter">
      <HomePageHeader />

      {/* Back arrow + title — sits directly over the map, white text for
          contrast (same convention as the back button on AssessCriticalZonesPage,
          Section H in the design doc). */}
      <div style={{ position: 'fixed', left: 32, top: 99, display: 'flex', alignItems: 'center', gap: 16, pointerEvents: 'auto' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <ArrowLeft size={26} color="white" />
        </button>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'white', letterSpacing: '-0.44px', lineHeight: '26px' }}>
          Compare Response Scenarios
        </span>
      </div>

      {/* Large card floating over the map — leaves a visible map margin on
          all sides instead of painting over the whole viewport. */}
      <div
        className="glass-shadow"
        style={{
          position: 'fixed', left: 32, right: 32, top: 100, bottom: 32,
          background: 'rgba(255,255,255,0.92)', borderRadius: 20,
          padding: '24px 28px', boxSizing: 'border-box' as const,
          display: 'flex', flexDirection: 'column', gap: 8,
          overflow: 'hidden', pointerEvents: 'auto',
        }}
      >
            {/* Top summary */}
            <div style={{
              background: 'white', borderRadius: '16px',
              padding: '10px 20px', display: 'flex', alignItems: 'center',
              gap: 0, boxSizing: 'border-box' as const, flexShrink: 0,
            }}>
              {/* Budget donut */}
              <div style={{ paddingRight: 28, marginRight: 28, borderRight: '1px solid rgba(0,0,0,0.08)' }}>
                <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, color: '#6b778a', letterSpacing: '0.5px', textTransform: 'uppercase' as const }}>
                  Budget Overview
                </p>
                <BudgetDonut
                  usedPct={sel.budgetPct}
                  costLabel={sel.totalCost}
                  availLabel={availLabel}
                  remainLabel={remainLabel}
                />
              </div>

              {/* Metric tiles */}
              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                {[
                  { label: 'Residents Protected', value: sel.residentsProtected.toLocaleString() },
                  { label: 'Risk Reduction', value: `−${sel.floodRiskReduction}%` },
                  { label: 'Delay to Impact', value: sel.delayToImpact },
                ].map((m, i, arr) => (
                  <div
                    key={m.label}
                    style={{
                      flex: 1, paddingLeft: 24, paddingRight: 24,
                      borderRight: i < arr.length - 1 ? '1px solid rgba(0,0,0,0.08)' : undefined,
                    }}
                  >
                    <p style={{ margin: '0 0 5px', fontSize: 12, fontWeight: 500, color: '#6b778a', letterSpacing: '-0.2px' }}>{m.label}</p>
                    <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#364153', letterSpacing: '-0.44px', lineHeight: 1 }}>{m.value}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 11, color: '#6b778a', letterSpacing: '-0.2px' }}>Selected scenario</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison table */}
            <div style={{ background: 'white', borderRadius: '20px', overflow: 'hidden', flexShrink: 1, minHeight: 0 }}>

              {/* Column headers */}
              <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <div style={{ width: 168, flexShrink: 0, padding: '8px 14px', display: 'flex', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#6b778a', letterSpacing: '0.4px', textTransform: 'uppercase' as const }}>Factors</span>
                </div>
                {SCENARIOS.map(s => (
                  <div
                    key={s.id}
                    style={getHeaderStyle(s)}
                    onMouseEnter={() => setHoveredCol(s.id)}
                    onMouseLeave={() => setHoveredCol(null)}
                  >
                    <span style={{
                      display: 'inline-block', alignSelf: 'flex-start',
                      background: s.id === activeCol ? 'rgba(255,255,255,0.18)' : 'rgba(54,65,83,0.08)',
                      borderRadius: 100, padding: '2px 9px',
                      fontSize: 12, fontWeight: 600,
                      color: s.id === activeCol ? 'rgba(255,255,255,0.9)' : '#364153',
                      letterSpacing: '-0.2px', marginBottom: 5,
                    }}>
                      {s.roleLabel}
                    </span>
                    <span style={{
                      fontSize: 16, fontWeight: 600,
                      color: s.id === activeCol ? 'white' : '#364153',
                      letterSpacing: '-0.44px', lineHeight: 1.3,
                    }}>
                      {s.name}
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 500,
                      color: s.id === activeCol ? 'rgba(255,255,255,0.65)' : '#6b778a',
                      letterSpacing: '-0.2px', marginTop: 2,
                    }}>
                      {s.totalCost} · {s.budgetPct}% budget
                    </span>
                  </div>
                ))}
              </div>

              {/* Sections */}
              {tableSections.map((section, sIdx) => (
                <div key={section.title}>
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.025)', padding: '3px 14px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#6b778a', letterSpacing: '0.7px', textTransform: 'uppercase' as const }}>
                      {section.title}
                    </span>
                  </div>
                  {section.rows.map((row, rowIdx) => {
                    const isLastRow = rowIdx === section.rows.length - 1;
                    const isLastSection = sIdx === tableSections.length - 1;
                    return (
                      <div
                        key={row.label}
                        style={{
                          display: 'flex', alignItems: 'stretch',
                          borderBottom: isLastRow && isLastSection ? undefined : '1px solid rgba(0,0,0,0.05)',
                        }}
                      >
                        <div style={{ width: 168, flexShrink: 0, padding: '6px 14px', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#364153', letterSpacing: '-0.3px' }}>
                            {row.label}
                          </span>
                        </div>
                        {SCENARIOS.map(s => (
                          <div
                            key={s.id}
                            style={getCellStyle(s)}
                            onMouseEnter={() => setHoveredCol(s.id)}
                            onMouseLeave={() => setHoveredCol(null)}
                          >
                            {row.render(s)}
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Continue */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
              <button onClick={onContinue} style={{
                width: '223px', height: '40px',
                background: '#323232', borderRadius: '100px', border: 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 500, color: 'white', letterSpacing: '-0.44px',
              }}>
                Continue
              </button>
            </div>
      </div>
    </div>
  );
}
