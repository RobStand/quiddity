# Quiddity Design System

## Product Context

- **What this is:** A browser-based knowledge engineering tool for creating and modeling IDEF5 ontologies. Runs entirely in the browser — no build system, no server, no dependencies.
- **Who it's for:** Knowledge engineers, ontology modelers, and AI practitioners who want to define deterministic knowledge graphs.
- **Space/industry:** Enterprise architecture tools and formal ontology modeling. Peers: Sparx Enterprise Architect, Archi (ArchiMate), Bizzdesign Horizzon.
- **Project type:** Single-page web app — canvas-based diagramming tool.

---

## Aesthetic Direction

- **Direction:** Scholar's Instrument — the precision of a scientific tool meets the warmth of scholarly work. Not a generic developer tool. Not corporate BI. Something a philosopher-engineer would build.
- **Decoration level:** Minimal — typography and color carry all the weight. No gradients, no layering, no decoration for its own sake.
- **Mood:** Serious, focused, precise — but warm rather than cold. The UI recedes so the ontology work dominates. A professional tool that respects the user's intelligence.

---

## Philosophy

Quiddity is a **professional domain tool**, not a consumer app. The word "quiddity" comes from the Latin *quidditas* — the philosophical concept of what makes something what it is. This intellectual tradition should be felt in the aesthetic.

- **Density over whitespace**: 13px base, tight 5–10px padding, compact controls. Chrome areas are slightly relaxed; canvas remains unchanged.
- **Neutral chrome**: Warm-black toolbar recedes; ivory panels support; canvas dominates.
- **One accent**: `#d97706` (amber) is the sole interactive/selection color — do not introduce a second accent. Do not use blue.
- **Canvas is sacred**: No animations, no visual noise on the canvas. Every pixel of canvas space belongs to the ontology.
- **Warmth, not coldness**: The palette uses warm blacks and warm whites throughout. Warm-black toolbar and ivory panels share the same temperature envelope as the amber accent.

---

## IDEF5 Symbol Integrity

**This is non-negotiable.** IDEF5 symbols are defined by the IDEF5 specification and must not be altered for aesthetic or design reasons.

### All 17 Symbol Types Must Be in the Toolbox

**Natural Kinds:**

- `kind` — rectangle
- `individual` — rectangle (distinguished from kind by properties, not shape)
- `referent` — named reference to an entity defined elsewhere

**Relations:**

- `relation-first` — first-order relation
- `relation-second` — second-order relation
- `relation-alt` — alternative relation form

**Other Constructs:**

- `process` — triangle / process shape
- `junction-xor` — XOR junction
- `junction-or` — OR junction
- `junction-and` — AND junction
- `state-weak` — weak state
- `state-strong` — strong state
- `transition-instant` — instantaneous transition
- `connect-fwd` — forward connection
- `connect-bwd` — backward connection
- `connect-plain` — plain connection
- `container` — container / bounding rectangle
- `key` — key characteristic marker

All shape rendering is in `quiddity.js:createNodeSVG()`. Do not modify shape geometry for aesthetic reasons. Any new symbol added to the toolbox must match the IDEF5 specification exactly.

---

## Color Palette

| Token | Value | Usage |
| --- | --- | --- |
| `--toolbar-bg` | `#1c1917` | Top toolbar background (warm black) |
| `--toolbar-border` | `#0d0b09` | Toolbar bottom border |
| `--toolbar-btn` | `#2d2824` | Button background (default) |
| `--toolbar-btn-hover` | `#3d3530` | Button background (hover) |
| `--toolbar-btn-active` | `#1a1614` | Button background (active/pressed) |
| `--toolbar-btn-border` | `#3d3530` | Button border |
| `--toolbar-label` | `#7c6e5e` | App name label |
| `--toolbar-icon` | `#f0ebe4` | Button text/icon color |
| `--toolbar-sep` | `#3d3530` | Separator color |
| `--panel-bg` | `#f2f1ef` | Toolbox and properties panel background (light warm gray) |
| `--panel-border` | `#d4cdc4` | Panel outer border |
| `--canvas-bg` | `#e8dcc8` | Canvas container background (warm parchment) |
| `--accent` | `#d97706` | Selection stroke, focus ring, active states — amber |
| `--accent-dark` | `#b45309` | Accent hover/pressed state |
| `--accent-light` | `rgba(217,119,6,0.10)` | Rubberband fill, selection overlay, toolbox hover |
| `--accent-focus` | `rgba(217,119,6,0.20)` | Input focus box-shadow |
| `--danger` | `#dc2626` | Delete actions |
| `--text-primary` | `#1c1917` | Body text |
| `--text-secondary` | `#3d3530` | Panel headings |
| `--text-muted` | `#6b5e4e` | Label text |
| `--text-faint` | `#9b8c7a` | Section headers, placeholder text |
| `--text-disabled` | `#b5a898` | Empty state text |
| `--border-light` | `#e0d9cf` | Internal dividers (panel sections) |
| `--border-input` | `#c8bfb2` | Input borders |
| `--surface` | `#ffffff` | Input backgrounds |
| `--surface-raised` | `#f7f4ef` | Raised surfaces (read-only inputs, code blocks) |

**Design intent:** The warm-black toolbar (#1c1917) and ivory panels (#fafaf8) share the same warm temperature envelope. Amber (#d97706) is the single saturated color in the system — it does all the work. No other tool in the knowledge-engineering/diagramming category uses amber. This makes Quiddity instantly recognizable.

**Never use blue as an accent.** The previous accent (#3b82f6) has been replaced. Any references to it in code should be updated.

---

## Typography

**Font stack:** `'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Monospace:** `'Geist Mono', ui-monospace, monospace`

Load via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
```

| Role | Font | Size | Weight | Color | Usage |
| --- | --- | --- | --- | --- | --- |
| Body | Geist | 13px | 400 | `--text-primary` | Default UI text |
| UI controls | Geist | 12px | 400 | `--text-primary` | Buttons, inputs, dropdown items |
| Labels | Geist | 11px | 400 | `--text-muted` | Property field labels |
| Section headers | Geist | 10px | 600 | `--text-faint` | Toolbox sections, panel headers (uppercase, 0.7px letter-spacing) |
| App name | Geist | 11px | 400 | `--toolbar-label` | Toolbar "Quiddity" label |
| Panel heading | Geist | 13px | 600 | `--text-secondary` | Properties panel h3 |
| Zoom display | Geist Mono | 12px | 400 | `--text-faint` | Toolbar zoom readout |
| Node IDs / technical | Geist Mono | 11px | 400 | `--text-faint` | ID fields, technical identifiers |

**Why Geist:** No tool in the EA/ontology modeling category uses it. It reads as technical and modern (Vercel's developer font), setting Quiddity apart from every Eclipse-era Java tool in this space.

---

## Spacing

Grid: **base 4px**, common steps: 4, 5, 6, 8, 10, 14px

| Context | Value |
| --- | --- |
| Toolbar padding | `8px 10px` |
| Toolbar gap between items | `6px` |
| Toolbox item padding | `5px 8px` |
| Toolbox section padding | `8px 8px 4px` |
| Properties panel padding | `14px` |
| Input padding | `5px 7px` |
| Context menu item padding | `7px 14px` |

**Canvas spacing is unchanged.** Only chrome areas (toolbar, panels) have padding defined here.

---

## Border Radius

| Element | Radius |
| --- | --- |
| Toolbar buttons | `4px` |
| Inputs and selects | `4px` |
| Color swatches | `3px` |
| Context menu | `6px` — intentional distinction (floating overlay, not inline control) |
| Dropdown menu | `4px` |
| AI panel messages | `8px` |

> **Note:** Context menu uses `6px` (floating/overlay) vs `4px` (inline controls). Keep this consistent — do not use `6px` for inline controls.

---

## Interactive States

| State | Visual treatment |
| --- | --- |
| Hover (toolbar btn) | `background: #3d3530` |
| Active (toolbar btn) | `background: #1a1614` |
| Hover (toolbox item) | `background: rgba(217,119,6,0.10)` — amber tint |
| Hover (context menu item) | `background: rgba(217,119,6,0.08); color: #d97706` |
| Hover (danger item) | `background: rgba(220,38,38,0.06); color: #dc2626` |
| Focus (input) | `border-color: #d97706; box-shadow: 0 0 0 2px rgba(217,119,6,0.20)` |
| Selected (canvas node) | `stroke: #d97706 !important; stroke-width: 2.5px` |
| Selected (canvas edge) | `stroke: #d97706 !important` |
| Selected (color swatch) | `border: 2px solid #d97706; box-shadow: 0 0 0 1px #d97706` |
| AI button active | `background: #d97706; color: white; border-color: #b45309` |

---

## Motion

- **Approach:** Minimal-functional — only motion that aids comprehension.
- **Canvas:** No animations. Ever. They slow down diagramming and break concentration.
- **Panel transitions:** `150ms ease-out` for show/hide only.
- **AI panel (desktop):** `200ms ease-out` slide in from right via `margin-right`.
- **AI panel (≤900px):** `200ms ease-out` slide up from bottom via `transform: translateY`.
- **No entrance animations, no hover transitions on canvas elements.**

---

## Components

### Toolbar Button (`.tb-btn`)

Warm-dark background button. Always shows text (never icon-only at desktop breakpoint). Gap between icon and label: `4px`. Font: Geist 12px.

### Toolbox Section Header (`.toolbox-section`)

Uppercase, 10px, semibold, `--text-faint`. Preceded by a `1px solid var(--border-light)` top border (except first section). Acts as a visual anchor for scanning the toolbox.

### Toolbox Item (`.toolbox-item`)

SVG preview (36×36 minimum) + text label. `cursor: grab`. Hover tint is `rgba(217,119,6,0.10)`. Items that are **edge tools** enter connection mode rather than dragging to canvas.

### Properties Panel Input (`.prop-input`)

Full-width, 12px, `border: 1px solid var(--border-input)`, `border-radius: 4px`. Focus state uses amber ring. `textarea.prop-input` is resizable vertically, minimum 60px.

### Color Swatch (`.color-swatch`)

20×20px, `border-radius: 3px`. Selected state: `border: 2px solid #d97706; box-shadow: 0 0 0 1px #d97706`. Default swatch shows a cross (`✕`) on white background.

### Context Menu (`#context-menu`)

Fixed-position floating overlay. `6px` border radius, `box-shadow: 0 4px 16px rgba(0,0,0,0.15)`. Items: 12px, `7px 14px` padding. Separator: `1px solid var(--border-light)`. Hover: amber tint and amber text.

### AI Panel (`#ai-panel`)

280px wide, ivory background, amber accent throughout. Confirmation chips: `background: rgba(217,119,6,0.10); border: 1px solid rgba(217,119,6,0.25); color: #b45309`. Canvas spinner badge: dark background (`#1c1917`) with amber spinner (`border-top-color: #d97706`). User message bubbles: amber background.

---

## Canvas

- Background: `#eae6df` (warm parchment)
- Grid: dot grid at 20px pitch, dots at `r=1.5`, fill `#c0ae90`
- Grid rendered as SVG `<pattern>` applied to a 6000×6000 rect centered at origin
- Layers (bottom to top): `grid-layer` → `edges-layer` → `nodes-layer` → `ui-layer`

**IDEF5 symbol shapes are defined by the IDEF5 specification and must not be altered for aesthetic reasons.** All shape rendering is in `quiddity.js:createNodeSVG()`. See IDEF5 Symbol Integrity section above.

---

## Responsive Breakpoints

| Breakpoint | Behavior |
| --- | --- |
| ≥901px | Full desktop layout |
| ≤900px | Toolbox collapses to icon-only (48px wide); properties panel collapses behind toggle; AI panel slides up from bottom as 60vh overlay |

---

## Accessibility

- **Focus styles**: All interactive elements show a visible focus ring using amber (`#d97706`)
- **Touch targets**: Minimum 44px for touch interactions (tablet mode)
- **Context menu**: Arrow keys navigate items; Escape closes
- **Keyboard shortcuts**: Ctrl+Z/Y for undo/redo; Delete key removes selected elements
- **Toolbox keyboard**: Enter on focused toolbox item places symbol at canvas center
- **ARIA**: Toolbar buttons use `aria-label`; canvas SVG is `role="img"` for export; AI panel uses `role="complementary"` and `aria-live` on message thread

---

## What Not To Do

- Do not introduce a second accent color — `#d97706` is the only interactive color
- Do not use blue (`#3b82f6`, `#4a90e2`, or any blue) as an accent — amber replaced it entirely
- Do not use `6px` border-radius on inline controls (only floating overlays)
- Do not add whitespace or padding to the canvas — density there is intentional
- Do not use emoji for icons in new additions — use inline SVG paths
- Do not add animations to canvas interactions — they slow down diagramming
- Do not alter IDEF5 symbol shapes for aesthetic reasons — they are defined by the specification
- Do not omit any of the 17 IDEF5 symbol types from the toolbox

---

## Decisions Log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-03-21 | Toolbar color: `#1a1e2e` → `#1c1917` | Warm black (stone-like) replaces blue-black. Shifts mood from developer editor to scholarly instrument. |
| 2026-03-21 | Accent color: `#3b82f6` → `#d97706` | Amber is unique in this tool category. Signals intellectual/scholarly tradition vs generic engineering blue. |
| 2026-03-21 | Canvas: `#e8e8e8` → `#eae6df` | Slight warm shift. Reads as good paper rather than factory floor. |
| 2026-03-21 | Panels: `#fafafa` → `#fafaf8` | Ivory, not pure white. Same warm temperature envelope as toolbar and canvas. |
| 2026-03-21 | Canvas grid dots: `#bbb` → `#c0ae90` | Warm amber-tinted dots match parchment canvas. |
| 2026-03-21 | Canvas bg: `#eae6df` → `#e8dcc8`; panels: `#fafaf8` → `#f2f1ef` | Clearer separation — canvas reads as parchment, panels as light warm gray. |
| 2026-03-21 | Font: system stack → Geist + Geist Mono | No EA/ontology tool uses Geist. Sets Quiddity apart from Eclipse-era Java tools. |
| 2026-03-21 | Aesthetic direction named: Scholar's Instrument | Quiddity models essence of things (quidditas). Should feel like a scholarly instrument, not a dev tool. |
| 2026-03-21 | Full design system refresh via /design-consultation | Research confirmed amber is unused in this category. All risks accepted. |
