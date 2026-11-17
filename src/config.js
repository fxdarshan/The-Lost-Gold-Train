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
      retrigger: 'MORE SCATTERS!',                 // retrigger modal title
      expandedPanel: ['#f0a050', '#f6c98a', '#fbe8c8']   // sunset behind the Outlaw's full-reel art (top to bottom)
    },

    // ---------------------------------------------------------------- grid (REF: 5 reels x 3 rows)
    reels: 5,
    rows: 3,

    // Symbol ids (Darshan's full asset sheet, 2026-11-16: "accommodate all the symbols"):
    //   0-14 pay symbols, highest first (10 pictures + A-10)
    //   WILD     substitutes for every pay symbol (reels 2-4)
    //   SCATTER  pays anywhere, 3+ trigger free spins (the reference's Book, but not wild here)
    //   POWER    Power Dynamite: a Wild carrying a multiplier (id -> x); multipliers on a line add up
    regular: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
    WILD: 15,
    SCATTER: 16,
    POWER: { 17: 2, 18: 3, 19: 5, 20: 10 },
    SCATTER_IS_WILD: false,
    symbolNames: {
      0: 'The Outlaw', 1: 'Steam Train', 2: 'Gold Bars', 3: "Sheriff's Star", 4: 'Wanted Poster',
      5: 'Dynamite', 6: 'Revolver', 7: 'Money Bag', 8: 'Horseshoe', 9: 'Lantern',
      10: 'A', 11: 'K', 12: 'Q', 13: 'J', 14: '10',
      15: 'Wild', 16: 'Scatter', 17: 'Power Dynamite x2', 18: 'Power Dynamite x3', 19: 'Power Dynamite x5', 20: 'Power Dynamite x10'
    },

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
    // The Outlaw and the A-10 values are the reference's; the other pictures are ASSUMED tiers between them.
    paytable: {
      0:  { 2: 1,   3: 10,  4: 100, 5: 500 },  // The Outlaw     (REF: John Hunter)
      1:  { 2: 0.5, 3: 5,   4: 50,  5: 250 },  // Steam Train
      2:  { 2: 0.5, 3: 4,   4: 40,  5: 200 },  // Gold Bars      (REF: Tutankhamun mask values)
      3:  { 2: 0.5, 3: 3,   4: 20,  5: 100 },  // Sheriff's Star
      4:  { 2: 0.5, 3: 3,   4: 10,  5: 75 },   // Wanted Poster  (REF: cat / scarab values)
      5:  { 3: 2,   4: 10,  5: 50 },           // Dynamite
      6:  { 3: 2,   4: 8,   5: 40 },           // Revolver
      7:  { 3: 1.5, 4: 6,   5: 30 },           // Money Bag
      8:  { 3: 1,   4: 5,   5: 25 },           // Horseshoe
      9:  { 3: 1,   4: 5,   5: 25 },           // Lantern
      10: { 3: 0.5, 4: 4,   5: 15 },           // A  (REF)
      11: { 3: 0.5, 4: 4,   5: 15 },           // K  (REF)
      12: { 3: 0.5, 4: 2.5, 5: 10 },           // Q  (REF)
      13: { 3: 0.5, 4: 2.5, 5: 10 },           // J  (REF)
      14: { 3: 0.5, 4: 2.5, 5: 10 }            // 10 (REF)
    },
    scatterPays: { 3: 2, 4: 20, 5: 200 },      // REF: 3 / 4 / 5 books pay 2x / 20x / 200x total bet, anywhere

    // Symbol weights per reel for random stops (TUNED). Each cell is drawn independently.
    // Rows: reel 1..5. Columns: ids 0..20 (15 Wild, 16 Scatter, 17-20 Power Dynamite x2/x3/x5/x10).
    // Wild and Power Dynamite only on reels 2-4 (ASSUMED). Odd and even reels favour different card ranks (fewer
    // accidental lines) and the Scatter is commoner on the right. Measured (4 x 5M): RTP 96.6-97.3%, base 53%,
    // free spins 1 in 177, hit rate 21.4%.
    weights: [
      [1.5, 1.7, 1.9, 2.1, 2.1, 2.5, 2.7, 2.9, 3.1, 3.1, 17, 17, 8, 8, 8, 0, 1.5, 0, 0, 0, 0],
      [1.5, 1.7, 1.9, 2.1, 2.1, 2.5, 2.7, 2.9, 3.1, 3.1, 8, 8, 15, 15, 15, 3, 1.7, 0.55, 0.32, 0.13, 0.045],
      [1.5, 1.7, 1.9, 2.1, 2.1, 2.5, 2.7, 2.9, 3.1, 3.1, 17, 17, 8, 8, 8, 3, 2.15, 0.55, 0.32, 0.13, 0.045],
      [1.5, 1.7, 1.9, 2.1, 2.1, 2.5, 2.7, 2.9, 3.1, 3.1, 8, 8, 15, 15, 15, 3, 2.6, 0.55, 0.32, 0.13, 0.045],
      [1.5, 1.7, 1.9, 2.1, 2.1, 2.5, 2.7, 2.9, 3.1, 3.1, 17, 17, 8, 8, 8, 0, 3, 0, 0, 0, 0]
    ],
    // Free spins use their own weights (TUNED): fewer scatters, so retriggers are rarer.
    weightsFreeSpins: null,                    // null = same as base
    // Free spins: the special symbol's share of every reel, per symbol (TUNED). Premiums get a smaller share
    // than card ranks but pay far more, so the Outlaw is the rare dream special; a round's median is about 50x
    // (reference 60x), mean about 78x (reference 80.7x).
    specialShare: { 0: 0.0764, 1: 0.0812, 2: 0.0859, 3: 0.0907, 4: 0.0955, 5: 0.1146, 6: 0.1193, 7: 0.1241, 8: 0.1289, 9: 0.1289, 10: 0.1528, 11: 0.1528, 12: 0.1623, 13: 0.1623, 14: 0.1623 },

    // ---------------------------------------------------------- free spins (REF)
    freeSpins: 10,                             // 3+ scatters award 10 free spins
    freeSpinsRetrigger: 10,                    // 3+ scatters during free spins add 10 more, no limit
    // Which symbol becomes the expanding symbol (TUNED weights; REF: "one regular symbol chosen at random")
    specialWeights: { 0: 5, 1: 6, 2: 6, 3: 7, 4: 7, 5: 7, 6: 7, 7: 7, 8: 7, 9: 7, 10: 7, 11: 7, 12: 7, 13: 7, 14: 7 },
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
      specialShare: 1.04                       // TUNED: bought free spins use 1.04x the natural specialShare (buy RTP about 96.5%)
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
      symWin: [15, 126, 15],            // winning symbol: pop, hold, settle = 156 frames (two full loops + margin) = two full 2.5 s loops of the win animation (Darshan 2026-11-17: at least two loops)
      lineCycle: 156,                   // each line shown on its own after the all-lines view (two full loops + margin)
      scatterLand: 12,                  // scatter squash when it lands
      fuse: [24, 18, 18],               // trigger: fuse unrolls down the reel, crackers pop, settle
      pick: [90, 30],                   // special symbol pick: symbols cycle and slow down, then hold
      expand: [12, 24, 12],             // expanding symbol: flash, grow to the full reel, settle
      expandLines: 156,                 // the expanded reels pay: their tiles play the win animation twice (two loops + margin)
      anticipation: 54,                 // anticipation window per waiting reel after 2 Scatters have landed: the reel eases down to anticSlow of full speed
      banner: [30, 90, 30],             // modals and big win banners
      bannerTally: [30, 105],
      summaryTally: 75,
      transToFree: [40, 30, 90],     // gunfight: Outlaws fire, bullets meet, smoke covers (40); FREE SPINS (30); smoke clears slowly (90 = 3 s)
      transToBase: 45
    },
    anticipate: true,                   // slow the remaining reels when 2 scatters are showing
    anticSlow: 0.3,                     // ASSUMED: speed at the end of the anticipation window, as a fraction of full speed
    showPaylines: false,                // Darshan 2026-11-17: no win lines drawn; winning symbols animate instead
    autoContinueModals: true,           // START / COLLECT continue by themselves after the hold

    spin: { first: 1.0, gap: 0.18, speed: 22, bounce: 1.2 },

    // Layout in stage pixels (1920 x 1080), 2026-11-17 after Darshan's Pragmatic Play reference (Chronos):
    // the reels and the Outlaw take most of the screen; the logo sits on top of the reel frame; feature buy
    // (and an ante bet, if one is added) always in the left column; a slim control bar along the bottom.
    stage: { landscape: [1920, 1080] },
    window: { x: 285, y: 200, w: 1340, h: 705 },
    logo: { x: 625, y: -12, w: 660, h: 232 },      // box the logo (ui_splash_logo) is fitted into: centred on the reels
    mascot: { x: 1590, y: 150, w: 400, h: 850, flip: true },  // box the mascot art is fitted into (feet on the bottom edge); flip: face the reels
    // the supplied backgrounds are open scenery with no reel frame painted in, so the game draws a
    // weathered timber frame and dark plank panels behind the reels (ASSUMED look, matches the symbol tiles)
    reelFrame: true,
    buyButton: { x: 26, y: 330, w: 236, h: 176 },   // left column panel; the expanding-symbol card takes it in free spins
    anteSlot: { x: 26, y: 530, w: 236, h: 176 },    // reserved for an ante bet (none in this game yet)
    hudTop: 985,
    // Mesh rig for the mascot (src/rig.js), in pixels of char_mascot (639 x 1200). ASSUMED shapes, traced on the art:
    // the poncho waves, the chest breathes, the head turns, the gun arm aims and recoils when he fires.
    mascotRig: {
      cols: 18, rows: 34,
      anchors: { clothRoot: [330, 200], waist: [420, 520], neck: [420, 190], shoulder: [330, 300], elbow: [400, 322], tip: [560, 162], mouth: [425, 168] },
      cloth: { poly: [[305, 165], [250, 175], [195, 230], [120, 330], [55, 430], [5, 600], [20, 720], [60, 900], [105, 1010], [160, 960], [225, 900], [255, 800], [285, 560], [300, 330]], soft: 45 },
      head: { ellipse: [400, 105, 160, 115], soft: 45 },
      torso: { ellipse: [430, 360, 170, 210], soft: 70 },
      arm: { capsule: [330, 300, 570, 160, 78], soft: 40 },
      fore: { capsule: [440, 300, 562, 163, 50], soft: 26 },   // forearm + revolver: folds at the elbow to bring the barrel to his lips
      bend: { angle: -0.36, slide: 58 },          // muzzle ends just in front of his lips (anchors.mouth)
      fireOn: 'win'                     // the Outlaw fires on every win; double tap on banners and free spins
    },                        // the slim bottom bar starts here
    message: 'DEMO GAME IS ACTIVE'      // the message pill above the bar
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
  else root.CONFIG = CONFIG;
})(typeof window !== 'undefined' ? window : globalThis);
