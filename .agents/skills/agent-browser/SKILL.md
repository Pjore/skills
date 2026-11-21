---
name: agent-browser
description: Browser automation for navigation, forms, web testing, screenshots, and human-assisted login. Use for website interaction, BankID/2FA, rotating QR codes, private live browser views, or browser-to-localhost session handoff.
allowed-tools: Bash(npx agent-browser:*), Bash(agent-browser:*)
---

# Browser Automation

Use a named session; keep it for the whole task. For shared interaction prefer an available
built-in browser, or the CLI's private live dashboard. A screenshot is not an interactive view.
Verify reachability from the actual browser: its `localhost` may differ from the agent shell's.

## Core loop

```bash
agent-browser --session task open https://example.com
agent-browser --session task snapshot -i
agent-browser --session task click @e3
agent-browser --session task wait --url '**/result'
agent-browser --session task snapshot -i
```

Refs expire on navigation or DOM changes. Read fresh refs before acting. Chain commands only
when no intermediate decision depends on their output. Wait for a specific route, element, or
result; persistent SSE/polling makes network idle unreliable.

## Human authentication

- BankID and other rotating QR challenges need a **live view**, not chat screenshots, GIFs,
  or recordings. Establish private viewing first; start a fresh challenge after the human
  confirms the page is visible. The human approves only the expected relying party.
- For remote viewing, loopback handoff, and permission troubleshooting, load only
  [references/live-auth.md](references/live-auth.md). It includes the temporary CDP helper.
- Never print cookies, storage, auth URLs, CDP capabilities, or token-bearing network traffic.
  Return only origin, presence/expiry, success, or counts. Keep credentials out of shell args.
- Pause competing renewal owners before transferring a session. Login success, live access,
  and automatic renewal are separate checks. Close task-owned viewers/receivers afterwards.

## Keep tool output small

Use `snapshot -i`, a scoped snapshot, or a targeted `eval` returning metadata. Inspect tabs if
a click seems not to navigate. Do not dump a long login-provider list to find one link.
Use focused `stream --help` or `dashboard --help` for version-sensitive features, not the full
CLI help or `skills get core --full` bundle. Load only the reference needed for the current step.
Keep diagnostics to one failed stage and one discriminating check; do not repeat auth attempts.

## Installation

Use the installed global binary. Install/update only when requested or necessary for the task.

```bash
agent-browser install --with-deps
```

On ARM64, test the current CLI/cache before assuming Chrome is unavailable. For an existing
binary failing on shared libraries, inspect `ldd <chrome> | grep 'not found'`; install missing
system dependencies instead of downloading another browser. See
[references/installation.md](references/installation.md).

## Focused commands and references

```bash
agent-browser --session task snapshot -s '#main'
agent-browser --session task screenshot /tmp/evidence.png
agent-browser --session task tab list
agent-browser --session task eval --stdin < metadata.js
agent-browser --session task close
```

| Reference | Load for |
|---|---|
| [commands](references/commands.md) | Specific command/options, semantic locators |
| [snapshot-refs](references/snapshot-refs.md) | Ref lifecycle and annotated screenshots |
| [session-management](references/session-management.md) | Named sessions and state persistence |
| [live-auth](references/live-auth.md) | Rotating QR, private dashboard, loopback permission |
| [authentication](references/authentication.md) | Other login/state patterns; apply credential-safety rules above |
| [installation](references/installation.md) | Browser binaries, ARM64, libraries, configuration |
| [vscode-fallback](references/vscode-fallback.md) | Built-in browser fallback and context warnings |
| [testing-patterns](references/testing-patterns.md) | UI testing and evidence |
| [browser-tool-comparison](references/browser-tool-comparison.md) | Choosing shared browser vs CLI |
| [proxy-support](references/proxy-support.md) | Proxy configuration |
| [video-recording](references/video-recording.md) | Non-authentication recordings |

Templates: [forms](templates/form-automation.sh),
[authenticated sessions](templates/authenticated-session.sh),
[capture](templates/capture-workflow.sh). Do not use templates to expose login secrets.
