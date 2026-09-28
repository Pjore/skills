---
name: branch-and-pr
description: "Branch and pull request workflow: create a well-named branch, open a draft PR with gh CLI, commit logical chunks, push often, post milestone comments (with screenshots for UI changes), and finalize the PR when all work is complete. Load this skill whenever starting a new feature, fix, or any multi-step change that should live on its own branch and PR — even if the user doesn't explicitly say 'create a PR'."
version: "1.1.0"
category: workflow
---

# Branch and PR Workflow

This skill covers the full lifecycle of a change from the first branch to a merged-ready PR.

## Why this matters

A well-structured branch + PR makes review fast, provides a living record of progress, and gives the team visual confirmation that UI changes look right. The goal is incremental transparency: open the PR early so the work is visible, post updates as milestones land, and finalize only when everything is done.

---

## Phase 0 — Check for an existing branch and PR

Before creating a new branch, check whether there is already an active (open or draft) PR whose scope is relevant to the planned work. Reusing an existing branch keeps related changes together and avoids PR sprawl.

### 1. List open PRs

```bash
gh pr list --state open --json number,title,headRefName,isDraft --limit 20
```

### 2. Decide: reuse or create new

Evaluate each open PR against the planned work:

| Condition | Action |
|-----------|--------|
| An open/draft PR covers the **same feature area, component, or issue** as the new work | **Reuse it** — switch to that branch and continue working there |
| The new work is a **closely related follow-up** (e.g., adding tests for code in an open PR, fixing a bug introduced by an open PR, extending a feature still under review) | **Reuse it** |
| The new work is **unrelated** or touches a **different domain/feature** | **Create a new branch and PR** (proceed to Phase 1) |

Use your judgement: if the new commits would make sense to a reviewer reading the existing PR, reuse it. If they would confuse the PR's narrative or bloat its scope beyond reason, create a new one.

### 3. Reuse an existing branch

If reusing, switch to the existing branch and make sure it's up to date:

```bash
git checkout <existing-branch>
git pull
```

> **Worktree conflict:** If the branch is already checked out in a worktree,
> `git checkout` will fail with `'<branch>' is already used by worktree at '<path>'`.
> In that case, work directly inside the existing worktree directory instead:
> ```bash
> cd /path/to/worktree
> git pull
> ```

Then skip Phase 1 and Phase 2 — go directly to **Phase 3 (Commit in logical chunks)**.

If the existing PR description needs updating to reflect the expanded scope, update it:

```bash
gh pr edit <PR-number> --title "<updated title>" --body "$(cat <<'EOF'
<updated body reflecting new scope>
EOF
)"
```

---

## Phase 1 — Create the branch

> **Skip this phase if you are reusing an existing branch from Phase 0.**

**Never commit directly to `main`.** All changes — including small fixes, docs updates, and config tweaks — must go through a feature branch and pull request.

Branch names encode the type and intent of the change. Derive the name from the planned work:

```
<type>/<short-kebab-description>
```

Types mirror Conventional Commit types: `feat`, `fix`, `refactor`, `test`, `chore`, `docs`.

**Examples:**
- `feat/parent-availability-export`
- `fix/meeting-overlap-validation`
- `refactor/season-data-model`
- `docs/api-endpoint-reference`

Rules:
- All lowercase, hyphens only (no slashes in the description part, no underscores)
- Keep descriptions under ~40 characters
- Be specific enough that a reviewer knows what the branch is about at a glance

```bash
git checkout -b feat/your-feature-name
```

Push immediately so the branch exists on the remote before the PR is opened:

```bash
git push -u origin feat/your-feature-name
```

---

## Phase 2 — Open a draft PR

> **Skip this phase if you are reusing an existing PR from Phase 0.**

Open the PR as a **draft** right after pushing the branch — before any real code lands. This makes the work visible early and allows for early feedback.

Use `gh pr create` with `--draft`:

```bash
gh pr create \
  --draft \
  --title "<Conventional Commit style title>" \
  --body "$(cat <<'EOF'
## Summary

<!-- 1-3 bullet points describing what this PR does and why -->

## Planned changes

<!-- List the phases/milestones you plan to complete, e.g.:
- [ ] Phase 1: Add Zod schema for export format
- [ ] Phase 2: Implement API endpoint
- [ ] Phase 3: Build UI export button
- [ ] Phase 4: Add tests
-->

## Screenshots

<!-- Added as milestones complete — leave blank until then -->
EOF
)"
```

**PR title format**: matches a Conventional Commit subject line.
- `feat(ui): add availability export to parent dashboard`
- `fix(api): correct meeting overlap validation logic`

Capture the PR URL printed by `gh pr create` — you'll need it for comments.

> **`.github/pull_request_template.md`**: repos that want GitHub to prefill a
> default body for PRs opened via the web UI (or `gh pr create` without
> `--body`) should use [templates/pull_request_template.md](templates/pull_request_template.md)
> as that file's content. It's a static fallback — always prefer the dynamic
> `--body` heredoc above when the agent opens the PR, since it can describe
> planned phases specific to the work.

---

## Phase 3 — Commit in logical chunks

As you work, commit after each logical unit. Load the `commit-work` skill before making commits to follow the full commit workflow.

Key rules:
- One concern per commit (type first, then implementation, then tests)
- Commit messages use Conventional Commits: `type(scope): description`
- Run `pnpm typecheck && pnpm lint && pnpm test` before each commit
- If a commit message needs "and" to describe it, consider splitting

---

## Phase 4 — Push often

Push after every commit or small cluster of related commits. This keeps the remote branch current and the PR diff visible to reviewers.

```bash
git push
```

---

## Phase 5 — Post milestone comments with screenshots

After completing a phase of work, post a PR comment with a summary and screenshot (for UI changes). This creates a visible record of progress and gives reviewers early context.

### Posting a milestone comment

For non-UI phases (backend, refactoring, tests):

```bash
gh pr comment <PR-number-or-URL> --body "$(cat <<'EOF'
## ✅ Phase N complete: <phase title>

<description of what was implemented>

**Commits in this phase:**
- `abc1234` type(scope): description
EOF
)"
```

For UI phases or change affecting UI, include a screenshot:

1. Capture the screenshot using whatever browser automation tool is available in the environment (e.g. the `agent-browser` CLI — load the `agent-browser` skill for usage details, port detection, and troubleshooting). Save it locally, e.g. `/tmp/<pr-number>-<feature>-<variant>.png`.

2. Upload it to the persistent `screenshots` GitHub release — this keeps binary files out of the branch/git history entirely:

   ```bash
   # Ensure the release exists (safe to run every time)
   gh release create screenshots \
     --title "Screenshot Archive" \
     --notes "Persistent archive of PR screenshots. Do not delete." \
     --prerelease 2>/dev/null || true

   # Upload (--clobber overwrites if a same-named asset already exists)
   gh release upload screenshots /tmp/<pr-number>-<feature>-<variant>.png --clobber
   ```

   Asset URL is predictable — no extra lookup needed:
   ```
   https://github.com/<OWNER>/<REPO>/releases/download/screenshots/<pr-number>-<feature>-<variant>.png
   ```

3. Embed the screenshot in the PR comment using the release asset URL:
   ```bash
   gh pr comment <PR-number-or-URL> --body "$(cat <<'EOF'
## ✅ Phase N complete: <phase title>

<description of what changed visually>

![Screenshot description](https://github.com/<OWNER>/<REPO>/releases/download/screenshots/<pr-number>-<feature>-<variant>.png)

**Commits in this phase:**
- `abc1234` feat(ui): description
EOF
   )"
   ```

Screenshot naming convention: `<pr-number>-<feature>-<page>-<variant>.png`

> **Why not other approaches?**
> - `gh pr comment` has no `--attach` or image upload flag
> - Base64 inline images (`data:image/png;base64,...`) are stripped by GitHub's sanitizer
> - The `uploads.github.com` endpoint used by the web UI drag-and-drop requires browser session cookies, not API tokens
> - Committing screenshots into the branch (or via the Contents API) bloats git history with binaries that never shrink; the `screenshots` release keeps them out of `main` entirely

---

## Phase 6 — Finalize the PR

When **all** planned phases/milestones/features are complete:

### 1. Mark ready for review

```bash
gh pr ready <PR-number-or-URL>
```

### 2. Update the PR description

Rewrite the PR body to be accurate and complete. Replace the draft planning notes with a final summary. For UI changes, embed screenshots using the release asset URL pattern (uploaded to the `screenshots` release in Phase 5):

```bash
gh pr edit <PR-number-or-URL> --body "$(cat <<'EOF'
## Summary

<!-- Accurate 1-3 bullet summary of what this PR does -->

## Changes

<!-- Concise list of what was changed and why -->

## Screenshots

<!-- For UI changes: embed screenshots using release asset URLs -->
![Description](https://github.com/<OWNER>/<REPO>/releases/download/screenshots/<pr-number>-<feature>-<variant>.png)

## Testing

<!-- How was this tested? e.g., "Unit tests added for all new components. Manual verification via browser." -->
EOF
)"
```

### 3. Final checks before requesting review

Run the full validation suite:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

All checks must pass. If any fail, fix them before marking ready.

### 4. Post a final summary comment

```bash
gh pr comment <PR-number-or-URL> --body "$(cat <<'EOF'
## PR ready for review

All planned phases complete. Summary of changes:
- <bullet 1>
- <bullet 2>

Tests: passing. Typecheck: passing. Lint: passing.
EOF
)"
```

---

## Phase 7 — Merge the PR

**Only merge when the user explicitly requests it.**

Always squash merge using the `gh` CLI to produce a single clean commit on `main`:

```bash
gh pr merge <PR-number-or-URL> --squash
```

After merging, switch to `main`, pull to sync, and delete the local feature branch:

```bash
git checkout main && git pull
git branch -d <branch-name>
```

If the branch has already been deleted on the remote (GitHub deletes it automatically when "Delete branch" is enabled), `-d` is sufficient. Use `-D` only if git refuses and you are certain the branch is fully merged.

---

## Quick reference checklist

- [ ] Checked for existing open/draft PRs that cover the same area
- [ ] Reused existing branch+PR if relevant, OR created new branch with `<type>/<description>` naming
- [ ] Branch pushed and draft PR opened (if new)
- [ ] Commits are small, focused, and use Conventional Commits
- [ ] Push after every commit
- [ ] Milestone comment posted after each phase completes
- [ ] UI phases include a screenshot in the comment, uploaded to the `screenshots` release
- [ ] All phases done: `gh pr ready`, PR description updated, final checks pass
- [ ] Merge only when user requests: `gh pr merge <number> --squash`
- [ ] After merge: `git checkout main && git pull && git branch -d <branch-name>`
