# Coastal Flood Dashboard — Architecture & Design System

> **Version:** 1.2 — updated after header restructure (screens 1 & 2)
> **Last updated:** 2026-05-17
> **Figma file:** `UDqpquE5wXMYWz5rqC0Hwd` (Maya Briks)
> **Background asset:** `public/coastal-background.png`

---

## A. Product Overview

### What this prototype is
A coastal flood-risk monitoring dashboard prototype. It presents live sea-level data, city-wide risk status, flood depth visualization, and a detailed alert-response view. It is designed as a presentation-quality local prototype — opened in a browser, run locally with `npm run dev`.

### What problem it solves
City planners and emergency managers need to see live coastal flood risk at a glance, understand which districts are at risk, evaluate mitigation strategies, and take action when a new alert fires. This prototype demonstrates that UX flow.

### Main user flow
1. **Screen 1 — Home Page**: User sees the city overview, mode selection (Protect/Adapt/Retreat), live monitoring stats, flood depth scale, and a city-wide risk summary. No alert is active.
2. **Screen 2 — Home Page Alert**: After 10 seconds, a new alert fires automatically. A red alert card appears. The bell icon shows a badge. The user reads the alert.
3. **Screen 3 — Alert Detail**: User clicks the red alert card and sees a full breakdown: sea level rise metrics, the recommended strategy, affected districts, estimated budget, and an affections table.

### Current screens
| ID | Name | Type | Trigger |
|---|---|---|---|
| S1 | `Home_page` | Idle dashboard | App loads |
| S2 | `Home_page_alert` | Alert state | Auto after 10 s |
| S3 | `Alert` | Detail view | Click on red alert card in S2 |

### Future expected use
- Connect to live sensor data API
- Add more screens: Scenarios, Compare, Reports, Scenarios detail
- Expand district detail views
- Add multi-city support
- Add time-travel controls (2030, 2050, 2070, 2090 projections)

---

## B. Screen Inventory

### S1 — Home Page

- **File:** `src/screens/HomePage.tsx`
- **Purpose:** Idle monitoring dashboard. Shows current city risk without an active alert.
- **User role:** City planner / emergency manager browsing risk status.
- **User intent:** "What is the current state of the city's coastal risk?"
- **Main UI sections:**
  - Flood Depth Scale (top-left)
  - Mode Selector pill: Protect / Adapt / Retreat (top-center)
  - Top Status Bar: time, city status, bell, menu (top-right)
  - Live Monitoring + City Overview glass panel (left)
  - Time View: Today / 2030 / 2050 / 2070 / 2090 (bottom-left)
  - Bottom Summary Bar: stats + navigation (bottom, full-width)
- **Key interactions:** None (static in prototype; Time View not interactive yet)
- **Entry condition:** App loads
- **Exit action:** Auto-transitions to S2 after 10 seconds (timer in App.tsx)
- **Related components:** `ScaledLayout`, `FloodDepthScale`, `ModeSelector`, `TopStatusBar`, `LiveMonitoringPanel`, `TimeView`, `BottomSummaryBar`
- **Figma frame:** `node-id=137-750`
- **Screenshot reference:** `Reference_Images/Home_page.png`

---

### S2 — Home Page Alert

- **File:** `src/screens/HomePageAlert.tsx`
- **Purpose:** Alert state. The red alert card appears below the Live Monitoring panel. The bell has a notification badge.
- **User role:** City planner / emergency manager reacting to a new alert.
- **User intent:** "A new alert fired. What happened? Let me read it and investigate."
- **Main UI sections:** Same as S1, plus:
  - Red Alert Card (`NewAlertCard`) — between panel bottom and Time View
  - Bell badge on `TopStatusBar`
- **Key interactions:** Click the red alert card → navigate to S3
- **Entry condition:** 10-second timer fires from S1
- **Exit action:** Click red card → S3. Back arrow on S3 → returns to S2.
- **Related components:** Same as S1 + `NewAlertCard`
- **Figma frame:** `node-id=137-1148` (background sub-node; full frame inferred from screenshot)
- **Screenshot reference:** `Reference_Images/Home page - alert.png`

---

### S3 — Alert Detail Page

- **File:** `src/screens/AlertPage.tsx`
- **Purpose:** Full breakdown of the alert: metrics, recommended strategy, affected districts, budget.
- **User role:** City planner analyzing the alert and deciding on action.
- **User intent:** "How serious is this? What is the recommended response? What areas and people are affected? What does it cost?"
- **Main UI sections:**
  - Back arrow (top-left of white panel)
  - Inline status bar (top-right of white panel)
  - Sea Level Early Warning header with red warning icon
  - Alert Overview card: Sea Level Rise / First Expected Impact / With Action
  - Strategy card: title, description, 4 metric boxes, key components checklist, compare link
  - Districts Requiring Review card (right column)
  - Estimated Budget donut card (right column, below districts)
  - Affections table: Infrastructure + Population (bottom)
- **Key interactions:** Back arrow → returns to S2
- **Entry condition:** Click red card on S2
- **Exit action:** Back arrow → S2
- **Related components:** `AlertOverviewCard`, `StrategyCard`, `DistrictRiskList`, `BudgetCard`, `AffectionsTable`
- **IMPORTANT:** Screen 3 uses its own internal layout (white panel with `inset: 20px`, overflow-y: auto) and does NOT use `ScaledLayout`. Do not add scaling to this screen.
- **Figma frame:** `node-id=143-1376`
- **Screenshot reference:** `Reference_Images/Alert.png`

---

## C. UX Architecture

### Full prototype flow

```
App loads
  └── setState: 'home'
        └── renders: <HomePage />
              └── useEffect timer: 10,000ms
                    └── setState: 'home-alert'
                          └── renders: <HomePageAlert />
                                └── user clicks <NewAlertCard>
                                      └── setState: 'alert'
                                            └── renders: <AlertPage />
                                                  └── user clicks back arrow
                                                        └── setState: 'home-alert'
```

### State transitions
| From | Event | To | Where implemented |
|---|---|---|---|
| `'home'` | 10s timer fires | `'home-alert'` | `App.tsx` useEffect |
| `'home-alert'` | Red card click | `'alert'` | `NewAlertCard` onClick prop → `HomePageAlert` → `App.tsx` |
| `'alert'` | Back arrow click | `'home-alert'` | `AlertPage` onBack prop → `App.tsx` |

### Navigation logic
- No router. All navigation is `useState` in `App.tsx`.
- The back button on S3 returns to `'home-alert'`, not `'home'`, because the alert timer has already fired.
- The 10s timer uses `useEffect` with `screen` in dependency array and `if (screen !== 'home') return` guard — it only fires once from the home state.

### Alert behavior
- **Automatic:** S1 → S2 transition (timer in App.tsx)
- **User-triggered:** S2 → S3 (red card click), S3 → S2 (back arrow)

### Future UX extension points
- Add a "dismiss alert" button to S2 that returns to S1 (re-sets timer)
- Add navigation from BottomSummaryBar icons to other screens
- Add Time View interactivity (click year → change projected data)
- Add a notification drawer (click bell → show all alerts)

---

## D. UI Layout Architecture

### Global screen structure
```
<div id="root">  {/* 100vw × 100vh, background-image: coastal-background.png */}
  <ScaledLayout> {/* 1512×1008px design canvas, scaled to viewport */}
    <FloodDepthScale />       {/* absolute, canvas-space */}
    <LiveMonitoringPanel />
    <TimeView />
    [<NewAlertCard /> — S2 only]
  </ScaledLayout>
  <ModeSelector />            {/* absolute, viewport-level, left-1/2 centered */}
  <TopStatusBar />            {/* absolute, viewport-level, right-aligned */}
  <BottomSummaryBar />        {/* absolute, viewport-level, bottom-anchored */}
</div>
```

For Screen 3:
```
<div id="root">
  {/* same background */}
  <AlertPage>
    <div inset-[20px]>  {/* white panel, 1470×938px, overflow-y: auto */}
      {/* all alert content, absolute positioned within panel */}
    </div>
  </AlertPage>
</div>
```

### Viewport strategy
**Screens 1 & 2:** Use a hybrid layout. Elements are split into two groups:

**Viewport-level elements** (outside `ScaledLayout`, siblings in the Fragment):
- `ModeSelector` — `absolute left-1/2 -translate-x-1/2 top-[25px]` — viewport-centered, always at the true horizontal midpoint between FloodDepthScale and TopStatusBar.
- `TopStatusBar` — `absolute top-[29px] right-[21px]` — flush to the viewport right edge.
- `BottomSummaryBar` — `absolute bottom-0 left-0 right-0` — always spans 100% viewport width.

These three are at viewport level so their positions are not affected by the canvas scale factor. `ModeSelector` is centered on the viewport (not the canvas) so it stays visually balanced between the left and right elements regardless of scale. `TopStatusBar` is right-aligned to the viewport edge.

**Canvas-space elements** (inside `ScaledLayout` — 1512×1008 design canvas):
- `FloodDepthScale`, `LiveMonitoringPanel`, `TimeView`, `NewAlertCard` (S2 only)
- `ScaledLayout` applies:
  ```
  scale = Math.min(1.0, window.innerWidth / 1512, window.innerHeight / 1008)
  transform: scale(scale)
  transform-origin: top left
  ```
  On a typical 14-inch MacBook (viewport ≈ 1440×900), scale ≈ 0.89. Canvas-space panels shrink proportionally while viewport-level elements remain at fixed screen positions.

**Screen 3:** Uses `inset: 20px` on the white panel (not ScaledLayout). The panel already works correctly at typical laptop screen sizes.

### Desktop-first assumptions
- Designed for 1512×1008px (14-inch MacBook Retina display looks-like resolution)
- The ScaledLayout ensures it fits on smaller viewports (minimum tested: 1280×720)
- No mobile breakpoints

### When to use absolute positioning
Use `position: absolute` for all dashboard panel elements within ScaledLayout. These elements have fixed design-space coordinates from Figma and must appear at exact positions relative to the background map.

### When to use flex/grid
Use flex/grid **inside** panels (for internal layout of rows, columns, icon+text pairs, stat blocks). Do NOT use flex/grid for positioning panels relative to each other — use absolute for that.

### How to avoid overlap between floating panels

**Viewport-level elements (outside ScaledLayout — positioned relative to viewport):**
```
Mode Selector:    top: 25px,    left: 50%  (-translate-x-1/2),  width: 489px  [viewport-centered]
Top Status Bar:   top: 29px,    right: 21px                                   [viewport right-aligned]
Bottom Bar:       bottom: 0,    left: 0, right: 0,  height: 138px             [full viewport width]
```

**Canvas-space elements (inside ScaledLayout — 1512×1008 design canvas):**
```
Flood Depth Scale:  top: 25px,   left: 21px,   height: 65px    → bottom: 90px
Live Mon. Panel:    top: 119px,  left: 21px,   height: ~488px  → bottom: 607px
New Alert Card:     top: 620px,  left: 21px,   height: ~68px   → bottom: 688px
Time View:          top: 754px,  left: 20px,   height: ~60px   → bottom: 814px
```

The gap between the New Alert Card bottom (688px) and Time View top (754px) is 66px — enough breathing room. When adding new floating panels, check these ranges and leave at least 12px gap between any two elements' bottom/top edges.

### Rules for maintaining visibility of bottom content
- The bottom bar is viewport-anchored (`bottom: 0`) and never cut off regardless of scale.
- Keep canvas-space elements below `top: 820px` to avoid visual collision with the bottom bar at typical scales.
- Do not add canvas content below `top: 820px`.

---

## E. Design System

### Design language
**Visual mood:** Clean, authoritative, data-driven. Professional emergency management aesthetic. Glassmorphism panels float over a real aerial photograph. High contrast between the glass UI and the vivid background.

### Background treatment
- Asset: `public/coastal-background.png`
- Contains the aerial coastal photograph composited with colored flood-risk zone overlays (red, orange/amber, blue/teal) and white dashed ocean depth contours.
- Applied on `#root` in `App.tsx`: `background-image: url('/coastal-background.png'); background-size: cover; background-position: center; background-repeat: no-repeat`
- The background is always full-screen (`100vw × 100vh`) regardless of ScaledLayout.

### Glassmorphism style
All glass panels share this recipe:

| Property | Value |
|---|---|
| background | `rgba(255,255,255, X)` where X = 0.30 / 0.40 / 0.53 / 0.65 / 0.80 |
| border | `1px solid rgba(255,255,255, 0.20)` |
| backdrop-filter | `blur(12px)` |
| -webkit-backdrop-filter | `blur(12px)` |
| border-radius | `16px` (use `rounded-lg`) |
| box-shadow | `0px 4px 6px 0px rgba(0,0,0,0.1), 0px 10px 15px 0px rgba(0,0,0,0.1)` |

Defined as Tailwind utilities in `src/index.css`:
- `.glass-30` — mode selector, flood depth scale
- `.glass-40` — inner City Overview sub-card
- `.glass-53` — active mode tab background
- `.glass-65` — main left panel (Live Monitoring)
- `.glass-80` — bottom summary bar

### Color palette

#### Background glassmorphism
| Token | Value | Usage |
|---|---|---|
| glass-30 | `rgba(255,255,255,0.30)` | Flood Depth Scale, Mode Selector |
| glass-40 | `rgba(255,255,255,0.40)` | City Overview inner card |
| glass-53 | `rgba(255,255,255,0.53)` | Active mode tab |
| glass-65 | `rgba(255,255,255,0.65)` | Live Monitoring main panel |
| glass-80 | `rgba(255,255,255,0.80)` | Bottom Summary Bar |

#### Text colors
| Token | Hex | Usage |
|---|---|---|
| text-primary | `#1e2939` | Main headings, panel titles |
| text-secondary | `#505153` | Subtext, stat labels, nav labels |
| text-tertiary | `#4a5565` | Lighter subtext in Alert page |
| text-muted | `#6a7282` | Caption/footnote text |
| text-body | `#364153` | Alert page body paragraphs |

#### Risk / semantic colors
| Token | Hex | Usage |
|---|---|---|
| risk-moderate | `#ffae00` | "MODERATE" label, yellow status dot |
| risk-high | `#d53c4b` | High Risk badge background |
| risk-high-bg | `#fef2f2` | High Risk district row background |
| risk-medium | `#f54900` | Medium badge background |
| risk-medium-bg | `#fff7ed` | Medium district row background |
| risk-orange-border | `#ff6900` | Medium district left border |
| risk-low | `#519bd3` | Low badge background / stat-blue |
| risk-low-bg | `#eff6ff` | Low district row background |
| success-green | `#00a63e` | Risk reduction %, With Action stat |

#### Alert / status colors
| Token | Hex | Usage |
|---|---|---|
| alert-red | `#fb2c36` | Bell notification badge, arrow icon |
| live-dot | `#4aaf59` | Live monitoring green pulse dot |
| link-blue | `#51a2ff` | "View all alerts" link, budget-light |
| stat-blue | `#519bd3` | Sea level rise value, Low risk badge |
| btn-dark | `rgba(16,24,40,0.80)` | "View full analysis" dark CTA button |

#### Budget donut
| Token | Hex | Usage |
|---|---|---|
| budget-dark | `#155dfc` | Protection Measures slice |
| budget-light | `#51a2ff` | Adaptation Measures slice |

#### Surface colors (Alert page white panel)
| Value | Usage |
|---|---|
| `#ffffff` | White panel background |
| `#f9fafb` | Subtle section backgrounds (Alert Overview card header, district footer) |
| `#e5e7eb` | Panel borders |
| `#d1d5dc` | Dividers inside panels, button borders |
| `#99a1af` | Affections table bullet dots |

### Typography system

**Primary font stack:**
```css
font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
```
On macOS: resolves to SF Pro Display (Apple system font, no embedding needed).
On other platforms: falls back to Inter (loaded from Google Fonts in index.css).

**Secondary (Time View only):**
```css
font-family: 'SF Compact', system-ui, 'Inter', sans-serif;
```

**Inter** is imported via Google Fonts in `src/index.css`.

#### Font sizes
| Size | Usage |
|---|---|
| 10px | Bell "Alerts" label |
| 12px | Captions, stat sublabels, badge text, Flood Depth Scale labels |
| 13px | New Alert Card headline |
| 14px | Body text, nav labels, status bar sublabels |
| 16px | Medium headings, Alert page metric values |
| 18px | Section headings (Live Monitoring, City Overview), Alert page sub-headings |
| 20px | City status text "Moderate", Alert page title |
| 22px | Budget total ($70M) |
| 24px | Bottom bar stat values (MODERATE risk level in text, Affected Districts) |
| 25px | Alert Overview large metrics (+0.20m, 18-24, 5-7) |
| 30px | Bottom bar large stat numbers (Affected Districts "12 / 28") |

#### Font weights
| Value | CSS / Tailwind | Usage |
|---|---|---|
| 400 | `font-normal` | Body text, sublabels |
| 500 | `font-medium` | Nav labels, panel labels, stat sub-labels |
| 600 | `font-semibold` | Time/status bar primary values, district names |
| 700 | `font-bold` | Main stat numbers, section headings, risk level label |

#### Line heights
The design uses tight line heights:
- 16px text → `leading-[16px]` (1:1)
- 20px text → `leading-[20px]` or `leading-[21px]`
- 28px text → `leading-[28px]`
- 30px text → `leading-[30px]`
- 40px (large stats) → `leading-[40px]`

#### Letter spacing
- Status bar time/city: `tracking-[-0.15px]`
- Panel headings: `tracking-[-0.44px]`
- Bottom bar risk level: `tracking-[0.4px]` (wide, uppercase style)
- Alert page stats: `tracking-[0.37px]`

### Spacing scale
Gaps and padding values extracted from Figma:
```
3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 20, 21, 22, 24, 25, 28, 31, 32, 64
```
Common patterns:
- Panel outer padding: `px-[9px] py-[4px]` (scale legend) or `px-[13px]` (mode tab)
- Panel inner padding: `px-[15px] py-[7px]` (stats table) or `px-[25px]` (Alert cards)
- Gap between major panel sections: `gap-[21px]`
- Gap between stat rows: `gap-[10px]`
- Gap between icon and label: `gap-[8px]` or `gap-[12px]`

### Border radius scale
| Class | Value | Usage |
|---|---|---|
| `rounded-sm` (custom) | 10px | Metric boxes, district rows, nav buttons |
| `rounded-md` (custom) | 14px | Alert page card containers |
| `rounded-lg` (custom) | 16px | All glass panels, sub-cards |
| `rounded-pill` (custom) | 46px | Mode Selector outer pill |
| `rounded-full` | 9999px | Dots, badges, live pulse |
| `rounded-[4px]` | 4px | Flood depth gradient bar |

These custom values are defined in `tailwind.config.js` under `theme.extend.borderRadius`.

### Shadows
```css
/* Main glass panels */
.glass-shadow { box-shadow: 0px 4px 6px 0px rgba(0,0,0,0.1), 0px 10px 15px 0px rgba(0,0,0,0.1); }

/* Mode selector / smaller panels */
.glass-shadow-sm { box-shadow: 0px 4px 6px -4px rgba(0,0,0,0.1), 0px 10px 15px -3px rgba(0,0,0,0.1); }

/* Stats table subtle inner shadow */
filter: drop-shadow(0px -3px 8.1px rgba(0,0,0,0.03));
```

### Flood depth gradient
```css
.flood-gradient {
  background: linear-gradient(90deg,
    #87d6ce 0%,   /* teal — shallow/low depth */
    #4e97d3 25%,  /* blue */
    #f9b778 50%,  /* amber */
    #c93232 75%,  /* red */
    #680d0d 100%  /* dark red — very high depth */
  );
}
```

### Icons
- **Library:** `lucide-react` (v0.x, whatever version npm installs)
- **Stroke width:** `1.5` for all icons (matches Figma style)
- **Sizes:** 14px, 16px, 20px, 24px, 48px (warning icon on Alert page)
- **Colors:** Match surrounding text color (`text-[#505153]` for dim icons, `text-black` for primary)
- **Style:** Line icons only, no fill (except `TriangleAlert` which uses partial fill for emphasis)
- **Custom SVG icons:** `ModeSelector` uses three inline SVG components (`ProtectIcon`, `AdaptIcon`, `RetreatIcon`) — flat rhombus (isometric top-view layer) shapes stacked 1×, 2×, 3×. These are not from lucide-react; they match the reference image exactly. `viewBox="0 0 24 24"`, `strokeWidth="1.5"`, `fill="none"`, `stroke="currentColor"`.

### Buttons
| Type | Style | Example |
|---|---|---|
| Dark CTA | `bg-[rgba(16,24,40,0.80)]`, `h-[37px]`, `rounded-md`, white text | "View full analysis →" |
| Bordered | `border border-[#d1d5dc]`, `h-[33px]`, `rounded-sm`, hover bg | "See Detailed Breakdown" |
| Nav icon | `px-[16px] py-[8px]`, `rounded-sm`, icon + label | Bottom navigation tabs |

### Cards
| Type | Background | Border | Radius |
|---|---|---|---|
| Glass panel | `glass-65` or `glass-80` | `rgba(255,255,255,0.2)` | 16px |
| Inner sub-card | `glass-40` | `#e9e9e9` | 16px |
| Alert Overview | `#f9fafb` | `#e5e7eb` | 16px |
| White panel | `white` | `#e5e7eb` | 14px |
| Metric mini-card | `white` | `#f0f0f0` subtle | 10px |
| District row | Color-bg + 4px left border | — | 10px |

### Data visualization
**Donut chart (BudgetCard):**
- SVG `<circle>` with `stroke-dasharray` for segments
- Outer radius: 60px, stroke width: 18px
- Protection: `#155dfc` (dark blue), ~40% of circumference
- Adaptation: `#51a2ff` (light blue), ~60% of circumference
- Total label centered in the ring: `$70M`, bold 20px

**Timeline scrubber (TimeView):**
- Horizontal line: 2px height, `rgba(255,255,255,0.4)`, full width
- Active marker: 8px yellow dot (`#ffae00`), left-anchored (= "Today")

**Flood risk badges:**
- Pills: `border-radius: full`, `padding: 4px 8px`, white text on risk color background
- High Risk: `#d53c4b` bg
- Medium: `#f54900` bg
- Low: `#519bd3` bg

---

## F. Component Architecture

### `ScaledLayout`
- **File:** `src/components/layout/ScaledLayout.tsx`
- **Purpose:** Wraps Screen 1 and Screen 2 content. Scales the 1512×1008 design canvas to fit the actual browser viewport using `transform: scale()`.
- **Used by:** `HomePage`, `HomePageAlert`
- **Props:** `children: ReactNode`, `className?: string`
- **Internal:** Listens to `window.resize`, computes `scale = Math.min(1.0, vw/1512, vh/1008)`, applies it via `style.transform`.
- **Design constants:** `DESIGN_W = 1512`, `DESIGN_H = 1008` — do not change without re-verifying all absolute positions.
- **Reusability:** Only for screens that use the full-canvas absolute layout. Do NOT use on Screen 3.

---

### `TopStatusBar`
- **File:** `src/components/shared/TopStatusBar.tsx`
- **Purpose:** Top-right status block: time, city status, bell icon, hamburger menu.
- **Used by:** `HomePage`, `HomePageAlert`, `AlertPage` (inline in AlertPage)
- **Props:** `showBadge?: boolean`, `dark?: boolean`
- **Key detail:** `showBadge=true` shows a red dot on the bell icon (used on S2 and S3).
- **Position (S1/S2):** `absolute top-[29px] right-[21px]` — **viewport-relative**, outside `ScaledLayout`. Sits flush against the viewport right edge at all scale factors.
- **Position (S3):** `absolute top-[29px] right-[21px]` within the white panel (not ScaledLayout).
- **Dividers:** `w-px h-[37px]` in dark or glass color.

---

### `FloodDepthScale`
- **File:** `src/components/shared/FloodDepthScale.tsx`
- **Purpose:** Top-left legend showing flood depth color ramp.
- **Used by:** `HomePage`, `HomePageAlert`
- **Props:** None
- **Position:** `absolute left-[21px] top-[25px] w-[326px] h-[65px]`
- **Key visual:** `.flood-gradient` CSS class for the color bar, `.glass-30` background.

---

### `ModeSelector`
- **File:** `src/components/shared/ModeSelector.tsx`
- **Purpose:** Top-center pill selector for Protect / Adapt / Retreat mode.
- **Used by:** `HomePage`, `HomePageAlert`
- **Props:** `active?: Mode` (defaults to `'Protect'`)
- **Position:** `absolute left-1/2 -translate-x-1/2 top-[25px]` — **viewport-relative**, outside `ScaledLayout`. `left-1/2` resolves to the viewport center, keeping it visually balanced between FloodDepthScale (left) and TopStatusBar (right) at all scale factors.
- **Active tab:** `.glass-53` background on the active tab.
- **Icons:** Custom inline SVG components — `ProtectIcon` (1 rhombus layer), `AdaptIcon` (2 stacked), `RetreatIcon` (3 stacked). Each uses `viewBox="0 0 24 24"`, `width={18}`, `strokeWidth={1.5}`, `stroke="currentColor"`, no fill. Wrapped in a `div` with `opacity-70` to match reference. Lucide `Layers2`/`Layers`/`Layers3` are no longer used.

---

### `LiveMonitoringPanel`
- **File:** `src/components/dashboard/LiveMonitoringPanel.tsx`
- **Purpose:** Main left glass panel. Contains the Live Monitoring header, City Overview title, status sub-card, stats table, and CTA button.
- **Used by:** `HomePage`, `HomePageAlert`
- **Props:** None (all content from `mockData.ts`)
- **Position:** `absolute left-[21px] top-[119px] w-[326px]`
- **Approximate height:** ~488px (ends at design-space y ≈ 607px)
- **Internal sections:**
  1. Live Monitoring header (`Radio` lucide icon + "Live" green dot)
  2. Horizontal divider
  3. "City Overview" heading
  4. City status sub-card (glass-40, `h-[139px]`): yellow dot, "Moderate", description
  5. Stats table: Sea Level / Wave Activity / Vulnerable Districts / Tide rows
  6. "View full analysis →" dark button
- **Reusability:** Refactor into sub-components if stats become dynamic.

---

### `TimeView`
- **File:** `src/components/dashboard/TimeView.tsx`
- **Purpose:** Shows the temporal projection selector (Today → 2090).
- **Used by:** `HomePage`, `HomePageAlert`
- **Props:** None
- **Position:** `absolute left-[20px] top-[754px] w-[317px]`
- **Design:** White text on transparent background, semi-opaque scrubber line, yellow marker dot.
- **Note:** Not yet interactive. Future: clicking a year changes the projected data shown.

---

### `BottomSummaryBar`
- **File:** `src/components/dashboard/BottomSummaryBar.tsx`
- **Purpose:** Full-width glass bar at the bottom. Left: 4 stat blocks (Risk Level, Affected Districts, Population at Risk, Active Alerts). Right: 5 navigation icon buttons.
- **Used by:** `HomePage`, `HomePageAlert`
- **Props:** None (content from `mockData.ts`)
- **Position:** `absolute bottom-0 left-0 right-0 h-[138px]` — viewport-relative, NOT inside ScaledLayout. Always spans 100% viewport width regardless of canvas scale.
- **Background:** `.glass-80` (most opaque glass)
- **Padding:** `px-[40px]`
- **Stats:** Risk Level text in `#ffae00`, Districts change indicator in `#fb2c36`, Active Alerts link in `#51a2ff`
- **Navigation:** `lucide-react` icons: `LayoutDashboard`, `GitBranch`, `ArrowLeftRight`, `FileText`, `Share2`

---

### `NewAlertCard`
- **File:** `src/components/dashboard/NewAlertCard.tsx`
- **Purpose:** Red alert card shown on S2. Clickable CTA to navigate to S3.
- **Used by:** `HomePageAlert` only
- **Props:** `onClick: () => void`
- **Position:** `absolute left-[21px] top-[620px] w-[326px]` — sits 13px below the LiveMonitoringPanel bottom (≈607px).
- **Background:** `rgba(180, 30, 40, 0.92)` with `backdrop-filter: blur(8px)`
- **Animation:** `.alert-card-enter` (fadeInUp 0.5s ease)
- **Structure:** Left: "New Alert" headline + body text. Right: circle arrow button.
- **Gap from TimeView:** Card ends ≈ 688px; TimeView starts at 754px → 66px gap (no overlap).

---

### `HomePage`
- **File:** `src/screens/HomePage.tsx`
- **Purpose:** Composes all S1 components. Canvas-space panels inside `ScaledLayout`; viewport-level elements as siblings.
- **Props:** None
- **Renders (Fragment):**
  - `<ScaledLayout className="screen-enter">` → `FloodDepthScale`, `LiveMonitoringPanel`, `TimeView`
  - `<ModeSelector />` (viewport-level sibling)
  - `<TopStatusBar />` (viewport-level sibling)
  - `<BottomSummaryBar />` (viewport-level sibling)
- **Animation:** `className="screen-enter"` on ScaledLayout

---

### `HomePageAlert`
- **File:** `src/screens/HomePageAlert.tsx`
- **Purpose:** Composes all S2 components. Same structure as `HomePage` but adds `NewAlertCard` inside ScaledLayout and `showBadge` on the bell.
- **Props:** `onAlertClick: () => void`
- **Renders (Fragment):**
  - `<ScaledLayout className="screen-enter">` → `FloodDepthScale`, `LiveMonitoringPanel`, `NewAlertCard`, `TimeView`
  - `<ModeSelector />` (viewport-level sibling)
  - `<TopStatusBar showBadge />` (viewport-level sibling)
  - `<BottomSummaryBar />` (viewport-level sibling)

---

### `AlertPage`
- **File:** `src/screens/AlertPage.tsx`
- **Purpose:** Full-page detail view for the alert. Uses its own internal white panel layout (NOT ScaledLayout).
- **Props:** `onBack: () => void`
- **Layout:** `<div className="absolute inset-[20px] rounded-lg overflow-y-auto">` — the white panel fills the viewport with 20px margins on all sides.
- **IMPORTANT:** Do not add ScaledLayout to this screen. It has its own internal layout strategy.
- **Internal positioning:** All Alert sub-components use absolute positioning relative to the white panel container.
- **Scroll:** The white panel is `overflow-y: auto`, allowing scroll on short screens.

---

### `AlertOverviewCard`
- **File:** `src/components/alert/AlertOverviewCard.tsx`
- **Purpose:** 3-column stats card at the top of the Alert page (Sea Level Rise / First Expected Impact / With Action).
- **Position:** `absolute left-[86px] top-[153px] w-[813px] h-[144px]`
- **Data from:** `mockData.alertOverview`
- **Colors:** Sea Level in `#519bd3`, First Impact in `#d53c4b`, With Action in `#00a63e`

---

### `StrategyCard`
- **File:** `src/components/alert/StrategyCard.tsx`
- **Purpose:** Strategy description + 4 metric boxes + key components checklist.
- **Renders:** Multiple `absolute` blocks (header at 334px, description at 385px, metrics at 443px, key components label at 524px, left list at 553px, right list at 553px col2, compare link at 645px)
- **Data from:** `mockData.strategy`
- **Icon:** `ShieldCheck` from lucide-react in blue `#519bd3` badge

---

### `DistrictRiskList`
- **File:** `src/components/alert/DistrictRiskList.tsx`
- **Purpose:** Right-column card listing 4 districts with risk-colored rows.
- **Position:** `absolute right-[21px] top-[153px] w-[531px] h-[446px]`
- **Data from:** `mockData.districts` (4 items)
- **Risk color map:** red/orange/blue for high/medium/low (bg color, left border, badge bg)

---

### `BudgetCard`
- **File:** `src/components/alert/BudgetCard.tsx`
- **Purpose:** Budget donut chart + breakdown. Right column, below DistrictRiskList.
- **Position:** `absolute, left: 930px, top: 669px, w: 533px, h: 276px`
- **Donut:** SVG `<circle>` with `stroke-dasharray` segments (protection 40%, adaptation 60%)
- **Data from:** `mockData.budget`

---

### `AffectionsTable`
- **File:** `src/components/alert/AffectionsTable.tsx`
- **Purpose:** 2-column table: Infrastructure items (left) and Population items (right).
- **Position:** `absolute, left: 86px, top: 690px, w: 816px, h: 255px`
- **Data from:** `mockData.affectionsInfrastructure`, `mockData.affectionsPopulation`

---

## G. Code Architecture

### Project stack
| Tool | Version | Purpose |
|---|---|---|
| Vite | 8.x | Build tool, dev server |
| React | 19.x | UI framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 3.x | Utility-first styling |
| lucide-react | latest | Icon library |

### Folder structure
```
flood-dashboard/
├── public/
│   └── coastal-background.png      ← background image (served as /coastal-background.png)
├── src/
│   ├── App.tsx                      ← screen state machine + 10s timer
│   ├── main.tsx                     ← React root mount
│   ├── index.css                    ← Google Fonts import, Tailwind directives, utility classes
│   ├── mockData.ts                  ← all static content (text, numbers, lists)
│   ├── components/
│   │   ├── layout/
│   │   │   └── ScaledLayout.tsx     ← viewport scaling wrapper (S1, S2 only)
│   │   ├── shared/
│   │   │   ├── TopStatusBar.tsx
│   │   │   ├── FloodDepthScale.tsx
│   │   │   └── ModeSelector.tsx
│   │   ├── dashboard/
│   │   │   ├── LiveMonitoringPanel.tsx
│   │   │   ├── TimeView.tsx
│   │   │   ├── BottomSummaryBar.tsx
│   │   │   └── NewAlertCard.tsx
│   │   └── alert/
│   │       ├── AlertOverviewCard.tsx
│   │       ├── StrategyCard.tsx
│   │       ├── DistrictRiskList.tsx
│   │       ├── BudgetCard.tsx
│   │       └── AffectionsTable.tsx
│   └── screens/
│       ├── HomePage.tsx
│       ├── HomePageAlert.tsx
│       └── AlertPage.tsx
├── tailwind.config.js
├── vite.config.ts
├── tsconfig.json
└── package.json
```

### State management
`App.tsx` owns the single piece of app state:
```typescript
type Screen = 'home' | 'home-alert' | 'alert';
const [screen, setScreen] = useState<Screen>('home');
```

No external state library. No prop drilling past 2 levels.

### 10-second transition implementation
```typescript
// App.tsx
useEffect(() => {
  if (screen !== 'home') return;   // guard: only from home state
  const timer = setTimeout(() => setScreen('home-alert'), 10_000);
  return () => clearTimeout(timer); // cleanup on unmount / state change
}, [screen]);
```

### Alert card click transition
```typescript
// App.tsx renders:
<HomePageAlert onAlertClick={() => setScreen('alert')} />

// HomePageAlert passes to NewAlertCard:
<NewAlertCard onClick={onAlertClick} />

// NewAlertCard triggers:
<div onClick={onClick} role="button">...</div>
```

### Asset storage
- `public/coastal-background.png` — served at `/coastal-background.png`
- Referenced in `App.tsx` root style: `backgroundImage: "url('/coastal-background.png')"`
- All icons: `lucide-react` (bundled, no CDN dependency)
- No temporary Figma CDN URLs in production code

### Tailwind configuration
`tailwind.config.js` extends Tailwind with:
- **fontFamily:** `display`, `text`, `compact`, `inter`
- **colors:** risk-*, alert-red, live-dot, link-blue, stat-blue, budget-*, surface-*
- **borderRadius:** `sm` (10px), `md` (14px), `lg` (16px), `pill` (46px)

### CSS utilities (index.css)
| Class | Effect |
|---|---|
| `.glass-30` `.glass-65` etc. | Background opacity + backdrop-filter |
| `.glass-shadow` | Main panel shadow |
| `.glass-shadow-sm` | Mode selector shadow |
| `.flood-gradient` | Color scale gradient |
| `.screen-enter` | fadeIn animation (0.4s ease) |
| `.alert-card-enter` | fadeInUp animation (0.5s ease) |
| `.live-pulse` | Opacity pulse animation for live dot |

### Animation strategy
- Screen transitions: CSS `@keyframes fadeIn` on `.screen-enter` class
- Alert card entrance: CSS `@keyframes fadeInUp` on `.alert-card-enter` class
- Live pulse: CSS `@keyframes pulse-dot` on `.live-pulse` class
- No JS animation libraries

### Naming conventions
- Components: PascalCase (`LiveMonitoringPanel.tsx`)
- Screens: PascalCase, suffixed with Screen purpose (`AlertPage.tsx`)
- Utilities: camelCase (`mockData.ts`)
- CSS classes: kebab-case (`glass-65`, `flood-gradient`)
- Tailwind arbitrary values: use bracket notation (`top-[21px]`, not hardcoded CSS)

---

## H. Data Architecture

### mockData.ts structure

```typescript
cityOverview: {
  status, riskLevel, seaLevel, seaLevelPeriod,
  waveActivity, waveStatus, vulnerableDistricts, totalDistricts,
  tideStatus, tideTime, description
}

summaryStats: {
  riskLevel, affectedDistricts, totalDistricts, districtsChange,
  populationAtRisk, populationPercent, activeAlerts
}

alertOverview: { seaLevelRise, firstImpact, withAction }

strategy: {
  title, description, timeline, investment, riskReduction, impactDelay,
  components: string[]
}

districts: Array<{
  name, risk, note, color: 'red' | 'orange' | 'blue'
}>

budget: {
  total, protectionLabel, protectionAmount, adaptationLabel, adaptationAmount,
  protectionPercent, adaptationPercent
}

affectionsInfrastructure: Array<{ name, detail }>
affectionsPopulation: Array<{ name, detail }>
```

### Future data connection
To connect to a real data source:
1. Replace `mockData.ts` exports with API calls (React Query / SWR / fetch in useEffect)
2. Pass data as props into each component (currently consumed directly from mockData)
3. Use TypeScript interfaces (already implied by mockData shape) to type API responses
4. Keep the same component prop signatures for zero UI changes

---

## I. Asset Management

### Local assets
| Asset | Path | Usage |
|---|---|---|
| `coastal-background.png` | `public/coastal-background.png` | Full-screen background for all 3 screens |

### Rebuilt in code
| Element | Implementation |
|---|---|
| Flood risk zone overlays | Baked into `coastal-background.png` — no code needed |
| Flood depth gradient | CSS `linear-gradient` in `.flood-gradient` |
| Budget donut chart | SVG `<circle>` with `stroke-dasharray` |
| Timeline scrubber | CSS horizontal line + yellow dot |
| Live pulse dot | CSS `@keyframes pulse-dot` |
| Mode selector icons | Inline SVG paths (approximated) |

### Icons from lucide-react
`Bell`, `Menu`, `ArrowLeft`, `ChevronRight`, `TrendingUp`, `Waves`, `Building2`, `Droplets`, `LayoutDashboard`, `GitBranch`, `ArrowLeftRight`, `FileText`, `Share2`, `ArrowUp`, `ShieldCheck`, `CheckCircle2`, `ChevronDown`, `TriangleAlert`, `Users`

### Rules for new assets
1. Place in `public/` directory (served directly, no import needed)
2. Reference as `/filename.ext` (not `./` or `../`)
3. Prefer local files over CDN URLs
4. Never use temporary Figma CDN URLs (`figma.com/api/mcp/asset/...`) in committed code — they expire in 7 days

---

## J. Implementation Decisions & Rationale

### Why state-based flow, not routing
Three screens, linear flow, no URL-addressable states needed for a prototype. React Router would add complexity without benefit. `useState` in App.tsx is simpler and sufficient.

### Why screen 3 was kept unchanged
Screen 3's white panel with `inset: 20px` and `overflow-y: auto` already adapts well to the browser viewport. Adding ScaledLayout would interfere with its scrolling behavior and internal layout. It was not part of the reported layout problem.

### Why screens 1 and 2 needed viewport-aware changes
The Figma design used a fixed 1512×1008px canvas matching the designer's MacBook display resolution. Browser viewports are smaller (tabs + address bar consume ~80px height). Elements positioned absolutely at fixed pixel values (e.g., bottom bar at `top: 856px + height: 138px = 994px`) were cut off. The `ScaledLayout` component solves this by proportionally shrinking the entire design to fit.

### Why ModeSelector and TopStatusBar are outside ScaledLayout
When these were inside ScaledLayout, their absolute positions resolved against the 1512px canvas. At scale < 1 (e.g., 0.89 on a 14-inch MacBook), the canvas renders at ~1350px wide — narrower than the 1440px viewport. `left-1/2` of the canvas placed ModeSelector at ~675px instead of the viewport's 720px midpoint, visually off-center. `right-21px` of the canvas placed TopStatusBar ~90px short of the viewport's right edge. Moving both outside ScaledLayout makes their CSS resolve against the full viewport, so ModeSelector is truly viewport-centered and TopStatusBar is flush with the right edge at every screen size.

### Why the BottomSummaryBar uses edge-to-edge width
The original Figma spec used `w-[1469px]` centered with ~21px margins. On screen this looked like a floating panel rather than an anchoring bar. Making it `w-[1512px] left-0` with no border radius grounds the map content between the header band and the bottom bar, reducing the left-heavy perception. Padding was increased from `px-[25px]` to `px-[40px]` so content doesn't sit flush against the viewport edges.

### How the red alert card overlap was fixed
The `NewAlertCard` was at `top: 695px`, height ~80px, ending at 775px. `TimeView` started at 754px. Overlap: 21px. Fixed by moving `NewAlertCard` to `top: 620px` (13px below the LiveMonitoringPanel which ends at ~607px). Card now ends at ~688px, giving 66px gap before TimeView at 754px.

### Approximations vs Figma
| Element | Figma | Prototype |
|---|---|---|
| Mode selector icons | Custom vector illustrations | Custom inline SVG rhombus paths matching reference |
| Time View scrubber | Figma image group (Group9) | CSS line + dot |
| Live monitoring icon | Custom wave vector | SVG path approximation |
| Bell / Menu icons | Figma vectors | lucide-react icons |
| Nav icons | Figma custom vectors | lucide-react equivalents |
| Budget donut | Figma vector circles | SVG stroke-dasharray |

### Known limitations
- Time View years are not clickable (not interactive yet)
- Mode Selector tabs are visual only (no state change or data filtering)
- "View full analysis →" button on the left panel is not wired to any screen
- Bottom navigation icons (Dashboard, Scenarios, Compare, Reports, Share) are not wired
- The prototype does not persist across browser refresh (always restarts at Screen 1)
- Alert data is entirely static (mock data)

---

## K. Future Development Guide

### How to add a new screen

1. Create `src/screens/NewScreenName.tsx`
2. Add the screen state to the union type in `App.tsx`: `type Screen = 'home' | 'home-alert' | 'alert' | 'new-screen'`
3. Add the render condition in App.tsx: `{screen === 'new-screen' && <NewScreenName onBack={() => setScreen('...')} />}`
4. If the screen uses the full-canvas absolute layout → wrap content in `<ScaledLayout>`
5. If the screen has its own layout (modal, overlay) → use its own container strategy
6. Add a transition trigger (button onClick or useEffect timer) to reach the new screen
7. Document the new screen in this file under Section B

### How to add a new dashboard widget (S1/S2)

1. Create `src/components/dashboard/MyWidget.tsx`
2. Choose a position in design space (1512×1008) that does not overlap existing panels (see Section D)
3. Add `className="absolute left-[Xpx] top-[Ypx] w-[Wpx]"` to the root element
4. Import and add to `HomePage.tsx` and `HomePageAlert.tsx` inside ScaledLayout
5. Add mock data to `mockData.ts` for any content it needs
6. Document in Section F

### How to add a new alert type

1. Add a new entry to `mockData.districts` with `color: 'red' | 'orange' | 'blue'`
2. Add new fields to `mockData.alertOverview` or `mockData.strategy` if needed
3. Update `DistrictRiskList.tsx` if the new risk level needs a new color
4. Update `NewAlertCard.tsx` content if alert message changes per type
5. If multiple alert types need different S3 content, refactor AlertPage to accept an `alertType` prop

### How to add a new bottom navigation item

1. Add to the `navItems` array in `BottomSummaryBar.tsx`:
   ```typescript
   { icon: MyIcon, label: 'MyLabel' }
   ```
2. Wire the `onClick` handler to navigate to a new screen
3. Verify the nav row still fits within the right column of the bottom bar (currently 5 items)

### How to add new risk levels

1. Add a color entry to `colorMap` in `DistrictRiskList.tsx`
2. Add the corresponding Tailwind color to `tailwind.config.js`
3. Add semantic CSS utility classes to `index.css` if needed

### How to extend into a real product

1. Replace `mockData.ts` with API calls (React Query recommended)
2. Add React Router for URL-addressable screens
3. Wrap screens in a `Layout` component that includes a persistent nav
4. Add authentication if needed
5. Add a real data visualization library (Recharts or D3) for more complex charts
6. Replace SVG approximations with proper icon exports from Figma

---

## L. Visual QA Checklist

Run this checklist whenever making changes to screens 1 or 2:

### Background
- [ ] `coastal-background.png` fills the full browser viewport (no white edges)
- [ ] Background visible behind glass panels (transparency is working)
- [ ] Flood risk zones visible in the background image

### Panel visibility
- [ ] Flood Depth Scale visible at top-left
- [ ] Mode Selector visible at top-center (Protect tab active)
- [ ] Top Status Bar visible at top-right (time + city status + bell + menu)
- [ ] Live Monitoring Panel fully visible (all rows: sea level, wave, districts, tide)
- [ ] "View full analysis →" button visible at bottom of left panel

### Overlap checks
- [ ] FloodDepthScale does NOT overlap TopStatusBar
- [ ] LiveMonitoringPanel does NOT overlap anything on the right
- [ ] NewAlertCard (S2 only) does NOT overlap TimeView
- [ ] TimeView does NOT overlap BottomSummaryBar
- [ ] BottomSummaryBar bottom edge is visible (not cut off)

### Glass opacity
- [ ] FloodDepthScale and ModeSelector: semi-transparent (30%)
- [ ] LiveMonitoringPanel: clearly glass (65%)
- [ ] BottomSummaryBar: most opaque glass (80%)
- [ ] backdrop-filter blur is visible (requires Chromium/WebKit browser)

### Typography
- [ ] "MODERATE" in yellow (#ffae00) in bottom bar
- [ ] "12 / 28" districts in bold black
- [ ] "128,000" population in bold black
- [ ] Green live dot next to "Live" text
- [ ] Red "+2 since last week" below Affected Districts

### Screen transitions
- [ ] Screen 1 loads on page open
- [ ] After exactly 10 seconds, Screen 2 appears (red alert card + bell badge)
- [ ] Clicking the red card transitions to Screen 3
- [ ] Back arrow on Screen 3 returns to Screen 2
- [ ] Each transition has a fade-in animation

### Browser viewport fit (CRITICAL — run at each update)
- [ ] At 1440×900 viewport: no content cut off at bottom
- [ ] At 1280×800 viewport: bottom bar fully visible
- [ ] At 1512×900 viewport: panels appear at correct scale
- [ ] No horizontal scrollbar appears

### Alert card (S2 only)
- [ ] Red card appears below the Live Monitoring Panel
- [ ] Red card does NOT overlap Time View
- [ ] Red card text is readable: "New Alert" headline + body text
- [ ] Red card is clickable (cursor: pointer, transitions to S3)
- [ ] Bell icon has a red badge dot

### Screen 3 regression
- [ ] Screen 3 is unchanged (do not add ScaledLayout to it)
- [ ] White panel appears with 20px margins
- [ ] Back arrow works
- [ ] Alert Overview 3 columns visible
- [ ] Districts list with color-coded rows visible
- [ ] Budget donut chart renders
- [ ] Affections table (Infrastructure + Population) visible
- [ ] Overflow scroll works if viewport is short

---

## Changelog

### 2026-05-17 — Header restructure: viewport-level ModeSelector and TopStatusBar (Screens 1 & 2)
- **What changed**: (1) Removed the frosted-glass header backdrop div from both screen files. (2) Moved `ModeSelector` outside `ScaledLayout` to viewport-level so `left-1/2` centers it on the viewport, not the scaled canvas. (3) Moved `TopStatusBar` outside `ScaledLayout` so `right-21px` is flush with the viewport right edge. (4) Replaced lucide `Layers2`/`Layers`/`Layers3` mode selector icons with custom inline SVG rhombus-stack icons (`ProtectIcon`, `AdaptIcon`, `RetreatIcon`) matching the reference images.
- **Why**: At scale < 1 (14-inch MacBook ≈ 0.89), canvas-positioned elements are visually offset from viewport edges. ModeSelector appeared ~45px left of viewport center; TopStatusBar appeared ~90px from the right edge instead of flush. The header backdrop was removed as the design calls for transparent floating headers.
- **Files affected**: `src/screens/HomePage.tsx`, `src/screens/HomePageAlert.tsx`, `src/components/shared/ModeSelector.tsx`
- **Sections updated**: D (Global structure, Viewport strategy, z-position table), E (Icons), F (Top Header Backdrop removed, ModeSelector, TopStatusBar, HomePage, HomePageAlert updated), J (Rationale updated, Approximations table updated)

### 2026-05-17 — Icon replacement, panel fixes, full-viewport bars (Screens 1 & 2)
- **What changed**: (1) ModeSelector icons replaced with lucide Layers2/Layers/Layers3. (2) Live Monitoring icon replaced with lucide Radio. (3) Grey oval removed from City Overview sub-card. (4) Stats table right-column alignment fixed with consistent fixed-width two-column layout. (5) Top header backdrop and BottomSummaryBar moved outside ScaledLayout to viewport level so they always span 100% screen width.
- **Why**: Icon images updated to match reference; grey oval was an artifact; stats alignment was inconsistent across rows; bars were narrower than viewport on scaled screens (14-inch MacBook at scale ≈ 0.89).
- **Files affected**: `src/components/shared/ModeSelector.tsx`, `src/components/dashboard/LiveMonitoringPanel.tsx`, `src/components/dashboard/BottomSummaryBar.tsx`, `src/screens/HomePage.tsx`, `src/screens/HomePageAlert.tsx`
- **Sections updated**: D (Viewport strategy, z-position table), F (Top Header Backdrop, BottomSummaryBar, ModeSelector, LiveMonitoringPanel)

### 2026-05-16 — Horizontal layout balance fix (Screens 1 & 2)
- **What changed**: Added full-width frosted-glass header backdrop to Screens 1 & 2 (inline div, `left-0 top-0 w-[1512px] h-[100px]`); extended BottomSummaryBar to full canvas width (`left-0 w-[1512px]`, removed side margins and border-radius, increased `px-[40px]`).
- **Why**: Composition felt left-heavy; the disconnected floating pills in the header and the margined bottom bar left the layout unanchored. Edge-to-edge top and bottom bands frame the map and balance the visual weight.
- **Files affected**: `src/screens/HomePage.tsx`, `src/screens/HomePageAlert.tsx`, `src/components/dashboard/BottomSummaryBar.tsx`
- **Sections updated**: D (UI Layout — z-position table, bottom bar description), F (BottomSummaryBar position, new top header backdrop entry), J (two new rationale notes)

### 2026-05-16 — Viewport-aware scaling added to Screens 1 & 2
- **What changed**: ScaledLayout component applies CSS transform scale so the 1512×1008 design canvas fits within any browser viewport without overflow.
- **Why**: Browser chrome reduces available viewport height, causing BottomSummaryBar to be cut off on standard laptop displays.
- **Files affected**: `src/components/layout/ScaledLayout.tsx`, `src/screens/HomePage.tsx`, `src/screens/HomePageAlert.tsx`
- **Sections updated**: D (UI Layout), F (Components), J (Known Trade-offs)
