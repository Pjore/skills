# skills — Agent Instructions

Public library of reusable Agent Skills (`SKILL.md`). See [README.md](README.md) for what's here and how consumers use it.

## Working in this repo

Skills live at `.agents/skills/<name>/SKILL.md` and are edited directly — no build step.

`agents.toml` only declares this repo's *external* dependencies (`dotagents`, `grilling`, `domain-modeling`). The skills this repo publishes need no `[[skills]]` entry: they already sit at their canonical path, which copilot/pi discover natively.

Refresh managed skills before starting work:

```bash
npx @sentry/dotagents@latest --project install
```

(the npm package is `@sentry/dotagents`; an unrelated package literally named `dotagents` also exists — don't use it.)

## Adding or editing a skill

1. Add/edit `.agents/skills/<name>/SKILL.md` (see the `agent-tools` skill here for `SKILL.md` format rules).
2. Add a row to the table in `README.md`.
3. Do **not** add a `[[skills]]` entry to `agents.toml` for it.

## Conventions

- Conventional Commits — `type(scope): message`
- Branch + PR — never commit to `main` directly (see the `branch-and-pr` skill)
