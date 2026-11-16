# Handoff

The bridge between sessions (Claude Code at home, claude.ai chat elsewhere). **Read it first, update it last**, every session. Newest entry at the top; keep the last 5.

## Now
- **State:** first playable build. Original *Book of Tut* maths + 100× feature buy; 9 symbols from Darshan's *Last Train Gold* art; the Outlaw mascot beside the reels. RTP 96.65–97.29% (4 × 6M), buy 95.5–96.4%. 22/22 edge cases. Logo and both backgrounds in (code-drawn timber reel frame over them). Banners, lantern and sounds are still placeholders.
- **Next:** import the backgrounds when they arrive (set `CONFIG.window` to their reel frame); then banners and logo. Optional: strongbox reveal for the special symbol pick.
- **Waiting for Darshan** (GDD §8):
  1. Win banners and a hanging lantern (backgrounds at 1920×1080 or larger would be sharper); prompts in `docs/art-direction.md` §4.
  2. Higher-resolution symbols (about 2×) for final.
  3. Hit rate 26.8% against the reference's 31–33%: keep or rebalance?
  4. Strongbox reveal for the pick: wanted?
  5. Use the pack's multiplier tiles anywhere (a new feature)?
  6. Steam train animation is ready but the train isn't a symbol: swap it in for the Revolver (same maths), or keep it for something else (e.g. the free spins intro)? Revolver and card ranks have no animations yet.
- **Template follow-up:** backport to `slot-starter-template` the generic changes made here (symbol ids from config, feature buy, `specialShare`, `cut_white_tiles.py`, mascot slot).

## Log
### 2026-11-16 · claude.ai chat (6)
- Win animations for the Outlaw, Sheriff's Star and Gold Bars from Darshan's key-pose sheets; train processed but unused (question for Darshan).
### 2026-11-16 · claude.ai chat (5)
- Darshan's base and free spins backgrounds added (cover crop); timber reel frame drawn in code.
### 2026-11-16 · claude.ai chat (4)
- Darshan's logo added: top left above the mascot, and on the loading screen; buy button moved under the mascot.
### 2026-11-16 · claude.ai chat (3)
- Darshan chose: name The Lost Gold Train, symbols matched to the reference, the Outlaw as mascot, the original game. Built specs, maths, feature buy, mascot layout; imported the art pack; tuned; docs.
### 2026-11-16 · claude.ai chat (2)
- Art direction from Darshan's two images: `docs/art-direction.md`, references in `docs/art-reference/`.
### 2026-11-16 · claude.ai chat
- Repo created from the template; reference game research in `docs/reference-game.md`.
