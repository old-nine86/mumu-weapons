# Development Log

This log records the long-running development history for Mumu Brick Weapons. New phases should be added at the top or bottom with date, goal, shipped changes, verification, and next step.

## 2026-05-16: Character Dossier Media

Goal:
- Add user-provided positioning images and promo animations for the first two premium character dossiers.
- Make character cards feel closer to collectible toy marketing material.

Shipped:
- Added INTJ Architect/Strategist dossier image and compressed promo video.
- Added ISTJ Inspector dossier image and compressed promo video.
- Added character-card media buttons for INTJ and ISTJ.
- Added a character dossier modal that shows the full positioning board, quote, role tags, and autoplay muted promo animation.
- Renamed ISTJ display from the old guard-style identity to `检查员 / Inspector` to match the supplied positioning art.
- Synced the feature to Chinese and English pages.

Verification:
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.
- Verified local HTTP responses for both pages and all four new media files.

Next:
- Add dossier media for the remaining MBTI characters as their positioning images and animations are produced.
- Consider replacing the SVG avatar on each upgraded character card with a crop from the positioning image once more character art is available.

Follow-up:
- Made upgraded character cards fully clickable, not only the small dossier button.
- Replaced INTJ and ISTJ card avatars with cropped images from the supplied positioning boards.
- Added lightweight WebP avatar crops for faster card rendering.

## 2026-05-16: Player Studio And Creator Gallery

Goal:
- Make the next update bigger and more platform-like, not just a small visual tweak.
- Give players a persistent local identity, a place to track their uploads, and a way to browse creator collections.

Shipped:
- Added a new `我的馆 / Studio` navigation tab on Chinese and English sites.
- Added local player profile with creator name and local player ID.
- Auto-fills upload creator and forum name from the saved player profile.
- Records each submitted weapon into `myUploads` with local/pending/published status.
- Added `我的上传记录 / My Upload Records` with thumbnail, type, time, brick count, AI power, and review status.
- Made weapon creator names clickable on cards and detail modals.
- Added creator public gallery so clicking a creator shows all approved weapons by that creator.
- Synced the same Studio experience to `/en/`.

Verification:
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.
- Opened local site on `http://127.0.0.1:8001/`.
- Verified saving player name updates the Studio profile.
- Verified clicking a weapon creator opens Studio and shows creator public works.
- Verified English Studio tab opens on `http://127.0.0.1:8001/en/`.

Next:
- Add a real cloud account/login layer when strict cross-device identity and anti-abuse are needed.
- Consider exposing rejected/pending cloud review status from Supabase through a safe RPC if full multi-device upload tracking becomes necessary.
- Continue with a larger gameplay update: weapon collection bonuses, creator pages, and longer arena progression.

## 2026-05-14: MBTI Battle Personality Depth

Goal:
- Make the 16 MBTI fighters feel more distinct in both card identity and arena behavior.
- Move beyond simple stat differences by adding personality-specific battle moments.

Shipped:
- Added role and combat style labels to every MBTI character card.
- Added role chips to the character card skill area.
- Added personality-triggered arena effects such as command combo damage, predictive strikes, overclock energy, trap bursts, morale repair, prepared shields, low-HP ideal echoes, precision snipes, dance combo energy, and opening rush pressure.
- Synced the character depth and arena behavior to the Chinese and English sites.

Verification:
- Parsed scripts in `index.html`, `en/index.html`, and `admin.html`.
- Checked diff formatting.

Next:
- Play several arena matches and tune any personality effect that feels too frequent or too strong.

## 2026-05-13: Premium Weapon Showcase Modal

Goal:
- Make the weapon detail popup feel like a premium collectible display window.
- Use admin showcase images when available and fall back gracefully to the weapon image.

Shipped:
- Rebuilt the weapon modal into a two-column display case layout on desktop and stacked layout on mobile.
- Added large rarity medal, card score, creator, brick count, AI power, signature skill, feature chips, and analysis chips.
- Added showcase-image background treatment for weapons with admin/AI showcase art.
- Synced the upgraded modal to the Chinese and English sites.

Verification:
- Parsed scripts in `index.html`, `en/index.html`, and `admin.html`.
- Checked diff formatting.

Next:
- Test one weapon with an uploaded admin showcase image and tune the crop/contrast if needed.

## 2026-05-13: Upload Cutout Controls

Goal:
- Make uploaded weapon cutouts cleaner without forcing one aggressive background-removal setting on every photo.
- Improve handling of pale floors, warm wood floors, gray backgrounds, and soft shadows.

Shipped:
- Added four upload cleanup modes: keep more, standard, cleaner, and strong.
- Reprocesses the selected photo when the user changes cleanup strength.
- Tuned background flood fill to remove more connected floor/shadow pixels while protecting saturated brick colors.
- Synced the upload cleanup controls to the Chinese and English sites.

Verification:
- Parsed scripts in `index.html`, `en/index.html`, and `admin.html`.
- Checked diff formatting.

Next:
- Test with real uploaded brick photos and tune the mode thresholds if strong mode removes small weapon details.

## 2026-05-11: Admin Card Override Workflow

Goal:
- Let the admin review page control each uploaded weapon's collectible-card rarity and score.
- Keep automatic recognition as the fallback when no manual value is set.

Shipped:
- Added admin fields for card rarity and card score.
- Updated Chinese and English frontend loading so public cards prefer admin rarity/score overrides.
- Updated Supabase schema and admin RPCs with `card_rarity` and `card_score`.

Verification:
- Live Supabase SQL migration applied successfully in the dashboard.
- Pending admin save smoke test with a real uploaded weapon.

Next:
- Use the admin page to set one real weapon to SSR/SR and confirm the public card updates.

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
