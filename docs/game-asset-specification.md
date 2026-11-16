# The Lost Gold Train: Asset Specification

Every asset ID in `assets/manifest.js`, where its art came from, and what is still missing. Art direction: `docs/art-direction.md`. Supplied pack: `Last_Train_Gold_Separated_Assets.zip` (2026-11-16), kept unchanged in `assets/source/originals/last_train_gold/`; the cut-outs made from it are in `art/`.

## Delivered

| ID | Pack file | Processing |
| --- | --- | --- |
| `sym_00_idle` The Outlaw | `01_character_portrait.png` | white background removed (`cut_white_tiles.py`) |
| `sym_01_idle` Sheriff's Star | `04_sheriff_badge.png` | same |
| `sym_02_idle` Revolver | `07_revolver.png` | same |
| `sym_03_idle` Gold Bars | `03_gold_bars.png` | same |
| `sym_04_idle` … `sym_08_idle` A, K, Q, J, 10 | `11_royal_A` … `15_royal_10` | same |
| `sym_scatter_idle` Dynamite | `19_power_symbol_dynamite.png` | same, neighbour slivers dropped |
| `char_mascot` | `24_full_body_outlaw_character.png` | already transparent; resized to 1200 px high |
| `sym_00_expanded` | `24_full_body_outlaw_character.png` | cropped to the reel's tall shape |
| `bg_base_main` | `basegame.png` (Darshan, 2026-11-16: sunset canyon, train on the curve, lantern post) | 1672×941 cover-scaled to 1920×1080 (about 15% up; edges cropped by a few px) |
| `bg_freegame_main` | `freegame.png` (inside the gold wagon, GOVT. GOLD crates, lantern) | same |
| `sym_00_win`, `sym_01_win`, `sym_03_win` | `0X_*_spritesheet.png` (16 key poses each) | 45-frame win animations, 9×5 sheets of 320×239 frames (`anim_from_keys.py`, see `docs/symbol-animation-prompt.md`); frame 1 replaces the idle art of the Outlaw, Sheriff's Star and Gold Bars |
| `ui_splash_logo` | `The_Lost_Gold_Train.png` (Darshan, 2026-11-16; already transparent) | trimmed to 1200×763 WebP; shown top left of the game and on the loading screen |
| `fx_scatter_full` | `19_power_symbol_dynamite.png` | composed: the dynamite at the top and a painted fuse down the reel with a burning tip (made in the prototype; replace with painted art if wanted) |

Symbols are framed tiles about 280×230 px. They fill a 260×230 cell, so they're shown near their native size.

## Not used (kept in the originals folder)
`02_steam_train`, `05_wanted_poster`, `06_dynamite_timer` (tile version of the Dynamite), `08_money_bag`, `09_horseshoe`, `10_lantern` (a framed tile, not a hanging lantern), `16_character_bust`, `17_wild`, `18_scatter`, `20`–`23` multipliers, and the reference sheets. Reason: the reference game has no separate Wild, no multipliers and no extra symbols (GDD §7).

## Still needed (code-drawn placeholders until supplied)

| ID | What | Prompt |
| --- | --- | --- |
| `banner_win_nice` … `_epic` | painted signboards with gold Western lettering | art direction §4 |
| `fx_lantern` | hanging railway lantern (transparent) | art direction §4 |
| sounds | music and effects named in `assets/manifest.js` | |

## Prototype implementation status
16 of 23 image IDs are delivered. The backgrounds have no reel frame painted in, so the game draws a timber frame with dark plank panels (`CONFIG.reelFrame`). and loaded. Upload new art to `art/` named by asset ID; it is imported with `tools/asset-pipeline/import_art.py`.
