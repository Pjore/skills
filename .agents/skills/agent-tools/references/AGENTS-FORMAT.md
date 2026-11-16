# Repository Instructions Format

`AGENTS.md` provides repository or directory scoped guidance to agent tools that support it. Check the target tool's documentation for supported paths, inheritance, and precedence before relying on a file being loaded.

## Scope and content

- Put repository-wide guidance in the root `AGENTS.md`.
- Add a nested `AGENTS.md` only for rules that apply to that directory and its descendants.
- State project-specific facts the agent cannot infer: architecture boundaries, required commands, conventions, and operational constraints.
- Keep always-loaded guidance concise. Move task-specific multi-step procedures to a Skill.
- Use file-pattern-specific instruction files when the tool supports them and only part of the repository needs the guidance.
- Keep domain vocabulary separate from operational instructions when the repository has a glossary or context document.

## Maintenance

- Keep one source of truth for each rule; link to a canonical document instead of copying its content.
- Verify commands, paths, and constraints against the repository before publishing changes.
- Remove stale, generic, or contradictory guidance. Do not retain historical notes about how instructions used to work.
- Treat `CLAUDE.md`, `.cursorrules`, and `.github/copilot-instructions.md` as tool-specific instruction formats. Avoid maintaining parallel copies unless the target tools require them.
- Check the supported behavior of every target agent. Do not assume all agents load `AGENTS.md` or resolve nested files identically.
