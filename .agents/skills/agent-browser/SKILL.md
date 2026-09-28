---
name: agent-browser
description: Browser automation CLI for AI agents. Use when the user needs to interact with websites, including navigating pages, filling forms, clicking buttons, taking screenshots, extracting data, testing web apps, or automating any browser task. Triggers include requests to "open a website", "fill out a form", "click a button", "take a screenshot", "scrape data from a page", "test this web app", "login to a site", "automate browser actions", or any task requiring programmatic web interaction.
allowed-tools: Bash(npx agent-browser:*), Bash(agent-browser:*)
---

# Browser Automation with agent-browser

## Installation

```bash
npm install -g agent-browser
agent-browser install --with-deps   # x86_64: download Chrome + system deps
agent-browser doctor                # verify install; shows which Chrome it found
```

On ARM64 Linux, `agent-browser install` has no Chrome build — see [references/installation.md](references/installation.md#arm64-linux).

## Core Workflow

Every browser automation follows this pattern:

1. **Navigate**: `agent-browser open <url>`
2. **Snapshot**: `agent-browser snapshot -i` (get element refs like `@e1`, `@e2`)
3. **Interact**: Use refs to click, fill, select
4. **Re-snapshot**: After navigation or DOM changes, get fresh refs

```bash
agent-browser open https://example.com/form
agent-browser snapshot -i
# Output: @e1 [input type="email"], @e2 [input type="password"], @e3 [button] "Submit"

agent-browser fill @e1 "user@example.com"
agent-browser fill @e2 "password123"
agent-browser click @e3
agent-browser wait --load networkidle
agent-browser snapshot -i  # Check result
```

## Command Chaining

The browser persists between commands via a background daemon, so `&&`-chaining is safe. Chain when you don't need an intermediate command's output (open + wait + screenshot); run separately when you must read output first (snapshot → refs → interact).

```bash
agent-browser open https://example.com && agent-browser wait --load networkidle && agent-browser screenshot page.png
```

## Essential Commands

```bash
# Navigation
agent-browser open <url>              # Navigate (aliases: goto, navigate)
agent-browser close                   # Close browser

# Snapshot
agent-browser snapshot -i             # Interactive elements with refs (recommended)
agent-browser snapshot -i -C          # Include cursor-interactive elements (divs with onclick, cursor:pointer)
agent-browser snapshot -s "#selector" # Scope to CSS selector

# Interaction (use @refs from snapshot)
agent-browser click @e1               # Click element
agent-browser click @e1 --new-tab     # Click and open in new tab
agent-browser fill @e2 "text"         # Clear and type text
agent-browser type @e2 "text"         # Type without clearing
agent-browser select @e1 "option"     # Select dropdown option
agent-browser check @e1               # Check checkbox
agent-browser press Enter             # Press key
agent-browser keyboard type "text"    # Type at current focus (no selector)
agent-browser keyboard inserttext "text"  # Insert without key events
agent-browser scroll down 500         # Scroll page (amount must be > 0; top: eval 'window.scrollTo(0,0)')
agent-browser scroll down 500 --selector "div.content"  # Scroll within a specific container

# Get information
agent-browser get text @e1            # Get element text
agent-browser get url                 # Get current URL
agent-browser get title               # Get page title

# Wait
agent-browser wait @e1                # Wait for element
agent-browser wait --load networkidle # Wait for network idle
agent-browser wait --url "**/page"    # Wait for URL pattern
agent-browser wait 2000               # Wait milliseconds

# Downloads
agent-browser download @e1 ./file.pdf          # Click element to trigger download
agent-browser wait --download ./output.zip     # Wait for any download to complete
agent-browser --download-path ./downloads open <url>  # Set default download directory

# Capture
agent-browser screenshot              # Screenshot to temp dir
agent-browser screenshot file.png     # Screenshot to specific path
agent-browser screenshot --full       # Full page screenshot
agent-browser screenshot --annotate   # Annotated screenshot with numbered element labels
agent-browser pdf output.pdf          # Save as PDF
# Long or variable-laden target paths: screenshot to /tmp/ first, then cp.

# Diff (compare page states)
agent-browser diff snapshot                          # Current vs last snapshot (--baseline <file> for a saved one)
agent-browser diff screenshot --baseline before.png  # Visual pixel diff
agent-browser diff url <url1> <url2>                 # Compare two pages (--selector, --wait-until)
```

Save login state for reuse: `agent-browser state save ./auth-state.json` (see [references/authentication.md](references/authentication.md)).

## Ref Invalidation — Critical Rule

Refs (`@e1`, …) are invalidated when the page changes. Re-run `snapshot -i` after any navigation, form submission, or dynamic content load (dropdowns, modals) before using a ref again.

## Annotated Screenshots (Vision Mode)

`agent-browser screenshot --annotate` overlays numbered labels on interactive elements and prints a legend (`[2] @e2 link "Home"`); the refs are cached, so `click @e2` works without a separate snapshot. Use it for icon-only buttons, canvas/charts, layout checks, or spatial reasoning.

## Semantic Locators and eval

When refs are unreliable, use `agent-browser find text|label|role|placeholder|testid …` (see [references/commands.md](references/commands.md#semantic-locators-alternative-to-refs)).

For `eval`, single-quote simple one-liners (`agent-browser eval 'document.title'`). For nested quotes, arrow functions, or multiline JS use a heredoc, which avoids shell-quoting corruption:

```bash
agent-browser eval --stdin <<'EVALEOF'
JSON.stringify([...document.querySelectorAll("a")].map(a => a.href))
EVALEOF
```

> **Configuration:** See [references/installation.md](references/installation.md#configuration-file) for `agent-browser.json` setup and option reference.

## Deep-Dive Documentation

| Reference | When to Use |
|-----------|-------------|
| [references/commands.md](references/commands.md) | Full command reference with all options |
| [references/snapshot-refs.md](references/snapshot-refs.md) | Ref lifecycle, invalidation rules, troubleshooting |
| [references/session-management.md](references/session-management.md) | Parallel sessions, state persistence, concurrent scraping |
| [references/authentication.md](references/authentication.md) | Login flows, OAuth, 2FA handling, state reuse |
| [references/video-recording.md](references/video-recording.md) | Recording workflows for debugging and documentation |
| [references/proxy-support.md](references/proxy-support.md) | Proxy configuration, geo-testing, rotating proxies |
| [references/installation.md](references/installation.md) | Installation, ARM64 setup, configuration file reference |
| [references/vscode-fallback.md](references/vscode-fallback.md) | VS Code browser tools fallback, pre-flight check, context corruption |
| [references/testing-patterns.md](references/testing-patterns.md) | Frontend testing recipes — pointer-based drag-and-drop, noise filtering, visual regression |
| [references/browser-tool-comparison.md](references/browser-tool-comparison.md) | When to use `agent-browser` vs. the built-in browser tool, with a full capability comparison |

## Ready-to-Use Templates

| Template | Description |
|----------|-------------|
| [templates/form-automation.sh](templates/form-automation.sh) | Form filling with validation |
| [templates/authenticated-session.sh](templates/authenticated-session.sh) | Login once, reuse state |
| [templates/capture-workflow.sh](templates/capture-workflow.sh) | Content extraction with screenshots |

Run them from the skill directory, e.g. `./templates/form-automation.sh https://example.com/form`.

## Fallback: VS Code Browser Tools

When `agent-browser` is not installed, use VS Code built-in browser tools (load via `tool_search`).
See [references/vscode-fallback.md](references/vscode-fallback.md) for command mapping, pre-flight check, and Playwright context corruption warning.
