# GitHub CLI credentials for Git

For GitHub HTTPS operations:

1. Check authentication without displaying credentials:

   ```bash
   gh auth status --hostname github.com
   ```

2. If authenticated but Git cannot obtain credentials, configure the Git credential helper and
   retry the failed operation:

   ```bash
   gh auth setup-git --hostname github.com
   git ls-remote origin HEAD
   ```

3. If not authenticated, run `gh auth login --hostname github.com --git-protocol https`.

Never request, print, or store a token manually.
