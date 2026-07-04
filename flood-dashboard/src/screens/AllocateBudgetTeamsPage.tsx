import { useState } from 'react';
import HomePageHeader from '../components/shared/HomePageHeader';
import { MEASURES } from './SimulateResponseScenariosPage';
import type { MeasureKey } from './SimulateResponseScenariosPage';
import { SELECTED_SCENARIO } from './CompareResponseScenariosPage';

interface Props { onBack: () => void; onContinue: () => void; map?: any; }

interface Team {
  id: string; name: string; lead: string; initials: string;
  avatarGrad: [string, string]; exp: number; projects: number;
  capacity: number; tags: string[]; limited?: boolean;
}

const TEAMS: Team[] = [
  { id: 'coastal',   name: 'Coastal Engineering',        lead: 'M. Alvarez',  initials: 'MA', avatarGrad: ['#1e40af','#3b82f6'], exp: 12, projects: 2,  capacity: 0.65, tags: ['Marine barriers','Flood control','Hydrology'] },
  { id: 'works',     name: 'Public Works',               lead: 'D. Chen',     initials: 'DC', avatarGrad: ['#5b21b6','#8b5cf6'], exp: 8,  projects: 3,  capacity: 0.45, tags: ['Roads & bridges','Civil works','Excavation'] },
  { id: 'water',     name: 'Water & Stormwater',         lead: 'S. Patel',    initials: 'SP', avatarGrad: ['#155e75','#22d3ee'], exp: 15, projects: 1,  capacity: 0.80, tags: ['Drainage systems','Pipe networks','Hydrology'] },
  { id: 'urban',     name: 'Urban Planning & Zoning',    lead: 'R. Osei',     initials: 'RO', avatarGrad: ['#92400e','#f59e0b'], exp: 9,  projects: 4,  capacity: 0.28, tags: ['Building codes','Structural elevation','Zoning'], limited: true },
  { id: 'electric',  name: 'Electric Utility Auth.',     lead: 'J. Romero',   initials: 'JR', avatarGrad: ['#14532d','#22c55e'], exp: 11, projects: 2,  capacity: 0.70, tags: ['Grid hardening','Substation protection','Power'] },
  { id: 'community', name: 'Community Services',         lead: 'L. Kim',      initials: 'LK', avatarGrad: ['#9d174d','#f472b6'], exp: 6,  projects: 1,  capacity: 0.90, tags: ['Resident programs','Social support','Outreach'] },
  { id: 'emergency', name: 'Emergency Management',       lead: 'K. Williams', initials: 'KW', avatarGrad: ['#581c87','#a855f7'], exp: 14, projects: 0,  capacity: 0.85, tags: ['Crisis coordination','Rapid response','Logistics'] },
];

const MATCH: Record<MeasureKey, Record<string, number>> = {
  seaWall:           { coastal:97, works:54, water:70, urban:44, electric:38, community:21, emergency:66 },
  raisedRoads:       { coastal:55, works:93, water:67, urban:62, electric:43, community:29, emergency:71 },
  elevatedBuildings: { coastal:41, works:64, water:37, urban:95, electric:39, community:27, emergency:54 },
  elevatedWalkways:  { coastal:47, works:89, water:54, urban:71, electric:41, community:34, emergency:59 },
  drainageUpgrade:   { coastal:57, works:71, water:96, urban:39, electric:54, community:24, emergency:62 },
  utilityProtection: { coastal:39, works:54, water:61, urban:34, electric:94, community:19, emergency:57 },
  residentSupport:   { coastal:24, works:37, water:29, urban:44, electric:31, community:97, emergency:80 },
};

const DESCRIPTIONS: Record<MeasureKey, string> = {
  seaWall:           'Build a permanent coastal barrier to block storm surge and tidal flooding along the exposed shoreline. Requires heavy marine construction and environmental permits.',
  raisedRoads:       'Elevate key road corridors above the projected flood level to ensure emergency access and continuity of services during flood events.',
  elevatedBuildings: 'Raise critical municipal buildings — shelters, clinics, utility hubs — above the 100-year flood elevation through structural modification.',
  elevatedWalkways:  'Construct elevated pedestrian pathways connecting residential zones and service hubs to ensure safe movement during partial flooding.',
  drainageUpgrade:   'Expand and upgrade the stormwater drainage network to handle extreme rainfall events without surcharging or backing up into streets.',
  utilityProtection: 'Harden electrical substations, relay stations, and water treatment facilities against flood exposure and water intrusion.',
  residentSupport:   'Deploy community outreach, temporary housing assistance, financial aid programs, and mental health services for flood-affected residents.',
};

const RAW_TOTAL = MEASURES.reduce((s, m) => s + m.cost, 0);
const SCALE = SELECTED_SCENARIO.totalCostValue / RAW_TOTAL;

function Avatar({ team, size = 72 }: { team: Team; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(145deg, ${team.avatarGrad[0]}, ${team.avatarGrad[1]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 4px 16px ${team.avatarGrad[1]}55`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', bottom: -size * 0.08, left: '50%', transform: 'translateX(-50%)', width: size * 0.55, height: size * 0.55, borderRadius: '50%', background: 'rgba(255,255,255,0.18)' }} />
      <div style={{ position: 'absolute', bottom: size * 0.22, left: '50%', transform: 'translateX(-50%)', width: size * 0.32, height: size * 0.32, borderRadius: '50%', background: 'rgba(255,255,255,0.25)' }} />
      <span style={{ fontSize: size * 0.28, fontWeight: 700, color: 'white', letterSpacing: '1px', zIndex: 1, position: 'relative' }}>{team.initials}</span>
    </div>
  );
}

function Stars({ score }: { score: number }) {
  const filled = Math.round(score / 20);
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i} style={{ fontSize: 12, color: i <= filled ? '#f59e0b' : '#e5e7eb' }}>★</span>
      ))}
    </div>
  );
}

export default function AllocateBudgetTeamsPage({ onBack, onContinue }: Props) {
  const [step, setStep] = useState(0);
  const [assignments, setAssignments] = useState<Record<MeasureKey, string | null>>(
    () => Object.fromEntries(MEASURES.map(m => [m.key, null])) as Record<MeasureKey, string | null>
  );

  const measure = MEASURES[step];
  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const allDone = assignedCount === MEASURES.length;
  const currentTeamId = assignments[measure.key];
  const budget = measure.cost * SCALE;
  const sortedTeams = [...TEAMS].sort((a, b) => (MATCH[measure.key][b.id] ?? 0) - (MATCH[measure.key][a.id] ?? 0));

  function pick(teamId: string) {
    setAssignments(p => ({ ...p, [measure.key]: p[measure.key] === teamId ? null : teamId }));
  }

  return (
    <div className="screen-enter">
      <HomePageHeader />

      <button onClick={onBack} style={{
        position: 'fixed', left: 16, top: 93, width: 36, height: 36, zIndex: 30,
        background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(12px)',
        border: 'none', borderRadius: '50%', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
      }}>
        <span style={{ fontSize: 17, color: '#1e2939' }}>←</span>
      </button>

      {/* Progress bar */}
      <div className="glass-65 glass-shadow" style={{
        position: 'fixed', top: 93, left: 60, right: 16, height: 36,
        borderRadius: 18, overflow: 'hidden', pointerEvents: 'none', zIndex: 20,
      }}>
        <svg width="100%" height="100%" viewBox="0 0 1426 36" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, display: 'block' }}>
          <polygon points="0,0 284,0 298,18 284,36 0,36"               fill="rgba(30,41,57,0.25)" />
          <polygon points="284,0 566,0 580,18 566,36 284,36 298,18"    fill="rgba(30,41,57,0.25)" />
          <polygon points="566,0 848,0 862,18 848,36 566,36 580,18"    fill="rgba(30,41,57,0.25)" />
          <polygon points="848,0 1130,0 1144,18 1130,36 848,36 862,18" fill="#1e2939" />
          {[284,566,848,1130].map(x => (
            <path key={x} d={`M${x},0 L${x+14},18 L${x},36`} stroke="rgba(30,41,57,0.3)" strokeWidth="1.5" fill="none"
              style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          ))}
        </svg>
        {[
          { label: 'Assess critical zones', pct: '0%', w: '20.90%' },
          { label: 'Simulate response scenarios', pct: '20.90%', w: '19.77%' },
          { label: 'Compare intervention options', pct: '40.67%', w: '19.77%' },
          { label: 'Assign Teams & Tasks', pct: '60.45%', w: '19.77%', active: true },
          { label: 'Launch action plan', pct: '80.22%', w: '19.78%' },
        ].map(s => (
          <div key={s.label} style={{ position: 'absolute', left: s.pct, top: 0, width: s.w, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
            <span style={{ fontSize: 13, fontWeight: (s as any).active ? 600 : 500, color: (s as any).active ? 'white' : '#101828', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '-0.2px' }}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="glass-shadow" style={{
        position: 'fixed', left: 16, right: 16, top: 137, bottom: 32,
        background: 'rgba(255,255,255,0.93)', borderRadius: 20,
        display: 'flex', overflow: 'hidden',
        pointerEvents: 'auto', zIndex: 10,
      }}>

        {/* ── LEFT — measure detail ── */}
        <div style={{
          width: 320, flexShrink: 0, display: 'flex', flexDirection: 'column',
          borderRight: '1px solid rgba(0,0,0,0.07)',
          borderLeft: `4px solid ${measure.color}`,
        }}>
          {/* Step dots */}
          <div style={{ padding: '18px 22px 0', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            {MEASURES.map((m, i) => {
              const done = !!assignments[m.key]; const cur = i === step;
              return (
                <button key={m.key} onClick={() => setStep(i)} style={{
                  width: cur ? 22 : 8, height: 8, borderRadius: 4, border: 'none', cursor: 'pointer', padding: 0,
                  background: cur ? measure.color : done ? '#00a63e' : 'rgba(0,0,0,0.12)',
                  transition: 'all 0.25s',
                }} />
              );
            })}
            <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, marginLeft: 2 }}>{step + 1}/{MEASURES.length}</span>
          </div>

          {/* Measure content */}
          <div style={{ flex: 1, padding: '18px 22px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto' }}>
            {/* Icon + name */}
            <div>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${measure.color}18`, border: `1.5px solid ${measure.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', background: measure.color }} />
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#101828', letterSpacing: '-0.5px', lineHeight: '26px' }}>
                {measure.label}
              </p>
              <p style={{ margin: '10px 0 0', fontSize: 13, color: '#6b7280', lineHeight: '20px', letterSpacing: '-0.15px' }}>
                {DESCRIPTIONS[measure.key]}
              </p>
            </div>

            {/* Budget + duration */}
            <div style={{ display: 'flex', gap: 10 }}>
              {[
                { label: 'Budget', value: `$${(budget / 1_000_000).toFixed(1)}M` },
                { label: 'Duration', value: `${measure.timeMax} months` },
              ].map(({ label, value }) => (
                <div key={label} style={{ flex: 1, background: 'rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.07)', borderRadius: 10, padding: '10px 12px' }}>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 700, color: '#9ca3af', letterSpacing: '.4px', textTransform: 'uppercase' }}>{label}</p>
                  <p style={{ margin: '4px 0 0', fontSize: 16, fontWeight: 700, color: '#1e2939', letterSpacing: '-0.3px' }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Assigned team */}
            {currentTeamId ? (() => {
              const t = TEAMS.find(t => t.id === currentTeamId)!;
              return (
                <div style={{ background: 'rgba(0,166,62,0.06)', border: '1.5px solid rgba(0,166,62,0.22)', borderRadius: 12, padding: '12px 14px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: 10, fontWeight: 700, color: '#15803d', letterSpacing: '.4px', textTransform: 'uppercase' }}>Assigned team</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar team={t} size={36} />
                    <div>
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#1e2939' }}>{t.name}</p>
                      <p style={{ margin: '1px 0 0', fontSize: 11, color: '#6b778a' }}>{t.lead}</p>
                    </div>
                    <span style={{ marginLeft: 'auto', fontSize: 18, color: '#00a63e' }}>✓</span>
                  </div>
                </div>
              );
            })() : (
              <div style={{ border: '1.5px dashed rgba(0,0,0,0.12)', borderRadius: 12, padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#c4c9d2' }}>No team assigned</p>
              </div>
            )}
          </div>

          {/* Nav */}
          <div style={{ padding: '14px 22px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
              style={{ flex: 1, height: 38, borderRadius: 100, border: '1.5px solid rgba(0,0,0,0.1)', background: 'white', cursor: step === 0 ? 'default' : 'pointer', color: step === 0 ? '#d1d5db' : '#364153', fontSize: 13, fontWeight: 500 }}>
              ← Prev
            </button>
            {step < MEASURES.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)}
                style={{ flex: 1, height: 38, borderRadius: 100, border: 'none', background: '#1e2939', color: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                Next →
              </button>
            ) : (
              <button onClick={onContinue} disabled={!allDone}
                style={{ flex: 1, height: 38, borderRadius: 100, border: 'none', background: allDone ? '#101828' : 'rgba(16,24,40,0.2)', color: 'white', cursor: allDone ? 'pointer' : 'default', fontSize: 13, fontWeight: 600, transition: 'background .3s' }}>
                {allDone ? 'Launch →' : `${MEASURES.length - assignedCount} left`}
              </button>
            )}
          </div>
        </div>

        {/* ── RIGHT — team cards ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Header */}
          <div style={{ padding: '18px 24px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)', flexShrink: 0 }}>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.35px' }}>
              Choose a team for this measure
            </p>
            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6b7280' }}>
              City department teams · ranked by expertise match
            </p>
          </div>

          {/* Horizontal scrollable team cards */}
          <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: 12, padding: '16px 20px', alignItems: 'stretch' }}>
            {sortedTeams.map((team, i) => {
              const score = MATCH[measure.key][team.id] ?? 0;
              const isPicked = currentTeamId === team.id;
              const scoreColor = score >= 85 ? '#15803d' : score >= 65 ? '#92400e' : '#6b778a';
              const scoreBg = score >= 85 ? 'rgba(0,166,62,0.1)' : score >= 65 ? 'rgba(234,179,8,0.1)' : 'rgba(0,0,0,0.05)';
              const capColor = team.capacity < 0.35 ? '#ef4444' : team.capacity < 0.6 ? '#eab308' : '#00a63e';

              return (
                <button key={team.id} onClick={() => pick(team.id)}
                  style={{
                    flexShrink: 0, width: 196, display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 0, padding: '20px 16px 16px',
                    background: isPicked ? 'rgba(0,166,62,0.04)' : 'white',
                    border: isPicked ? '2px solid rgba(0,166,62,0.45)' : i === 0 ? '2px solid rgba(0,0,0,0.1)' : '1.5px solid rgba(0,0,0,0.07)',
                    borderRadius: 18, cursor: 'pointer', textAlign: 'center',
                    transition: 'border-color .18s, background .18s',
                    position: 'relative',
                  }}>

                  {/* Best fit / assigned badge */}
                  {(i === 0 || isPicked) && (
                    <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: isPicked ? '#00a63e' : '#1d4ed8', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: '0 0 8px 8px', padding: '3px 10px', letterSpacing: '.2px' }}>
                      {isPicked ? '✓ ASSIGNED' : 'BEST FIT'}
                    </div>
                  )}
                  {team.limited && !isPicked && i !== 0 && (
                    <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#b45309', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: '0 0 8px 8px', padding: '3px 10px' }}>
                      LIMITED
                    </div>
                  )}

                  {/* Avatar */}
                  <div style={{ marginBottom: 12, marginTop: 8 }}>
                    <Avatar team={team} size={72} />
                  </div>

                  {/* Name + lead */}
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#101828', letterSpacing: '-0.2px', lineHeight: '17px' }}>{team.name}</p>
                  <p style={{ margin: '3px 0 10px', fontSize: 11, color: '#6b7280' }}>{team.lead}</p>

                  {/* Match score */}
                  <div style={{ background: scoreBg, borderRadius: 100, padding: '4px 12px', marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{score}%</span>
                    <span style={{ fontSize: 11, color: scoreColor, marginLeft: 3 }}>match</span>
                  </div>
                  <Stars score={score} />

                  {/* Divider */}
                  <div style={{ width: '100%', height: 1, background: 'rgba(0,0,0,0.06)', margin: '12px 0' }} />

                  {/* Stats */}
                  <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Experience</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#364153' }}>{team.exp} yrs</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Active projects</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: team.projects >= 4 ? '#b45309' : '#364153' }}>{team.projects}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 500 }}>Availability</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 44, height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${team.capacity * 100}%`, background: capColor, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 11, fontWeight: 600, color: '#6b778a' }}>{Math.round(team.capacity * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Specialty tags */}
                  <div style={{ width: '100%', display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10, justifyContent: 'center' }}>
                    {team.tags.map(tag => (
                      <span key={tag} style={{ fontSize: 10, fontWeight: 600, color: '#364153', background: 'rgba(0,0,0,0.05)', borderRadius: 6, padding: '2px 7px', whiteSpace: 'nowrap' }}>{tag}</span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
