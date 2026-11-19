# Stacked pull requests

Use a stack for dependent phases or a large change whose single diff would be too large for
effective human review. Divide it into focused, reviewable layers in dependency order; use
separate PRs against the trunk instead for independent work. Honor repository and task rules,
including prerequisite gates, before starting each layer.

The trunk is the base of the bottom PR, normally `main` but possibly a release or feature branch.
Each higher PR targets the branch immediately below it, not the trunk. Review its incremental
diff against that base, while also considering the combined behavior. Stack IDs and PR numbers
are distinct; GitHub resolves a bare number as a stack number first. All stack branches must be
in the same repository; cross-fork stacks are not supported.

## Create or continue a stack

GitHub's [`gh stack` extension](https://docs.github.com/en/pull-requests/reference/stacked-prs-cli-commands)
manages local branches and GitHub stack metadata. Check `gh stack --help` and the installed
version's command help before use. If missing, follow repository installation policy; the
documented installation is `gh extension install github/gh-stack`.

1. Verify the repository, trunk, worktree, existing PRs and stack. To continue a known remote
   stack, use `gh stack checkout <stack-number-or-pr-url>` and `gh stack view`. Prefer a PR URL
   over a bare PR number when the identifier might be ambiguous. Check which branch is current
   and which worktree owns it; do not disturb other worktrees or uncommitted changes.
2. To start a new stack, fetch the chosen trunk and create the first branch from it using the
   main workflow. On that branch, run `gh stack init --base <trunk> <first-branch>`.
3. Implement, validate and commit the first layer using the main workflow. From the verified
   top branch, use `gh stack add <next-branch>` to create the next layer at that HEAD; implement,
   validate and commit it separately. Repeat only when prerequisites and task scope permit.
4. Inspect `gh stack view`, then run `gh stack submit --auto` to push active branches and
   create or update their PRs. It affects the whole stack, not just the current branch; inspect
   all branches and existing PRs first. `--auto` creates new PRs as drafts. Set each PR's title,
   summary, testing, and review state separately, and verify its actual base and incremental
   diff. Do not mark unrelated existing drafts ready.

After lower layers or the trunk change, inspect the stack and consult `gh stack rebase --help`
and `gh stack push --help` before a cascading rebase and push. Rebase rewrites commits and may
affect other worktrees; resolve conflicts in the indicated worktree and do not overwrite others'
work. Do not use `gh stack sync` as a read-only status check: it fetches, rebases, pushes and
synchronizes PR state.

## Review and merge

GitHub evaluates rules and required checks against the stack trunk even when a PR directly targets
another layer. Verify the requirements and checks for every affected PR, including lower layers;
a merge requires a linear stack and all lower PRs to meet the trunk's protection requirements.
Never bypass protections or treat missing checks as passing.

Merge only on explicit user request. Inspect the merge operation and its scope first: merging a
stack can merge multiple PRs atomically, not just the selected layer. Record the reviewed heads,
respect branch protections and merge queues, and verify the resulting PR states. When a lower
layer lands, verify the remaining bases and diffs before further review or merging.

References: [GitHub stack behavior](https://docs.github.com/en/pull-requests/reference/stacked-pull-requests)
and [CLI commands](https://docs.github.com/en/pull-requests/reference/stacked-prs-cli-commands).
