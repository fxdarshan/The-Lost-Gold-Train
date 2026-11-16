# Handoff

The bridge between sessions (Claude Code at home, claude.ai chat elsewhere). **Read it first, update it last**, every session. Newest entry at the top; keep the last 5.

## Now
- **State:** full symbol set from Darshan's *Last Train Gold* sheet: 15 pay symbols, Wild and Power Dynamite (×2/×3/×5/×10) on reels 2-4, a separate train-badge Scatter; Book of Tut free spins with the expanding symbol + 100× buy. RTP 96.6–97.3% (4 × 5M, average 97.0%), buy 95.7–96.2%, free spins 1 in 177, hit rate 21.4%. 22/22 edge cases. 16 symbols have 2.5 s win animations (all but the A and Power Dynamite). Banners, lantern and sounds are still placeholders.
- **Next:** Darshan's verdict on the assumed pays and Power Dynamite rules (below); then win animations for the remaining symbols; then banners.
- **Waiting for Darshan** (GDD §8):
  1. Full symbol set: are the ASSUMED pays for the six new pictures right? Keep Power Dynamite as a multiplier Wild on reels 2-4 (multipliers add)? The earlier 9-symbol version is commit 8c3fe9d.
  2. Hit rate 21.4% against the reference's 31–33%: keep, or drop a few symbols to raise it?
  3. Win banners and a hanging lantern; prompts in `docs/art-direction.md` §4.
  4. Key-pose sheets for the A and Power Dynamite.
  5. Higher-resolution symbols (about 2×) for final.
  6. Strongbox reveal for the pick: wanted?
- **Template follow-up:** backport to `slot-starter-template` the generic changes made here (symbol ids from config, feature buy, `specialShare`, Wild/Power multipliers in `evaluate`, `cut_white_tiles.py`, mascot slot, `anim_from_keys.py`).

## Log
### 2026-11-16 · claude.ai chat (10)
- Animations for Lantern, K, Q, J, 10, Wild, Scatter; WebP block-alignment fix (cells 320x240).
### 2026-11-16 · claude.ai chat (9)
- Win animations slowed to 2.5 s (75 frames) and smoother; win and line holds match.
### 2026-11-16 · claude.ai chat (8)
- Full symbol set: 15 pay symbols, Wild, Power Dynamite multipliers, separate Scatter; re-tuned; paytable, rules and docs rewritten.
### 2026-11-16 · claude.ai chat (7)
- Revolver and Dynamite animated and in the game; poster, money bag, horseshoe, train animated but unused. Loops verified seamless (1.5 s).
### 2026-11-16 · claude.ai chat (6)
- Win animations for the Outlaw, Sheriff's Star and Gold Bars from Darshan's key-pose sheets; train processed but unused (question for Darshan).
