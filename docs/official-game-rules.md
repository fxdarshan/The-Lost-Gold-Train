# The Lost Gold Train: Game Rules

> Written for the prototype from the reference game's published rules (`docs/reference-game.md`, *John Hunter and the Book of Tut*). Items marked ASSUMED are not in the reference sources.

## 1. Overview
- 5 reels, 3 rows, 10 fixed paylines. Wins pay left to right on adjacent reels, starting from the leftmost reel.
- Theoretical RTP: 96.50% (the feature buy also returns 96.50%).
- Maximum win: 5,500× the total bet per round (a base spin or feature buy, plus the free spins it triggers). The round ends when it is reached.

## 2. Playing a round
- A round starts with SPIN (or Space) at the selected total bet. The bet can't be changed during a round.
- Autoplay plays rounds until it is switched off.
- In the event of malfunction, all affected bets and pays are void.

## 3. Line wins
- Only the highest win on each line is paid; wins on different lines are added.
- The Outlaw, Steam Train, Gold Bars, Sheriff's Star and Wanted Poster pay from 2 in a row; Dynamite, Revolver, Money Bag, Horseshoe, Lantern, A, K, Q, J and 10 from 3.

## 4. Wild, Power Dynamite and Scatter
- The **Wild** appears on reels 2, 3 and 4 only and substitutes for every pay symbol on a line.
- **Power Dynamite** also appears on reels 2, 3 and 4 only. It is a Wild that carries a multiplier: ×2, ×3, ×5 or ×10. A line win that includes it is multiplied; when a line holds several, their multipliers are **added** (×2 and ×3 make ×5).
- A line that starts with 2 or more Wilds (of either kind) may pay as The Outlaw instead, whichever pays more.
- The **Scatter** appears on all reels and is not Wild. 3, 4 or 5 anywhere pay 2×, 20× or 200× the total bet, added to line wins, and award **10 free spins**.

## 5. Free spins
- Free spins are played at the bet of the spin that triggered them, as part of the same round.
- **Special expanding symbol:** before free spins start, one pay symbol is picked at random, weighted. It stays the same for all free spins, retriggers included.
- After a free spin's normal wins are paid, if the special symbol is on enough reels to win, it **expands to fill those reels** and pays on all 10 lines, **even on reels that aren't next to each other**:
  - "enough reels" is 2 for the symbols that pay from 2 in a row, and 3 for the others;
  - the expanded win is the pay for that many symbols × 10 lines, added to the normal wins;
  - Wilds, Power Dynamite and Scatters don't count toward the expansion, and expanded wins are not multiplied.
- **Retrigger:** 3 or more Scatters during free spins pay as in section 4 and add 10 free spins, with no limit.

## 6. Feature buy
- In the base game, **BUY FREE SPINS** starts free spins for **100× the total bet**. The button asks for a second tap to confirm.
- The bought spin lands 3, 4 or 5 Scatters (weighted), pays them and any line wins, then plays free spins as in section 5.
- Bought free spins use their own weights for each special symbol.
- The buy isn't offered when the balance is below its price.

## Prototype implementation status
- Sections 1 to 6 are implemented in `src/engine.js` (`evaluate`, `scatters`, `expansion`, `resolveSpin`, `buyGrid`) and played in that order by `src/game.js`. The max win cap is in `src/game.js` (`play`, `freeSpins`) and in `tools/simulate.js`.
- During free spins, the special symbol takes a fixed share of every reel, per symbol (`CONFIG.specialShare`, TUNED); bought free spins use 1.04× that share (`CONFIG.buy.specialShare`, TUNED). The reference game's reels aren't published; its rules say only that bought free spins use their own reel set per special symbol.
- ASSUMED: line shapes (classic 10-line book layout), Scatter weights on the bought spin (3: 85%, 4: 13%, 5: 2%), special-symbol pick weights.
- ASSUMED (2026-11-16, Darshan: "accommodate all the symbols"): the full 15-symbol set, a separate Wild and Scatter (the reference's Book is both), and Power Dynamite with ×2/×3/×5/×10 multipliers. None of these are in the reference game; they use every piece of the *Last Train Gold* asset sheet. Wild and Power Dynamite are kept off reels 1 and 5 so they can't start or finish a line on their own.
- 2026-11-19: the 10 paylines now match the reference paytable screen (Darshan's screenshot).
