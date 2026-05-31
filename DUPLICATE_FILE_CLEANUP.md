# Duplicate File Cleanup Plan

Date: 2026-05-29

Update: 2026-05-31
- Archived 470 duplicate-looking untracked files into `duplicate-review/`.
- No duplicate assets were committed.
- `live-smoke-ae5c2b2.png` was left untouched because it does not match the duplicate filename pattern.

## Summary

The working tree contains 471 untracked files. 470 of them match the common macOS/Finder duplicate pattern `name 2.ext`, `name 3.ext`, and so on.

These files were not staged or deployed. They should be reviewed before deletion because some are images and videos, but the naming pattern strongly suggests accidental copies rather than intentional new assets.

## Current Counts

- `assets/`: 298 duplicate-looking files
- `promotion/`: 141 duplicate-looking files
- `scripts/`: 11 duplicate-looking files
- `en/`: 4 duplicate-looking files
- root SQL/JS/HTML duplicates: 16 duplicate-looking files

## Examples

- `assets/comics/entj-comic-page 2.png`
- `assets/characters/intp-avatar 5.webp`
- `assets/world-tree/world-tree-bg 5.png`
- `promotion/day1-upload-package 7.md`
- `scripts/preflight-check 6.mjs`
- `supabase-schema 6.sql`

## Safe Review Command

```bash
git status --porcelain | sed -n 's/^?? //p' | grep -E ' [0-9]+(\.[^/]+)?$'
```

## Proposed Deletion Command

Run this only after confirming the list above contains no intentionally generated assets:

```bash
git status --porcelain | sed -n 's/^?? //p' | grep -E ' [0-9]+(\.[^/]+)?$' | xargs -I{} rm -v "{}"
```

## Safer Archive Option

If deletion feels too risky, move them into a local review folder instead:

```bash
mkdir -p duplicate-review
git status --porcelain | sed -n 's/^?? //p' | grep -E ' [0-9]+(\.[^/]+)?$' | while IFS= read -r f; do mkdir -p "duplicate-review/$(dirname "$f")"; mv "$f" "duplicate-review/$f"; done
```

## Recommendation

Do not commit these duplicate files. Keep the cleanup as a separate maintenance action after the current feature work is verified online.
