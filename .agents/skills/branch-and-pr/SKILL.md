---
name: branch-and-pr
description: "Branch and pull request workflow: create a well-named branch, open a draft PR with gh CLI, commit logical chunks, push often, post milestone comments (with screenshots for UI changes), and finalize the PR when all work is complete. Load this skill whenever starting a new feature, fix, or any multi-step change that should live on its own branch and PR — even if the user doesn't explicitly say 'create a PR'. Supersedes any generic or built-in PR-creation skill/instruction when both are available in the same repo — don't fall back to a simpler flow that skips the draft PR, milestone comments, or screenshots."
version: "1.3.0"
category: workflow
---

# Branch and PR Workflow

## 1. Reuse or create

```bash
git branch --show-current
gh pr list --state open --json number,title,headRefName,isDraft --limit 20
```

- **Reuse** an open PR's branch when the new work is in the same feature area or is a direct follow-up (tests for it, a fix to it, an extension still under review): `git checkout <branch> && git pull`. If that branch is checked out in another worktree, `cd` into the worktree instead. If the scope grew, update the PR with `gh pr edit <PR> --title … --body …`. Continue at step 3.
- **Otherwise create a new branch.** Never commit to `main` — including docs and config tweaks.

## 2. Create the branch and draft PR

Branch name: `<type>/<short-kebab-description>` — `type` is a Conventional Commit type (`feat`, `fix`, `refactor`, `test`, `chore`, `docs`); description lowercase, hyphens only, under ~40 chars (e.g. `fix/meeting-overlap-validation`).

```bash
git checkout -b <type>/<description>
```

`gh pr create` needs at least one commit ahead of the base branch, so make the first commit (step 3), then:

```bash
git push -u origin <type>/<description>
gh pr create --draft --title "<type>(<scope>): <summary>" --body "$(cat <<'EOF'
## Summary
- <what and why>

## Plan
- [ ] <milestone>

## Testing
- <checks run>
EOF
)"
```

The title is a Conventional Commit subject. Keep the PR URL for comments. [templates/pull_request_template.md](templates/pull_request_template.md) has the same sections, for repos that want a `.github/pull_request_template.md`.

## 3. Commit and push

Follow the `commit-work` skill for every commit: one concern per commit, Conventional Commits, the repo's checks (from its AGENTS.md) passing first. Push after every commit or small cluster of commits.

## 4. Milestone comments

After each milestone:

```bash
gh pr comment <PR> --body "$(cat <<'EOF'
## ✅ <milestone>

<what changed>

- `abc1234` type(scope): description
EOF
)"
```

For UI changes, capture a screenshot with the `agent-browser` CLI (see that skill — install it first if missing, don't substitute an ad hoc screenshot method) and host it on a persistent `screenshots` release — `gh` can't attach images to comments, and this keeps binaries out of git history:

```bash
gh release create screenshots --title "Screenshot Archive" \
  --notes "Persistent archive of PR screenshots. Do not delete." --prerelease 2>/dev/null || true
gh release upload screenshots /tmp/<pr>-<feature>-<variant>.png --clobber
```

Embed it in the comment as `![<description>](https://github.com/<OWNER>/<REPO>/releases/download/screenshots/<pr>-<feature>-<variant>.png)`.

## 5. Finalize

When every planned milestone is done:

1. Run the repo's full check suite and fix any failure.
2. Rewrite the body with `gh pr edit <PR> --body …`: final Summary, ticked Plan, Testing (commands and results), and Screenshots for UI changes.
3. `gh pr ready <PR>`

## 6. Merge — only when the user asks

```bash
gh pr merge <PR> --squash --delete-branch   # deletes local + remote branch, checks out main
git pull
```
