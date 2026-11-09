# Mumu Brick Weapons Project

## Project Vision

Mumu Brick Weapons is a cute premium brick-toy web platform. The long-term goal is to let players upload real brick weapon photos, turn them into collectible weapons, discuss ideas in a forum, battle with MBTI brick characters, and eventually bring real-world brick builds into AR battles.

The site should feel like a polished toy product experience: soft, cute, high quality, easy to use, and fun enough for short-video promotion.

## Current Product

- Chinese website: https://old-nine86.github.io/mumu-weapons/
- English website: https://old-nine86.github.io/mumu-weapons/en/
- Admin console: https://old-nine86.github.io/mumu-weapons/admin.html
- Backend: Supabase project shared by Chinese site, English site, forum, uploads, review workflow, and admin tools.

## Completed Milestones

### Phase 1: Visual Rebuild

- Rebuilt the site from dark sci-fi style into cute premium brick style.
- Added soft toy-stage colors, rounded product-page layout, and brick-themed hero/banner assets.
- Reworked weapon cards and page sections for a more polished toy collection feel.

### Phase 2: Character System

- Preserved 16 MBTI characters.
- Rebuilt character visuals into a unified cute brick-character style.
- Added richer collectible-card information: MBTI identity, personality, stats, skills, quotes, and weapon preference.
- Improved battle personality through character-specific lines and stats.

### Phase 3: Battle System

- Reworked the battlefield presentation.
- Added more readable battle flow, HP behavior, skills, and round logs.
- Made character selection and battle results more fun and easier to understand.

### Phase 4: User Uploads

- Added player weapon upload flow.
- Added local image compression and background-cleaning logic.
- Added automatic weapon type recognition and AI-style stats: brick count, power, defense, crit, complexity, balance, and confidence.
- Increased default upload allowance to 50 per visitor.

### Phase 5: Cloud Backend And Review

- Added Supabase backend.
- Uploaded weapons enter a pending review queue first.
- Approved weapons appear publicly across devices.
- Added admin approval tools.
- Added promotion proof submission and admin review.

### Phase 6: Admin Management

- Added admin page for weapon review.
- Added admin editing for uploaded weapon information.
- Added support for showcase images.
- Added bilingual fields so the same database can power Chinese and English sites.

### Phase 7: Forum

- Added a forum system for suggestions and discussion.
- Forum posts and replies use the same cloud backend. They are public by default right now; account identity and forum pre-review are future moderation upgrades.

### Phase 8: Bilingual Site

- Added English website under `/en/`.
- Chinese and English sites share one Supabase database.
- Admin can manage bilingual weapon fields and locale behavior.

### Phase 9: Promotion Preparation

- Prepared Douyin/Kuaishou zero-budget promotion plan.
- Created QR code and video materials.
- Prepared day-one/day-two short-video scripts and assets.
- Tested publishing workflow for Kuaishou and Douyin.
- Added an in-site promotion task center with seven-day content scripts, copyable captions, and promotion proof submission.
- Connected quiz results, battle results, and weapon showcases to the promotion center with ready-to-post captions and proof templates.

### Phase 10: MBTI World Tree

- Added `人格世界树`, an Obsidian-like relationship map for the 16 MBTI brick characters.
- Added a generated premium brick world-tree background asset under `assets/world-tree/`.
- Added character nodes, relationship lines, faction guidance, relationship highlighting, and character/profile navigation.
- Added Chinese and English comic galleries connected to the same character universe.

### Phase 11: Build Manuals And Sandbox Construction

- Added bilingual build-manual studios for library weapons and uploaded photos.
- Added calibrated local image analysis, distinct color groups, parts lists, build steps, copy/print actions, modal entry points, and deep links.
- Added a secure optional Supabase Edge Function contract for OpenAI vision analysis, with local Canvas analysis retained as an automatic fallback.
- Expanded the standalone sandbox with five selectable build materials, stable touch controls, crafting, world progression, and verified block placement.

### Phase 12: Commercial Configuration Foundation

- Added one shared bilingual configuration file for product, affiliate, and creator-support destinations.
- Enabled outbound actions only when a destination is active, verified, and uses HTTPS.
- Kept unavailable purchases and creator support visibly disabled while preserving useful forum, sharing, and gallery actions.
- Added current-device click counts that store only item IDs and totals, with no identity or profile data.

### Phase 13: Sandbox Core Modules

- Extracted deterministic world generation and tile data from `game.html`.
- Extracted inventory, recipes, building placement, mining, and collision rules into a reusable pure module.
- Added a validated V4 save format with V2/V3 migration and persisted world edits.
- Fixed star-core altar activation so crafting materials are charged once and inventory cannot be driven negative.
- Added focused automated tests for world generation, recipes, placement, mining, save validation, and migration.

### Phase 14: Sandbox Runtime Modules

- Extracted player creation, movement intent, vitals, healing, and terrain effects into `game/player.mjs`.
- Extracted keyboard, pointer, and mobile-control state into `game/input.mjs`.
- Extracted enemy creation, weapon attacks, energy/cooldown rules, damage, rewards, and enemy motion into `game/combat.mjs`.
- Extracted progression steps, current goals, HUD view models, and DOM rendering into `game/ui.mjs`.
- Fixed low-energy blaster attacks so they no longer fall through into unintended melee attacks.
- Prevented duplicate enemy defeat rewards and moved mobile notices away from status and control overlays.
- Expanded the automated sandbox suite from 6 to 12 tests.

## Near-Term Roadmap

The V2 preview family under `preview/` is the current art and interaction track. It is unpublished. Do not replace live `index.html`, `en/`, `admin.html`, or `game.html` until the owner explicitly asks to publish.

### Next Phase: V2 Preview Polish (high priority)

Goal: keep refining the approved character-gallery art direction — macaron colors, full-bleed brick photography, real weapon photos, pink-blue gradient cards, and a soft premium toy-cabinet feel — without changing the live site.

- Continue polishing the Chinese homepage, character gallery, and the other preview pages so they stay visually unified.
- World-tree avatar-to-frame alignment and roughly 390px mobile layout are already done in preview; keep them intact while polishing.
- Keep consumer-facing copy in plain Chinese; do not surface table, RPC, or SQL identifiers.

### Next Phase: Admin Preview To Real Data (high priority, database changes need owner approval)

Goal: land the unfinished admin capabilities that now exist as a preview: dashboard totals, forum moderation, upload-quota editing, and moderation history.

- After the owner agrees, apply `preview/v2-admin-extra-rpcs.sql` in the Supabase SQL editor so forum hide/unhide, quota writes, dashboard counts, and history work on real data.
- Keep wiring the preview admin against existing review capabilities for pending weapons, approved weapons, and promotion proofs.
- Do not replace live `admin.html` until the owner asks to publish.
- The AI refinement workbench stays on live `admin.html` for now and is not a high-priority port.

### Next Phase: Upload And Forum Preview Ready For Cutover (high priority, preview only)

Goal: finish the upload and public forum preview pages in the same art system so they can later replace the live sections.

- Keep iterating `preview/v2-upload.html` and `preview/v2-forum.html`.
- Formal replacement of the live upload and forum UI waits for an explicit publish request.

### Later, when there is spare capacity

#### Cloud Vision Deployment

Goal: activate real vision analysis without exposing provider keys in the public site.

- Deploy `analyze-brick-weapon` as a Supabase Edge Function.
- Store `OPENAI_API_KEY` only in Supabase secrets.
- Verify one Chinese and one English uploaded photo through the live endpoint.
- Monitor latency, cost, incomplete results, and fallback frequency before enabling it for every visitor.

#### Sandbox Rendering Architecture

Goal: finish the remaining Canvas and scene boundaries now that gameplay state and UI logic are modular.

- Split backgrounds, tiles, actors, effects, lighting, and minimap rendering out of `game.html`.
- Introduce a render-state snapshot so drawing code does not mutate gameplay state.
- Add lightweight render smoke tests and keep browser screenshots for desktop/mobile framing.
- Preserve the current desktop/mobile controls and visual framing during the split.

#### Commercial Activation

Goal: activate the prepared commercial slots with destinations that have been reviewed by the project owner.

- Add real product, affiliate, and creator-support URLs to `commerce-config.js`.
- Confirm destination ownership, product relevance, disclosure text, and mobile behavior before marking each record active and verified.
- Review current-device click totals during testing, then decide whether aggregated server-side analytics are worth adding.

#### Moderation And Accounts

Goal: strengthen community ownership and abuse controls as uploads and forum activity grow.

- Add user identity and personal weapon collections.
- Add server-side upload quotas and moderation history.
- Move admin-only mutations behind authenticated server-side checks.

#### Other spare-capacity items

- Port the AI refinement workbench into the V2 admin preview.
- Build English V2 preview pages.
- Publish the V2 pages to the live GitHub Pages site only when asked, after `node scripts/preflight-check.mjs` passes.

## Long-Term Roadmap

### Real AI Recognition

- Deploy and evaluate the prepared vision Edge Function for uploaded weapon photos.
- Generate weapon type, weapon name suggestions, brick count, battle stats, rarity, and description.
- In the admin review flow, use AI to remove backgrounds, generate card backgrounds, and create LEGO-style character handheld showcase images before approval.
- Improve fraud/spam detection.

### AR Brick Battles

- Let users scan real-world brick weapons or figures with a phone camera.
- Use brick count and build complexity as important battle attributes.
- Use AI to estimate real-world weapon stats.
- Eventually support real-time AR battle scenes.

### Account And Anti-Abuse System

- Add user accounts.
- Add stricter IP/account-level quota tracking.
- Add user profile pages and personal weapon collections.
- Add moderation history and abuse controls.
- Move strict upload quota and admin-only actions behind Supabase Edge Functions or another server-side layer.

### Commercialization

- Add brick toy purchase links.
- Add creator support/donation entry.
- Add sponsorship placements that fit the toy style.
- Explore affiliate links for brick toys and compatible building sets.

### Mainland China Growth

- Continue Douyin, Kuaishou, Xiaohongshu, and Bilibili content.
- Use short videos to collect new weapon/character ideas.
- Turn comments and suggestions into site updates.

## Operating Rules

- Keep GitHub Pages static frontend unless a backend feature truly requires server logic.
- Keep Supabase as the shared backend for now.
- Do not expose private keys, database passwords, or admin review keys in public docs.
- Every meaningful phase should update `DEVELOPMENT_LOG.md`.
- Every released change should be committed and pushed to `main`.
