# AGENTS.md Format

Use `AGENTS.md` for concise guidance that applies across a repository or a directory subtree.

## Scope and content

- Put repository-wide guidance in the root `AGENTS.md`.
- Add a nested `AGENTS.md` only for rules that apply to that directory and its descendants.
- State project-specific facts the agent cannot infer: architecture boundaries, required commands, conventions, and operational constraints.
- Keep always-loaded guidance concise. Move task-specific multi-step procedures to a Skill.
- Keep domain vocabulary separate from operational guidance when the repository has a glossary or context document.

## Maintenance

- Keep one source of truth for each rule; link to a canonical document instead of copying its content.
- Verify commands, paths, and constraints against the repository before publishing changes.
- Remove stale, generic, or contradictory guidance.
- Keep root and nested files aligned so narrower guidance supplements rather than contradicts repository-wide guidance.
