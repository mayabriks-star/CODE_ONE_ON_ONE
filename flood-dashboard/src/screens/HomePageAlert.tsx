import { useState } from 'react';
import ScaledLayout from '../components/layout/ScaledLayout';
import FloodDepthScale from '../components/shared/FloodDepthScale';
import HomePageHeader from '../components/shared/HomePageHeader';
import LiveMonitoringPanel from '../components/dashboard/LiveMonitoringPanel';
import TimeView from '../components/dashboard/TimeView';
import NewAlertCard from '../components/dashboard/NewAlertCard';

interface Props {
  onRedZoneClick: (clientX: number, clientY: number) => void;
  onAlertClick?: () => void;
}

export default function HomePageAlert({ onRedZoneClick, onAlertClick }: Props) {
  const [zoneHovered, setZoneHovered] = useState(false);

  return (
    <>
      <ScaledLayout className="screen-enter">
        <FloodDepthScale positionClassName="absolute left-[21px] top-[888px]" />
        <LiveMonitoringPanel />
        <NewAlertCard onClick={onAlertClick} />
        <TimeView />

        {/* Hover alert card — appears directly over the red zone */}
        <div
          className="absolute z-20"
          style={{
            left: 560,
            top: 155,
            width: 320,
            pointerEvents: 'none',
            opacity: zoneHovered ? 1 : 0,
            transition: 'opacity 0.2s ease',
          }}
        >
          <div
            style={{
              background: 'rgba(180, 30, 40, 0.92)',
              backdropFilter: 'blur(8px)',
              borderRadius: 12,
              padding: '10px 14px',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
            }}
          >
            <span style={{ fontWeight: 700, fontSize: 15, color: 'white', lineHeight: '20px' }}>
              Harbor District
            </span>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 500, lineHeight: '22px', color: 'rgba(255,255,255,0.9)' }}>
              Severe alert issued for this area
            </p>
          </div>
        </div>

        {/* Invisible hotspot over the red zone district on the map */}
        <div
          className="absolute cursor-pointer z-10"
          style={{ left: 550, top: 110, width: 480, height: 300 }}
          onClick={(e) => onRedZoneClick(e.clientX, e.clientY)}
          onMouseEnter={() => setZoneHovered(true)}
          onMouseLeave={() => setZoneHovered(false)}
          aria-label="Zoom into Harbor District"
        />
      </ScaledLayout>

      <HomePageHeader showBadge />
    </>
  );
}
