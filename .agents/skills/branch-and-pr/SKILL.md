---
name: branch-and-pr
description: "Repository-selected branch and PR workflow, with a documentation-only fast path. Load before the first commit for features, fixes, plans, docs, or other changes requiring a branch and PR, even without an explicit 'create a PR' request. Replaces overlapping generic PR procedures, subject to the target repository's requirements."
version: "1.6.0"
category: workflow
---

# Branch and PR Workflow

## 0. Resolve guidance and choose a path

Resolve the target first: an explicit PR URL or Task repository outranks editor context,
terminal CWD, and previous work. Confirm the checkout remote, active branch, worktrees, and
any related PR. Use explicit `--repo OWNER/REPO` for GitHub commands until confirmed.

- On `main`, always create a new branch from target base. Otherwise ask whether to use the
  active branch/PR or create a new branch. State the branch/PR context, wait before acting,
  and don't infer the choice from task similarity, worktree state, or an existing PR.

Read applicable Home/workspace instructions, then the target repository's root and nested
`AGENTS.md`. Use the repository-selected PR workflow before the first commit; if it selects
this skill, use this procedure alone, not a second generic PR flow. Repository requirements
constrain broader defaults and every path below. Use installed skills; dotagents installation
or refresh is on explicit request only. Report a missing required skill instead of installing it.

Classify the actual diff, not file extensions:

- **Documentation-only:** solely non-executable prose, such as plans or glossary updates.
- **Implementation:** code, configuration, dependencies, generated/runtime inputs, executable
  examples, behavioral agent instructions (`AGENTS.md`, `SKILL.md`, prompts or operational
  references), mixed changes, or uncertainty about runtime effects.

For documentation-only changes, use step 1, the branch naming in step 2, step 3, then the
documentation-only path below. Otherwise follow steps 1–6. Reclassify if scope grows.

Choose verification by risk, not a mandatory full local suite:

| Diff | Local verification | Before merge |
|------|--------------------|--------------|
| Version-only conflict | Diff, package syntax and version | Applicable package CI |
| Local behavior or behavioral instructions | Focused tests and relevant build/lint | Applicable required CI |
| Shared contracts, dependencies, runtime or CI | Affected integration suites and builds | Full affected CI |

Repository-required local checks override this table. Reuse prior results only for unchanged
inputs. Do not duplicate full local and CI suites without a concrete risk or unavailable CI.
Inspect documented prerequisites before installing dependencies; never treat setup failures
as known baseline failures without evidence. After each change, run the smallest useful check.

## Documentation-only path

- Review the full diff and local links; run `git diff --check`, documentation lint, and required
  checks. For prose, do not install app dependencies or run runtime suites.
- Stage only intended files through `commit-work`; prefer one scoped commit.
- Push and open a ready PR with Summary and Testing. Reuse an existing PR without resetting its
  review state; mark drafts ready only when complete.
- Required CI, reviews, and branch protections still apply. Merge only through step 6.

## 1. Apply the branch choice

```bash
git branch --show-current
git worktree list
gh pr list --state open --json number,title,headRefName,isDraft --limit 20
```

- Follow the branch decision from step 0; never silently reuse a related branch.
- If the operator chose the active branch, verify the repository and target; update its PR
  when applicable without switching branches.
- If the operator chose a new branch, fetch from the target base (default `main`), not
  active `HEAD`. For dirty or unrelated worktrees, use a sibling worktree from that base,
  transfer only intended changes, and leave the original untouched.

## 2. Create the branch and draft PR

Branch name: `<type>/<short-kebab-description>` — `type` is a Conventional Commit type (`feat`, `fix`, `refactor`, `test`, `chore`, `docs`); description lowercase, hyphens only, under ~40 chars (e.g. `fix/meeting-overlap-validation`).

When creating a new branch, branch from the fetched target base, never the active branch:

```bash
BASE=main
BRANCH=docs/short-description
git fetch origin "$BASE"
git switch -c "$BRANCH" "origin/$BASE"
```

`gh pr create` needs at least one commit ahead of the base branch, so make the first
commit (step 3), then:

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

Follow the `commit-work` skill for every commit: one concern per commit, Conventional Commits, explicit staging, and the chosen path's checks plus repository-required checks passing first. Push after every commit or small cluster of commits.

## 4. Milestone comments

After a meaningful milestone requiring a reviewer update; do not post intermediate comments
or repeatedly rewrite the body for a small, single-step change:

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

1. Run the selected verification and repository-required checks. Fix failures caused by this change; report unrelated blockers without repeatedly reproducing them. Do not rerun an equivalent full suite solely because this is finalization. Leave the PR draft while required checks remain unresolved.
2. Rewrite the body with `gh pr edit <PR> --body …`: final Summary, ticked Plan, Testing (commands and results), and Screenshots for UI changes.
3. `gh pr ready <PR>`

## 6. Merge — only when the user asks

Record the PR number and reviewed head SHA; inspect required checks and review requirements.
Do not bypass protections or treat unknown checks as passing. Merge the reviewed SHA, then
verify the PR reports `MERGED`. Keep worktree cleanup separate; do not disturb another checkout.
Use noninteractive CI output and at most one watcher; summarize failures and totals rather than
feeding full logs into context. When piping checks, preserve their exit codes. Existing green
checks must cover the reviewed head; use an up-to-date base or merge queue when required.

```bash
gh pr checks <PR> --required
gh pr merge <PR> --squash --match-head-commit <reviewed-head-sha>
gh pr view <PR> --json state,mergeCommit
```
