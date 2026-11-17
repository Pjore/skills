# Agent Skill Format

An Agent Skill is a folder with a required `SKILL.md` and optional `scripts/`, `references/`, and `assets/`. The `name` and `description` metadata drive discovery; keep the skill focused and make its trigger explicit.

## Choose AGENTS.md or a Skill

| Use `AGENTS.md` for | Use a Skill for |
|---|---|
| Rules that should always apply within the repository or a directory subtree | Task-specific workflows and domain knowledge |
| Architecture boundaries, coding conventions, persistent constraints | Procedures, reference summaries, templates, scripts, and examples |

Prefer the root or applicable nested `AGENTS.md` for facts that should always apply. Use Skills for detailed guidance needed only for relevant work.

## Frontmatter

```yaml
---
name: kebab-case-name
description: What it does and when to use it, with concrete trigger phrases.
---
```

- `name` must be lowercase, use hyphens, be at most 64 characters, and match the skill directory.
- `description` must say what the skill does and when to use it; include user-facing trigger terms and keep it within the specification's limit.
- Include only metadata supported by the Agent Skills specification and target tools.

## Write useful Skill content

- Start with actionable guidance for the agent, not onboarding prose.
- Keep the Skill focused. Use imperative, concrete steps where order matters; use concise decision rules where judgment is expected.
- Put long or rarely needed details in linked `references/`. Bundle scripts only for repeated, complex, or reliability-critical work.
- Use relative links to bundled resources and check that every target exists.
- Avoid duplicating the description, explaining basics, history, and hardcoded project commands in a reusable Skill. Point to the consuming repository's `AGENTS.md` for its commands.
- Keep the body under 150 lines and 1,500 words where practical; split overflow into references.

## Audit and validate

- Check the description can distinguish this Skill from other installed Skills.
- Verify frontmatter, links, scripts, and examples; check that bundled commands are safe and usable.
- Validate the skill directory with `skills-ref validate <skill-directory>` and follow the current [Agent Skills specification](https://agentskills.io/specification).
- When auditing existing skills, correct stale guidance and broken links rather than documenting their history.

## Progressive disclosure

1. **Metadata:** name and description support discovery.
2. **Skill content:** load `SKILL.md` when the skill is relevant.
3. **Resources:** load references as needed; execute scripts only when the workflow calls for them.

Keep the main file concise so agents can install multiple Skills without paying the full context cost for every Skill.

## References

- [Agent Skills specification](https://agentskills.io/specification)
- [VS Code Agent Skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)
- [GitHub Copilot Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
