/*
 * Director: builds scripted outcomes for demos and cheats.
 * Each outcome is a stopped grid plus its resolved steps from the real engine, found by
 * building or searching grids until one matches what was asked for. Pure logic, no drawing.
 */
(function (root) {
  const OUTCOMES = {
    random:    { label: 'Random spin',                      color: '#8d8aa6' },
    nowin:     { label: 'No win',                           color: '#6c6a80' },
    small:     { label: 'Single line win',                  color: '#4fbf8a' },
    multi:     { label: 'Several line wins',                color: '#3fb6c9' },
    wildwin:   { label: 'Win with a Wild',                  color: '#e0794a' },
    power:     { label: 'Win with Power Dynamite (multiplier)', color: '#ff7a2a' },
    tease:     { label: '2 Scatters (anticipation, no trigger)', color: '#b08a5a' },
    trigger:   { label: '3 Scatters → Free Spins',          color: '#e8423a' },
    trigger4:  { label: '4 Scatters → Free Spins (20×)',    color: '#d9302a' },
    trigger5:  { label: '5 Scatters → Free Spins (200×)',   color: '#c2101a' },
    buy:       { label: 'Feature buy (100× bet)',           color: '#d4a017' },
    nice:      { label: 'Nice win banner (10×+)',           color: '#d08a4a' },
    big:       { label: 'Big win banner (20×+)',            color: '#ff9a3c' },
    mega:      { label: 'Mega win banner (50×+)',           color: '#f2b632' },
    superb:    { label: 'Superb win banner (100×+)',        color: '#3fcf7a' },
    // free spins only (inside free spins they use the round's special symbol)
    expand:    { label: 'Free spin: special expands (3 reels)', color: '#9b6bff', fs: true },
    expand2:   { label: 'Free spin: special expands (2 reels)', color: '#8a6bdf', fs: true },
    expand5:   { label: 'Free spin: special on all 5 reels',    color: '#c86bff', fs: true },
    retrigger: { label: 'Free spin: retrigger (+10)',       color: '#ff6ad5', fs: true },
    symwin:    { label: 'Symbol win',                       color: '#7ad06a' },   // item.sym a regular symbol id, item.len 2-5
    custom:    { label: 'Custom grid',                      color: '#2fd0c0' }
  };

  function create(CONFIG, engine) {
    const C = CONFIG, S = C.SCATTER, R = C.rows, N = C.reels, NR = C.regular.length;
    // premiums = symbols that pay 2 of a kind (used to build big-win boards)
    const PREM = C.regular.filter(s => engine.minCount(s) === 2);
    const MAXID = Math.max(S, C.WILD ?? 0, ...Object.keys(C.POWER || {}).map(Number));
    const rnd = n => Math.floor(Math.random() * n);
    const scCount = g => engine.scatters(g).length;

    function search(test, make, tries = 6000) {
      let best = null;
      for (let i = 0; i < tries; i++) {
        const { grid, opts } = make();
        const res = engine.resolveSpin(grid, opts);
        const score = test(res);
        if (score === true) return res;
        if (typeof score === 'number' && (!best || score > best.score)) best = { score, res };
      }
      if (best) return best.res;
      const m = make(); return engine.resolveSpin(m.grid, m.opts);
    }
    const stepOf = (res, type) => res.steps.find(s => s.type === type);
    // cheat outcomes rotate through the symbols (a shuffled bag), so repeated picks show different symbols and their
    // animations; a random board would mostly win with A-10, the most frequent symbols (presentation only, no maths)
    let bag = [];
    const nextSym = (ok = () => true) => {
      for (let tries = 0; tries < 2; tries++) {
        if (!bag.length) { bag = C.regular.slice(); for (let i = bag.length - 1; i > 0; i--) { const j = rnd(i + 1); [bag[i], bag[j]] = [bag[j], bag[i]]; } }
        const k = bag.findIndex(ok); if (k >= 0) return bag.splice(k, 1)[0];
        bag = [];
      }
      return C.regular[rnd(NR)];
    };
    // put symbol s on a random payline, len in a row from reel 1, and end the line there
    function plant(g, s, len, line) {
      const L = line || C.paylines[rnd(C.paylines.length)];
      for (let c = 0; c < N; c++) { if (c < len) g[c][L[c]] = s; else if (g[c][L[c]] === s) g[c][L[c]] = (s + 1 + rnd(NR - 1)) % NR; }
      return L;
    }
    const lenFor = s => engine.minCount(s) + rnd(5 - engine.minCount(s) + 1);
    const hasSym = (w, s) => w && w.wins.some(x => x.sym === s);
    // put n Scatters on n different random reels (each on a random row)
    function placeScatters(g, n, reels) {
      const pool = reels ? reels.slice() : [...Array(N).keys()];
      for (let i = pool.length - 1; i > 0; i--) { const j = rnd(i + 1); [pool[i], pool[j]] = [pool[j], pool[i]]; }
      pool.slice(0, n).forEach(c => { g[c][rnd(R)] = S; });
      return g;
    }

    /** Build an outcome. ctx = { bet, inFreeSpins, special, bought } */
    function build(item, ctx) {
      const bet = ctx.bet, fs = !!ctx.inFreeSpins, special = ctx.special, bought = ctx.bought || false;
      const base = { bet, inFreeSpins: fs, special };
      const rg = (o = {}) => engine.randomGrid(Object.assign({ fs, special, bought, noScatter: true }, o));
      const quiet = () => ({ grid: rg(), opts: base });
      const noFeature = r => !stepOf(r, 'scatter') && !stepOf(r, 'expand');
      const finish = res => { if (res.freeSpins && !fs) res.special = item.special != null ? Number(item.special) : engine.pickSpecial(); return res; };

      switch (item.type) {
        case 'buy':
          // feature buy trigger spin (base game only): weighted 3/4/5 Scatters
          if (fs) return engine.resolveSpin(engine.randomGrid({ fs, special, bought }), base);
          return finish(engine.resolveSpin(engine.buyGrid(), base));
        case 'nowin':
          return search(r => r.total === 0, quiet);
        case 'small':
        {
          const sy = nextSym();
          return search(r => { const w = stepOf(r, 'win'); if (!noFeature(r) || !hasSym(w, sy)) return 0;
            return (w.wins.length === 1 && r.total / bet < C.winTiers[0].min) || .5; },
            () => { const g = rg(); plant(g, sy, lenFor(sy)); return { grid: g, opts: base }; }, 3000);
        }
        case 'multi':
        {
          const sy = [nextSym(), nextSym(), nextSym()];
          return search(r => { const w = stepOf(r, 'win'); if (!noFeature(r) || !w) return 0;
            const n = sy.filter(x => hasSym(w, x)).length; return (n >= 3 && r.total / bet < C.winTiers[0].min) || n / 4; },
            () => { const g = rg(), lines = C.paylines.slice().sort(() => Math.random() - .5);
              sy.forEach((x, i) => plant(g, x, engine.minCount(x) + rnd(2), lines[i])); return { grid: g, opts: base }; }, 3000);
        }
        case 'wildwin':
        {
          const sy = nextSym();
          return search(r => { const w = stepOf(r, 'win'); if (!w || stepOf(r, 'scatter') || !w.wins.some(x => x.wilds > 0)) return 0; return w.wins.some(x => x.wilds > 0 && x.sym === sy) || .5; },
            () => { const g = rg(), L = plant(g, sy, Math.max(3, lenFor(sy))), c = 1 + rnd(2); g[c][L[c]] = C.WILD != null ? C.WILD : S; return { grid: g, opts: base }; });
        }
        case 'power': {
          // a line win that a Power Dynamite multiplies (any of x2 / x3 / x5 / x10)
          const pids = Object.keys(C.POWER || {}).map(Number);
          if (!pids.length) return build({ type: 'wildwin' }, ctx);
          const sy = nextSym();
          return search(r => { const w = stepOf(r, 'win'); if (!w || stepOf(r, 'scatter') || !w.wins.some(x => x.mult > 1) || r.total / bet >= C.winTiers[1].min) return 0; return w.wins.some(x => x.mult > 1 && x.sym === sy) || .5; },
            () => { const g = rg(), L = plant(g, sy, Math.max(3, lenFor(sy))), c = 1 + rnd(2); g[c][L[c]] = pids[rnd(pids.length)]; return { grid: g, opts: base }; });
        }
        case 'tease':
          return search(r => (scCount(r.start) === 2 && !stepOf(r, 'expand')) || 0,
            () => ({ grid: placeScatters(rg(), 2, [0, 1, 2]), opts: base }));
        case 'trigger': case 'trigger4': case 'trigger5': case 'retrigger': {
          const n = item.type === 'trigger4' ? 4 : item.type === 'trigger5' ? 5 : 3;
          return finish(search(r => (scCount(r.start) === n && (!fs || !stepOf(r, 'expand'))) || 0, () => ({ grid: placeScatters(rg(), n), opts: base }), 50));
        }
        case 'nice': case 'big': case 'mega': case 'superb': {
          // a real board in the tier's range: one to three lines of premiums, no scatter trigger
          const ti = C.winTiers.findIndex(t => t.id === item.type), lo = C.winTiers[ti].min, hi = (C.winTiers[ti + 1] || { min: lo * 3 }).min;
          // the lead symbol rotates through all symbols; low symbols reach the tier with more lines and Wilds
          const sy = nextSym();
          return search(r => { if (!noFeature(r) || r.total / bet < lo || r.total / bet >= hi) return 0; return hasSym(stepOf(r, 'win'), sy) || .5; }, () => {
            const g = rg(), k = 1 + rnd(5), lines = C.paylines.slice().sort(() => Math.random() - .5);
            for (let i = 0; i < k; i++) plant(g, i === 0 || rnd(2) ? sy : (PREM.length ? PREM[rnd(PREM.length)] : rnd(NR)), 3 + rnd(3), lines[i]);
            if (C.WILD != null && rnd(2)) g[1 + rnd(3)][rnd(R)] = C.WILD;
            return { grid: g, opts: base };
          }, 20000);
        }
        case 'expand': case 'expand2': case 'expand5': {
          // the special symbol on n reels; without an active special (outside free spins) this plays as a normal spin
          if (!fs || special == null) return engine.resolveSpin(engine.randomGrid({ fs, special, bought }), base);
          const need = item.type === 'expand2' ? 2 : item.type === 'expand5' ? 5 : 3;
          const n = item.type === 'expand2' ? Math.max(2, engine.minCount(special)) : need;
          return search(r => { const e = stepOf(r, 'expand'); return (e && e.count === n && !stepOf(r, 'scatter')) || 0; }, () => {
            const g = rg(), reels = [...Array(N).keys()].sort(() => Math.random() - .5).slice(0, n);
            for (let c = 0; c < N; c++) for (let r = 0; r < R; r++) if (g[c][r] === special) g[c][r] = (special + 1 + rnd(C.regular.length - 1)) % C.regular.length;
            reels.forEach(c => { g[c][rnd(R)] = special; });
            return { grid: g, opts: base };
          }, 400);
        }
        case 'symwin': {
          // the chosen symbol on a random payline (any of the 10), len in a row; only boards where that symbol is the only win
          const s = Math.max(0, Math.min(NR - 1, Math.round(Number(item.sym)) || 0));
          const minLen = engine.minCount(s), n = Math.max(minLen, Math.min(5, Math.round(Number(item.len)) || 3));
          const make = () => { const g = rg(); plant(g, s, n); return { grid: g, opts: base }; };
          return search(r => {
            const w = stepOf(r, 'win');
            if (!w || !w.wins.some(x => x.sym === s && x.count === n)) return 0;
            return (w.wins.every(x => x.sym === s) && !stepOf(r, 'expand')) ? true : .5;
          }, make, 4000);
        }
        case 'custom': {
          const ok = Array.isArray(item.grid) && item.grid.length === N && item.grid.every(col => Array.isArray(col) && col.length === R && col.every(v => Number.isInteger(v) && v >= 0 && v <= MAXID));
          if (!ok) return engine.resolveSpin(engine.randomGrid({ fs, special, bought }), base);   // a malformed grid plays as a normal spin
          return finish(engine.resolveSpin(item.grid.map(col => col.slice()), base));
        }
        default:
          return finish(engine.resolveSpin(engine.randomGrid({ fs, special, bought }), base));
      }
    }
    return { build };
  }

  // readable name of a queued item, e.g. "Drum win, 4 in a row"
  function describe(item, CONFIG) {
    const o = OUTCOMES[item.type] || OUTCOMES.random, names = (CONFIG && CONFIG.symbolNames) || {};
    if (item.type === 'symwin') {
      const nr = CONFIG ? CONFIG.regular.length : 11, sym = Math.max(0, Math.min(nr - 1, Math.round(Number(item.sym)) || 0));
      return `${names[sym] || 'Symbol'} win, ${Math.max(2, Math.min(5, Math.round(Number(item.len)) || 3))} in a row`;
    }
    if (/^trigger/.test(item.type) && item.special != null) return `${o.label}, special ${names[item.special]}`;
    return o.label;
  }

  const Director = { create, OUTCOMES, describe };
  if (typeof module !== 'undefined' && module.exports) module.exports = Director;
  else root.Director = Director;
})(typeof window !== 'undefined' ? window : globalThis);
