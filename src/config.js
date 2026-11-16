/*
 * Game configuration: maths, animation timing and presentation switches.
 * The engine (engine.js) reads only this object, so the same file drives the
 * browser game and the Node simulator (tools/simulate.js).
 *
 * The Lost Gold Train: the features and maths of Pragmatic Play's "John Hunter and the Book of Tut"
 * (docs/reference-game.md), with a Wild West watercolour theme (docs/art-direction.md):
 *   5x3, 10 fixed lines, 96.50% RTP, Dynamite = Wild + Scatter (the "book"),
 *   3+ scatters = 10 free spins with one random expanding symbol, unlimited retriggers.
 * Every value not in the docs is marked ASSUMED or TUNED; re-tune with tools/simulate.js after changes.
 *
 * Sources:
 *   REF    docs/reference-game.md      (published facts of the reference game, with links)
 *   RULES  docs/official-game-rules.md (the game's rules, written from REF)
 *   PAY    docs/pay-table.md
 *   ASSUMED  not published for the reference game; chosen here and listed in the README
 *   TUNED    not published; tuned with tools/simulate.js to hit the published RTP
 */
(function (root) {
  const CONFIG = {
    title: 'The Lost Gold Train',
    // short theme texts used by the splash screen, modals and rules screen
    texts: {
      brand: 'All Aboard',                          // small line on the splash screen (ASSUMED)
      loading: ['Stoking the Engine...', 'Laying the Tracks...', 'Loading the Gold...', 'Checking the Map...'],
      retrigger: 'MORE DYNAMITE!',                 // retrigger modal title
      expandedPanel: ['#f0a050', '#f6c98a', '#fbe8c8']   // sunset behind the Outlaw's full-reel art (top to bottom)
    },

    // ---------------------------------------------------------------- grid (REF: 5 reels x 3 rows)
    reels: 5,
    rows: 3,

    // Symbol ids: 0 = highest paying. SCATTER is the "book": wild and scatter at once.
    // The set follows docs/art-direction.md §2: the reference game's 4 premiums + 5 card ranks + the Book.
    regular: [0, 1, 2, 3, 4, 5, 6, 7, 8],
    SCATTER: 9,
    symbolNames: {
      0: 'The Outlaw', 1: "Sheriff's Star", 2: 'Revolver', 3: 'Gold Bars',
      4: 'A', 5: 'K', 6: 'Q', 7: 'J', 8: '10', 9: 'Dynamite'
    },
    // the reference game's symbol each one plays the part of
    refSymbol: { 0: 'John Hunter', 1: 'Tutankhamun mask', 2: 'Golden cat', 3: 'Scarab', 4: 'A', 5: 'K', 6: 'Q', 7: 'J', 8: '10', 9: 'Book of Tut' },

    // ------------------------------------------------------------ paylines (REF: 10 fixed lines)
    // Row index per reel: 0 Top, 1 Middle, 2 Bottom. ASSUMED: the classic 10-line book-slot layout
    // (the reference game's line shapes are not published in the sources found).
    paylines: [
      [1, 1, 1, 1, 1],  //  1 middle
      [0, 0, 0, 0, 0],  //  2 top
      [2, 2, 2, 2, 2],  //  3 bottom
      [0, 1, 2, 1, 0],  //  4 V
      [2, 1, 0, 1, 2],  //  5 inverted V
      [1, 2, 2, 2, 1],  //  6
      [1, 0, 0, 0, 1],  //  7
      [2, 2, 1, 0, 0],  //  8
      [0, 0, 1, 2, 2],  //  9
      [2, 1, 1, 1, 0]   // 10
    ],

    // ------------------------------------------------------------ paytable (REF, x TOTAL bet for one line)
    // Line wins pay left to right on adjacent reels, highest win per line.
    paytable: {
      0: { 2: 1,   3: 10,  4: 100, 5: 500 },  // The Outlaw     = John Hunter
      1: { 2: 0.5, 3: 4,   4: 40,  5: 200 },  // Sheriff's Star = Tutankhamun mask
      2: { 2: 0.5, 3: 3,   4: 10,  5: 75 },   // Revolver       = Golden cat
      3: { 2: 0.5, 3: 3,   4: 10,  5: 75 },   // Gold Bars      = Scarab
      4: { 3: 0.5, 4: 4,   5: 15 },           // A
      5: { 3: 0.5, 4: 4,   5: 15 },           // K
      6: { 3: 0.5, 4: 2.5, 5: 10 },           // Q
      7: { 3: 0.5, 4: 2.5, 5: 10 },           // J
      8: { 3: 0.5, 4: 2.5, 5: 10 }            // 10
    },
    scatterPays: { 3: 2, 4: 20, 5: 200 },      // REF: 3 / 4 / 5 books pay 2x / 20x / 200x total bet, anywhere

    // Symbol weights per reel for random stops (TUNED). Each cell is drawn independently.
    // Rows: reel 1..5. Columns: symbol id 0..9 (9 = Scatter). Odd and even reels favour different
    // card ranks (fewer accidental lines), and the Scatter is rarer on the left reels, where as a Wild it
    // starts lines, and commoner on the right: this keeps the base game near 49% of RTP while free
    // spins trigger about 1 in 178 (reference: 1 in 150 to 174).
    weights: [
      [2.2, 3.2, 4.5, 4.5, 17, 17, 8, 8, 8, 0.8],
      [2.2, 3.2, 4.5, 4.5, 8, 8, 15, 15, 15, 1.0],
      [2.2, 3.2, 4.5, 4.5, 17, 17, 8, 8, 8, 1.9],
      [2.2, 3.2, 4.5, 4.5, 8, 8, 15, 15, 15, 2.7],
      [2.2, 3.2, 4.5, 4.5, 17, 17, 8, 8, 8, 3.2]
    ],
    // Free spins use their own weights (TUNED): fewer scatters, so retriggers are rarer.
    weightsFreeSpins: null,                    // null = same as base
    // Free spins: the special symbol's share of every reel, per symbol (TUNED). Premiums get a smaller share
    // than card ranks but pay far more, so the Outlaw is the rare dream special (about 200x average round)
    // and a typical round lands near the reference's 60x median.
    specialShare: { 0: 0.079, 1: 0.086, 2: 0.0965, 3: 0.0965, 4: 0.1625, 5: 0.1625, 6: 0.1725, 7: 0.1725, 8: 0.1725 },

    // ---------------------------------------------------------- free spins (REF)
    freeSpins: 10,                             // 3+ scatters award 10 free spins
    freeSpinsRetrigger: 10,                    // 3+ scatters during free spins add 10 more, no limit
    // Which symbol becomes the expanding symbol (TUNED weights; REF: "one regular symbol chosen at random")
    specialWeights: { 0: 6, 1: 8, 2: 9, 3: 9, 4: 10, 5: 10, 6: 10, 7: 10, 8: 10 },
    // The special symbol expands when it is on enough reels to win (2 for symbols that pay 2 of a kind,
    // else 3), anywhere on those reels, and then pays on every line regardless of adjacency (REF).
    expandPaysAllLines: true,

    // ------------------------------------------------------------ feature buy (REF: theScore rules text)
    // 10 free spins for 100x the total bet. The bought trigger spin has 3, 4 or 5 Scatters by weight;
    // bought free spins use their own reels per special symbol (here: their own boost on the special).
    buy: {
      enabled: true,
      price: 100,                              // REF: 100x total bet
      scatterWeights: { 3: 85, 4: 13, 5: 2 },  // TUNED (REF: "weighted", values not published)
      specialShare: { 0: 0.0770, 1: 0.0839, 2: 0.0941, 3: 0.0941, 4: 0.1584, 5: 0.1584, 6: 0.1682, 7: 0.1682, 8: 0.1682 }   // TUNED: bought free spins (97.5% of the natural shares, buy RTP 96.5%)
    },

    maxWin: 5500,                              // REF (pragmaticplay.com): 5,500x per round. Reviews say 5,000x.

    // ---------------------------------------------------------------- money (REF: 0.10 to 100 per spin)
    bets: [0.10, 0.20, 0.50, 1, 2, 5, 9, 10, 20, 50, 100],
    defaultBetIndex: 6,                        // 9.00
    startBalance: 500,
    currency: '$',

    // ---------------------------------------------------------- big win banners (ASSUMED thresholds, x total bet)
    winTiers: [
      { id: 'nice',        min: 10,  label: 'NICE WIN!',        colors: ['#fff4d0', '#f2b632', '#a8320c'], fx: 'fountain' },
      { id: 'big',         min: 20,  label: 'BIG WIN!',         colors: ['#ffffff', '#ffd25a', '#c2281a'], fx: 'drop' },
      { id: 'mega',        min: 50,  label: 'MEGA WIN!',        colors: ['#fff4c2', '#f2b632', '#b0102a'], fx: 'cascade' },
      { id: 'superb',      min: 100, label: 'SUPERB WIN!',      colors: ['#fff2d8', '#ff9a3a', '#b0102a'], fx: 'fireworks' },
      { id: 'sensational', min: 250, label: 'SENSATIONAL WIN!', colors: ['#fff0f0', '#ff5a5a', '#e8b23a'], fx: 'lasers' },
      { id: 'epic',        min: 500, label: 'EPIC WIN!',        colors: ['#ffffff', '#ffe27a', '#d6202f'], fx: 'epic' }
    ],

    // ------------------------------------------------------- animation timing (ASSUMED, frames at 30 fps)
    splash: { enabled: true, minMs: 2600, fadeMs: 700 },
    fps: 30,
    frames: {
      bgBaseLoop: 120,                  // background breathing
      symWin: [10, 20, 15],             // winning symbol: pop, hold, settle
      lineCycle: 45,                    // each line shown on its own after the all-lines view (one full 1.5 s symbol animation)
      scatterLand: 12,                  // scatter squash when it lands
      fuse: [24, 18, 18],               // trigger: fuse unrolls down the reel, crackers pop, settle
      pick: [90, 30],                   // special symbol pick: symbols cycle and slow down, then hold
      expand: [12, 24, 12],             // expanding symbol: flash, grow to the full reel, settle
      expandLines: 45,                  // all 10 lines shown over the expanded reels
      anticipation: 45,                 // extra spin time on each reel after 2 scatters have landed
      banner: [30, 90, 30],             // modals and big win banners
      bannerTally: [30, 105],
      summaryTally: 75,
      transToFree: [15, 45, 15],
      transToBase: 60
    },
    anticipate: true,                   // slow the remaining reels when 2 scatters are showing
    autoContinueModals: true,           // START / COLLECT continue by themselves after the hold

    spin: { first: 1.0, gap: 0.18, speed: 22, bounce: 1.2 },

    // Layout in stage pixels (1920 x 1080): where the reels sit on the background art (ASSUMED until the
    // backgrounds arrive; docs/art-direction.md asks for the frame to match). The reels sit right of centre
    // so the Outlaw mascot can stand on the left, as in the reference images.
    stage: { landscape: [1920, 1080] },
    window: { x: 540, y: 150, w: 1300, h: 690 },
    // left column, as in the art references: the logo on top, the Outlaw mascot below, the buy button at the bottom
    logo: { x: 15, y: 4, w: 510, h: 255 },       // box the logo (ui_splash_logo) is fitted into
    mascot: { x: 30, y: 250, w: 480, h: 612 },
    // the supplied backgrounds are open scenery with no reel frame painted in, so the game draws a
    // weathered timber frame and dark plank panels behind the reels (ASSUMED look, matches the symbol tiles)
    reelFrame: true,   // box the mascot art is fitted into (feet on the bottom edge)
    buyButton: { x: 50, y: 868, w: 440, h: 68 },
    hudTop: 944,                        // the bottom bar starts here (mockup y 1940)
    message: 'DEMO GAME IS ACTIVE'      // the message pill above the bar
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
  else root.CONFIG = CONFIG;
})(typeof window !== 'undefined' ? window : globalThis);
