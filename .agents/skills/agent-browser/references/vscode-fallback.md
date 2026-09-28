# agent-browser — VS Code Browser Tools Fallback

When `agent-browser` is not installed, use VS Code built-in browser tools. Load them with `tool_search` first.

## Command Mapping

| agent-browser | VS Code tool |
|---|---|
| `agent-browser open <url>` | `open_browser_page` with `url` |
| `agent-browser snapshot -i` | `read_page` with `pageId` |
| `agent-browser screenshot` | `screenshot_page` with `pageId` |
| `agent-browser click @e1` | `click_element` with `ref` from `read_page` |
| Navigate to URL | `navigate_page` with `type: "url"` |

## Pre-flight Check (CRITICAL)

Before calling `open_browser_page`, always verify the server responds:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:<PORT>/
```

If curl returns `200`, proceed. If not, wait for the server to be ready. **Never call `open_browser_page` against a port that isn't responding** — a timeout corrupts the Playwright browser context permanently for the session.

## Playwright Context Corruption

If `open_browser_page` times out, the page is left in a broken "Loading..." state. Multiple timed-out attempts **permanently corrupt the Playwright browser context** for the entire session — all subsequent browser tool calls fail.

**Symptoms**: `browserContext.newPage: Cannot read properties of undefined (reading '_page')`
**Recovery**: No in-session fix — ask the user to restart the VS Code/Coder session.
**Prevention**: Always run the curl pre-flight check; if it fails, do NOT attempt `open_browser_page`.

## After Service Restart

When a dev server is stopped and restarted, VS Code port forwarding may briefly disconnect. Wait for the task output to confirm the server is ready (e.g. "VITE ready"), then run the curl pre-flight check before opening the browser.
