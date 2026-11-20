# agent-browser — VS Code Browser Tools Fallback

Use VS Code built-in browser tools for interactive operator collaboration or when `agent-browser` is unavailable. Load them with `tool_search` first.

## Command Mapping

| agent-browser | VS Code tool |
|---|---|
| `agent-browser open <url>` | `open_browser_page` with `url` |
| `agent-browser snapshot -i` | `read_page` with `pageId` |
| `agent-browser screenshot` | `screenshot_page` with `pageId` |
| `agent-browser click @e1` | `click_element` with `ref` from `read_page` |
| Navigate to URL | `navigate_page` with `type: "url"` |

## Pre-flight Check (CRITICAL)

Before opening a development page, check the service is ready from the app host:

```bash
curl -s -o /dev/null -w "%{http_code}" http://localhost:<PORT>/
```

Use the application's readiness signal; an auth redirect can be expected. A shell probe does not establish that the shared browser can reach the same URL. When the browser runs on another host, use a verified remote browser proxy or the exact private forwarded frontend address, not the shell's loopback URL.

## Playwright Context Corruption

If `open_browser_page` times out, the page can remain in a broken "Loading..." state, and further browser actions may fail. Check the URL, forwarding and authentication before retrying.

**Symptoms**: `browserContext.newPage: Cannot read properties of undefined (reading '_page')`
**Recovery**: If the browser remains unusable after correcting the route, ask the operator to reconnect or restart the browser session.

## After Service Restart

When a dev server is stopped and restarted, VS Code port forwarding may briefly disconnect. Wait for the task output to confirm the server is ready (e.g. "VITE ready"), then run the curl pre-flight check before opening the browser.
