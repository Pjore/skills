---
name: agent-tools
description: Reference guide for the four agent configuration primitives — AGENTS.md, .agents/skills, .github/agents, and .github/hooks — plus the rules for writing them well. Use when creating, locating, evolving, or auditing any agent configuration file (AGENTS.md, CLAUDE.md, .github/copilot-instructions.md, SKILL.md), or when an agent needs to understand how these tools are defined, triggered, and maintained.
---

# Agent Tools

Reference for the four agent configuration primitives, and the rules for writing each well. Both artifacts exist to change agent behavior with as few tokens as possible — everything written here competes for space in the same context window as the code itself, so treat every line as a cost, not a courtesy.

---

## AGENTS.md

**Purpose:** Primary AI system prompt for a repository. Replaces `copilot-instructions.md` as the source of truth.

**Paths:**
- Root `AGENTS.md` — applies to the entire repo
- Nested `<subdir>/AGENTS.md` — applies to agents scoped to that directory

**Content:** Purpose, tech stack, conventions, commands, security rules.

**Trigger:** Loaded automatically at session start.

**Maintain:** Edit `AGENTS.md` directly. Keep it concise — it is loaded on every session. See [references/AGENTS-FORMAT.md](references/AGENTS-FORMAT.md) for structure, monorepo nesting, and anti-patterns to catch when auditing.

---

## `.agents/skills`

**Purpose:** Self-contained knowledge modules that extend agent capabilities for specific domains or workflows.

**Path:** `.agents/skills/<skill-name>/SKILL.md` — follows the [agentskills.io](https://agentskills.io/specification) specification.

**Structure:**
```
skill-name/
├── SKILL.md       # required: frontmatter + instructions
├── scripts/       # optional: executable scripts
├── references/    # optional: detailed docs
└── assets/        # optional: templates, data
```

**SKILL.md frontmatter:**
```yaml
---
name: skill-name          # lowercase, hyphens only, matches directory name
description: What it does and when to use it.
---
```

**Trigger:** Agent matches task intent to the `description` field and loads the full skill body.

**Maintain:** Keep the body 200–1500 words and under 150 lines; move detail to `references/`. Update `description` when scope changes. See [references/SKILL-FORMAT.md](references/SKILL-FORMAT.md) for writing the `description`, body conventions, and anti-patterns to catch when auditing.

**Don't register in-place skills in `agents.toml`.** A skill already committed at `.agents/skills/<name>/SKILL.md` needs no `[[skills]]` `path:` entry — copilot/pi discover it natively at that path regardless, and dotagents' per-tool symlink (Claude, Cursor) is driven by the `agents` array, not by which skills are declared. Only declare a skill in `agents.toml` when its source is *external* (a different repo) and needs fetching/pinning.

---

## Writing either well

- **Only state what the agent couldn't infer.** Don't explain what a `.gitignore` is or that tests should pass. State the project's specific, non-obvious facts: the actual test command, the actual lint config, the actual branch convention.
- **Write for the reader, not for humans.** No onboarding tone, no encouragement, no filler transitions. A checklist beats a paragraph.
- **Keep it current or delete it.** An instruction that lies is worse than no instruction — the agent will follow it and fail. When auditing, verify claims against the repo (run the stated command, check the referenced path exists) rather than trusting the prose.
- **Edit inline, immediately**, the moment you spot a stale or wrong instruction — don't batch fixes for later, and don't just propose them: fix them and note what you changed.
- **Never write void/negative statements** ("there is no X", "don't look for Y, it doesn't exist") to patch over an agent's past confusion. Every session starts from a clean slate — the agent has no memory of that confusion, so the disclaimer is pure token cost with no reader who needs it. If a stale reference caused the confusion, find and fix or remove that reference instead of adding a warning about it.
- **Bundled scripts live under the skill's own `scripts/` directory** (`.agents/skills/<name>/scripts/`), never elsewhere. Only bundle a script when the logic is complex, reused often, or needs deterministic reliability — a one-off two-command sequence belongs inline in the body, not as a script.
- **Keep every file 200–1500 words and under 150 lines**, excluding frontmatter. Below 200 there's usually not enough to justify a separate file; above 1500 words or 150 lines it belongs in a linked reference instead of the main body.

### AGENTS.md vs. a Skill

Put it in **AGENTS.md** when it's always true and cheap to state: build/test commands, directory layout, style conventions, do-not-touch paths. Put it in a **Skill** when it's a situational, multi-step workflow that shouldn't load unless relevant — its `description` is the trigger, its body is only paid for when invoked. If a paragraph in AGENTS.md only matters for one kind of task, it's a Skill candidate, not a permanent cost every turn pays.

### Not the domain glossary

`AGENTS.md`/Skills are operational: commands, workflow, conventions. A project's `CONTEXT.md` (see the `domain-modeling` skill) is purely a vocabulary glossary with zero implementation detail. Never let domain terminology leak into AGENTS.md, and never let build commands leak into CONTEXT.md.

### Legacy formats

`CLAUDE.md`, `.cursorrules`, `.github/copilot-instructions.md` are vendor-specific predecessors of the same idea. Prefer `AGENTS.md` for new projects; when one of these already exists, apply the same rules to it rather than forking content across files.

---

## `.github/agents`

**Purpose:** Custom agent mode definitions — distinct persona, toolset, and constraints for a specialized agent.

**Path:** `.github/agents/<name>.agent.md`

**Format:**
```yaml
---
name: "Agent Name"
description: "When to invoke this agent."
tools: ["read", "edit/editFiles", "execute"]
model: Claude Opus 4.7 (copilot)
---
```
Body: purpose, constraints, step-by-step behavior.

**Trigger:** User selects the agent mode, or a parent agent delegates to a sub-agent by name.

**Maintain:** Update `tools` when capabilities change. Adopt body when process evolves. Keep description accurate for discoverability.

---

## `.github/hooks`

**Purpose:** Deterministic shell commands that run automatically at agent lifecycle events — outside the LLM, always reliable.

**Path:** `.github/hooks/<name>.json`

**Format:**
```json
{
  "version": 1,
  "hooks": {
    "postToolUse": [{ "type": "command", "bash": "npx prettier --write .", "timeoutSec": 30 }]
  }
}
```

**Key events:** `sessionStart`, `preToolUse`, `postToolUse`, `agentStop`, `userPromptSubmitted`, `sessionEnd`

**Trigger:** Fires automatically at the matching lifecycle event. Non-zero exit blocks the action.

**Maintain:** Test scripts manually before committing. Keep hooks fast. Bundle scripts next to `hooks.json`.
