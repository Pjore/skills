---
name: agent-tools
description: Guide to choosing, authoring, and maintaining repository guidance in root or nested AGENTS.md files and Agent Skills. Use when deciding where guidance belongs or editing or auditing either.
---

# AGENTS.md and Skills

Use root or nested `AGENTS.md` files for repository guidance that applies consistently, and Skills for task-specific workflows and domain knowledge. Before editing, read the root `AGENTS.md`, applicable nested files, and relevant Skills.

## Choose where guidance belongs

| File | Use it for | Typical location |
|---|---|---|
| `AGENTS.md` | Facts and conventions that apply throughout a repository subtree | Root `AGENTS.md` or nested `<directory>/AGENTS.md` |
| Agent Skill | On-demand workflows and domain knowledge, optionally with resources | `.agents/skills/<name>/SKILL.md` |

## Maintain

- Put concise, always-relevant repository facts in the root `AGENTS.md`; use nested files only for guidance scoped to that directory and its descendants. See [references/AGENTS-FORMAT.md](references/AGENTS-FORMAT.md).
- Put task-specific workflows and domain knowledge in a Skill. Make its description clear about what it covers and when to use it; keep detailed references in its folder and validate against the [Agent Skills specification](https://agentskills.io/specification). See [references/SKILL-FORMAT.md](references/SKILL-FORMAT.md).
- Keep one source of truth per rule. Verify paths, commands, and links against the repository instead of trusting stale prose.
- For dotagents-managed Skill dependencies, update `agents.toml` and use dotagents to install or refresh them; don't edit generated lockfiles or managed copies directly.
