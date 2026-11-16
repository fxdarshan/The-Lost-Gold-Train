# The Lost Gold Train: Game Design Document (v0.1)

## 1. Concept
A Wild West book-style slot in hand-painted watercolour. An outlaw gang chases the last gold train through the canyon at sunset. **The Outlaw** is the top symbol and the game's mascot, standing beside the reels. **Dynamite** is the "book": Wild and Scatter at once. Three or more blast open the strongbox for free spins with a randomly picked expanding symbol.

Features and maths follow Pragmatic Play's **John Hunter and the Book of Tut** (the original, not the Respin version): `docs/reference-game.md`. Look and symbols follow `docs/art-direction.md` and the art Darshan supplied (`assets/source/originals/last_train_gold/`).

## 2. Problem statement
Build a playable prototype that plays like the reference game, wearing the new theme, for review on screenshots and a single-file build. The art can be swapped file by file. In scope: base game, free spins with the expanding symbol, retriggers, the 100× feature buy, big win banners, demo tools. Out of scope for now: the Respin version's Mystery Respin, the RTP variants, final audio.

## 3. Key numbers

| Item | Target (reference) | Prototype (4 × 6M rounds) |
| --- | --- | --- |
| Grid / lines | 5×3 / 10 | 5×3 / 10 |
| RTP | 96.50% | 96.65% to 97.29% (average 96.9%, about ±0.4% run to run) |
| Base / free spins share | about 50 / 50 (derived) | 49% / 48% |
| Free spins frequency | 1 in 174 (published); 1 in 150 (measured) | 1 in 178 |
| Free spins round | median 60×, mean 80.7× (measured) | median 59×, mean 85× |
| Feature buy | 100×; return not published (101% measured over 100 buys) | 100×; 95.5% to 96.4% |
| Hit frequency | 33.33% (published); 31% (measured) | **26.8%**: lower, see §7 |
| Max win | 5,500× | 5,500× cap, reached about 1 in 5 million rounds (reference: 1 in 1 billion) |
| Bet | 0.10 to 100 | 0.10 to 100, default 9.00 |

Average free spins round by special symbol: the Outlaw about 220×, Sheriff's Star about 115×, Revolver and Gold Bars about 80×, A and K about 74×, Q, J and 10 about 61×.

## 4. Symbols
| Id | Symbol | Reference role | Art |
| --- | --- | --- | --- |
| 0 | The Outlaw | John Hunter | `01_character_portrait` |
| 1 | Sheriff's Star | Tutankhamun mask | `04_sheriff_badge` |
| 2 | Revolver | Golden cat | `07_revolver` |
| 3 | Gold Bars | Scarab | `03_gold_bars` |
| 4–8 | A, K, Q, J, 10 | card ranks | `11`–`15_royal_*` |
| 9 | Dynamite (Wild + Scatter) | Book of Tut | `19_power_symbol_dynamite` |

Pays in `docs/pay-table.md`; rules in `docs/official-game-rules.md`.

## 5. Flow
1. **Base spin.** Reels stop left to right. Once two Dynamite are showing, the later reels spin longer under a glowing frame.
2. **Wins.** All winning lines show together with the total, then each line on its own (not in autoplay). Non-winning symbols dim. The Outlaw mascot hops on big wins.
3. **Dynamite.** It pulses and pays. On 3 or more, each Dynamite's fuse runs down its reel and pops (`fx_scatter_full`).
4. **Free spins intro:** "10 FREE SPINS".
5. **Special symbol pick.** The symbols cycle in a card, slow down and stop. (Planned: the dynamite blasts open a strongbox; needs art.)
6. **Transition** to night: the free spins background, and the bar turns dark blue.
7. **Free spins.** The message pill counts "FREE SPIN n OF m"; a card under the mascot shows the expanding symbol. When the special symbol expands, it flashes, each of its reels grows into a full column, and all 10 lines pay. The Outlaw's column shows his full-body art over a sunset panel.
8. **Retrigger:** "MORE DYNAMITE! +10 FREE SPINS".
9. **Summary** (total, spins, or "MAX WIN REACHED"), then back to the base game.
10. **Feature buy.** BUY FREE SPINS (bottom left, under the mascot) shows the price at the current bet; tap twice to confirm. It's hidden during free spins, where the special symbol card takes its place.
11. **Big win banners** at 10/20/50/100/250/500× (ASSUMED thresholds).

## 6. Screen layout (1920×1080)
- Reels: x 540 to 1840, y 150 to 840 (cells 260×230), right of centre.
- Left column, as in the art references: the logo at the top (x 15 to 525, y 4 to 259, slow shimmer), the Outlaw mascot below it (x 30 to 510, y 250 to 862), facing the reels with idle breathing and sway, and BUY FREE SPINS at the bottom (x 50 to 490, y 868 to 936). In free spins the special symbol card takes the buy button's place.
- Bottom bar from y 944: settings, sound, info, CASH, LINES, BET (per line) with − / +, TOTAL BET, WIN, SPIN, AUTOPLAY; message pill above it, centred under the reels.

## 7. Decisions
- **Original Book of Tut** maths and features, plus its feature buy (Darshan, 2026-11-16).
- **Symbols** follow the reference's 4 premiums + 5 card ranks + Book, using Darshan's art (Darshan: "match symbols with the reference"). The pack's WILD, SCATTER, steam train, wanted poster, money bag, horseshoe, lantern and multiplier tiles aren't used: the reference has no separate Wild, no multipliers and no extra symbols.
- **Reel weights** (TUNED): alternate reels favour different card ranks, and Dynamite is rarer on the left reels. This brings the base game down to the reference's share; the cost is a **hit rate of 26.8%** against the reference's 31–33%. Raising it means more small wins and a lower free spins share; that's for Darshan to call.
- **Special symbol** gets a fixed per-symbol share of each reel in free spins (TUNED). Premiums get smaller shares but pay far more, so the Outlaw is the rare dream special and a typical round lands near the reference median. Bought free spins use slightly smaller shares, so the buy returns about 96.5%. This mirrors the reference's "own reel set per special symbol".
- **Max win** 5,500× (official page). It's hit far more often than the reference's quoted 1 in 1 billion, because a full-screen Outlaw is reachable in free spins; lowering the Outlaw's share would bring it down at the cost of its dream value.
- **Bought spin Dynamite weights** 3/4/5 = 85/13/2% (ASSUMED).
- **Line shapes:** classic 10-line book layout (ASSUMED).

## 8. Open questions
1. Backgrounds (base sunset and free spins night) and banner art are still needed (the logo arrived 2026-11-16): prompts in `docs/art-direction.md` §4. The concept pack had none.
2. Symbol art is about 280 px wide. That's fine on the 1920 stage, but soft on large screens; 2× versions would be better for final.
3. Hit rate (26.8% against 31–33%): keep it or rebalance?
4. Strongbox reveal for the special symbol pick: wanted? It needs a strongbox opening animation or frames.
5. Use the pack's multiplier tiles (x2/x3/x5/x10) somewhere? That would be a new feature beyond the reference.

## Prototype implementation status
Sections 3 to 7 are implemented. Section 8 is open.
