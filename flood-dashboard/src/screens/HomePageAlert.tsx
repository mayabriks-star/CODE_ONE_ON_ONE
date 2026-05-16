import ScaledLayout from '../components/layout/ScaledLayout';
import FloodDepthScale from '../components/shared/FloodDepthScale';
import ModeSelector from '../components/shared/ModeSelector';
import TopStatusBar from '../components/shared/TopStatusBar';
import LiveMonitoringPanel from '../components/dashboard/LiveMonitoringPanel';
import TimeView from '../components/dashboard/TimeView';
import BottomSummaryBar from '../components/dashboard/BottomSummaryBar';
import NewAlertCard from '../components/dashboard/NewAlertCard';

interface Props {
  onAlertClick: () => void;
}

export default function HomePageAlert({ onAlertClick }: Props) {
  return (
    <>
      <ScaledLayout className="screen-enter">
        <FloodDepthScale />
        <LiveMonitoringPanel />
        <NewAlertCard onClick={onAlertClick} />
        <TimeView />
      </ScaledLayout>

      <ModeSelector />
      <TopStatusBar showBadge />
      <BottomSummaryBar />
    </>
  );
}
