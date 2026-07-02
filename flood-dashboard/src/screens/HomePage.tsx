import ScaledLayout from '../components/layout/ScaledLayout';
import HomePageHeader from '../components/shared/HomePageHeader';
import LiveMonitoringPanelV2 from '../components/dashboard/LiveMonitoringPanelV2';

export default function HomePage() {
  return (
    <>
      <ScaledLayout className="screen-enter">
        <LiveMonitoringPanelV2 />
      </ScaledLayout>

      <HomePageHeader />
    </>
  );
}
