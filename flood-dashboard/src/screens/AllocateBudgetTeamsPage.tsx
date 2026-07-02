import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import HomePageHeader from '../components/shared/HomePageHeader';
import { MEASURES } from './SimulateResponseScenariosPage';
import type { MeasureKey } from './SimulateResponseScenariosPage';
import { BudgetDonut, AVAILABLE_BUDGET, SELECTED_SCENARIO } from './CompareResponseScenariosPage';

interface Props {
  onBack: () => void;
  onContinue: () => void;
  map?: any;
}

// New territory — no existing team/department mock data anywhere in the
// codebase to reuse, so this is a small local dataset assigning a real-world
// owner to each protection measure already established in MEASURES.
const TEAM_ASSIGNMENTS: Record<MeasureKey, { dept: string; lead: string; capacity: 'Available' | 'Limited' }> = {
  seaWall: { dept: 'Coastal Engineering', lead: 'M. Alvarez', capacity: 'Available' },
  raisedRoads: { dept: 'Public Works', lead: 'D. Chen', capacity: 'Available' },
  elevatedBuildings: { dept: 'Urban Planning & Zoning', lead: 'R. Osei', capacity: 'Limited' },
  elevatedWalkways: { dept: 'Public Works', lead: 'D. Chen', capacity: 'Available' },
  drainageUpgrade: { dept: 'Water & Stormwater Utility', lead: 'S. Patel', capacity: 'Available' },
  utilityProtection: { dept: 'Electric Utility Authority', lead: 'J. Romero', capacity: 'Available' },
  residentSupport: { dept: 'Community Services', lead: 'L. Kim', capacity: 'Available' },
};

function formatCost(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

// Proportionally scale each measure's reference cost (from MEASURES) so the
// 7 line items sum to exactly the selected scenario's total — keeps the
// donut total and the per-measure breakdown internally consistent.
const RAW_TOTAL = MEASURES.reduce((s, m) => s + m.cost, 0);
const SCALE = SELECTED_SCENARIO.totalCostValue / RAW_TOTAL;

const remainLabel = formatCost(AVAILABLE_BUDGET - SELECTED_SCENARIO.totalCostValue);
const availLabel = formatCost(AVAILABLE_BUDGET);

function getRowStyle(isLast: boolean): React.CSSProperties {
  return {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '14px 20px',
    borderBottom: isLast ? undefined : '1px solid rgba(0,0,0,0.05)',
  };
}

export default function AllocateBudgetTeamsPage({ onBack, onContinue }: Props) {
  const [assigned, setAssigned] = useState<Record<MeasureKey, boolean>>(
    () => Object.fromEntries(MEASURES.map((m) => [m.key, false])) as Record<MeasureKey, boolean>
  );

  function toggleAssign(key: MeasureKey) {
    setAssigned((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const assignedCount = Object.values(assigned).filter(Boolean).length;

  return (
    <div className="screen-enter">
      <HomePageHeader />

      {/* Back arrow + title — sits directly over the map (same convention as
          CompareResponseScenariosPage). */}
      <div style={{ position: 'fixed', left: 32, top: 99, display: 'flex', alignItems: 'center', gap: 16, pointerEvents: 'auto' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
          <ArrowLeft size={26} color="white" />
        </button>
        <span style={{ fontSize: 22, fontWeight: 600, color: 'white', letterSpacing: '-0.44px', lineHeight: '26px' }}>
          Allocate Budget &amp; Teams
        </span>
      </div>

      {/* Large card floating over the map — same footprint as
          CompareResponseScenariosPage, not a narrow sidebar — this is a
          working/assignment screen, not a glanceable summary. */}
      <div
        className="glass-shadow"
        style={{
          position: 'fixed', left: 32, right: 32, top: 100, bottom: 32,
          background: 'rgba(255,255,255,0.92)', borderRadius: 20,
          padding: '24px 28px', boxSizing: 'border-box',
          display: 'flex', flexDirection: 'column', gap: 12,
          overflowY: 'auto', pointerEvents: 'auto',
        }}
      >
        {/* Top summary — same shape as Compare's budget/metrics row */}
        <div style={{
          background: 'white', borderRadius: 16,
          padding: '14px 20px', display: 'flex', alignItems: 'center',
          gap: 0, boxSizing: 'border-box', flexShrink: 0,
        }}>
          <div style={{ paddingRight: 28, marginRight: 28, borderRight: '1px solid rgba(0,0,0,0.08)' }}>
            <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 600, color: '#6b778a', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Budget Overview
            </p>
            <BudgetDonut
              usedPct={SELECTED_SCENARIO.budgetPct}
              costLabel={SELECTED_SCENARIO.totalCost}
              availLabel={availLabel}
              remainLabel={remainLabel}
            />
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            {[
              { label: 'Residents Protected', value: SELECTED_SCENARIO.residentsProtected.toLocaleString() },
              { label: 'Teams Assigned', value: `${assignedCount}/${MEASURES.length}` },
              { label: 'Implementation Time', value: SELECTED_SCENARIO.implementationTime },
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
              </div>
            ))}
          </div>
        </div>

        {/* Assignment table */}
        <div style={{ background: 'white', borderRadius: 20, overflow: 'hidden', flexShrink: 0 }}>
          {/* Column headers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
            <span style={{ width: 220, flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#6b778a', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Measure</span>
            <span style={{ width: 130, flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#6b778a', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Budget</span>
            <span style={{ flex: 1, fontSize: 11, fontWeight: 600, color: '#6b778a', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Department &amp; lead</span>
            <span style={{ width: 90, flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#6b778a', letterSpacing: '0.4px', textTransform: 'uppercase' }}>Capacity</span>
            <span style={{ width: 130, flexShrink: 0, fontSize: 11, fontWeight: 600, color: '#6b778a', letterSpacing: '0.4px', textTransform: 'uppercase', textAlign: 'right' }}>Assignment</span>
          </div>

          {MEASURES.map((m, i) => {
            const team = TEAM_ASSIGNMENTS[m.key];
            const isLimited = team.capacity === 'Limited';
            const isPartial = SELECTED_SCENARIO[m.key] === 'partial';
            const isAssigned = assigned[m.key];
            const allocated = m.cost * SCALE;

            return (
              <div key={m.key} style={getRowStyle(i === MEASURES.length - 1)}>
                {/* Measure */}
                <div style={{ width: 220, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#364153' }}>{m.label}</span>
                  {isPartial && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: '#b45309', letterSpacing: '0.3px', background: 'rgba(180,83,9,0.1)', borderRadius: 100, padding: '2px 6px', flexShrink: 0 }}>
                      PARTIAL
                    </span>
                  )}
                </div>

                {/* Budget */}
                <div style={{ width: 130, flexShrink: 0 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#364153' }}>{formatCost(allocated)}</span>
                </div>

                {/* Department & lead */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#505153' }}>{team.dept} · {team.lead}</span>
                </div>

                {/* Capacity */}
                <div style={{ width: 90, flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.3px',
                      borderRadius: 100, padding: '3px 8px',
                      color: isLimited ? '#b45309' : '#1f7a3a',
                      background: isLimited ? 'rgba(180,83,9,0.12)' : 'rgba(0,166,62,0.12)',
                    }}
                  >
                    {team.capacity.toUpperCase()}
                  </span>
                </div>

                {/* Assignment action */}
                <div style={{ width: 130, flexShrink: 0, display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => toggleAssign(m.key)}
                    style={{
                      height: 30, padding: '0 14px', borderRadius: 100, border: 'none', cursor: 'pointer',
                      fontSize: 12, fontWeight: 600,
                      background: isAssigned ? 'rgba(0,166,62,0.12)' : 'rgba(16,24,40,0.9)',
                      color: isAssigned ? '#1f7a3a' : 'white',
                      transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                  >
                    {isAssigned ? 'Assigned ✓' : 'Assign'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer — progress + final action */}
        <div style={{ marginTop: 'auto', paddingTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#6b778a' }}>
            {assignedCount} of {MEASURES.length} teams assigned
          </span>
          <button
            onClick={onContinue}
            style={{
              width: 223, height: 40,
              background: '#323232', borderRadius: 100, border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 500, color: 'white', letterSpacing: '-0.44px',
            }}
          >
            Launch action plan
          </button>
        </div>
      </div>
    </div>
  );
}
