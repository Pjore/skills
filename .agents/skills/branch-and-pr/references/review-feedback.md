# Addressing PR review feedback

1. Honor the explicitly named PR and repository. If an active-PR tool finds nothing, use `gh`
   for that PR instead. Read general comments and reviews with `gh pr view`, selecting only
   the needed fields. For inline feedback, query GraphQL review threads: REST review comments
   alone do not indicate whether a thread is resolved. Paginate threads and, when needed,
   their comments.

   ```bash
   gh pr view 123 --repo OWNER/REPO --json comments,reviews \
     --jq '{comments: [.comments[].body], reviews: [.reviews[] | select(.body != "") | {state, body}]}'

   gh api graphql --paginate -f owner=OWNER -f repo=REPO -F number=123 \
     -f query='query($owner:String!, $repo:String!, $number:Int!, $endCursor:String) {
       repository(owner:$owner, name:$repo) { pullRequest(number:$number) {
         reviewThreads(first:100, after:$endCursor) {
           pageInfo { hasNextPage endCursor }
           nodes { id isResolved isOutdated viewerCanResolve path
             comments(first:100) {
               commentsPage: pageInfo { hasNextPage endCursor }
               nodes { databaseId body }
             }
           }
         }
       } }
     }' --jq '.data.repository.pullRequest.reviewThreads.nodes[] | select(.isResolved == false)'
   ```

   `--paginate` follows the thread cursor only. If `commentsPage.hasNextPage` is true, paginate
   that thread's comments separately. For a reply-only follow-up, include the requested resolved
   threads too; avoid duplicate replies.

   ```bash
   gh api graphql --paginate -f id=THREAD_ID \
     -f query='query($id:ID!, $endCursor:String) {
       node(id:$id) { ... on PullRequestReviewThread {
         comments(first:100, after:$endCursor) {
           pageInfo { hasNextPage endCursor }
           nodes { databaseId body }
         }
       } }
     }' --jq '.data.node.comments.nodes[]'
   ```
2. Group unresolved feedback by file, inspect context, and make the smallest correct changes.
   Test the affected behavior and edge cases. Verify a targeted test command actually narrows the
   suite: appending a file to a package script with a hard-coded glob may still run every test.
3. Reply to each addressed thread with the action or decision and relevant verification. Use
   the original comment's numeric `databaseId`, not the thread ID. To avoid printing large diff
   hunks, request only the reply identifiers:

   ```bash
   gh api repos/OWNER/REPO/pulls/123/comments/COMMENT_ID/replies \
     -f body='Fixed ...; verified with ...' --jq '{id,in_reply_to_id,html_url}'
   ```

   If a fix is only local, say it is pending push and leave the thread open. After the fix is
   on the PR, resolve addressed threads only when `viewerCanResolve` is true and no reviewer
   follow-up is pending. For a no-change decision, leave the thread open if reviewer agreement
   is still needed. Leave unclear or disputed feedback open and report it. For a reply-only
   follow-up, preserve the existing resolution state.

   ```bash
   gh api graphql -f id=THREAD_ID \
     -f query='mutation($id:ID!) {
       resolveReviewThread(input:{threadId:$id}) { thread { id isResolved } }
     }' --jq '.data.resolveReviewThread.thread'
   ```

4. Verify the replies and resolution state once, using narrowly scoped fields. Summarize the
   changes, checks, and any threads left open; do not repeat entire review comments.
