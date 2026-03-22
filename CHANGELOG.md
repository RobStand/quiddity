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

### Changed

#### Scholar's Instrument design overhaul

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

#### Toolbar layout

- File and Edit menus replace individual buttons, reducing toolbar clutter
- Flex spacer added between zoom controls and Help/AI — pushes Help and AI to the far right
- Fit button now shows `□ Fit` to match the reference screenshot
- Examples, Undo, and Redo remain as standalone toolbar items

#### Design system (DESIGN.md)

- Full design system document written covering: aesthetic direction, philosophy, color palette, typography, spacing, border radius, interactive states, motion, component specs, canvas spec, responsive breakpoints, accessibility, and a decisions log
- IDEF5 Symbol Integrity section establishes that the 17 symbol shapes are defined by the specification and must not be altered
- Added to CLAUDE.md: always read DESIGN.md before making visual or UI decisions

### Fixed

- Keyboard shortcuts (Undo, Redo, Duplicate, and new Cut/Copy/Paste) now work on macOS using the Cmd key (`e.metaKey`), in addition to Ctrl on Windows/Linux — previously all shortcuts only checked `e.ctrlKey`
- Toolbar buttons now inherit the correct font family (`font-family: inherit`) so text renders in Geist rather than the browser default
