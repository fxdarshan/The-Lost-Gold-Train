# Starter Slot (sample game): Animation Timings

There is no animation spec for this game yet. These are the prototype's own timings, in frames at 30 fps (`CONFIG.frames` in `src/config.js`). All of them scale with the demo panel's speed slider.

| Key | Frames | What |
| --- | --- | --- |
| `symWin` | 10 / 20 / 15 | winning symbol: pop to 112% with a glow, hold with a small bob, settle |
| `lineCycle` | 45 | each winning line on its own after the all-lines view (skipped in autoplay) |
| `scatterLand` | 12 | Scatter squash when it lands |
| `anticipation` | 45 per reel | extra spin time for each reel after two Scatters are showing, with a glowing frame (and the fx_lantern decoration if supplied) |
| `fuse` | 24 / 18 / 18 | trigger: the full-reel Scatter art (fx_scatter_full) is revealed down the reel, sparks pop, settle |
| `pick` | 90 / 30 | special symbol pick: cycle and slow down, then hold on the pick |
| `expand` | 12 / 24 / 12 | special symbol flashes, each reel grows to a full column (staggered left to right), settle |
| `expandLines` | 45 | all 10 lines and the expansion amount |
| `banner` | 30 / 90 / 30 | modals and big win banners: in, hold, out |
| `bannerTally` | 30 to 105 | big win count-up inside the banner |
| `summaryTally` | 75 | free spins summary count-up |
| `transToFree` | 15 / 45 / 15 | curtain to free spins |
| `transToBase` | 60 | zoom back to the base game |
| `bgBaseLoop` | 120 | warm light breathing either side of the reels |

Reel spin: first reel stops after 1.0 s, then every 0.18 s, with a small bounce (`CONFIG.spin`).

## Prototype implementation status
- **Win loop rule (Darshan, 2026-11-19):** in the base game, winning symbols keep playing their win animation in a loop after the round ends, until the player starts the next spin (`CONFIG.loopWinsUntilSpin`). Not in free spins, and not on the spin that starts free spins. During a round every win still plays at least two full loops before moving on.
- **The Outlaw symbol (2026-11-19):** taken from Darshan's video (`assets/source/originals/anims/video/01_outlaw_symbol.mp4`, 150 frames at 30 fps). 45 frames picked by motion (60% equal visual change, 40% time), white background cut away, the last 7 frames morphed into frame 1 with optical flow so the loop is seamless; 1.5 s at 30 fps, 9×5 sheet of 320×272 cells. Tool: `tools/asset-pipeline/anim_from_video.py`. Frame 1 is the Outlaw's idle art.
All timings above are used by `src/game.js`.
- 2026-11-19: symbol win animations for 12 symbols and the mascot's idle 1 / idle 2 / win now come from Darshan's image-to-video clips (see `docs/symbol-video-prompts.md`, `docs/outlaw-fullbody-video-prompts.md`). Symbol loops are 2.5 s (about 2× the clip speed); the mascot plays at the clips' real speed (12-15 fps with frame blending).
- 2026-11-19: optimised: symbol loops are 50 frames at 20 fps (still 2.5 s) and the mascot 10-12 fps; the renderer blends each frame into the next.
- 2026-11-19 (later): Darshan's rule: every animation at 30 fps; symbol win loops 1.5 s = 45 frames, stored as 45 whole frames (no blending). The win display holds three loops (`symWin` 135 frames, `lineCycle` and `expandLines` 135). The mascot is stored at 15 fps and played in 30 fps steps, each frame blended into the next.
