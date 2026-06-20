import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';

interface Props {
  onBack: () => void;
  onPlan: () => void;
  onCoastalRoad: () => void;
  onVulnerableResidents: () => void;
}

const ZONE_LIST = [
  { icon: '/icons/list-car.svg', label: 'Costal Road Access' },
  { icon: '/icons/list-electric.svg', label: 'Electric Utility Point' },
  { icon: '/icons/list-building.svg', label: 'Residential Edge Blocks' },
  { icon: '/icons/list-water.svg', label: 'Increase pump capacity' },
  { icon: '/icons/list-people.svg', label: 'Vulnerable Residents' },
];

const MAP_TABS = [
  {
    left: 713, top: 172, width: 190,
    icon: '/icons/tab-car.svg',
    title: 'Costal Road Access',
    subtitle: 'Potential disruption',
    action: 'coastal' as const,
  },
  {
    left: 1184, top: 392, width: 242,
    icon: '/icons/tab-electric.svg',
    title: 'Electric Utility Point',
    subtitle: 'Changing the defense system',
    action: null,
  },
  {
    left: 610, top: 527, width: 211,
    icon: '/icons/tab-building.svg',
    title: 'Residential Edge Blocks',
    subtitle: 'Higher exposure',
    action: null,
  },
  {
    left: 488, top: 718, width: 208,
    icon: '/icons/tab-water.svg',
    title: 'Increase pump capacity',
    subtitle: 'Back-flow risk',
    action: null,
  },
  {
    left: 1066, top: 814, width: 215,
    icon: '/icons/tab-people.svg',
    title: 'Vulnerable Residents',
    subtitle: 'Support planning needed',
    action: 'vulnerable' as const,
  },
];

export default function AssessCriticalZonesPage({ onBack, onPlan, onCoastalRoad, onVulnerableResidents }: Props) {
  return (
    <>
      <style>{`
        @keyframes dotPop {
          from { opacity: 0; transform: scale(0.3); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes lineGrow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes pillReveal {
          from { clip-path: inset(0 100% 0 0 round 100px); }
          to   { clip-path: inset(0 0% 0 0 round 100px); }
        }
      `}</style>
      <ScaledLayout className="screen-enter">
        <HomePageHeader />

        <button
          onClick={onBack}
          className="absolute flex items-center gap-[10px] left-[32px] top-[99px]"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
        >
          <span className="font-semibold text-[26px] leading-[28px] text-white">←</span>
          <span className="font-semibold text-[26px] leading-[28px] tracking-[-0.44px] text-white">Harbor District</span>
        </button>

        {/* Left info card */}
        <div
          className="absolute glass-shadow"
          style={{
            left: 16, top: 138, width: 386, height: 778,
            borderRadius: 16,
            background: 'rgba(255,255,255,0.85)',
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        >
          {/* Title */}
          <p
            className="absolute font-semibold text-[18px] leading-[28px] tracking-[-0.44px] text-[#1e2939]"
            style={{ left: 12, top: 16 }}
          >
            1. Assess Critical Zones
          </p>

          {/* Header divider */}
          <div className="absolute bg-[rgba(0,0,0,0.08)]" style={{ top: 59, left: 0, right: 0, height: 1 }} />

          {/* Body paragraph */}
          <p
            className="absolute font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#505153]"
            style={{ left: 58, top: 79, width: 307 }}
          >
            Several areas in the Harbor District are expected to be affected more severely by the
            projected flooding. These critical zones include vulnerable access routes, exposed
            infrastructure, residential edges, and support points that may require adaptation,
            repair, or reinforcement in order to reduce future disruption.
          </p>

          {/* Divider above notice */}
          <div className="absolute bg-[rgba(0,0,0,0.08)]" style={{ top: 329, left: 13, right: 13, height: 1 }} />

          {/* Notice row */}
          <div className="absolute flex gap-[13px] items-start" style={{ left: 17, top: 355 }}>
            <img src="/icons/notice-icon.svg" alt="" width={28} height={28} className="flex-shrink-0" />
            <p className="font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#505153]" style={{ width: 308 }}>
              Review the proposed response for each critical zone to continue
            </p>
          </div>

          {/* Divider above zone list */}
          <div className="absolute bg-[rgba(0,0,0,0.08)]" style={{ top: 437, left: 13, right: 13, height: 1 }} />

          {/* Zone list */}
          <div className="absolute flex flex-col" style={{ left: 19, top: 463, gap: 20 }}>
            {ZONE_LIST.map(({ icon, label }) => (
              <div key={label} className="flex items-end" style={{ gap: 15 }}>
                <img src={icon} alt="" width={24} height={24} className="flex-shrink-0" />
                <p className="font-medium text-[16px] leading-[21px] tracking-[-0.44px] text-[#505153]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* Start Response Plan button */}
          <button
            onClick={onPlan}
            className="absolute w-[313px] h-[37px] rounded-[14px] bg-[rgba(16,24,40,0.9)] flex items-center justify-center"
            style={{ left: 41, top: 722 }}
          >
            <span className="font-medium text-[14px] text-white">Start Response Plan →</span>
          </button>
        </div>

        {/* Map tab pills */}
        {MAP_TABS.map((tab, i) => {
          const handler =
            tab.action === 'coastal' ? onCoastalRoad
            : tab.action === 'vulnerable' ? onVulnerableResidents
            : undefined;
          const base = i * 0.3;
          const dotDelay  = `${base}s`;
          const lineDelay = `${base + 0.15}s`;
          const pillDelay = `${base + 0.4}s`;

          return (
            <div key={tab.title}>
              {/* Pill — reveals left to right */}
              <div
                onClick={handler}
                style={{
                  position: 'absolute',
                  left: tab.left,
                  top: tab.top,
                  width: tab.width,
                  height: 45,
                  background: 'rgba(255,255,255,0.9)',
                  borderRadius: 100,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 27,
                  paddingLeft: 5,
                  paddingRight: 5,
                  cursor: handler ? 'pointer' : 'default',
                  animation: `pillReveal 0.3s ease-out ${pillDelay} both`,
                } as React.CSSProperties}
              >
                <img src={tab.icon} alt="" width={32} height={32} className="flex-shrink-0" />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: '21px', letterSpacing: '-0.44px' }}>
                  <span style={{ fontWeight: 600, fontSize: 12, color: '#1e2939' }}>{tab.title}</span>
                  <span style={{ fontWeight: 500, fontSize: 12, color: '#505153' }}>{tab.subtitle}</span>
                </div>
              </div>

              {/* Connector: line grows upward from dot */}
              <div
                style={{
                  position: 'absolute',
                  left: tab.left + 32,
                  top: tab.top + 45,
                  width: 10,
                  height: 33,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <div style={{
                  width: 2,
                  flex: 1,
                  background: 'rgba(255,255,255,0.9)',
                  transformOrigin: 'bottom center',
                  animation: `lineGrow 0.25s ease-out ${lineDelay} both`,
                } as React.CSSProperties} />
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  flexShrink: 0,
                  animation: `dotPop 0.15s ease-out ${dotDelay} both`,
                } as React.CSSProperties} />
              </div>
            </div>
          );
        })}
      </ScaledLayout>
    </>
  );
}
