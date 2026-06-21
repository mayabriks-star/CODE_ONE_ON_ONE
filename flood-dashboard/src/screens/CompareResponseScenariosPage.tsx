import { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Bell } from 'lucide-react';

interface Props {
  onBack: () => void;
}

interface ScenarioData {
  id: string;
  name: string;
  isSelected: boolean;
  seaWall: string;
  raisedRoads: string;
  elevatedBuildings: string;
  elevatedWalkways: string;
  drainageUpgrade: string;
  utilityProtection: string;
  residentSupport: string;
  totalCostLabel: string;
  totalCostValue: number;
  budgetUsedPct: number;
  remainingBudget: string;
  costStatus: 'within' | 'over';
  complexity: string;
  residentsProtected: number;
  floodRiskReduction: string;
  delayToImpact: string;
  roadContinuity: string;
  emergencyContinuity: string;
  dailyLifeContinuity: string;
  implementationTime: string;
  longTermValue: string;
  valueForMoney: string;
  mainLimitation: string;
  bestSuitedFor: string;
}

const AVAILABLE_BUDGET = 24_000_000;

const SCENARIOS: ScenarioData[] = [
  {
    id: 'selected',
    name: 'Selected Simulation Result',
    isSelected: true,
    seaWall: '3 segments',
    raisedRoads: 'Included',
    elevatedBuildings: 'Partial',
    elevatedWalkways: 'Included',
    drainageUpgrade: 'Included',
    utilityProtection: 'Included',
    residentSupport: '620 residents',
    totalCostLabel: '$18.6M',
    totalCostValue: 18_600_000,
    budgetUsedPct: 78,
    remainingBudget: '$5.4M',
    costStatus: 'within',
    complexity: 'Moderate',
    residentsProtected: 620,
    floodRiskReduction: '−65%',
    delayToImpact: '+8 years',
    roadContinuity: 'Maintained',
    emergencyContinuity: 'Maintained',
    dailyLifeContinuity: 'Minor disruption',
    implementationTime: '18 months',
    longTermValue: 'High',
    valueForMoney: 'High',
    mainLimitation: 'Partial building coverage',
    bestSuitedFor: 'Balanced risk mitigation',
  },
  {
    id: 'lower-cost',
    name: 'Lower Cost',
    isSelected: false,
    seaWall: '1 segment',
    raisedRoads: 'Not included',
    elevatedBuildings: 'Not included',
    elevatedWalkways: 'Partial',
    drainageUpgrade: 'Included',
    utilityProtection: 'Not included',
    residentSupport: '310 residents',
    totalCostLabel: '$9.2M',
    totalCostValue: 9_200_000,
    budgetUsedPct: 38,
    remainingBudget: '$14.8M',
    costStatus: 'within',
    complexity: 'Low',
    residentsProtected: 310,
    floodRiskReduction: '−30%',
    delayToImpact: '+3 years',
    roadContinuity: 'Reduced',
    emergencyContinuity: 'At risk',
    dailyLifeContinuity: 'Minimal disruption',
    implementationTime: '9 months',
    longTermValue: 'Low',
    valueForMoney: 'Moderate',
    mainLimitation: 'Low long-term protection',
    bestSuitedFor: 'Budget-constrained response',
  },
  {
    id: 'higher-protection',
    name: 'Higher Protection',
    isSelected: false,
    seaWall: '6 segments',
    raisedRoads: 'Included',
    elevatedBuildings: 'Included',
    elevatedWalkways: 'Included',
    drainageUpgrade: 'Included',
    utilityProtection: 'Included',
    residentSupport: '620 residents',
    totalCostLabel: '$28.9M',
    totalCostValue: 28_900_000,
    budgetUsedPct: 120,
    remainingBudget: '−$4.9M',
    costStatus: 'over',
    complexity: 'High',
    residentsProtected: 620,
    floodRiskReduction: '−90%',
    delayToImpact: '+15 years',
    roadContinuity: 'Maintained',
    emergencyContinuity: 'Maintained',
    dailyLifeContinuity: 'Significant disruption',
    implementationTime: '36 months',
    longTermValue: 'Very high',
    valueForMoney: 'Low (over budget)',
    mainLimitation: 'Exceeds available budget',
    bestSuitedFor: 'Maximum long-term resilience',
  },
  {
    id: 'faster-delivery',
    name: 'Faster Delivery',
    isSelected: false,
    seaWall: '2 segments',
    raisedRoads: 'Partial',
    elevatedBuildings: 'Not included',
    elevatedWalkways: 'Included',
    drainageUpgrade: 'Partial',
    utilityProtection: 'Partial',
    residentSupport: '480 residents',
    totalCostLabel: '$14.1M',
    totalCostValue: 14_100_000,
    budgetUsedPct: 59,
    remainingBudget: '$9.9M',
    costStatus: 'within',
    complexity: 'Moderate',
    residentsProtected: 480,
    floodRiskReduction: '−50%',
    delayToImpact: '+6 years',
    roadContinuity: 'Reduced',
    emergencyContinuity: 'Maintained',
    dailyLifeContinuity: 'Minor disruption',
    implementationTime: '10 months',
    longTermValue: 'Moderate',
    valueForMoney: 'Moderate',
    mainLimitation: 'Partial measures only',
    bestSuitedFor: 'Rapid response needed',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    isSelected: false,
    seaWall: '3 segments',
    raisedRoads: 'Included',
    elevatedBuildings: 'Partial',
    elevatedWalkways: 'Included',
    drainageUpgrade: 'Included',
    utilityProtection: 'Partial',
    residentSupport: '580 residents',
    totalCostLabel: '$21.4M',
    totalCostValue: 21_400_000,
    budgetUsedPct: 89,
    remainingBudget: '$2.6M',
    costStatus: 'within',
    complexity: 'Moderate',
    residentsProtected: 580,
    floodRiskReduction: '−75%',
    delayToImpact: '+11 years',
    roadContinuity: 'Maintained',
    emergencyContinuity: 'Maintained',
    dailyLifeContinuity: 'Minor disruption',
    implementationTime: '22 months',
    longTermValue: 'High',
    valueForMoney: 'High',
    mainLimitation: 'Partial utility protection',
    bestSuitedFor: 'Community-first risk reduction',
  },
];

function protectionColor(value: string): string {
  if (value === 'Not included') return '#9ca3af';
  if (value === 'Partial') return '#b45309';
  return '#364153';
}

function BudgetBar({ pct, isOver }: { pct: number; isOver: boolean }) {
  const displayPct = Math.min(100, pct);
  const color = isOver ? '#b91d1d' : '#364153';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <span style={{ fontSize: 13, color, fontWeight: 500 }}>{pct}%</span>
      <div style={{ width: 64, height: 4, borderRadius: 4, background: 'rgba(0,0,0,0.08)' }}>
        <div style={{ width: `${displayPct}%`, height: '100%', borderRadius: 4, background: color }} />
      </div>
    </div>
  );
}

function CostBadge({ status }: { status: 'within' | 'over' }) {
  if (status === 'over') {
    return (
      <span style={{ background: 'rgba(185,29,29,0.12)', color: '#b91d1d', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const }}>
        Over budget
      </span>
    );
  }
  return (
    <span style={{ background: 'rgba(0,166,62,0.12)', color: '#00a63e', borderRadius: 100, padding: '2px 8px', fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap' as const }}>
      Within budget
    </span>
  );
}

export default function CompareResponseScenariosPage({ onBack }: Props) {
  const DESIGN_PAGE_HEIGHT = 980;
  const [pageScale, setPageScale] = useState(() =>
    Math.min(1, window.innerHeight / DESIGN_PAGE_HEIGHT)
  );
  useEffect(() => {
    const update = () => setPageScale(Math.min(1, window.innerHeight / DESIGN_PAGE_HEIGHT));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const selected = SCENARIOS.find(s => s.isSelected)!;
  const budgetLabel = `$${(AVAILABLE_BUDGET / 1_000_000).toFixed(0)}M`;

  // 12 rows across 4 compact sections
  const tableSections = [
    {
      title: 'Protection',
      rows: [
        { label: 'Sea wall', render: (s: ScenarioData) => <span style={{ color: protectionColor(s.seaWall) }}>{s.seaWall}</span> },
        { label: 'Raised roads', render: (s: ScenarioData) => <span style={{ color: protectionColor(s.raisedRoads) }}>{s.raisedRoads}</span> },
        { label: 'Drainage upgrade', render: (s: ScenarioData) => <span style={{ color: protectionColor(s.drainageUpgrade) }}>{s.drainageUpgrade}</span> },
        { label: 'Utility protection', render: (s: ScenarioData) => <span style={{ color: protectionColor(s.utilityProtection) }}>{s.utilityProtection}</span> },
      ],
    },
    {
      title: 'Budget',
      rows: [
        { label: 'Total cost', render: (s: ScenarioData) => <span style={{ fontWeight: 600 }}>{s.totalCostLabel}</span> },
        {
          label: 'Budget used',
          render: (s: ScenarioData) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <BudgetBar pct={s.budgetUsedPct} isOver={s.costStatus === 'over'} />
              <CostBadge status={s.costStatus} />
            </div>
          ),
        },
      ],
    },
    {
      title: 'Impact',
      rows: [
        { label: 'Residents protected', render: (s: ScenarioData) => s.residentsProtected.toLocaleString() },
        { label: 'Flood risk reduction', render: (s: ScenarioData) => s.floodRiskReduction },
        { label: 'Delay to impact', render: (s: ScenarioData) => s.delayToImpact },
        { label: 'Daily life continuity', render: (s: ScenarioData) => <span style={{ color: s.dailyLifeContinuity === 'Significant disruption' ? '#b91d1d' : '#505153' }}>{s.dailyLifeContinuity}</span> },
      ],
    },
    {
      title: 'Delivery',
      rows: [
        { label: 'Implementation time', render: (s: ScenarioData) => s.implementationTime },
        { label: 'Main trade-off', render: (s: ScenarioData) => <span style={{ color: '#505153', fontSize: 12 }}>{s.mainLimitation}</span> },
      ],
    },
  ];

  return (
    <div
      className="screen-enter"
      style={{
        width: '100vw',
        height: '100vh',
        overflowY: 'auto',
        background: '#f8f8f8',
      }}
    >
      <div style={{ marginTop: '6px', zoom: pageScale }}>

        {/* ── Header ── */}
        <div style={{ paddingLeft: '28px', paddingRight: '70px', paddingTop: '33px' }}>
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
              Compare Response Scenarios
            </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div style={{ paddingLeft: '70px', paddingRight: '70px', boxSizing: 'border-box' as const }}>
          <div style={{ width: '100%', paddingBottom: '40px' }}>

            {/* Step label */}
            <div style={{ marginTop: '16px' }}>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 500, color: '#6b778a', letterSpacing: '-0.44px' }}>
                Step 2 · Simulate Response Scenarios
              </p>
            </div>

            {/* ── Summary cards strip ── */}
            <div style={{ marginTop: '18px', display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '14px 18px', boxSizing: 'border-box' as const }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#505153', letterSpacing: '-0.44px' }}>Selected Scenario</p>
                <p style={{ margin: '6px 0 0', fontSize: '15px', fontWeight: 600, color: '#364153', letterSpacing: '-0.44px', lineHeight: '1.3' }}>
                  {selected.name}
                </p>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '14px 18px', boxSizing: 'border-box' as const }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#505153', letterSpacing: '-0.44px' }}>Available Budget</p>
                <p style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: 500, color: '#364153', letterSpacing: '-0.44px' }}>
                  {budgetLabel}
                </p>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '14px 18px', boxSizing: 'border-box' as const }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#505153', letterSpacing: '-0.44px' }}>Selected Cost</p>
                <p style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: 500, color: '#364153', letterSpacing: '-0.44px' }}>
                  {selected.totalCostLabel}
                </p>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '14px 18px', boxSizing: 'border-box' as const }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#505153', letterSpacing: '-0.44px' }}>Budget Used</p>
                <p style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: 500, color: '#364153', letterSpacing: '-0.44px' }}>
                  {selected.budgetUsedPct}%
                </p>
                <div style={{ marginTop: '5px', width: '100%', height: '4px', borderRadius: '4px', background: 'rgba(0,0,0,0.08)' }}>
                  <div style={{ width: `${selected.budgetUsedPct}%`, height: '100%', borderRadius: '4px', background: '#364153' }} />
                </div>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '14px 18px', boxSizing: 'border-box' as const }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#505153', letterSpacing: '-0.44px' }}>Residents Protected</p>
                <p style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: 500, color: '#364153', letterSpacing: '-0.44px' }}>
                  {selected.residentsProtected.toLocaleString()}
                </p>
              </div>
              <div style={{ flex: 1, background: 'white', borderRadius: '16px', padding: '14px 18px', boxSizing: 'border-box' as const }}>
                <p style={{ margin: 0, fontSize: '12px', fontWeight: 500, color: '#505153', letterSpacing: '-0.44px' }}>Delay to Impact</p>
                <p style={{ margin: '6px 0 0', fontSize: '22px', fontWeight: 500, color: '#364153', letterSpacing: '-0.44px' }}>
                  {selected.delayToImpact}
                </p>
              </div>
            </div>

            {/* ── Comparison table ── */}
            <div style={{ marginTop: '20px', background: 'white', borderRadius: '20px', overflow: 'hidden' }}>

              {/* Column header row */}
              <div style={{ display: 'flex', alignItems: 'stretch', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ width: '186px', flexShrink: 0, padding: '13px 16px', display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#6b778a', letterSpacing: '-0.44px' }}>
                    Factors
                  </span>
                </div>
                {SCENARIOS.map(s => (
                  <div
                    key={s.id}
                    style={{
                      flex: 1,
                      padding: '10px 12px',
                      background: s.isSelected ? 'rgba(54,65,83,0.07)' : undefined,
                      borderTop: s.isSelected ? '2px solid rgba(54,65,83,0.5)' : undefined,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      borderLeft: '1px solid rgba(0,0,0,0.05)',
                    }}
                  >
                    {s.isSelected && (
                      <span style={{
                        display: 'inline-block',
                        alignSelf: 'flex-start',
                        background: 'rgba(54,65,83,0.12)',
                        borderRadius: 100,
                        padding: '2px 8px',
                        fontSize: 10,
                        fontWeight: 600,
                        color: '#364153',
                        letterSpacing: '-0.3px',
                        marginBottom: 4,
                      }}>
                        Selected ✓
                      </span>
                    )}
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#364153', letterSpacing: '-0.44px', lineHeight: '1.3' }}>
                      {s.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Table sections */}
              {tableSections.map((section, sIdx) => (
                <div key={section.title}>
                  {/* Section header */}
                  <div style={{ display: 'flex', background: 'rgba(0,0,0,0.04)', padding: '8px 16px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#364153', letterSpacing: '-0.44px' }}>
                      {section.title}
                    </span>
                  </div>

                  {/* Data rows */}
                  {section.rows.map((row, rowIdx) => {
                    const isLastRowInSection = rowIdx === section.rows.length - 1;
                    const isLastSection = sIdx === tableSections.length - 1;
                    return (
                      <div
                        key={row.label}
                        style={{
                          display: 'flex',
                          alignItems: 'stretch',
                          borderBottom: isLastRowInSection && isLastSection ? undefined : '1px solid rgba(0,0,0,0.06)',
                        }}
                      >
                        <div style={{ width: '186px', flexShrink: 0, padding: '9px 16px', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontSize: '13px', fontWeight: 400, color: '#505153', letterSpacing: '-0.44px' }}>
                            {row.label}
                          </span>
                        </div>
                        {SCENARIOS.map(s => (
                          <div
                            key={s.id}
                            style={{
                              flex: 1,
                              padding: '9px 12px',
                              background: s.isSelected ? 'rgba(54,65,83,0.04)' : undefined,
                              boxShadow: s.isSelected ? 'inset 1px 0 0 rgba(54,65,83,0.18), inset -1px 0 0 rgba(54,65,83,0.18)' : undefined,
                              display: 'flex',
                              alignItems: 'center',
                              borderLeft: s.isSelected ? undefined : '1px solid rgba(0,0,0,0.04)',
                            }}
                          >
                            <span style={{ fontSize: '13px', fontWeight: 400, color: '#364153', letterSpacing: '-0.44px', lineHeight: '1.4' }}>
                              {row.render(s)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* ── Scenario insight ── */}
            <div
              style={{
                marginTop: '20px',
                background: 'rgba(255,255,255,0.6)',
                borderRadius: '20px',
                padding: '18px 24px',
                boxSizing: 'border-box' as const,
              }}
            >
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 400, color: '#505153', letterSpacing: '-0.44px', lineHeight: '1.55' }}>
                <span style={{ fontWeight: 600, color: '#364153' }}>Scenario insight — </span>
                The selected scenario stays within budget while providing strong access continuity and broad resident protection. Higher protection offers more resilience but exceeds the current budget.
              </p>
            </div>

            {/* ── Continue button (disabled) ── */}
            <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={{
                  width: '223px',
                  height: '40px',
                  background: 'rgba(0,0,0,0.3)',
                  borderRadius: '100px',
                  border: 'none',
                  cursor: 'default',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: 'white',
                  letterSpacing: '-0.44px',
                }}
              >
                Continue
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
