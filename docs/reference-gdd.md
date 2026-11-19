# The Lost Gold Train: Game Design Document (v0.1)

## 1. Concept
A Wild West book-style slot in hand-painted watercolour. An outlaw gang chases the last gold train through the canyon at sunset. **The Outlaw** is the top symbol and the game's mascot, standing beside the reels. The full *Last Train Gold* symbol sheet is in play: 10 pictures and A to 10, a **Wild** and **Power Dynamite** (a Wild with a ×2 to ×10 multiplier) on the middle reels, and a train-badge **Scatter**. Three or more Scatters give free spins with a randomly picked expanding symbol.

Features and maths follow Pragmatic Play's **John Hunter and the Book of Tut** (the original, not the Respin version): `docs/reference-game.md`. Look and symbols follow `docs/art-direction.md` and the art Darshan supplied (`assets/source/originals/last_train_gold/`).

## 2. Problem statement
Build a playable prototype that plays like the reference game, wearing the new theme, for review on screenshots and a single-file build. The art can be swapped file by file. In scope: base game, free spins with the expanding symbol, retriggers, the 100× feature buy, big win banners, demo tools. Out of scope for now: the Respin version's Mystery Respin, the RTP variants, final audio.

## 3. Key numbers

| Item | Target (reference) | Prototype (4 × 5M rounds) |
| --- | --- | --- |
| Grid / lines | 5×3 / 10 | 5×3 / 10 |
| RTP | 96.50% | 96.61% to 97.33% (average 97.0%, about ±0.4% run to run; earlier runs 1% lower on the share gave 95.7%, so the true figure is about 96.5 to 97%) |
| Base / free spins share | about 50 / 50 (derived) | 53% / 44% |
| Free spins frequency | 1 in 174 (published); 1 in 150 (measured) | 1 in 177 |
| Free spins round | median 60×, mean 80.7× (measured) | median 50×, mean 78× |
| Feature buy | 100×; return not published (101% measured over 100 buys) | 100×; 95.7% to 96.2% |
| Hit frequency | 33.33% (published); 31% (measured) | **21.4%**: lower, see §7 |
| Max win | 5,500× | 5,500× cap, reached about 1 in 5 million rounds (reference: 1 in 1 billion) |
| Bet | 0.10 to 100 | 0.10 to 100, default 9.00 |

With 15 possible specials the round now depends more on which one is picked: the Outlaw is the rare dream special, the card ranks the common modest ones.

## 4. Symbols
| Id | Symbol | Role | Art (asset sheet) | Win animation |
| --- | --- | --- | --- | --- |
| 0 | The Outlaw | top symbol (REF John Hunter) | `01_character_portrait` | yes |
| 1 | Steam Train | premium | `02_steam_train` | yes |
| 2 | Gold Bars | premium | `03_gold_bars` | yes |
| 3 | Sheriff's Star | premium | `04_sheriff_badge` | yes |
| 4 | Wanted Poster | premium | `05_wanted_poster` | yes |
| 5 | Dynamite | mid | `06_dynamite_timer` | yes |
| 6 | Revolver | mid | `07_revolver` | yes |
| 7 | Money Bag | mid | `08_money_bag` | yes |
| 8 | Horseshoe | mid | `09_horseshoe` | yes |
| 9 | Lantern | mid | `10_lantern` | yes |
| 10–14 | A, K, Q, J, 10 | card ranks | `11`–`15_royal_*` | K, Q, J, 10 yes; A not yet |
| 15 | Wild (reels 2-4) | substitutes for 0-14 | `17_wild` | yes |
| 16 | Scatter | pays anywhere, triggers free spins (REF Book of Tut, minus the Wild) | `18_scatter` | yes |
| 17–20 | Power Dynamite ×2 / ×3 / ×5 / ×10 (reels 2-4) | Wild with a line multiplier | `19_power_symbol_dynamite` + plates `20`–`23` | not yet |

Not used: `16_character_bust` (the portrait is the symbol) and `24_full_body_outlaw_character` (it is the mascot and the full-reel Outlaw).

Pays in `docs/pay-table.md`; rules in `docs/official-game-rules.md`.

## 5. Flow
1. **Base spin.** Reels stop left to right. Once two Scatters are showing, the later reels spin longer under a glowing frame.
2. **Wins.** All winning lines show together with the total, then each line on its own (not in autoplay). Non-winning symbols dim. The Outlaw mascot hops on big wins.
3. **Scatter.** It pulses and pays. On 3 or more, a railway track lays down each Scatter's reel from the train badge (`fx_scatter_full`). Wins with Power Dynamite show their multiplier next to the line amount.
4. **Free spins intro:** "10 FREE SPINS".
5. **Special symbol pick.** The symbols cycle in a card, slow down and stop. (Planned: a strongbox opening; needs art.)
6. **Transition** into the gold wagon (free spins background); the bar turns dark blue.
7. **Free spins.** The message pill counts "FREE SPIN n OF m"; a card under the mascot shows the expanding symbol. When the special symbol expands, it flashes, each of its reels grows into a full column, and all 10 lines pay. The Outlaw's column shows his full-body art over a sunset panel.
8. **Retrigger:** "MORE SCATTERS! +10 FREE SPINS".
9. **Summary** (total, spins, or "MAX WIN REACHED"), then back to the base game.
10. **Feature buy.** BUY FREE SPINS (bottom left, under the mascot) shows the price at the current bet; tap twice to confirm. It's hidden during free spins, where the special symbol card takes its place.
11. **Big win banners** at 10/20/50/100/250/500× (ASSUMED thresholds).

## 6. Screen layout (1920×1080)
- Reels: x 540 to 1840, y 150 to 840 (cells 260×230), right of centre.
- Left column, as in the art references: the logo at the top (x 15 to 525, y 4 to 259, slow shimmer), the Outlaw mascot below it (x 30 to 510, y 250 to 862), facing the reels with idle breathing and sway, and BUY FREE SPINS at the bottom (x 50 to 490, y 868 to 936). In free spins the special symbol card takes the buy button's place.
- Bottom bar from y 944: settings, sound, info, CASH, LINES, BET (per line) with − / +, TOTAL BET, WIN, SPIN, AUTOPLAY; message pill above it, centred under the reels.

## 7. Decisions
- **Original Book of Tut** maths and features, plus its feature buy (Darshan, 2026-11-16).
- **Symbols:** every piece of Darshan's asset sheet (Darshan, 2026-11-16: "I guess you used very less symbols… please check and update"; on Wild and Scatter: "try to accommodate all the symbols as much as possible"). So the game now has 15 pay symbols, a separate Wild and Scatter, and Power Dynamite. ASSUMED, because he left the other questions open: the pays of the 6 new pictures (tiers between the reference's values), the Wild and Power Dynamite on reels 2-4 only, multipliers that add on a line, and Power Dynamite as a Wild rather than a separate feature. The first build kept the reference's 4 premiums + Book; that version is in git history (commit 8c3fe9d) if he prefers it.
- **Wild substitution and the top symbol:** a line that starts with 2+ Wilds pays as the Outlaw when that pays more, so Wild-only lines still pay (ASSUMED; common practice).
- **Reel weights** (TUNED): alternate reels favour different card ranks, and the Scatter is rarer on the left reels. With 15 pay symbols, lines are rarer than with 9, so the **hit rate is 21.4%** against the reference's 31–33% (26.8% in the 9-symbol build). Raising it means more small wins and a lower free spins share; that's for Darshan to call.
- **Special symbol** gets a fixed per-symbol share of each reel in free spins (TUNED). Premiums get smaller shares but pay far more, so the Outlaw is the rare dream special and a typical round lands near the reference median. Bought free spins use 1.04× those shares, so the buy returns about 96%. This mirrors the reference's "own reel set per special symbol".
- **Max win** 5,500× (official page). It's hit far more often than the reference's quoted 1 in 1 billion, because a full-screen Outlaw is reachable in free spins; lowering the Outlaw's share would bring it down at the cost of its dream value.
- **Bought spin Scatter weights** 3/4/5 = 85/13/2% (ASSUMED).
- **Line shapes:** classic 10-line book layout (ASSUMED).

## 8. Open questions
1. Banner art is still needed (logo and both backgrounds arrived 2026-11-16; free spins take place inside the gold wagon rather than at night): prompts in `docs/art-direction.md` §4. The concept pack had none.
2. Symbol art is about 280 px wide. That's fine on the 1920 stage, but soft on large screens; 2× versions would be better for final.
3. Hit rate (21.4% against 31–33%): keep it, or drop some card ranks or pictures to raise it?
4. Strongbox reveal for the special symbol pick: wanted? It needs a strongbox opening animation or frames.
5. Full symbol set (2026-11-16): are the assumed pays for the new pictures right, and should Power Dynamite stay a multiplier Wild on reels 2-4? Win animations for the A and Power Dynamite would finish the set.

## Prototype implementation status
- **Win loop rule (Darshan, 2026-11-19):** in the base game, winning symbols keep playing their win animation in a loop after the round ends, until the player starts the next spin (`CONFIG.loopWinsUntilSpin`). Not in free spins, and not on the spin that starts free spins. During a round every win still plays at least two full loops before moving on.
Sections 3 to 7 are implemented. Section 8 is open.
