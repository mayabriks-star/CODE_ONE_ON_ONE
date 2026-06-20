import { useState, useEffect, useRef } from 'react';
import HomePage from './screens/HomePage';
import HomePageAlert from './screens/HomePageAlert';
import AlertPage from './screens/AlertPage';
import AssessCriticalZonesPage from './screens/AssessCriticalZonesPage';
import ResponsePlanningPage from './screens/ResponsePlanningPage';
import CoastalRoadAccessPage from './screens/CoastalRoadAccessPage';
import VulnerableResidentsPage from './screens/VulnerableResidentsPage';
import ElectricUtilityPage from './screens/ElectricUtilityPage';
import ResidentialEdgePage from './screens/ResidentialEdgePage';
import PumpCapacityPage from './screens/PumpCapacityPage';

type Screen = 'home' | 'home-alert' | 'alert' | 'assess-critical-zones' | 'planning' | 'coastal-road' | 'vulnerable-residents' | 'electric-utility' | 'residential-edge' | 'pump-capacity';

const bgBase = {
  backgroundSize: 'cover' as const,
  backgroundPosition: 'center' as const,
  backgroundRepeat: 'no-repeat' as const,
};

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [transiting, setTransiting] = useState<'none' | 'zoom-in' | 'zoom-out'>('none');
  const [detailReturnScreen, setDetailReturnScreen] = useState<'assess-critical-zones' | 'planning'>('assess-critical-zones');
  const [approvedZones, setApprovedZones] = useState<string[]>([]);
  const assessVisited = useRef(false);

  const s2Ref = useRef<HTMLDivElement | null>(null);
  const s3BgRef = useRef<HTMLDivElement | null>(null);
  const s3Ref = useRef<HTMLDivElement | null>(null);
  const s2BgRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (screen !== 'home') return;
    const timer = setTimeout(() => setScreen('home-alert'), 10_000);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    if (screen === 'assess-critical-zones' && !assessVisited.current) {
      assessVisited.current = true;
    }
  }, [screen]);

  function handleRedZoneClick(clientX: number, clientY: number) {
    cancelAnimationFrame(rafRef.current);
    setTransiting('zoom-in');

    const DURATION = 1000;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const MAX_SCALE = 5.5;
    const start = performance.now();

    function frame(now: number) {
      const rawT = Math.min((now - start) / DURATION, 1);
      const easedT = easeOut(rawT);

      if (s2Ref.current) {
        const scale = 1 + easedT * 4.5;
        const tx = MAX_SCALE * easedT * (vw / 2 - clientX);
        const ty = MAX_SCALE * easedT * (vh / 2 - clientY);
        const opacity = rawT < 0.7 ? 1 : 1 - (rawT - 0.7) / 0.3;
        s2Ref.current.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
        s2Ref.current.style.opacity = String(Math.max(0, opacity));
      }

      if (s3BgRef.current) {
        const op = rawT < 0.7 ? 0 : (rawT - 0.7) / 0.3;
        s3BgRef.current.style.opacity = String(Math.min(1, op));
      }

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setScreen('alert');
        setTransiting('none');
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  function handleOpenAssessCriticalZones() {
    setScreen('assess-critical-zones');
  }

  function handleOpenPlanning() {
    setScreen('planning');
  }

  function handleOpenCoastalRoad(from: 'assess-critical-zones' | 'planning' = 'assess-critical-zones') {
    setDetailReturnScreen(from);
    setScreen('coastal-road');
  }

  function handleOpenVulnerableResidents(from: 'assess-critical-zones' | 'planning' = 'assess-critical-zones') {
    setDetailReturnScreen(from);
    setScreen('vulnerable-residents');
  }

  function handleOpenElectricUtility() {
    setDetailReturnScreen('assess-critical-zones');
    setScreen('electric-utility');
  }

  function handleOpenResidentialEdge() {
    setDetailReturnScreen('assess-critical-zones');
    setScreen('residential-edge');
  }

  function handleOpenPumpCapacity() {
    setDetailReturnScreen('assess-critical-zones');
    setScreen('pump-capacity');
  }

  function handleApproveZone(zoneName: string) {
    setApprovedZones(prev => prev.includes(zoneName) ? prev : [...prev, zoneName]);
    setScreen('assess-critical-zones');
  }

  function handleZoomOut() {
    cancelAnimationFrame(rafRef.current);
    setTransiting('zoom-out');

    const DURATION = 700;
    const start = performance.now();

    function frame(now: number) {
      const rawT = Math.min((now - start) / DURATION, 1);
      const easedT = easeOut(rawT);

      if (s3Ref.current) {
        const scale = 1 - easedT * 0.75;
        const opacity = rawT < 0.3 ? 1 : 1 - (rawT - 0.3) / 0.7;
        s3Ref.current.style.transform = `scale(${Math.max(0.25, scale)})`;
        s3Ref.current.style.opacity = String(Math.max(0, opacity));
      }

      if (s2BgRef.current) {
        const op = rawT < 0.3 ? 0 : (rawT - 0.3) / 0.7;
        s2BgRef.current.style.opacity = String(Math.min(1, op));
      }

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setScreen('home-alert');
        setTransiting('none');
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* Screen 1 */}
      {screen === 'home' && (
        <div className="absolute inset-0" style={{ ...bgBase, backgroundImage: "url('/home-page-new-map.png')" }}>
          <HomePage />
        </div>
      )}

      {/* Harbor background — bottom layer during zoom-in; rAF fades opacity 0→1 in last 30% */}
      {screen === 'home-alert' && transiting === 'zoom-in' && (
        <div
          ref={s3BgRef}
          className="absolute inset-0"
          style={{ ...bgBase, backgroundImage: "url('/harbor-district-bg.png')", opacity: 0 }}
        />
      )}

      {/* Screen 2 — rAF drives translate + scale + opacity during zoom-in */}
      {screen === 'home-alert' && (
        <div
          ref={s2Ref}
          className="absolute inset-0"
          style={{ ...bgBase, backgroundImage: "url('/coastal-background.png')" }}
        >
          <HomePageAlert onRedZoneClick={handleRedZoneClick} />
        </div>
      )}

      {/* Coastal background — bottom layer during zoom-out; rAF fades opacity 0→1 after first 30% */}
      {screen === 'alert' && transiting === 'zoom-out' && (
        <div
          ref={s2BgRef}
          className="absolute inset-0"
          style={{ ...bgBase, backgroundImage: "url('/coastal-background.png')", opacity: 0 }}
        />
      )}

      {/* Screen 3 — rAF drives scale + opacity during zoom-out */}
      {screen === 'alert' && (
        <div
          ref={s3Ref}
          className="absolute inset-0"
          style={{ ...bgBase, backgroundImage: "url('/harbor-district-bg.png')" }}
        >
          <AlertPage onZoomOut={handleZoomOut} onPlan={handleOpenAssessCriticalZones} />
        </div>
      )}
      {/* Screen 4 — Assess Critical Zones: same harbor map background */}
      {screen === 'assess-critical-zones' && (
        <div className="absolute inset-0" style={{ ...bgBase, backgroundImage: "url('/harbor-district-bg.png')" }}>
          <AssessCriticalZonesPage
            onBack={() => setScreen('alert')}
            onPlan={handleOpenPlanning}
            onCoastalRoad={() => handleOpenCoastalRoad('assess-critical-zones')}
            onVulnerableResidents={() => handleOpenVulnerableResidents('assess-critical-zones')}
            onElectricUtility={handleOpenElectricUtility}
            onResidentialEdge={handleOpenResidentialEdge}
            onPumpCapacity={handleOpenPumpCapacity}
            skipAnimation={assessVisited.current}
            approvedZones={approvedZones}
          />
        </div>
      )}
      {/* Screen 5 — Response Planning: full white page, no background image */}
      {screen === 'planning' && (
        <div className="absolute inset-0" style={{ background: '#F9FAFB' }}>
          <ResponsePlanningPage
            onBack={() => setScreen('assess-critical-zones')}
            onCoastalRoad={() => handleOpenCoastalRoad('planning')}
            onVulnerableResidents={() => handleOpenVulnerableResidents('planning')}
          />
        </div>
      )}
      {/* Screen 6 — Costal Road Access detail */}
      {screen === 'coastal-road' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <CoastalRoadAccessPage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Costal Road Access')} />
        </div>
      )}
      {/* Screen 7 — Vulnerable Residents detail */}
      {screen === 'vulnerable-residents' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <VulnerableResidentsPage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Vulnerable Residents')} />
        </div>
      )}
      {/* Screen 8 — Electric Utility Point detail */}
      {screen === 'electric-utility' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <ElectricUtilityPage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Electric Utility Point')} />
        </div>
      )}
      {/* Screen 9 — Residential Edge Blocks detail */}
      {screen === 'residential-edge' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <ResidentialEdgePage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Residential Edge Blocks')} />
        </div>
      )}
      {/* Screen 10 — Increase Pump Capacity detail */}
      {screen === 'pump-capacity' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <PumpCapacityPage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Increase pump capacity')} />
        </div>
      )}
    </div>
  );
}
