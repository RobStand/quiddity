# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Quiddity is a browser-based knowledge engineering tool for creating and modeling IDEF5 ontologies. Its intended user is anyone who wants to model knowledge, such as for defining deterministic knowledge graphs for agentic AI. Quiddity runs entirely in the browser with no build system, server, or dependencies — pure vanilla JavaScript, HTML, and CSS.

## Running the App

Open `src/index.html` directly in a browser. No build step, no server required.

## Architecture

The app is structured as three files:

- **[src/js/quiddity.js](src/js/quiddity.js)** — All application logic (~2,100 lines). Organized into sections: constants/config, geometry helpers, SVG rendering, state management, event handling, and export. The `init()` function is called on `DOMContentLoaded`.
- **[src/index.html](src/index.html)** — UI shell: toolbar, toolbox (symbol palette), SVG canvas, and properties panel. Contains SVG marker/gradient defs. References only `quiddity.js`.
- **[src/css/quiddity.css](src/css/quiddity.css)** — Application styles. **[src/css/help.css](src/css/help.css)** — Help page styles.
- **[src/help.html](src/help.html)** — Standalone user documentation page.

## Data Model

Global state holds `nodes[]` and `edges[]`, plus undo/redo stacks. Both are serialized to JSON for save/load and persisted to `localStorage` for auto-save.

- **Node**: `{ id, type, x, y, label, color, w, h, ... }` — type is one of 17 IDEF5 symbol types (kind, individual, relation-first/second/alt, process, referent, junction-xor/or/and, state-weak/strong, transition-instant, connect-fwd/bwd/plain, container, key)
- **Edge**: `{ id, from, to, type, label }` — 11 edge types

## Key Conventions

- All SVG elements created via `svgEl()` helper (wraps `createElementNS`)
- Coordinates snap to a 10px grid via `snap()`
- Hit testing done manually: `hitTestNode()`, `hitTestEdge()`, `hitTestResizeHandle()`, `hitTestTransitionCircle()`
- Viewport (pan/zoom) stored separately from node coordinates; applied via `applyViewport()`
- Undo stack capped at 50 levels; `saveUndo()` called before any mutating operation

## gstack

Use the `/browse` skill from gstack for all web browsing. Never use `mcp__claude-in-chrome__*` tools.

Available gstack skills: `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/review`, `/ship`, `/browse`, `/qa`, `/qa-only`, `/design-review`, `/setup-browser-cookies`, `/retro`, `/investigate`, `/document-release`, `/codex`, `/careful`, `/freeze`, `/guard`, `/unfreeze`, `/gstack-upgrade`
