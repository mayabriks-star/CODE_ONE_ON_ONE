import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAPTILER_KEY = 'OuwEqq9kz611vs566JKU';

// Tel Aviv Old Port (Namal) — Mediterranean harbor district
const DEFAULT_CENTER: [number, number] = [34.7847, 32.0940];

interface Props {
  /** Map center [lng, lat]. Defaults to Tel Aviv Old Port. */
  center?: [number, number];
  /** Zoom level. Screen 2 overview ≈ 15.5, Screen 3 zoomed-in ≈ 16.5 */
  zoom?: number;
  /** Camera pitch in degrees (0 = top-down, 85 = near-horizontal). */
  pitch?: number;
  /** Camera bearing in degrees (0 = north up). */
  bearing?: number;
}

export default function MapBackground({
  center  = DEFAULT_CENTER,
  zoom    = 15.5,
  pitch   = 62,
  bearing = -20,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_KEY}`,
      center,
      zoom,
      pitch,
      bearing,
      antialias: true,
      interactive: false,
      attributionControl: { compact: true },
    });

    map.on('load', () => {
      const styleSpec = map.getStyle();

      // Resolve the vector source that carries building footprints
      const sources = styleSpec.sources as Record<string, unknown>;
      const vectorSource =
        'maptiler_planet' in sources ? 'maptiler_planet' :
        'openmaptiles'    in sources ? 'openmaptiles'    :
        Object.keys(sources).find(
          id => (sources[id] as Record<string, unknown>)['type'] === 'vector',
        );

      // Insert 3D buildings below label layers
      let firstSymbolId: string | undefined;
      for (const layer of styleSpec.layers) {
        if (layer.type === 'symbol') { firstSymbolId = layer.id; break; }
      }

      // Hide existing flat 2D building fills to avoid z-fighting with the extrusion
      for (const layer of styleSpec.layers) {
        const l = layer as Record<string, unknown>;
        if (l['source-layer'] === 'building' && layer.type === 'fill') {
          try { map.setLayoutProperty(layer.id, 'visibility', 'none'); } catch {}
        }
      }

      if (vectorSource) {
        map.addLayer(
          {
            id: '3d-buildings',
            source: vectorSource,
            'source-layer': 'building',
            type: 'fill-extrusion',
            minzoom: 13,
            paint: {
              // Warm concrete → dark steel gradient by building height
              'fill-extrusion-color': [
                'interpolate', ['linear'],
                ['coalesce', ['get', 'render_height'], ['get', 'height'], 5],
                0,   '#e8e3dc',
                10,  '#d5cfc8',
                25,  '#bbb5ad',
                60,  '#9c9590',
                150, '#74706c',
              ],
              'fill-extrusion-height': [
                'coalesce', ['get', 'render_height'], ['get', 'height'], 5,
              ],
              'fill-extrusion-base': [
                'coalesce', ['get', 'render_min_height'], ['get', 'min_height'], 0,
              ],
              'fill-extrusion-opacity': 0.93,
              // Realistic contact shadows between adjacent buildings
              'fill-extrusion-ambient-occlusion-intensity': 0.55,
              'fill-extrusion-ambient-occlusion-radius': 5,
            },
          },
          firstSymbolId,
        );
      }

      // Flood-risk zone tint on the coastal strip
      map.addSource('flood-zone', {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[
              [34.768, 32.082],
              [34.798, 32.082],
              [34.800, 32.102],
              [34.768, 32.102],
              [34.768, 32.082],
            ]],
          },
          properties: {},
        },
      });
      map.addLayer({
        id: 'flood-zone-fill',
        source: 'flood-zone',
        type: 'fill',
        paint: { 'fill-color': '#1b4e8a', 'fill-opacity': 0.20 },
      });
    });

    return () => { map.remove(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally only run once — props are read at mount

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0 }}
    />
  );
}
