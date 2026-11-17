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
### 2026-11-17 · claude.ai chat (16)
- Win lines removed; new anticipation (slow-down, fuse sparks round the reel, veil, steam).
### 2026-11-17 · claude.ai chat (15)
- Key-pose prompts for all 18 symbols (`docs/symbol-keypose-prompts.md`); waiting for Darshan's Gemini sheets, then build each with its timing row.
### 2026-11-17 · claude.ai chat (14)
- New layout (logo on top, bigger reels, Outlaw right, buy panel left, slim bar). Ante bet slot reserved; ask Darshan whether to add an ante bet (new maths).
### 2026-11-17 · claude.ai chat (13)
- New base and free-spins backgrounds.
### 2026-11-17 · claude.ai chat (12)
- Visible fixes: demo list no longer forces the Outlaw special; banner straight after all-lines view; steam transition; track-only scatter fx; western coins. Animations parked by Darshan.
