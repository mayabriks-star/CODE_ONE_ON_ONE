import { useState, useEffect } from 'react';
import { ArrowLeft, Menu, Bell, ChevronDown } from 'lucide-react';

const DESIGN_H = 1008;

interface Props {
  onBack: () => void;
}

interface CardData {
  icon: string;
  color: string;
  label: string;
  value: string;
  desc: string;
  contentGap?: string;
  contentPL?: string;
}

function ActionCard({ icon, color, label, value, desc, contentGap = '10px', contentPL = '10px' }: CardData) {
  return (
    <div style={{ display: 'flex', height: '159px', width: '340px' }}>
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
        <img src={icon} alt="" width={28} height={28} />
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
        <div style={{ width: '100%', height: '23px', borderBottom: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: '11px', fontWeight: 500, color: 'black', letterSpacing: '-0.44px', whiteSpace: 'nowrap' }}>
            Review &amp; Edit
          </span>
        </div>
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
  },
  {
    icon: '/icons/vulnerable-residents.svg',
    color: '#79A86A',
    label: 'Vulnerable Residents',
    value: '620',
    desc: 'Adapt access routes, ramps, raised walkways for elderly and mobility-limited residents',
  },
  {
    icon: '/icons/increase-pump-capacity.svg',
    color: '#3B5CF6',
    label: 'Pump Capacity',
    value: '75%',
    desc: 'Increase drainage pump capacity to 75% to reduce back-flow risk',
    contentGap: '12px',
    contentPL: '9px',
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
  },
  {
    icon: '/icons/electric-utility-point.svg',
    color: '#F5B830',
    label: 'Electric Utility Point',
    value: '2',
    desc: 'Relocate to the Uptown area to maintain power continuity',
  },
];

const inactiveSteps = [
  { n: 2, title: 'Simulate response scenarios', sub: 'Test possible protection and adaptation outcomes' },
  { n: 3, title: 'Compare intervention options', sub: 'Evaluate cost, time, impact reduction, and feasibility' },
  { n: 4, title: 'Allocate budget & teams', sub: 'Assign resources, departments, and initial responsibilities' },
  { n: 5, title: 'Launch action plan', sub: 'Approve the plan and move it into active monitoring' },
];

export default function ResponsePlanningPage({ onBack }: Props) {
  const [scale, setScale] = useState(1);
  const [innerWidth, setInnerWidth] = useState('100%');

  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const s = Math.min(1.0, vh / DESIGN_H);
      setScale(s);
      setInnerWidth(`${(vw - 140) / s}px`);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return (
    <div
      className="screen-enter"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#f8f8f8' }}
    >
      {/* ── Header — NOT scaled, icons at 28px from viewport left ── */}
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

      {/* ── Padded content wrapper — provides fixed 70px visual margins, NOT scaled ── */}
      <div style={{ paddingLeft: '70px', paddingRight: '70px', boxSizing: 'border-box' as const }}>
        {/* Inner scaled canvas — compensated width so visual = (vw-140), scales only for height fit */}
        <div style={{ width: innerWidth, transform: `scale(${scale})`, transformOrigin: 'top left' }}>

        {/* Projected Impact card */}
        <div
          style={{
            marginTop: '44px',
            width: '100%',
            height: '172px',
            background: 'rgba(255,255,255,0.6)',
            borderRadius: '30px',
            paddingLeft: '66px',
            display: 'flex',
            flexDirection: 'column',
            gap: '9px',
            justifyContent: 'center',
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
            <ChevronDown size={12} />
          </button>
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

        {/* Bottom row — flex, space-between distributes available space */}
        <div
          style={{
            marginTop: '30px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
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
            {/* Step 1 — active */}
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

            {/* Steps 2–5 — inactive */}
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

          {/* Left cards column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', flexShrink: 0 }}>
            {leftCards.map((card) => (
              <ActionCard key={card.label} {...card} />
            ))}
          </div>

          {/* Right cards column + confirm button */}
          <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {rightCards.map((card) => (
                <ActionCard key={card.label} {...card} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '22px' }}>
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
      </div>
      </div>
    </div>
  );
}
