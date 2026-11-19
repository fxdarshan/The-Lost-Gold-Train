# Handoff

The bridge between sessions (Claude Code at home, claude.ai chat elsewhere). **Read it first, update it last**, every session. Newest entry at the top; keep the last 5.

## Now
- **State:** full symbol set from Darshan's *Last Train Gold* sheet: 15 pay symbols, Wild and Power Dynamite (×2/×3/×5/×10) on reels 2-4, a separate train-badge Scatter; Book of Tut free spins with the expanding symbol + 100× buy. RTP 96.6–97.3% (4 × 5M, average 97.0%), buy 95.7–96.2%, free spins 1 in 177, hit rate 21.4%. 22/22 edge cases. 16 symbols have 2.5 s win animations (all but the A and Power Dynamite). Banners, lantern and sounds are still placeholders.
- **Animations:** parked by Darshan (2026-11-17): "better but not very smooth and sensible".
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
