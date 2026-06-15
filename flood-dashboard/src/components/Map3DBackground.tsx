import { useEffect, useRef } from 'react';

// ─── Paste your Google Maps API key here ───────────────────────────────────
// Get one free at console.cloud.google.com → Enable "Map Tiles API" + "Maps JavaScript API"
const GOOGLE_KEY = 'YOUR_GOOGLE_MAPS_KEY';

// Script tag id — prevents duplicate script injection on hot-reload
const SCRIPT_ID = 'google-maps-3d-api';

interface Props {
  /** Geographic center the camera looks at */
  lat?: number;
  lng?: number;
  altitude?: number;   // meters above ground
  /** Distance from camera to center point (meters). Lower = closer in. */
  range?: number;
  /** Camera tilt: 0 = top-down, 75 = near-horizontal */
  tilt?: number;
  /** Compass heading: 0/360 = north, 90 = east */
  heading?: number;
}

export default function Map3DBackground({
  lat      = 32.0940,
  lng      = 34.7847,
  altitude = 150,
  range    = 3000,
  tilt     = 63,
  heading  = 345,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    function mountMap() {
      const g = (window as Record<string, unknown>).google as {
        maps: { maps3d: { Map3DElement: new () => HTMLElement & Record<string, unknown> } };
      } | undefined;
      if (!g?.maps?.maps3d?.Map3DElement) return;

      container.innerHTML = '';

      const map3d = new g.maps.maps3d.Map3DElement();
      map3d['center']  = { lat, lng, altitude };
      map3d['range']   = range;
      map3d['tilt']    = tilt;
      map3d['heading'] = heading;
      // Hide Google's built-in controls so our UI isn't covered
      map3d['defaultUIDisabled'] = true;

      Object.assign((map3d as HTMLElement).style, {
        width: '100%', height: '100%', display: 'block',
      });

      container.appendChild(map3d);
    }

    // Already loaded (e.g. hot-reload)
    if ((window as Record<string, unknown>).google) {
      mountMap();
      return;
    }

    // Inject script once
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id   = SCRIPT_ID;
      script.src  = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_KEY}&libraries=maps3d&v=alpha`;
      script.async = true;
      script.onload = mountMap;
      document.head.appendChild(script);
    } else {
      // Script tag is present but still loading — wait for it
      document.getElementById(SCRIPT_ID)!.addEventListener('load', mountMap);
    }

    return () => { container.innerHTML = ''; };
  // Props are read at mount; changing them requires remounting anyway
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    />
  );
}
