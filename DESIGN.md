# Quiddity Design System

## Product Context
- **What this is:** A browser-based knowledge engineering tool for creating and modeling IDEF5 ontologies. Runs entirely in the browser — no build system, no server, no dependencies.
- **Who it's for:** Knowledge engineers, ontology modelers, and AI practitioners who want to define deterministic knowledge graphs.
- **Space/industry:** Enterprise architecture tools and formal ontology modeling. Peers: Sparx Enterprise Architect, Archi (ArchiMate), Bizzdesign Horizzon.
- **Project type:** Single-page web app — canvas-based diagramming tool.

---

## Aesthetic Direction
- **Direction:** Industrial / Precision — Not a generic CAD tool; a fine instrument. Less "utility software," more the aesthetic of Zed or Cursor: you can tell someone designed it, but it doesn't draw attention to itself.
- **Decoration level:** Minimal — Typography and color carry the weight. No gradients, no layering, no decoration for its own sake.
- **Mood:** Serious, focused, precise. The UI recedes so the ontology work dominates. A professional tool that respects the user's intelligence.

---

## Philosophy

Quiddity is a **professional domain tool**, not a consumer app. The design borrows from CAD and diagramming tool conventions while deliberately departing from the dated Eclipse/Java-era aesthetic that defines most tools in this category.

- **Density over whitespace**: 13px base, tight 5–10px padding, compact controls. Chrome areas are slightly more relaxed than before; canvas remains unchanged.
- **Neutral chrome**: Ink-dark toolbar recedes; light panels support; canvas dominates.
- **One accent**: `#3b82f6` (crisp blue) is the sole interactive/selection color — do not introduce a second accent.
- **Canvas is sacred**: No animations, no visual noise on the canvas. Every pixel of canvas space belongs to the ontology.

---

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--toolbar-bg` | `#1a1e2e` | Top toolbar background (ink blue-black) |
| `--toolbar-border` | `#0d1020` | Toolbar bottom border |
| `--toolbar-btn` | `#2a2f42` | Button background (default) |
| `--toolbar-btn-hover` | `#363c52` | Button background (hover) |
| `--toolbar-btn-active` | `#1e2236` | Button background (active/pressed) |
| `--toolbar-btn-border` | `#363c52` | Button border |
| `--toolbar-label` | `#8892b0` | App name label |
| `--toolbar-icon` | `#e8e9ed` | Button text/icon color |
| `--toolbar-sep` | `#363c52` | Separator color |
| `--panel-bg` | `#fafafa` | Toolbox and properties panel background |
| `--panel-border` | `#ddd` | Panel outer border |
| `--canvas-bg` | `#e8e8e8` | Canvas container background |
| `--accent` | `#3b82f6` | Selection stroke, focus ring, active states |
| `--accent-light` | `rgba(59,130,246,0.1)` | Rubberband fill, selection overlay, toolbox hover |
| `--accent-focus` | `rgba(59,130,246,0.2)` | Input focus box-shadow |
| `--danger` | `#e53e3e` | Delete actions |
| `--text-primary` | `#222` | Body text |
| `--text-secondary` | `#444` | Panel headings |
| `--text-muted` | `#666` | Label text |
| `--text-faint` | `#888` | Section headers, placeholder text |
| `--text-disabled` | `#999` | Empty state text |
| `--border-light` | `#e0e0e0` | Internal dividers (panel sections) |
| `--border-input` | `#ccc` | Input borders |

**Design intent:** The ink blue-black toolbar (`#1a1e2e`) has a slight blue undertone that reads as deliberate rather than generic. This is the same approach Zed, Warp, and Cursor use to distinguish their dark themes. The crisp blue accent (`#3b82f6`) replaces the earlier `#4a90e2` — same hue family, but modern and precise.

---

## Typography

**Font stack:** `'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

**Monospace:** `'Geist Mono', ui-monospace, monospace`

Load via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400&display=swap" rel="stylesheet">
```

| Role | Font | Size | Weight | Color | Usage |
|---|---|---|---|---|---|
| Body | Geist | 13px | 400 | `--text-primary` | Default UI text |
| UI controls | Geist | 12px | 400 | `--text-primary` | Buttons, inputs, dropdown items |
| Labels | Geist | 11px | 400 | `--text-muted` | Property field labels |
| Section headers | Geist | 10px | 600 | `--text-faint` | Toolbox sections, panel headers (uppercase, 0.7px letter-spacing) |
| App name | Geist | 11px | 400 | `--toolbar-label` | Toolbar "Quiddity" label |
| Panel heading | Geist | 13px | 600 | `--text-secondary` | Properties panel h3 |
| Zoom display | Geist Mono | 12px | 400 | `#ccc` | Toolbar zoom readout |
| Node IDs / technical | Geist Mono | 11px | 400 | `--text-faint` | ID fields, technical identifiers |

**Why Geist:** No tool in the EA/ontology modeling category uses it. It reads as technical and modern (Vercel's developer font), setting Quiddity apart from every Eclipse-era Java tool in this space. The font load adds ~20ms — acceptable.

---

## Spacing

Grid: **base 4px**, common steps: 4, 5, 6, 8, 10, 14px

| Context | Value |
|---|---|
| Toolbar padding | `8px 10px` (up from 6px vertical — chrome relaxed) |
| Toolbar gap between items | `6px` |
| Toolbox item padding | `5px 8px` |
| Toolbox section padding | `8px 8px 4px` |
| Properties panel padding | `14px` (up from 10px — chrome relaxed) |
| Input padding | `5px 7px` |
| Context menu item padding | `7px 14px` |

**Canvas spacing is unchanged.** Only chrome areas (toolbar, panels) have relaxed slightly.

---

## Border Radius

| Element | Radius |
|---|---|
| Toolbar buttons | `4px` |
| Inputs and selects | `4px` |
| Color swatches | `3px` |
| Context menu | `6px` — intentional distinction (floating overlay, not inline control) |
| Dropdown menu | `4px` |

> **Note:** Context menu uses `6px` (floating/overlay) vs `4px` (inline controls). Keep this consistent — do not use `6px` for inline controls.

---

## Interactive States

| State | Visual treatment |
|---|---|
| Hover (toolbar btn) | `background: #363c52` |
| Active (toolbar btn) | `background: #1e2236` |
| Hover (toolbox item) | `background: rgba(59,130,246,0.1)` — blue tint |
| Hover (context menu item) | `background: #f0f4ff; color: #3b82f6` |
| Hover (danger item) | `background: #fff0f0; color: #e53e3e` |
| Focus (input) | `border-color: #3b82f6; box-shadow: 0 0 0 2px rgba(59,130,246,0.2)` |
| Selected (canvas node) | `stroke: #3b82f6 !important; stroke-width: 2.5px` |
| Selected (canvas edge) | `stroke: #3b82f6 !important` |
| Selected (color swatch) | `border: 2px solid #3b82f6; box-shadow: 0 0 0 1px #3b82f6` |

---

## Motion

- **Approach:** Minimal-functional — only motion that aids comprehension.
- **Canvas:** No animations. Ever. They slow down diagramming and break concentration.
- **Panel transitions:** `150ms ease-out` for show/hide only.
- **No entrance animations, no hover transitions on canvas elements.**

---

## Components

### Toolbar Button (`.tb-btn`)
Ink-dark background button. Always shows text (never icon-only at desktop breakpoint). Gap between icon and label: `4px`. Font: Geist 12px.

### Toolbox Section Header (`.toolbox-section`)
Uppercase, 10px, semibold, muted. Preceded by a `1px solid #e0e0e0` top border (except first section). Acts as a visual anchor for scanning the toolbox.

### Toolbox Item (`.toolbox-item`)
SVG preview (36×36) + text label. `cursor: grab`. Hover tint is `rgba(59,130,246,0.1)`. Items that are **edge tools** (not node-place tools) behave differently on click — they enter connection mode rather than dragging to canvas.

### Properties Panel Input (`.prop-input`)
Full-width, 12px, `border: 1px solid #ccc`, `border-radius: 4px`. Focus state uses accent blue ring. `textarea.prop-input` is resizable vertically, minimum 60px.

### Color Swatch (`.color-swatch`)
20×20px, `border-radius: 3px`. Selected state uses accent border + shadow. Default swatch shows a cross (`✕`) on white background.

### Context Menu (`#context-menu`)
Fixed-position floating overlay. `6px` border radius, `box-shadow: 0 4px 16px rgba(0,0,0,0.15)`. Items: 12px, `7px 14px` padding. Separator: `1px solid #eee`.

---

## Canvas

- Background: `#e8e8e8`
- Grid: dot grid at 20px pitch, dots at `r=0.8`, fill `#bbb`
- Grid rendered as SVG `<pattern>` applied to a 4000×4000 rect centered at origin
- Layers (bottom to top): `grid-layer` → `edges-layer` → `nodes-layer` → `ui-layer`

**IDEF5 symbol shapes are defined by the IDEF5 specification and must not be altered for aesthetic reasons.** All shape rendering is in `quiddity.js:createNodeSVG()`.

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| ≥901px | Full desktop layout |
| ≤900px | Toolbox collapses to icon-only (48px wide); properties panel collapses behind toggle |

---

## Accessibility

- **Focus styles**: All interactive elements show a visible focus ring using the accent color (`#3b82f6`)
- **Touch targets**: Minimum 44px for touch interactions (tablet mode)
- **Context menu**: Arrow keys navigate items; Escape closes
- **Keyboard shortcuts**: Ctrl+Z/Y for undo/redo; documented in help.html; Delete key removes selected elements
- **Toolbox keyboard**: Enter on focused toolbox item places symbol at canvas center
- **ARIA**: Toolbar buttons use `title` attributes as accessible names; canvas SVG is `role="img"` for export

---

## What Not To Do

- Do not introduce a second accent color — `#3b82f6` is the only interactive color
- Do not use `6px` border-radius on inline controls (only floating overlays)
- Do not add whitespace or padding to the canvas — density there is intentional
- Do not use emoji for icons in new additions — use inline SVG paths
- Do not add animations to canvas interactions — they slow down diagramming
- Do not alter IDEF5 symbol shapes for aesthetic reasons — they are defined by the specification

---

## Decisions Log

| Date | Decision | Rationale |
|---|---|---|
| 2026-03-21 | Toolbar color: `#2c2c2c` → `#1a1e2e` | Ink blue-black reads as intentional rather than generic dark gray. Approach used by Zed, Warp, Cursor. |
| 2026-03-21 | Accent color: `#4a90e2` → `#3b82f6` | Same hue family, but crisp and modern. The original was early-web blue; the new value is design-system blue. |
| 2026-03-21 | Font: system stack → Geist + Geist Mono | No EA/ontology tool uses Geist. Sets Quiddity apart from Eclipse-era Java tools. Geist Mono for technical/ID text. ~20ms CDN load cost. |
| 2026-03-21 | Panel padding: 10px → 14px; toolbar: 6px → 8px | "Open it up a bit" — slightly more breathing room in chrome only. Canvas unchanged. |
| 2026-03-21 | Initial design system documented | CSS-derived reference created from `src/css/quiddity.css`. |
