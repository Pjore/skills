# Stacked PRs

- Use for dependent phases or changes too large for one reviewable PR. Keep each layer focused;
  use separate PRs for independent work.
- The bottom PR targets the trunk. Each higher PR targets its parent PR branch, not `main`.
  Review each incremental diff. GitHub evaluates checks and protections against the trunk.
- Before starting a layer, inspect the parent PR and use its current head branch/SHA as the child
  base—even when the parent itself is stacked on another open PR. Do not branch from `main` just
  because the parent has not merged yet.
- Verify the child is based on the parent and contains only its incremental changes before opening
  the PR:

  ```bash
  git merge-base --is-ancestor origin/<parent-branch> HEAD
  git diff --stat origin/<parent-branch>...HEAD
  ```

- Push the child branch and set the PR base explicitly to the parent branch:

  ```bash
  git push -u origin <child-branch>
  gh pr create --base <parent-branch> --title "<type>(<scope>): <summary>" --body "<summary and tests>"
  ```

  Mention the implementation issue and parent PR in the body so reviewers can follow the stack.
  Do not include the parent's already-reviewed commits in the child's incremental diff.
- Verify repository, stack, branch and worktree before acting. Continue with
  `gh stack checkout <stack-or-PR-URL>`; inspect with `gh stack view`.
- Start a stack from the selected trunk with `gh stack init --base <trunk> <branch>`. From its
  top, add dependent layers with `gh stack add <branch>`.
- Before `gh stack submit --auto`, inspect the whole stack: it pushes all active branches and
  creates or updates PRs. Verify every PR's base and diff; `--auto` creates drafts.
- After lower branches or trunk change, inspect before cascading rebase/push. Rebase rewrites
  commits; protect other worktrees. `gh stack sync` fetches, rebases, pushes and syncs PRs.
- Merge only when asked. A merge requires linear history and all lower PRs to pass trunk rules.
  Inspect command scope; stack merge may merge multiple PRs.
- Stack IDs and PR numbers differ; a bare CLI number may resolve as a stack first. Branches must
  be in one repository; cross-fork stacks are unsupported.

Details: [GitHub stack behavior](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests)
and [CLI commands](https://docs.github.com/en/pull-requests/reference/stacked-prs-cli-commands).
