---
name: credential-security
description: "Enforce secure credential handling for any repo with a gitignored .env file. AI agents must NEVER read .env directly — only source it via load-credentials.sh, and must redact secret values from any captured output. Use when writing scripts, running commands that need API keys, or handling secrets of any kind."
---

# Credential Security

## Golden Rule

**Never read `.env` — only source it.**

```bash
source .agents/skills/credential-security/scripts/load-credentials.sh
```

## Prohibited Actions

| Action | Why |
|--------|-----|
| `cat .env` / `read_file .env` | Exposes all secrets to context |
| `grep KEY .env` | Leaks matched secret values |
| Hardcoded secrets in code | Committed to git = compromised |
| `echo $API_KEY` | Prints full secret to terminal output |

## Setup

No copying needed — dotagents installs [scripts/load-credentials.sh](scripts/load-credentials.sh) directly at `.agents/skills/credential-security/scripts/load-credentials.sh` in the target repo. It sources `.env` with `set -a` so variables are exported to child processes, and no-ops safely in CI when secrets already exist as injected env vars.

## Writing New Scripts

Every script that needs credentials must:

1. Source `load-credentials.sh` at the top
2. Never accept secrets as CLI arguments (visible in `ps`)
3. Never write secrets to files (use env vars or pipes)
4. Use `set -euo pipefail` for safety

```bash
#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/load-credentials.sh"
# ... use $VAR_NAME from environment
```

## Redacting Captured Output

Any tool output, log, or file that may have passed through a page/response containing secrets (browser automation, network logs, screenshots of forms) must be redacted before it's persisted or shown. Use [scripts/redact-filter.sh](scripts/redact-filter.sh):

```bash
source .agents/skills/credential-security/scripts/load-credentials.sh
.agents/skills/credential-security/scripts/redact-filter.sh <file> VAR1 VAR2
```

This replaces every occurrence of each variable's value with `[REDACTED:<VARNAME>]`, in place, without ever echoing the secret. Binary files (screenshots) are out of scope — avoid capturing the screen during credential-entry steps instead.

To wire this in automatically as a `PostToolUse` hook, declare it in `agents.toml`:

```toml
[[hooks]]
event = "PostToolUse"
command = ".agents/skills/credential-security/scripts/redact-filter.sh"
```

## Verification (Safe)

```bash
# Count loaded variables — never print values
env | grep -c "^[A-Z]"

# Confirm a specific variable is set (masked)
echo "API_KEY: ${API_KEY:0:8}..."
```
