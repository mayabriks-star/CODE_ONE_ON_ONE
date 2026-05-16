# How to Update ARCHITECTURE_AND_DESIGN_SYSTEM.md

This guide explains when and how to keep `ARCHITECTURE_AND_DESIGN_SYSTEM.md` accurate as the prototype evolves. Follow it whenever you make a structural change so future developers have a reliable single source of truth.

---

## When to Update the Architecture Document

Update `ARCHITECTURE_AND_DESIGN_SYSTEM.md` immediately after any of the following:

| Change type | Trigger |
|---|---|
| New screen added | A new `src/screens/*.tsx` file is created |
| Screen removed or renamed | A screen file is deleted or its export name changes |
| New component created | A file is added to `src/components/**/*.tsx` |
| Component deleted or merged | A component file is removed |
| Component props change | A prop is added, removed, renamed, or its type changes |
| Design token added or changed | A color, font size, radius, shadow, or spacing value changes in `tailwind.config.js` or `src/index.css` |
| CSS utility class added | A new `.glass-*`, `.flood-*`, `.screen-*` or similar class is added to `index.css` |
| UX flow changes | A screen transition, timer, or navigation rule is added, removed, or reordered |
| New asset added | A file is added to `public/` or `src/assets/` |
| Dependency added or removed | A new package appears in `package.json` |
| Layout fix applied | An absolute position, scale factor, or viewport calculation is adjusted |
| Known limitation resolved | A previously documented workaround is no longer needed |
| New known limitation discovered | A constraint or workaround is introduced |

---

## How to Document a New Screen

1. Add an entry to **Section B — Screen Inventory** table with:
   - Screen ID (e.g. `S4`)
   - Name
   - Trigger (what causes it to appear)
   - File path
   - Key components rendered

2. Add a subsection to **Section C — UX & Navigation Architecture** describing:
   - What state value activates this screen
   - Which screen(s) it transitions to and how
   - Any timers or side effects

3. Add a subsection to **Section D — UI Layout Architecture** listing:
   - Layout container used
   - Absolute positions of all top-level components
   - Any responsive/scaling notes specific to this screen

4. Add all new components the screen introduces to **Section F** (see "How to document a new component" below).

Use the template at the end of this document.

---

## How to Document a New Component

1. Add an entry to the **Section F — Component Architecture** table:
   - Component name (linked to its file)
   - Category (`shared` / `dashboard` / `alert` / `layout`)
   - Screens it appears on
   - One-line description

2. Add a detail subsection under the appropriate category with:
   - File path
   - Props interface (name → type → purpose)
   - Absolute position if applicable (`left`, `top`, `width`, `height`)
   - Which design tokens it uses
   - Any non-obvious behavior (animations, conditions)

Use the template at the end of this document.

---

## How to Document a Design Token Change

1. Locate the token in **Section E — Design System Tokens** under the relevant sub-section (Colors, Typography, Spacing, etc.).

2. Update the value and add a brief inline comment explaining what the token is used for if it isn't already annotated.

3. If the token is new, add it in the correct sub-section and note which components reference it.

4. If you are removing a token, search the codebase for all usages first (`grep -r "token-name" src/`) and confirm no component still relies on it before deleting the entry.

5. Update the changelog at the bottom of this document.

---

## How to Document a UX Flow Change

1. Update the flow diagram or prose in **Section C — UX & Navigation Architecture**:
   - Revise the state machine description to reflect the new trigger, timer, or condition
   - Update the transition table (source screen → trigger → destination screen)

2. If a timer value changed (e.g. 10 s → 5 s), update the value and note the reason in the changelog.

3. If back-navigation behavior changed, update the "back arrow" entry in the relevant screen's row.

---

## How to Document a New Asset

1. Add a row to the **Section I — Asset Management** table with:
   - Asset filename
   - File path (`public/` or `src/assets/`)
   - Format
   - Dimensions or size (if raster)
   - Which screens / components use it
   - Any treatment notes (e.g. `background-size: cover`)

2. If the asset replaces an existing one, mark the old row as `[REMOVED]` and add the replacement inline.

---

## How to Document a Code Architecture Change

1. Update **Section G — Code Architecture**:
   - If the folder structure changed, update the folder tree
   - If a new utility or hook was added, add it to the relevant subsection
   - If a build tool configuration changed (`vite.config.ts`, `tailwind.config.js`, `tsconfig*.json`), note what changed and why

2. If dependencies changed, update the tooling table (package name, version, purpose).

---

## How to Document Responsive or Layout Fixes

1. Update **Section D — UI Layout Architecture** under the affected screen's subsection:
   - Note the old value and new value
   - Explain the root cause (e.g. "browser chrome reduces available height to ~874 px on a 1008 px canvas")
   - Describe the fix mechanism (e.g. `ScaledLayout` transform, adjusted `top` value)

2. If a new layout utility component was created (like `ScaledLayout`), document it in **Section F** as well.

3. Update **Section J — Implementation Decisions & Known Trade-offs** if the fix involved a deliberate trade-off.

---

## How to Document Known Limitations

1. Add a row to the **Section J — Implementation Decisions & Known Trade-offs** table:
   - Area affected
   - Description of the limitation
   - Reason it exists (constraint, time, scope)
   - Suggested future fix

2. When a known limitation is resolved, move it out of the table and into the changelog with a note that it was fixed.

---

## Recommended Changelog Format

Add entries to the bottom of `ARCHITECTURE_AND_DESIGN_SYSTEM.md` under a `## Changelog` heading (create it if it doesn't exist). Use this format:

```
### YYYY-MM-DD — Short description of change
- **What changed**: One-sentence description.
- **Why**: The reason for the change.
- **Files affected**: `src/components/foo/Bar.tsx`, `tailwind.config.js`
- **Sections updated**: D (UI Layout), F (Components)
```

Example:

```
### 2026-05-16 — Viewport-aware scaling added to Screens 1 & 2
- **What changed**: ScaledLayout component applies CSS transform scale so the 1512×1008 design canvas fits within any browser viewport without overflow.
- **Why**: Browser chrome reduces available viewport height, causing BottomSummaryBar to be cut off on standard laptop displays.
- **Files affected**: `src/components/layout/ScaledLayout.tsx`, `src/screens/HomePage.tsx`, `src/screens/HomePageAlert.tsx`
- **Sections updated**: D (UI Layout), F (Components), J (Known Trade-offs)
```

---

## Templates

### Template: New Screen

Add to Section B table:
```
| S{N} | {Screen Name} | {Trigger description} | `src/screens/{FileName}.tsx` | Component1, Component2, Component3 |
```

Add to Section C:
```
### Screen {N} — {Screen Name}
- **State value**: `'{state-key}'`
- **Activated by**: {timer / user click / back navigation / etc.}
- **Transitions to**: Screen {X} on {trigger}
- **Transitions from**: Screen {Y} via {trigger}
- **Side effects**: {none / timer / animation / etc.}
```

Add to Section D:
```
### Screen {N} — {Screen Name} Layout
- **Container**: `<ScaledLayout>` / `<AppShell>` / custom
- **Top-level components and positions**:
  | Component | left | top | width | height |
  |---|---|---|---|---|
  | ComponentName | {n}px | {n}px | {n}px | {n}px |
- **Scaling**: {same as S1/S2 ScaledLayout / not scaled / custom}
- **Notes**: {any layout-specific notes}
```

---

### Template: New Component

Add to Section F table:
```
| `ComponentName` | {shared/dashboard/alert/layout} | S{N}, S{M} | {One-line description} |
```

Add a detail subsection:
```
#### `{ComponentName}`
- **File**: `src/components/{category}/{ComponentName}.tsx`
- **Used on**: Screen {N}, Screen {M}
- **Props**:
  | Prop | Type | Default | Purpose |
  |---|---|---|---|
  | propName | `type` | `default` | What it controls |
- **Position**: `left: {n}px, top: {n}px, width: {n}px` (absolute within ScaledLayout canvas)
- **Design tokens used**: `glass-30`, `text-[14px]`, `rounded-lg`, etc.
- **Behavior**: {static / animated / conditional — describe if non-obvious}
```

---

### Template: New Design Token

Add under the appropriate sub-section in Section E:
```
| `{token-name}` | `{value}` | {Usage description} | `{Component1}`, `{Component2}` |
```

Or in CSS variable format:
```css
--{token-name}: {value};   /* {usage description} */
```

In `tailwind.config.js` extend block:
```js
'{token-name}': '{value}',  // {usage description}
```

---

### Template: New Interaction / UX Flow

Add or update in Section C:
```
### Interaction: {Interaction Name}
- **Trigger**: {user action / timer / system event}
- **From state**: `'{source-screen}'`
- **To state**: `'{destination-screen}'`
- **Implementation**: `{file path}:{line or function name}`
- **Animation**: {none / fadeIn / slideUp / custom CSS class}
- **Reversible**: {yes — back arrow returns to source / no — one-way transition}
```

---

### Template: New Asset

Add to Section I table:
```
| `{filename}` | `public/` or `src/assets/` | {PNG/SVG/etc.} | {dimensions or N/A} | S{N}, S{M} | {Treatment notes} |
```

---

## Checklist Before Committing Architecture Document Changes

Run through this list before saving changes to `ARCHITECTURE_AND_DESIGN_SYSTEM.md`:

- [ ] Every new file mentioned in the doc actually exists at the stated path (`ls src/...`)
- [ ] Every removed file has been deleted from the project (no dangling references)
- [ ] All token values in the doc match the values in `tailwind.config.js` and `src/index.css`
- [ ] All absolute position values in the doc match the values in the component files
- [ ] Props tables reflect the current TypeScript interfaces (no stale props listed)
- [ ] Screen inventory matches the actual files in `src/screens/`
- [ ] The UX flow table matches the `useState` machine in `src/App.tsx`
- [ ] A changelog entry has been added for each change made in this update
- [ ] Sections updated are consistent (if a component moved, both its old and new sections are updated)
- [ ] The build still passes: `npm run build` exits with no errors
- [ ] No sensitive data (API keys, credentials, personal info) was inadvertently added
