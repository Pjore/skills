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
| [agent-browser](.agents/skills/agent-browser/SKILL.md) | Browser automation, human-assisted login with private live QR viewing, and scoped browser-to-loopback handoff. |
| [agent-tools](.agents/skills/agent-tools/SKILL.md) | Guide to choosing, authoring, and maintaining repository guidance in root or nested `AGENTS.md` files and Agent Skills. |
| [branch-and-pr](.agents/skills/branch-and-pr/SKILL.md) | Repository-first single and stacked PR workflows, with reviewable phases, base-safe worktree isolation, and GitHub CLI auth. |
| [clean-architecture-dry](.agents/skills/clean-architecture-dry/SKILL.md) | Clean Architecture and DRY principles for module boundaries, service/repository abstractions, and duplication review. |
| [coder-github-auth](.agents/skills/coder-github-auth/SKILL.md) | GitHub CLI/git auth inside Coder workspaces via `ghtoken-refresh` — fixes `Bad credentials` / HTTP 401. |
| [commit-work](.agents/skills/commit-work/SKILL.md) | High-quality git commits: staging, splitting logical chunks, Conventional Commit messages. |
| [credential-security](.agents/skills/credential-security/SKILL.md) | Enforce secure handling of gitignored `.env` credentials — source through the loader and never expose secret values. |
| [document-generation](.agents/skills/document-generation/SKILL.md) | Generate and validate DOCX, PDF, and spreadsheet documents with formatting-conscious helpers. |
| [frontend-design](.agents/skills/frontend-design/SKILL.md) | Distinctive, production-grade frontend UI generation that avoids generic AI aesthetics. Sourced from [anthropics/skills](https://github.com/anthropics/skills), retains its original Apache-2.0 license (see `LICENSE.txt` in that skill's directory). |
| [grilling](.agents/skills/grilling/SKILL.md) | Relentlessly stress-test plans and ideas through a decision tree, asking only questions whose prerequisites are settled. |
| [pi-harness](.agents/skills/pi-harness/SKILL.md) | Operate and troubleshoot the Agent Pi harness in Coder workspaces (tmux session, provider config, `/login`). |

## Devcontainer

`.devcontainer/devcontainer.json` gives a ready dev environment for editing skills here. It only runs [dotagents](https://github.com/getsentry/dotagents) as a convenience — installing on create and syncing on start — dotagents is a preference for maintaining this repo, not a requirement for consuming it.

## License

MIT (see `LICENSE`), except `frontend-design/`, which retains its original Apache-2.0 license from [anthropics/skills](https://github.com/anthropics/skills).

## Contributing

Conventional Commits, branch + PR workflow (see [branch-and-pr](.agents/skills/branch-and-pr/SKILL.md)).
