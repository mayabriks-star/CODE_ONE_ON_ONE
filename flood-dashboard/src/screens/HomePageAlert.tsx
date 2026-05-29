import ScaledLayout from '../components/layout/ScaledLayout';
import FloodDepthScale from '../components/shared/FloodDepthScale';
import HomePageHeader from '../components/shared/HomePageHeader';
import LiveMonitoringPanel from '../components/dashboard/LiveMonitoringPanel';
import TimeView from '../components/dashboard/TimeView';
import NewAlertCard from '../components/dashboard/NewAlertCard';

interface Props {
  onRedZoneClick: (clientX: number, clientY: number) => void;
}

export default function HomePageAlert({ onRedZoneClick }: Props) {
  return (
    <>
      <ScaledLayout className="screen-enter">
        <FloodDepthScale positionClassName="absolute left-[21px] top-[888px]" />
        <LiveMonitoringPanel />
        <NewAlertCard />
        <TimeView />
        {/* Invisible hotspot over the red zone district on the map */}
        <div
          className="absolute cursor-pointer z-10"
          style={{ left: 490, top: 130, width: 560, height: 370 }}
          onClick={(e) => onRedZoneClick(e.clientX, e.clientY)}
          aria-label="Zoom into Harbor District"
        />
      </ScaledLayout>

      <HomePageHeader showBadge />
    </>
  );
}
