# UI PR screenshots

Capture screenshots with the `agent-browser` CLI (see that skill; install it first if missing).
Do not substitute an ad hoc screenshot method. Host screenshots on the persistent `screenshots`
release so image binaries stay out of Git history:

```bash
gh release create screenshots --title "Screenshot Archive" \
  --notes "Persistent archive of PR screenshots. Do not delete." --prerelease 2>/dev/null || true
gh release upload screenshots /tmp/<pr>-<feature>-<variant>.png --clobber
```

Embed the image in the PR comment:

```markdown
![<description>](https://github.com/<OWNER>/<REPO>/releases/download/screenshots/<pr>-<feature>-<variant>.png)
```
