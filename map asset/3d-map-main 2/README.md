# Photoreal 3D City Map

An interactive **photorealistic 3D city map** (Google Earth-style) for the web.
It streams **Google Photorealistic 3D Tiles** and renders them with **deck.gl**
on top of a **MapLibre** base map. Pick a city, orbit and zoom the real 3D
skyline, and click a building to zoom toward it.

The UI is intentionally minimal: just the **3D map** and a **city picker**.

Built with **React + Vite**. No backend — it runs entirely in the browser and
talks directly to Google's tile API with your key.

---

## Table of contents

1. [What you need](#1-what-you-need)
2. [Get a Google Maps API key](#2-get-a-google-maps-api-key)
3. [Create your `.env` file](#3-create-your-env-file)
4. [Run it](#4-run-it)
5. [Configure (cities, area, quality)](#5-configure)
6. [Integrate into your own product](#6-integrate-into-your-own-product)
7. [Cost & security notes](#7-cost--security-notes)
8. [Troubleshooting](#8-troubleshooting)

---

## 1. What you need

- **Node.js 18+** and npm.
- A **Google Cloud account with billing enabled** (the photoreal tiles are a paid
  Google API — there's a small monthly free tier, then it's billed).

> There is no free or self-hostable source of photorealistic 3D buildings.
> Google streams that data live; the key is mandatory for the 3D map.

---

## 2. Get a Google Maps API key

1. Open the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a project (top bar → project dropdown → **New Project**), or pick one.
3. **Enable billing:** Billing → link a billing account to the project.
   *(Required even to use the free tier.)*
4. Enable the API: **APIs & Services → Library** → enable **Map Tiles API**.
5. Create the key: **APIs & Services → Credentials → Create credentials → API key**.
6. **Restrict the key** (recommended):
   - *API restrictions* → limit to **Map Tiles API**.
   - *Application restrictions* → **HTTP referrers**, add the sites that may use it,
     e.g. `http://localhost:5173/*` for local dev and `https://yourdomain.com/*`
     for production.

Copy the key string (looks like `AIza...`).

---

## 3. Create your `.env` file

In the project root, copy the example and paste your key:

```bash
cp .env.example .env
```

Then edit `.env`:

```ini
# Required: Google Maps Platform key (billing enabled)
VITE_GOOGLE_MAPS_KEY=AIza_your_key_here
```

Notes:
- The `VITE_` prefix is required — Vite only exposes those vars to the browser.
- `.env` is **gitignored**; never commit your key.
- Because this is a client-side app, the key is visible in the browser. That's
  expected for Google Maps web keys — protect it with the **HTTP referrer
  restrictions** from step 2.6, not by hiding it.

---

## 4. Run it

```bash
npm install
npm run dev        # dev server at http://localhost:5173
npm run build      # production build into dist/
npm run preview    # serve the production build locally
```

Open http://localhost:5173. Without a key you'll see a notice instead of the map.

---

## 5. Configure

Everything is in **[`src/config/map-config.js`](src/config/map-config.js)**:

| Setting | What it controls |
|---|---|
| `PLACES` | Cities in the picker. Add one: `{ id, name, center: [lng, lat], zoom, pitch, bearing }`. |
| `VIEW_LIMITS.radiusKm` | Half-size of the camera box around a city. **Smaller (e.g. 3) = the area caches fully → buttery-smooth, no rebuilding.** Larger = roam wider but more streaming. |
| `VIEW_LIMITS.minZoom` / `maxZoom` | Zoom range. A higher `minZoom` keeps the view local (fewer tiles). |
| `PHOTOREAL.screenSpaceError` | Detail vs speed. **Higher = faster, coarser; lower = sharper, slower.** |
| `PHOTOREAL.maxMemoryMB` | Tile cache size. Bigger = visited areas stay loaded (no re-download). |
| `CLICK_ZOOM` | How far a building click zooms in. |

To change the default city, reorder `PLACES` (the first entry is the default).

---

## 6. Integrate into your own product

The map is a self-contained React tree. To drop it into an existing app:

1. **Install the deps** (see `package.json`):
   `maplibre-gl`, `@deck.gl/core`, `@deck.gl/mapbox`, `@deck.gl/geo-layers`.
2. **Copy `src/components/`, `src/config/`, and `src/providers/`** into your app.
3. **Render the map** wherever you want it (it fills its container):

   ```jsx
   import MapView from './components/MapView/MapView.jsx'
   import Photoreal3DLayer from './components/Photoreal3DLayer/Photoreal3DLayer.jsx'
   import PlacePicker from './components/PlacePicker/PlacePicker.jsx'

   function Map3D() {
     return (
       <div style={{ position: 'relative', width: '100%', height: '100%' }}>
         <MapView>
           <Photoreal3DLayer />
           <PlacePicker activeId="miami" onChange={() => {}} />
         </MapView>
       </div>
     )
   }
   ```

4. **Provide the key** via your build's env (`VITE_GOOGLE_MAPS_KEY`), or change
   `KEYS` in `map-config.js` to read from wherever your app keeps config.

Architecture, in one breath: `MapView` boots one MapLibre map and shares it via
React context; `Photoreal3DLayer` attaches a deck.gl `Tile3DLayer` of Google's
tiles as an interleaved overlay; `PlacePicker` drives that shared map. Each piece
is independent — take only what you need.

---

## 7. Cost & security notes

- **Photorealistic 3D Tiles** is an Enterprise SKU: ~**1,000 free tile loads/month**,
  then billed. Fine for dev; budget for real traffic.
- Set a **budget alert** in Google Cloud Billing.
- **Restrict your key** by API + HTTP referrer (step 2.6) so others can't reuse it.
- Google's terms require keeping the **on-screen attribution** (bottom-left) visible.
- The bounded view (`VIEW_LIMITS`) also limits how many tiles a session can pull,
  which helps keep usage predictable.

---

## 8. Troubleshooting

- **"Add a Google Maps key" notice / blank map** — `VITE_GOOGLE_MAPS_KEY` missing
  or the dev server wasn't restarted after editing `.env`.
- **403 / tiles don't load** — Map Tiles API not enabled, billing not active, or
  the key's referrer restriction doesn't include your URL.
- **Stutters / rebuilding while moving** — lower `VIEW_LIMITS.radiusKm`, raise
  `PHOTOREAL.maxMemoryMB`, or raise `PHOTOREAL.screenSpaceError`.
