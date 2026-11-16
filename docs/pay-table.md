# The Lost Gold Train: Pay Table

Pays are multiples of the **total bet** for one line, as in the reference game. At the default $9.00 bet, 1× = $9.00. All values come from *John Hunter and the Book of Tut* (`docs/reference-game.md` §3); each symbol plays the part of one reference symbol.

| Id | Symbol | Reference symbol | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | The Outlaw | John Hunter | 1 | 10 | 100 | 500 |
| 1 | Sheriff's Star | Tutankhamun mask | 0.5 | 4 | 40 | 200 |
| 2 | Revolver | Golden cat | 0.5 | 3 | 10 | 75 |
| 3 | Gold Bars | Scarab | 0.5 | 3 | 10 | 75 |
| 4 | A | A | | 0.5 | 4 | 15 |
| 5 | K | K | | 0.5 | 4 | 15 |
| 6 | Q | Q | | 0.5 | 2.5 | 10 |
| 7 | J | J | | 0.5 | 2.5 | 10 |
| 8 | 10 | 10 | | 0.5 | 2.5 | 10 |
| 9 | Dynamite (Wild + Scatter, pays anywhere) | Book of Tut | | 2 | 20 | 200 |

## Expanded special symbol (free spins)
The pay for the number of reels holding it × 10 lines. For example, the Outlaw on 5 reels pays 500 × 10 = 5,000×, and the Revolver on 3 reels pays 3 × 10 = 30×.

## Feature buy
100× the total bet (reference).

## Paylines (ASSUMED: classic 10-line book layout; T top, M middle, B bottom)

| Line | Reels 1-5 |
| --- | --- |
| 1 | M M M M M |
| 2 | T T T T T |
| 3 | B B B B B |
| 4 | T M B M T |
| 5 | B M T M B |
| 6 | M B B B M |
| 7 | M T T T M |
| 8 | B B M T T |
| 9 | T T M B B |
| 10 | B M M M T |

## Prototype implementation status
All values are in `src/config.js` (`paytable`, `scatterPays`, `paylines`, `buy.price`) and shown in the game's paytable screen (i button) at the current bet.
