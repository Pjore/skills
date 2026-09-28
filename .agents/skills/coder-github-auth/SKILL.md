---
name: coder-github-auth
description: "GitHub CLI/git authentication inside Coder workspaces via the ghtoken-refresh bash function — how the token lifecycle works, and the two invocation patterns depending on whether your agent's shell persists across tool calls. Use when gh or git push fails with 'Bad credentials' / HTTP 401 in a Coder workspace, or when writing AGENTS.md/skill docs that need to explain GitHub auth refresh."
version: "1.0.0"
category: workflow
---

# GitHub Auth in Coder Workspaces

Coder workspaces provision GitHub access via **Coder external auth** (OAuth), not a
long-lived PAT. The token expires (anywhere from ~30 min to a few hours depending on
the template), so `gh` and `git push` intermittently fail with `HTTP 401: Bad
credentials` unless refreshed.

## How it works

Every Coder template in `awesome-infra` (`coder/templates/*/main.tf`) injects a
`ghtoken-refresh` bash function into `~/.bashrc` at workspace build time:

```bash
ghtoken-refresh() {
  local token
  if token=$(coder external-auth access-token github 2>/dev/null) && [ -n "$token" ] && [ "$token" != "null" ]; then
    echo "export GITHUB_TOKEN='$token'" > ~/.github-token-env
    echo "export GH_TOKEN='$token'" >> ~/.github-token-env
    echo "export GITHUB_COPILOT_TOKEN='$token'" >> ~/.github-token-env
    chmod 600 ~/.github-token-env
    source ~/.github-token-env
    echo "✓ GitHub token refreshed"
  fi
}
```

It calls `coder external-auth access-token github` to mint a fresh token, writes it
to `~/.github-token-env` (`GITHUB_TOKEN`, `GH_TOKEN`, `GITHUB_COPILOT_TOKEN`), and
`source`s it into the current shell. `~/.bashrc` also auto-sources
`~/.github-token-env` on every new interactive shell, so already-open terminals pick
up the latest token automatically.

`~/.bashrc` is only sourced for **interactive** shells (`-i`). This is authoritative
in `awesome-infra`'s templates — don't hand-edit `~/.bashrc` in a workspace; fix the
template instead.

## Which pattern to use

The right invocation depends on whether your agent's shell tool **persists state
across calls** (one shell session, `cd`/`export` survive) or spawns a **fresh
non-interactive shell per call**.

### Pattern A — persistent shell (e.g. VS Code chat terminal tool)

Just call it directly before any `gh`/`git push`:

```bash
ghtoken-refresh
git push ...
```

### Pattern B — fresh shell per tool call (e.g. Pi/tmux harnesses)

`~/.bashrc` won't auto-run, and `source` doesn't persist to the next call. Two steps:

```bash
# Once per session — writes ~/.github-token-env
bash -i -c "ghtoken-refresh" 2>/dev/null
```

```bash
# In EVERY subsequent call that uses gh or git push
source ~/.github-token-env && gh pr create ...
source ~/.github-token-env && git push ...
```

If unsure which applies, try Pattern A first; if the token doesn't stick between
calls, fall back to Pattern B.

## Do not

- Run `~/.copilot-token-refresh.sh` directly — it's an unrelated background daemon
  with an infinite loop, not a one-shot refresh.
- Assume the token lasts the whole session — refresh again if a `gh`/`git push`
  call fails after a long gap.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `gh`: `Bad credentials` / `HTTP 401` | Token expired | `ghtoken-refresh` (or Pattern B), then retry |
| Token refreshed but next tool call still fails | Each call is a fresh non-interactive shell | Use Pattern B — `source ~/.github-token-env` in every call |
| `ghtoken-refresh: command not found` | Non-interactive shell, function only in `~/.bashrc` | `bash -i -c "ghtoken-refresh"` |
| Refresh succeeds but `gh` still uses stale token | `GH_TOKEN` was exported earlier in a long-lived shell and shadows the file | `unset GH_TOKEN GITHUB_TOKEN` then re-source |
