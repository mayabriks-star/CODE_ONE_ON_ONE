import { useState, useEffect, useRef } from 'react';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { GeoJsonLayer } from '@deck.gl/layers';
import ScaledLayout from '../components/layout/ScaledLayout';
import FloodDepthScale from '../components/shared/FloodDepthScale';
import HomePageHeader from '../components/shared/HomePageHeader';
import LiveMonitoringPanel from '../components/dashboard/LiveMonitoringPanel';
import TimeView from '../components/dashboard/TimeView';
import NewAlertCard from '../components/dashboard/NewAlertCard';

interface Props {
  onRedZoneClick: () => void;
  onAlertClick?: () => void;
  map?: any;
}

// Hazard-zone outline, captured as real lng/lat via the click-to-pin debug tool
// (map.unproject() on each click) — geo-anchored so it stays glued to these
// buildings regardless of window size, zoom, or pitch.
const HAZARD_ZONE_RING: [number, number][] = [
  [-80.188278, 25.76591], [-80.188168, 25.767006], [-80.188107, 25.767804], [-80.188011, 25.768521],
  [-80.188156, 25.768968], [-80.188777, 25.769405], [-80.189402, 25.7692], [-80.189987, 25.769369],
  [-80.190709, 25.769559], [-80.191674, 25.769555], [-80.192593, 25.769414], [-80.193242, 25.769041],
  [-80.193803, 25.768494], [-80.194331, 25.768119], [-80.194922, 25.768153], [-80.19572, 25.768124],
  [-80.195491, 25.766947], [-80.195441, 25.765439], [-80.195261, 25.764489], [-80.195285, 25.763629],
  [-80.19528, 25.762533], [-80.195117, 25.761552], [-80.195037, 25.760907], [-80.194963, 25.760586],
  [-80.194734, 25.760514], [-80.194057, 25.760481], [-80.193582, 25.76049], [-80.193274, 25.760484],
  [-80.192735, 25.760375], [-80.192321, 25.760368], [-80.19095, 25.760826], [-80.188743, 25.761558],
  [-80.18869, 25.762004], [-80.188599, 25.762642], [-80.188588, 25.762877],
];

const HAZARD_ZONE_CENTROID: [number, number] = (() => {
  const sum = HAZARD_ZONE_RING.reduce((acc, [lng, lat]) => [acc[0] + lng, acc[1] + lat], [0, 0]);
  return [sum[0] / HAZARD_ZONE_RING.length, sum[1] / HAZARD_ZONE_RING.length];
})();

const HAZARD_ZONE_POLYGON = {
  type: 'Feature' as const,
  geometry: { type: 'Polygon' as const, coordinates: [[...HAZARD_ZONE_RING, HAZARD_ZONE_RING[0]]] },
  properties: {},
};

export default function HomePageAlert({ onRedZoneClick, onAlertClick, map }: Props) {
  const [zoneHovered, setZoneHovered] = useState(false);
  const [zoneVisible, setZoneVisible] = useState(false);
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(null);
  const zoneVisibleRef = useRef(false);
  const onRedZoneClickRef = useRef(onRedZoneClick);
  onRedZoneClickRef.current = onRedZoneClick;
  const revealRef = useRef<() => void>(() => {});

  useEffect(() => {
    if (!map) return;

    // Non-interleaved overlay: renders as a flat, always-on-top 2D screen
    // layer, immune to depth-occlusion from the interleaved 3D building
    // tiles (a native MapLibre fill layer at ground level gets hidden under
    // the buildings from this oblique camera — this overlay doesn't).
    const overlay = new MapboxOverlay({ interleaved: false, layers: [] });
    map.addControl(overlay);

    const setLayers = (opacity: number) => {
      overlay.setProps({
        layers: [
          new GeoJsonLayer({
            id: 'hazard-zone',
            data: HAZARD_ZONE_POLYGON,
            filled: true,
            stroked: true,
            getFillColor: [220, 40, 40, Math.round(opacity * 0.38 * 255)],
            getLineColor: [220, 40, 40, Math.round(opacity * 0.75 * 255)],
            lineWidthMinPixels: 2.5,
            pickable: true,
            onClick: () => {
              if (zoneVisibleRef.current) onRedZoneClickRef.current();
            },
            onHover: (info: any) => {
              if (!zoneVisibleRef.current) return;
              setZoneHovered(!!info.picked);
              map.getCanvas().style.cursor = info.picked ? 'pointer' : '';
            },
          }),
        ],
      });
    };
    setLayers(0);

    // Reveal logic, called from the blocking DOM overlay's onClick (see JSX
    // below) — not from a window-level listener, since deck.gl's picking
    // resolves on pointerdown/pointerup, which fire before any 'click' event
    // could be intercepted. A real DOM element on top of the canvas is the
    // only thing that reliably stops the click from reaching the map at all.
    revealRef.current = () => {
      if (zoneVisibleRef.current) return;
      setZoneVisible(true);
      setLayers(1);
      setTimeout(() => {
        zoneVisibleRef.current = true;
      }, 0);
    };

    const updateCardPos = () => {
      const { x, y } = map.project(HAZARD_ZONE_CENTROID);
      setCardPos({ x, y });
    };
    updateCardPos();
    map.on('move', updateCardPos);

    return () => {
      map.off('move', updateCardPos);
      map.removeControl(overlay);
    };
  }, [map]);

  return (
    <>
      <ScaledLayout className="screen-enter">
        <FloodDepthScale positionClassName="absolute left-[21px] top-[888px]" />
        <LiveMonitoringPanel />
        {zoneVisible && <NewAlertCard onClick={onAlertClick} />}
        <TimeView />
      </ScaledLayout>

      {/* Blocks the very first click from ever reaching the map canvas, so the
          Photoreal3DLayer's own click-to-zoom can't fire on the reveal click.
          A real DOM element is the only reliable way to stop this — deck.gl's
          picking resolves on pointerdown/pointerup, before any 'click' event
          could be intercepted via JS event listeners. Unmounts after one click. */}
      {!zoneVisible && (
        <div
          onClick={() => revealRef.current()}
          style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'pointer', pointerEvents: 'auto' }}
        />
      )}

      {/* Hover alert card — appears over the red zone, positioned via map.project() */}
      {cardPos && (
        <div
          className="absolute z-20"
          style={{
            left: cardPos.x - 160,
            top: cardPos.y - 80,
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
      )}

      <HomePageHeader showBadge map={map} />
    </>
  );
}
