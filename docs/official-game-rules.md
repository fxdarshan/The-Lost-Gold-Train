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
- The Outlaw, Sheriff's Star, Revolver and Gold Bars pay from 2 in a row; A, K, Q, J and 10 from 3.

## 4. Dynamite (Wild and Scatter)
- Dynamite appears on all reels.
- As a **Wild** it substitutes for every other symbol on a line. A line made only of Dynamite doesn't pay as a line.
- As a **Scatter**, 3, 4 or 5 anywhere pay 2×, 20× or 200× the total bet, added to line wins.
- 3 or more Dynamite award **10 free spins**.

## 5. Free spins
- Free spins are played at the bet of the spin that triggered them, as part of the same round.
- **Special expanding symbol:** before free spins start, one regular symbol is picked at random, weighted. It stays the same for all free spins, retriggers included.
- After a free spin's normal wins are paid, if the special symbol is on enough reels to win, it **expands to fill those reels** and pays on all 10 lines, **even on reels that aren't next to each other**:
  - "enough reels" is 2 for the Outlaw, Sheriff's Star, Revolver and Gold Bars, and 3 for the others;
  - the expanded win is the pay for that many symbols × 10 lines, added to the normal wins;
  - Dynamite doesn't count toward the expansion.
- **Retrigger:** 3 or more Dynamite during free spins pay as in section 4 and add 10 free spins, with no limit.

## 6. Feature buy
- In the base game, **BUY FREE SPINS** starts free spins for **100× the total bet**. The button asks for a second tap to confirm.
- The bought spin lands 3, 4 or 5 Dynamite (weighted), pays them and any line wins, then plays free spins as in section 5.
- Bought free spins use their own weights for each special symbol.
- The buy isn't offered when the balance is below its price.

## Prototype implementation status
- Sections 1 to 6 are implemented in `src/engine.js` (`evaluate`, `scatters`, `expansion`, `resolveSpin`, `buyGrid`) and played in that order by `src/game.js`. The max win cap is in `src/game.js` (`play`, `freeSpins`) and in `tools/simulate.js`.
- During free spins, the special symbol is drawn more often than in the base game: `CONFIG.specialBoost` 1.43 for natural free spins, `CONFIG.buy.specialBoost` 1.39 for bought ones (both TUNED). The reference game's reels aren't published; its rules say only that bought free spins use their own reel set per special symbol.
- ASSUMED: line shapes (classic 10-line book layout), Dynamite weights on the bought spin (3: 85%, 4: 13%, 5: 2%), special-symbol pick weights.
