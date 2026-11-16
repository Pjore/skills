---
name: agent-tools
description: Guide to choosing, authoring, and maintaining agent harness features—AGENTS.md, custom instructions, Agent Skills, custom agents, and hooks. Use when creating, finding, auditing, or consolidating agent configuration across tools.
---

# Agent Harness Features

Choose the smallest supported configuration feature for the behavior you need. Before editing, identify the target agent and check the repository's existing instructions and conventions.

## Choose a feature

| Feature | Use it for | Typical location |
|---|---|---|
| Repository instructions | Shared context and rules that apply broadly | `AGENTS.md` |
| Custom instructions | Tool-specific rules, optionally scoped by file patterns | `.github/instructions/*.instructions.md` |
| Agent Skills | On-demand workflows and domain knowledge, optionally with resources | `.agents/skills/<name>/SKILL.md` |
| Custom agents | A selectable or delegated agent with a distinct role and toolset | `.github/agents/<name>.agent.md` |
| Hooks | Deterministic commands tied to supported agent lifecycle events | `.github/hooks/*.json` |

Use the target tool's documented format and supported locations; feature support and loading behavior vary by tool.

## Author and maintain

- Keep always-relevant, project-specific facts concise in repository instructions. Put task-specific procedures in a Skill, and deterministic automation in a hook.
- Use custom instructions when a tool needs instructions scoped to files or folders. Don't copy a shared rule into multiple instruction files.
- Make Skills discoverable with a description that says what the skill does and when to load it. Keep detailed references in its folder and validate against the [Agent Skills specification](https://agentskills.io/specification). See [references/SKILL-FORMAT.md](references/SKILL-FORMAT.md).
- Keep `AGENTS.md` accurate, scoped, and free of onboarding filler. See [references/AGENTS-FORMAT.md](references/AGENTS-FORMAT.md).
- Keep custom-agent descriptions and tool permissions aligned with their actual role and supported schema.
- Keep hooks small, bounded, and safe to rerun. Verify event names and failure behavior against the target tool's documentation, then test the command independently.
- Prefer one source of truth per rule. When auditing, verify file paths, commands, schemas, and tool support instead of trusting stale prose.
- For dotagents-managed dependencies, update `agents.toml` and use dotagents to install or refresh them; don't edit generated lockfiles or managed copies directly.
