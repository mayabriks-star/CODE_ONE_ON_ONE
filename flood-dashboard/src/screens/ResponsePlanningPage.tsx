import { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Bell, ChevronDown } from 'lucide-react';


interface Props {
  onBack: () => void;
  onCoastalRoad?: () => void;
  onVulnerableResidents?: () => void;
}

interface CardData {
  icon: string;
  color: string;
  label: string;
  value: string;
  desc: string;
  contentGap?: string;
  contentPL?: string;
  iconSize?: number;
  reviewAlignLeft?: boolean;
}

function ActionCard({ icon, color, label, value, desc, contentGap = '10px', contentPL = '10px', iconSize = 28, reviewAlignLeft = false, onClick }: CardData & { onClick?: () => void }) {
  return (
    <div style={{ display: 'flex', height: '159px', width: '340px', cursor: onClick ? 'pointer' : undefined }} onClick={onClick}>
      <div
        style={{
          width: '40px',
          height: '159px',
          background: color,
          borderRadius: '20px 0 0 20px',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img src={icon} alt="" width={iconSize} height={iconSize} />
      </div>
      <div
        style={{
          width: '300px',
          height: '159px',
          background: 'rgba(255,255,255,0.6)',
          borderRadius: '0 20px 20px 0',
          paddingLeft: contentPL,
          paddingRight: '10px',
          display: 'flex',
          flexDirection: 'column',
          gap: contentGap,
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <p style={{ fontSize: '12px', fontWeight: 600, color: '#364153', margin: 0, letterSpacing: '-0.44px' }}>
          {label}
        </p>
        <p style={{ fontSize: '30px', fontWeight: 500, color: 'black', margin: 0, letterSpacing: '-0.44px', lineHeight: '21px' }}>
          {value}
        </p>
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#505153', margin: 0, letterSpacing: '-0.44px', lineHeight: '21px' }}>
          {desc}
        </p>
        {reviewAlignLeft ? (
          <div style={{ alignSelf: 'flex-start', height: '23px', borderBottom: '1px solid black', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'black', letterSpacing: '-0.44px', whiteSpace: 'nowrap' }}>
              Review &amp; Edit
            </span>
          </div>
        ) : (
          <div style={{ width: '100%', height: '23px', borderBottom: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'black', letterSpacing: '-0.44px', whiteSpace: 'nowrap' }}>
              Review &amp; Edit
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

const leftCards: CardData[] = [
  {
    icon: '/icons/costal-road-access.svg',
    color: '#E87840',
    label: 'Costal Road Access',
    value: '15km',
    desc: 'Upgrade entrances, shared access points, and ground-floor protection in shoreline residential blocks',
    iconSize: 40,
    reviewAlignLeft: true,
  },
  {
    icon: '/icons/vulnerable-residents.svg',
    color: '#79A86A',
    label: 'Vulnerable Residents',
    value: '620',
    desc: 'Adapt access routes, ramps, raised walkways for elderly and mobility-limited residents',
    iconSize: 40,
    reviewAlignLeft: true,
  },
  {
    icon: '/icons/increase-pump-capacity.svg',
    color: '#3B5CF6',
    label: 'Pump Capacity',
    value: '75%',
    desc: 'Increase drainage pump capacity to 75% to reduce back-flow risk',
    contentGap: '12px',
    contentPL: '9px',
    iconSize: 40,
    reviewAlignLeft: true,
  },
];

const rightCards: CardData[] = [
  {
    icon: '/icons/residential-edge-blocks.svg',
    color: '#B55C6A',
    label: 'Ground-floor units to adapt',
    value: '240',
    desc: 'Adapt ground-floor entrances and shared access points in shoreline residential blocks',
    contentPL: '11px',
    iconSize: 40,
    reviewAlignLeft: true,
  },
  {
    icon: '/icons/electric-utility-point.svg',
    color: '#F5B830',
    label: 'Electric Utility Point',
    value: '2',
    desc: 'Relocate to the Uptown area to maintain power continuity',
    iconSize: 40,
    reviewAlignLeft: true,
  },
];

const inactiveSteps = [
  { n: 2, title: 'Simulate response scenarios', sub: 'Test possible protection and adaptation outcomes' },
  { n: 3, title: 'Compare intervention options', sub: 'Evaluate cost, time, impact reduction, and feasibility' },
  { n: 4, title: 'Allocate budget & teams', sub: 'Assign resources, departments, and initial responsibilities' },
  { n: 5, title: 'Launch action plan', sub: 'Approve the plan and move it into active monitoring' },
];

function ImpactTimelineChart() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '60px', width: '100%' }}>
      <svg viewBox="0 0 1190 200" style={{ flex: 1 }} preserveAspectRatio="xMidYMid meet">
        <style>{`
          @keyframes drawLine {
            from { stroke-dashoffset: 1; }
            to   { stroke-dashoffset: 0; }
          }
        `}</style>

        {/* Y-axis labels */}
        <text x="72" y="25" textAnchor="end" fontSize="16" fill="#120101">High</text>
        <text x="72" y="95" textAnchor="end" fontSize="16" fill="#120101">Moderate</text>
        <text x="72" y="165" textAnchor="end" fontSize="16" fill="#120101">Low</text>

        {/* Dashed grid lines */}
        <line x1="82" y1="20" x2="1080" y2="20" stroke="rgba(0,0,0,0.12)" strokeDasharray="5,4" strokeWidth="1"/>
        <line x1="82" y1="90" x2="1080" y2="90" stroke="rgba(0,0,0,0.12)" strokeDasharray="5,4" strokeWidth="1"/>
        <line x1="82" y1="160" x2="1080" y2="160" stroke="rgba(0,0,0,0.12)" strokeDasharray="5,4" strokeWidth="1"/>

        {/* Red line - animated left-to-right draw */}
        <path
          d="M 82 90 C 155 75, 185 52, 225 48 C 350 32, 520 20, 700 15 C 850 12, 980 10, 1080 10"
          stroke="#e05252" strokeWidth="2" fill="none"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'drawLine 0.7s ease-out forwards' }}
        />

        {/* Green line - animated, slightly delayed */}
        <path
          d="M 82 90 C 250 90, 400 86, 500 84 C 600 80, 760 76, 1080 70"
          stroke="#84af79" strokeWidth="2" fill="none"
          pathLength="1"
          style={{ strokeDasharray: 1, strokeDashoffset: 1, animation: 'drawLine 0.7s ease-out 0.1s forwards' }}
        />

        {/* Data point dots */}
        <circle cx="82" cy="90" r="6" fill="#1a1a1a"/>
        <circle cx="225" cy="48" r="6" fill="#1a1a1a"/>
        <circle cx="652" cy="78" r="6" fill="#1a1a1a"/>

        {/* X-axis baseline */}
        <line x1="82" y1="175" x2="1080" y2="175" stroke="#333" strokeWidth="1"/>

        {/* X-axis labels */}
        <text x="82"   y="195" textAnchor="middle" fontSize="16" fontWeight="700" fill="#120101">Today</text>
        <text x="225"  y="195" textAnchor="middle" fontSize="16" fill="rgba(20,2,2,0.8)">2030</text>
        <text x="367"  y="195" textAnchor="middle" fontSize="16" fill="rgba(20,2,2,0.8)">2040</text>
        <text x="510"  y="195" textAnchor="middle" fontSize="16" fill="rgba(20,2,2,0.8)">2050</text>
        <text x="652"  y="195" textAnchor="middle" fontSize="16" fill="rgba(20,2,2,0.8)">2060</text>
        <text x="795"  y="195" textAnchor="middle" fontSize="16" fill="rgba(20,2,2,0.8)">2070</text>
        <text x="937"  y="195" textAnchor="middle" fontSize="16" fill="rgba(20,2,2,0.8)">2080</text>
        <text x="1080" y="195" textAnchor="middle" fontSize="16" fill="rgba(20,2,2,0.8)">2090</text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '190px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '20px', borderTop: '2px solid #84af79', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#364153', letterSpacing: '-0.44px' }}>With protection measures</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '20px', borderTop: '2px solid #e05252', flexShrink: 0 }} />
          <span style={{ fontSize: '12px', color: '#364153', letterSpacing: '-0.44px' }}>Without protection measures</span>
        </div>
      </div>
    </div>
  );
}

export default function ResponsePlanningPage({ onBack, onCoastalRoad, onVulnerableResidents }: Props) {
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);

  const DESIGN_PAGE_HEIGHT = 990;
  const [pageScale, setPageScale] = useState(() =>
    Math.min(1, window.innerHeight / DESIGN_PAGE_HEIGHT)
  );
  useEffect(() => {
    const update = () =>
      setPageScale(Math.min(1, window.innerHeight / DESIGN_PAGE_HEIGHT));
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

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
      {/* Vertical centering group */}
      <div style={{ marginTop: '6px', zoom: pageScale }}>
      {/* ── Header - NOT scaled, icons at 28px from viewport left ── */}
      <div style={{ paddingLeft: '28px', paddingRight: '70px', paddingTop: '33px' }}>
        {/* Menu + Bell row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '21px' }}>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#364153', padding: 0, display: 'flex' }}>
            <Menu size={20} />
          </button>
          <div style={{ background: 'rgba(247,247,247,0.8)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell size={20} color="#364153" />
          </div>
        </div>

        {/* Back + Title */}
        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '19px' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#364153', padding: 0, display: 'flex' }}>
            <ArrowLeft size={20} />
          </button>
          <span style={{ fontSize: '26px', fontWeight: 600, color: '#364153', letterSpacing: '-0.44px', lineHeight: '28px' }}>
            Response Planning
          </span>
        </div>
      </div>

      {/* ── Padded content wrapper - provides fixed 70px visual margins, NOT scaled ── */}
      <div style={{ paddingLeft: '70px', paddingRight: '70px', boxSizing: 'border-box' as const }}>
        {/* Inner canvas - natural layout, no scaling */}
        <div style={{ width: '100%', paddingBottom: '34px' }}>

        {/* Projected Impact card */}
        <div
          style={{
            marginTop: '44px',
            width: '100%',
            height: isTimelineOpen ? '555px' : '172px',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '30px',
            paddingLeft: '66px',
            paddingTop: isTimelineOpen ? '22px' : undefined,
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
            justifyContent: isTimelineOpen ? 'flex-start' : 'center',
            boxSizing: 'border-box',
            position: 'relative',
          }}
        >
          <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#364153', letterSpacing: '-0.44px', lineHeight: '28px' }}>
            Projected Impact
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '45px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '55px' }}>
              <div style={{ width: '242px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'black', letterSpacing: '-0.44px', lineHeight: '28px' }}>When</p>
                <div>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#b91d1d', letterSpacing: '-0.44px', lineHeight: '28px' }}>
                    12 month (May 2027)
                  </p>
                  <p style={{ margin: 0, fontSize: '14px', color: 'black', letterSpacing: '-0.44px', lineHeight: '28px' }}>
                    Without intervention
                  </p>
                </div>
              </div>
              <div style={{ width: '182px', display: 'flex', flexDirection: 'column' }}>
                <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: '#84af79', letterSpacing: '-0.44px', lineHeight: '28px' }}>
                  6-8 yrs (~2033)
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: 'black', letterSpacing: '-0.44px', lineHeight: '28px' }}>
                  With intervention
                </p>
              </div>
            </div>

            <div style={{ width: '1px', height: '60px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }} />

            <div style={{ width: '163px', display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', justifyContent: 'flex-end' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'black', letterSpacing: '-0.44px', lineHeight: '28px' }}>First Impact Area</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: 'black', letterSpacing: '-0.44px', lineHeight: '28px' }}>Harbor District</p>
            </div>

            <div style={{ width: '1px', height: '60px', background: 'rgba(0,0,0,0.2)', flexShrink: 0 }} />

            <div style={{ width: '177px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: 'black', letterSpacing: '-0.44px', lineHeight: '28px' }}>Action should begin within</p>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 500, color: 'black', letterSpacing: '-0.44px', lineHeight: '28px' }}>30 Days</p>
            </div>
          </div>

          {/* Impact Timeline button */}
          <button
            onClick={() => setIsTimelineOpen(o => !o)}
            style={{
              position: 'absolute',
              right: '49px',
              top: '74px',
              width: '181px',
              height: '40px',
              border: '1px solid rgba(0,0,0,0.8)',
              borderRadius: '100px',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 500,
              color: '#323232',
              letterSpacing: '-0.44px',
            }}
          >
            Impact Timeline
            <ChevronDown size={12} style={{ transform: isTimelineOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Impact Timeline chart - inside the card, card expands to contain it */}
          {isTimelineOpen && (
            <div style={{
              marginTop: '43px',
              marginLeft: '-66px',
              width: 'calc(100% + 66px)',
              paddingLeft: '25px',
              paddingRight: '25px',
              boxSizing: 'border-box' as const,
            }}>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#364153', letterSpacing: '-0.44px', lineHeight: '28px' }}>
                Impact Timeline: Compare projected impact
              </p>
              <p style={{ margin: 0, fontSize: '16px', fontWeight: 400, color: '#364153', letterSpacing: '-0.44px', lineHeight: '28px' }}>
                The timeline updates as protection measures progress
              </p>
              <div style={{ marginTop: '20px' }}>
                <ImpactTimelineChart />
              </div>
            </div>
          )}

        </div>

        {/* Section title */}
        <p
          style={{
            marginTop: '43px',
            marginBottom: 0,
            fontSize: '18px',
            fontWeight: 600,
            color: '#364153',
            letterSpacing: '-0.44px',
            lineHeight: '1.25',
          }}
        >
          Recommended Action Sequence
        </p>

        {/* Bottom row - flex, space-between distributes available space */}
        <div
          style={{
            marginTop: '30px',
            display: 'flex',
            alignItems: 'flex-start',
            width: '100%',
          }}
        >
          {/* Dark steps panel */}
          <div
            style={{
              width: '542px',
              height: '523px',
              background: 'rgba(0,0,0,0.8)',
              borderRadius: '20px',
              flexShrink: 0,
              padding: '26px 24px 0 23px',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              gap: '34px',
            }}
          >
            {/* Step 1 - active */}
            <div
              style={{
                height: '67px',
                display: 'flex',
                alignItems: 'center',
                gap: '17px',
                background: 'white',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '20px',
                padding: '0 16px',
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              <span style={{ fontSize: '18px', fontWeight: 600, color: 'black', flexShrink: 0 }}>1</span>
              <div>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: 'black', lineHeight: '1.3' }}>
                  Assess critical zones
                </p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: 400, color: 'black', lineHeight: '1.3' }}>
                  Review the areas now marked for early action
                </p>
              </div>
            </div>

            {/* Steps 2–5 - inactive */}
            {inactiveSteps.map((step) => (
              <div
                key={step.n}
                style={{
                  height: '67px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '17px',
                  color: 'white',
                  paddingLeft: '13px',
                  paddingRight: '32px',
                  boxSizing: 'border-box',
                  flexShrink: 0,
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 600, flexShrink: 0 }}>{step.n}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '18px', fontWeight: 600, lineHeight: '1.3' }}>{step.title}</p>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: 400, lineHeight: '1.3' }}>{step.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Spacer: gap dark panel → middle column (ratio 62) */}
          <div style={{ flexGrow: 62, minWidth: 0 }} />
          {/* Left cards column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', flexShrink: 0 }}>
            {leftCards.map((card) => (
              <ActionCard
                key={card.label}
                {...card}
                onClick={
                  card.label === 'Costal Road Access'   ? onCoastalRoad :
                  card.label === 'Vulnerable Residents' ? onVulnerableResidents :
                  undefined
                }
              />
            ))}
          </div>

          {/* Spacer: gap middle column → right column (ratio 88) */}
          <div style={{ flexGrow: 88, minWidth: 0 }} />
          {/* Right cards column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', flexShrink: 0 }}>
            {rightCards.map((card) => (
              <ActionCard key={card.label} {...card} />
            ))}
          </div>

        </div>

        {/* Confirm area mapping - bottom right of page */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-42px', paddingRight: '49px' }}>
          <button
            style={{
              width: '223px',
              height: '40px',
              background: 'rgba(0,0,0,0.8)',
              borderRadius: '100px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 500,
              color: 'white',
              letterSpacing: '-0.44px',
            }}
          >
            Confirm area mapping
          </button>
        </div>

      </div>
      </div>
      </div>{/* end centering group */}
    </div>
  );
}
