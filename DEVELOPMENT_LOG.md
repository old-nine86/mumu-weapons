# Development Log

This log records the long-running development history for Mumu Brick Weapons. New phases should be added at the top or bottom with date, goal, shipped changes, verification, and next step.

## 2026-05-24: Admin AI Refinement Workbench

Goal:
- Move the hard upload cleanup work into the admin review flow, where one reviewer can run AI refinement before approving a player weapon.

Shipped:
- Added an OpenAI API key field to `admin.html`; the key is stored only in the local admin browser, not in the public config file.
- Added an `AI 精修工作台` to pending and approved weapon cards.
- Added `只生成描述属性` to inspect the uploaded weapon image and fill weapon name, type, rarity, brick count, battle stats, skill, descriptions, and recommended MBTI metadata.
- Added `一键 AI 全流程` to run recognition, transparent cutout, card-background generation, and LEGO-style character handheld showcase generation.
- The full workflow uploads generated assets to Supabase Storage, replaces the public weapon subject image, sets the handheld image as the showcase image, and saves AI asset metadata.
- Added the `admin_update_weapon_ai_assets` Supabase RPC to preserve refined image URL, card background URL, handheld showcase URL, and AI metadata in `weapons.analysis`.
- Connected Chinese and English weapon detail windows to use AI-generated card backgrounds when present.

Verification:
- Parsed scripts in `index.html`, `admin.html`, and `en/index.html`.

Next:
- Run the updated `supabase-schema.sql` in production Supabase, then test one pending upload through `一键 AI 全流程` before approving it.

## 2026-05-24: Full Project Health Check

Goal:
- Re-check previous work before starting the next major plan phase.

Checked:
- Parsed scripts in `index.html`, `admin.html`, and `en/index.html`.
- Checked static asset references and duplicate IDs.
- Checked key GitHub Pages URLs and core image assets.
- Confirmed the promotion QR image exists and is served online.
- Confirmed the quiz, battle, weapon, and promotion-center code is present online.

Fixed:
- Removed a stale zero-byte `.git/index.lock` file that was causing local Git status/check commands to hang.

Known gaps:
- The English site has not yet been synced with the newer Chinese `漫画馆`, `总计划`, and `推广中心` loops.
- Purchase links and creator support entries are still placeholders until real links/QR assets are provided.

Next:
- Start the commercialization/configuration phase: make support QR codes and product links manageable from the project/admin flow.

## 2026-05-23: Weapon Promotion Loop

Goal:
- Make every weapon showcase usable as a short-video content prompt.

Shipped:
- Added a weapon promotion material kit inside each weapon showcase modal.
- Added ready-to-copy weapon video caption and pinned-comment text.
- Added actions to send the selected weapon into the promotion center proof form.
- Added a promotion-center shortcut for the upload-weapon task to bring in the currently opened weapon.

Verification:
- Parsed scripts in `index.html`.
- Checked diff formatting.

Next:
- Add real product/purchase links and creator support assets, then connect them to weapon showcase CTAs.

## 2026-05-23: Battle Promotion Loop

Goal:
- Turn arena results into short-video publishing material instead of only a share image.

Shipped:
- Added a battle promotion material kit to the arena result card.
- Added ready-to-copy battle video caption and pinned-comment text.
- Added actions to copy the battle caption, copy the pinned comment, or send the latest battle result into the promotion center.
- Added a promotion-center shortcut for the `战场随机对决` task to prefill proof text from the latest finished battle.

Verification:
- Parsed scripts in `index.html`.
- Checked diff formatting.

Next:
- Add the same promotion loop to uploaded weapon cards, so each approved player weapon can become a one-click content prompt.

## 2026-05-22: Quiz Promotion Loop

Goal:
- Connect the MBTI weapon match quiz directly to short-video promotion and reward proof submission.

Shipped:
- Added a promotion material kit to quiz results with ready-to-post title/body copy and pinned-comment text.
- Added result actions for copying the promotion caption, copying the pinned comment, and sending the quiz result into the promotion center.
- Added a promotion-center shortcut that can prefill proof text from the latest quiz result.

Verification:
- Parsed scripts in `index.html`.
- Checked diff formatting.

Next:
- Add the same result-to-growth loop for battle result share cards and uploaded weapon cards.

## 2026-05-22: Promotion Task Center

Goal:
- Turn the promotion loop from a small upload textarea into a visible product workflow.

Shipped:
- Added a `推广中心` navigation tab to the Chinese site.
- Added a seven-day Douyin/Kuaishou content task board with hooks, recording structure, and reusable captions.
- Added one-click copy for video captions and a proof form that reuses the existing promotion-review backend.
- Added a QR/site-entry panel that can automatically show `promotion/site-qr.png` when a working QR asset is provided.

Verification:
- Parsed scripts in `index.html`.
- Checked diff formatting.

Next:
- Add a real, scannable QR image at `promotion/site-qr.png` and sync the promotion center to `/en/` if needed.

## 2026-05-22: Master Plan Hub

Goal:
- Start the project master plan as a visible product hub instead of leaving it only in documentation.

Shipped:
- Added a `总计划` navigation tab to the Chinese site.
- Added a master-plan hub connecting the main product loops: upload weapon, comic gallery, weapon match quiz, arena battle, and support/commercialization entry.
- Added quick actions from the hub to the upload station, comic gallery, quiz, battlefield, and support area.

Verification:
- Parsed scripts in `index.html`.
- Checked diff formatting.
- Confirmed the local static server returns the new master-plan markup.

Next:
- Replace placeholder support/purchase links with real creator support QR images and affiliate/product URLs when ready.

## 2026-05-22: Comic Gallery Entry

Goal:
- Make the generated MBTI comic pages easy to find from the main navigation.

Shipped:
- Added a `漫画馆` nav tab to the Chinese site.
- Added a comic gallery panel showing all 16 generated image2 four-panel comic pages from `assets/comics/`.
- Each comic card links into the matching character profile so users can read the full comic story, subtitles, and share-card tools.

Verification:
- Parsed scripts in `index.html`.
- Checked diff formatting.
- Smoke-tested the local Chinese site in the in-app browser.

Next:
- Sync the comic gallery to `/en/` once the English page can be read and edited reliably.

## 2026-05-21: Quiz Result Share Card

Goal:
- Continue the promotion loop by making the MBTI weapon match quiz produce a shareable result image.

Shipped:
- Added a `生成分享卡` action to the Chinese `配武器测试` result panel.
- Built an in-browser vertical PNG generator for quiz results with matched character, MBTI identity, recommended weapon, personality tag, battle style, quote, and site link.
- Added an inline preview under the quiz result so users can long-press/save the generated image for Douyin, Kuaishou, Xiaohongshu, or chat sharing.

Verification:
- Parsed scripts in `index.html`.
- Smoke-tested the local Chinese quiz flow in the in-app browser.

Next:
- Sync the same quiz share-card flow to `/en/` after the local English page file stops timing out on direct reads.

## 2026-05-21: Project Workspace Packaging

Goal:
- Make the project easier to continue later and easier for another agent to understand.

Shipped:
- Added `README.md` as the main project entry file.
- Added `PROJECT_WORKSPACE.md` to explain where future work should happen, what to read first, and how to keep files organized.
- Clarified that all code, assets, promotion files, plans, and logs should stay in the `mumu-weapons` project folder.

Verification:
- Confirmed the repository folder contains `.git`, source files, assets, project plan, and development log.

Next:
- Continue product updates from this workspace and keep the project logs current.

## 2026-05-21: Weapon Showcase Modal 2.0

Goal:
- Move away from upload-tool work and make weapon details feel like a premium collectible display window.

Shipped:
- Added recommended MBTI character matching to weapon detail modals.
- Added collectible weapon ID, richer analysis rows, and character synergy copy.
- Added modal actions for sharing the showcase, jumping to the character/battle area, and a purchase-link placeholder.
- Added share text generation using Web Share API or clipboard fallback.

Verification:
- Parsed scripts in `index.html` and `admin.html`.
- Checked diff formatting.

Next:
- Add real affiliate/purchase URLs and creator support payment links when assets are ready.

## 2026-05-21: Upload Quality Guidance

Goal:
- Make upload cleanup easier to judge before submission.

Shipped:
- Added upload quality chips under the recognition result.
- The upload flow now comments on recognition confidence, weapon size in the frame, subject centering, and edge spacing.
- The guidance tells users when to confirm the type, re-shoot, leave more margin, or use one-click smart keep.

Verification:
- Parsed scripts in `index.html` and `admin.html`.
- Checked diff formatting.

Next:
- Add a zoomed edge inspector if users still cannot tell whether small brick pieces were removed.

## 2026-05-21: One-Click Smart Cutout Keep

Goal:
- Make the new polygon cutout workflow usable without manual point editing for most uploads.

Shipped:
- Added `一键智能保留` to the upload cutout editor.
- The one-click action runs automatic outline tracing, polygon keep, and two smart edge expansions in sequence.
- Existing manual controls remain available for correction after reset.

Verification:
- Parsed scripts in `index.html` and `admin.html`.
- Checked diff formatting.

Next:
- Test the one-click workflow against real user weapon photos and tune edge expansion if it keeps too much floor.

## 2026-05-21: Auto Outline Cutout Helper

Goal:
- Reduce manual work in the polygon cutout editor.

Shipped:
- Added `自动圈选` to trace the current cutout subject and generate outline points automatically.
- The helper samples the visible weapon silhouette from top, right, bottom, and left edges, then expands the outline by the brush size.
- Users can accept the outline with `闭合保留` or adjust it with manual polygon points.

Verification:
- Parsed scripts in `index.html` and `admin.html`.
- Checked diff formatting.

Next:
- Test with more real weapon photos and tune the outline sampling density if needed.

## 2026-05-21: Polygon Cutout Editor

Goal:
- Make manual cutout easier than brush-only editing, especially for long brick weapons.

Shipped:
- Added a `圈选武器` tool to the upload cutout editor.
- Users can tap/click points around the weapon outline, then use `闭合保留` to keep the polygon area.
- The polygon keep operation expands outward based on the brush size, making it easier to include weapon edges.
- Added `撤销点`, point counter, and visible outline preview.
- Added `智能扩边` to automatically restore a small edge band from the original photo around the current cutout.

Verification:
- Parsed scripts in `index.html` and `admin.html`.
- Checked diff formatting.

Next:
- Add an optional server-side cutout job for fully automatic cleanup after upload.

## 2026-05-20: Comic Viewing And Character Preview Cleanup

Goal:
- Make the image2 comic pages easier to view completely on the web.
- Simplify character card previews so they look like clean front/avatar portraits.

Shipped:
- Removed the comic image height cap and centered each long comic page in a readable column.
- Kept Chinese subtitle overlays aligned to the actual comic image width.
- Changed character cards from large cropped dossier covers to compact avatar portraits with a clean toy display background.

Verification:
- Parsed scripts in `index.html` and `admin.html`.
- Checked diff formatting.

Next:
- Visually review mobile and desktop card density after more user feedback.

## 2026-05-20: Full Image2 Comic Batch With Chinese Subtitles

Goal:
- Finish image2 comic pages for all MBTI characters.
- Make the comic readable by adding stable Chinese dialogue on top of the generated comic images.

Shipped:
- Generated and added image2 four-panel comic pages for the remaining 12 MBTI characters.
- Connected all 16 MBTI characters to full comic page images.
- Added web-rendered Chinese subtitle/dialogue overlays on each image2 comic, so the story text is reliable and legible.

Verification:
- Checked generated assets exist in `assets/comics`.
- Parsed scripts in `index.html` and `admin.html`.
- Checked diff formatting.

Next:
- Review the 16 comic images visually in-browser and replace any weaker image with a regenerated version.

## 2026-05-20: Image2 Comic Pages Pilot

Goal:
- Replace the text-only comic feel with real image2 generated comic artwork.

Shipped:
- Generated and added full four-panel comic page images for ENTJ, INTJ, INTP, and ENTP.
- Connected comic images into character profile modals as the primary "image2 漫画正片" above the story breakdown.
- Kept structured story panels underneath as readable backup and share-card source.

Verification:
- Visually checked generated comic assets before wiring them into the site.
- Parsed scripts and checked formatting before publishing.

Next:
- Generate image2 comic pages for the remaining 12 MBTI characters in batches.

## 2026-05-20: Visual Character Comic Stories

Goal:
- Turn the character comic section from text-only notes into real four-panel visual stories.
- Give every MBTI character a logical mini story with setup, conflict, twist, and ending.

Shipped:
- Rebuilt `CHAR_COMICS` into structured story data for all 16 MBTI characters.
- Added visual comic panel rendering with character art, scene labels, action badges, effect marks, dialogue, and story wrap-up.
- Updated character share-card generation to use the new story arcs instead of old plain text arrays.

Verification:
- Parsed scripts in `index.html` and `admin.html`.
- Checked diff formatting.

Next:
- Add richer generated comic images for selected main characters if stronger poster-quality storytelling is needed.

## 2026-05-20: Funny Character Comic Share Cards

Goal:
- Turn character comic stories into shareable funny images for social posting.

Shipped:
- Added funny MBTI meme lines for all 16 characters.
- Added `生成搞笑漫画分享图` button inside each character comic section.
- Built an in-browser vertical share-card generator combining character avatar, MBTI identity, four comic panels, meme copy, personality skill, and site link.
- Added preview output under the character page so users can long-press/save the generated image.

Verification:
- Parsed JavaScript in `index.html` and `admin.html` with Node.
- Ran `git diff --check`.
- Confirmed the local static page serves the funny comic share-card code and button text.

Next:
- Add a QR code or platform-specific short link to the generated share card once the final promotion entry is chosen.

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

## 2026-05-24 - 后台批量资料补全工具

- 后台新增批量补全入口，可对当前已加载的待审核/已通过武器自动补中文、英文、等级、数值、主体图、卡片背景和手持展示图。
- 批量流程默认切到本地自动模式，不消耗 OpenAI/Gemini/OpenRouter API。
- 批量补全会跳过资料和图片已经完整的武器。

## 2026-05-25 - 后台 Apple 风重做

- 后台改成浅色产品控制台风格：粘性顶栏、干净控制面板、柔和白色卡片和更克制的按钮系统。
- 武器卡片重构为摘要优先，复杂功能折叠进“精修工作台 / 主体图与橱窗 / 资料编辑”三个分组。
- 待审核和已通过卡片显示不同默认展开区，减少后台视觉噪音。

## 2026-05-25 - 橱窗图匹配正式背景和角色

- 后台本地橱窗生成器改为优先使用网站内已有的 card-bg 精美背景。
- 橱窗左下角改为 16 MBTI 角色头像，并按推荐 MBTI 或武器类型自动匹配适合角色。
- 后台批量工具新增“重做全部橱窗”，可以强制刷新以前生成不搭的展示图。

## 2026-05-25 - 旧橱窗自动重做识别

- 后台一键补全现在会把旧版 local/openrouter/gemini/ai handheld 橱窗识别为需要重做。
- 顶部操作改成“一键补全/重做旧图”“重做已通过橱窗”“刷新后台数据”，避免用户误以为代码更新后数据库旧图会自动变化。

## 2026-05-25 - 后台卡牌等级和背景手动选择

- 审核后台资料编辑区新增卡牌背景选择器，按 SSR/SR/R/N 分组列出前端网站使用的 20 张 card-bg 背景。
- 背景选择带即时预览，并跟随卡片等级自动显示对应等级默认背景。
- 保存武器信息时会同步保存手动选择的 card_background_url 到 Supabase AI assets，前端卡牌会使用该背景。

## 2026-05-25 - 后台分栏切换和橱窗构图控制

- 后台新增待审核/已通过/推广证明顶部切换，避免已通过武器被长页面埋住。
- 主体图与橱窗区新增构图控制，可调武器左右中心、上下中心、缩放和旋转。
- 本地橱窗生成器会读取构图参数，点击“按构图重做橱窗”即可重新生成。
- 构图参数会写入 Supabase AI assets，便于后续继续调整。

## 2026-05-25 - 内置武器纳入已通过管理

- 后台“已通过武器”现在会合并显示网站原始 11 把内置武器和云端审核通过武器。
- 内置武器按统一标准补齐等级、战力、积木数、背景、展示图和推荐 MBTI 角色。
- 内置武器可在后台调整资料、卡牌背景和橱窗构图，修改先保存到本机后台，避免已通过列表空白。

## 2026-05-25 - 背景缩略图和构图控制显性化

- 卡牌背景选择从纯下拉框升级为 20 张可见缩略图网格，点击图片即可选择背景。
- 背景区域保留大图预览，方便对比当前卡牌效果。
- 主体图与橱窗面板默认展开，武器左右、上下、缩放、旋转滑杆显示实时数值。

## 2026-05-25 - 已通过后台布局减负

- 已通过武器区改为更宽松的两列/单列管理布局，避免桌面端挤成三列。
- 已通过卡片图片列加宽，编辑区留出更多呼吸空间。
- 背景图库默认折叠，平时只显示当前背景预览，需要更换时再展开选择。

## 2026-05-25 - 武器构图数值输入

- 橱窗构图控制新增数字输入框，可直接输入左右、上下、缩放和旋转数值。
- 武器缩放范围调整为 35%-220%，方便把小武器放大或把大武器收小。
- 本地橱窗生成器明确只把缩放应用到武器主体图层，背景和角色保持固定。

## 2026-05-25 - 卡牌背景残留修复

- 检查了 20 张卡牌背景，发现 06-20 存在从背景拼图切片带来的上一排图像残留。
- 重新从原图裁切并恢复 640x860 尺寸，清除了顶部残留边缘。
- 同步更新背景 contact sheet，方便后续继续检查背景图库质量。
