# The Lost Gold Train: Pay Table

Pays are multiples of the **total bet** for one line, as in the reference game. At the default $9.00 bet, 1× = $9.00. The Outlaw and the A to 10 values are the reference's (*John Hunter and the Book of Tut*, `docs/reference-game.md` §3); the other pictures are ASSUMED tiers in between, since the reference has only 4 premiums and the full asset sheet has 10 pictures.

| Id | Symbol | Source of the pays | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | The Outlaw | REF: John Hunter | 1 | 10 | 100 | 500 |
| 1 | Steam Train | ASSUMED | 0.5 | 5 | 50 | 250 |
| 2 | Gold Bars | REF: Tutankhamun mask | 0.5 | 4 | 40 | 200 |
| 3 | Sheriff's Star | ASSUMED | 0.5 | 3 | 20 | 100 |
| 4 | Wanted Poster | REF: Golden cat / Scarab | 0.5 | 3 | 10 | 75 |
| 5 | Dynamite | ASSUMED | | 2 | 10 | 50 |
| 6 | Revolver | ASSUMED | | 2 | 8 | 40 |
| 7 | Money Bag | ASSUMED | | 1.5 | 6 | 30 |
| 8 | Horseshoe | ASSUMED | | 1 | 5 | 25 |
| 9 | Lantern | ASSUMED | | 1 | 5 | 25 |
| 10 | A | REF | | 0.5 | 4 | 15 |
| 11 | K | REF | | 0.5 | 4 | 15 |
| 12 | Q | REF | | 0.5 | 2.5 | 10 |
| 13 | J | REF | | 0.5 | 2.5 | 10 |
| 14 | 10 | REF | | 0.5 | 2.5 | 10 |
| 15 | Wild (reels 2-4) | ASSUMED | substitutes for 0-14 | | | |
| 16 | Scatter (pays anywhere) | REF: Book of Tut | | 2 | 20 | 200 |
| 17-20 | Power Dynamite ×2 / ×3 / ×5 / ×10 (reels 2-4) | ASSUMED | Wild; multiplies the line, multipliers add | | | |

## Expanded special symbol (free spins)
The pay for the number of reels holding it × 10 lines. For example, the Outlaw on 5 reels pays 500 × 10 = 5,000×, and the Revolver on 3 reels pays 2 × 10 = 20×.

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
All values are in `src/config.js` (`paytable`, `scatterPays`, `POWER`, `paylines`, `buy.price`) and shown in the game's paytable screen (i button) at the current bet.
