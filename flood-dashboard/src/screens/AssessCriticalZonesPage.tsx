import { useState, useRef, useEffect } from 'react';
import { MapPin, ChevronDown, MousePointerClick } from 'lucide-react';
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
    lngLat: [-80.190072, 25.762479] as [number, number], width: 190,
    icon: '/icons/tab-car.svg',
    title: 'Costal Road Access',
    subtitle: 'Potential disruption',
    action: 'coastal' as const,
  },
  {
    lngLat: [-80.193974, 25.768884] as [number, number], width: 242,
    icon: '/icons/tab-electric.svg',
    title: 'Electric Utility Point',
    subtitle: 'Changing the defense system',
    action: 'electric' as const,
  },
  {
    lngLat: [-80.189149, 25.766935] as [number, number], width: 211,
    icon: '/icons/tab-building.svg',
    title: 'Residential Edge Blocks',
    subtitle: 'Higher exposure',
    action: 'residential' as const,
  },
  {
    lngLat: [-80.191864, 25.759567] as [number, number], width: 208,
    icon: '/icons/tab-water.svg',
    title: 'Increase pump capacity',
    subtitle: 'Back-flow risk',
    action: 'pump' as const,
  },
  {
    lngLat: [-80.194403, 25.762863] as [number, number], width: 215,
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
    opensAbove: false,
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
    opensAbove: false,
    description: 'Low-lying residential blocks include residents who may need assisted access, clearer alerts, and continuity of daily services during flood events.',
    proposed: 'Improve building access and resident support.',
  },
};

const IS_DEBUG = new URLSearchParams(window.location.search).has('debug');

export default function AssessCriticalZonesPage({ onBack, onPlan, onCoastalRoad, onVulnerableResidents, onElectricUtility, onResidentialEdge, onPumpCapacity, skipAnimation, map }: Props) {
  const [hoveredTab, setHoveredTab] = useState<string | null>(null);
  const [animDone, setAnimDone] = useState(skipAnimation ?? false);
  const [expandedZone, setExpandedZone] = useState<string | null>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mirror ScaledLayout's scale so back button + progress bar align with the canvas
  // while using right:16px in viewport space to match HomePageHeader exactly.
  const [scale, setScale] = useState(() => {
    const sw = window.innerWidth / 1512;
    const sh = window.innerHeight / 1008;
    return Math.min(1.0, sw, sh);
  });
  useEffect(() => {
    const update = () => {
      const sw = window.innerWidth / 1512;
      const sh = window.innerHeight / 1008;
      setScale(Math.min(1.0, sw, sh));
    };
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Debug drag state — only active when ?debug is in the URL
  const [debugLngLats, setDebugLngLats] = useState<[number, number][]>(() => {
    if (IS_DEBUG) {
      try {
        const saved = localStorage.getItem('tab-debug-positions');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return MAP_TABS.map(t => t.lngLat);
  });
  const dragState = useRef<{ idx: number; startClientX: number; startClientY: number; startPx: number; startPy: number } | null>(null);

  // Persist debug positions to localStorage so they survive page refresh
  useEffect(() => {
    if (!IS_DEBUG) return;
    localStorage.setItem('tab-debug-positions', JSON.stringify(debugLngLats));
  }, [debugLngLats]);

  useEffect(() => {
    if (!IS_DEBUG) return;
    const onMouseMove = (e: MouseEvent) => {
      if (!dragState.current || !map) return;
      const dx = e.clientX - dragState.current.startClientX;
      const dy = e.clientY - dragState.current.startClientY;
      const newPx = dragState.current.startPx + dx;
      const newPy = dragState.current.startPy + dy;
      const ll = map.unproject([newPx, newPy]);
      setDebugLngLats(prev => {
        const next = [...prev] as [number, number][];
        next[dragState.current!.idx] = [ll.lng, ll.lat];
        return next;
      });
    };
    const onMouseUp = () => { dragState.current = null; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => { window.removeEventListener('mousemove', onMouseMove); window.removeEventListener('mouseup', onMouseUp); };
  }, [map]);

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
    const effectiveLngLats = IS_DEBUG ? debugLngLats : MAP_TABS.map(t => t.lngLat);
    const updatePositions = () => {
      setTabPositions(effectiveLngLats.map((ll) => map.project(ll)));
    };
    updatePositions();
    map.on('move', updatePositions);
    window.addEventListener('resize', updatePositions);
    return () => {
      map.off('move', updatePositions);
      window.removeEventListener('resize', updatePositions);
    };
  }, [map, debugLngLats]);

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

        {/* Left info card */}
        <div
          className="absolute glass-65 glass-shadow"
          style={{
            left: 16, top: 132, width: 386, height: 860,
            borderRadius: 16,
            pointerEvents: 'auto',
            display: 'flex', flexDirection: 'column',
            overflow: 'hidden',
          }}
        >

          {/* ── Card header ── */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px 13px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <MapPin size={17} color="#1e2939" strokeWidth={2} />
              <span style={{ fontSize: 16, fontWeight: 600, color: '#1e2939', letterSpacing: '-0.44px', lineHeight: '28px' }}>
                Critical Zones
              </span>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, letterSpacing: '0.1px',
              color: '#1e4b8f', background: 'rgba(30,75,143,0.10)',
              border: '1px solid rgba(30,75,143,0.20)',
              borderRadius: 100, padding: '4px 11px',
            }}>
              5 zones
            </span>
          </div>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '0 12px' }} />

          {/* ── Context ── */}
          <p style={{ margin: '13px 16px 0', fontSize: 17, fontWeight: 500, color: '#6b7280', lineHeight: '24px', letterSpacing: '-0.44px' }}>
            The locations shown on the map and listed below are areas that require targeted adaptations to prepare the district against coastal flooding.
          </p>

          {/* ── Instruction hint ── */}
          <div style={{
            margin: '12px 16px 0', padding: '10px 13px',
            background: 'rgba(0,0,0,0.04)', borderRadius: 11,
            display: 'flex', alignItems: 'center', gap: 9,
          }}>
            <MousePointerClick size={15} color="#1e2939" strokeWidth={2} style={{ flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', lineHeight: '20px' }}>
              Select a zone on the map or below to begin its assessment
            </span>
          </div>

          <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', margin: '16px 12px 0' }} />

          {/* ── Zone cards ── */}
          <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 8px 0', overflowY: 'auto', flex: 1 }}>
            {ZONE_LIST.map(({ label, svgPath }) => {
              const isExpanded = expandedZone === label;
              const hoverData = HOVER_DATA[label];
              return (
                <div
                  key={label}
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: 12,
                    marginBottom: 6,
                    overflow: 'hidden',
                    flexShrink: 0,
                  }}
                >
                  <div
                    onClick={() => setExpandedZone(isExpanded ? null : label)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', cursor: 'pointer' }}
                  >
                    <svg viewBox="0 0 24 24" width={32} height={32} fill="none" style={{ flexShrink: 0 }}>
                      <rect width="24" height="24" rx="12" style={{ fill: ZONE_ACCENT[label] }} />
                      <path d={svgPath} fill="white" />
                    </svg>
                    <span style={{ fontSize: 14, fontWeight: 500, color: '#1e2939', letterSpacing: '-0.3px', lineHeight: '20px', flex: 1 }}>
                      {label}
                    </span>
                    <ChevronDown
                      size={15}
                      color="rgba(30,41,57,0.40)"
                      strokeWidth={2}
                      style={{
                        flexShrink: 0,
                        transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    />
                  </div>
                  {isExpanded && (
                    <div style={{ padding: '0 12px 12px' }}>
                      <div style={{ height: 1, background: 'rgba(0,0,0,0.07)', marginBottom: 10 }} />
                      <p style={{ margin: 0, fontSize: 13, fontWeight: 400, color: '#6b7280', lineHeight: '19px', letterSpacing: '-0.2px' }}>
                        {hoverData.description}
                      </p>
                      <p style={{ margin: '8px 0 0', fontSize: 13, fontWeight: 500, color: '#1e2939', lineHeight: '19px', letterSpacing: '-0.2px' }}>
                        <span style={{ color: '#6b7280', fontWeight: 400 }}>Proposed: </span>{hoverData.proposed}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Simulate button pinned to bottom ── */}
          <div style={{ padding: '0 16px 16px' }}>
            <button
              onClick={onPlan}
              style={{
                width: '100%', height: 44, borderRadius: 12,
                background: 'rgba(16,24,40,0.9)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'auto',
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 600, color: 'white', letterSpacing: '-0.3px' }}>Simulate response scenarios</span>
            </button>
          </div>
        </div>
      </ScaledLayout>

      {/* Back button — viewport space so it aligns with the scaled canvas */}
      <button
        onClick={onBack}
        style={{
          position: 'absolute',
          top: Math.round(80 * scale),
          left: Math.round(26 * scale),
          width: Math.round(36 * scale),
          height: Math.round(36 * scale),
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.65)',
          backdropFilter: 'blur(12px)',
          border: 'none',
          cursor: 'pointer', pointerEvents: 'auto', zIndex: 20,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: Math.round(17 * scale), color: '#1e2939', lineHeight: 1 }}>←</span>
      </button>

      {/* Progress bar — right:16px in viewport space matches HomePageHeader exactly */}
      <div
        className="glass-65 glass-shadow"
        style={{
          position: 'absolute',
          top: Math.round(80 * scale),
          left: Math.round(70 * scale),
          right: 16,
          height: Math.round(36 * scale),
          borderRadius: Math.round(18 * scale),
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 20,
        }}
      >
        {/* SVG fills 100% width — viewBox 1426×36 stretches proportionally with the container */}
        <svg
          width="100%" height="100%"
          viewBox="0 0 1426 36"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        >
          <polygon points="0,0 284,0 298,18 284,36 0,36" fill="#1e2939" />
          <path d="M284,0 L298,18 L284,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M566,0 L580,18 L566,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M848,0 L862,18 L848,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
          <path d="M1130,0 L1144,18 L1130,36" stroke="rgba(30,41,57,0.45)" strokeWidth="1.5" fill="none" style={{ vectorEffect: 'non-scaling-stroke' } as React.CSSProperties} />
        </svg>

        {/* Labels — percentage-based positions mirror the viewBox fractions */}
        {/* Step 1: 0/1426 → 298/1426 = 0%→20.90% */}
        <div style={{ position: 'absolute', left: '0%', top: 0, width: '20.90%', height: '100%', display: 'flex', alignItems: 'center', paddingLeft: '1.4%', paddingRight: '1.7%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 600, color: 'white', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Assess critical zones
          </span>
        </div>
        {/* Step 2: 20.90%→40.67% */}
        <div style={{ position: 'absolute', left: '20.90%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Simulate response scenarios
          </span>
        </div>
        {/* Step 3: 40.67%→60.45% */}
        <div style={{ position: 'absolute', left: '40.67%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Compare intervention options
          </span>
        </div>
        {/* Step 4: 60.45%→80.22% */}
        <div style={{ position: 'absolute', left: '60.45%', top: 0, width: '19.77%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.5%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Assign Teams & Tasks
          </span>
        </div>
        {/* Step 5: 80.22%→100% */}
        <div style={{ position: 'absolute', left: '80.22%', top: 0, width: '19.78%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingLeft: '0.7%', paddingRight: '1.1%' }}>
          <span style={{ fontSize: Math.round(13 * scale), fontWeight: 500, color: '#1e2939', letterSpacing: '-0.2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Launch action plan
          </span>
        </div>
      </div>

      <HomePageHeader />

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
            width: animDone ? (isOpen ? 280 : 45) : 45,
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
            cursor: IS_DEBUG ? 'grab' : (handler ? 'pointer' : 'default'),
            pointerEvents: 'auto',
            outline: IS_DEBUG ? '2px dashed rgba(255,100,0,0.5)' : undefined,
          };

          const pillRow = (
            <div style={{
              width: 45,
              height: 45,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: ZONE_ACCENT[tab.title] || '#888',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <img src={tab.icon} alt="" width={20} height={20} />
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
                onClick={IS_DEBUG ? undefined : handler}
                onMouseEnter={() => handleEnter(tab.title)}
                onMouseLeave={handleLeave}
                onMouseDown={IS_DEBUG ? (e) => {
                  dragState.current = { idx: i, startClientX: e.clientX, startClientY: e.clientY, startPx: pos.x, startPy: pos.y };
                  e.preventDefault();
                } : undefined}
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
                left: pos.x + 18,
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
      {/* Debug position overlay — visible only with ?debug in URL */}
      {IS_DEBUG && (
        <div style={{
          position: 'fixed', bottom: 16, right: 16, zIndex: 9999,
          background: 'rgba(0,0,0,0.88)', color: '#0f0', fontFamily: 'monospace',
          fontSize: 11, borderRadius: 8, padding: '10px 14px', maxWidth: 440,
          userSelect: 'text', pointerEvents: 'auto',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, color: 'white' }}>🔧 Tab positions — drag to move</span>
            <button
              onClick={() => {
                const txt = MAP_TABS.map((tab, i) =>
                  `  { lngLat: [${debugLngLats[i][0].toFixed(6)}, ${debugLngLats[i][1].toFixed(6)}] as [number,number], ... }, // ${tab.title}`
                ).join('\n');
                navigator.clipboard.writeText(txt);
              }}
              style={{ marginLeft: 12, padding: '2px 8px', background: '#333', border: '1px solid #555', borderRadius: 4, color: 'white', cursor: 'pointer', fontSize: 11 }}
            >
              Copy
            </button>
          </div>
          {MAP_TABS.map((tab, i) => (
            <div key={tab.title} style={{ marginBottom: 3 }}>
              <span style={{ color: '#aaa' }}>{tab.title.slice(0, 22).padEnd(24)}</span>
              <span style={{ color: '#0f0' }}>[{debugLngLats[i][0].toFixed(6)}, {debugLngLats[i][1].toFixed(6)}]</span>
            </div>
          ))}
          <div style={{ marginTop: 8, color: '#666', fontSize: 10 }}>Positions auto-saved · refresh safe</div>
        </div>
      )}
    </>
  );
}
