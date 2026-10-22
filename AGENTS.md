# skills — Agent Instructions

Public library of reusable Agent Skills (`SKILL.md`). See [README.md](README.md) for what's here and how consumers use it.

## Working in this repo

Skills live at `.agents/skills/<name>/SKILL.md` and are edited directly — no build step. Follow the `agent-tools` skill for format and size rules.

`agents.toml` declares only external dependencies; skills published from this repo need no `[[skills]]` entry. Use installed skills as-is; install or refresh only on explicit request, not at Session start. When requested:

```bash
npx @sentry/dotagents@latest --project install   # not the unrelated npm package `dotagents`
```

## Adding or editing a skill

1. Add/edit `.agents/skills/<name>/SKILL.md`.
2. Keep its row in the `README.md` table in sync.
3. Skills are consumed by other repos: keep them generic — reference the consuming repo's AGENTS.md for project commands instead of hardcoding them.

## Conventions

- Conventional Commits — `type(scope): message`
- Branch + PR — never commit to `main` directly. Before the first commit, load `branch-and-pr`
	as the single PR workflow; do not also execute a generic PR-creation procedure. Repository
	requirements constrain skills and broader Home/workspace defaults.
