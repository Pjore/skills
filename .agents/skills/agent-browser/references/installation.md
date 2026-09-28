# agent-browser — Installation & Configuration

## Installation

```bash
npm install -g agent-browser
agent-browser install --with-deps   # x86_64: downloads Chrome (~290 MB) + apt system libs, once
agent-browser doctor                # confirms the CLI and which Chrome binary it uses
```

Prefer the global `agent-browser` binary over `npx agent-browser` (faster startup).

## ARM64 Linux

`agent-browser install` has no Linux ARM64 Chrome build. Use any other Chromium:

- **Debian/Ubuntu `chromium` package** (`/usr/bin/chromium`) — auto-detected, no config needed.
- **Playwright Chromium** — point agent-browser at it:

  ```bash
  npx playwright install chromium --with-deps
  CHROME=$(ls -d ~/.cache/ms-playwright/chromium-*/chrome-linux/chrome | tail -1)
  mkdir -p ~/.agent-browser && echo "{\"executablePath\": \"$CHROME\"}" > ~/.agent-browser/config.json
  ```

  Or per invocation: `--executable-path <path>` / `AGENT_BROWSER_EXECUTABLE_PATH`.

Run `agent-browser doctor` to confirm which binary is picked up.

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
| `executablePath` | string | Browser binary to launch (ARM64: see above) |
| `engine` | string | `chrome` (default) or `lightpanda` |

All options: `agent-browser --help`.
