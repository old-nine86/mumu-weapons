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
- Forum posts and replies use the same cloud backend and review workflow.

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

## Near-Term Roadmap

### Next Phase: Upload Quality Upgrade

Goal: make uploaded weapon images cleaner and more convincing as collectible weapon cards.

- Improve background removal for common floor/background photos.
- Add clearer upload guidance: clean background, enough light, weapon fills most of the frame.
- Add upload preview states: original image, cleaned image, final weapon card preview.
- Let admin replace or upload a better showcase image after approval.

### Next Phase: Weapon Showcase Window

Goal: clicking a weapon should open a premium display window.

- Add a showcase modal for each weapon.
- Use AI-generated showcase images when available.
- Show weapon name, creator, type, brick count, AI power, skill, and analysis.
- Support uploaded weapon showcase images from admin.

### Next Phase: Character Depth

Goal: make 16 MBTI characters more distinct in personality, visuals, and battle style.

- Give each character clearer skill identity.
- Improve visual accessories based on MBTI traits.
- Add character synergy and counters.
- Improve battle logs so every personality feels different.

### Next Phase: Promotion Loop

Goal: turn site usage into natural promotion.

- Add follow/share prompts for Douyin and Kuaishou.
- Keep improving promotion proof submission and reward clarity.
- Make approved promotion rewards clearer.
- Track basic metrics manually: visits, uploads, forum posts, comments, and video performance.

## Long-Term Roadmap

### Real AI Recognition

- Use a vision AI model to inspect uploaded weapon photos.
- Generate weapon type, weapon name suggestions, brick count, battle stats, rarity, and description.
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
