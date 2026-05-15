# Quiddity Design System

## Product Context

- **What this is:** A browser-based knowledge engineering tool for creating and modeling IDEF5 ontologies. Runs entirely in the browser — no build system, no server, no dependencies.
- **Who it's for:** Knowledge engineers, ontology modelers, and AI practitioners who want to define deterministic knowledge graphs.
- **Space/industry:** Enterprise architecture tools and formal ontology modeling. Peers: Sparx Enterprise Architect, Archi (ArchiMate), Bizzdesign Horizzon.
- **Project type:** Single-page web app — canvas-based diagramming tool.

---

## Aesthetic Direction — Telemetry

- **Direction:** **Telemetry** — Quiddity is calibrated equipment for ontology work. Ground-control / CAD-instrument energy. The chrome is the bezel of an instrument; the canvas is the workspace where the work lives. Not warm. Not scholarly. Not retro CRT. Not cyberpunk. *Instrument from the near future.*
- **Decoration level:** Minimal — typography, hairlines, and a single accent carry all the weight. No gradients, no shadows beyond functional depth, no blobs, no decorative anything.
- **Mood:** Serious, dense, calibrated, computational. The user opens Quiddity and feels they're sitting down at an instrument, not opening a notes app.
- **The memorable thing:** *"This modeling tool looks and feels like it's from the future."*

---

## Philosophy

Quiddity is a **professional domain tool**, not a consumer app. The word "quiddity" comes from the Latin *quidditas* — what makes something what it is. Telemetry expresses that intellectual seriousness as **calibrated equipment**, not as warmth or scholarship.

- **Mono-only voice.** Geist Mono carries every register — toolbar, headers, body, labels, data, code. There is no sans-serif voice anywhere in the chrome. This is the single strongest "from the future" signal.
- **Canvas is the workspace.** Dark, full-bleed, dot-grid. Panels float over it as HUD overlays. The canvas is never bordered or framed by docked chrome.
- **Amber is signal.** `#d97706` is the only accent and is reserved for selection, focus, hairlines, the coord readout, and the brand. Nothing decorative is amber. Amber on dark reads as instrument-indicator (aviation, oscilloscope), not as scholarly highlight.
- **Hairlines, not borders.** 1px amber at 25% opacity replaces gray dividers. Every separation in the UI is amber-toned, which unifies the structural language.
- **Density over whitespace.** 13px base; tight chrome padding; HUD overlays sized to information, not to breathing room. Diagramming is not contemplative — it's work.
- **Canvas is sacred.** No animations, no visual noise on the canvas. Every pixel of canvas space belongs to the ontology.
- **One-time exception:** the canvas grid may draw in over ~120ms on app load. After that, dead silent forever. No other canvas animation is permitted.

---

## IDEF5 Symbol Integrity

**This is non-negotiable.** IDEF5 symbols are defined by the IDEF5 specification and must not be altered for aesthetic or design reasons. Telemetry adapts only the stroke and fill colors of symbols to the dark surface. Geometry, proportions, and structure are per spec, no exceptions.

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

**Telemetry-specific reinforcement:** Adapting symbols to the dark theme means changing **stroke** and **fill** colors only — never proportions, never corner radii, never decorative additions. A `kind` rectangle on dark surface uses `fill: var(--node-fill)` and `stroke: var(--node-stroke)`; a selected `kind` rectangle uses `stroke: var(--accent)` at `2.5px`. That is the entire change.

---

## Color Palette

| Token | Value | Usage |
| --- | --- | --- |
| `--toolbar-bg` | `#0a0a0c` | Vertical toolbar strip background (near-black) |
| `--canvas-bg` | `#0e0e10` | Canvas background |
| `--panel-bg` | `rgba(22,22,26,0.92)` | Floating HUD panel background (translucent over canvas) |
| `--panel-bg-solid` | `#16161a` | Solid charcoal panel surface (when no canvas behind) |
| `--grid-dot` | `#2a2a30` | Canvas dot-grid color |
| `--node-fill` | `#16161a` | Default node interior fill |
| `--node-stroke` | `#5e5a53` | Default node stroke (unselected) |
| `--hairline` | `rgba(217,119,6,0.25)` | 1px amber hairline borders, panel separators |
| `--hairline-strong` | `rgba(217,119,6,0.55)` | Active/focused hairline |
| `--accent` | `#d97706` | Selection stroke, focus ring, brand, coord readout — amber |
| `--accent-dark` | `#b45309` | Accent hover/pressed state |
| `--accent-soft` | `rgba(217,119,6,0.12)` | Active toolbar btn background, AI message background, hover tint |
| `--accent-fade` | `rgba(217,119,6,0.5)` | Coord readout text |
| `--accent-focus` | `rgba(217,119,6,0.18)` | Input focus box-shadow |
| `--text` | `#e8e6e1` | Body text (warm white, not pure white) |
| `--text-muted` | `#9a958d` | Secondary text, default toolbar icon color |
| `--text-faint` | `#5e5a53` | Section headers, placeholder, faint detail |
| `--danger` | `#c73838` | Delete actions |

**Design intent:** The dark surface family (`#0a0a0c` toolbar → `#0e0e10` canvas → `#16161a` panels) shares one cool-black temperature envelope. Warm-white text (`#e8e6e1`) provides the only temperature warmth — amber doesn't have to do that work anymore. Amber (`#d97706`) is purely signal: selection, focus, hairlines, brand, coords. No other tool in the knowledge-engineering category combines a dark canvas with an amber HUD accent. This is what makes Quiddity instantly recognizable.

**Never use blue as an accent.** Amber is the sole accent. Do not introduce a second accent color under any circumstance.

**Print/export:** When exporting diagrams to PNG, the renderer SHOULD invert to a light surface (white background, dark strokes) for print legibility. Editor color ≠ export color. The dark canvas is for working, not for distribution.

---

## Typography

**Single-stack, mono-only:** `'Geist Mono', ui-monospace, SFMono-Regular, Menlo, monospace`

There is no sans-serif voice in Quiddity's UI. Geist Mono carries every register. This is intentional and structural — the strongest single signal that Quiddity is computational equipment, not a prose tool.

Load via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

| Role | Size | Weight | Letter-spacing | Color | Usage |
| --- | --- | --- | --- | --- | --- |
| Body | 13px | 400 | 0 | `--text` | Default UI text, AI messages |
| UI controls | 12px | 400 | 0 | `--text` | Buttons, inputs, dropdown items, node labels in canvas |
| Field values (mono-readonly) | 12px | 400 | 0 | `--accent` | Read-only IDs, coord values, edge summaries |
| Labels | 10px | 400 | 0.16em | `--text-faint` | Property field labels (uppercase, tracked) |
| Section headers | 10px | 600 | 0.18em–0.22em | `--text-faint` | HUD panel section titles (uppercase, tracked, with trailing hairline) |
| Brand (vertical strip) | 11px | 600 | 0.22em | `--accent` | "QUIDDITY" rotated 90° on the toolbar strip |
| Coord readout | 11px | 400 | 0.08em | `--accent-fade` | Bottom-right X / Y / ZOOM / SEL display |
| Button labels | 11px | 500 | 0.14em | `--text` (or `#0a0a0c` on amber) | Uppercase, tracked |
| In-canvas type label | 10px | 400 | 0.15em | `--text-muted` | "KIND", "PROCESS", "JUNCTION" subtitles below node labels |

**Why Geist Mono everywhere:**
- No tool in the EA/ontology category uses a mono-only chrome. It is the strongest visual differentiator we can take.
- Mono signals computational/instrument; sans signals prose/document. Quiddity is the former.
- Geist Mono specifically: Vercel's mono, modern, technical, well-hinted at small sizes.

**Font blacklist (do not introduce):** Inter, Roboto, Arial, Helvetica, Open Sans, Lato, Montserrat, Poppins, Space Grotesk, system-ui as a *primary* font. Any sans-serif as a UI voice violates the mono-only principle.

---

## Spacing

Grid: **base 4px**, common steps: 4, 6, 8, 10, 12, 14, 18, 24px

| Context | Value |
| --- | --- |
| Vertical toolbar strip width | `44px` |
| Vertical toolbar item size | `30 × 30px` (icon `16 × 16px`) |
| Vertical toolbar group padding | `10px 0`, separator `1px solid rgba(255,255,255,0.05)` top |
| HUD panel padding (sections) | `10px 12px` |
| HUD panel section header padding | `8px 12px 6px` |
| Toolbox item padding | `6px 12px`, left border `2px transparent` (becomes `--accent` on hover) |
| Properties field padding | `6px 12px` |
| Input padding | `5px 7px` |
| AI panel message padding | `10px 12px` |
| HUD panel offset from canvas edge | `24px` (margin) |
| Coord readout offset | `right: 18px; bottom: 8px` |

**Canvas spacing is unchanged.** Only chrome areas have padding defined here.

---

## Layout

- **Approach:** Canvas-dominant. Vertical toolbar strip on the left edge. HUD overlays float over the canvas; nothing docks.
- **Vertical strip:** 44px wide, full-height, on the left. Contains the rotated "QUIDDITY" brand at top, then three icon-only groups separated by 1px hairlines: file ops (top), tool selection (middle), view/AI (bottom). Labels appear on hover with a 250ms delay (mono tooltips).
- **Floating HUD panels:**
  - **Toolbox:** Top-left, 220px wide, 24px from edges. Translucent (`rgba(22,22,26,0.92)`) with `backdrop-filter: blur(10px)` and a 1px `--hairline` border.
  - **Properties:** Top-right, 280px wide, 24px from edges. Same surface treatment.
  - **AI:** Bottom-right, 320px wide, sits above the coord readout (48px from bottom). Same surface treatment.
- **Coord readout:** Always-on, bottom-right corner, no background, no border. Format: `X 1240   Y −380   ZOOM 100%   SEL 3` in 11px Geist Mono, `--accent-fade` color, with values themselves in `--accent`.
- **Border-radius:** **0px on all chrome elements.** The instrument has sharp edges. The single exception is the legacy context menu (4px), kept for affordance.
- **Max content width:** None. Canvas fills the viewport edge-to-edge.

---

## Motion

- **Approach:** Minimal-functional — only motion that aids comprehension. The instrument does not perform; it responds.
- **Canvas:** No animations on interactions. **Ever.** The single allowed exception is a one-time `~120ms` grid draw-in on app load (instrument boot). After that, dead silent.
- **HUD panel show/hide:** `200ms ease-out` opacity + 4px translate.
- **Vertical toolbar tooltips:** appear after 250ms hover delay, no fade.
- **No entrance animations on canvas elements, no hover transitions on canvas elements, no node enter/exit animations.**

---

## Components

### Vertical Toolbar Strip (`.vstrip`)

44px wide, full-height, left edge, `--toolbar-bg` background, 1px `--hairline` right border. Contains:
- **Brand:** `writing-mode: vertical-rl; transform: rotate(180deg);` "QUIDDITY" in 11px Geist Mono 600, `--accent`, letter-spacing `0.22em`.
- **Groups:** Vertical stacks of `30×30px` icon buttons separated by 1px hairlines. Each button is icon-only (16×16px SVG, 1.5 stroke); labels appear as floating mono tooltips on hover after 250ms.
- **Active state:** `color: --accent; border: 1px solid --hairline-strong; background: --accent-soft`.

### HUD Panel (`.hud`)

Floating overlay. `background: --panel-bg`; `border: 1px solid --hairline`; `backdrop-filter: blur(10px)`; **no shadow**, **no border-radius**. Section dividers are `1px solid rgba(217,119,6,0.10)` (slightly fainter than panel border).

### HUD Section Header (`.hud-h`)

Inside a HUD panel. 10px Geist Mono, 600, uppercase, letter-spacing `0.18em`, color `--text-faint`, padding `8px 12px 6px`. After the text, a `1px` amber rule extends to the panel's right edge (implemented via `::after` flex spacer with `height: 1px; background: rgba(217,119,6,0.15)`).

### Toolbox Item (`.tx-item`)

`6px 12px` padding, 12px Geist Mono, `cursor: grab`. Icon glyph (28×20px) on the left in `--text-muted`, label on the right in `--text`. Hover: `background: --accent-soft; border-left: 2px solid --accent`. The IDEF5 symbol glyphs in the toolbox are simplified line-art versions (1.5 stroke) of the full canvas symbols — same shape, smaller, no fill.

### Properties Panel Field (`.field`)

Stacked label + input. Label: 10px tracked uppercase `--text-faint`. Input: full-width, transparent background, 1px `rgba(255,255,255,0.08)` border, 12px Geist Mono, 5px 7px padding. Focus: `border-color: --accent; box-shadow: 0 0 0 2px --accent-focus`. Read-only mono fields use `color: --accent; background: rgba(217,119,6,0.04)`.

### Color Swatch (`.swatch`)

18×18px, 1px `rgba(255,255,255,0.08)` border, **no border-radius**. Selected: `box-shadow: 0 0 0 1px --accent; border-color: --accent`. Color palette is constrained to dark-canvas-friendly fills.

### Coord Readout (`.coords`)

Bottom-right corner, `right: 18px; bottom: 8px`. No background, no border. 11px Geist Mono, `--accent-fade`, letter-spacing `0.08em`. Each token is `LABEL<value>` where `<value>` is `--accent` and the label is `--accent-fade`. Updates on every cursor move and selection change. Tokens shown: `X`, `Y`, `ZOOM`, `SEL`.

### Button (`.btn`)

11px Geist Mono, 500, uppercase, letter-spacing `0.14em`, padding `6px 12px`, transparent background, 1px `--hairline` border, `--text` color, **no border-radius**. Hover: `border-color: --accent; color: --accent`. Variants:
- `.primary` — `background: --accent; color: #0a0a0c; border-color: --accent`. Hover: `--accent-dark`.
- `.ghost` — transparent border, `--text-muted` color. Hover: `--accent` color.
- `.danger` — `--danger` color, `rgba(199,56,56,0.3)` border.

### AI HUD (`.hud.ai`)

Bottom-right, 320px wide, 48px from bottom (above coord readout). Header strip: pulsing amber dot (1.6s ease-in-out), "AI · CLAUDE" in 10px tracked uppercase, "CONNECTED" badge on the right. Messages: 12px body. User messages prefixed with `> ` and `--accent-soft` background with `2px solid --accent` left border. Assistant messages: plain on panel background. Input: transparent, no border, with an amber `SEND` button on the right (uppercase, tracked).

---

## Canvas

- **Background:** `#0e0e10` (cool near-black)
- **Grid:** Dot grid at `20px` pitch, dots at `r=1`, fill `#2a2a30`, rendered as SVG `<pattern>` applied to a 6000×6000 rect centered at origin.
- **Layers (bottom to top):** `grid-layer` → `edges-layer` → `nodes-layer` → `ui-layer`
- **Node default fill:** `--node-fill` (`#16161a`)
- **Node default stroke:** `--node-stroke` (`#5e5a53`), `1.25px`
- **Node selected stroke:** `--accent` (`#d97706`), `2.5px`
- **Edge default stroke:** `--text-muted` (`#9a958d`), `1.25px`
- **Edge selected stroke:** `--accent`, `1.5px`
- **Edge label:** 11px Geist Mono, color matches the edge stroke
- **Node label inside symbol:** 13px Geist Mono 500, `--text` color
- **Node type subtitle inside symbol:** 10px Geist Mono, letter-spacing `0.15em`, uppercase, `--text-muted` color (e.g., `KIND`, `PROCESS`, `JUNCTION`)
- **Selection ticks:** Four 8px L-shaped corner ticks in `--accent` (1.5px stroke) drawn outside the symbol bounding box. Ticks complement the amber stroke; together they make selection unmistakable.
- **Boot animation:** On app load only, the dot grid draws in over `~120ms` from origin outward. One-time. After that, no canvas animation occurs.

**IDEF5 symbol shapes are defined by the IDEF5 specification and must not be altered for aesthetic reasons.** All shape rendering is in `quiddity.js:createNodeSVG()`. Telemetry only modifies stroke and fill colors of existing geometry. See IDEF5 Symbol Integrity section above.

---

## Responsive Breakpoints

| Breakpoint | Behavior |
| --- | --- |
| ≥901px | Full Telemetry layout: vertical strip + floating HUD panels + coord readout |
| ≤900px | Vertical strip stays on left at 44px; toolbox HUD collapses to a toggle (icon in strip); properties HUD becomes a bottom-sheet overlay (60vh); AI HUD becomes a full-width bottom-sheet overlay; coord readout hides on the smallest viewports (`≤480px`) |

---

## Accessibility

- **Focus styles:** All interactive elements show a visible focus ring using `--accent` (`#d97706`).
- **Touch targets:** Minimum 44px for touch interactions (tablet mode). The vertical strip width matches.
- **Contrast:** `--text` (`#e8e6e1`) on `--canvas-bg` (`#0e0e10`) meets WCAG AAA for body text. `--accent` (`#d97706`) on `--canvas-bg` meets WCAG AA for normal text and AAA for large text.
- **Coord readout:** Use `--accent` (not `--accent-fade`) for the value characters to keep them readable; the fade is reserved for the labels.
- **HUD panel translucency:** Backdrop blur is decorative, not load-bearing — content remains legible if the user disables `backdrop-filter` or runs in a browser without support.
- **Context menu:** Arrow keys navigate items; Escape closes.
- **Keyboard shortcuts:** Ctrl+Z/Y for undo/redo; Delete key removes selected elements.
- **Toolbox keyboard:** Enter on focused toolbox item places symbol at canvas center.
- **ARIA:** Toolbar buttons use `aria-label`; canvas SVG is `role="img"` for export; HUD panels use `role="complementary"` and `aria-live` on the AI message thread.
- **Reduced motion:** If `prefers-reduced-motion: reduce`, skip the boot grid animation and the AI dot pulse; HUD show/hide becomes instant.

---

## What Not To Do

- Do not introduce a second accent color — `#d97706` is the only interactive color.
- Do not use blue (`#3b82f6`, `#4a90e2`, or any blue) as an accent — amber replaced it.
- Do not introduce a sans-serif font into the UI chrome. Geist Mono is the only voice. The mono-only principle is structural, not stylistic.
- Do not add border-radius to chrome elements. The instrument has sharp edges. (Legacy context menu at 4px is the only exception.)
- Do not dock panels back to the edges. Panels float over the canvas; that is the layout principle.
- Do not add backgrounds, borders, or shadows behind the coord readout. It floats on the canvas.
- Do not adapt or restyle IDEF5 shapes for the dark theme beyond changing stroke and fill colors. **Geometry per spec, no exceptions.**
- Do not omit any of the 17 IDEF5 symbol types from the toolbox.
- Do not add whitespace or padding to the canvas — density there is intentional.
- Do not use emoji for icons in new additions — use inline SVG paths (1.5 stroke).
- Do not add animations to canvas interactions — they slow down diagramming. The boot grid draw-in is the **only** permitted canvas animation, and it runs once per session.
- Do not lighten the canvas background to "improve contrast for printing." Print/export is a separate render path that inverts to light surface.
- Do not replace amber hairlines with gray dividers. The amber-toned structural language is part of Telemetry's identity.

---

## Decisions Log

| Date | Decision | Rationale |
| --- | --- | --- |
| 2026-03-21 | Toolbar color: `#1a1e2e` → `#1c1917` | Warm black (stone-like) replaces blue-black. Shifted mood from developer editor to scholarly instrument. |
| 2026-03-21 | Accent color: `#3b82f6` → `#d97706` | Amber is unique in this tool category. Signals intellectual/scholarly tradition vs generic engineering blue. |
| 2026-03-21 | Canvas: `#e8e8e8` → `#eae6df` → `#e8dcc8` | Warm parchment direction. |
| 2026-03-21 | Panels: `#fafafa` → `#fafaf8` → `#f2f1ef` | Ivory, warm temperature envelope. |
| 2026-03-21 | Canvas grid dots: `#bbb` → `#c0ae90` | Warm amber-tinted dots. |
| 2026-03-21 | Font: system stack → Geist + Geist Mono | No EA/ontology tool uses Geist. Set Quiddity apart from Eclipse-era Java tools. |
| 2026-03-21 | Aesthetic direction named: Scholar's Instrument | Quiddity models essence of things (quidditas). Should feel like a scholarly instrument, not a dev tool. |
| 2026-05-12 | Aesthetic direction: Scholar's Instrument → **Telemetry** | "Scholar's Instrument" tried to thread warm + precise; warm won. The result read as a poetry/notes app, not a serious modeling tool. Telemetry recasts Quiddity as calibrated equipment from the near future. |
| 2026-05-12 | Surface polarity flip: light/warm → dark/cool | Canvas `#e8dcc8` → `#0e0e10`; panels `#f2f1ef` → `#16161a`; toolbar `#1c1917` → `#0a0a0c`. Dark canvas + amber HUD is unique in the EA/ontology category. |
| 2026-05-12 | Text color: `#1c1917` on ivory → `#e8e6e1` on dark | Inverted polarity, same warm temperature envelope. Warm-white text now carries the warmth that amber used to carry. |
| 2026-05-12 | Typography: Geist Sans + Geist Mono → **Geist Mono only** | Mono-only chrome is the strongest "from the future" signal in the category. No other modeling tool does this. |
| 2026-05-12 | Layout: horizontal top toolbar + docked panels → vertical 44px strip + floating HUD panels | Canvas-dominant. Panels float over the canvas as translucent overlays with amber hairline borders. Reference frames: Figma, Rhino, Linear. |
| 2026-05-12 | Hairlines: gray dividers → 1px amber at 25% opacity | Unified amber structural language. Cost: amber is no longer rare on chrome — accepted because dark surfaces preserve its signal weight on the canvas. |
| 2026-05-12 | New element: always-on coord readout | Bottom-right `X · Y · ZOOM · SEL` in mono amber. CAD-tool detail that signals calibrated equipment. |
| 2026-05-12 | New element: vertical brand label | "QUIDDITY" rotated 90° at top of toolbar strip in 11px tracked mono amber. Identifies the instrument without consuming canvas chrome. |
| 2026-05-12 | One-time exception: 120ms canvas grid boot animation | Single permitted canvas animation, runs once on app load. Sets the "instrument booting" tone. No other canvas animation is permitted. |
| 2026-05-12 | Border-radius: 4px on inline controls → 0px everywhere (legacy context menu keeps 4px) | The instrument has sharp edges. |
| 2026-05-12 | IDEF5 Symbol Integrity reinforced | Telemetry adapts only stroke and fill colors of IDEF5 symbols. Geometry per spec, no exceptions, ever. |
