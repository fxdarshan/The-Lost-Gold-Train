# Reference game: John Hunter and the Book of Tut (Pragmatic Play)

Research done 2026-11-16 for a new game started from `slot-starter-template`. This file holds published facts only, each with its source. Values that are not published are listed under "Unknown" and become ASSUMED or TUNED in `src/config.js`.

Sources Darshan gave: Pragmatic Play's official page, Slotstemple, NetBet (that link is the **Respin** version, a different game: see section 8), Slotester, and three YouTube videos. Slotstemple and all three YouTube videos could not be read from here (the sites refused the request), so nothing below comes from them. The rest come from the extra sources listed at the end.

## 1. Identity

| Item | Value | Source |
| --- | --- | --- |
| Provider | Pragmatic Play | all |
| Release | 14/15 May 2020 | OLBG, Sigma |
| Series | John Hunter (4th game) | AboutSlots |
| Theme | Ancient Egypt; a *Book of Ra* style game | Bigwinboard, Casinos.com |
| Grid | 5 reels × 3 rows | Slotester, Bigwinboard, theScore rules |
| Lines | 10 fixed, left to right | Slotester, theScore rules |

## 2. Maths headline

| Item | Value | Source |
| --- | --- | --- |
| RTP | **96.50%** default | Official page |
| RTP variants | 95.50% and 94.50% (operator choice) | SpinHunter, AboutSlots (94.50%) |
| Volatility | High, 5/5 on Pragmatic's meter | Bigwinboard; Slotester says Medium |
| Max win | **5,500×** | Official page, Slotester, AboutSlots; Bigwinboard says 5,000×; OLBG says 6,600× |
| Max win probability | 1 in 1 billion spins | AboutSlots |
| Hit frequency | 33.33% (published); 31% measured over 20,000 spins | AboutSlots, OLBG; Slotester |
| Free spins frequency | 1 in 174 (published); about 1 in 150 measured | AboutSlots; Slotester |
| Bet range | 0.10 to 100 per spin is most common; some operators 0.10 to 250, others lower caps | Bigwinboard, Sigma; Slotester; theScore |

## 3. Symbols and pay table (× total bet, for one line)

| Symbol | 2 | 3 | 4 | 5 |
| --- | --- | --- | --- | --- |
| John Hunter (top) | 1 | 10 | 100 | 500 |
| Tutankhamun mask | 0.5 | 4 | 40 | 200 |
| Golden cat | 0.5 | 3 | 10 | 75 |
| Scarab | 0.5 | 3 | 10 | 75 |
| A, K | | 0.5 | 4 | 15 |
| Q, J, 10 | | 0.5 | 2.5 | 10 |
| **Book** (scatter, anywhere) | | 2 | 20 | 200 |

Source: Slotester (read in the game at a 2.00 bet); scatter pays also Gamblersarea and Bigwinboard; mask pays also Stake. Slotester's table layout is ambiguous for the mask, cat and scarab; the values above are the only reading consistent with "premiums pay from 2" and 5,000× = 500 × 10 lines. Premiums pay from 2 of a kind, card ranks from 3 (Slotester, Bigwinboard).

## 4. Rules

From a casino help page that appears to copy the game's rules (theScore Bet), confirmed by reviews:

1. **Book** is Wild (substitutes for all pay symbols) and Scatter (pays anywhere, 2× / 20× / 200× for 3 / 4 / 5).
2. **Free spins:** 3+ Books pay their scatter win and award **10 free spins**.
3. **Mystery (special) symbol:** before the free spins, one symbol is chosen **at random, weighted, from the list of regular symbols**. The choice is shown as a book opening on a page.
4. **Free spin win = two rounds added together:**
   - normal line wins first;
   - then the special symbol expands to fill every reel it is on, **only if it is on enough reels to win** (2 for premiums, 3 for card ranks). It then pays on all 10 lines, **even on reels that are not next to each other**.
5. **Retrigger:** 3+ Books during free spins add **10 more**, keep the same special symbol, and have no limit.
6. **Feature buy:** 10 free spins for **100× the total bet** from the base game. The bought trigger spin has 3, 4 or 5 Books, chosen by weight. Bought free spins use **a different reel set for each special symbol**. The buy isn't offered in some markets, such as the UK.
7. **Random expansion (open question):** Pragmatic's page says that during the feature, random symbols can also expand vertically. No other source describes this, and the rules text doesn't mention it. It may just be marketing wording for the special symbol.

Sources: theScore help page, Official page, Slotester, Bigwinboard, PayByMobileSlots, AskGamblers, Gambling.com.

## 5. How it plays (measured)

| Measure | Value | Source |
| --- | --- | --- |
| Base game | mostly small wins while waiting for Books; frequent dead spins | Bigwinboard |
| Longest dry streak | 19 spins (average 3.19) over 20,000 spins | Slotester |
| Biggest base win without bonus | 200.5× | Slotester |
| Free spins win | median 60×, mean 80.7× (trigger spin included) | Slotester (233 bonuses) |
| Free spins win (another player) | average 94.5×, best 408.5× | AskGamblers |
| Free spins per buy | 11 on average (10 to 40); 8 of 100 buys retriggered | Slotester |
| Bought bonus return | 101% over 100 buys, median 0.76× the price, 63 of 100 below price | Slotester |
| Example | John Hunter on reels 2, 4 and 5 expanded and paid 100× (200 at a 2.00 bet) | Slotester |

What this means for the maths: free spins carry about **45 to 50%** of the RTP (1 in about 160 to 174 spins × about 80× average). That's more than the starter template's sample gives them (about 37%).

## 6. Presentation (from reviews)

- 5×3 reels in a gold Egyptian frame, with Egyptian music.
- A book opens and its pages flip to reveal the special symbol.
- Expanded symbols cover whole reels; full-screen John Hunter is the big moment.
- Classic *Book of Ra* feel; visuals are a step up from the original *Book of Ra*.

Sources: Bigwinboard, Gamblersarea, Gambling.com.

## 7. Unknown (not published anywhere found)

- Reel strips or symbol weights, base and free spins.
- The special symbol weights (the rules say only "weighted").
- Book count weights on the bought trigger spin.
- The 10 line shapes. Assumed: the classic book-slot layout (middle, top, bottom, V, ^, …).
- The "random symbols expand" wording (section 4, item 7).

## 8. The NetBet link is a different game: *John Hunter and the Book of Tut Respin* (Oct 2022)

| Item | Respin version |
| --- | --- |
| Grid, lines | 5×3, 10 lines |
| RTP / volatility | 96.50% / High 5/5 |
| Max win | **4,000×** |
| Mystery Respin (base game) | On base spins a mystery symbol can be chosen at random. If 3+ land, they expand to fill their reels, and a respin follows. New mystery symbols also expand and give another respin. It ends when no new ones land or the screen is full. |
| Free spins | 10 free spins; one mystery symbol for the whole round, with the same expand-and-respin process |
| Bonus buy | 100× the bet (outside the UK) |
| Top line | John Hunter filling the screen: up to 1,000× the stake |
| Hit frequency | 25% |

Sources: Gaming Intelligence, OLBG, Gambling.com (UK, NZ, US), European Gaming, Slotstemple (Respin page). The sources disagree on whether the base-game expansion needs a win or just enough symbols.

## 9. Related game, for context only
*Book of Tut Megaways* (2023): 6 reels, up to 117,649 ways, random expanding symbol in the base game too, 96.00% RTP, 10,000× max win (Gambling.com, OLBG, Book of Ra Slots).

## 10. What the starter template already does, and what a faithful copy needs

| Feature | Template | Needed |
| --- | --- | --- |
| 5×3, 10 lines, pay table, Book Wild + Scatter, 10 FS, retriggers, special symbol picked by weight, expansion on non-adjacent reels paid after line wins | yes | none |
| Max win cap | 5,500× | none |
| RTP 96.50% | tuned (spread ±1%) | re-tune so free spins carry about 45 to 50%, not 37% |
| Feature buy 100× (weighted 3/4/5 Books, separate reels per special symbol) | no | new |
| RTP variants 95.50% / 94.50% | no | config switch (optional) |
| Respin version's Mystery Respin | no | only if that version is chosen |

## Sources
- Pragmatic Play (official): https://www.pragmaticplay.com/en/games/john-hunter-and-the-book-of-tut-slot/
- Slotester (pay table, 20,000-spin test): https://slotester.com/john-hunter-and-the-book-of-tut/
- theScore Bet help (rules text): https://thescorebethelp.zendesk.com/hc/en-us/articles/15313590346253-John-Hunter-and-the-Book-of-Tut
- Bigwinboard: https://www.bigwinboard.com/john-hunter-and-the-book-of-tut-pragmatic-play-slot-review/
- AboutSlots: https://www.aboutslots.com/casino-slots/john-hunter-and-the-book-of-tut
- SpinHunter (RTP variants): https://spinhunter.co.uk/slots/john-hunter-and-the-book-of-tut-slot-demo-and-review/
- OLBG: https://www.olbg.com/slots/games/john-hunter-and-the-book-of-tut
- AskGamblers: https://www.askgamblers.com/casino-games/online-slots/reviews/john-hunter-and-the-book-of-tut-pragmatic-play
- Sigma: https://sigma.world/play/games/pragmatic-play/john-hunter-and-the-book-of-tut/
- Stake: https://stake.com/casino/games/pragmatic-play-book-of-tut
- Gamblersarea: https://gamblersarea.com/game/BookofTut
- PayByMobileSlots: https://www.paybymobileslots.com/all-games/slots/book-of-tut
- NetBet (Respin): https://casino.netbet.com/game/john-hunter-and-the-book-of-tut-respin-94
- Gambling.com Respin (NZ): https://www.gambling.com/nz/online-casinos/pokies/john-hunter-and-the-book-of-tut-respin
- OLBG Respin: https://www.olbg.com/slots/games/john-hunter-and-the-book-of-tut-respin
- Gaming Intelligence (Respin launch): https://www.gamingintelligence.com/studio-showcase/?p=3534
- Not readable from here: Slotstemple (original), YouTube PETQquwWx-g, hG-EUziVBus, CvssRX4ZJzA.
