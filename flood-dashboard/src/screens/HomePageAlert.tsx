import ScaledLayout from '../components/layout/ScaledLayout';
import FloodDepthScale from '../components/shared/FloodDepthScale';
import HomePageHeader from '../components/shared/HomePageHeader';
import LiveMonitoringPanel from '../components/dashboard/LiveMonitoringPanel';
import TimeView from '../components/dashboard/TimeView';
import NewAlertCard from '../components/dashboard/NewAlertCard';

interface Props {
  onAlertClick: () => void;
}

export default function HomePageAlert({ onAlertClick }: Props) {
  return (
    <>
      <ScaledLayout className="screen-enter">
        <FloodDepthScale positionClassName="absolute left-[21px] top-[888px]" />
        <LiveMonitoringPanel />
        <NewAlertCard onClick={onAlertClick} />
        <TimeView />
      </ScaledLayout>

      <HomePageHeader showBadge />
    </>
  );
}
