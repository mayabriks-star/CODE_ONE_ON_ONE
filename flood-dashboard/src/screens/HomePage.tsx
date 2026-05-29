import ScaledLayout from '../components/layout/ScaledLayout';
import FloodDepthScale from '../components/shared/FloodDepthScale';
import HomePageHeader from '../components/shared/HomePageHeader';
import LiveMonitoringPanel from '../components/dashboard/LiveMonitoringPanel';
import TimeView from '../components/dashboard/TimeView';

export default function HomePage() {
  return (
    <>
      <ScaledLayout className="screen-enter">
        <LiveMonitoringPanel vulnerableDistricts="3" />
        <TimeView />
        <FloodDepthScale positionClassName="absolute left-[21px] top-[888px]" />
      </ScaledLayout>

      <HomePageHeader />
    </>
  );
}
