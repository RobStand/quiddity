# Quiddity Design System

This document captures the implicit design system as derived from `src/css/quiddity.css` and `src/index.html`. All new UI work should reference these tokens before introducing new values.

---

## Philosophy

Quiddity is a **professional domain tool**, not a consumer app. The design borrows from CAD and diagramming tool conventions (draw.io, Dia). The aesthetic is intentionally dense and utilitarian — maximize canvas space, minimize chrome.

- **Density over whitespace**: 13px base, tight 5–10px padding, compact controls
- **Neutral chrome**: Dark toolbar recedes; light panels support; canvas dominates
- **One accent**: `#4a90e2` (medium blue) is the sole interactive/selection color — do not introduce a second accent

---

## Color Palette

| Token | Value | Usage |
|---|---|---|
| `--toolbar-bg` | `#2c2c2c` | Top toolbar background |
| `--toolbar-border` | `#111` | Toolbar bottom border |
| `--toolbar-btn` | `#444` | Button background (default) |
| `--toolbar-btn-hover` | `#555` | Button background (hover) |
| `--toolbar-btn-active` | `#333` | Button background (active/pressed) |
| `--toolbar-btn-border` | `#555` | Button border |
| `--toolbar-label` | `#aaa` | App name label |
| `--toolbar-icon` | `#eee` | Button text/icon color |
| `--toolbar-sep` | `#555` | Separator color |
| `--panel-bg` | `#fafafa` | Toolbox and properties panel background |
| `--panel-border` | `#ddd` | Panel outer border |
| `--canvas-bg` | `#e8e8e8` | Canvas container background |
| `--accent` | `#4a90e2` | Selection stroke, focus ring, active states |
| `--accent-light` | `rgba(74,144,226,0.1)` | Rubberband fill, selection overlay |
| `--accent-focus` | `rgba(74,144,226,0.2)` | Input focus box-shadow |
| `--danger` | `#e53e3e` | Delete actions |
| `--text-primary` | `#222` | Body text |
| `--text-secondary` | `#444` | Panel headings |
| `--text-muted` | `#666` | Label text |
| `--text-faint` | `#888` | Section headers, placeholder text |
| `--text-disabled` | `#999` | Empty state text |
| `--border-light` | `#e0e0e0` | Internal dividers (panel sections) |
| `--border-input` | `#ccc` | Input borders |

---

## Typography

| Role | Size | Weight | Color | Usage |
|---|---|---|---|---|
| Body | 13px | 400 | `--text-primary` | Default UI text |
| UI controls | 12px | 400 | `--text-primary` | Buttons, inputs, dropdown items |
| Labels | 11px | 400 | `--text-muted` | Property field labels |
| Section headers | 11px | 600 | `--text-faint` | Toolbox sections, panel headers |
| App name | 11px | 400 | `--toolbar-label` | Toolbar "Quiddity" label |
| Panel heading | 13px | 600 | `--text-secondary` | Properties panel h3 |
| Zoom display | 12px | 400 | `#ccc` | Toolbar zoom readout |

Font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

---

## Spacing

Grid: **base 4px**, common steps: 4, 5, 6, 8, 10, 14px

| Context | Value |
|---|---|
| Toolbar padding | `6px 10px` |
| Toolbar gap between items | `6px` |
| Toolbox item padding | `5px 8px` |
| Toolbox section padding | `8px 8px 4px` |
| Properties panel padding | `10px` |
| Input padding | `5px 7px` |
| Context menu item padding | `7px 14px` |

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
| Hover (toolbar btn) | `background: #555` |
| Active (toolbar btn) | `background: #333` |
| Hover (toolbox item) | `background: #e8f0fe` — light blue tint |
| Hover (context menu item) | `background: #f0f4ff; color: #4a90e2` |
| Hover (danger item) | `background: #fff0f0; color: #e53e3e` |
| Focus (input) | `border-color: #4a90e2; box-shadow: 0 0 0 2px rgba(74,144,226,0.2)` |
| Selected (canvas node) | `stroke: #4a90e2 !important; stroke-width: 2.5px` |
| Selected (canvas edge) | `stroke: #4a90e2 !important` |
| Selected (color swatch) | `border: 2px solid #4a90e2; box-shadow: 0 0 0 1px #4a90e2` |

---

## Components

### Toolbar Button (`.tb-btn`)
Dark background button. Used for all primary toolbar actions. Always shows text (never icon-only at desktop breakpoint). Gap between icon and label: `4px`.

### Toolbox Section Header (`.toolbox-section`)
Uppercase, 11px, semibold, muted. Preceded by a `1px solid #e0e0e0` top border (except first section). Acts as a visual anchor for scanning the toolbox.

### Toolbox Item (`.toolbox-item`)
SVG preview (36×36) + text label. `cursor: grab`. Hover tint is `#e8f0fe`. Items that are **edge tools** (not node-place tools) behave differently on click — they enter connection mode rather than dragging to canvas.

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

---

## Responsive Breakpoints

| Breakpoint | Behavior |
|---|---|
| ≥901px | Full desktop layout |
| ≤900px | Toolbox collapses to icon-only (48px wide); properties panel collapses behind toggle |

---

## Accessibility

- **Focus styles**: All interactive elements show a visible focus ring using the accent color
- **Touch targets**: Minimum 44px for touch interactions (tablet mode)
- **Context menu**: Arrow keys navigate items; Escape closes
- **Keyboard shortcuts**: Ctrl+Z/Y for undo/redo; documented in help.html; Delete key removes selected elements
- **Toolbox keyboard**: Enter on focused toolbox item places symbol at canvas center
- **ARIA**: Toolbar buttons use `title` attributes as accessible names; canvas SVG is `role="img"` for export

---

## What Not To Do

- Do not introduce a second accent color — `#4a90e2` is the only interactive color
- Do not use `6px` border-radius on inline controls (only floating overlays)
- Do not add whitespace or padding in the name of "breathing room" — this is a dense tool
- Do not use emoji for icons in new additions — use inline SVG paths
- Do not add animations to canvas interactions — they slow down diagramming
