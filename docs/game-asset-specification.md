# The Lost Gold Train: Asset Specification

Every asset ID in `assets/manifest.js`, where its art came from, and what is still missing. Art direction: `docs/art-direction.md`. Supplied pack: `Last_Train_Gold_Separated_Assets.zip` (2026-11-16), kept unchanged in `assets/source/originals/last_train_gold/`; the cut-outs made from it are in `art/`.

## Delivered

| ID | Pack file | Processing |
| --- | --- | --- |
| `sym_00_idle` The Outlaw | `01_character_portrait.png` | frame 1 of its win animation |
| `sym_01_idle` Steam Train | `02_steam_train` sheet | frame 1 of its win animation |
| `sym_02_idle` Gold Bars | `03_gold_bars` sheet | frame 1 of its win animation |
| `sym_03_idle` Sheriff's Star | `04_sheriff_badge` sheet | frame 1 of its win animation |
| `sym_04_idle` Wanted Poster | `05_wanted_poster` sheet | frame 1 of its win animation |
| `sym_05_idle` Dynamite | `06_dynamite_timer` sheet | frame 1 of its win animation |
| `sym_06_idle` Revolver | `07_revolver` sheet | frame 1 of its win animation |
| `sym_07_idle` Money Bag | `08_money_bag` sheet | frame 1 of its win animation |
| `sym_08_idle` Horseshoe | `09_horseshoe` sheet | frame 1 of its win animation |
| `sym_09_idle` Lantern | `10_lantern` sheet | frame 1 of its win animation |
| `sym_10_idle` A | `11_royal_A` | white background removed |
| `sym_11_idle` … `sym_14_idle` K, Q, J, 10 | their sheets | frame 1 of the win animation |
| `sym_wild_idle` Wild | `17_wild` sheet | frame 1 of its win animation (now a framed tile like the others) |
| `sym_scatter_idle` Scatter | `18_scatter` sheet | frame 1 of its win animation |
| `sym_power_idle` Power Dynamite | `19_power_symbol_dynamite.png` | white background removed; one picture for all four multipliers |
| `mult_x2`, `mult_x3`, `mult_x5`, `mult_x10` | `20`–`23_multiplier_*.png` | white background and neighbour slivers removed; drawn on the lower right of Power Dynamite and in the paytable |
| `char_mascot` | `24_full_body_outlaw_character.png` | already transparent; resized to 1200 px high |
| `sym_00_expanded` | `24_full_body_outlaw_character.png` | cropped to the reel's tall shape |
| `bg_base_main` | `basegame.png` (Darshan, 2026-11-16: sunset canyon, train on the curve, lantern post) | 1672×941 cover-scaled to 1920×1080 (about 15% up; edges cropped by a few px) |
| `bg_freegame_main` | `freegame.png` (inside the gold wagon, GOVT. GOLD crates, lantern) | same |
| `sym_00_win` … `sym_09_win`, `sym_11_win` … `sym_14_win`, `sym_wild_win`, `sym_scatter_win` | Darshan's `*_spritesheet.png` sheets (16 key poses each) | 75-frame win animations at 30 fps (2.5 s; were 45 frames / 1.5 s until Darshan found them too fast), 10×8 sheets of 320×240 frames (`anim_from_keys.py`, see `docs/symbol-animation-prompt.md`). Renumbered on 2026-11-16 for the full symbol set: the train, poster, money bag and horseshoe animations are now in use |
| `ui_splash_logo` | `The_Lost_Gold_Train.png` (Darshan, 2026-11-16; already transparent) | trimmed to 1200×763 WebP; shown top left of the game and on the loading screen |
| `fx_scatter_full` | `18_scatter.png` | composed: the train badge at the top and a railway track down the reel with a headlight glow (made in the prototype; replace with painted art if wanted) |

Symbols are framed tiles about 280×230 px. They fill a 260×230 cell, so they're shown near their native size.

## Not used (kept in the originals folder)
`16_character_bust` (the portrait is the symbol) and the reference sheets. Every other piece of the pack is in the game since 2026-11-16 (GDD §7).

## Still needed (code-drawn placeholders until supplied)

| ID | What | Prompt |
| --- | --- | --- |
| `banner_win_nice` … `_epic` | painted signboards with gold Western lettering | art direction §4 |
| `fx_lantern` | hanging railway lantern (transparent) | art direction §4 |
| sounds | music and effects named in `assets/manifest.js` | |
| `sym_10_win` (A) and Power Dynamite win animations | 16-key-pose sheets like the others | `docs/symbol-animation-prompt.md` |

## Prototype implementation status
- **The Outlaw symbol (2026-11-19):** taken from Darshan's video (`assets/source/originals/anims/video/01_outlaw_symbol.mp4`, 150 frames at 30 fps). 45 frames picked by motion (60% equal visual change, 40% time), white background cut away, the last 7 frames morphed into frame 1 with optical flow so the loop is seamless; 1.5 s at 30 fps, 9×5 sheet of 320×272 cells. Tool: `tools/asset-pipeline/anim_from_video.py`. Frame 1 is the Outlaw's idle art.
32 of 39 image IDs are delivered. The backgrounds have no reel frame painted in, so the game draws a timber frame with dark plank panels (`CONFIG.reelFrame`). Upload new art to `art/` named by asset ID; it is imported with `tools/asset-pipeline/import_art.py`.
- 2026-11-19: new assets `sym_power_win`, `char_outlaw_idle1`, `char_outlaw_idle2`, `char_outlaw_win`; the idles of sym_01-09, Wild, Scatter and Power Dynamite are now frame 1 of their videos.
- 2026-11-21: Buy Feature UI in the game: `ui_buy_buy_btn_*`, `ui_buy_option_{free_spins,super_free_spins,feature_max}_*`, `ui_buy_close_*` (normal/hover/pressed/release), `ui_buy_popup_frame`, `ui_buy_popup_title_buy_free_spins`.
- 2026-11-21 (later): Buy UI replaced by the simplified pack: `ui_buy_buy_free_spins_button`, `ui_buy_popup_board`, `ui_buy_popup_chain_extension`, `ui_buy_popup_title_buy_free_spins`, `ui_buy_option_{free_spins,super_free_spins,feature_max}`, `ui_buy_close_button` (one image each, scale-only states).
- 2026-11-21 (final): Buy UI from the clean final pack: `ui_buy_buy_free_spins_button`, `ui_buy_popup_board_with_title`, `ui_buy_option_{free_spins,super_free_spins,feature_max}`, `ui_buy_close_button`.
- 2026-11-21: `ui_buy_decor_wood_plank` (from the clean final pack) is the free spins board for the expanding symbol, top right.
- 2026-11-21: `banner_win_{nice,big,mega,super,epic}` are full Big Win screens (Darshan's pack); `ui_outro_bg`, `ui_outro_board`, `ui_outro_ribbon`, `ui_outro_gold` build the Free Spins outro. Originals in `art/banners/bigwin_pack/` and `art/ui/outro_pack/`.
