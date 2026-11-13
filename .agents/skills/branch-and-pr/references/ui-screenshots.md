# UI PR screenshots

Use the environment's preferred screenshot capture tool. If no preference is specified or its
suitability is unclear, consider `agent-browser` if available (see its skill). Avoid ad hoc
screenshot methods. Host screenshots on the persistent `screenshots` release so image binaries
stay out of Git history:

```bash
gh release create screenshots --title "Screenshot Archive" \
  --notes "Persistent archive of PR screenshots. Do not delete." --prerelease 2>/dev/null || true
gh release upload screenshots /tmp/<pr>-<feature>-<variant>.png --clobber
```

Embed the image in the PR comment:

```markdown
![<description>](https://github.com/<OWNER>/<REPO>/releases/download/screenshots/<pr>-<feature>-<variant>.png)
```
