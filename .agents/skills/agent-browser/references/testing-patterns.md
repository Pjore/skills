# Frontend Testing Patterns

Common patterns for using `agent-browser` in frontend verification and regression testing.

## Drag-and-Drop with Pointer-Event Libraries

Many modern drag-and-drop libraries (e.g. `@dnd-kit`, some Framer Motion setups) use pointer events instead of native HTML5 drag-and-drop. The built-in `agent-browser drag @e1 @e2` command relies on native DnD and will not trigger these libraries.

To simulate a pointer-based drag:

1. Use `eval` to read the source and target elements' bounding rects (`getBoundingClientRect()`).
2. Drive a real `mouse move` → `mouse down` → `mouse move` (in small steps) → `mouse up` sequence at the computed pixel coordinates.
3. Take an `--annotate` screenshot before the drag so you can verify the result against the `[N]` labels afterward.

```bash
agent-browser eval 'JSON.stringify(document.querySelector("[data-testid=source]").getBoundingClientRect())'
agent-browser mouse move <srcX> <srcY>
agent-browser mouse down left
agent-browser mouse move <midX> <midY>
agent-browser mouse move <dstX> <dstY>
agent-browser mouse up left
```

## Filtering Background Noise

Long-running SPAs often poll a background endpoint (health checks, SSE reconnect attempts, dev-server HMR). This noise drowns out useful console/network output during a targeted test. Filter it out rather than disabling the polling:

```bash
agent-browser console | grep -v "ERR_CONNECTION_REFUSED" | grep -v "vite"

agent-browser network har start /tmp/x.har
# ... interact ...
agent-browser network har stop
# then ignore HAR entries matching the known polling endpoint
```

## Reuse Existing Verification Scripts

Before writing a new automation flow from scratch, check whether the project already has a smoke-test or verification runner (commonly `pnpm verify:ui`, a `scripts/verify-*` file, or per-milestone test directories). Extend or reuse these rather than duplicating coverage.

## Visual Regression

```bash
agent-browser screenshot /tmp/before.png
# ...make changes...
agent-browser diff screenshot --baseline /tmp/before.png
```
