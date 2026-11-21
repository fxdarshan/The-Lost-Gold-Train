# Handoff

The bridge between sessions (Claude Code at home, claude.ai chat elsewhere). **Read it first, update it last**, every session. Newest entry at the top; keep the last 5.

## Now
- **State:** full symbol set from Darshan's *Last Train Gold* sheet: 15 pay symbols, Wild and Power Dynamite (×2/×3/×5/×10) on reels 2-4, a separate train-badge Scatter; Book of Tut free spins with the expanding symbol + 100× buy. RTP 96.8–97.9% (4 × 5M, average 97.4%), buy 95.6–96.7%, free spins 1 in 177, hit rate 21.4%. 22/22 edge cases. Win animations: Outlaw (video, 1.5 s); Steam Train to Lantern, Wild, Scatter and Power Dynamite from Darshan's action videos (45 frames, 1.5 s, 30 fps); K, Q, J, 10 still key-pose sheets (re-sampled to 45 frames); the A has the code shine. Mascot: three green-screen videos (idle 1, idle 2, win) in Darshan's order. Banners, lantern and sounds are still placeholders.
- **Animations:** video pipeline: `tools/asset-pipeline/anim_from_video2.py` (symbols: tile / panel / white modes) and `mascot_from_video.py` (green screen).
- **Weight (optimised 2026-11-19):** all images 105 Mpx decoded (~420 MB RAM, was 863 MB), 26 MB on disk (was 50 MB). Symbol sheets 45 frames at 30 fps (1.5 s), 256 px cells; mascot 15 fps at 0.5 scale, played in 30 fps steps; the game blends neighbouring frames and scales up. Next step if still heavy: drop the puppet fallback assets or use 8 fps for the mascot win.
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
### 2026-11-21 · claude.ai chat (42)
- Free spins music: code was switching correctly; added cache-busting (`tools/stamp_version.py`, `BUILD_VERSION`), music from first tap, and a 'Music: … · build …' line in the demo panel.
### 2026-11-21 · claude.ai chat (41)
- Darshan's own music in (`art/audio/`), looped by `tools/audio/make_loop.py` (intro once, then the repeating section). Code-made music retired.
### 2026-11-21 · claude.ai chat (40)
- Music v2 after Darshan found v1 too soft: rough Western base loop, train-heist free spins loop. Still not listened to by Claude.
### 2026-11-21 · claude.ai chat (39)
- Music: two original loops from `tools/audio/compose_music.py` (not listened to by Claude: checked by levels, spectrogram and loop points only). Sound effects are still the synthesised placeholders in `src/audio.js`.
### 2026-11-21 · claude.ai chat (38)
- Big Win screens + Free Spins outro from Darshan's packs. Ladder now five tiers (Sensational merged, Epic 250×, ASSUMED). **Ask Darshan:** higher-resolution files (screens ~290 px, outro background 560 px wide) and the thematic tier names (WANTED → OUTLAW LEGEND) if he prefers them.
### 2026-11-21 · claude.ai chat (37)
- Free spins expanding symbol on the wooden plank, top right (`C.specialBoard`); left card removed.
### 2026-11-21 · claude.ai chat (36)
- Background ambient sparks removed (`drawEnvironment`).
### 2026-11-21 · claude.ai chat (35)
- Buy UI from Darshan's clean final pack (`clean_buy_ui_final.py`, `C.buyUI.scale/closeScale`). Popup board hangs from the screen top.
### 2026-11-21 · claude.ai chat (34)
- Fix: buy options blocked by 'not enough cash' at the default $9 bet ($500 credit); `ensureBuyFunds` tops up the demo credit. Test buys from the default state now (earlier tests used a big balance).
### 2026-11-21 · claude.ai chat (33)
- Buy UI switched to Darshan's simplified pack (one PNG per control, scale-only, chains to the top). The four-state art and its open questions are gone.
### 2026-11-21 · claude.ai chat (32)
- Buy Feature popup from Darshan's final PNGs (`drawBuyMain`, `drawBuyPopup`, `C.buyUI`, `C.buy.options`). Super/Max rules ASSUMED and TUNED (2026-11-21, ~96%); popup buy goes straight to the transition; outside click closes. **Waiting for Darshan:** approval of the Super/Max rules; clean re-exports of the three card release images and the Super pressed image (supplied files are cut through the card).
### 2026-11-21 · claude.ai chat (31)
- Smooth reel motion (`updateReels`, `C.spin.windup/accel/settle`), progressive big win (`drawBanner`, `frames.bannerStep`), Dynamite smoke and Power Dynamite disc removed (`anim_from_video2.py --degrey`, white mode composites the still symbol over the video's fire; `--drop 49-59` for the bad blast frames).
### 2026-11-19 · claude.ai chat (30)
- Paylines from Darshan's reference screenshot (RTP unchanged within noise, 97.4% avg over 4 × 5M). 30 fps everywhere: symbol loops 45 frames / 1.5 s, win display three loops (135 frames). Symbol-win cheat on random paylines.
### 2026-11-19 · claude.ai chat (29)
- Cheat wins rotate through all symbols (`nextSym` bag in director.js). Real spins still win mostly with A-10 (maths), which have no video yet.
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
