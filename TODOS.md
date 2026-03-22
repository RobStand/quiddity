# TODOS

Items considered and explicitly deferred. Each has enough context to pick up in 3 months.

---

## AI Panel — v2 work (depends on MVP AI panel shipping first)

### 1. Automated test suite (Playwright)

**What:** Add Playwright end-to-end tests for the AI panel.

**Why:** The AI panel has 26 distinct test paths with no automated coverage. Manual verification is slow and unreliable for edge cases (race conditions, error states, persistence).

**Pros:** Every future AI panel change gets automated regression coverage. CI becomes possible.

**Cons:** Adds Playwright/Node as a new toolchain dependency to a currently zero-dependency project. Requires a local HTTP server (not file://).

**Context:** Start with the 5 critical paths: (1) key setup flow, (2) happy path prompt→graph, (3) undo reverts full AI turn, (4) localStorage persistence survives refresh, (5) extension adds nodes to existing graph. See the test plan at `~/.gstack/projects/RobStand-quiddity/robert-main-test-plan-*.md` for the full 26-path diagram. Use `python3 -m http.server` as the dev server.

**Depends on:** AI panel MVP shipped. ✓ Dependency met (shipped 2026-03-21).

---

### 2. Bidirectional editing (graph ↔ natural language)

**What:** Select any node or region → AI explains it in plain English. Edit the explanation → AI updates the graph accordingly.

**Why:** This is the '10x vision' — the feature that makes Quiddity genuinely different from every other ontology editor. The current AI panel sets up the architecture (conversational loop, merge strategy, context injection) that makes this tractable.

**Pros:** Dramatically differentiating; no equivalent tool exists. Directly serves the curious generalist who wants to understand what they've built, not just create it.

**Cons:** Two distinct sub-problems: (a) graph→text narration (a single LLM call, easy), and (b) text→graph delta (hard — AI needs to understand what changed and produce only the delta, not the full graph).

**Context:** Start with narration direction only: add an "Explain" button that sends the current graph to the AI and shows the response in the panel. This is ~50 lines and gives users a taste of the bidir vision. The edit direction (text→graph delta) requires a diff strategy — options: (a) full re-generation with reconciliation, (b) structured delta format, (c) AI returns only changed nodes/edges.

**Depends on:** AI panel MVP shipped. ✓ Dependency met (shipped 2026-03-21).

---

### 3. Context injection optimization for large graphs

**What:** Cap or truncate the graph context sent to the API when diagrams exceed ~50 nodes.

**Why:** Currently, every API call serializes the full `state.nodes` and `state.edges`. A 200-node graph is ~20KB of tokens. At $3/M tokens, each call costs ~$0.06 — 10x more than a small graph. Compounds for power users.

**Pros:** Lower API cost; faster calls for users with large graphs.

**Cons:** Truncation affects AI quality for extension tasks (AI can't connect to nodes it doesn't know about).

**Context:** Simplest approach: cap context at 50 nodes/50 edges, prioritizing nodes closest to the viewport center. Include a note in the prompt: "Note: context truncated to 50 nodes due to size. Additional context available if needed." If the graph has >50 nodes, show a warning badge on the AI panel.

**Depends on:** AI panel MVP shipped. ✓ Dependency met (shipped 2026-03-21). Only meaningful when users build large diagrams.

---

### 4. Multi-endpoint support (OpenAI, Groq, Ollama)

**What:** Let users set a custom API endpoint alongside their API key, enabling OpenAI-compatible LLMs.

**Why:** Some users don't want to use the Anthropic API (cost, enterprise policy, local LLM preference). The BYOK architecture is already in place; endpoint configurability is small additional work.

**Pros:** Model-agnostic; local LLM users (Ollama) could run with zero API cost; opens the tool to OpenAI users.

**Cons:** Each provider has different auth headers (`x-api-key` vs `Authorization: Bearer`), different model names, different response shapes. Need to test per-provider. System prompt may need tuning per model.

**Context:** Add a provider dropdown in the AI panel key section: Anthropic (default) / OpenAI / Custom URL. Keep a `AI_PROVIDERS` map: `{ anthropic: { endpoint, authHeader }, openai: { endpoint, authHeader } }`. Start with Anthropic + OpenAI, then custom URL. The `anthropic-dangerous-direct-browser-access` header only applies to Anthropic — guard it per-provider.

**Depends on:** AI panel MVP shipped. ✓ Dependency met (shipped 2026-03-21).
