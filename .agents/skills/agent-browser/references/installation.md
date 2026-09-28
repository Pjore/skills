# agent-browser — Installation & Configuration

## Installation

Install globally for best performance (sub-millisecond parsing vs `npx` overhead):

```bash
npm install -g agent-browser
agent-browser install --with-deps   # Download Chromium + install Linux system deps
```

> **First-run note:** `agent-browser install --with-deps` downloads Chromium (~290 MB) and
> installs system libraries via `apt`. This is slow the first time (~1-2 min) but only
> needs to run once. Subsequent `agent-browser` commands start instantly.
>
> If already installed globally, prefer `agent-browser` over `npx agent-browser` — it
> skips the Node.js routing layer and is noticeably faster.

Verify installation:

```bash
agent-browser --version
```

## ARM64 Environments (e.g. Coder workspaces)

`agent-browser install --with-deps` has no ARM64 builds. Use Playwright Chromium instead:

```bash
npm install -g agent-browser
npx playwright install chromium --with-deps
```

Then invoke as `npx agent-browser` (or set `AGENT_BROWSER_BROWSER_PATH` to the Playwright Chromium binary):

```bash
# Find the Playwright Chromium binary path
node -e "const p = require('playwright'); console.log(p.chromium.executablePath())"

# Set it for all agent-browser invocations
export AGENT_BROWSER_BROWSER_PATH=$(node -e "const p = require('playwright'); console.log(p.chromium.executablePath())")
agent-browser open https://example.com
```

For permanent setup, add the `export` to `~/.bashrc` or `~/.zshrc`.

> **Why ARM64?** Chromium prebuilds are x86-only. Playwright maintains its own Chromium
> fork with ARM64 binaries for Linux (used by Coder Hetzner workspaces, Apple Silicon, etc).

## Configuration File

Create `agent-browser.json` in the project root for persistent per-project settings:

```json
{
  "headed": true,
  "proxy": "http://localhost:8080",
  "profile": "./browser-data"
}
```

Priority (lowest to highest):
1. `~/.agent-browser/config.json` — user-global defaults
2. `./agent-browser.json` — project defaults
3. Environment variables
4. CLI flags — always win

Common config options:

| Key | Type | Description |
|-----|------|-------------|
| `headed` | boolean | Run with visible browser window |
| `proxy` | string | HTTP proxy URL |
| `profile` | string | Path to persistent browser profile directory |
| `browser` | string | Browser engine: `chromium` (default), `firefox`, `webkit` |
| `timeout` | number | Default element wait timeout in ms (default: 30000) |
