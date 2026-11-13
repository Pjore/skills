# Worktree isolation

Use this when new work must be based on a different branch and the current worktree has
unrelated or uncommitted changes. Reuse an existing PR's worktree instead when applicable.

1. In the original worktree, set and fetch the PR base (default `main`):

   ```bash
   ORIGINAL_WORKTREE="$PWD"
   BASE=main
   git fetch origin "$BASE"
   ```

2. Create a sibling worktree and branch directly from the fetched base:

   ```bash
   BRANCH=fix/short-description
   WORKTREE="$(dirname "$ORIGINAL_WORKTREE")/$(basename "$ORIGINAL_WORKTREE")-short-description"
   git worktree add -b "$BRANCH" "$WORKTREE" "origin/$BASE"
   ```

3. If Git reports dubious ownership, add only this canonical worktree path to Git's trusted
   directories. Never use `safe.directory '*'`.

   ```bash
   SAFE_WORKTREE="$(realpath "$WORKTREE")"
   git config --global --add safe.directory "$SAFE_WORKTREE"
   ```

   Remove this exact safe-directory entry when removing the worktree.

4. Transfer only intended staged/unstaged changes, path-limited, from the original worktree.
   Skip either command if that path has no changes in the corresponding state. For intended
   untracked files, copy only explicitly selected paths into the same repository-relative
   locations in the new worktree and stage them there; neither diff below includes them.
   Leave the originals untouched.

   ```bash
   git -C "$ORIGINAL_WORKTREE" diff --cached --binary -- path/to/file \
     | git -C "$WORKTREE" apply --index
   git -C "$ORIGINAL_WORKTREE" diff --binary -- path/to/file \
     | git -C "$WORKTREE" apply
   ```

5. Review the transferred diff, then enter and verify the new worktree before editing:

   ```bash
   cd "$WORKTREE"
   git status --short
   git branch --show-current
   git merge-base --is-ancestor "origin/$BASE" HEAD
   ```

Never copy or apply the whole working-tree diff when unrelated edits are present. Do not switch,
clean, or stash the original worktree to create the branch.
