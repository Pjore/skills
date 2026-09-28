---
name: pi-harness
description: Configure and troubleshoot Agent Pi harness in Coder workspaces. Use when setting up Pi runtime, configuring LLM providers (Azure OpenAI with Kimi), troubleshooting token or connectivity issues, or managing `~/.pi/agent/models.json`.
---

# Pi Harness

Agent Pi is a persistent LLM interface for Coder workspaces, running in a tmux session with automatic restart and health monitoring.

## Quick Start

**Check Pi session status:**
```bash
~/.pi-session-health.sh --status
```

**Restart Pi:**
```bash
~/.pi-session-health.sh --restart
```

**Stop Pi:**
```bash
~/.pi-session-health.sh --stop
```

## Configuration

Pi reads LLM provider config from `~/.pi/agent/models.json`. This file is auto-generated during workspace startup, but can be customized.

**Common patterns:**
- **Azure OpenAI (Kimi)** — Custom config required. See `references/models.md`.

## Logs

Pi session logs to `~/.pi-session.log`. Check for startup errors or provider connectivity issues:
```bash
tail -20 ~/.pi-session.log
```

**For detailed troubleshooting, see `references/models.md`.**
