# Coastal Flood Dashboard — Architecture & Design System

> **Version:** 2.0 — full design-system update covering all 10 implemented screens
> **Last updated:** 2026-06-21
> **Figma file:** `UDqpquE5wXMYWz5rqC0Hwd` (Maya Briks)
> **Background asset (map screens):** `public/coastal-background.png`

---

## A. Product Overview

### What this prototype is
A coastal flood-risk monitoring and response-planning dashboard. It presents live sea-level data, city-wide risk status, flood depth visualization, a district alert, a multi-step response workflow (assess critical zones → response planning), and detailed zone-specific action plans.

### Main user flow
1. **Home** — Live monitoring panel, flood-depth scale, time-view selector, city risk overview.
2. **Home + Alert** — Auto-fires after 10 s; red alert card appears below the monitoring panel.
3. **Alert Detail** — Full breakdown of the district alert: metrics, strategy, districts, budget.
4. **Assess Critical Zones** — Map with five zone pills; left panel lists zones; approve each zone to unlock next step.
5. **Zone Detail screens** (×5) — Per-zone action plan with problem summary, cost/budget, schedule, edit & approve actions.
6. **Response Planning** — Summary of projected impact, recommended action sequence, action cards for all zones.

### Screen inventory

| ID | State key | File | Screen type |
|----|-----------|------|-------------|
| S1 | `home` | `HomePage.tsx` | Map dashboard |
| S2 | `home-alert` | `HomePageAlert.tsx` | Map dashboard + alert |
| S3 | `alert` | `AlertPage.tsx` | White-panel detail |
| S4 | `assess-critical-zones` | `AssessCriticalZonesPage.tsx` | Map + glass card |
| S5 | `coastal-road` | `CoastalRoadAccessPage.tsx` | Detail screen |
| S6 | `vulnerable-residents` | `VulnerableResidentsPage.tsx` | Detail screen |
| S7 | `electric-utility` | `ElectricUtilityPage.tsx` | Detail screen |
| S8 | `residential-edge` | `ResidentialEdgePage.tsx` | Detail screen |
| S9 | `pump-capacity` | `PumpCapacityPage.tsx` | Detail screen |
| S10 | `planning` | `ResponsePlanningPage.tsx` | Planning screen |

---

## B. Screen-Type Taxonomy

The app has three structural screen types. Every new screen fits into one of these.

### Type 1 — Map Canvas Screens (S1, S2, S4)
- Use `<ScaledLayout>` (1512×1008 px design canvas, `transform: scale()` to viewport).
- All positioned elements are `position: absolute` within the canvas.
- Background: full-screen aerial photo (`coastal-background.png`), flood overlays baked in.
- Floating glass panels sit on top of the map.
- `HomePageHeader` (frosted-glass map controls) lives inside ScaledLayout.

### Type 2 — Detail Screens (S5–S9)
- No ScaledLayout. Root is `display: flex; flex-direction: column; height: 100vh; overflow: hidden; background: #f8f8f8`.
- Header: two-row standard header (Menu+Bell / ArrowLeft+Title) — NOT map header.
- Body: `flex: 1; display: flex; overflow: hidden; padding 70px sides; gap 42px` — **left column** (scrollable, 724px wide) + **right column** (scaled to viewport height, flexible width).
- Right column uses a `transform: scale(rightScale)` + `transformOrigin: top left` trick to proportionally shrink at smaller viewports.

### Type 3 — Planning / Summary Screens (S3, S10)
- White or light-gray full-page layout with `overflow-y: auto`.
- S3 uses `inset: 20px` white panel with internal absolute positioning.
- S10 uses `zoom: pageScale` (computed from `window.innerHeight / 990`) for overall scaling.
- Both have the standard two-row header.

---

## C. Navigation Architecture

No router. Single `useState<Screen>` in `App.tsx`. All navigation is callback props (`onBack`, `onPlan`, `onCoastalRoad`, etc.).

`detailReturnScreen` state in `App.tsx` tracks where zone detail screens should return to (`'assess-critical-zones'` or `'planning'`), so the back button works correctly from both entry points.

```
home ──(10s timer)──► home-alert ──(click alert)──► alert
                                                       └──(back)──► home-alert
alert ──(Start Response Plan)──► assess-critical-zones
assess-critical-zones ──(zone click)──► [coastal-road | vulnerable-residents | electric-utility | residential-edge | pump-capacity]
                       ──(all zones approved → Simulate response scenarios)──► planning
planning ──(Review & Edit)──► zone detail screens (return to planning)
```

---

## D. UI Layout Architecture

### ScaledLayout (canvas screens)

```
1512 × 1008 px design canvas
scale = Math.min(1.0, viewportW / 1512, viewportH / 1008)
transform: scale(scale); transform-origin: top left
```

All absolute positions within ScaledLayout reference this 1512×1008 coordinate space.

### Viewport-level elements (outside ScaledLayout, siblings in Fragment)
Only these elements sit outside ScaledLayout and are positioned relative to the viewport:
- `ModeSelector` — `absolute left-1/2 -translate-x-1/2 top-[25px]`
- `TopStatusBar` — `absolute top-[29px] right-[21px]`
- `BottomSummaryBar` — `absolute bottom-0 left-0 right-0 h-[138px]`

**Why:** These must span the full viewport width, not the scaled canvas.

### Detail screen body layout

```
<div style={{ height:'100vh', display:'flex', flexDirection:'column', overflow:'hidden', background:'#f8f8f8' }}>
  <Header />                  ← flexShrink: 0
  <div style={{ flex:1, display:'flex', overflow:'hidden',
                paddingLeft:'70px', paddingRight:'70px',
                paddingTop:'20px', paddingBottom:'35px', gap:'42px' }}>
    <LeftColumn  style={{ width:'724px', flexShrink:0, overflowY:'auto' }} />
    <RightColumn style={{ flex:1, overflow:'hidden', position:'relative' }}>
      {/* scaled subtree */}
    </RightColumn>
  </div>
</div>
```

### Right-column proportional scaling (detail screens)
```tsx
const DESIGN_RIGHT_HEIGHT = 788; // px at which the right column was designed
const [rightScale, setRightScale] = useState(
  () => Math.min(1, (window.innerHeight - 170) / DESIGN_RIGHT_HEIGHT)
);
// 170 ≈ header height + vertical padding
```
The scaled subtree uses:
```tsx
position: 'absolute', top: 0, left: 0,
width: `${100 / rightScale}%`,
transformOrigin: 'top left',
transform: `scale(${rightScale})`,
display: 'flex', flexDirection: 'column'
```

---

## E. Design Language

### Visual mood
Clean, authoritative, minimal-chrome. Two registers coexist:
- **Map screens:** Glassmorphism panels floating over aerial photography. High contrast between transparent UI and vivid background.
- **Detail / planning screens:** White and light-gray surfaces (`#f8f8f8`), black text, maximum readability. No glassmorphism; no map backdrop.

### Background
- **Map screens:** `public/coastal-background.png` — aerial coastal photo with baked-in flood-risk overlays (orange/amber zones, blue/teal zones, white dashed ocean contour lines). Applied on `#root` via `background-image`, `background-size: cover`, `background-position: center`.
- **Detail screens:** `background: #f8f8f8` on the root div.
- **Planning screen (S10):** `background: #f8f8f8`.

---

## F. Color Palette

### Zone accent colors
Each of the five critical zones has a dedicated accent color used consistently across tabs, icon circles, donut segments, and step indicators.

| Zone | Accent hex | Usage |
|------|-----------|-------|
| Costal Road Access | `#ea7836` / `#E87840` | Orange |
| Electric Utility Point | `#ffbb00` / `#F5B830` | Yellow |
| Residential Edge Blocks | `#bf5761` / `#B55C6A` | Rose/mauve |
| Increase pump capacity | `#2864e4` / `#3B5CF6` | Blue |
| Vulnerable Residents | `#84af79` / `#79A86A` | Green |

> The slight hex variations come from the two contexts (ScaledLayout vs detail screen); treat them as the same zone color.

### Semantic / status colors
| Role | Hex | Usage |
|------|-----|-------|
| Risk red (urgent) | `#b91d1d` | "12 month (May 2027)" — no-intervention timeline |
| Risk green (improved) | `#84af79` | "6-8 yrs (~2033)" — with-intervention timeline |
| Live dot | `#4aaf59` | Green pulse dot next to "Live" |
| Alert red | `#fb2c36` | Bell badge, arrow icon |
| Risk moderate | `#ffae00` | "MODERATE" label, yellow status dot |
| Success green | `#00a63e` | Risk reduction %, With Action stat |

### Text colors
| Token | Hex | Usage |
|-------|-----|-------|
| text-primary | `#364153` | All body text in detail/planning screens, icon color in header |
| text-dark | `#1e2939` | Map panel headings, tab titles |
| text-secondary | `#505153` | Sublabels, body paragraphs, stats labels |
| text-muted | `#6b778a` | "Risk Score" label in gauge, captions |
| text-black | `#323232` or `black` | Button text, step numbers, large values |

### Surface colors
| Value | Usage |
|-------|-------|
| `#f8f8f8` | Detail / planning screen backgrounds |
| `white` | Cards within detail screens, active step card, plan text backgrounds |
| `rgba(255,255,255,0.85)` | Glass info card in AssessCriticalZonesPage |
| `rgba(255,255,255,0.9)` | Map tab pills |
| `rgba(255,255,255,0.6)` | ActionCards (right side of card), Projected Impact card |
| `rgba(0,0,0,0.8)` | Dark steps panel, "Confirm area mapping" / "Simulate response scenarios" buttons |
| `#cfcccc` | Dividers inside detail-screen left column |
| `rgba(0,0,0,0.1)` | Vertical dividers inside white cards |

### Glassmorphism levels (map screens only)
| Class | Background opacity | Usage |
|-------|--------------------|-------|
| `.glass-30` | `rgba(255,255,255,0.30)` | Flood Depth Scale, Mode Selector |
| `.glass-40` | `rgba(255,255,255,0.40)` | City Overview inner sub-card |
| `.glass-53` | `rgba(255,255,255,0.53)` | Active mode tab |
| `.glass-65` | `rgba(255,255,255,0.65)` | Live Monitoring main panel |
| `.glass-80` | `rgba(255,255,255,0.80)` | Bottom Summary Bar |

All glass panels share `border: 1px solid rgba(255,255,255,0.2)`, `backdrop-filter: blur(12px)`, `border-radius: 16px`.

---

## G. Typography System

### Font stack
```css
font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Inter', sans-serif;
```
Inter is imported from Google Fonts as fallback.

### Scale

| Size | Weight | Color | Usage |
|------|--------|-------|-------|
| 8.8px | 700 | `#ea7836` | Step number in zone-circle badge |
| 9px | 600/500 | `#101828` / `#505153` | Map marker mini-label |
| 11px | 500 | `black` | "Review & Edit" link |
| 12px | 600 / 500 | `#364153` / `#505153` | ActionCard label / description; map tab title/subtitle; legend text |
| 13px | 400/600 | `#505153` / `#364153` | Body text in detail left column; Cost & Budget desc; implementation step text |
| 14px | 600/400 | `black` / `black` | Projected Impact sub-labels ("When", "Action should begin within"), detail body |
| 16px | 600/400 | `#364153` | Section subtitles in ResponsePlanningPage, chart labels |
| 18px | 600/700 | `#364153` | Card section headers ("Action Plan Overview", "Problem Summary", "Cost & Budget", "Implementation Schedule") |
| 24px | 500 | varies | Projected Impact large values ("12 month (May 2027)", "30 Days", "Harbor District") |
| 26px | 600 | `#364153` | Page/screen title in detail header |
| 30px | 500 | `black` | ActionCard main value (15km, 620, 75%) |

### Letter spacing
- Most text: `letterSpacing: '-0.44px'`
- Card sub-headers (18px): `letterSpacing: '-0.31px'`
- Detail body (13px): `letterSpacing: '-0.08px'`
- Cost & Budget desc (13px): `letterSpacing: '0.06px'`

### Line heights
- 28px text → `lineHeight: '28px'`
- 24px heading → `lineHeight: '24px'`
- 18px text → `lineHeight: '19.5px'` or `'18px'`
- 13px body → `lineHeight: '20.8px'` or `'20.15px'`
- Steps in dark panel: `lineHeight: '1.3'`

---

## H. Header Patterns

### Map-style header (`HomePageHeader` component)
Used on S1, S2 only. Lives inside ScaledLayout.
- Menu, Bell, Minus, Plus buttons (left side).
- Search bar (center, frosted glass pill).
- Protect button with dropdown (right).
- Style: frosted-glass buttons (`bg-white/70 backdrop-blur-sm`), absolute `left-0 right-0 top-0 h-[70px]`.

On S4 (AssessCriticalZonesPage), `HomePageHeader` is still used from inside ScaledLayout, plus a separate back button at `left: 32, top: 99` with **white** text "← Harbor District".

### Detail / planning two-row header
Used on S5–S10. Built inline (not a shared component). **Not inside ScaledLayout.**

```
Padding: paddingLeft 28px | paddingRight 70px | paddingTop 33px
Row 1:  Menu (20px, color #364153)  +  Bell pill (38×38, bg rgba(247,247,247,0.8), border 1px solid rgba(255,255,255,0.2), borderRadius 100px, Bell size 20 color #364153)
        gap between icons: 21px
Row 2:  ArrowLeft (20px, color #364153, calls onBack)  +  Screen title (26px, fontWeight 600, color #364153, letterSpacing -0.44px, lineHeight 28px)
        gap between elements: 19px
marginTop between rows: 16px
```

Screen title examples:
- `Assess Critical Zones- Costal Road Access`
- `Response Planning`

---

## I. Card Styles

### Glass info card (map screens — AssessCriticalZonesPage left panel)
```
background: rgba(255,255,255,0.85)
border: 1px solid rgba(255,255,255,0.3)
borderRadius: 16px
box-shadow: glass-shadow
position: absolute; left: 16; top: 138; width: 386; height: 778
```
Internal layout: absolute-positioned text blocks. Section dividers: `bg-[rgba(0,0,0,0.08)]`, 1px height, full width or with 13px side margins.

### White detail card (right column in zone detail screens)
```
background: white
borderRadius: 20px
height: fixed (151px | 286px | 196px)
```
No border. Cards stack vertically with `gap: 30px`.

### Projected Impact card (ResponsePlanningPage)
```
background: rgba(255,255,255,0.6)
borderRadius: 30px
height: 172px (collapsed) or 555px (expanded with chart)
transition: height (no CSS transition — React re-render)
```

### Dark steps panel (ResponsePlanningPage)
```
background: rgba(0,0,0,0.8)
borderRadius: 20px
width: 542px; height: 523px
padding: 26px 24px 0 23px
```

### ActionCard (ResponsePlanningPage)
```
width: 340px; height: 159px
Left stripe: 40px wide, accent color, borderRadius 20px 0 0 20px
Right content: 300px, bg rgba(255,255,255,0.6), borderRadius 0 20px 20px 0
```
Internal: label (12px/600), value (30px/500), description (12px/500), "Review & Edit" link (11px/500, borderBottom 1px solid black).

### Horizontal image+text card (detail left column)
```
border: 1px solid #cfcccc
borderRadius: 15px
display: flex; overflow: hidden
Left: image 325px wide, objectFit: cover
Right: padding 20px 20px 20px 24px, 12px/700 title, 11px/400 description
```

### Map pill tab (zone tabs on map)
Compact/collapsed state:
```
height: 45px; borderRadius: 100px (→ inset clip-path keeps only 45px visible)
background: rgba(255,255,255,0.9)
box-shadow: 0 2px 8px rgba(0,0,0,0.08)
```
Expanded/hover state:
```
borderRadius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.15); width: 280px
Extra content: padding 16px, description + proposed response + "View full plan" link
```
Icon: `<img>` at 32×32, zone-specific SVG icon from `/icons/tab-*.svg`.
Title: 12px/600/`#1e2939`. Subtitle: 12px/500/`#505153`. Gap between icon and text: 27px.

---

## J. Button Styles

All buttons throughout the product use one of four styles:

### 1. Dark filled pill (primary CTA)
```
height: 40px (or 37px in Assess)
borderRadius: 100px
background: rgba(0,0,0,0.8) or rgba(16,24,40,0.9)
border: none
color: white
fontSize: 16px (or 14px); fontWeight: 500; letterSpacing: -0.44px
```
Examples: "Approve area plan", "Confirm area mapping", "Simulate response scenarios" (active).

### 2. Outlined pill (secondary)
```
height: 40px
borderRadius: 100px
background: transparent
border: 1px solid #323232 (or rgba(0,0,0,0.8) for lighter variant)
color: #323232
fontSize: 16px; fontWeight: 500; letterSpacing: -0.44px
```
Examples: "Edit plan", "Impact Timeline ↓".

### 3. Dimmed CTA (disabled state)
Same as dark filled pill but:
```
background: rgba(16,24,40,0.3)
cursor: default
onClick: undefined
```
Example: "Simulate response scenarios" before all zones approved.

### 4. Dark CTA small (glass panel)
```
height: 37px; width: 313px
borderRadius: 14px
background: rgba(16,24,40,0.9) or 0.3 (disabled)
```
Lives inside the AssessCriticalZonesPage left panel.

### Transition behavior
When a button transitions from disabled → active:
```css
transition: background 0.3s ease
```

---

## K. Zone Icon System

### In the Assess Critical Zones left-panel list (inline SVG)
All five zone icons are rendered as **inline SVG** (not `<img>`), enabling dynamic color changes via React state:

```tsx
<svg viewBox="0 0 24 24" width={24} height={24} fill="none">
  <rect
    width="24" height="24" rx="12"
    style={{ fill: isApproved ? ZONE_ACCENT[label] : '#C6C7C8', transition: 'fill 0.3s ease' }}
  />
  <path d={svgPath} fill="white" />
</svg>
```

- Default circle color: `#C6C7C8` (gray)
- Approved circle color: zone accent (orange, yellow, rose, blue, green)
- White icon path sits on top of the circle
- Transition: `fill 0.3s ease` on the `<rect>`

### In map tabs
Zone tabs use `<img src="/icons/tab-*.svg">` at 32×32px. Icon has colored circle baked into the SVG (not dynamic).

### In detail screen map overlay
Each detail screen shows a circular icon in the map area: small pill (bg white 90%, borderRadius 9999px, padding 4px 10px 4px 4px) with `<img>` icon 27×27 + mini title (9px/600/`#101828`) and subtitle (9px/500/`#505153`).

---

## L. Map Connector (Line + Dot)

Between a zone tab and its anchor point on the map:
```
Vertical line: width 2px, height 33px, background rgba(255,255,255,0.9), transformOrigin: bottom center
Dot: width 8px, height 8px, borderRadius 50%, background rgba(255,255,255,0.9), flexShrink 0
```
Entrance animations (first visit only, skipped on return):
- Line: `lineGrow 0.25s ease-out {lineDelay} both` — `scaleY(0→1)`
- Dot: `dotPop 0.15s ease-out {dotDelay} both` — `scale(0.3→1), opacity(0→1)`
- Stagger: `base = i × 0.3s`, dotDelay = base, lineDelay = base+0.15s

---

## M. Map Tab Hover / Expand Behavior

Single element with `clip-path: inset()` doing double duty (compact pill ↔ expanded card):

```
Compact:  clip-path: inset(0 0 calc(100%-45px) 0 round 100px)  ← downward tab
          clip-path: inset(calc(100%-45px) 0 0 0 round 100px)  ← upward tab
Expanded: clip-path: inset(0 0 0 0 round 16px)
```

Upward tabs (bottom-heavy tabs: Residential Edge, Increase pump capacity, Vulnerable Residents):
- Anchored by `bottom: 1008 - tab.top - 45` within ScaledLayout
- Content renders: `extraContent` above `pillRow`

Downward tabs (top-heavy tabs: Costal Road Access, Electric Utility Point):
- Anchored by `top: tab.top`
- Content renders: `pillRow` above `extraContent`

Width expands from tab-specific width to 280px on hover.

Transition:
```css
clip-path 0.3s ease-out, width 0.3s ease-out, box-shadow 0.2s
```

Hover event uses a 120ms hide timer to prevent flickering when moving between pill and card.

---

## N. Detail Screen Left Column Patterns

### Map image + marker
```
<img> height: 341px, borderRadius: 20px 20px 0 0, objectFit: cover
Marker: position absolute, bottom: 30, left: varies
  Pill: bg rgba(255,255,255,0.9), borderRadius 9999px, padding 4px 10px 4px 4px
    Icon img 27×27 + title 9px/600 + subtitle 9px/500
  Connector line: width 1px, height 24px, bg rgba(255,255,255,0.7), marginLeft 18
  Anchor dot: 8×8, borderRadius 50%, bg rgba(255,255,255,0.7), marginLeft 14
```

### White action plan card
Immediately below map image, shares border-radius continuation:
```
background: white
borderRadius: 0 0 20px 20px
padding: 20px 24px 24px 24px
```

### Section structure inside action plan card
```
Section title:  18px / fontWeight 600 / color #364153 / letterSpacing -0.31px / lineHeight 24px
Body text:      13px / fontWeight 400 / color #505153 / lineHeight 20.8px / letterSpacing -0.08px
Divider:        borderTop: 1px solid #cfcccc; marginTop: 20px
Gap title→body: marginTop 8px
Gap divider→next title: marginTop 20px
```

### Implementation step numbering
```
Circle: width 16, height 16, borderRadius 50%, background rgba(ACCENT,0.2)
Number: 8.8px / fontWeight 700 / color ACCENT / letterSpacing 0.18px
Step text: bold label (fontWeight 600, color #364153) + regular desc (fontWeight 400, color #505153)
Gap between steps: 10px; list marginTop: 10px
```

---

## O. Detail Screen Right Column Patterns

### Problem Summary card
```
height: 151px
flex row: [text block] [1px divider] [RiskGauge 100×82]
Text: 18px/600 title + 13px/400 description (maxWidth ~359px)
Divider: width 1px, height 91px, background rgba(0,0,0,0.1)
```

### Cost & Budget card
```
height: 286px
DonutChart (186×186) + legend
DonutChart: 3 segments using orange palette (zone-specific), r=55, strokeWidth=30
Legend: 17×17 colored circles + text (13px/400 desc + fontWeight 600 value), gap 17px
Donut center: 20px/700 total value
```

### Implementation Schedule card
```
height: 196px; padding 43px horizontal
Vertical connecting line: position absolute, left 10px, top 10px, width 1.5px, height 116px, color #364153
Nodes: 20×20, borderRadius 50%, border 1.5px solid #364153, bg white (empty circles)
Item gap: 38px
Label: 14px / color #505153
Value: fontWeight 700 / color #364153
```

### Right column button pair
```
marginTop: 55px; display flex; gap 30px; justifyContent: center
Edit plan (outlined): width 233px, height 40px, border 1px solid #323232, borderRadius 100px, Pencil icon 16px
Approve area plan (filled): width 233px, height 40px, background #323232, borderRadius 100px, color #f8f8f8
```

---

## P. Inline Editing Behavior

When "Edit plan" is active (`isEditing = true`), all plan text blocks receive:
```tsx
contentEditable={isEditing}
suppressContentEditableWarning
style={isEditing ? {
  outline: '1.5px dashed rgba(0,0,0,0.18)',
  borderRadius: 4,
  padding: '2px 4px',
  cursor: 'text',
} : {}}
```
Button label toggles: `isEditing ? 'Done' : 'Edit plan'`

---

## Q. Response Planning Screen Patterns

### Projected Impact card (collapsible)
- Header row: "Projected Impact" title + "When" column (red = no intervention, green = with intervention) + two stat columns + "Impact Timeline" toggle button.
- Toggle button position: `absolute right: 49, top: 74` within the card.
- Expands to include `ImpactTimelineChart` SVG (animated draw, red line = without protection, green line = with).
- `isTimelineOpen` bool controls `height` between `172px` and `555px`.

### Dark steps panel
Active step (currently step 1):
```
height: 67px; background: white; border: 1px solid rgba(0,0,0,0.1); borderRadius: 20px
Number: 18px/600/black; Title: 18px/600/black; Subtitle: 16px/400/black
padding: 0 16px; gap: 17px
```
Inactive steps (2–5):
```
height: 67px; color: white; no background
paddingLeft: 13px; paddingRight: 32px; gap: 17px
Number: 18px/600; Title: 18px/600; Sub: 16px/400
```
All steps gap: 34px.

### ActionCard component
```tsx
// Left stripe: accent color, 40×159, borderRadius 20px 0 0 20px
// Right: 300×159, bg rgba(255,255,255,0.6), borderRadius 0 20px 20px 0
Label: 12px/600/#364153; letterSpacing -0.44px
Value: 30px/500/black; letterSpacing -0.44px; lineHeight 21px
Desc: 12px/500/#505153; letterSpacing -0.44px; lineHeight 21px
"Review & Edit": 11px/500/black; borderBottom: 1px solid black; height 23px
```

### Layout proportions (bottom section)
Dark steps panel (542px) + flexGrow:62 spacer + left cards column + flexGrow:88 spacer + right cards column.
Left cards: 3 ActionCards, gap 22px. Right cards: 2 ActionCards, gap 22px.

---

## R. Spacing Reference

All critical spacing values observed across screens:

| Value | Usage |
|-------|-------|
| 4px | padding: 2px 4px edit mode |
| 8px | icon→text gap in small contexts |
| 9px | "Review & Edit" link height internal |
| 10px | step gap in left column, stat row gaps |
| 13px | map card side padding; spacing reference |
| 15px | zone list icon→label gap in Assess panel |
| 16px | marginTop between header rows; detail body-to-next-section |
| 17px | gap between step number and step content |
| 19px | gap between ArrowLeft and title in header |
| 20px | gap between zone list items; detail section padding |
| 21px | gap between Menu and Bell in header |
| 22px | ActionCard vertical gap |
| 24px | left-column card inner padding |
| 28px | header paddingLeft |
| 30px | right-column card vertical gap; between button pair |
| 33px | header paddingTop |
| 34px | steps gap in dark panel |
| 38px | implementation schedule node gap |
| 42px | left-right column gap in detail screen body |
| 43px | section title marginTop in ResponsePlanning |
| 45px | map tab pill height |
| 55px | bottom buttons marginTop in detail right column |
| 62/88 | flexGrow ratio spacers in ResponsePlanning |
| 66px | header paddingLeft in left column inner card |
| 70px | header paddingRight; body left/right padding |

---

## S. Animation Inventory

### Screen entrance
`.screen-enter` — `@keyframes fadeIn { from opacity:0; to opacity:1 }` — 0.4s ease.

### Map tab entrance (first visit to AssessCriticalZonesPage)
- Downward tab: `pillEnterDown 0.3s ease-out {delay} both` — clip-path from right-hidden pill to visible pill.
- Upward tab: `pillEnterUp 0.3s ease-out {delay} both`.
- Line: `lineGrow 0.25s ease-out {delay} both` — `scaleY(0→1)` from bottom center.
- Dot: `dotPop 0.15s ease-out {delay} both` — `scale(0.3→1)`.
- Skip on return visits (`skipAnimation` prop = `assessVisited.current`).

### Map tab expand/collapse
`clip-path 0.3s ease-out, width 0.3s ease-out, box-shadow 0.2s`

### Zone icon circle color on approval
`transition: 'fill 0.3s ease'` on SVG `<rect>`.

### Button opacity on all-zones-approved
`transition: 'background 0.3s ease'`

### ImpactTimeline chart line draw
`@keyframes drawLine { from: strokeDashoffset:1; to: strokeDashoffset:0 }` — 0.7s ease-out, red line starts, green line starts at 0.1s delay.

### Alert card entrance
`.alert-card-enter` — `@keyframes fadeInUp` — 0.5s ease.

### Live monitoring pulse dot
`.live-pulse` — `@keyframes pulse-dot`.

### Bell notification badge
No animation (static red dot).

---

## T. Data Visualization Patterns

### Risk Gauge (CoastalRoadAccessPage right panel)
SVG `viewBox="0 0 100 82"`, arc from 215° to 145° (290° span), `fillPct = score/10`.
- Track: `stroke #e5e7eb, strokeWidth 7, strokeLinecap round`
- Fill: `stroke #0b1f3a, strokeWidth 7, strokeLinecap round`
- Score text: 19px bold `#0b1f3a`
- Label: 6.5px `#6b778a`

### Donut Chart (CoastalRoadAccessPage)
- 3 segments: 20% `#F5D4A0`, 30% `#F5A06E`, 50% `#E87840` — orange palette
- `r=55, strokeWidth=30, cx=cy=93, viewBox 0 0 186 186`
- Center label: 20px/700 `#323232`
- Track: `stroke #f3f4f6`
- Percentage labels: 12px/600/`#364153`

### ImpactTimelineChart (ResponsePlanningPage)
- Red line (without protection): rises steeply from Moderate → High
- Green line (with protection): stays near Moderate, slight rise
- SVG viewBox 0 0 1190 200, years Today→2090 on X axis, High/Moderate/Low on Y
- Grid lines: dashed `stroke rgba(0,0,0,0.12) strokeDasharray 5,4`
- Data point dots: r=6, fill `#1a1a1a`

### Budget donut (AlertPage)
- 2 segments: Protection `#155dfc`, Adaptation `#51a2ff`
- SVG circles with `stroke-dasharray`

---

## U. Product Writing Tone

- **Concise, factual, action-oriented.** Every sentence delivers specific information.
- **No hedging language.** "Will" not "may"; "requires" not "might need".
- **Data-forward.** Numbers come first or early: "15km", "620 residents", "75%".
- **Zone labels are noun-first:** "Costal Road Access", "Electric Utility Point", "Residential Edge Blocks", "Increase pump capacity", "Vulnerable Residents".
- **Section headers are nouns:** "Action Plan Overview", "Implementation Steps", "Problem Summary", "Implementation Approach".
- **Step labels are verb-first:** "Raise Low Road Segments:", "Upgrade Drainage Capacity and Outfalls:", "Reinforce Shoreline Edge Protection:".
- **Status phrases are declarative:** "Potential disruption", "Changing the defense system", "Higher exposure", "Back-flow risk", "Support planning needed".
- **Proposed responses are short imperative clauses:** "Elevate low road segments", "Raise electrical cabinets and add protected power points."

---

## V. Interaction Rules

1. **Back navigation always uses `onBack` prop.** Never hardcode screen names in a screen component.
2. **Zone detail screens can be entered from two places** (AssessCriticalZonesPage or ResponsePlanningPage). `detailReturnScreen` in App.tsx determines where `onBack` goes.
3. **"Approve area plan" adds the zone to `approvedZones` array and navigates back.** `handleApproveZone(zoneName)` in App.tsx.
4. **"Simulate response scenarios" button is disabled** until `ZONE_LIST.every(z => approvedZones.includes(z.label))`.
5. **Zone icon circles in Assess panel turn to accent color on approval.** Transition `fill 0.3s ease`.
6. **AssessCriticalZonesPage entrance animation plays only on first visit.** `assessVisited = useRef(false)` persists across re-mounts. Pass `skipAnimation={assessVisited.current}`.
7. **Hover on map tab expands it** via clip-path + width transition. 120ms delay before collapse (prevents flicker).
8. **"Edit plan" toggles contentEditable** on all plan text. Button label changes to "Done".
9. **"Impact Timeline" expands the Projected Impact card** and draws the SVG chart lines.

---

## W. Component Architecture

### Shared layout components
| Component | Path | Used by |
|-----------|------|---------|
| `ScaledLayout` | `components/layout/ScaledLayout.tsx` | S1, S2, S4 |
| `HomePageHeader` | `components/shared/HomePageHeader.tsx` | S1, S2, S4 |
| `TopStatusBar` | `components/shared/TopStatusBar.tsx` | S1, S2 |
| `ModeSelector` | `components/shared/ModeSelector.tsx` | S1, S2 |
| `FloodDepthScale` | `components/shared/FloodDepthScale.tsx` | S1, S2 |
| `BottomSummaryBar` | `components/dashboard/BottomSummaryBar.tsx` | S1, S2 |
| `LiveMonitoringPanel` | `components/dashboard/LiveMonitoringPanel.tsx` | S1, S2 |
| `TimeView` | `components/dashboard/TimeView.tsx` | S1, S2 |
| `NewAlertCard` | `components/dashboard/NewAlertCard.tsx` | S2 only |

### Screens
| Screen | Path | Type |
|--------|------|------|
| `HomePage` | `screens/HomePage.tsx` | Map canvas |
| `HomePageAlert` | `screens/HomePageAlert.tsx` | Map canvas |
| `AlertPage` | `screens/AlertPage.tsx` | White panel |
| `AssessCriticalZonesPage` | `screens/AssessCriticalZonesPage.tsx` | Map + glass card |
| `CoastalRoadAccessPage` | `screens/CoastalRoadAccessPage.tsx` | Detail screen |
| `VulnerableResidentsPage` | `screens/VulnerableResidentsPage.tsx` | Detail screen |
| `ElectricUtilityPage` | `screens/ElectricUtilityPage.tsx` | Detail screen |
| `ResidentialEdgePage` | `screens/ResidentialEdgePage.tsx` | Detail screen |
| `PumpCapacityPage` | `screens/PumpCapacityPage.tsx` | Detail screen |
| `ResponsePlanningPage` | `screens/ResponsePlanningPage.tsx` | Planning screen |

---

## X. State Management

`App.tsx` owns all state:
```typescript
type Screen = 'home' | 'home-alert' | 'alert' | 'assess-critical-zones'
            | 'planning' | 'coastal-road' | 'vulnerable-residents'
            | 'electric-utility' | 'residential-edge' | 'pump-capacity';

const [screen, setScreen] = useState<Screen>('home');
const [detailReturnScreen, setDetailReturnScreen] = useState<'assess-critical-zones' | 'planning'>('assess-critical-zones');
const [approvedZones, setApprovedZones] = useState<string[]>([]);
const assessVisited = useRef(false);
```

---

## Y. Asset Management

### Local assets in `/public/`
| Asset | URL | Usage |
|-------|-----|-------|
| `coastal-background.png` | `/coastal-background.png` | Map screen background (S1/S2/S4) |
| `costal-road-map.jpg` | `/costal-road-map.jpg` | Detail screen (S5) map image |
| `costal-road-pile.jpg` | `/costal-road-pile.jpg` | Detail screen (S5) implementation image |
| `icons/tab-car.svg` | `/icons/tab-car.svg` | Zone tab icon |
| `icons/tab-electric.svg` | `/icons/tab-electric.svg` | Zone tab icon |
| `icons/tab-building.svg` | `/icons/tab-building.svg` | Zone tab icon |
| `icons/tab-water.svg` | `/icons/tab-water.svg` | Zone tab icon |
| `icons/tab-people.svg` | `/icons/tab-people.svg` | Zone tab icon |
| `icons/costal-road-access.svg` | `/icons/costal-road-access.svg` | Detail overlay + ActionCard |
| `icons/vulnerable-residents.svg` | `/icons/vulnerable-residents.svg` | ActionCard |
| `icons/increase-pump-capacity.svg` | `/icons/increase-pump-capacity.svg` | ActionCard |
| `icons/residential-edge-blocks.svg` | `/icons/residential-edge-blocks.svg` | ActionCard |
| `icons/electric-utility-point.svg` | `/icons/electric-utility-point.svg` | ActionCard |
| `icons/notice-icon.svg` | `/icons/notice-icon.svg` | Assess panel notice row |

### Rules for new assets
1. Place in `public/` (no import needed, referenced as `/filename`).
2. Never use Figma CDN URLs in committed code — they expire in 7 days.
3. Zone list icons in the Assess panel must use **inline SVG** (not `<img>`), so fill can be controlled dynamically.

### lucide-react icons used
`Bell`, `Menu`, `ArrowLeft`, `Pencil`, `ChevronDown`, `TrendingUp`, `Waves`, `Building2`, `Droplets`, `LayoutDashboard`, `GitBranch`, `ArrowLeftRight`, `FileText`, `Share2`, `ArrowUp`, `ShieldCheck`, `CheckCircle2`, `ChevronRight`, `TriangleAlert`, `Users`, `Radio`, `Minus`, `Plus`, `Search`

---

## Z. How to Build the Next Screen

### Checklist for a new screen

1. Decide screen type (map canvas / detail / planning) — look at Section B.
2. Add the new state key to the `Screen` union in `App.tsx`.
3. Create the file in `src/screens/`.
4. For **detail screens** — copy the header pattern from Section H and the two-column body from Section D exactly. Do NOT invent a new layout.
5. Use only colors from Section F. Do not introduce new hex values.
6. Use only font sizes and weights from Section G. Do not pick arbitrary sizes.
7. Use only button styles from Section J. Do not create a new button shape.
8. Card backgrounds must come from the surface colors in Section F.
9. Match the letter-spacing (`-0.44px` for most text) and line-heights from Section G.
10. Any new animation must follow the existing animation vocabulary (fade, clip-path, scaleY, strokeDashoffset) — not JS-driven timers or spring animations.
11. Write copy matching the tone in Section U: noun-first labels, verb-first step actions, data-forward sentences.
12. Document the new screen in Section A (screen inventory).

---

## Changelog

### 2026-06-21 — Full design-system documentation update (v2.0)
- Documented all 10 implemented screens (previously only 3 were documented).
- Added: screen-type taxonomy, zone accent color map, detail-screen layout architecture, header patterns, card styles, button styles, zone icon system, map connector, tab hover/expand behavior, inline editing behavior, right-column proportional scaling, spacing reference, animation inventory, data viz patterns, writing tone, interaction rules, complete asset table.
- Updated: screen inventory, navigation architecture, component list.
- **No code was changed** — this is a documentation-only update.

### 2026-05-17 — Header restructure: viewport-level ModeSelector and TopStatusBar (Screens 1 & 2)
- Moved `ModeSelector` and `TopStatusBar` outside `ScaledLayout` to viewport-level.
- Replaced lucide Layers icons with custom inline SVG rhombus-stack icons.

### 2026-05-17 — Icon replacement, panel fixes, full-viewport bars
- ModeSelector icons replaced. Live Monitoring icon → lucide Radio. Stats alignment fixed. BottomSummaryBar moved to viewport level.

### 2026-05-16 — Viewport-aware scaling
- `ScaledLayout` component added.
