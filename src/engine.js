/*
 * Game engine: pure maths, no drawing. Follows docs/official-game-rules.md
 * (the features and maths of "John Hunter and the Book of Tut", see docs/reference-game.md).
 *
 * resolveSpin(grid, opts) takes the stopped reels and returns a list of steps:
 *   win      line wins, left to right on adjacent reels; the Scatter substitutes as a Wild.
 *            Only the highest win per line is paid.
 *   scatter  3+ Scatters anywhere pay 2x / 20x / 200x total bet and award (or add) 10 free spins
 *   expand   free spins only: the special symbol is on enough reels to win, expands to fill
 *            those reels and pays on all 10 lines, adjacent or not (paid on top of the line wins)
 * The renderer plays these steps in order, so what you see is what the maths decided.
 *
 * Grid format: grid[reel][row] = symbol id (0..10 regular, 0 highest; 11 Scatter).
 * Works in the browser (window.Engine) and in Node (require('./engine')).
 */
(function (root) {
  function create(CONFIG, rng) {
    rng = rng || Math.random;
    const C = CONFIG, S = C.SCATTER, R = C.rows, N = C.reels, NL = C.paylines.length;
    const round2 = v => Math.round(v * 100) / 100;
    const clone = g => g.map(col => col.slice());
    const minCount = s => Math.min(...Object.keys(C.paytable[s]).map(Number));   // 2 for symbols that pay 2 of a kind

    function pickWeighted(table) {
      let total = 0; for (const k in table) total += table[k];
      let r = rng() * total;
      for (const k in table) { r -= table[k]; if (r <= 0) return k; }
      return Object.keys(table).pop();
    }
    // cumulative weight tables per reel, base and free spins
    const tables = {};
    // Free spins: the special symbol gets a fixed share of every reel, whichever symbol it is
    // (CONFIG.specialShare, TUNED), so a premium special lands as often as a low one and pays more.
    // Bought free spins use CONFIG.buy.specialShare (REF: bought free spins have their own reels per special).
    function table(fs, special, bought) {
      const key = fs ? (bought ? 'buy' + (typeof bought === 'string' ? bought : '') : 'fs') + (special ?? '') : 'base';
      if (tables[key]) return tables[key];
      const w = (fs && C.weightsFreeSpins) || C.weights;
      let share = C.specialShare;
      if (share && typeof share === 'object') share = share[special];   // per-symbol shares
      if (share && bought && C.buy) share *= buyOpt(bought).specialShare ?? C.buy.specialShare ?? 1;   // bought free spins: the option's boost
      share = Math.min(share || 0, .6) || share;
      return (tables[key] = w.map(row => {
        const others = row.reduce((t, x, s) => t + (s === special ? 0 : x), 0);
        const sw = fs && special != null && share ? others * share / (1 - share) : null;
        let a = 0; return row.map((x, s) => (a += (sw != null && s === special ? sw : x)));
      }));
    }
    function randomSymbol(reel, o = {}) {
      const t = table(o.fs, o.special, o.bought)[reel], total = t[t.length - 1];
      for (let tries = 0; tries < 50; tries++) {
        const r = rng() * total;
        let s = 0; while (t[s] < r) s++;
        if (o.noScatter && s === S) continue;
        return s;
      }
      return C.regular[C.regular.length - 1];
    }

    /** Random stop. opts.fs uses the free spins weights (opts.special boosted; opts.bought for bought free spins); opts.noScatter keeps Scatters off the board. */
    function randomGrid(opts = {}) {
      const g = [];
      for (let c = 0; c < N; c++) { g.push([]); for (let r = 0; r < R; r++) g[c].push(randomSymbol(c, opts)); }
      return g;
    }

    // Wilds: CONFIG.WILD, and the Power Dynamite ids in CONFIG.POWER ({ id: multiplier }), which are Wilds too.
    // When CONFIG.SCATTER_IS_WILD is set (Book of Tut style), the Scatter also substitutes.
    const POWER = C.POWER || {};
    const isWild = s => s === C.WILD || POWER[s] != null || (C.SCATTER_IS_WILD && s === S);
    const multOf = s => POWER[s] || 0;

    /**
     * Line wins: highest win per line, left to right, adjacent reels. Wilds substitute for pay symbols; a line that
     * starts with 2+ Wilds may instead pay as the top symbol (whichever pays more). Power Dynamite multipliers on the
     * winning part of a line are added together (x2 + x3 = x5) and multiply that line's win.
     */
    function evaluate(grid) {
      const wins = [];
      C.paylines.forEach((line, li) => {
        let sym = null, count = 0, wp = 0, prefix = true;
        for (let c = 0; c < N; c++) {
          const s = grid[c][line[c]];
          if (isWild(s)) { count++; if (prefix) wp++; continue; }
          prefix = false;
          if (s === S) break;
          if (sym === null) { sym = s; count++; continue; }
          if (s === sym) { count++; continue; }
          break;
        }
        const lineMult = n => { let m = 0; for (let c = 0; c < n; c++) m += multOf(grid[c][line[c]]); return m || 1; };
        const cands = [];
        if (sym !== null && C.paytable[sym][Math.min(count, 5)]) cands.push({ sym, count, base: C.paytable[sym][Math.min(count, 5)], mult: lineMult(count) });
        if (wp >= 2 && C.paytable[0][Math.min(wp, 5)]) cands.push({ sym: 0, count: wp, base: C.paytable[0][Math.min(wp, 5)], mult: lineMult(wp) });
        if (!cands.length) return;
        const best = cands.reduce((a, b) => (b.base * b.mult > a.base * a.mult ? b : a));
        const positions = [];
        let wilds = 0;
        for (let c = 0; c < best.count; c++) { positions.push([c, line[c]]); if (isWild(grid[c][line[c]])) wilds++; }
        wins.push({ line: li, sym: best.sym, count: best.count, pay: best.base * best.mult, base: best.base, mult: best.mult, wilds, positions });
      });
      return wins;
    }

    function scatters(grid) {
      const pos = [];
      for (let c = 0; c < N; c++) for (let r = 0; r < R; r++) if (grid[c][r] === S) pos.push([c, r]);
      return pos;
    }

    /**
     * Feature buy trigger spin (REF): a random board with 3, 4 or 5 Scatters, the count drawn from
     * CONFIG.buy.scatterWeights, each Scatter on a different reel.
     */
    function buyGrid() {
      const n = Number(pickWeighted(C.buy.scatterWeights));
      const g = randomGrid({ noScatter: true }), reels = [...Array(N).keys()];
      for (let i = reels.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [reels[i], reels[j]] = [reels[j], reels[i]]; }
      reels.slice(0, n).forEach(c => { g[c][Math.floor(rng() * R)] = S; });
      return g;
    }

    /** Free spins: reels holding the special symbol, and the pay if it expands. */
    function expansion(grid, special) {
      if (special == null) return null;
      const reels = [], cells = [];
      for (let c = 0; c < N; c++) {
        let has = false;
        for (let r = 0; r < R; r++) if (grid[c][r] === special) { has = true; cells.push([c, r]); }
        if (has) reels.push(c);
      }
      const count = reels.length;
      if (count < minCount(special)) return null;
      const pay = C.paytable[special][Math.min(count, 5)];
      if (!pay) return null;
      return { sym: special, reels, cells, count, pay, lines: NL, mult: pay * (C.expandPaysAllLines ? NL : 1) };
    }

    /**
     * Play out a stopped grid.
     * opts.bet          total bet
     * opts.inFreeSpins
     * opts.special      the expanding symbol (free spins)
     * Returns { start, end, steps, total (money), freeSpins }
     */
    function resolveSpin(startGrid, opts = {}) {
      const bet = opts.bet || 1, fs = !!opts.inFreeSpins;
      const grid = clone(startGrid), steps = [];
      let mult = 0, freeSpins = 0;

      // 1. line wins
      const wins = evaluate(grid).map(w => Object.assign(w, { amount: round2(w.pay * bet) }));
      if (wins.length) {
        const m = wins.reduce((a, w) => a + w.pay, 0); mult += m;
        steps.push({ type: 'win', wins, amount: round2(m * bet) });
      }
      // 2. scatters
      const sc = scatters(grid);
      if (sc.length >= 3) {
        const m = C.scatterPays[Math.min(sc.length, 5)] || 0; mult += m;
        freeSpins = fs ? C.freeSpinsRetrigger : C.freeSpins;
        steps.push({ type: 'scatter', count: sc.length, positions: sc, amount: round2(m * bet), freeSpins, retrigger: fs });
      }
      // 3. expanding special symbol (free spins)
      if (fs) {
        const ex = expansion(grid, opts.special);
        if (ex) {
          mult += ex.mult;
          ex.reels.forEach(c => { for (let r = 0; r < R; r++) grid[c][r] = ex.sym; });
          steps.push(Object.assign({ type: 'expand', amount: round2(ex.mult * bet) }, ex));
        }
      }
      return { start: clone(startGrid), end: grid, steps, total: round2(mult * bet), mult, freeSpins };
    }

    /** The expanding symbol. pool: allowed symbol ids (Feature Max picks from the top symbols only). */
    function pickSpecial(pool) {
      if (!pool) return Number(pickWeighted(C.specialWeights));
      const w = {}; pool.forEach(s => { w[s] = C.specialWeights[s] || 1; }); return Number(pickWeighted(w));
    }
    /** A feature buy option from CONFIG.buy.options by id (true or unknown: the standard buy). */
    function buyOpt(id) {
      const o = C.buy && (C.buy.options || []).find(x => x.id === id);
      return o || { id: 'free_spins', spins: C.freeSpins, price: C.buy ? C.buy.price : 100, specialShare: C.buy && C.buy.specialShare };
    }

    /** Index into CONFIG.winTiers for a win, or -1 when it is below the first banner. */
    function tierOf(total, bet) {
      const x = total / bet; let t = -1;
      C.winTiers.forEach((w, i) => { if (x >= w.min - 1e-9) t = i; });
      return t;
    }

    return { isWild, multOf, randomGrid, randomSymbol, buyGrid, evaluate, scatters, expansion, resolveSpin, pickSpecial, buyOpt, tierOf, clone, pickWeighted, minCount };
  }

  const Engine = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = Engine;
  else root.Engine = Engine;
})(typeof window !== 'undefined' ? window : globalThis);
