# Changelog

Newest first.

## 2026-11-16: more win animations, smooth 1.5 s loops
- Five more sheets from Darshan: Revolver and Dynamite are in the game (the Dynamite's art is now the timer tile; the fuse strip was rebuilt from it). Wanted poster, money bag and horseshoe are processed but not symbols.
- `anim_from_keys.py`: `--settle` (neutral end keys use pose 1, so every loop lands exactly on its start), `--soft` (smoke and fire dissolve), stricter alignment, and a per-frame smoothness report. All nine loops re-made; wrap steps 0 to 0.2.
- `lineCycle` 36 → 45 frames, so each line in the line-by-line view plays the full 1.5 s animation.

## 2026-11-16: symbol win animations
- Darshan's 16-key-pose sheets for the Outlaw, Sheriff's Star and Gold Bars turned into 45-frame, 30 fps loops following his brief (`docs/symbol-animation-prompt.md`): new tool `tools/asset-pipeline/anim_from_keys.py` (light mode for the gold and badge, optical-flow motion for the Outlaw, position/border lock, watermark removal). Frame 1 is now each symbol's idle art.
- Game: winning symbols play their sheet (`anims` in `assets/manifest.js`, `Assets.anim`); animated symbols skip the pop/scale.
- The steam train sheet is processed (`assets/images/anims/train_win.webp`) but not used: the train isn't a game symbol.

## 2026-11-16: backgrounds
- Darshan's backgrounds imported: `bg_base_main` (sunset canyon with the train) and `bg_freegame_main` (inside the gold wagon), cover-cropped to 1920×1080 (sources 1672×941, scaled about 15% up). Originals in `assets/source/originals/backgrounds/`.
- The art has no reel frame, so the game now draws a timber frame with rivets and dark plank panels behind the reels (`CONFIG.reelFrame`), cooler in free spins.

## 2026-11-16: logo
- Darshan's logo (`assets/source/originals/logo/The_Lost_Gold_Train.png`, already transparent) imported as `ui_splash_logo`. It's shown top left above the Outlaw, as in the art references, with a slow shimmer, and on the loading screen. Without logo art, the title is drawn in text above the reels.
- Left column re-laid out: logo, mascot, then BUY FREE SPINS at the bottom (the free spins card takes its place). Positions are in `CONFIG.logo`, `CONFIG.mascot` and `CONFIG.buyButton`.

## 2026-11-16: first playable build
- **Specs:** GDD, rules, pay table and asset spec written for The Lost Gold Train (original *Book of Tut* maths and feature buy, Darshan's choice).
- **Maths:** 9 symbols with the reference pay table (The Outlaw, Sheriff's Star, Revolver, Gold Bars, A–10) plus Dynamite as Wild + Scatter. New feature buy at 100× (weighted 3/4/5 Dynamite trigger; bought free spins with their own special-symbol shares). Free spins now give the special symbol a fixed per-symbol share of each reel (replaces the multiplier), so the Outlaw is the dream special. Tuned: RTP 96.65–97.29% over 4 × 6M rounds, free spins 1 in 178, median round 59×, feature buy return 95.5–96.4%. Hit rate 26.8% (reference 31–33%), flagged.
- **Art:** Darshan's *Last Train Gold* pack: symbols cut from their white background (`tools/asset-pipeline/cut_white_tiles.py`), the full-body Outlaw as mascot and full-reel expansion, a fuse strip composed from the dynamite. Originals in `assets/source/originals/last_train_gold/`.
- **Presentation:** reels moved right; the Outlaw mascot stands on the left (idle sway, hops on big wins and free spins); BUY FREE SPINS button (tap twice), replaced by the special symbol card in free spins; western placeholder backgrounds until the real ones arrive.
- **Code:** symbol ids now come from `CONFIG.regular` / `CONFIG.SCATTER` everywhere (no fixed 0–10 / 11).
- **Checks:** 22/22 edge cases (two new for the buy); all scenarios and outcomes play with no page errors.

## 2026-11-16: art direction
- `docs/art-direction.md`: watercolour Western direction from Darshan's references (saved in `docs/art-reference/`), proposed symbol set in Book of Tut roles, free spins moments, prompts for every asset ID. No code changes.

## 2026-11-16: The Lost Gold Train started
- New repo from `slot-starter-template`. Title set to The Lost Gold Train (`CONFIG.title`, `CONFIG.texts`).
- `docs/reference-game.md`: research on *John Hunter and the Book of Tut* (rules, pay table, RTP variants, measured play stats, feature buy, the separate Respin version, unknowns), every fact with its source.
- Game still plays the template's sample maths and placeholder art.

## 2026-11-16: template created
- Made from New Year Crackers (`fxdarshan/01_New_Year_Crackers` at 9afcb2b): game art removed, sample config with neutral symbol names (Crown, Ruby, Emerald, Sapphire, Gold Bar, Coins, A-10, Scatter), theme texts moved to `CONFIG.texts`, the single-file build named after `CONFIG.title`.
- Art inbox `art/` and `tools/asset-pipeline/import_art.py`: files named by asset ID are imported with no manifest edits. Mockup clean-up tools take the reel window as an argument.
- Optional art (`sym_00_expanded`, `fx_lantern`, banners, splash logo) is only drawn when supplied.
- `CLAUDE.md` house rules, `HANDOFF.md`, `WORKFLOW.md` (Claude Code at home + claude.ai chat elsewhere, GitHub as the bridge), `NEW_GAME.md`, spec templates in `docs/templates/`, and five project skills in `.claude/skills/`.
- Checks: 20/20 edge cases pass with placeholder art.
