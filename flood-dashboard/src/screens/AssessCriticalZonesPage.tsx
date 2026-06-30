import { useState, useRef, useEffect } from 'react';
import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';

interface Props {
  onBack: () => void;
  onPlan: () => void;
  onCoastalRoad: () => void;
  onVulnerableResidents: () => void;
  onElectricUtility: () => void;
  onResidentialEdge: () => void;
  onPumpCapacity: () => void;
  skipAnimation?: boolean;
  approvedZones: string[];
  map?: any;
}

const ZONE_ACCENT: Record<string, string> = {
  'Costal Road Access': '#ea7836',
  'Electric Utility Point': '#ffbb00',
  'Residential Edge Blocks': '#bf5761',
  'Increase pump capacity': '#2864e4',
  'Vulnerable Residents': '#84af79',
};

const ZONE_LIST = [
  {
    label: 'Costal Road Access',
    svgPath: 'M19.024 9.786L17.928 6.59535C17.7694 6.12954 17.4635 5.72443 17.054 5.4379C16.6445 5.15138 16.1524 4.99811 15.648 5.00002H8.36C7.85587 4.9993 7.36431 5.15302 6.95506 5.43938C6.5458 5.72574 6.23964 6.13019 6.08 6.59535L4.984 9.786C4.408 10.0195 4 10.5798 4 11.2179V15.109C4.00169 15.3806 4.07641 15.647 4.21676 15.8818C4.3571 16.1167 4.55818 16.3117 4.8 16.4475V18.2218C4.8 18.6498 5.16 19 5.6 19H6.4C6.84 19 7.2 18.6498 7.2 18.2218V16.6654H16.8V18.2218C16.8 18.6498 17.16 19 17.6 19H18.4C18.84 19 19.2 18.6498 19.2 18.2218V16.4475C19.4418 16.3117 19.6429 16.1167 19.7832 15.8818C19.9236 15.647 19.9983 15.3806 20 15.109V11.2179C20 10.572 19.592 10.0195 19.016 9.786H19.024ZM17.608 13.1634C17.608 13.8093 17.072 14.3307 16.408 14.3307C15.744 14.3307 15.208 13.8093 15.208 13.1634C15.208 12.5175 15.744 11.9961 16.408 11.9961C17.072 11.9961 17.608 12.5175 17.608 13.1634ZM8.808 13.1634C8.808 13.8093 8.272 14.3307 7.608 14.3307C6.944 14.3307 6.408 13.8093 6.408 13.1634C6.408 12.5175 6.944 11.9961 7.608 11.9961C8.272 11.9961 8.808 12.5175 8.808 13.1634ZM8.36 6.54865H15.656C15.8237 6.54823 15.9873 6.5991 16.1237 6.69406C16.2601 6.78902 16.3623 6.92327 16.416 7.07784L17.304 9.66149H6.72L7.608 7.07784C7.66167 6.92327 7.76392 6.78902 7.9003 6.69406C8.03668 6.5991 8.20029 6.54823 8.368 6.54865H8.36Z',
  },
  {
    label: 'Electric Utility Point',
    svgPath: 'M16 10.5H12V4L8 13.5H12V20L16 10.5Z',
  },
  {
    label: 'Residential Edge Blocks',
    svgPath: 'M17.6786 18.125H17.1429V5.65625C17.1429 5.29381 16.855 5 16.5 5H7.5C7.14496 5 6.85714 5.29381 6.85714 5.65625V18.125H6.32143C6.14392 18.125 6 18.2719 6 18.4531V19H18V18.4531C18 18.2719 17.8561 18.125 17.6786 18.125ZM9.42857 7.07812C9.42857 6.89692 9.57249 6.75 9.75 6.75H10.8214C10.9989 6.75 11.1429 6.89692 11.1429 7.07812V8.17188C11.1429 8.35308 10.9989 8.5 10.8214 8.5H9.75C9.57249 8.5 9.42857 8.35308 9.42857 8.17188V7.07812ZM9.42857 9.70312C9.42857 9.52192 9.57249 9.375 9.75 9.375H10.8214C10.9989 9.375 11.1429 9.52192 11.1429 9.70312V10.7969C11.1429 10.9781 10.9989 11.125 10.8214 11.125H9.75C9.57249 11.125 9.42857 10.9781 9.42857 10.7969V9.70312ZM10.8214 13.75H9.75C9.57249 13.75 9.42857 13.6031 9.42857 13.4219V12.3281C9.42857 12.1469 9.57249 12 9.75 12H10.8214C10.9989 12 11.1429 12.1469 11.1429 12.3281V13.4219C11.1429 13.6031 10.9989 13.75 10.8214 13.75ZM12.8571 18.125H11.1429V15.8281C11.1429 15.6469 11.2868 15.5 11.4643 15.5H12.5357C12.7132 15.5 12.8571 15.6469 12.8571 15.8281V18.125ZM14.5714 13.4219C14.5714 13.6031 14.4275 13.75 14.25 13.75H13.1786C13.0011 13.75 12.8571 13.6031 12.8571 13.4219V12.3281C12.8571 12.1469 13.0011 12 13.1786 12H14.25C14.4275 12 14.5714 12.1469 14.5714 12.3281V13.4219ZM14.5714 10.7969C14.5714 10.9781 14.4275 11.125 14.25 11.125H13.1786C13.0011 11.125 12.8571 10.9781 12.8571 10.7969V9.70312C12.8571 9.52192 13.0011 9.375 13.1786 9.375H14.25C14.4275 9.375 14.5714 9.52192 14.5714 9.70312V10.7969ZM14.5714 8.17188C14.5714 8.35308 14.4275 8.5 14.25 8.5H13.1786C13.0011 8.5 12.8571 8.35308 12.8571 8.17188V7.07812C12.8571 6.89692 13.0011 6.75 13.1786 6.75H14.25C14.4275 6.75 14.5714 6.89692 14.5714 7.07812V8.17188Z',
  },
  {
    label: 'Increase pump capacity',
    svgPath: 'M12.3167 5.14392C12.2776 5.09879 12.229 5.06255 12.1744 5.03771C12.1197 5.01286 12.0603 5 12.0002 5C11.94 5 11.8806 5.01286 11.826 5.03771C11.7713 5.06255 11.7228 5.09879 11.6837 5.14392C10.5844 6.41433 7 10.8064 7 14.0597C7 17.0915 8.93194 19 12 19C15.0681 19 17 17.0915 17 14.0597C17 10.8064 13.4156 6.41433 12.3167 5.14392ZM12.5556 17.216C12.4888 17.2162 12.423 17.2005 12.3637 17.1702C12.3044 17.14 12.2533 17.0962 12.2147 17.0424C12.1761 16.9886 12.1512 16.9264 12.142 16.8611C12.1328 16.7958 12.1396 16.7293 12.1618 16.6671C12.1902 16.586 12.2438 16.5158 12.3149 16.4665C12.3861 16.4172 12.4711 16.3914 12.558 16.3926C13.1095 16.3915 13.6381 16.1745 14.0281 15.7891C14.4181 15.4038 14.6377 14.8815 14.6389 14.3366C14.6376 14.2508 14.6638 14.1667 14.7137 14.0964C14.7635 14.0262 14.8346 13.9732 14.9167 13.9451C14.9796 13.9232 15.0469 13.9164 15.113 13.9255C15.1791 13.9346 15.242 13.9593 15.2965 13.9974C15.3509 14.0355 15.3953 14.086 15.4259 14.1446C15.4565 14.2032 15.4724 14.2683 15.4722 14.3342C15.4714 15.0982 15.1638 15.8308 14.617 16.371C14.0702 16.9113 13.3289 17.2152 12.5556 17.216Z',
  },
  {
    label: 'Vulnerable Residents',
    svgPath: 'M11 18C11 18 10 18 10 17C10 16 11 13 15 13C19 13 20 16 20 17C20 18 19 18 19 18H11ZM15 12C15.7956 12 16.5587 11.6839 17.1213 11.1213C17.6839 10.5587 18 9.79565 18 9C18 8.20435 17.6839 7.44129 17.1213 6.87868C16.5587 6.31607 15.7956 6 15 6C14.2044 6 13.4413 6.31607 12.8787 6.87868C12.3161 7.44129 12 8.20435 12 9C12 9.79565 12.3161 10.5587 12.8787 11.1213C13.4413 11.6839 14.2044 12 15 12ZM9.216 18C9.06782 17.6878 8.9939 17.3455 9 17C9 15.645 9.68 14.25 10.936 13.28C10.3092 13.0864 9.65598 12.992 9 13C5 13 4 16 4 17C4 18 5 18 5 18H9.216ZM8.5 12C9.16304 12 9.79893 11.7366 10.2678 11.2678C10.7366 10.7989 11 10.163 11 9.5C11 8.83696 10.7366 8.20107 10.2678 7.73223C9.79893 7.26339 9.16304 7 8.5 7C7.83696 7 7.20107 7.26339 6.73223 7.73223C6.26339 8.20107 6 8.83696 6 9.5C6 10.163 6.26339 10.7989 6.73223 11.2678C7.20107 11.7366 7.83696 12 8.5 12Z',
  },
];

// Anchored to real lng/lat (geo-anchored, same pattern as the hazard-zone
// polygon) so these tabs move together with the map instead of staying fixed
// in screen-space when panning/zooming. Positioned by the user via the
// drag-to-place debug tool.
const MAP_TABS = [
  {
    lngLat: [-80.190393, 25.764016] as [number, number], width: 190,
    icon: '/icons/tab-car.svg',
    title: 'Costal Road Access',
    subtitle: 'Potential disruption',
    action: 'coastal' as const,
  },
  {
    lngLat: [-80.193672, 25.769357] as [number, number], width: 242,
    icon: '/icons/tab-electric.svg',
    title: 'Electric Utility Point',
    subtitle: 'Changing the defense system',
    action: 'electric' as const,
  },
  {
    lngLat: [-80.189007, 25.76613] as [number, number], width: 211,
    icon: '/icons/tab-building.svg',
    title: 'Residential Edge Blocks',
    subtitle: 'Higher exposure',
    action: 'residential' as const,
  },
  {
    lngLat: [-80.192295, 25.762711] as [number, number], width: 208,
    icon: '/icons/tab-water.svg',
    title: 'Increase pump capacity',
    subtitle: 'Back-flow risk',
    action: 'pump' as const,
  },
  {
    lngLat: [-80.195504, 25.765652] as [number, number], width: 215,
    icon: '/icons/tab-people.svg',
    title: 'Vulnerable Residents',
    subtitle: 'Support planning needed',
    action: 'vulnerable' as const,
  },
];

const HOVER_DATA: Record<string, {
  accent: string;
  opensAbove: boolean;
  description: string;
  proposed: string;
}> = {
  'Costal Road Access': {
    accent: '#ea7836',
    opensAbove: false,
    description: 'Primary access route will become limited during high-water events, affecting evacuation, emergency response, and daily movement.',
    proposed: 'Elevate low road segments',
  },
  'Electric Utility Point': {
    accent: '#ffbb00',
    opensAbove: false,
    description: 'A critical utility point is located within the projected flood-impact area and may disrupt essential services if left unprotected.',
    proposed: 'Raise electrical cabinets and add protected power points.',
  },
  'Residential Edge Blocks': {
    accent: '#bf5761',
    opensAbove: true,
    description: 'Residential edges near the shoreline may face repeated water intrusion, access limitations, and damage to shared ground-floor areas.',
    proposed: 'Adapt ground-floor access points.',
  },
  'Increase pump capacity': {
    accent: '#2864e4',
    opensAbove: true,
    description: 'Sewage overflow and road flooding from overloaded drainage channels block streets and disrupt local access.',
    proposed: 'Upgrade pump capacity and drainage routes.',
  },
  'Vulnerable Residents': {
    accent: '#84af79',
    opensAbove: true,
    description: 'Low-lying residential blocks include residents who may need assisted access, clearer alerts, and continuity of daily services during flood events.',
    proposed: 'Improve building access and resident support.',
  },
};

export default function AssessCriticalZonesPage({ onBack, onPlan, onCoastalRoad, onVulnerableResidents, onElectricUtility, onResidentialEdge, onPumpCapacity, skipAnimation, map }: Props) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [animDone, setAnimDone] = useState(skipAnimation ?? false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (skipAnimation) return;
    const t = setTimeout(() => setAnimDone(true), 2100);
    return () => clearTimeout(t);
  }, []);

  // Geo-anchored tab positions — recomputed from each tab's lngLat via
  // map.project() so they move together with the map on pan/zoom, the same
  // pattern used for the hazard-zone hover card in HomePageAlert.tsx.
  const [tabPositions, setTabPositions] = useState<{ x: number; y: number }[] | null>(null);

  useEffect(() => {
    if (!map) return;
    const updatePositions = () => {
      setTabPositions(MAP_TABS.map((tab) => map.project(tab.lngLat)));
    };
    updatePositions();
    map.on('move', updatePositions);
    window.addEventListener('resize', updatePositions);
    return () => {
      map.off('move', updatePositions);
      window.removeEventListener('resize', updatePositions);
    };
  }, [map]);

  function handleEnter(title: string) {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setHoveredTab(title);
  }

  function handleLeave() {
    hideTimer.current = setTimeout(() => setHoveredTab(null), 120);
  }

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
        @keyframes pillEnterUp {
          from { clip-path: inset(calc(100% - 45px) 100% 0 0 round 100px); }
          to   { clip-path: inset(calc(100% - 45px) 0% 0 0 round 100px); }
        }
        @keyframes pillEnterDown {
          from { clip-path: inset(0 100% calc(100% - 45px) 0 round 100px); }
          to   { clip-path: inset(0 0% calc(100% - 45px) 0 round 100px); }
        }
      `}</style>
      <ScaledLayout className="screen-enter">
        <HomePageHeader />

        <button
          onClick={onBack}
          className="absolute flex items-center gap-[10px] left-[32px] top-[99px]"
          style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', pointerEvents: 'auto' }}
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
            pointerEvents: 'auto',
          }}
        >
          <p
            className="absolute font-semibold text-[18px] leading-[28px] tracking-[-0.44px] text-[#1e2939]"
            style={{ left: 12, top: 16 }}
          >
            1. Assess Critical Zones
          </p>

          <div className="absolute bg-[rgba(0,0,0,0.08)]" style={{ top: 59, left: 0, right: 0, height: 1 }} />

          <p
            className="absolute font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#505153]"
            style={{ left: 58, top: 79, width: 307 }}
          >
            Several areas in the Harbor District are expected to be affected more severely by the
            projected flooding. These critical zones include vulnerable access routes, exposed
            infrastructure, residential edges, and support points that may require adaptation,
            repair, or reinforcement in order to reduce future disruption.
          </p>

          <div className="absolute bg-[rgba(0,0,0,0.08)]" style={{ top: 329, left: 13, right: 13, height: 1 }} />

          <div className="absolute flex gap-[13px] items-start" style={{ left: 17, top: 355 }}>
            <img src="/icons/notice-icon.svg" alt="" width={28} height={28} className="flex-shrink-0" />
            <p className="font-medium text-[16px] leading-[28px] tracking-[-0.44px] text-[#505153]" style={{ width: 308 }}>
              Review the proposed response for each critical zone to continue
            </p>
          </div>

          <div className="absolute bg-[rgba(0,0,0,0.08)]" style={{ top: 437, left: 13, right: 13, height: 1 }} />

          <div className="absolute flex flex-col" style={{ left: 19, top: 463, gap: 20 }}>
            {ZONE_LIST.map(({ label, svgPath }) => (
              <div key={label} className="flex items-end" style={{ gap: 15 }}>
                <svg viewBox="0 0 24 24" width={24} height={24} fill="none" style={{ flexShrink: 0 }}>
                  <rect width="24" height="24" rx="12" style={{ fill: ZONE_ACCENT[label] }} />
                  <path d={svgPath} fill="white" />
                </svg>
                <p className="font-medium text-[16px] leading-[21px] tracking-[-0.44px] text-[#505153]">
                  {label}
                </p>
              </div>
            ))}
          </div>

          <button
            onClick={onPlan}
            className="absolute w-[313px] h-[37px] rounded-[14px] flex items-center justify-center"
            style={{
              left: 41, top: 722,
              background: 'rgba(16,24,40,0.9)',
              cursor: 'pointer',
            }}
          >
            <span className="font-medium text-[14px] text-white">Simulate response scenarios</span>
          </button>
        </div>
      </ScaledLayout>

      {/* Map tabs — geo-anchored via map.project(), rendered in raw viewport
          pixels outside ScaledLayout so they track the map on pan/zoom. */}
      {tabPositions && MAP_TABS.map((tab, i) => {
          const pos = tabPositions[i];
          const handler =
            tab.action === 'coastal' ? onCoastalRoad
            : tab.action === 'vulnerable' ? onVulnerableResidents
            : tab.action === 'electric' ? onElectricUtility
            : tab.action === 'residential' ? onResidentialEdge
            : tab.action === 'pump' ? onPumpCapacity
            : undefined;

          const base = i * 0.3;
          const dotDelay  = `${base}s`;
          const lineDelay = `${base + 0.15}s`;
          const pillDelay = `${base + 0.4}s`;

          const hoverData = HOVER_DATA[tab.title];
          const isOpen = hoveredTab === tab.title;
          const isUpward = hoverData.opensAbove;

          // Clip-path: compact shows only the pill row (45px); expanded shows everything
          const compactClip = isUpward
            ? 'inset(calc(100% - 45px) 0 0 0 round 100px)'
            : 'inset(0 0 calc(100% - 45px) 0 round 100px)';
          const expandedClip = 'inset(0 0 0 0 round 16px)';
          const entranceAnim = isUpward
            ? `pillEnterUp 0.3s ease-out ${pillDelay} both`
            : `pillEnterDown 0.3s ease-out ${pillDelay} both`;

          const containerStyle: React.CSSProperties = {
            position: 'absolute',
            left: pos.x,
            // For upward tabs, anchor the bottom edge at the pill's bottom so content grows up
            ...(isUpward
              ? { bottom: window.innerHeight - pos.y - 45 }
              : { top: pos.y }),
            width: animDone ? (isOpen ? 280 : tab.width) : tab.width,
            animation: !animDone ? entranceAnim : undefined,
            clipPath: animDone ? (isOpen ? expandedClip : compactClip) : undefined,
            transition: animDone
              ? 'clip-path 0.3s ease-out, width 0.3s ease-out, box-shadow 0.2s'
              : 'none',
            background: 'rgba(255,255,255,0.9)',
            boxShadow: isOpen
              ? '0 4px 24px rgba(0,0,0,0.15)'
              : '0 2px 8px rgba(0,0,0,0.08)',
            zIndex: isOpen ? 30 : 5,
            cursor: handler ? 'pointer' : 'default',
            pointerEvents: 'auto',
          };

          const pillRow = (
            <div style={{
              height: 45,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 27,
              padding: '0 5px',
            }}>
              <img src={tab.icon} alt="" width={32} height={32} style={{ flexShrink: 0 }} />
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                lineHeight: '21px',
                letterSpacing: '-0.44px',
              }}>
                <span style={{ fontWeight: 600, fontSize: 12, color: '#1e2939' }}>{tab.title}</span>
                <span style={{ fontWeight: 500, fontSize: 12, color: '#505153' }}>{tab.subtitle}</span>
              </div>
            </div>
          );

          const extraContent = (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              padding: isUpward ? '16px 16px 8px 16px' : '0 16px 16px 16px',
            }}>
              <p style={{
                fontWeight: 500, fontSize: 13, lineHeight: '23px',
                letterSpacing: '-0.44px', color: '#1e2939', margin: 0,
              }}>
                {hoverData.description}
              </p>
              <p style={{
                fontWeight: 500, fontSize: 13, lineHeight: '23px',
                letterSpacing: '-0.44px', color: '#1e2939', margin: 0,
              }}>
                <strong style={{ fontWeight: 700 }}>Proposed response: </strong>
                {hoverData.proposed}
              </p>
              <div style={{ borderBottom: `1px solid ${hoverData.accent}`, width: 80 }}>
                <span style={{
                  fontWeight: 700, fontSize: 13, lineHeight: '23px',
                  letterSpacing: '-0.44px', color: hoverData.accent,
                }}>
                  View full plan
                </span>
              </div>
            </div>
          );

          return (
            <div key={tab.title}>
              {/* Single container: compact pill ↔ expanded card */}
              <div
                onClick={handler}
                onMouseEnter={() => handleEnter(tab.title)}
                onMouseLeave={handleLeave}
                style={containerStyle}
              >
                {isUpward ? (
                  <>
                    {extraContent}
                    {pillRow}
                  </>
                ) : (
                  <>
                    {pillRow}
                    {extraContent}
                  </>
                )}
              </div>

              {/* Connector: line grows up from dot */}
              <div style={{
                position: 'absolute',
                left: pos.x + 32,
                top: pos.y + 45,
                width: 10,
                height: 33,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{
                  width: 2,
                  flex: 1,
                  background: 'rgba(255,255,255,0.9)',
                  transformOrigin: 'bottom center',
                  animation: !skipAnimation ? `lineGrow 0.25s ease-out ${lineDelay} both` : undefined,
                } as React.CSSProperties} />
                <div style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.9)',
                  flexShrink: 0,
                  animation: !skipAnimation ? `dotPop 0.15s ease-out ${dotDelay} both` : undefined,
                } as React.CSSProperties} />
              </div>
            </div>
          );
        })}
    </>
  );
}
