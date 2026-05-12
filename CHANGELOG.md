# Changelog

## 2026-05-12

### Added

#### Hover-driven edge creation (quick-connect palette)

- Hovering any node (except `container`, `key`, `transition-instant`, and connector-as-node types) now surfaces a small floating edge palette after a 350 ms delay, just outside the node. Click any of its 11 buttons to enter connection mode pre-seeded with that node as the source — then click the target node to draw the edge.
- The palette exposes all 11 IDEF5 edge types — including `subkind-of`, `instance-of`, `part-of`, and `first-order`, which previously had no toolbox tool and required editing the edge type by hand in the property panel after drawing.
- Reuses the existing two-phase `toolboxConnectStart` flow, so one `Ctrl/Cmd+Z` still undoes the resulting edge as a single operation, and the standard hint banner walks the user through phase 2.
- Palette auto-hides on Escape, drag, viewport pan/zoom, label edit, or when another connection is already in progress, with a 200 ms grace period so users can mouse from the node onto the buttons.
- Themed against `DESIGN.md` (warm-black `#1c1917` background, amber `#d97706` hover, no animations).

#### AI Assistant: bidirectional editing — text → graph delta

- **Edit explanation** affordance on every Explain message: click `✎ Edit explanation`, revise the prose in place, and click Save. The AI returns a JSON delta against the snapshot of the graph that produced the original explanation and Quiddity applies it (`add_nodes` / `add_edges` / `update_nodes` / `remove_node_ids` / `remove_edge_ids`).
- Existing node IDs are preserved across updates so positions, sizes, and downstream edges stay intact. Removing a node also removes any edges that referenced it.
- One-shot per Explain: after a delta applies, the message becomes static (showing the edited prose) and the Edit affordance disappears. Re-run Explain to narrate the updated graph.
- The delta apply is a single undoable operation (one `Ctrl/Cmd+Z` reverts the entire turn).
- Saving an unchanged edit is a no-op (no API call). Empty edits and validation failures (unknown node ID, unknown node/edge type) surface as inline error chips and never mutate the graph.
- New `AI_DELTA_SYSTEM_PROMPT`, `applyAIDelta()`, and `validateAIDelta()` in `js/quiddity.js`. `VALID_NODE_TYPES` / `VALID_EDGE_TYPES` hoisted to module scope and shared between `validateAIPayload` and `validateAIDelta`.

#### Playwright end-to-end test suite

- New `tests/` directory with Playwright tests covering 26 critical AI-panel paths across 12 spec files: key setup, prompt → graph, undo reverts a full AI turn, localStorage persistence across reload, graph extension on a second turn, full error matrix (401 / 429 / 500 / malformed JSON / empty graph / unknown node type / textarea retained on error), mid-flight cancellation via "New diagram", multi-provider routing (Anthropic / OpenAI / Custom — incl. per-provider key isolation, persistence across reload, and validation that custom mode blocks send when endpoint or model is missing), context-truncation warning chip and request-payload capping, Explain button (empty-canvas guard, prose rendering, conversation-history isolation), legacy `quiddity-ai-key` migration, and small UX guarantees (empty-prompt no-op, blur-saves-key, message thread preserved across panel close/reopen, Send/textarea disabled in flight).
- All AI tests mock the Anthropic and OpenAI endpoints via `page.route()` — they are deterministic, run offline, and never hit a real LLM.
- Playwright lives in `tests/package.json` so the application root remains zero-dependency. `python3 -m http.server` is launched automatically by the test runner.
- See `tests/README.md` for setup and conventions.

### Fixed

- **AI panel: validation errors now surface their actual message.** Previously, `validateAIPayload` errors (empty graph, unknown node type, malformed nodes) fell through to the generic "Network error. Check your connection." chip. The catch block in `callAIAPI` now distinguishes `TypeError` (network) from other thrown `Error`s and shows the validation error message verbatim.

#### AI Assistant: multi-provider support, Explain, and large-graph handling

- **Multi-endpoint support**: provider dropdown in the AI panel selects between **Anthropic**, **OpenAI**, and **Custom (OpenAI-compatible)**. Custom mode reveals endpoint URL and model name inputs, enabling local LLMs (Ollama, LM Studio, etc.) and other OpenAI-compatible APIs.
- API keys are stored per provider (`quiddity-ai-key-{provider}`); a previously stored Anthropic key is migrated automatically on first load.
- **Explain button** in the AI panel footer asks the AI to describe the current diagram in plain English. Read-only — does not modify the canvas or conversation history. (First step toward bidirectional graph ↔ natural-language editing.)
- **Large-graph context truncation**: when a graph exceeds 50 nodes or 50 edges, only the 50 nodes nearest the viewport center (and their edges) are sent to the model. A warning chip appears in the AI panel footer when truncation is active. Reduces API cost on big diagrams.

## 2026-03-21

### Added

#### AI Assistant Panel

- New AI panel accessible via the `✦ AI` toolbar button, powered by the Anthropic Claude API
- Anthropic API key input — stored in browser localStorage only, never sent to a server
- Conversation thread with user/assistant message history
- Claude generates IDEF5 diagrams from natural language descriptions, adding nodes and edges directly to the canvas
- Generating spinner overlay on canvas during API calls
- Undo integration: each AI generation is a single undoable step (Ctrl+Z restores pre-generation state)
- Full conversation history preserved across turns so Claude can iteratively refine diagrams
- AI panel slides in from the right (desktop) or up from the bottom (≤900px) with smooth transition

#### Edit Menu with Cut, Copy, Paste

- New `Edit` toolbar dropdown containing Cut (Cmd/Ctrl+X), Copy (Cmd/Ctrl+C), Paste (Cmd/Ctrl+V), and Delete
- Cut copies the selection to the clipboard then deletes it
- Copy preserves selected nodes and any edges that connect exclusively between selected nodes
- Paste places copies at +20px offset; repeated pastes cascade so they don't stack
- All keyboard shortcuts work on both macOS (Cmd) and Windows/Linux (Ctrl)

#### File Menu

- New `✦ File` toolbar dropdown consolidating New, Save JSON, Load JSON, and Export to SVG
- Replaces the four individual toolbar buttons with a single organized menu

#### Help Menu and Documentation

- New `Help` toolbar dropdown replaces the standalone `? Help` link
- "Using Quiddity" link opens new application usage guide at `docs/using-quiddity.html`
- "IDEF5 Reference" link opens new notation reference at `docs/idef5-reference.html`
- Examples submenu moved under Help as a CSS hover flyout
- New `src/docs/using-quiddity.html` — covers toolbar menus, canvas navigation, adding nodes, connection workflows (including "select Kind first" shortcut), editing, clipboard, context menu, AI assistant, file operations, auto-save, examples, and keyboard shortcuts
- New `src/docs/idef5-reference.html` — covers what is IDEF5, ontology fundamentals, all 17 symbol types with SVG previews, all 12 edge types, and 4 modelling patterns
- Shared `src/css/docs.css` for both documentation pages

#### Library System Example

- New example demonstrating `relation-first` nodes (holds, borrows), `first-order` edges, `subkind-of` (Fiction/Non-Fiction under Book), and `instance-of` (Alice is a Member)

### Changed

#### Scholar's Instrument Design Overhaul

- Aesthetic direction established: *Scholar's Instrument* — the precision of a scientific tool meets the warmth of scholarly work
- Accent color changed from blue (`#3b82f6`) to amber (`#d97706`) — the sole interactive/selection color throughout
- Toolbar background changed from blue-black (`#1a1e2e`) to warm black (`#1c1917`)
- Canvas background shifted to warm parchment (`#eae6df`); panels to ivory (`#fafaf8`)
- Canvas dot-grid dots warmed to `#c8c0b4`
- Font stack updated to Geist Sans + Geist Mono (loaded from Google Fonts)
- All text colors shifted to warm neutral tokens (warm blacks, warm grays, warm faint)
- All border and separator colors updated to warm-neutral equivalents
- Context menu background changed from white to ivory (`#fafaf8`); border warmed
- `✦ AI` button always shown in amber accent color; active state (panel open) matches

#### Toolbar

- File and Edit menus replace individual buttons, reducing toolbar clutter
- Flex spacer added between zoom controls and Help/AI — pushes Help and AI to the far right
- Fit button now shows `□ Fit` to match the reference screenshot
- `Quiddity` label color changed to amber (`#d97706`) to match the AI button
- `Quiddity` label font size increased to 15px
- "Border Color" label in properties panel renamed to "Color"

#### Connection Shortcut

- Clicking a relation or connection tool in the toolbox while a Kind or Individual is selected pre-populates it as the source — user can click a target node directly without needing to click the source first
- Toolbox hints updated to describe this behavior

#### Design System (DESIGN.md)

- Full design system document written covering: aesthetic direction, philosophy, color palette, typography, spacing, border radius, interactive states, motion, component specs, canvas spec, responsive breakpoints, accessibility, and a decisions log
- IDEF5 Symbol Integrity section establishes that the 17 symbol shapes are defined by the specification and must not be altered
- Added to CLAUDE.md: always read DESIGN.md before making visual or UI decisions

#### Examples (IDEF5 Correctness and Layout)

- **Ballpoint Pen** — Spring corrected to `part-of` Lower Body (was incorrectly `part-of` Cartridge)
- **Water Phase Transitions** — Complete rebuild; was broken with edges referencing non-existent nodes. Now shows Ice → Liquid Water → Steam with `state-weak` junction nodes and Melt Ice / Boil Water process nodes
- **Vehicle Classification** — Bicycle and Motorcycle moved to the same row as Car and Truck (all four as children of Land Vehicle); layout no longer has a stranded third row
- **Agent Ontology** — Perception and Action repositioned beside Agent rather than above; removed product-specific "Copilot" individual, replaced with "Ada Lovelace" as an instance of Human Agent
- **Fastener Classification** — Wider horizontal spread creates a clear visual gap between Threaded and Non-Threaded groups

### Fixed

- AI system prompt listed incorrect edge types (`subtype`, `composition`, etc.) that don't exist in the renderer — all AI-generated edges were silently invisible; corrected to actual IDEF5 edge types (`subkind-of`, `instance-of`, `part-of`, etc.)
- `validateAIPayload` now checks node and edge types against explicit whitelists; unknown types from the AI throw an error instead of producing broken graph data
- Clipboard paste cascade drift now resets after 5 pastes (100px) so repeated pastes don't push nodes off-canvas
- Keyboard shortcuts (Undo, Redo, Duplicate, and new Cut/Copy/Paste) now work on macOS using the Cmd key (`e.metaKey`), in addition to Ctrl on Windows/Linux — previously all shortcuts only checked `e.ctrlKey`
- Toolbar buttons now inherit the correct font family (`font-family: inherit`) so text renders in Geist rather than the browser default
- Links inside Help dropdown no longer show browser-default underline
