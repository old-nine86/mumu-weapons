# Development Log

This log records the long-running development history for Mumu Brick Weapons. New phases should be added at the top or bottom with date, goal, shipped changes, verification, and next step.

## 2026-05-19: Character Comic Stories

Goal:
- Give every MBTI character a story moment on their character page instead of only a static dossier.

Shipped:
- Added a four-panel comic story section to every character profile modal.
- Wrote unique comic mini-stories for all 16 MBTI characters, matching their personality, weapon preference, and combat trait.
- Styled the comic panels as clean collectible-toy story cards so they load quickly without adding more heavy images.

Verification:
- Parsed JavaScript in `index.html` and `admin.html` with Node.
- Ran `git diff --check`.
- Confirmed the local static page serves the comic-story code and story UI strings.

Next:
- Later, replace selected comic panels with generated illustrated comic pages if a character becomes a promotion focus.

## 2026-05-19: Character Dossier Batch And Battle Share Cards

Goal:
- Ship a larger update that advances upload quality, admin refinement, character art, and gameplay shareability together.

Shipped:
- Generated and added four new premium brick-character dossier boards and avatar crops: ENTJ, INTP, ENTP, and INFJ.
- Wired the four new characters into the Chinese character gallery, character profile modal, arena picker, and VS intro.
- Added image-only dossier support so characters can have a premium positioning board before their promo animation is ready.
- Updated cloud upload payloads to keep both the original uploaded photo and the refined cutout image in Supabase Storage metadata.
- Added a richer arena victory settlement card with MVP moment, stage, remaining durability, weapon, and action buttons.
- Added an in-browser battle share-card generator for posting match results to short-video/social platforms.

Verification:
- Parsed JavaScript in `index.html` and `admin.html` with Node.
- Ran `git diff --check` on the changed files.

Next:
- Sync the same character and share-card update to `/en/` after the local English page file stops timing out on read.
- Run the Supabase `supabase-admin-image-refinement.sql` upgrade on production and test one full upload -> admin refine -> approve -> public display cycle.

Follow-up:
- Generated and added the remaining 10 premium dossier boards and avatar crops: ENFJ, INFP, ENFP, ISFJ, ESTJ, ESFJ, ISTP, ISFP, ESTP, and ESFP.
- The Chinese site now has premium dossier images for all 16 MBTI characters.

## 2026-05-18: Admin Image Refinement Pipeline

Goal:
- Let approved reviewers clean or replace uploaded weapon subject images after submission, while preserving the original upload.
- Prepare the static GitHub Pages admin workflow for a future server-side image cleanup job.

Shipped:
- Added an admin-side weapon image refinement panel to pending and approved weapon cards.
- Added original/current image comparison previews in the admin page.
- Added browser-side automatic cutout for admin refinement.
- Added manual replacement upload for transparent PNG/WebP or regular photos.
- Added a new Supabase RPC, `admin_replace_weapon_image`, to replace `image_url` and store `original_image_url` / `refined_image_url` in `analysis`.
- Added `supabase-admin-image-refinement.sql` as a small copy-paste migration for the live database.

Verification:
- Parsed JavaScript in `index.html`, `en/index.html`, and `admin.html` with Node.
- Ran `git diff --check` on the changed project files.
- Started a local static server on `http://127.0.0.1:8010/`.
- Verified the local admin page serves the new refinement controls and the standalone Supabase SQL upgrade serves correctly.

Next:
- Run the Supabase SQL upgrade on production, then test one pending upload through auto refinement, approval, and public display.

## 2026-05-18: Manual Cutout Editor

Goal:
- Provide a reliable solution when automatic background removal still leaves floor texture or removes weapon pieces.

Shipped:
- Added an in-browser manual cutout editor after upload preview.
- Added erase and restore brush tools so users can remove leftover background or recover missing brick pieces.
- Added brush size control, reset, and apply actions.
- The upload payload now uses the manually edited transparent weapon image after `Apply edit`.
- Synced the editor to Chinese and English pages.

Verification:
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.

Next:
- Move automatic background removal to a server-side cleanup job while keeping the manual editor as the final fallback.

## 2026-05-18: Smart Cutout Tool V2

Goal:
- Stop uploaded weapon photos from losing colored brick pieces during background removal.
- Add a reusable local cutout program so the workflow can be tested outside the browser.

Shipped:
- Changed the default upload cleanup mode from `Standard` to `Smart tool`.
- Rebuilt the browser cutout algorithm with median border sampling, chroma comparison, edge checks, and explicit brick-color protection.
- Made component cleanup more permissive so separated weapon pieces are kept instead of being treated as noise.
- Added `scripts/cutout_tool.py`, a local Pillow/OpenCV-capable background remover for batch testing real photos.
- Synced the upload cutout changes to Chinese and English pages.

Verification:
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.
- Installed and tested optional OpenCV support locally.
- Ran the new cutout tool against sample brick weapon photos in `promotion/source-images/`.

Next:
- For best public upload quality, move image cleanup to a server-side job that can run the OpenCV tool after each Supabase upload and save the cleaned image back to storage.

## 2026-05-17: AI-Generated Weapon Showcase V2

Goal:
- Replace the remaining weak weapon showcase backgrounds with newly generated card-specific display scenes.
- Match each weapon to a cleaner background based on weapon type, mood, and card rarity.

Shipped:
- Generated a new `imagegen` contact sheet of 12 premium brick-toy display backgrounds.
- Split the generated sheet into individual `assets/generated-card-bg/v2/card-bg-v2-xx.webp` background assets.
- Rebuilt all 11 built-in weapon showcase cards on top of the new V2 backgrounds.
- Preserved the existing `assets/weapon-showcases/weapon-01.webp` through `weapon-11.webp` filenames so the website picks up the upgraded cards without more code churn.
- Added a local contact sheet at `assets/generated-card-bg/v2-showcase-contact.jpg` for visual review.

Verification:
- Visually reviewed the V2 showcase contact sheet.
- Confirmed all rebuilt showcase cards are 640x860 WebP files.

Next:
- Use the same generated-background pipeline for approved cloud weapons when they receive a dedicated showcase image.

## 2026-05-17: Per-Weapon Showcase Cards

Goal:
- Stop weapon cards from reusing and cropping a shared background image.
- Give every built-in weapon its own checked showcase image.

Shipped:
- Generated standalone 640x860 WebP showcase images for the 11 built-in weapons.
- Added `assets/weapon-showcases/weapon-01.webp` through `weapon-11.webp`.
- Changed Chinese and English weapon cards to render the standalone showcase image first.
- Kept dynamic background composition only as a fallback for cloud uploads that do not yet have a configured showcase image.
- Updated detail modals so built-in weapons also use the new standalone showcase window.

Verification:
- Reviewed the generated showcase contact sheet locally before wiring it into the UI.
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.

Next:
- Add a backend/admin workflow to generate or upload a standalone showcase image for each approved cloud weapon.

## 2026-05-17: Promo Audio And Card Background Smoothing

Goal:
- Fix newly added character promo videos appearing silent.
- Remove the washboard-like distortion from weapon card backgrounds.

Shipped:
- Removed forced `autoplay muted` playback from character dossier promo videos.
- Changed promo videos to user-started playback with visible controls and a short audio hint.
- Changed generated weapon card backgrounds from forced `100% 100%` stretching back to proportional `cover` rendering.
- Kept the fixed 640/860 card frame and added a subtle soft-light overlay to reduce visible banding.
- Synced the fixes to Chinese and English pages.

Verification:
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.
- Opened local site on `http://127.0.0.1:8007/`.
- Verified weapon cards render, keep a 640/860 aspect ratio, and compute `background-size: cover, cover`.
- Verified character dossier videos compute `muted=false`, `autoplay=false`, `controls=true`, and `preload=metadata`.

Next:
- If a future uploaded MP4 file itself has no audio track, replace that source video with an exported version that includes audio.
- Continue checking generated card backgrounds against real uploaded weapons before expanding the background pool.

## 2026-05-17: Weapon Background And Cutout Stability

Goal:
- Fix weapon card backgrounds feeling mismatched or cropped like the wrong card version.
- Make upload background removal preserve colorful brick pieces more reliably.

Shipped:
- Changed card background selection from score/name-length offsets to stable type-based mapping within each rarity tier.
- Changed card background rendering from cover cropping to full portrait card scaling.
- Retuned all upload cleanup modes to be less destructive.
- Added explicit protection for red, yellow, blue, cyan, pink, brown/dark brick-like pixels before flood-fill background removal.
- Reduced the chance that small separated weapon components are discarded as noise.
- Synced the changes to Chinese and English pages.

Verification:
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.
- Ran synthetic color-protection checks against wood/gray floor colors and common brick colors.
- Opened local site on `http://127.0.0.1:8002/`.
- Verified weapon cards render and the card background computed size is `100% 100%`.
- Checked the local smoke-test URL for browser console errors.

Next:
- Test again with several real phone photos when fresh examples are available, especially pale yellow and light cyan bricks on wood floors.

## 2026-05-17: Arena V4 And MBTI Weapon Match

Goal:
- Make the next gameplay update larger than a small visual patch.
- Add a shareable personality-style mini game beyond arena battles.

Shipped:
- Added a new `配武器测试 / Weapon Match` navigation tab.
- Built a 6-question MBTI weapon matching quiz.
- Quiz results recommend a fighter, role, trait, and weapon, with actions to view the dossier or start a battle.
- Added a VS intro before arena battles with both fighters' art/avatar, MBTI identity, trait, quote, countdown, and skip button.
- Synced the feature to Chinese and English pages.

Verification:
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.
- Opened local site on `http://127.0.0.1:8001/`.
- Verified Chinese quiz result generation.
- Verified Chinese quiz result can launch the VS intro and then enter the arena.
- Verified English quiz result generation and VS intro path.
- Fixed a missing `addBattleLog` helper found during arena smoke testing.
- Checked the current local smoke-test URL for browser console errors.

Next:
- Add a richer victory settlement card with MVP skill, remaining durability, and buttons for rematch / switch fighters / view dossier.
- Add share-card generation for quiz results so users can post their matched MBTI weapon type.

## 2026-05-17: Character Dossier V3 Arena Link

Goal:
- Make the upgraded character art useful inside gameplay, not only visible in the character card modal.
- Show users clearly how many premium character dossiers are completed.

Shipped:
- Added a character dossier progress panel to the Chinese and English character galleries.
- Added `Complete / In progress` status chips to every character card.
- Rebuilt the arena fighter picker into a grid plus preview layout.
- The picker preview now shows the selected fighter's avatar, MBTI role, quote, trait tags, stat bars, and a direct dossier button.
- INTJ and ISTJ use their supplied avatar crops inside the arena picker preview; unfinished characters keep the unified placeholder flow.
- Synced the upgrade to `/en/`.

Verification:
- Parsed JavaScript in `index.html` and `en/index.html` with Node.
- Ran `git diff --check`.
- Opened local site on `http://127.0.0.1:8001/`.
- Verified Chinese character progress shows `2/16 已完成`.
- Verified Chinese arena picker preview opens the INTJ full dossier.
- Verified English character progress shows `2/16 completed`.
- Verified English arena picker preview opens the INTJ full dossier.
- Checked browser console for JavaScript errors.

Next:
- Add a VS intro screen before each battle that uses the two selected fighters' dossier art and promo animation snippets.
- Continue replacing the remaining 14 character dossiers as new positioning boards and animations arrive.

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
- Upgraded to Character Dossier V2: all 16 characters now have clickable dossier slots.
- Characters without supplied art show a `资料制作中 / Dossier in progress` placeholder instead of doing nothing.
- Arena character selection now uses supplied avatar crops for upgraded characters.

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
