# Cheats and scenarios

Cheats force what the next spin, or a whole sequence of spins, will do. They're for demos, QA and video capture. **Every forced outcome is a real result from the maths engine**: the reels are set up to land that way, and the engine pays them by the normal rules.

The cheat controls are page elements over the game, not part of the canvas, so they never appear in recordings. Code: `src/cheats.js` (menu, hotkeys, scenarios) and `src/director.js` (outcome builders).

## Cheat menu
Press **C**, or click **Cheats (C)** at the top left. **Esc** closes it.
- **Play a scenario:** pick one from the dropdown. **Play** runs it now; **Link** copies a URL that opens the game and plays it.
- **Symbol win:** a symbol and 2 to 5 in a row (2 only counts for the four premiums that pay 2 of a kind), on the middle line. **Force next spin** or **Play now**.
- **Force the next spin:** the hotkey actions as buttons.
- **Clear forced (0):** drops forced spins that haven't played.

A chip at the bottom left shows the next forced spin.

## Hotkeys

| Key | Next spin |
| --- | --- |
| F | 3 Scatters → free spins, random special symbol |
| P | 3 Scatters → free spins, the Outlaw as special |
| B | feature buy (charges 100× the bet, like the BUY FREE SPINS button) |
| 4 / 5 | 4 / 5 Scatters (20× / 200×) → free spins |
| E | free spin: the special symbol expands on 3 reels |
| T | free spin: the special symbol on all 5 reels |
| R | free spin: retrigger (+10) |
| 1 / 2 / 3 / 6 | NICE / BIG / MEGA / SUPERB banner |
| A | 2 Scatters with anticipation, no trigger |
| X | single line win |
| M | several line wins |
| W | a line win using a Wild |
| G | a line win multiplied by Power Dynamite (×2 to ×10) |
| N | no win |
| 0 | clear forced spins |
| Space | spin |

E, T and R only act inside free spins; outside them they play as a normal spin.

## Scenarios

| Id | What it plays |
| --- | --- |
| `free-spins` | 3 Scatters, the special symbol pick, then 10 random free spins |
| `outlaw-free-spins` | the Outlaw as the special symbol; he expands on 3 reels, then on all 5 |
| `expansions` | Steam Train special: expands on 2, 3 and 5 reels, with a retrigger |
| `buy` | feature buy: weighted 3/4/5 Scatter trigger, then bought free spins |
| `retrigger` | 3 Scatters during free spins add 10 more |
| `all-banners` | NICE, BIG, MEGA and SUPERB from real boards, then 5 Scatters (200×) |
| `max-win` | the Outlaw on all 5 reels every free spin until the 5,500× cap ends the round |
| `base-tour` | no win, line win, several lines, a Wild, Power Dynamite, 2-Scatter tease, Big banner |

Links: `index.html?scenario=<id>` or `index.html#scenario-<id>`. An unknown id shows a message.

## Demo panel
The **Next spins** list takes the same outcomes (with **Add to list** buttons). Free spins take items from the list too, so a scenario such as `top-free-spins` lines up the trigger and the free spins after it. The **Custom grid** editor paints any board; **Preview as** shows what it pays as a base spin or as a free spin with a chosen special symbol.

## Prototype implementation status
Every scenario and every outcome type was played to completion in headless Chrome with no page errors (2026-11-15).


The Next spins list starts empty (2026-11-17), so SPIN plays the real maths; use Scenarios or the buttons to load scripted outcomes.
- 2026-11-19: Single line, Several lines, Wild, Power Dynamite and the four banner outcomes now rotate through all 15 symbols (a shuffled bag: every symbol once before any repeats), so repeated picks show different symbols and their win animations. Before, they took the first random board that fitted, and about 70% of those won with A-10. Presentation only: normal spins and the maths are unchanged.
- 2026-11-19: 'Symbol win' puts the symbol on a random payline (any of the 10), not always the middle row.
- 2026-11-21: Buy Super Free Spins (300×, 20 spins) and Buy Feature Max (1500×, 30 spins) scenarios; the main BUY FREE SPINS button now opens the three-option popup (one click; Esc or X closes it).
- 2026-11-21: buys from the popup go straight to the free spins transition (no visible trigger spin); clicking outside the board closes it. The cheat-menu buy scenarios still show the trigger spin.
- 2026-11-21: fix: buying with less credit than the price did nothing (start credit $500, default bet $9, cheapest buy $900). The demo now tops up its credit for a buy, like spins refill it, so every option starts free spins at every bet.
