# Handoff

The bridge between sessions (Claude Code at home, claude.ai chat elsewhere). **Read it first, update it last**, every session. Newest entry at the top; keep the last 5.

## Now
- **State:** full symbol set from Darshan's *Last Train Gold* sheet: 15 pay symbols, Wild and Power Dynamite (×2/×3/×5/×10) on reels 2-4, a separate train-badge Scatter; Book of Tut free spins with the expanding symbol + 100× buy. RTP 96.6–97.3% (4 × 5M, average 97.0%), buy 95.7–96.2%, free spins 1 in 177, hit rate 21.4%. 22/22 edge cases. Win animations: Outlaw (video, 1.5 s); Steam Train to Lantern, Wild, Scatter and Power Dynamite from Darshan's action videos (50 frames, 2.5 s); K, Q, J, 10 still key-pose sheets (re-sampled to 50 frames); the A has the code shine. Mascot: three green-screen videos (idle 1, idle 2, win) in Darshan's order. Banners, lantern and sounds are still placeholders.
- **Animations:** video pipeline: `tools/asset-pipeline/anim_from_video2.py` (symbols: tile / panel / white modes) and `mascot_from_video.py` (green screen).
- **Weight (optimised 2026-11-19):** all images 105 Mpx decoded (~420 MB RAM, was 863 MB), 26 MB on disk (was 50 MB). Symbol sheets 50 frames at 20 fps, 256 px cells; mascot 10-12 fps, 0.55 scale; the game blends neighbouring frames and scales up. Next step if still heavy: drop the puppet fallback assets or use 8 fps for the mascot win.
- **Next:** Darshan's verdict on the assumed pays and Power Dynamite rules (below); then win animations for the remaining symbols; then banners.
- **Waiting for Darshan** (GDD §8):
  1. Full symbol set: are the ASSUMED pays for the six new pictures right? Keep Power Dynamite as a multiplier Wild on reels 2-4 (multipliers add)? The earlier 9-symbol version is commit 8c3fe9d.
  2. Hit rate 21.4% against the reference's 31–33%: keep, or drop a few symbols to raise it?
  3. Win banners and a hanging lantern; prompts in `docs/art-direction.md` §4.
  4. Key-pose sheets for the A and Power Dynamite. Darshan finds the current animations soulless: new acted key-pose prompt with a timing chart in `docs/keypose-prompt-outlaw.md`; the Outlaw is done that way (with `--timing`); waiting for Darshan's verdict before redoing the other symbols.
  5. Higher-resolution symbols (about 2×) for final.
  6. Strongbox reveal for the pick: wanted?
- **Template follow-up:** backport to `slot-starter-template` the generic changes made here (symbol ids from config, feature buy, `specialShare`, Wild/Power multipliers in `evaluate`, `cut_white_tiles.py`, mascot slot, `anim_from_keys.py`).

## Log
### 2026-11-19 · claude.ai chat (28)
- Optimised: memory halved (863 → 420 MB decoded), disk 50 → 26 MB. Fewer frames + smaller cells, frame blending in `drawAnimFrame` and the mascot. `resample_sheet.py` for old sheets.
### 2026-11-19 · claude.ai chat (27)
- 12 symbol videos converted (75-frame seamless loops; Wild and Scatter are now square panels with a baked rim, Power Dynamite keyed on a soft round mask and keeps its plate). Mascot from 3 green-screen videos: order idle1 ×3, idle2, idle1 ×2; a win cuts into idle 1 with a 0.3 s cross-fade but never follows idle 2 (waits 2 idle-1 loops, `C.mascotVideo.gapAfterIdle2`). Still to do: videos for A, K, Q, J, 10.
### 2026-11-19 · claude.ai chat (26)
- Video prompts for all symbols (docs/symbol-video-prompts.md (v3, action style)); waiting for Darshan's videos, convert each with anim_from_video.py (45 frames).
### 2026-11-19 · claude.ai chat (25)
- Outlaw symbol from Darshan's video (45 frames, seamless); base-game wins loop until next spin. Live on GitHub Pages: https://fxdarshan.github.io/The-Lost-Gold-Train/
### 2026-11-17 · claude.ai chat (24)
- Outlaw cutout puppet (parts atlas v2 + original-art layers) with idle 1/2 and the blow-the-smoke win. Known: the gun shoulder is drawn by the AI torso, slightly brighter than the original poncho; a Spine export of the rig is not done yet.
### 2026-11-17 · claude.ai chat (23)
- Mascot win: draw, 3 shots, barrel to lips, blow the smoke (forearm bone in rig.js).
### 2026-11-17 · claude.ai chat (22)
- Mascot: idle 1, idle 2 (wind gust), win (quick draw, 3 shots) as keyframed rig animations.
