# Quiddity end-to-end tests

Playwright tests that drive `index.html` in a real browser. They live in this
sibling folder so the app itself stays zero-dependency — nothing in the
`tests/` directory is needed to run Quiddity.

## Setup

```sh
cd tests
npm install
npx playwright install chromium
```

You also need `python3` on `PATH` — Playwright launches `python3 -m http.server`
against the repo root automatically (see `playwright.config.js`).

## Running

```sh
npm test               # headless run, list + html reporter
npm run test:headed    # watch the browser
npm run test:ui        # Playwright's interactive UI
npm run report         # open the most recent HTML report
```

A specific spec or test:

```sh
npx playwright test specs/02-prompt-to-graph.spec.js
npx playwright test -g "survives a full page reload"
```

## Conventions

- Specs live in `specs/`, named `NN-description.spec.js`. The number reflects
  the critical-path order in `TODOS.md`.
- All AI tests **must** mock the Anthropic endpoint via `mockAnthropic()` from
  `specs/helpers.js`. Tests must never hit a real LLM API — they need to be
  deterministic and runnable offline.
- Use `gotoApp(page, { aiKey })` from `helpers.js` to navigate; it clears
  `localStorage` first so tests don't bleed into each other.
- The browser's `window.state` (`{ nodes, edges, nextId, ... }`) and
  `window.viewport` are the source of truth for assertions; prefer
  `page.evaluate(() => window.state.nodes.length)` over scraping the DOM.

## Critical paths covered

1. `01-ai-key-setup.spec.js` — key setup flow (input → masked storage → clear).
2. `02-prompt-to-graph.spec.js` — happy-path prompt → mocked AI → rendered graph.
3. `03-undo-ai-turn.spec.js` — one Ctrl/Cmd+Z reverts the full AI turn.
4. `04-persistence.spec.js` — key + graph survive a page reload.
5. `05-extension.spec.js` — a second AI turn extends rather than replaces.
