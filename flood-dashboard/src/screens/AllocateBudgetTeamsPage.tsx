import { useState, useEffect } from 'react';
import HomePageHeader from '../components/shared/HomePageHeader';
import { MEASURES } from './SimulateResponseScenariosPage';
import type { MeasureKey } from './SimulateResponseScenariosPage';
import { ChevronRight, Clock, Users, Briefcase } from 'lucide-react';

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
const MEASURE_GROUPS: { icon: string; color: string; label: string; keys: MeasureKey[]; teamCount: number }[] = [
  { icon: '/icons/tab-water.svg',    color: '#2864e4', label: 'Water Infrastructure', keys: ['seaWall', 'drainageUpgrade'],       teamCount: 4 },
  { icon: '/icons/tab-car.svg',      color: '#ea7836', label: 'Transportation',        keys: ['raisedRoads', 'elevatedWalkways'],  teamCount: 4 },
  { icon: '/icons/tab-building.svg', color: '#bf5761', label: 'Structures',            keys: ['elevatedBuildings'],                teamCount: 3 },
  { icon: '/icons/tab-electric.svg', color: '#ffbb00', label: 'Utilities',             keys: ['utilityProtection'],                teamCount: 4 },
  { icon: '/icons/tab-people.svg',   color: '#84af79', label: 'Community',             keys: ['residentSupport'],                  teamCount: 2 },
];

interface Props { onBack: () => void; onContinue: () => void; map?: any; }

interface Team {
  id: string; name: string; lead: string; initials: string;
  avatarGrad: [string, string]; exp: number; members: number;
  cityProjects: number; specialty: string; limited?: boolean;
  details: string[];
}

const TEAMS: Team[] = [
  { id: 'coastal',   name: 'Coastal Engineering',       lead: 'M. Alvarez',  initials: 'MA', avatarGrad: ['#1e40af','#3b82f6'], exp: 12, members: 8,  cityProjects: 4,  specialty: 'Marine barriers & flood control',     details: ['Seawall & breakwater design certified', 'FEMA floodplain management accreditation', '3 completed coastal barrier projects in FL', 'Real-time storm surge monitoring integration'] },
  { id: 'works',     name: 'Public Works',              lead: 'D. Chen',     initials: 'DC', avatarGrad: ['#5b21b6','#8b5cf6'], exp: 8,  members: 14, cityProjects: 26, specialty: 'Roads, bridges & civil works',           details: ['FDOT-certified road elevation planning', 'Bridge load rating & structural assessment', 'Active contracts in 3 Miami-Dade districts', 'Emergency access corridor prioritization'] },
  { id: 'water',     name: 'Water & Stormwater',        lead: 'S. Patel',    initials: 'SP', avatarGrad: ['#155e75','#22d3ee'], exp: 15, members: 6,  cityProjects: 14, specialty: 'Drainage systems & hydrology',          details: ['Green infrastructure & bioretention design', 'SWFWMD stormwater management permit holder', 'Pump station capacity modeling', 'GIS-based flood routing analysis'] },
  { id: 'urban',     name: 'Urban Planning & Zoning',   lead: 'R. Osei',     initials: 'RO', avatarGrad: ['#92400e','#f59e0b'], exp: 9,  members: 5,  cityProjects: 8,  specialty: 'Building codes & elevation zoning',    details: ['FEMA FIRM map amendment specialist', 'Miami 21 zoning code expertise', 'Currently supporting 4 active permit reviews', 'Elevation certificate processing & compliance'], limited: true },
  { id: 'electric',  name: 'Electric Utility Auth.',    lead: 'J. Romero',   initials: 'JR', avatarGrad: ['#14532d','#22c55e'], exp: 11, members: 9,  cityProjects: 19, specialty: 'Grid hardening & power systems',        details: ['Substation flood-proofing to NERC CIP standards', 'Underground cable transition planning', 'Smart grid resilience upgrades', 'Generator placement & fuel logistics coordination'] },
  { id: 'community', name: 'Community Services',        lead: 'L. Kim',      initials: 'LK', avatarGrad: ['#9d174d','#f472b6'], exp: 6,  members: 14, cityProjects: 31, specialty: 'Resident programs & social outreach',  details: ['Multi-language outreach in 5 languages', 'FEMA Individual Assistance program liaison', 'Temporary housing placement & case management', 'Community resilience hub operations'] },
  { id: 'emergency', name: 'Emergency Management',      lead: 'K. Williams', initials: 'KW', avatarGrad: ['#581c87','#a855f7'], exp: 14, members: 7,  cityProjects: 9,  specialty: 'Crisis coordination & rapid response',  details: ['NIMS/ICS certified command structure', 'Miami-Dade EOC integration & liaison', 'Pre-positioned equipment in 2 staging areas', '24/7 on-call rapid deployment roster'] },
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

const PANEL_FADE_STYLE = `@keyframes panelFadeIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }`;

export default function AllocateBudgetTeamsPage({ onBack, onContinue }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredAssign, setHoveredAssign] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    const t = setTimeout(() => setExpanded(MEASURE_GROUPS[0].label), 1000);
    return () => clearTimeout(t);
  }, []);
  const [assignments, setAssignments] = useState<Record<string, string | null>>(
    () => Object.fromEntries(MEASURE_GROUPS.map(g => [g.label, null]))
  );

  const assignedCount = Object.values(assignments).filter(Boolean).length;
  const allDone = assignedCount === MEASURE_GROUPS.length;

  function pick(groupLabel: string, teamId: string) {
    setAssignments(p => ({ ...p, [groupLabel]: p[groupLabel] === teamId ? null : teamId }));
    setTimeout(() => setExpanded(null), 500);
  }

  const expandedGroup = expanded ? MEASURE_GROUPS.find(g => g.label === expanded) ?? null : null;

  // Average match score across all measures in the group
  function groupScore(group: typeof MEASURE_GROUPS[0], teamId: string) {
    const scores = group.keys.map(k => MATCH[k][teamId] ?? 0);
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }

  const topTeams = expandedGroup
    ? [...TEAMS].sort((a, b) => groupScore(expandedGroup, b.id) - groupScore(expandedGroup, a.id)).slice(0, expandedGroup.teamCount)
    : [];

  return (
    <div className="screen-enter">
      <style>{PANEL_FADE_STYLE}</style>
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
        transition: 'width 0.65s cubic-bezier(0.16, 1, 0.3, 1)',
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
            Your active city-contracted teams. Select one per domain to lead this flood response.
          </p>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '10px 12px 0' }} />

          {/* Group cards — one per domain, click header to open team picker */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, padding: '6px 10px 8px' }}>
            {MEASURE_GROUPS.map(group => {
              const isOpen = expanded === group.label;
              const assignedTeam = assignments[group.label] ? TEAMS.find(t => t.id === assignments[group.label]) : null;
              return (
                <div key={group.label} style={{
                  flexShrink: 0, borderRadius: 10,
                  background: isOpen ? 'rgba(0,0,0,0.04)' : undefined,
                  transition: 'background .15s',
                }}>
                  {/* Clickable group header */}
                  <div onClick={() => setExpanded(isOpen ? null : group.label)}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 8px', cursor: 'pointer' }}>
                    <img src={group.icon} alt="" width={32} height={32} style={{ flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 18, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.3px', lineHeight: '22px' }}>{group.label}</div>
                      {assignedTeam ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <div style={{ width: 7, height: 7, borderRadius: '50%', background: group.color, flexShrink: 0 }} />
                          <span style={{ fontSize: 16, fontWeight: 400, color: '#364153', letterSpacing: '-0.2px', lineHeight: '20px' }}>
                            {assignedTeam.name}
                          </span>
                        </div>
                      ) : group.keys.length === 1 ? (
                        <div style={{ fontSize: 16, fontWeight: 400, color: '#6b7280', letterSpacing: '-0.2px', lineHeight: '20px' }}>
                          {SUBTITLES[group.keys[0] as MeasureKey]}
                        </div>
                      ) : null}
                    </div>
                    <ChevronRight size={14} color="rgba(30,41,57,0.25)" strokeWidth={2}
                      style={{ flexShrink: 0, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s ease' }} />
                  </div>
                  {/* 2-task groups — inside the same frame */}
                  {group.keys.length > 1 && (
                    <div style={{ margin: '0 8px 7px 50px' }}>
                      {group.keys.map((key, idx) => (
                        <div key={key} style={{
                          display: 'flex', alignItems: 'center', gap: 7,
                          padding: '4px 0',
                          borderTop: idx > 0 ? '1px solid rgba(0,0,0,0.06)' : undefined,
                        }}>
                          <div style={{ fontSize: 15, fontWeight: 400, color: '#6b7280', letterSpacing: '-0.2px', lineHeight: '19px' }}>
                            {SUBTITLES[key as MeasureKey]}
                          </div>
                        </div>
                      ))}
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
                Done
              </span>
            </button>
          </div>
        </div>

        {/* ── Right panel — team picker ── */}
        {expanded && expandedGroup && (
          <div style={{ flex: 1, borderLeft: '1px solid rgba(0,0,0,0.09)', overflow: 'auto', display: 'flex', flexDirection: 'column',
            animation: 'panelFadeIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) both' }}>

            {/* Cards area — aligned with left panel group cards (~130px from top) */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', padding: '130px 28px 28px' }}>
              <div style={{ display: 'flex', flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
                {(() => {
                  const anyPicked = assignments[expanded!] !== null;
                  return topTeams.map((team, i) => {
                  const score = groupScore(expandedGroup, team.id);
                  const isPicked = assignments[expanded!] === team.id;
                  const capColor = team.capacity < 0.35 ? '#ef4444' : team.capacity < 0.6 ? '#eab308' : '#00a63e';
                  const isBest = i === 0;
                  const stars = Math.round(score / 20);
                  const isHovered = hoveredCard === team.id;
                  const isCardExpanded = expandedCards.has(team.id);
                  const isDimmed = anyPicked && !isPicked;

                  return (
                    <div key={team.id}
                      onMouseEnter={() => setHoveredCard(team.id)}
                      onMouseLeave={() => setHoveredCard(null)}
                      style={{
                        flex: 1, display: 'flex', flexDirection: 'column',
                        background: isPicked ? 'white' : isHovered ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.75)',
                        border: isPicked ? '2px solid #1e2939' : isHovered ? '1.5px solid rgba(30,41,57,0.22)' : '1.5px solid rgba(0,0,0,0.1)',
                        borderRadius: 18, position: 'relative',
                        transition: 'border-color .18s, background .18s, box-shadow .18s, transform .18s, opacity .3s',
                        boxShadow: isPicked ? '0 8px 28px rgba(0,0,0,0.16)' : isHovered ? '0 6px 22px rgba(0,0,0,0.13)' : '0 2px 8px rgba(0,0,0,0.07)',
                        transform: isHovered && !isPicked ? 'translateY(-3px)' : 'translateY(0)',
                        backdropFilter: 'blur(8px)', overflow: 'hidden',
                        opacity: isDimmed ? 0.25 : 1,
                      }}>

                      {/* Badge — centered, attached to card top edge */}
                      {(isBest || isPicked) && (
                        <div style={{
                          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                          background: isPicked ? '#00a63e' : '#1d4ed8',
                          color: 'white', fontSize: 10, fontWeight: 700, letterSpacing: '0.4px',
                          borderRadius: '0 0 10px 10px', padding: '3px 14px',
                          zIndex: 10, whiteSpace: 'nowrap',
                        }}>
                          {isPicked ? '✓ ASSIGNED' : 'BEST MATCH'}
                        </div>
                      )}

                      {/* ── Photo zone ── fixed 120px */}
                      <button onClick={() => pick(expandedGroup.label, team.id)}
                        style={{
                          height: 120, flexShrink: 0, position: 'relative', overflow: 'hidden',
                          background: `linear-gradient(150deg, ${team.avatarGrad[0]} 0%, ${team.avatarGrad[1]} 100%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          border: 'none', cursor: 'pointer', padding: 0, width: '100%',
                        }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%, rgba(255,255,255,0.18) 0%, transparent 70%)' }} />
                        <div style={{
                          width: 70, height: 70, borderRadius: '50%', position: 'relative', zIndex: 1,
                          background: 'rgba(255,255,255,0.18)',
                          border: isPicked ? '3px solid white' : '2.5px solid rgba(255,255,255,0.5)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: isPicked ? '0 0 0 3px rgba(255,255,255,0.35), 0 4px 18px rgba(0,0,0,0.2)' : '0 4px 18px rgba(0,0,0,0.2)',
                          transition: 'border .18s, box-shadow .18s',
                        }}>
                          <span style={{ fontSize: 22, fontWeight: 700, color: 'white', letterSpacing: '0.5px' }}>
                            {team.initials}
                          </span>
                          {isPicked && (
                            <div style={{
                              position: 'absolute', bottom: -2, right: -2,
                              width: 22, height: 22, borderRadius: '50%',
                              background: '#1e2939', border: '2px solid white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                              <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                                <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>

                      {/* ── Info zone ── flex:1 so all cards stretch to same height */}
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '13px 14px 13px' }}>

                        {/* Name — own row */}
                        <p style={{ margin: '0 0 5px', fontSize: 17, fontWeight: 700, color: '#101828', letterSpacing: '-0.3px', lineHeight: '22px' }}>
                          {team.name}
                        </p>

                        {/* Stars — own row below name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginBottom: 7 }}>
                          {[1,2,3,4,5].map(s => (
                            <span key={s} style={{ fontSize: 15, lineHeight: 1, color: s <= stars ? '#f59e0b' : 'rgba(0,0,0,0.14)' }}>
                              {s <= stars ? '★' : '☆'}
                            </span>
                          ))}
                          <span style={{ fontSize: 13, color: '#9ca3af', marginLeft: 3 }}>{score}%</span>
                        </div>

                        {/* Lead */}
                        <p style={{ margin: '0 0 6px', fontSize: 15, color: '#6b778a', letterSpacing: '-0.2px' }}>
                          {team.lead}
                        </p>

                        {/* Specialty */}
                        <p style={{ margin: '0 0 12px', fontSize: 15, color: '#6b778a', lineHeight: '20px', letterSpacing: '-0.2px' }}>
                          {team.specialty}
                        </p>

                        {/* Feature checklist — Lucide icons in rounded-rect frames */}
                        <div style={{ borderTop: '1px solid rgba(0,0,0,0.07)', paddingTop: 10, display: 'flex', flexDirection: 'column', gap: 9, marginBottom: 12 }}>
                          {[
                            { Icon: Clock,    text: `${team.exp} yrs experience`,         color: undefined },
                            { Icon: Users,    text: `${team.members} team members`,        color: undefined },
                            { Icon: Briefcase, text: `${team.cityProjects} projects for the city`, color: undefined },
                          ].map(({ Icon, text, color }) => (
                            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                              <div style={{
                                width: 24, height: 22, borderRadius: 7, flexShrink: 0,
                                background: color ? `${color}0f` : 'rgba(30,41,57,0.07)',
                                border: `1px solid ${color ? `${color}25` : 'rgba(30,41,57,0.11)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                                <Icon size={12} color={color ?? '#364153'} strokeWidth={2} />
                              </div>
                              <span style={{ fontSize: 15, color: color ?? '#364153', fontWeight: color ? 600 : 400, letterSpacing: '-0.2px' }}>
                                {text}
                              </span>
                              {team.limited && text.includes('projects for the city') && (
                                <span style={{ fontSize: 9, fontWeight: 700, color: '#b45309', background: 'rgba(180,83,9,0.08)', borderRadius: 4, padding: '1px 5px', marginLeft: 2 }}>
                                  BUSY
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Read more toggle — right after checklist */}
                        <button onClick={() => setExpandedCards(prev => { const s = new Set(prev); isCardExpanded ? s.delete(team.id) : s.add(team.id); return s; })}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer', padding: '2px 0 16px',
                            display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                          <span style={{ fontSize: 14, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.1px', borderBottom: '1.5px solid #1e2939', paddingBottom: 1 }}>
                            {isCardExpanded ? 'Show less' : 'Read more'}
                          </span>
                        </button>

                        {/* Expandable details section */}
                        <div style={{ maxHeight: isCardExpanded ? 200 : 0, overflow: 'hidden', transition: 'max-height 0.35s ease' }}>
                          <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: 9, display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 10 }}>
                            {team.details.map(d => (
                              <div key={d} style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                <span style={{ fontSize: 13, color: '#c4c9d4', flexShrink: 0, marginTop: 2 }}>·</span>
                                <span style={{ fontSize: 15, color: '#6b778a', lineHeight: '19px', letterSpacing: '-0.2px' }}>{d}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Spacer — pushes assign button to bottom */}
                        <div style={{ flex: 1 }} />

                        {/* Assign button — outline, fills on hover/picked */}
                        <button onClick={() => pick(expandedGroup.label, team.id)}
                          onMouseEnter={() => setHoveredAssign(team.id)}
                          onMouseLeave={() => setHoveredAssign(null)}
                          style={{
                            width: '100%', height: 38, borderRadius: 20,
                            background: isPicked ? '#00a63e' : hoveredAssign === team.id ? '#1e2939' : 'rgba(30,41,57,0.06)',
                            border: isPicked ? '1.5px solid #00a63e' : '1.5px solid rgba(30,41,57,0.35)',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            transition: 'background .18s, border-color .18s',
                          }}>
                          <span style={{ fontSize: 15, fontWeight: 600, color: isPicked || hoveredAssign === team.id ? 'white' : '#1e2939', letterSpacing: '-0.2px', transition: 'color .18s' }}>
                            {isPicked ? '✓ Assigned' : 'Assign Team'}
                          </span>
                        </button>
                      </div>
                    </div>
                  );
                  });
                })()}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
