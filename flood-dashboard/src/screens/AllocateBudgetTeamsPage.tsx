import { useState } from 'react';
import HomePageHeader from '../components/shared/HomePageHeader';
import { MEASURES } from './SimulateResponseScenariosPage';
import type { MeasureKey } from './SimulateResponseScenariosPage';
import { ChevronRight } from 'lucide-react';

// Zone accent colors — same as ZONE_ACCENT in AssessCriticalZonesPage
const MEASURE_ICON: Record<string, { icon: string; color: string }> = {
  seaWall:           { icon: '/icons/tab-water.svg',    color: '#2864e4' },
  raisedRoads:       { icon: '/icons/tab-car.svg',      color: '#ea7836' },
  elevatedBuildings: { icon: '/icons/tab-building.svg', color: '#bf5761' },
  elevatedWalkways:  { icon: '/icons/tab-car.svg',      color: '#ea7836' },
  drainageUpgrade:   { icon: '/icons/tab-water.svg',    color: '#2864e4' },
  utilityProtection: { icon: '/icons/tab-electric.svg', color: '#ffbb00' },
  residentSupport:   { icon: '/icons/tab-people.svg',   color: '#84af79' },
};

// Groups — mirrors the zones tab structure
const MEASURE_GROUPS: { icon: string; color: string; label: string; keys: MeasureKey[] }[] = [
  { icon: '/icons/tab-water.svg',    color: '#2864e4', label: 'Water Infrastructure', keys: ['seaWall', 'drainageUpgrade'] },
  { icon: '/icons/tab-car.svg',      color: '#ea7836', label: 'Transportation',        keys: ['raisedRoads', 'elevatedWalkways'] },
  { icon: '/icons/tab-building.svg', color: '#bf5761', label: 'Structures',            keys: ['elevatedBuildings'] },
  { icon: '/icons/tab-electric.svg', color: '#ffbb00', label: 'Utilities',             keys: ['utilityProtection'] },
  { icon: '/icons/tab-people.svg',   color: '#84af79', label: 'Community',             keys: ['residentSupport'] },
];

interface Props { onBack: () => void; onContinue: () => void; map?: any; }

interface Team {
  id: string; name: string; lead: string; initials: string;
  avatarGrad: [string, string]; exp: number; projects: number;
  capacity: number; specialty: string; limited?: boolean;
}

const TEAMS: Team[] = [
  { id: 'coastal',   name: 'Coastal Engineering',       lead: 'M. Alvarez',  initials: 'MA', avatarGrad: ['#1e40af','#3b82f6'], exp: 12, projects: 2, capacity: 0.65, specialty: 'Marine barriers & flood control' },
  { id: 'works',     name: 'Public Works',              lead: 'D. Chen',     initials: 'DC', avatarGrad: ['#5b21b6','#8b5cf6'], exp: 8,  projects: 3, capacity: 0.45, specialty: 'Roads, bridges & civil works' },
  { id: 'water',     name: 'Water & Stormwater',        lead: 'S. Patel',    initials: 'SP', avatarGrad: ['#155e75','#22d3ee'], exp: 15, projects: 1, capacity: 0.80, specialty: 'Drainage systems & hydrology' },
  { id: 'urban',     name: 'Urban Planning & Zoning',   lead: 'R. Osei',     initials: 'RO', avatarGrad: ['#92400e','#f59e0b'], exp: 9,  projects: 4, capacity: 0.28, specialty: 'Building codes & elevation zoning', limited: true },
  { id: 'electric',  name: 'Electric Utility Auth.',    lead: 'J. Romero',   initials: 'JR', avatarGrad: ['#14532d','#22c55e'], exp: 11, projects: 2, capacity: 0.70, specialty: 'Grid hardening & power systems' },
  { id: 'community', name: 'Community Services',        lead: 'L. Kim',      initials: 'LK', avatarGrad: ['#9d174d','#f472b6'], exp: 6,  projects: 1, capacity: 0.90, specialty: 'Resident programs & social outreach' },
  { id: 'emergency', name: 'Emergency Management',      lead: 'K. Williams', initials: 'KW', avatarGrad: ['#581c87','#a855f7'], exp: 14, projects: 0, capacity: 0.85, specialty: 'Crisis coordination & rapid response' },
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

const SUBTITLES: Record<MeasureKey, string> = {
  seaWall:           'Coastal barrier construction',
  raisedRoads:       'Road elevation & access',
  elevatedBuildings: 'Structural building elevation',
  elevatedWalkways:  'Elevated pedestrian pathways',
  drainageUpgrade:   'Stormwater drainage network',
  utilityProtection: 'Utility & grid hardening',
  residentSupport:   'Community & social programs',
};

const DESCRIPTIONS: Record<MeasureKey, string> = {
  seaWall:           'Build a permanent coastal barrier to block storm surge and tidal flooding along the exposed shoreline.',
  raisedRoads:       'Elevate key road corridors above the projected flood level to maintain emergency access during flood events.',
  elevatedBuildings: 'Raise critical municipal buildings above the 100-year flood elevation through structural modification.',
  elevatedWalkways:  'Construct elevated pedestrian pathways connecting residential zones and service hubs.',
  drainageUpgrade:   'Expand and upgrade the stormwater drainage network to handle extreme rainfall events.',
  utilityProtection: 'Harden electrical substations and utility lines against flood exposure and water intrusion.',
  residentSupport:   'Deploy outreach, temporary housing, financial aid, and support programs for affected residents.',
};

const GROUP_DESCRIPTIONS: Record<string, string> = {
  'Water Infrastructure': 'Coastal barriers and stormwater drainage to block surge and manage extreme rainfall.',
  'Transportation':       'Keep roads and walkways accessible above projected flood levels during emergencies.',
  'Structures':           'Raise critical municipal buildings above the 100-year flood elevation.',
  'Utilities':            'Harden substations and utility lines against flood exposure and water intrusion.',
  'Community':            'Outreach, temporary housing, and financial aid for residents in affected zones.',
};

const MAX_MONTHS = Math.max(...MEASURES.map(m => m.timeMax));
const LEFT_W = 386;

function Avatar({ team, size = 56 }: { team: Team; size?: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(145deg, ${team.avatarGrad[0]}, ${team.avatarGrad[1]})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: `0 3px 10px ${team.avatarGrad[1]}44`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', bottom: -size*0.1, left: '50%', transform: 'translateX(-50%)', width: size*0.54, height: size*0.54, borderRadius: '50%', background: 'rgba(255,255,255,0.13)' }} />
      <div style={{ position: 'absolute', bottom: size*0.22, left: '50%', transform: 'translateX(-50%)', width: size*0.28, height: size*0.28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
      <span style={{ fontSize: size*0.27, fontWeight: 700, color: 'white', letterSpacing: '0.3px', position: 'relative', zIndex: 1 }}>{team.initials}</span>
    </div>
  );
}

export default function AllocateBudgetTeamsPage({ onBack, onContinue }: Props) {
  // Assignments are per GROUP (one team handles all measures in a group)
  const [expanded, setExpanded] = useState<string | null>(MEASURE_GROUPS[0].label);
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    () => Object.fromEntries(MEASURE_GROUPS.map(g => [g.label, null]))
  );

  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const allDone = assignedCount === MEASURE_GROUPS.length;

  function pick(groupLabel: string, teamId: string) {
    setAssignments(p => ({ ...p, [groupLabel]: p[groupLabel] === teamId ? null : teamId }));
    setExpanded(null);
  }

  const expandedGroup = expanded ? MEASURE_GROUPS.find(g => g.label === expanded) ?? null : null;

  // Average match score across all measures in the group
  function groupScore(group: typeof MEASURE_GROUPS[0], teamId: string) {
    const scores = group.keys.map(k => MATCH[k][teamId] ?? 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  const top4 = expandedGroup
    ? [...TEAMS].sort((a, b) => groupScore(expandedGroup, b.id) - groupScore(expandedGroup, a.id)).slice(0, 4)
    : [];

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

      {/* Progress bar — step 4 active */}
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

      {/* Main card — expands right like AssessCriticalZonesPage */}
      <div className="glass-65 glass-shadow" style={{
        position: 'fixed', left: 16, top: 137, bottom: 32,
        width: expanded ? 'calc(100vw - 32px)' : LEFT_W,
        borderRadius: 16, pointerEvents: 'auto', zIndex: 10,
        display: 'flex', flexDirection: 'row', overflow: 'hidden',
        transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      }}>

        {/* ── Left column — always visible ── */}
        <div style={{ width: LEFT_W, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div style={{ padding: '14px 16px 12px' }}>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.44px', lineHeight: '28px' }}>
              Assign Teams & Tasks
            </span>
          </div>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '0 12px' }} />

          <p style={{ margin: '10px 16px 0', fontSize: 17, fontWeight: 500, color: '#6b7280', lineHeight: '24px', letterSpacing: '-0.44px' }}>
            Select one team per domain — they'll handle all tasks in that category.
          </p>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '10px 12px 0' }} />

          {/* Group cards — one per domain, click header to open team picker */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '6px 10px 8px' }}>
            {MEASURE_GROUPS.map(group => {
              const isOpen = expanded === group.label;
              const assignedTeam = assignments[group.label] ? TEAMS.find(t => t.id === assignments[group.label]) : null;
              return (
                <div key={group.label} style={{
                  background: 'rgba(255,255,255,0.65)',
                  borderRadius: 13, overflow: 'hidden', flexShrink: 0,
                  border: isOpen ? '1.5px solid rgba(0,0,0,0.13)' : '1px solid rgba(0,0,0,0.06)',
                  transition: 'border-color .15s',
                }}>
                  {/* Clickable group header with single ChevronRight */}
                  <div onClick={() => setExpanded(isOpen ? null : group.label)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '9px 12px', cursor: 'pointer',
                      background: isOpen ? 'rgba(0,0,0,0.025)' : undefined,
                    }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: group.color, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={group.icon} alt="" width={19} height={19} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.3px', lineHeight: '22px' }}>{group.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 400, color: assignedTeam ? '#00a63e' : '#6b7280', letterSpacing: '-0.2px', lineHeight: '19px' }}>
                        {assignedTeam ? `✓ ${assignedTeam.name}` : `${group.keys.length} task${group.keys.length > 1 ? 's' : ''}`}
                      </div>
                    </div>
                    <ChevronRight size={14} color="rgba(30,41,57,0.25)" strokeWidth={2}
                      style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }} />
                  </div>
                  {/* Task names — static, indented, no chevron */}
                  {group.keys.length > 1 && (
                    <div style={{ borderTop: '1px solid rgba(0,0,0,0.05)', padding: '5px 12px 6px', paddingLeft: 52 }}>
                      {group.keys.map(key => {
                        const m = MEASURES.find(mx => mx.key === key)!;
                        return (
                          <div key={key} style={{ fontSize: 14, fontWeight: 400, color: '#6b7280', lineHeight: '19px', letterSpacing: '-0.2px' }}>
                            · {m.label}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom buttons */}
          <div style={{ padding: '12px 16px 16px' }}>
            <button onClick={onContinue} style={{
              width: '100%', height: 44, borderRadius: 12,
              background: 'rgba(16,24,40,0.9)',
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'auto',
            }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: 'white', letterSpacing: '-0.3px' }}>
                {allDone ? 'Build Action Plan' : 'Build Action Plan'}
              </span>
            </button>
          </div>
        </div>

        {/* ── Right panel — team picker ── */}
        {expanded && expandedGroup && (
          <div style={{ flex: 1, borderLeft: '1px solid rgba(0,0,0,0.09)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Panel header — top-padding matches left subtitle Y position */}
            <div style={{ padding: '68px 24px 16px', borderBottom: '1px solid rgba(0,0,0,0.07)', flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 17, fontWeight: 500, color: '#6b7280', lineHeight: '24px', letterSpacing: '-0.44px' }}>
                {GROUP_DESCRIPTIONS[expandedGroup.label] ?? ''}
              </p>
            </div>

            {/* Team cards — 2×2 grid */}
            <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 12 }}>
              {top4.map((team, i) => {
                const score = groupScore(expandedGroup, team.id);
                const isPicked = assignments[expanded!] === team.id;
                const scoreColor = score >= 85 ? '#15803d' : score >= 65 ? '#92400e' : '#6b778a';
                const scoreBg   = score >= 85 ? 'rgba(0,166,62,0.1)' : score >= 65 ? 'rgba(234,179,8,0.1)' : 'rgba(0,0,0,0.05)';
                const capColor  = team.capacity < 0.35 ? '#ef4444' : team.capacity < 0.6 ? '#eab308' : '#00a63e';

                return (
                  <button key={team.id} onClick={() => pick(expandedGroup.label, team.id)}
                    style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      padding: '10px 10px 10px',
                      background: isPicked ? 'rgba(0,166,62,0.05)' : 'rgba(255,255,255,0.7)',
                      border: isPicked ? '2px solid rgba(0,166,62,0.4)' : i === 0 ? '1.5px solid rgba(0,0,0,0.12)' : '1.5px solid rgba(0,0,0,0.07)',
                      borderRadius: 14, cursor: 'pointer', textAlign: 'center',
                      transition: 'border-color .18s, background .18s',
                      position: 'relative',
                    }}>

                    {(i === 0 || isPicked) && (
                      <div style={{
                        position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                        background: isPicked ? '#00a63e' : '#1d4ed8',
                        color: 'white', fontSize: 9, fontWeight: 700,
                        borderRadius: '0 0 6px 6px', padding: '2px 10px', letterSpacing: '.3px',
                      }}>
                        {isPicked ? '✓ ASSIGNED' : 'BEST FIT'}
                      </div>
                    )}

                    <div style={{ marginTop: (i === 0 || isPicked) ? 10 : 0, marginBottom: 7 }}>
                      <Avatar team={team} size={44} />
                    </div>

                    <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#101828', letterSpacing: '-0.2px', lineHeight: '17px' }}>{team.name}</p>
                    <p style={{ margin: '2px 0 8px', fontSize: 11, color: '#6b7280' }}>{team.lead}</p>

                    <div style={{ background: scoreBg, borderRadius: 100, padding: '3px 10px', marginBottom: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 800, color: scoreColor }}>{score}%</span>
                      <span style={{ fontSize: 10, color: scoreColor, marginLeft: 3 }}>match</span>
                    </div>

                    <p style={{ margin: '0 0 7px', fontSize: 11, color: '#6b778a', lineHeight: '15px' }}>{team.specialty}</p>

                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 5, textAlign: 'left' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>Experience</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#364153' }}>{team.exp} yrs</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>Active projects</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: team.projects >= 4 ? '#b45309' : '#364153' }}>{team.projects}</span>
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>Availability</span>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#364153' }}>{Math.round(team.capacity * 100)}%</span>
                        </div>
                        <div style={{ height: 4, borderRadius: 2, background: 'rgba(0,0,0,0.08)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${team.capacity * 100}%`, background: capColor, borderRadius: 2 }} />
                        </div>
                      </div>
                      {team.limited && (
                        <span style={{ marginTop: 2, fontSize: 10, fontWeight: 700, color: '#b45309', background: 'rgba(180,83,9,0.08)', borderRadius: 5, padding: '2px 7px', alignSelf: 'flex-start' }}>LIMITED CAPACITY</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
