# Human login, live views, and private handoff

Load only for interactive authentication or browser-to-localhost handoff. Never ask for a
BankID PIN, transfer session secrets through chat/tool output, or record an authentication flow.

## Rotating QR and live viewing

1. Reuse one named session. Do not send a still image of a rotating QR challenge; a few seconds
   of chat latency invalidates it. Do not attempt to defeat freshness checks.
2. Prefer a shared built-in browser when available. Otherwise check current capabilities with
   `agent-browser dashboard --help` and `agent-browser stream --help`.
3. Start `agent-browser dashboard start --port 4848`. Confirm the listener is loopback-only.
   The dashboard can expose/control **all sessions** and their activity; exclude unrelated
   sessions and do not advertise it publicly.
4. Establish an authenticated private tunnel. On the human's computer, for Coder:

   ```bash
   coder port-forward <owner/workspace> --tcp 4848:4848
   ```

   Open `http://127.0.0.1:4848` and select the named session. VS Code Ports or an authenticated
   SSH local forward are alternatives. Do not guess Coder app/subdomain URLs or make ports public.
   The dashboard proxies session streams: do not expose Chrome/CDP or individual stream ports.
5. Wait for the human to confirm the live page is visible, then start a fresh login challenge.
   Ask them to verify the relying party. Suppress navigation stdout on auth redirects: it may
   contain session-bearing URLs. Confirm completion with origin/token-presence metadata,
   not a full authenticated snapshot containing private account content.
6. After handoff, close only task-owned sessions, stop the task-owned dashboard, and ask the
   human to remove the forward. Do not stop an unrelated viewer or browser.

## Browser-to-localhost preflight

Use the application's existing one-use receiver. Pause other renewal owners and retire app
scripts/tabs without logging out before transfer. First check a credential-free `/ready` from
both shell and browser; validate instance, expected source, and unconsumed state.

- `ERR_CONNECTION_REFUSED`: check receiver/listener and browser location. A browser on the
  human's machine needs a separate **private** receiver-port forward; a browser beside the
  receiver does not. Do not cycle localhost names or create public tunnels.
- `ERR_BLOCKED_BY_LOCAL_NETWORK_ACCESS_CHECKS` / `LocalNetworkAccessPermissionDenied`: this
  is Chromium's local-network permission, not a failed login or a refused connection.
  Authorize only the task's HTTPS origin and loopback access; do not disable browser security.

## Temporary CDP permission

For a local `agent-browser` session, use the bundled helper instead of rediscovering CDP:

```bash
node <agent-browser-skill>/scripts/with-loopback-permission.mjs \
  <session> https://expected.example <metadata-or-handoff.js>
```

The eval file is JavaScript **code**, not a secret export. It must check receiver identity and
keep tokens inside the browser-to-receiver request; return only `{ready: true}` or
`{installed: true}`. Use the application's runbook for its exact handoff contract.

The helper checks the installed CDP schema, selects narrow `loopbackNetwork` (legacy
`localNetworkAccess` only when advertised), and matches the page's browser context. Permission
is scoped to the requesting CDP connection: **keep that socket alive through the browser
fetch/eval**. Granting permission then disconnecting before eval loses the override. The helper
closes it on success/failure, bounds execution/output, and suppresses raw subprocess errors.
Use it only after the human authorizes the local handoff. It does not bypass CORS or identity checks.

## Verification

Separate login, one-use installation, server-side renewal, allowlisted live access, and subsequent
automatic renewal. A healthy scheduler is not proof of source authentication or a renewal worker.
Report any unverified step explicitly; do not force token expiry or mutate checkpoints to test it.

Helper checks: `node --test scripts/with-loopback-permission.test.mjs`. Set
`AGENT_BROWSER_LIVE_TEST=1` for an isolated synthetic receiver/browser test, including permission
cleanup on success and failure; it requires installed Chrome and access to `https://example.com`.
