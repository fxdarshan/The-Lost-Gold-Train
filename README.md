# The Lost Gold Train (prototype)

**Win presentation:** base game wins keep looping their symbol animation until the next spin (`CONFIG.loopWinsUntilSpin`).

**Play online:** https://fxdarshan.github.io/The-Lost-Gold-Train/ (GitHub Pages, updates on every push to `main`)

A Wild West book-style slot in hand-painted watercolour. **The Outlaw** is the top symbol and the mascot beside the reels; every symbol of the *Last Train Gold* asset sheet is in play: 15 pay symbols, a Wild and **Power Dynamite** (a Wild with a ×2 to ×10 multiplier) on the middle reels, and a train-badge Scatter. Three or more Scatters give 10 free spins with a random expanding symbol, and free spins can also be bought for 100× the bet. Features and maths follow Pragmatic Play's *John Hunter and the Book of Tut* (the original); the separate Wild, Power Dynamite and the six extra pictures are additions (ASSUMED, GDD §7).

Started 2026-11-16 from [`fxdarshan/slot-starter-template`](https://github.com/fxdarshan/slot-starter-template). Current state and next steps: [`HANDOFF.md`](HANDOFF.md).

| Doc | Covers |
| --- | --- |
| [`docs/reference-game.md`](docs/reference-game.md) | research on the reference game: rules, pays, measured play, sources |
| [`docs/reference-gdd.md`](docs/reference-gdd.md) | design: numbers, symbols, flow, layout, decisions, open questions |
| [`docs/official-game-rules.md`](docs/official-game-rules.md) / [`docs/pay-table.md`](docs/pay-table.md) | rules and pays |
| [`docs/art-direction.md`](docs/art-direction.md) | watercolour Western direction, symbol set, prompts for the missing art |
| [`docs/game-asset-specification.md`](docs/game-asset-specification.md) | each asset ID, its source file, what is still missing |
| [`docs/cheats.md`](docs/cheats.md) / [`docs/edge-cases.md`](docs/edge-cases.md) | demo tools; checks |

## Play it
Single file: [`dist/the-lost-gold-train-prototype.html`](dist/the-lost-gold-train-prototype.html) (download and double-click), or `python3 -m http.server 8000` and open http://localhost:8000.

## Mechanics
| Feature | Rule |
| --- | --- |
| Grid | 5×3, 10 fixed lines, left to right, highest win per line |
| Symbols | The Outlaw (2/3/4/5 = 1/10/100/500×), Steam Train, Gold Bars, Sheriff's Star, Wanted Poster (pay from 2); Dynamite, Revolver, Money Bag, Horseshoe, Lantern, A, K, Q, J, 10 (from 3) |
| Wild | reels 2-4; substitutes for every pay symbol |
| Power Dynamite | reels 2-4; a Wild with ×2, ×3, ×5 or ×10; multipliers on a line add up and multiply its win |
| Scatter | 3/4/5 anywhere pay 2/20/200× and award 10 free spins |
| Free spins | random special symbol; when on enough reels to win it fills them and pays on all 10 lines, adjacent or not; 3+ Scatters add 10, no limit |
| Feature buy | 100× the bet: a 3/4/5-Scatter trigger spin, then bought free spins |
| Max win | 5,500× the bet per round |

## Maths (`node tools/simulate.js 5000000 <seed>`, 4 seeds)
| | Prototype | Reference |
| --- | --- | --- |
| RTP | 96.8% to 97.9% (average 97.4%, ±0.5% run to run; 4 × 5M, paylines from the reference 2026-11-19) | 96.50% |
| Base / free spins | 53% / 44.5% | |
| Free spins | 1 in 177; median round 50×, mean 78× | 1 in 150 to 174; median 60×, mean 80.7× |
| Feature buy return | 95.6% to 96.7% | not published |
| Hit rate | 21.4% | 31% to 33% |
| Max win | 5,500× cap, about 1 in 5 million | 1 in 1 billion |

Decisions and open questions: GDD §7 and §8.

Win animations (every symbol except the A and Power Dynamite): `docs/symbol-animation-prompt.md`.

## About the template

A ready-to-run HTML5 slot prototype to start every new game from. It ships with a working sample game, **Starter Slot**: book-style, 5×3, 10 lines, the features and maths of *John Hunter and the Book of Tut*, and code-drawn placeholder art. A new game replaces the specs, the values and the art; the engine, demo tools, checks and build stay.

Built from New Year Crackers (https://github.com/fxdarshan/01_New_Year_Crackers), which came from X-Mas Dolls (https://github.com/fxdarshan/Demo-SLot-Game).

## Start here
| File | What |
| --- | --- |
| [`NEW_GAME.md`](NEW_GAME.md) | start a new game: make the repo, fill the input pack, build, review |
| [`WORKFLOW.md`](WORKFLOW.md) | working from Claude Code at home and claude.ai chat elsewhere, with GitHub as the bridge |
| [`CLAUDE.md`](CLAUDE.md) | house rules every Claude session follows |
| [`HANDOFF.md`](HANDOFF.md) | where the last session stopped and what's next |
| [`art/README.md`](art/README.md) | how to name and drop in art |
| [`docs/templates/`](docs/templates) | blank spec templates to fill in for a new game |

Skills in `.claude/skills/`: `slot-new-game`, `slot-prototype-from-spec`, `slot-asset-integration`, `slot-math-audit` (`/slot-math-audit`), `slot-project-sync`.

## Run it
```bash
python3 -m http.server 8000      # then open http://localhost:8000
```
Or open `index.html` directly. `node tools/build-single.js` writes one self-contained file to `dist/<title>-prototype.html` (images embedded) to share or double-click.

**Controls:** SPIN or Space, i for the paytable, − / + for the bet, AUTOPLAY, D for the demo panel, C for cheats.

## What's in the box
| Part | File |
| --- | --- |
| All values (grid, lines, pays, weights, features, timings, layout, texts) | `src/config.js` |
| Pure maths: `resolveSpin(grid, opts)` → ordered steps (`win`, `scatter`, `expand`) | `src/engine.js` |
| Canvas presentation: reels, anticipation, wins, Scatter reveal, special symbol pick, expansion, banners, modals, transitions, HUD, free spins flow, max-win cap | `src/game.js` (the mascot plays three video sheets, `C.mascotVideo`; `src/rig.js` is the puppet fallback) |
| Scripted outcomes from real engine results | `src/director.js` |
| Cheat menu, hotkeys, scenarios, `?scenario=` links | `src/cheats.js`, `docs/cheats.md` |
| Demo panel: outcome list, custom grid, speed, video recording with sound | `src/devpanel.js` |
| Asset IDs and paths; placeholder art | `assets/manifest.js`, `src/placeholders.js` |
| Splash screen, synthesised sounds | `src/splash.js`, `src/audio.js` |
| Monte Carlo RTP and frequencies | `tools/simulate.js` |
| 20 edge-case checks in headless Chrome | `tools/edge-cases.py`, `docs/edge-cases.md` |
| Art import and clean-up | `tools/asset-pipeline/` |


### Buy Feature popup (2026-11-21)
- Darshan's clean final pack (`art/ui/buy/supplied/`, 2026-11-21): one PNG per control, used unscaled and unrecoloured. `popup_board_with_title.png` carries the title and the chains; its top is placed at the top of the screen so the chains reach the top edge. Scale-only interaction: options and main button 1.00 / hover 1.04 / pressed 0.97 / release 1.02 for 80 ms, close 1.08 / 0.92 / 1.03 for 70 ms; 120 ms, cubic-bezier(0.2, 0.8, 0.2, 1). Overlay 60% black over 120 ms; board 0.98 → 1.00 over 140 ms, closing over 120 ms. `tools/asset-pipeline/clean_buy_ui_final.py` only trims slivers of neighbouring items at the edges of some PNGs. The separate title PNG and the decor PNGs are not used (the board already has them).
- **ASSUMED rules for Super Free Spins and Feature Max** (Darshan 2026-11-21: "go ahead and implement"): the expanding symbol lands more often (`C.buy.options[].specialShare`, TUNED), and Feature Max also picks the expanding symbol from the four top symbols only (Outlaw, Steam Train, Gold Bars, Sheriff's Star). Measured: Free Spins 95.3–96.8%, Super Free Spins 95.7–96.2% (4 × 200,000 buys), Feature Max 96.2–96.4% (2 × 200,000 buys). The base game RTP is unchanged.
- Buying from the popup skips the visible trigger spin: the transition plays at once, the bought trigger board (3–5 Scatters) is placed and paid under it, then the expanding symbol is picked inside free spins. Clicking outside the wooden board closes the popup.


### Big Win and Free Spins outro (2026-11-21)
- Big Win uses Darshan's five screens (Nice, Big, Mega, Super, Epic), one at a time, with the amount counting up below. The old six-step ladder is now five: **SENSATIONAL is merged into EPIC and EPIC starts at 250× (ASSUMED; was 500×)**. Presentation only, no RTP change. Measured: Nice 1 in ~125 spins, Big ~240, Mega ~505, Super ~870, Epic ~3,150. Timing from his spec: in 0.88→1 over 350 ms, tier swap (out 1→1.05 in 180 ms, next 0.92→1 in 280 ms), hold with 1.015 breathing, out 1→0.96 in 250 ms; light coin drift on Mega and above only.
- Free Spins outro uses his background, board, ribbon and gold pile; FREE SPINS, TOTAL WIN, the amount and IN n FREE SPINS are drawn in code from the round result. The pieces came as crops of a presentation sheet: the dark sheet background and labels were keyed out, and the board's cut-off right edge was completed by mirroring its left half (`tools/asset-pipeline/prep_bigwin_outro.py`). The supplied files are small (screens ~290 px, board 340 px, background 560×114), so they look soft at full screen.


### Music (2026-11-21)
Darshan's own tracks (originals in `art/audio/`): base game `basegame_loop_bgm.wav` (108 BPM, 2:03) and free spins `freegame_loop_bgm.mp3` (140 BPM, 0:15). Both end with a fade-out, so `tools/audio/make_loop.py` finds the section that repeats in the music and cuts the file before the fade: each track plays from the top once, then loops that section (base 36.67–89.99 s, 24 bars; free spins 3.60–10.47 s, 4 bars) with a 60 ms cross-fade at the jump. The music itself is unchanged; the base track's last section and fade (90–123 s) and the free spins ending are not heard. Loop points are in `ASSET_MANIFEST.music`. (`tools/audio/compose_music.py` holds the earlier code-made placeholder music.)

### Free spins transition video (2026-11-23)
Darshan's Magnific (MiniMax) clip of the train hold-up (`assets/source/originals/transitions/trans_a_magnific_minimax_24fps.mp4`, 1152×768, 24 fps; prompt in `docs/transition-image-prompts.md`). It starts and ends on green and cross-fades the scene in and out. Video can't carry transparency in every browser, so `tools/asset-pipeline/transition_from_video.py` measures one opacity per frame, removes the green from the fading frames and writes an opaque `assets/video/trans_to_free.webm` (VP9, 2.6 MB) and `.mp4` (H.264, 3.5 MB, for Safari). The game draws each frame with that opacity over the reels: the train fades in over the base game, the game switches to free spins underneath at frame 60 (fully covered), and the scene fades out onto free spins. The clip is cut at frame 215 (9 s) because its tail never quite returned to green. Gunshot sound on the muzzle-flash frames 86, 106, 118 and 130. If the video can't play, the earlier code-drawn gunfight runs instead. The clip came out in a smoother painted-3D look than the watercolour key art; kept as supplied. Back to the base game still uses the code zoom-out.

## Sample game maths
`node tools/simulate.js 4000000 <seed>`: RTP 95.9% to 98.2% across six seeds (average about 96.6%; target 96.50%), free spins about 1 in 163, base hit rate about 28%, max win capped at 5,500×. The spread is the game's high volatility, not a bug: tune a real game over several seeds.

## Decisions in the sample
Gold Bar and Coins are extra symbols with ASSUMED pays (1/5/25×); the line shapes are the classic 10-line book layout; the weights and the free spins boost are TUNED. Details: `docs/reference-game.md`, `docs/pay-table.md`.
