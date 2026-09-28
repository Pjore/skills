# skills

A public library of reusable [Agent Skills](https://github.com/getsentry/dotagents) (`SKILL.md`) and other agent harness definitions. Free to use in any repo, by anyone — no dependency on any particular tool required.

## Usage

Skills here are plain `SKILL.md` files under `.agents/skills/<name>/`. Use them however fits your workflow:

- **Copy directly** — `cp -R .agents/skills/<name> your-repo/.agents/skills/`
- **Via [dotagents](https://github.com/getsentry/dotagents)** (opinionated, not required):
  ```bash
  npx @sentry/dotagents add Pjore/skills <name>
  npx @sentry/dotagents add Pjore/skills --all   # add all skills
  ```

Any agent tool that reads `.agents/skills/` (Claude Code, Cursor, Codex, GitHub Copilot, OpenCode, Pi, ...) can use these once installed.

## Skills

| Skill | Description |
|---|---|
| [agent-browser](.agents/skills/agent-browser/SKILL.md) | Browser automation CLI for AI agents — navigate, fill forms, click, screenshot, scrape, test web apps. |
| [agent-tools](.agents/skills/agent-tools/SKILL.md) | Reference guide for the four agent configuration primitives: `AGENTS.md`, `.agents/skills`, `.github/agents`, `.github/hooks`. |
| [branch-and-pr](.agents/skills/branch-and-pr/SKILL.md) | Branch + draft PR workflow: well-named branches, logical commits, milestone PR comments, finalize when done. |
| [clean-architecture-dry](.agents/skills/clean-architecture-dry/SKILL.md) | Clean Architecture and DRY principles for module boundaries, service/repository abstractions, and duplication review. |
| [coder-github-auth](.agents/skills/coder-github-auth/SKILL.md) | GitHub CLI/git auth inside Coder workspaces via `ghtoken-refresh` — fixes `Bad credentials` / HTTP 401. |
| [commit-work](.agents/skills/commit-work/SKILL.md) | High-quality git commits: staging, splitting logical chunks, Conventional Commit messages. |
| [credential-security](.agents/skills/credential-security/SKILL.md) | Enforce secure handling of gitignored `.env` credentials — never read directly, always redact. |
| [frontend-design](.agents/skills/frontend-design/SKILL.md) | Distinctive, production-grade frontend UI generation that avoids generic AI aesthetics. Sourced from [anthropics/skills](https://github.com/anthropics/skills), retains its original Apache-2.0 license (see `LICENSE.txt` in that skill's directory). |
| [pi-harness](.agents/skills/pi-harness/SKILL.md) | Operate and troubleshoot the Agent Pi harness in Coder workspaces (tmux session, provider config, `/login`). |

## Devcontainer

`.devcontainer/devcontainer.json` gives a ready dev environment for editing skills here. It only runs [dotagents](https://github.com/getsentry/dotagents) as a convenience — installing on create and syncing on start — dotagents is a preference for maintaining this repo, not a requirement for consuming it.

## License

MIT (see `LICENSE`), except `frontend-design/`, which retains its original Apache-2.0 license from [anthropics/skills](https://github.com/anthropics/skills).

## Contributing

Conventional Commits, branch + PR workflow (see [branch-and-pr](.agents/skills/branch-and-pr/SKILL.md)).
