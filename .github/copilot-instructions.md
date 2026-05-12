# Copilot instructions for Quiddity

Quiddity is a browser-based knowledge engineering tool for creating and modeling IDEF5 ontologies. It runs entirely in the browser as pure vanilla JavaScript, HTML, and CSS — **no build system, no server, no dependencies, no package.json**.

## Running and testing

- Open `index.html` directly in a browser. There is no build step.
- For end-to-end tests there is a Playwright suite in `tests/` (its own `package.json`, kept out of the project root so the app stays zero-dependency at runtime).
  - One-time setup: `cd tests && npm install && npx playwright install chromium` (also requires `python3` on `PATH`).
  - Run all tests: `cd tests && npm test`. Single spec: `npx playwright test specs/02-prompt-to-graph.spec.js`. Filter by name: `npx playwright test -g "survives a full page reload"`.
  - All AI tests **mock** the Anthropic and OpenAI endpoints via `page.route()` — never hit a real LLM. Reuse `mockAnthropic()` / `mockOpenAI()` / `captureAnthropic()` / `gotoApp()` / `seedNodes()` from `tests/specs/helpers.js`.
  - Tests assert against `window.state` (`{ nodes, edges, ... }`) and `window.viewport`, which are exposed in `js/quiddity.js` purely for the test harness.
- There is no linter at the project root. Verify changes by loading `index.html` and exercising the affected behavior manually, plus running the Playwright suite if AI/persistence/canvas behavior is touched.
- Do not introduce a build toolchain, package manager, or runtime dependencies at the project root without explicit user approval — zero-dependency at runtime is a deliberate constraint. (The `tests/` folder is the only sanctioned place for dev dependencies.)

## Architecture

- **`js/quiddity.js`** (~2,700 lines) — All application logic in a single file. Sections: constants/config, geometry helpers, SVG rendering, state management, event handling, export. `init()` is called on `DOMContentLoaded`.
- **`index.html`** — UI shell: toolbar, toolbox (symbol palette), SVG canvas, properties panel. Contains SVG marker/gradient defs. References only `quiddity.js`.
- **`css/quiddity.css`** — Application styles. **`css/docs.css`** — Documentation page styles only.
- **`docs/using-quiddity.html`** — End-user usage guide. **`docs/idef5-reference.html`** — IDEF5 notation reference.

## Data model

Global state holds `nodes[]` and `edges[]` plus undo/redo stacks. Both are serialized to JSON for save/load and persisted to `localStorage` for auto-save.

- **Node**: `{ id, type, x, y, label, color, w, h, ... }` — `type` is one of 17 IDEF5 symbol types: `kind`, `individual`, `referent`, `relation-first`, `relation-second`, `relation-alt`, `process`, `junction-xor`, `junction-or`, `junction-and`, `state-weak`, `state-strong`, `transition-instant`, `connect-fwd`, `connect-bwd`, `connect-plain`, `container`, `key`.
- **Edge**: `{ id, fromId, toId, type, label }` — uses `fromId`/`toId` (not `from`/`to`); 11 edge types.

## Key conventions

- Create all SVG elements via the `svgEl()` helper (wraps `createElementNS`). Do not call `createElementNS` directly.
- Coordinates snap to a 10px grid via `snap()`.
- Hit testing is manual: `hitTestNode()`, `hitTestEdge()`, `hitTestResizeHandle()`, `hitTestTransitionCircle()`. There is no library doing this for you.
- Viewport (pan/zoom) is stored separately from node coordinates and applied via `applyViewport()`.
- Undo stack is capped at 50 levels. **Call `saveUndo()` before any mutating operation** — this is how state is captured.
- All shape rendering for IDEF5 symbols lives in `quiddity.js:createNodeSVG()`.
- Canvas SVG layer order (bottom→top): `grid-layer` → `edges-layer` → `nodes-layer` → `ui-layer`.
- AI provider abstraction lives in `AI_PROVIDERS` (`anthropic` / `openai` / `custom`); each provider defines `buildHeaders` / `buildBody` / `parseResponse`. To add a provider, extend the map and add an `<option>` to `#ai-provider-select` in `index.html`. Per-provider key storage uses `quiddity-ai-key-{providerId}`.
- AI graph mutation flows: `callAIAPI()` (prompt → full graph payload, merged via `mergeAIGraph()` which only **appends** with prefixed IDs) and `applyAIDelta()` (Edit-explanation flow → JSON delta with adds/updates/removes that **preserves existing node IDs**). Both call `saveUndo()` on success-only via `validate*` → `saveUndo` → mutate. Validation constants `VALID_NODE_TYPES` / `VALID_EDGE_TYPES` are module-scoped and shared.
- Edge creation has two entry points, both of which set the same `toolboxConnectStart = { edgeType, fromId }` two-phase state: (1) the toolbox edge tools (limited to `TOOLBOX_EDGE_TYPES`, source picked by clicking phase 1 then target phase 2), and (2) the **quick-edge palette** (`QUICK_EDGE_TYPES`, all 11 edge types) that appears on node hover and pre-seeds `fromId`, skipping phase 1. Phase-2 click is handled in the canvas `pointerdown` handler. To add a new edge type to the hover palette, append to `QUICK_EDGE_TYPES`; to suppress the palette for a node type, add it to `QUICK_EDGE_EXCLUDE_TYPES`.

## IDEF5 symbol integrity (non-negotiable)

- **Do not alter IDEF5 symbol shapes for aesthetic reasons** — they are defined by the IDEF5 specification.
- All 17 IDEF5 symbol types listed above must remain available in the toolbox.
- Any new symbol must match the IDEF5 specification exactly.

## Design system

Always read `DESIGN.md` before making any visual or UI decision. It defines all colors, fonts, spacing, and components. Do not deviate without explicit user approval.

Quick rules:

- Toolbar bg: `#1c1917` (warm black) — not charcoal, not blue-black.
- Accent: `#d97706` (amber) is the **sole** interactive/selection color. **Never use blue** (`#3b82f6`, `#4a90e2`, etc.) as an accent — amber replaced it entirely.
- Fonts: Geist Sans (UI) + Geist Mono (technical), loaded from Google Fonts.
- Use CSS variables defined in `css/quiddity.css` (`--toolbar-bg`, `--accent`, `--panel-bg`, `--text-*`, etc.) rather than hardcoding colors.
- Border radius: `4px` for inline controls, `6px` only for floating overlays (e.g., context menu).
- **No animations on canvas interactions, ever.** Panel show/hide may use `150–200ms ease-out`.
- Do not use emoji for icons in new additions — use inline SVG paths.
- Do not add whitespace/padding to the canvas — density there is intentional.

In QA or design-review work, flag any code that doesn't match `DESIGN.md`.

## Documentation references

- `README.md` — project overview and hosted-version link.
- `DESIGN.md` — full design system (read before any UI change).
- `CHANGELOG.md` — release history; update when shipping user-visible changes.
- `TODOS.md` — explicitly deferred work with full context per item.

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/browse`, `/connect-chrome`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/setup-deploy`, `/setup-gbrain`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/cso`, `/autoplan`, `/plan-devex-review`, `/devex-review`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`, `/learn`.
