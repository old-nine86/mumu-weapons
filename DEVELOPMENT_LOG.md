# Development Log

This log records the long-running development history for Mumu Brick Weapons. New phases should be added at the top or bottom with date, goal, shipped changes, verification, and next step.

## 2026-05-11: Upload Final Card Preview

Goal:
- Let users see the final collectible card result before submitting an uploaded weapon for review.

Shipped:
- Added a third upload preview panel showing the generated weapon card with matched rarity background.
- Displayed auto rarity, rarity score, estimated brick count, and AI power inside the preview card.
- Kept the preview synced with name, type, and skill edits.
- Applied the same upload preview experience to the Chinese and English pages.

Verification:
- Parse scripts in `index.html`, `en/index.html`, and `admin.html`.
- Check diff formatting.

## 2026-05-10: Arena Battle Pacing Upgrade

Goal:
- Make arena battles longer, more readable, and more fun to watch.

Shipped:
- Slowed the default battle rhythm and added fast mode as an optional control.
- Raised fighter durability, reduced burst damage, added a minimum 9-round battle window, and capped battles at 18 rounds.
- Added active-fighter highlighting, floating damage numbers, brick burst particles, crit/special screen shake, and longer attack/hit animations.
- Fixed timeout wins so the fighter with the higher remaining durability ratio wins instead of always picking player one.
- Applied the same pacing and visual feedback changes to the Chinese and English pages.

Verification:
- Parse scripts in `index.html`, `en/index.html`, and `admin.html`.
- Check diff formatting.

## 2026-05-10: Weapon Card Background Fix

Goal:
- Fix generated weapon background art being cropped awkwardly in the weapon grid.

Shipped:
- Changed weapon showcase panels to use the same portrait ratio as the generated card backgrounds.
- Kept rarity ribbons, score badges, effects, and weapon images above the background art.
- Applied the same fix to the Chinese and English pages.

Verification:
- Parse scripts in `index.html`, `en/index.html`, and `admin.html`.
- Check diff formatting.

## 2026-05-10: Legacy Weapon Data Upgrade

Goal:
- Bring the original built-in weapons up to the same standard as newly uploaded weapons.

Shipped:
- Added estimated brick count, AI power, complexity, balance, confidence, color count, and shape analysis to all 11 built-in weapons.
- Assigned built-in weapons to SSR, SR, and R rarity tiers through the same rarity formula used by uploaded weapons.
- Updated built-in weapon feature lists with rarity and AI estimate tags.
- Cleaned up English built-in weapon names, descriptions, skills, and feature text.

Verification:
- Parse scripts in `index.html`, `en/index.html`, and `admin.html`.
- Check diff formatting.

Next:
- Tune individual weapon stats after looking at the new card backgrounds and battle balance.

## 2026-05-10: Generated Card Background Set

Goal:
- Replace simple CSS card backgrounds with a richer generated collectible-card background set.

Shipped:
- Used `imagegen` to generate a unified 5x4 sheet of 20 premium brick-toy card backgrounds.
- Cropped the sheet into 20 WebP assets under `assets/card-bg/`.
- Added 5 SSR backgrounds, 5 SR backgrounds, 5 R backgrounds, and 5 N backgrounds.
- Added automatic background matching by rarity, weapon type, score, and weapon identity.
- Synced card background matching to the English site.

Verification:
- Review generated contact sheet at `assets/card-bg/contact-sheet.webp`.
- Parse scripts in `index.html`, `en/index.html`, and `admin.html`.
- Check diff formatting.

Next:
- Test several uploaded weapons and tune background selection if some types feel mismatched.

## 2026-05-10: Auto Rarity Weapon Cards

Goal:
- Turn uploaded weapons into collectible cards with automatic SSR/SR/R/N rarity and matching backgrounds.

Shipped:
- Added automatic weapon rarity scoring based on AI power, estimated brick count, complexity, and detection confidence.
- Added SSR, SR, R, and N rarity badges to weapon cards.
- Added rarity-specific card backgrounds and shimmer treatment for high-rarity cards.
- Added rarity score and rarity label in weapon cards and weapon detail modal.
- Added rarity tag to uploaded weapon analysis so approved uploads keep their collectible identity.
- Synced the feature to the English site.

Verification:
- Parse scripts in `index.html`, `en/index.html`, and `admin.html`.
- Check diff formatting.

Next:
- Tune rarity thresholds after testing several real uploaded weapons.
- Optionally add admin override for rarity.

## 2026-05-10: Upload Quality Preview Upgrade

Goal:
- Make the upload experience clearer and make background cleaning easier to judge before submission.

Shipped:
- Added upload photo guidance chips: lay the weapon flat, use a clean background, use even lighting, and fill the frame.
- Added side-by-side upload preview: original image and cleaned cutout.
- Improved background removal thresholds for pale backgrounds, warm floor colors, shadows, and low-saturation background edges.
- Synced the same upload UI and cleaning behavior to the English site.

Verification:
- Parse scripts in `index.html`, `en/index.html`, and `admin.html`.
- Check diff formatting.

Next:
- Test with real uploaded brick weapon photos and tune the cutout thresholds if some weapon colors are removed too aggressively.

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
