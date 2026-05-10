# Development Log

This log records the long-running development history for Mumu Brick Weapons. New phases should be added at the top or bottom with date, goal, shipped changes, verification, and next step.

## 2026-05-10: Project Memory And Roadmap

Goal:
- Preserve the long-term project plan inside the repository.
- Make future development easier to continue without relying only on chat history.

Shipped:
- Added `PROJECT.md` as the project master plan.
- Added `DEVELOPMENT_LOG.md` as the ongoing phase-by-phase development record.
- Captured completed phases, near-term roadmap, long-term roadmap, and operating rules.

Verification:
- Documentation-only change.

Next:
- Continue with upload quality upgrade: cleaner background removal, better preview, and admin showcase workflow.

## 2026-05-09: Upload Recognition Upgrade

Goal:
- Make uploaded weapon recognition more accurate than the original filename/aspect-ratio heuristic.

Shipped:
- Added shape-based scoring for sword, gun, and spear/polearm.
- Added image metrics: silhouette shape, fill, color layers, center of mass, end-mass skew, symmetry, complexity, and balance.
- Added recognition confidence.
- Updated Chinese and English upload feedback.

Verification:
- Parsed scripts in `index.html`, `en/index.html`, and `admin.html`.
- Checked diff formatting.
- Published through GitHub Pages successfully.

Next:
- Improve background removal and upload preview quality.

## 2026-05-09: Upload Allowance Increased

Goal:
- Make upload quota less restrictive for early users.

Shipped:
- Changed default cloud upload allowance from 2 to 50 in Chinese site.
- Changed default cloud upload allowance from 2 to 50 in English site.
- Updated Supabase schema default from `free_per_ip = 2` to `free_per_ip = 50`.

Verification:
- Parsed scripts in `index.html`, `en/index.html`, and `admin.html`.
- Checked diff formatting.
- Published through GitHub Pages successfully.

Next:
- If the live Supabase `upload_quota_rules` row still has 2, run a one-line SQL update in Supabase.

## Earlier Phases: Product Foundation

Goal:
- Turn the original page into a cute brick weapon platform.

Shipped:
- Rebuilt visual design into cute premium brick style.
- Added generated hero and category assets.
- Reworked 16 MBTI characters into a unified brick-character style.
- Improved battle system and character battle identity.
- Added user uploads.
- Added Supabase cloud backend.
- Added admin review tools.
- Added forum system.
- Added showcase image support.
- Added bilingual English site.
- Prepared promotion materials for Douyin and Kuaishou.

Verification:
- Tested local pages during development.
- Pushed and deployed each major milestone to GitHub Pages.

Next:
- Continue improving upload quality, showcase window, character depth, and promotion loop.
