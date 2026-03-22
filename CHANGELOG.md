# Changelog

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
- Shared `src/css/docs.css` for both documentation pages (moved from `src/docs/docs.css` for consistency)

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

- Keyboard shortcuts (Undo, Redo, Duplicate, and new Cut/Copy/Paste) now work on macOS using the Cmd key (`e.metaKey`), in addition to Ctrl on Windows/Linux — previously all shortcuts only checked `e.ctrlKey`
- Toolbar buttons now inherit the correct font family (`font-family: inherit`) so text renders in Geist rather than the browser default
- Links inside Help dropdown no longer show browser-default underline
