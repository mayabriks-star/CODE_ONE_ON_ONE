import { useState, useEffect, useRef } from 'react';
import Map3DBackground from './components/Map3DBackground';
import HomePage from './screens/HomePage';
import HomePageAlert, { HAZARD_ZONE_CENTROID } from './screens/HomePageAlert';
import AlertPage from './screens/AlertPage';
import AlertPageV2 from './screens/AlertPageV2';

const USE_PREVIEW = new URLSearchParams(window.location.search).has('preview');
import AssessCriticalZonesPage from './screens/AssessCriticalZonesPage';
import ResponsePlanningPage from './screens/ResponsePlanningPage';
import CoastalRoadAccessPage from './screens/CoastalRoadAccessPage';
import VulnerableResidentsPage from './screens/VulnerableResidentsPage';
import ElectricUtilityPage from './screens/ElectricUtilityPage';
import ResidentialEdgePage from './screens/ResidentialEdgePage';
import PumpCapacityPage from './screens/PumpCapacityPage';
import CompareResponseScenariosPage from './screens/CompareResponseScenariosPage';
import type { ScenarioData } from './screens/CompareResponseScenariosPage';
import SimulateResponseScenariosPage from './screens/SimulateResponseScenariosPage';
import AllocateBudgetTeamsPage from './screens/AllocateBudgetTeamsPage';
import LaunchActionPlanPage from './screens/LaunchActionPlanPage';

type Screen = 'home' | 'home-alert' | 'alert' | 'assess-critical-zones' | 'simulate-scenarios' | 'planning' | 'compare-scenarios' | 'allocate-budget-teams' | 'launch-action-plan' | 'coastal-road' | 'vulnerable-residents' | 'electric-utility' | 'residential-edge' | 'pump-capacity';

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [screenHistory, setScreenHistory] = useState<Screen[]>([]);
  const [transiting, setTransiting] = useState<'none' | 'zoom-in' | 'zoom-out'>('none');
  const [detailReturnScreen, setDetailReturnScreen] = useState<'assess-critical-zones' | 'planning'>('assess-critical-zones');
  const [approvedZones, setApprovedZones] = useState<string[]>([]);
  const [simulatedScenario, setSimulatedScenario] = useState<ScenarioData | null>(null);
  const [planActivated, setPlanActivated] = useState(false);

  function navigate(to: Screen) {
    setScreenHistory(h => [...h, screen]);
    setScreen(to);
  }

  function handleMenuBack() {
    setScreenHistory(h => {
      const prev = h[h.length - 1];
      if (prev) setScreen(prev);
      return h.slice(0, -1);
    });
  }
  const assessVisited = useRef(false);

  const s2Ref = useRef<HTMLDivElement | null>(null);
  const s3Ref = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number>(0);
  const mapRef = useRef<any>(null);
  const cameraRef = useRef<{ center: [number, number]; zoom: number; pitch: number; bearing: number } | null>(null);

  useEffect(() => {
    if (screen !== 'home') return;
    const timer = setTimeout(() => setScreen('home-alert'), 3_000);
    return () => clearTimeout(timer);
  }, [screen]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  useEffect(() => {
    if (screen === 'assess-critical-zones' && !assessVisited.current) {
      assessVisited.current = true;
    }
  }, [screen]);

  // On return visits from detail screens, restore the map to where it was.
  // On first visit the map stays exactly as it was on the Alert screen - no camera change.
  useEffect(() => {
    if (screen === 'assess-critical-zones' && assessVisited.current && mapRef.current && cameraRef.current) {
      mapRef.current.jumpTo(cameraRef.current);
    }
  }, [screen]);

  function handleRedZoneClick() {
    cancelAnimationFrame(rafRef.current);
    setTransiting('zoom-in');

    const map = mapRef.current;
    if (map) {
      map.flyTo({
        center: HAZARD_ZONE_CENTROID,
        zoom: 19.0,
        pitch: 72,
        bearing: -10,
        duration: 2200,
        essential: true,
      });
      map.once('moveend', () => {
        setScreen('alert');
        setTransiting('none');
      });
    } else {
      setTimeout(() => { setScreen('alert'); setTransiting('none'); }, 500);
    }
  }

  function handleOpenAssessCriticalZones() {
    navigate('assess-critical-zones');
  }

  function handleOpenComparison(scenario: ScenarioData) {
    setSimulatedScenario(scenario);
    navigate('compare-scenarios');
  }

  function handleOpenAllocateBudget() {
    navigate('allocate-budget-teams');
  }

  function handleOpenSimulateScenarios() {
    navigate('simulate-scenarios');
  }

  function handleOpenCoastalRoad(from: 'assess-critical-zones' | 'planning' = 'assess-critical-zones') {
    setDetailReturnScreen(from);
    navigate('coastal-road');
  }

  function handleOpenVulnerableResidents(from: 'assess-critical-zones' | 'planning' = 'assess-critical-zones') {
    setDetailReturnScreen(from);
    navigate('vulnerable-residents');
  }

  function handleOpenElectricUtility() {
    setDetailReturnScreen('assess-critical-zones');
    navigate('electric-utility');
  }

  function handleOpenResidentialEdge() {
    setDetailReturnScreen('assess-critical-zones');
    navigate('residential-edge');
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

      if (rawT < 1) {
        rafRef.current = requestAnimationFrame(frame);
      } else {
        setScreen('home-alert');
        setTransiting('none');
        mapRef.current?.flyTo({
          center: [-80.1918, 25.765],
          zoom: 15.3,
          pitch: 50,
          bearing: -20,
          duration: 1200,
          essential: true,
        });
      }
    }

    rafRef.current = requestAnimationFrame(frame);
  }

  return (
    <div className="w-screen h-screen overflow-hidden relative">
      {/* 3D map - persistent background for all map-based screens */}
      {(screen === 'home' || screen === 'home-alert' || screen === 'alert' || screen === 'assess-critical-zones'
        || screen === 'simulate-scenarios' || screen === 'compare-scenarios' || screen === 'allocate-budget-teams'
        || screen === 'launch-action-plan'
        || screen === 'coastal-road' || screen === 'vulnerable-residents' || screen === 'electric-utility'
        || screen === 'residential-edge' || screen === 'pump-capacity') && (
        <Map3DBackground onMapReady={(m) => {
          mapRef.current = m;
          m.on('moveend', () => {
            cameraRef.current = {
              center: m.getCenter().toArray(),
              zoom: m.getZoom(),
              pitch: m.getPitch(),
              bearing: m.getBearing(),
            };
          });
        }} />
      )}

      {/* Screen 1 UI */}
      {screen === 'home' && (
        <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <HomePage />
        </div>
      )}

      {/* Screen 2 - rAF drives translate + scale + opacity during zoom-in */}
      {screen === 'home-alert' && (
        <div
          ref={s2Ref}
          className="absolute inset-0"
          style={transiting === 'zoom-in'
            ? { zIndex: 6, opacity: 0, transition: 'opacity 0.4s ease', pointerEvents: 'none' }
            : { zIndex: 10, pointerEvents: 'none' }
          }
        >
          <HomePageAlert onRedZoneClick={handleRedZoneClick} map={mapRef.current} planActivated={planActivated} onMenu={screenHistory.length > 0 ? handleMenuBack : undefined} />
        </div>
      )}

      {/* Screen 3 - rAF drives scale + opacity during zoom-out */}
      {screen === 'alert' && (
        <div
          ref={s3Ref}
          className="absolute inset-0"
          style={{ zIndex: 10, pointerEvents: 'none' }}
        >
          <AlertPageV2 onZoomOut={handleZoomOut} onPlan={handleOpenAssessCriticalZones} />
        </div>
      )}
      {/* Screen 4 - Assess Critical Zones */}
      {screen === 'assess-critical-zones' && (
        <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <AssessCriticalZonesPage
            onBack={() => setScreen('alert')}
            onPlan={handleOpenSimulateScenarios}
            onCoastalRoad={() => handleOpenCoastalRoad('assess-critical-zones')}
            onVulnerableResidents={() => handleOpenVulnerableResidents('assess-critical-zones')}
            onElectricUtility={handleOpenElectricUtility}
            onResidentialEdge={handleOpenResidentialEdge}
            onPumpCapacity={handleOpenPumpCapacity}
            skipAnimation={assessVisited.current}
            approvedZones={approvedZones}
            map={mapRef.current}
          />
        </div>
      )}
      {/* Screen - Simulate Response Scenarios */}
      {screen === 'simulate-scenarios' && (
        <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <SimulateResponseScenariosPage
            onBack={() => setScreen('assess-critical-zones')}
            onCompare={handleOpenComparison}
            map={mapRef.current}
          />
        </div>
      )}
      {/* Screen 5 - Response Planning: full white page, no background image */}
      {screen === 'planning' && (
        <div className="absolute inset-0" style={{ background: '#F9FAFB' }}>
          <ResponsePlanningPage
            onBack={() => setScreen('assess-critical-zones')}
            onCoastalRoad={() => handleOpenCoastalRoad('planning')}
            onVulnerableResidents={() => handleOpenVulnerableResidents('planning')}
          />
        </div>
      )}
      {/* Screen - Compare Response Scenarios */}
      {screen === 'compare-scenarios' && (
        <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <CompareResponseScenariosPage onBack={() => setScreen('assess-critical-zones')} onContinue={handleOpenAllocateBudget} selectedScenario={simulatedScenario ?? undefined} />
        </div>
      )}
      {/* Screen - Allocate Budget & Teams */}
      {screen === 'allocate-budget-teams' && (
        <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <AllocateBudgetTeamsPage
            onBack={() => setScreen('compare-scenarios')}
            onContinue={() => {
              setPlanActivated(true);
              navigate('home-alert');
              mapRef.current?.flyTo({
                center: [-80.1918, 25.765],
                zoom: 15.3,
                pitch: 50,
                bearing: -20,
                duration: 1200,
                essential: true,
              });
            }}
            map={mapRef.current}
          />
        </div>
      )}
      {/* Screen - Launch Action Plan */}
      {screen === 'launch-action-plan' && (
        <div className="absolute inset-0" style={{ zIndex: 10, pointerEvents: 'none' }}>
          <LaunchActionPlanPage
            onBack={() => setScreen('allocate-budget-teams')}
            onLaunch={() => setScreen('home-alert')}
          />
        </div>
      )}
      {/* Screen 6 - Costal Road Access detail */}
      {screen === 'coastal-road' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <CoastalRoadAccessPage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Costal Road Access')} />
        </div>
      )}
      {/* Screen 7 - Vulnerable Residents detail */}
      {screen === 'vulnerable-residents' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <VulnerableResidentsPage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Vulnerable Residents')} />
        </div>
      )}
      {/* Screen 8 - Electric Utility Point detail */}
      {screen === 'electric-utility' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <ElectricUtilityPage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Electric Utility Point')} />
        </div>
      )}
      {/* Screen 9 - Residential Edge Blocks detail */}
      {screen === 'residential-edge' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <ResidentialEdgePage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Residential Edge Blocks')} />
        </div>
      )}
      {/* Screen 10 - Increase Pump Capacity detail */}
      {screen === 'pump-capacity' && (
        <div className="absolute inset-0" style={{ background: '#f8f8f8' }}>
          <PumpCapacityPage onBack={() => setScreen(detailReturnScreen)} onApprove={() => handleApproveZone('Increase pump capacity')} />
        </div>
      )}
    </div>
  );
}
