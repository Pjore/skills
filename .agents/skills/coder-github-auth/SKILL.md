---
name: coder-github-auth
description: "GitHub CLI/git authentication inside Coder workspaces via the ghtoken-refresh bash function — how the token lifecycle works, and the two invocation patterns depending on whether your agent's shell persists across tool calls. Use when gh or git push fails with 'Bad credentials' / HTTP 401 in a Coder workspace, or when writing AGENTS.md/skill docs that need to explain GitHub auth refresh."
version: "1.0.0"
category: workflow
---

# GitHub Auth in Coder Workspaces

Coder workspaces provision GitHub access via **Coder external auth** (OAuth), not a
long-lived PAT. The token expires (~30 min to a few hours), so `gh` and `git push`
intermittently fail with `HTTP 401: Bad credentials` unless refreshed.

## How it works

Coder templates that use external auth (in `awesome-infra`: `copilot-cli`, `copilot-mux`,
`squad`, `squad-acp`, `tmux-copilot-cli`, `tmux-pi`) define a `ghtoken-refresh` bash
function in `~/.bashrc`. Check with `bash -ic 'type ghtoken-refresh'`.

It runs `coder external-auth access-token github`, writes the token to
`~/.github-token-env` (`GITHUB_TOKEN`, `GH_TOKEN`, `GITHUB_COPILOT_TOKEN`), and
`source`s it. New interactive shells auto-source `~/.github-token-env`. Change this
behavior in the template, not in a workspace's `~/.bashrc`.

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
calls, use Pattern B.

## Rules

- Never run `~/.copilot-token-refresh.sh` — it's a background daemon with an infinite
  loop, not a one-shot refresh.
- Refresh again whenever a `gh`/`git push` call returns 401 after a long gap.
- If `gh` still sends a stale token after refreshing, an earlier `export GH_TOKEN` in
  the same long-lived shell shadows it: `unset GH_TOKEN GITHUB_TOKEN`, then re-source.
