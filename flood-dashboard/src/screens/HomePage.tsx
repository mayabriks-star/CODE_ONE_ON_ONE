import ScaledLayout from '../components/layout/ScaledLayout';
import FloodDepthScale from '../components/shared/FloodDepthScale';
import ModeSelector from '../components/shared/ModeSelector';
import TopStatusBar from '../components/shared/TopStatusBar';
import LiveMonitoringPanel from '../components/dashboard/LiveMonitoringPanel';
import TimeView from '../components/dashboard/TimeView';
import BottomSummaryBar from '../components/dashboard/BottomSummaryBar';

export default function HomePage() {
  return (
    <ScaledLayout className="screen-enter">
      <FloodDepthScale />
      <ModeSelector />
      <TopStatusBar />
      <LiveMonitoringPanel />
      <TimeView />
      <BottomSummaryBar />
    </ScaledLayout>
  );
}
