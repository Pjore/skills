# `agent-browser` vs Built-in Browser Tool — LLM Agent Perspective

Comparison of the VS Code built-in browser tool (`open_browser_page`,
`read_page`, `screenshot_page`, `click_element`, `navigate_page`) versus the
`agent-browser` CLI when used by an LLM coding agent.

---

## TL;DR

| Use case | Recommended tool |
|---|---|
| Quick one-off "does the page render?" check | Built-in |
| Reading text/structure off a page | Either (built-in is zero-setup) |
| Annotated visual layout / spatial reasoning | **agent-browser** (`--annotate`) |
| Drag-and-drop, modals, animations, multi-step flows | **agent-browser** |
| Console log capture (full history, levels) | **agent-browser** (`console`) |
| Network monitoring (HAR, request interception) | **agent-browser** (`network har`, `network route`) |
| Structured data extraction (JSON in, JSON out) | **agent-browser** (`eval --stdin`) |
| Reproducible automation, recorded sessions | **agent-browser** (`record`, `state save`) |
| Frontend regression testing | **agent-browser** (`diff screenshot`, `diff snapshot`) |
| Video walkthroughs of bugs/features | **agent-browser** (`record start/stop`, requires `ffmpeg`) |

**Default:** prefer `agent-browser` for any non-trivial frontend work. Use the
built-in browser tool only when zero setup matters more than capability
(e.g. confirming a URL loads, fetching a small piece of text).

---

## Detailed Comparison

### 1. Visual — Render, Layout, Alignment

| | Built-in | agent-browser |
|---|---|---|
| Default viewport | Narrow (can truncate wide layouts) | 1280 px by default |
| Output format | JPEG inline | PNG file on disk |
| Full-page capture | No | `--full` flag |
| Scoped capture | No | `--selector` / `ref` |

**Verdict:** agent-browser for anything wider than a simple single-column page — the built-in's narrow viewport can hide content off to the side.

### 2. Visual Debug — Animations, DnD, Modals

| | Built-in | agent-browser |
|---|---|---|
| Element overlay | None | `screenshot --annotate` overlays numbered `[N]` boxes mapped to `@eN` refs |
| Pixel-rect coords | Not exposed | `eval` returns `getBoundingClientRect()` for any selector |
| Video recording | No | `record start <path>` / `record stop` (WebM, requires `ffmpeg`) |
| Diff screenshots | No | `diff screenshot --baseline before.png` |

Annotated screenshots are the only reliable way to spatially reason about a
dense grid/canvas layout in a single output.

### 3. Console Log

| | Built-in | agent-browser |
|---|---|---|
| Surface | Passive `Recent events` block in `navigate`/`open` responses (mostly errors, last ~10) | Dedicated `agent-browser console` command, full history, all levels |
| Inject hook | No | `eval` can monkey-patch `console.log` and return a JSON array of captured messages |

### 4. Network Monitor

| | Built-in | agent-browser |
|---|---|---|
| Passive failures | `(requestFailed)` events in response | — |
| Live request log | No | `network requests` |
| HAR capture | No | `network har start <path>` / `network har stop` |
| Request interception / mocking | No | `network route <url-pattern> <action>` |
| Response bodies | No | Included in HAR |

### 5. Scraping

| | Built-in | agent-browser |
|---|---|---|
| Primary | `read_page` → ARIA tree | `snapshot -i` → ARIA tree, plus `eval --stdin` heredoc |
| Free JS execution | No | Yes — returns JSON, full DOM + browser API access |
| Scoping | No | `snapshot -s "#selector"` |

### 6. Automation — Record & Reproduce

| | Built-in | agent-browser |
|---|---|---|
| Interaction primitives | `click_element`, `type_in_page`, `navigate_page` | `click @eN`, `fill`, `press`, `keyboard`, `find {text|role|testid|label}` |
| Semantic locators | Selector-only | `find role button --name "Submit"`, `find testid "..."` |
| State persistence | No | `state save ./auth.json` / `state load` |
| Chained commands | Sequential tool calls | `&&` shell chaining (persistent daemon) |
| Session video | No | `record start/stop` |

`find testid "..."` is dramatically more robust against modern component
frameworks' generated class names than CSS selectors.

### 7. Frontend Testing

| | Built-in | agent-browser |
|---|---|---|
| Visual regression | No | `diff screenshot --baseline before.png` |
| Structural regression | No | `diff snapshot --baseline before.txt` |
| Cross-URL diff | No | `diff url <a> <b>` |
| API mocking for tests | No | `network route` |
| Performance profile | No | `profiler start/stop` |

See [testing-patterns.md](testing-patterns.md) for reusable frontend testing
recipes (drag-and-drop, noise filtering, visual regression).

---

## When to Still Reach for the Built-in Tool

- **Sanity checks during chat where setup time matters**: "does
  `http://localhost:3000` respond at all?"
- **The browser is already open with state** that you want to inspect
  without disturbing it (the built-in tool is in-IDE; the agent-browser
  daemon is a separate session).
- **Rendering an inline screenshot in chat for the user** — built-in
  returns JPEG embedded in the response; agent-browser writes to disk and
  needs a follow-up `view_image`.
- **Quick text scrape of a small page** where the ARIA tree from `read_page`
  is enough.

---

## Quick Reference — Common Commands

```bash
# Annotated visual snapshot
agent-browser screenshot --annotate /tmp/page.png

# Full network capture for one navigation
agent-browser network har start /tmp/x.har
agent-browser open "http://localhost:3000/" && agent-browser wait --load networkidle
agent-browser network har stop

# Extract structured page state
agent-browser eval 'JSON.stringify(window.__APP_STATE__ || {})'

# Visual regression
agent-browser screenshot /tmp/before.png
# ...make changes...
agent-browser diff screenshot --baseline /tmp/before.png
```
