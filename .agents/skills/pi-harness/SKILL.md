---
name: pi-harness
description: Operate and troubleshoot the Agent Pi harness in Coder workspaces (tmux-pi, agent-workspace templates). Use when Pi is down or crash-looping, a provider/model fails (Azure OpenAI, GitHub Copilot), or when changing `~/.pi/agent/models.json` / `settings.json`.
---

# Pi Harness

Pi runs in tmux session `pi-session` inside a restart loop (`~/.pi-session-start.sh`).

```bash
pi-session-health --status     # tmux session + process state; exit 1 = unhealthy
pi-session-health --restart
pi-session-health --stop
tail -20 ~/.pi-session.log     # start/exit/restart events
tmux attach -t pi-session      # drive Pi interactively
```

## Configuration

The workspace startup script rewrites both files on every start — hand edits are lost on restart:

| File | Rendered from |
|---|---|
| `~/.pi/agent/models.json` | Template parameters `azure_openai_base_url`, `azure_openai_deployment_name_map` (model id); API key read from `$AZURE_OPENAI_API_KEY` at runtime |
| `~/.pi/agent/settings.json` | agent-workspace template only: `defaultProvider: github-copilot`, `defaultModel: claude-sonnet-5` |

To change them durably, change the template or its workspace parameters (for `coder update` parameter gotchas, see the `awesome-infra` skill). Edit the files directly only for a throwaway test.

## Troubleshooting

| Symptom | Fix |
|---|---|
| Copilot provider: "not logged in" / 401 | Run `/login` once in the Pi TUI (`tmux attach -t pi-session`). Seeded GitHub tokens are rejected by Copilot's token endpoint; interactive login is the only path |
| Azure: 401 | `[ -n "$AZURE_OPENAI_API_KEY" ]`; then test `curl -s -H "api-key: $AZURE_OPENAI_API_KEY" "$AZURE_OPENAI_BASE_URL/models"` |
| Azure: model not found | Model `id` in `models.json` must equal the Azure deployment name (`azure_openai_deployment_name_map` parameter) |
| Pi restarts every 5 s | Read the error just before each `Pi exited` line in `~/.pi-session.log` |
