/*
 * Game presentation (timings in CONFIG.frames, 30 fps frame counts).
 *
 * The engine resolves a spin into steps (win, scatter, expand); this file spins the
 * reels and animates those steps, then runs the free spins flow: fuse unroll on the
 * Scatters, intro modal, special symbol pick, transition, free spins with the
 * expanding symbol, retriggers, summary and transition back. Everything is drawn on
 * one canvas (#stage) so it can be recorded to video.
 */
(function (root) {
  const C = root.CONFIG, A = root.Assets, SND = root.Audio2;
  const engine = root.Engine.create(C);
  const director = root.Director.create(C, engine);
  const cv = document.getElementById('stage'), ctx = cv.getContext('2d');
  const [W, H] = C.stage.landscape; cv.width = W; cv.height = H;
  const FR = C.frames, SC = C.SCATTER;
  const BLOCK = '"Lilita One", "Arial Black", sans-serif';
  const UIF = '"Outfit", "Arial", sans-serif';

  const now = () => performance.now() / 1000;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const ease = {
    out: u => 1 - Math.pow(1 - u, 3),
    inOut: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
    back: (u, s = 1.7) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2),
    elastic: u => u <= 0 ? 0 : u >= 1 ? 1 : Math.pow(2, -10 * u) * Math.sin((u * 10 - .75) * (2 * Math.PI) / 3) + 1
  };
  const fmt = v => C.currency + Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  /* ------------------------------------------------------------ state */
  const G = {
    balance: C.startBalance, betIndex: C.defaultBetIndex, win: 0, winFrom: 0, winT0: 0,
    busy: false, spinning: false, autoplay: false, skip: 0, speed: 1,
    board: null, fx: null, reels: [], spinResolve: null,
    lines: null, labels: [], particles: [], dim: 0, fuses: [], expanded: {}, antic: null,
    banner: null, modal: null, trans: null, info: false,
    env: 0, envTarget: 0, camera: 1, message: null,
    fs: { active: false, left: 0, played: 0, total: 0, awarded: 0, special: null, bought: false },
    buyArm: 0, mascotHop: 0, shots: [], shotFx: 0, mascotAnim: null, mascotIdleAt: 6,
    queue: [], onChange: () => {}
  };
  const bet = () => C.bets[G.betIndex];
  // presentation speed changes (demo slider) wait until the next spin starts, so an animation never speeds up or slows down halfway
  const setSpeed = v => { G.speedWanted = v; if (!G.busy) G.speed = v; };
  const applySpeed = () => { if (G.speedWanted) G.speed = G.speedWanted; };
  const sec = frames => frames / C.fps / G.speed;          // frames -> seconds at current speed

  /* ------------------------------------------------------------ layout */
  const WIN = C.window, cw = WIN.w / C.reels, ch = WIN.h / C.rows, x0 = WIN.x, y0 = WIN.y, gw = WIN.w, gh = WIN.h;
  const L = { cw, ch, x0, y0, gw, gh };
  const cellCenter = (c, r) => [x0 + c * cw + cw / 2, y0 + r * ch + ch / 2];
  const hy = C.hudTop, barH = H - hy;
  // HUD positions follow the supplied mockup's bottom bar
  // slim bar (Pragmatic-style): menu and info far left, credit and bet, the message in the middle, win,
  // then - SPIN + with autoplay under the spin button
  const hc = hy + barH / 2;
  const btn = {
    settings: { x: 48, y: hc - 21, r: 17 }, sound: { x: 48, y: hc + 21, r: 17 }, info: { x: 106, y: hc, r: 29 },
    minus: { x: 1500, y: hc, r: 28 }, plus: { x: 1740, y: hc, r: 28 },
    spin: { x: 1620, y: hc - 26, r: 70 }, auto: { x: 1620, y: hc + 34, r: 40 }
  };
  // feature buy button, top left above the mascot (the special symbol card takes its place in free spins)
  const buyBtn = C.buyButton || { x: 40, y: 36, w: 440, h: 76 };
  const M = C.mascot;

  G.board = engine.randomGrid({ noScatter: true });
  const newFx = () => G.board.map(col => col.map(() => ({})));
  G.fx = newFx();

  /* ------------------------------------------------------------ waits */
  function wait(s, skippable = false) {
    const tok = G.skip, end = performance.now() + s * 1000;
    return new Promise(res => { const tick = () => (performance.now() >= end || (skippable && G.skip !== tok)) ? res() : setTimeout(tick, 10); tick(); });
  }
  const waitF = (frames, skippable) => wait(sec(frames), skippable);

  /* ------------------------------------------------------------ reels */
  // anticipation: once two Scatters are showing, every later reel spins FR.anticipation frames longer
  function anticipationFrom(grid) {
    if (!C.anticipate) return C.reels;
    let n = 0;
    for (let c = 0; c < C.reels; c++) { if (n >= 2) return c; if (grid[c].includes(SC)) n++; }
    return C.reels;
  }
  function startReels(grid, fs, special, bought) {
    return new Promise(resolve => {
      const t0 = now(), sp = C.spin, R = C.rows, from = anticipationFrom(grid);
      grid.forEach((col, i) => {
        const cur = G.board[i];
        const extra = i >= from ? sec(FR.anticipation) * (i - from + 1) : 0;
        const Tstop = (sp.first + i * sp.gap) / G.speed + extra, wu = .1 / G.speed;
        // strip length so the full speed comes out at about sp.speed cells/s after the speed-up and the stop
        const abT = i >= from ? Math.min(sec(FR.anticipation), Tstop - wu - .4) : 0, kT = abT ? (C.anticSlow ?? .3) : 1;
        const N = Math.max(R + 3, Math.round(sp.speed * (Tstop - wu - (sp.accel ?? .28) / G.speed / 2 - abT * (1 - kT) / 2) - (sp.settle ?? 1.6)));
        const rs = () => engine.randomSymbol(i, { fs, special, bought });
        const s = [rs(), ...col, rs()];
        for (let k = 1; k < N; k++) s.push(rs());
        s.push(rs(), ...cur, rs());
        const pStart = R + N + 2, D = pStart - 1;
        // motion (smooth, 2026-11-21): a small wind-up, an eased speed-up, full speed, (anticipation: ease down to
        // anticSlow of it), then a decelerating stop with one soft overshoot whose speed matches the spin, so there
        // is no jump in speed anywhere. Speed V is solved so the reel lands exactly at Tstop.
        const AB = i >= from ? Math.min(sec(FR.anticipation), Tstop - wu - .4) : 0, kL = AB ? (C.anticSlow ?? .3) : 1;
        const A = Math.min((sp.accel ?? .28) / G.speed, (Tstop - wu - AB) * .5), v0 = sp.windup * Math.PI / wu;
        const Ld = sp.settle ?? 1.6, b = sp.bounce;
        const cruise = Tstop - wu - A - AB;
        const V = (D - Ld - v0 * A / 2) / (A / 2 + cruise + AB * (1 + kL) / 2);
        const vEnd = V * kL, bt = clamp(Ld * (b + 3) / vEnd, .1, .7);
        G.reels[i] = { strip: s, p: pStart, pStart, D, t0, T: Tstop, wu, A, v0, V, AB, kL, Ld, b, bt, cruise, state: 'spin', landed: false, antic: i >= from, vel: 0 };
      });
      G.antic = from < C.reels ? { from, t0 } : null;
      G.spinGrid = grid; G.spinResolve = resolve;
    });
  }
  function updateReels(t) {
    G.reels.forEach((r, i) => {
      if (!r || r.state !== 'spin') return;
      const tau = t - r.t0; let d, v;
      const w = C.spin.windup, t1 = r.wu + r.A, t2 = t1 + r.cruise, t3 = t2 + r.AB;
      const d1 = r.v0 * r.A / 2 + r.V * r.A / 2, d2 = d1 + r.V * r.cruise, d3 = d2 + r.V * r.AB * (1 + r.kL) / 2;
      if (tau < r.wu) { d = -w * Math.sin(Math.PI * tau / r.wu); v = -w * Math.PI / r.wu * Math.cos(Math.PI * tau / r.wu); }
      else if (tau < t1) { const q = tau - r.wu, a = (r.V - r.v0) / r.A; d = r.v0 * q + a * q * q / 2; v = r.v0 + a * q; }
      else if (tau < t2) { d = d1 + r.V * (tau - t1); v = r.V; }
      else if (tau < t3) { const u = (tau - t2) / r.AB; d = d2 + r.V * r.AB * (u - (1 - r.kL) * u * u / 2); v = r.V * (1 - (1 - r.kL) * u); }
      else {
        const u = Math.min(1, (tau - t3) / r.bt);
        d = d3 + r.Ld * ease.back(u, r.b);
        v = r.Ld * (3 * (r.b + 1) * Math.pow(u - 1, 2) + 2 * r.b * (u - 1)) / r.bt;
        if (!r.landed && u > .25) {
          r.landed = true; SND.play('sfx_reel_stop_0' + (i + 1));
          const sc = G.spinGrid[i];
          sc.forEach((s, rr) => { if (s === SC) { G.fx[i][rr].land = t; SND.play('sfx_scatter_land');
            if (r.antic) { const [bx, by] = cellCenter(i, rr); emit('spark', bx, by, 34, { angle: 0, spread: 7, speed: 520, drag: 6, gravity: 120, life: .7, size: 10, color: ['#fff6c8', '#ffd34a', '#ff8a2a'] }); G.anticHit = t; } } });
        }
        if (u >= 1) { r.state = 'idle'; G.board[i] = G.spinGrid[i].slice(); return; }
      }
      r.vel = v;
      r.blur = clamp((Math.abs(v) - 4) / 10, 0, 1);    // 0..1 with speed (cells/s): motion blur fades in and out smoothly
      r.p = r.pStart - d;
    });
    if (G.antic && G.reels.every(r => !r || r.state === 'idle' || !r.antic)) G.antic = null;
    if (G.spinResolve && G.reels.every(r => !r || r.state === 'idle')) { const f = G.spinResolve; G.spinResolve = null; f(); }
  }

  /* ------------------------------------------------------------ particles */
  function emit(type, x, y, n, o = {}) {
    for (let i = 0; i < n; i++) {
      const a = (o.angle ?? -Math.PI / 2) + (Math.random() - .5) * (o.spread ?? 1.6), sp = (o.speed ?? 500) * (.5 + Math.random());
      G.particles.push({ type, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, g: o.gravity ?? 900, life: 0, max: (o.life ?? 1.4) * (.8 + Math.random() * .4),
        rot: Math.random() * 6, vr: (Math.random() - .5) * 8, size: (o.size ?? 22) * (.7 + Math.random() * .6),
        color: Array.isArray(o.color) ? o.color[Math.floor(Math.random() * o.color.length)] : (o.color || '#fff'), burst: o.burst, drag: o.drag || 0 });
    }
  }
  function drawParticles(dt) {
    G.particles = G.particles.filter(p => {
      if (p.life >= p.max) { if (p.burst) emit('spark', p.x, p.y, 26, { angle: 0, spread: 7, speed: 380, gravity: 220, life: 1.1, size: 7, color: p.burst }); return false; }
      return true;
    });
    for (const p of G.particles) {
      p.life += dt; if (p.drag) { const k = Math.exp(-p.drag * dt); p.vx *= k; p.vy *= k; }   // drag keeps event sparks close to their source
      p.vy += p.g * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += p.vr * dt;
      const a = 1 - Math.pow(p.life / p.max, 2);
      ctx.save(); ctx.globalAlpha = clamp(a, 0, 1); ctx.translate(p.x, p.y);
      if (p.type === 'coin') {
        ctx.rotate(p.rot * .2); const w = Math.abs(Math.cos(p.rot)) * p.size + 2;
        ctx.fillStyle = '#f7c948'; ctx.beginPath(); ctx.ellipse(0, 0, w, p.size, 0, 0, 7); ctx.fill();
        ctx.strokeStyle = '#a8681a'; ctx.lineWidth = 3; ctx.stroke();
        if (w > p.size * .6) { ctx.strokeStyle = 'rgba(168,104,26,.8)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, w * .66, p.size * .66, 0, 0, 7); ctx.stroke(); ctx.fillStyle = '#fff1b0'; ctx.beginPath(); ctx.ellipse(-w * .3, -p.size * .35, w * .16, p.size * .1, -.6, 0, 7); ctx.fill(); }   // gold coin: rim and shine
      } else if (p.type === 'confetti') { ctx.rotate(p.rot); ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2 * Math.abs(Math.cos(p.rot * 2))); }
      else if (p.type === 'cracker') {     // little red firecracker tube
        ctx.rotate(p.rot); ctx.fillStyle = '#d61f26'; ctx.fillRect(-p.size * .2, -p.size * .5, p.size * .4, p.size);
        ctx.fillStyle = '#ffd34a'; ctx.fillRect(-p.size * .2, -p.size * .5, p.size * .4, p.size * .14); ctx.fillRect(-p.size * .2, p.size * .36, p.size * .4, p.size * .14);
      } else if (p.type === 'rocket') { ctx.fillStyle = '#fff6c8'; ctx.beginPath(); ctx.arc(0, 0, 5, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,200,120,.4)'; ctx.fillRect(-2, 0, 4, 30); }
      else { ctx.fillStyle = p.color; ctx.shadowColor = p.color; ctx.shadowBlur = 8; ctx.beginPath(); ctx.arc(0, 0, p.size / 2, 0, 7); ctx.fill(); }
      ctx.restore();
    }
  }
  // a firecracker string popping: flashes, sparks and flying tubes along a reel
  function popCrackers(c, n = 10) {
    const x = x0 + c * cw + cw / 2;
    for (let i = 0; i < n; i++) setTimeout(() => {
      const y = y0 + Math.random() * gh;
      emit('spark', x + (Math.random() - .5) * cw * .5, y, 14, { angle: 0, spread: 7, speed: 380, drag: 6, gravity: 150, life: .55, size: 8, color: ['#fff6c8', '#ffd34a', '#ff5a3a'] });
      emit('spark', x, y, 6, { angle: -Math.PI / 2, spread: 1.2, speed: 180, drag: 3, gravity: -40, life: 1, size: 22, color: ['rgba(235,222,205,.55)', 'rgba(200,185,170,.45)'] });   // a puff of steam
      SND.play('sfx_cracker_pop');
    }, i * 70 / G.speed);
  }

  /* ------------------------------------------------------------ text helpers */
  function blockText(txt, x, y, size, o = {}) {
    ctx.save(); ctx.translate(x, y); const k = o.scale ?? 1; ctx.scale(k, k); ctx.globalAlpha = o.alpha ?? 1;
    ctx.font = `${size}px ${BLOCK}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (o.maxW) { const w = ctx.measureText(txt).width; if (w * k > o.maxW) { const s = o.maxW / (w * k); ctx.scale(s, s); } }
    const cols = o.colors || ['#fffbe0', '#ffd04a', '#e07b00'];
    const g = ctx.createLinearGradient(0, -size * .5, 0, size * .5); cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), c));
    ctx.lineJoin = 'round';
    ctx.fillStyle = o.shadow || 'rgba(60,5,5,.85)'; ctx.fillText(txt, size * .03, size * .07);
    ctx.lineWidth = size * .14; ctx.strokeStyle = o.stroke || '#6a0a0a'; ctx.strokeText(txt, 0, 0);
    ctx.fillStyle = g; ctx.fillText(txt, 0, 0); ctx.restore();
  }
  function uiText(txt, x, y, size, col = '#fff', align = 'center', weight = 700, maxW) {
    ctx.font = `${weight} ${size}px ${UIF}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle'; maxW ? ctx.fillText(txt, x, y, maxW) : ctx.fillText(txt, x, y);
  }

  /* ------------------------------------------------------------ environment */
  function drawEnvironment(t) {
    const breathe = .5 - .5 * Math.cos(t / (FR.bgBaseLoop / C.fps) * Math.PI * 2);
    ctx.drawImage(A.get('bg_base_main'), 0, 0, W, H);
    if (G.env > 0) { ctx.save(); ctx.globalAlpha = G.env; ctx.drawImage(A.get('bg_freegame_main'), 0, 0, W, H); ctx.restore(); }
    // warm light breathing either side of the reels (side decorations on the background)
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    [[90, 250], [W - 90, 250]].forEach(([lx, ly]) => {
      const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, 150); g.addColorStop(0, `rgba(255,150,60,${.10 + .10 * breathe})`); g.addColorStop(1, 'rgba(255,120,40,0)');
      ctx.fillStyle = g; ctx.fillRect(lx - 150, ly - 150, 300, 300);
    });
    ctx.restore();
    // (no ambient particles over the backgrounds: Darshan 2026-11-21)
  }

  /* ------------------------------------------------------------ mascot */
  // the Outlaw stands right of the reels: idle sway and breathing; hops on big wins and free spins
  // the mascot is animated by the mesh rig (src/rig.js): poncho in the wind, breathing, head turn, and he fires his
  // revolver on wins (G.shots holds the shot times). Rendered into its own canvas at 30 fps, then placed.
  const rigs = {};
  const puppetOn = () => root.RIGS && root.RIGS.outlaw && A.real.char_outlaw_parts && root.Rig.createPuppet;
  function rigCanvas(key, k, t, st) {
    if (puppetOn()) return puppetCanvas(key, k, t, st);
    const img = A.get('char_mascot'); if (!img || !C.mascotRig || !root.Rig) return null;
    let r = rigs[key];
    if (!r || r.k !== k || r.img !== img) { const cv = document.createElement('canvas'); cv.width = Math.ceil(img.width * k); cv.height = Math.ceil(img.height * k); r = rigs[key] = { k, img, cv, c2: cv.getContext('2d'), rig: root.Rig.create(img, C.mascotRig), last: -1 }; }
    const frame = Math.floor(t * 30), sk = JSON.stringify(st);
    if (frame !== r.last || sk !== r.sk) { r.last = frame; r.sk = sk; r.c2.clearRect(0, 0, r.cv.width, r.cv.height); r.rig.render(r.c2, k, frame / 30, st); }
    return r;
  }
  // the mascot's animations: idle 1 runs all the time; idle 2 (wind gust) plays every 8-12 s while nothing
  // else happens; "win" (quick draw, three shots) plays on wins, banners and free-spins triggers
  // the cutout puppet (assets/rigs/outlaw.js) drawn into its own canvas the size of the reference art, 30 fps
  function puppetCanvas(key, k, t, st) {
    const def = root.RIGS.outlaw, F = def.frame, mk = img => ({ width: F[2] - F[0], height: F[3] - F[1] });
    let r = rigs[key];
    if (!r || r.k !== k || !r.pup) { const cv = document.createElement('canvas'); cv.width = Math.ceil((F[2] - F[0]) * k); cv.height = Math.ceil((F[3] - F[1]) * k);
      const pup = root.Rig.createPuppet(A.get('char_outlaw_parts'), def);
      r = rigs[key] = { k, cv, c2: cv.getContext('2d'), pup, last: -1, rig: { point: (n, tt, s2) => { const [x, y] = pup.point(n, tt, s2); return [x - F[0], y - F[1]]; } } }; }
    const frame = Math.floor(t * 30), sk = JSON.stringify(st);
    if (frame !== r.last || sk !== r.sk) { r.last = frame; r.sk = sk; r.c2.setTransform(1, 0, 0, 1, 0, 0); r.c2.clearRect(0, 0, r.cv.width, r.cv.height); r.pup.render(r.c2, k, frame / 30, st); }
    return r;
  }
  const mascotSize = () => { if (puppetOn()) { const F = root.RIGS.outlaw.frame; return [F[2] - F[0], F[3] - F[1]]; } const img = A.get('char_mascot'); return img ? [img.width, img.height] : null; };
  function mascotState(t) {
    const ma = G.mascotAnim, A2 = root.Rig && root.Rig.ANIMS;
    if (ma && t - ma.t0 > ma.dur) G.mascotAnim = null;
    if (!G.mascotAnim && t > G.mascotIdleAt) { G.mascotAnim = { name: 'idle2', t0: t, dur: 4.2 }; G.mascotIdleAt = t + 4.2 + 8 + Math.random() * 4; }
    const last = G.shots.filter(s => s <= t).pop();
    const fire = last == null || t - last > 1.2 ? null : t - last;
    const a = G.mascotAnim ? { name: G.mascotAnim.name, u: Math.round((t - G.mascotAnim.t0) * 30) / 30 } : null;
    return { fire: fire == null ? null : Math.round(fire * 30) / 30, gust: G.fs.active ? .4 : 0, anim: a };
  }
  function shoot() {
    if (videoMascotOn()) { if (VM.clip !== 'win' && VM.want == null) VM.want = now(); return; }
    const t = now(), ma = G.mascotAnim;
    const W2 = (puppetOn() ? root.Rig.PANIMS : root.Rig.ANIMS).win;
    if (ma && ma.name === 'win' && t - ma.t0 < W2.dur - .6) return;     // already playing: let it finish
    G.mascotAnim = { name: 'win', t0: t, dur: W2.dur }; G.mascotIdleAt = t + W2.dur + 6;
    for (const d of W2.shots) G.shots.push(t + d);
    G.shots = G.shots.filter(s => s > t - 3);
  }
  /* video mascot: three clips from Darshan's green-screen videos (C.mascotVideo). Every clip starts and ends on the
     same pose, so any clip can follow any other; frames are blended for smooth playback at 12-15 fps. */
  const MV = C.mascotVideo;
  const vmClip = name => {
    const key = 'char_outlaw_' + name, meta = (root.ASSET_MANIFEST.anims || {})[key];
    if (!meta || !A.real[key]) return null;
    const img = A.get(key); return Object.assign({ img, fw: img.width / meta.cols, fh: img.height / meta.rows, dur: meta.frames / meta.fps }, meta);
  };
  const videoMascotOn = () => !!(MV && M && vmClip('idle1') && vmClip('idle2') && vmClip('win'));
  const VM = { clip: 'idle1', t0: 0, seq: 0, since2: 99, want: null, prev: null, shot: 0 };
  function vmStart(name, t) { VM.prev = { clip: VM.clip, u: t - VM.t0, t }; VM.clip = name; VM.t0 = t; VM.shot = 0; }
  function vmUpdate(t) {
    if (!VM.t0) VM.t0 = t;
    if (VM.want != null && t - VM.want > 20) VM.want = null;               // a win that waited too long is dropped
    if (VM.want != null && VM.clip === 'idle1' && VM.since2 >= MV.gapAfterIdle2) { VM.want = null; vmStart('win', t); return; }
    if (t - VM.t0 < vmClip(VM.clip).dur) return;
    // the clip has finished: count idle-1 loops since idle 2, then pick the next clip
    if (VM.clip === 'idle1') VM.since2++;
    if (VM.clip === 'idle2') VM.since2 = 0;
    let next;
    if (VM.clip === 'win') { VM.seq = 0; next = MV.order[0]; }
    else {
      VM.seq = (VM.seq + 1) % MV.order.length; next = MV.order[VM.seq];
      if (VM.want != null && VM.clip !== 'idle2' && VM.since2 >= MV.gapAfterIdle2) { VM.want = null; next = 'win'; }
      else if (next === 'idle2' && VM.want != null) next = 'idle1';     // a waiting win goes first; idle 2 comes later
    }
    VM.prev = null; VM.clip = next; VM.t0 = t; VM.shot = 0;
  }
  function vmDraw(name, u, alpha, dir, k, fx, fy) {
    const c = vmClip(name), p = clamp(u * c.fps, 0, c.frames - 1), i = Math.floor(p), f = p - i, j = (i + 1) % c.frames;
    const cell = n => [(n % c.cols) * c.fw, Math.floor(n / c.cols) * c.fh];
    ctx.save(); ctx.translate(fx, fy); ctx.scale(dir * k, k);
    const [ax, ay] = cell(i), [bx, by] = cell(j), X = -MV.feet[0], Y = -MV.feet[1];
    ctx.globalAlpha = alpha; ctx.drawImage(c.img, ax, ay, c.fw, c.fh, X, Y, c.fw, c.fh);
    if (f > .02) { ctx.globalAlpha = alpha * f; ctx.drawImage(c.img, bx, by, c.fw, c.fh, X, Y, c.fw, c.fh); }
    ctx.restore();
  }
  function drawVideoMascot(t) {
    vmUpdate(t);
    const dir = M.flip ? -1 : 1, k = MV.screenH / MV.charH, fx = M.x + M.w / 2, fy = M.y + M.h, u = Math.floor((t - VM.t0) * 30) / 30;   // 30 fps steps
    vmDraw(VM.clip, u, 1, dir, k, fx, fy);
    if (VM.prev) {                                                         // a win cutting in: the old clip fades out on top
      const q = (t - VM.prev.t) / MV.fade;
      if (q >= 1) VM.prev = null; else vmDraw(VM.prev.clip, VM.prev.u + (t - VM.prev.t), 1 - q, dir, k, fx, fy);
    }
    if (VM.clip === 'win') while (VM.shot < MV.shots.length && u >= MV.shots[VM.shot]) { VM.shot++; SND.play('sfx_cracker_pop'); }
  }
  function drawMascot(t) {
    if (videoMascotOn()) { drawVideoMascot(t); return; }
    const img = A.get('char_mascot'), sz = mascotSize(); if (!sz || !M) return;
    const k = Math.min(M.w / sz[0], M.h / sz[1]), w = sz[0] * k, h = sz[1] * k;
    const fx = M.x + M.w / 2, fy = M.y + M.h, dir = M.flip ? -1 : 1, st = mascotState(t);
    const r = rigCanvas('mascot', k, t, st);
    ctx.save(); ctx.translate(fx, fy); ctx.scale(dir, 1);
    if (r) ctx.drawImage(r.cv, -w / 2, -h); else ctx.drawImage(img, -w / 2, -h, w, h);
    ctx.restore();
    // blowing the smoke off the barrel: a soft stream of smoke drifts off the muzzle, away from his face
    const blow = root.Rig && (puppetOn() ? root.Rig.PANIMS : root.Rig.ANIMS).win.blow;
    if (r && st.anim && st.anim.name === 'win' && blow && st.anim.u > blow[0] && st.anim.u < blow[1]) {
      const [tx, ty] = r.rig.point('tip', Math.floor(t * 30) / 30, st), sx = fx + dir * (tx * k - w / 2), sy = fy - h + ty * k;
      const q = (st.anim.u - blow[0]) / (blow[1] - blow[0]);
      if (Math.random() < .9 - q * .5) emit('spark', sx + dir * 6, sy - 4, 1, { angle: dir > 0 ? -.35 : Math.PI + .35, spread: .35, speed: 140 + 60 * (1 - q), drag: 1.6, gravity: -50, life: 1.4, size: 16 + 14 * q, color: ['rgba(232,224,214,.45)', 'rgba(210,200,190,.38)'] });
    }
    // muzzle flash and smoke at the gun tip when he fires
    if (r && st.fire != null) {
      const [tx, ty] = r.rig.point('tip', Math.floor(t * 30) / 30, st), sx = fx + dir * (tx * k - w / 2), sy = fy - h + ty * k;
      if (st.fire < .1) {
        const rr = 90 * (1 - st.fire / .1) + 30; ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr); g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(.3, 'rgba(255,200,90,.9)'); g.addColorStop(1, 'rgba(255,120,30,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, rr, 0, 7); ctx.fill(); ctx.restore();
      }
      const key = G.shots.filter(s => s <= t).length;
      if (G.shotFx !== key) { G.shotFx = key; SND.play('sfx_cracker_pop');
        emit('spark', sx, sy, 10, { angle: dir > 0 ? -.4 : Math.PI + .4, spread: 1, speed: 420, drag: 7, gravity: 200, life: .35, size: 7, color: ['#fff6c8', '#ffd34a'] });
        emit('spark', sx, sy, 5, { angle: -Math.PI / 2, spread: .6, speed: 80, drag: 2, gravity: -40, life: 1.3, size: 20, color: ['rgba(225,215,205,.4)', 'rgba(200,190,180,.35)'] }); }
    }
  }

  // the game logo (ui_splash_logo) in its box with a slow shimmer; without logo art, the title in text above the reels
  function drawLogo(t) {
    const img = A.real.ui_splash_logo ? A.get('ui_splash_logo') : null;
    if (!img || !C.logo) { blockText(C.title.toUpperCase(), x0 + gw / 2, Math.max(48, y0 - 60), 64, { maxW: gw }); return; }
    const L2 = C.logo, s = 1 + .012 * Math.sin(t * 1.4), k = Math.min(L2.w / img.width, L2.h / img.height) * s, w = img.width * k, h = img.height * k;
    ctx.drawImage(img, L2.x + L2.w / 2 - w / 2, L2.y + L2.h / 2 - h / 2, w, h);
  }

  // timber reel frame with iron rivets and dark plank panels; cooler and darker in free spins
  function drawReelFrame() {
    if (!C.reelFrame) return;
    const pad = 22, fx2 = x0 - pad, fy = y0 - pad, fw = gw + pad * 2, fh = gh + pad * 2, e = G.env;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.55)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 10;
    const wood = ctx.createLinearGradient(0, fy, 0, fy + fh); wood.addColorStop(0, '#8a5a32'); wood.addColorStop(.5, '#6a4224'); wood.addColorStop(1, '#4a2c16');
    ctx.fillStyle = wood; ctx.beginPath(); ctx.roundRect(fx2, fy, fw, fh, 14); ctx.fill();
    ctx.shadowColor = 'transparent';
    // plank grain on the frame
    ctx.strokeStyle = 'rgba(40,20,8,.35)'; ctx.lineWidth = 2;
    for (let i = 1; i < 4; i++) { ctx.beginPath(); ctx.moveTo(fx2 + 6, fy + i * pad / 4); ctx.lineTo(fx2 + fw - 6, fy + i * pad / 4); ctx.stroke(); ctx.beginPath(); ctx.moveTo(fx2 + 6, fy + fh - i * pad / 4); ctx.lineTo(fx2 + fw - 6, fy + fh - i * pad / 4); ctx.stroke(); }
    ctx.lineWidth = 4; ctx.strokeStyle = '#2a170a'; ctx.beginPath(); ctx.roundRect(fx2, fy, fw, fh, 14); ctx.stroke();
    // reel panels: dark planks, slightly see-through so the scene still breathes behind
    for (let c = 0; c < C.reels; c++) {
      const px = x0 + c * cw + 3, pw = cw - 6;
      const g = ctx.createLinearGradient(0, y0, 0, y0 + gh);
      g.addColorStop(0, `rgba(${lerp(46, 20, e)},${lerp(26, 22, e)},${lerp(14, 40, e)},.86)`); g.addColorStop(1, `rgba(${lerp(30, 12, e)},${lerp(16, 14, e)},${lerp(8, 28, e)},.9)`);
      ctx.fillStyle = g; ctx.fillRect(px, y0, pw, gh);
      ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1;
      for (let k = 1; k < 3; k++) { ctx.beginPath(); ctx.moveTo(px + pw * k / 3, y0); ctx.lineTo(px + pw * k / 3, y0 + gh); ctx.stroke(); }
    }
    // iron corner brackets and rivets
    ctx.fillStyle = '#3a3a3e';
    [[fx2, fy], [fx2 + fw, fy], [fx2, fy + fh], [fx2 + fw, fy + fh]].forEach(([x, y]) => { ctx.beginPath(); ctx.arc(x + (x > fx2 ? -16 : 16), y + (y > fy ? -11 : 11), 6, 0, 7); ctx.fill(); });
    for (let i = 1; i < C.reels; i++) { const rx = x0 + i * cw; [fy + 11, fy + fh - 11].forEach(ry => { ctx.fillStyle = '#3a3a3e'; ctx.beginPath(); ctx.arc(rx, ry, 5, 0, 7); ctx.fill(); ctx.fillStyle = 'rgba(255,255,255,.25)'; ctx.beginPath(); ctx.arc(rx - 1.5, ry - 1.5, 2, 0, 7); ctx.fill(); }); }
    ctx.restore();
  }

  /* ------------------------------------------------------------ symbols */
  // draw a symbol image fitted into its cell box (manifest.fit scales the box per symbol)
  function drawSym(id, cx, cy, o = {}) {
    const img = A.symbol(id); if (!img) return;
    const f = A.fit(id), bw = cw * f[0], bh = ch * f[1], k = Math.min(bw / img.width, bh / img.height) * (o.scale ?? 1);
    const w = img.width * k, h = img.height * k * (o.scaleY ?? 1);
    ctx.save(); ctx.globalAlpha = o.alpha ?? 1;
    ctx.drawImage(img, cx - w / 2, cy - h / 2 + (o.dy || 0) + img.height * k * (1 - (o.scaleY ?? 1)) / 2, w, h);
    // Power Dynamite wears its multiplier plate on the lower right (ASSUMED placement)
    const plate = A.multPlate(id);
    if (plate) {
      const ph = ch * .42 * (o.scale ?? 1), pw = plate.width * ph / plate.height;
      ctx.drawImage(plate, cx + cw * .44 * (o.scale ?? 1) - pw, cy + ch * .47 * (o.scale ?? 1) - ph + (o.dy || 0), pw, ph);
    }
    ctx.restore();
  }
  // winning symbol scale curve: pop to 1.12, hold with a small bob, settle back
  function winScale(f) {
    const [a, b, c] = FR.symWin;
    if (f < a) return 1 + .12 * ease.out(f / a);
    if (f < a + b) return 1.12 + .02 * Math.sin((f - a) / b * Math.PI);
    if (f < a + b + c) return 1.12 - .12 * ease.inOut((f - a - b) / c);
    return 1;
  }
  // one frame of a symbol's win sheet, fitted exactly like its idle art (frame 1 = the idle art)
  // frame may be fractional: sheets stored below 30 fps blend the next frame over by the fraction, so they still play smoothly
  function drawAnimFrame(id, an, frame, cx, cy, alpha) {
    const f = A.fit(id), bw = cw * f[0], bh = ch * f[1], k = Math.min(bw / an.fw, bh / an.fh), w = an.fw * k, h = an.fh * k;
    if (an.fps >= C.fps) frame = Math.floor(frame);              // 30 fps sheets: whole frames, no blending
    const p = ((frame % an.frames) + an.frames) % an.frames, i = Math.floor(p), fr = p - i, j = (i + 1) % an.frames;
    ctx.save(); ctx.globalAlpha = alpha;
    ctx.drawImage(an.img, (i % an.cols) * an.fw, Math.floor(i / an.cols) * an.fh, an.fw, an.fh, cx - w / 2, cy - h / 2, w, h);
    if (fr > .02) { ctx.globalAlpha = alpha * fr; ctx.drawImage(an.img, (j % an.cols) * an.fw, Math.floor(j / an.cols) * an.fh, an.fw, an.fh, cx - w / 2, cy - h / 2, w, h); ctx.globalAlpha = alpha; }
    const plate = A.multPlate(id);     // Power Dynamite keeps its multiplier plate while it animates
    if (plate) { const ph = ch * .42, pw = plate.width * ph / plate.height; ctx.drawImage(plate, cx + cw * .44 - pw, cy + ch * .47 - ph, pw, ph); }
    ctx.restore();
  }
  function drawCell(c, r, s, cx, cy, t) {
    const fx = G.fx[c][r] || {}, F = x => (t - x) * C.fps * G.speed;
    let scale = 1, sy = 1, alpha = 1;
    const an = fx.win != null ? A.anim(s) : null;
    if (fx.win != null) {
      const f = F(fx.win); scale = an ? 1 : winScale(f);      // animated symbols keep their position and size (position lock)
      // glow behind a winning symbol
      const a = Math.sin(clamp(f / (FR.symWin[0] + FR.symWin[1] + FR.symWin[2]), 0, 1) * Math.PI);
      ctx.save(); ctx.globalAlpha = a * .85; const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, cw * .6); g.addColorStop(0, 'rgba(255,230,140,.95)'); g.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = g; ctx.fillRect(cx - cw * .6, cy - ch * .6, cw * 1.2, ch * 1.2); ctx.restore();
    } else if (G.dim && !fx.keep) alpha = 1 - .65 * G.dim;
    if (G.antic && G.reels[c] && G.reels[c].state === 'idle') {
      const k = Math.max(...G.reels.map(rr => anticAmount(rr, t)));
      if (s === SC) scale *= 1 + .07 * k * Math.sin(t * 6.4);
    }
    if (s === SC && fx.land != null) { const f = F(fx.land); if (f < FR.scatterLand) sy = .82 + .18 * ease.back(f / FR.scatterLand, 2.5); }
    if (fx.pulse != null) scale *= 1 + .06 * Math.sin((t - fx.pulse) * 9);
    if (an) { drawAnimFrame(s, an, F(fx.win) * an.fps / C.fps, cx, cy, alpha); return; }
    drawSym(s, cx, cy, { scale, scaleY: sy, alpha });
    if (fx.win != null) shineFx(F(fx.win), cx, cy, scale);
  }
  // shared win FX for symbols without their own sheet (re-used, no extra asset): a light band sweeps across the
  // tile and a star sparkle pops on its corner, once per 45-frame loop like the sheet animations
  function shineFx(f, cx, cy, scale) {
    const u = (f % 45) / 45, w = cw * .98 * scale, h = ch * .98 * scale;
    ctx.save(); ctx.beginPath(); ctx.roundRect(cx - w / 2, cy - h / 2, w, h, 12); ctx.clip(); ctx.globalCompositeOperation = 'lighter';
    const bx = cx - w * .9 + w * 1.8 * clamp(u / .45, 0, 1);
    if (u < .45) { const g = ctx.createLinearGradient(bx - 70, 0, bx + 70, 0); g.addColorStop(0, 'rgba(255,230,160,0)'); g.addColorStop(.5, 'rgba(255,240,190,.55)'); g.addColorStop(1, 'rgba(255,230,160,0)');
      ctx.fillStyle = g; ctx.save(); ctx.translate(bx, cy); ctx.rotate(-.35); ctx.fillRect(-70, -h, 140, h * 2); ctx.restore(); }
    ctx.restore();
    const sp = clamp(1 - Math.abs(u - .55) / .12, 0, 1);
    if (sp > 0) { const sx = cx + w * .3, sy2 = cy - h * .3, r = 34 * sp; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = `rgba(255,246,210,${sp})`;
      ctx.beginPath(); for (let k = 0; k < 8; k++) { const q = k * Math.PI / 4, rr = k % 2 ? r * .22 : r; ctx.lineTo(sx + Math.cos(q) * rr, sy2 + Math.sin(q) * rr); } ctx.closePath(); ctx.fill(); ctx.restore(); }
  }
  function drawGrid(t) {
    // spinning reels are clipped to the window; stopped symbols may overflow it slightly, as in the mockup
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, gw, gh); ctx.clip();
    for (let c = 0; c < C.reels; c++) {
      const r = G.reels[c];
      if (r && r.state === 'spin') {
        const j0 = Math.floor(r.p) - 1, j1 = Math.ceil(r.p + C.rows);
        for (let j = Math.max(0, j0); j <= Math.min(r.strip.length - 1, j1); j++) {
          const cx = x0 + c * cw + cw / 2, cy = y0 + (j - r.p) * ch + ch / 2;
          const bl = r.blur;          // motion blur by speed: two trailing copies, the sharp symbol fades a little
          if (bl > .02) { const o = ch * .07 * bl; drawSym(r.strip[j], cx, cy - o, { alpha: .35 * bl }); drawSym(r.strip[j], cx, cy + o, { alpha: .35 * bl }); }
          drawSym(r.strip[j], cx, cy, { alpha: 1 - .45 * bl });
        }
      }
    }
    ctx.restore();
    // draw top row last so a symbol's overflow sits under the row above it? Bottom-up keeps tile tops visible.
    for (let row = C.rows - 1; row >= 0; row--) for (let c = 0; c < C.reels; c++) {
      const r = G.reels[c]; if (r && r.state === 'spin') continue;
      if (G.expanded[c] && G.expanded[c].done) continue;
      const [cx, cy] = cellCenter(c, row); drawCell(c, row, G.board[c][row], cx, cy, t);
    }
  }

  /* ------------------------------------------------------------ fx layers */
  // anticipation (Western): the reel waiting for the third Scatter slows down; a lit fuse spark races round its
  // frame leaving a burning trail, warm light pulses inside, steam rises from below; the other reels dim and the
  // Scatters already showing pulse (drawCell)
  function anticAmount(r, t) { return r && r.antic && r.state === 'spin' ? clamp((t - r.t0 - (r.T - r.AB)) * 2.5, 0, 1) : 0; }
  function drawAnticipation(t) {
    if (!G.antic) return;
    // veil: the stopped reels sink into shadow, the Scatters already showing stay lit and are redrawn on top
    const k = Math.max(...G.reels.map(rr => anticAmount(rr, t)));
    if (k > 0) {
      ctx.save(); ctx.fillStyle = `rgba(10,4,0,${.5 * k})`;
      G.reels.forEach((r, c) => { if (r && r.state === 'idle') ctx.fillRect(x0 + c * cw, y0, cw, gh); });
      ctx.restore();
      G.reels.forEach((r, c) => { if (r && r.state === 'idle') for (let rr = 0; rr < C.rows; rr++) if (G.board[c][rr] === SC) { const [cx, cy] = cellCenter(c, rr); drawCell(c, rr, SC, cx, cy, t); } });
    }
    G.reels.forEach((r, c) => {
      const a = anticAmount(r, t); if (a <= 0) return;
      const x = x0 + c * cw + 4, y = y0 - 6, w = cw - 8, h = gh + 12, P = 2 * (w + h);
      const pt = d => { d = ((d % P) + P) % P; return d < w ? [x + d, y] : d < w + h ? [x + w, y + d - w] : d < 2 * w + h ? [x + w - (d - w - h), y + h] : [x, y + h - (d - 2 * w - h)]; };
      ctx.save(); ctx.globalAlpha = a;
      // warm light inside the reel, pulsing like a heartbeat
      const beat = .5 + .5 * Math.pow(Math.abs(Math.sin(t * 3.2)), 3);
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createLinearGradient(0, y0 + gh, 0, y0); g.addColorStop(0, `rgba(255,120,30,${.55 * beat})`); g.addColorStop(.6, `rgba(255,170,60,${.22 * beat})`); g.addColorStop(1, 'rgba(255,200,90,0)');
      ctx.fillStyle = g; ctx.fillRect(x, y0, w, gh);
      ctx.globalCompositeOperation = 'source-over';
      // frame: dark smouldering rope with a gold edge
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(60,24,6,.9)'; ctx.beginPath(); ctx.roundRect(x, y, w, h, 10); ctx.stroke();
      ctx.lineWidth = 4; ctx.strokeStyle = `rgba(255,200,90,${.6 + .4 * beat})`; ctx.shadowColor = '#ff8a00'; ctx.shadowBlur = 34 * beat; ctx.stroke(); ctx.stroke(); ctx.shadowBlur = 0;
      // two fuse sparks racing round the frame in opposite directions, each with a burning trail
      const speed = P * .9, head = (t - r.t0) * speed;
      for (const dir of [1, -1]) {
        const h0 = dir > 0 ? head : P / 2 - head;
        for (let q = 0; q < 40; q++) {
          const [px, py] = pt(h0 - dir * q * 9), f = 1 - q / 40;
          ctx.fillStyle = `rgba(255,${Math.round(130 + 110 * f)},${Math.round(30 + 140 * f)},${f})`;
          ctx.beginPath(); ctx.arc(px, py, 3 + 8 * f, 0, 7); ctx.fill();
        }
        const [hx, hy2] = pt(h0);
        ctx.globalCompositeOperation = 'lighter';
        const hg = ctx.createRadialGradient(hx, hy2, 0, hx, hy2, 48); hg.addColorStop(0, 'rgba(255,255,230,1)'); hg.addColorStop(.3, 'rgba(255,200,80,.85)'); hg.addColorStop(1, 'rgba(255,120,0,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(hx, hy2, 48, 0, 7); ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        if (Math.random() < .7) emit('spark', hx, hy2, 1, { angle: 0, spread: 7, speed: 200, drag: 7, gravity: 160, life: .4, size: 6, color: ['#fff6b0', '#ffb84a', '#ff6a1a'] });
      }
      ctx.restore();
      // steam rising from the bottom of the reel
      if (Math.random() < .35 * a) emit('spark', x + Math.random() * w, y0 + gh - 10, 1, { angle: -Math.PI / 2, spread: .4, speed: 70, drag: 1.2, gravity: -20, life: 1.5, size: 24, color: ['rgba(240,228,214,.22)', 'rgba(220,205,190,.18)'] });
    });
  }
  // trigger: the Scatter badge's railway track lays down its reel (fx_scatter_full); the sparks are the headlight
  function drawFuses(t) {
    G.fuses = G.fuses.filter(f => !f.gone);
    const img = A.get('fx_scatter_full');
    G.fuses.forEach(f => {
      const u = clamp((t - f.t0) / sec(FR.fuse[0]), 0, 1), a = f.fade ? clamp(1 - (t - f.fade) / .4, 0, 1) : 1;
      if (a <= 0) { f.gone = true; return; }
      const x = x0 + f.c * cw, reveal = ease.out(u);
      ctx.save(); ctx.globalAlpha = a; ctx.beginPath(); ctx.rect(x - 6, y0 - 10, cw + 12, (gh + 20) * reveal); ctx.clip();
      if (img) { const k = Math.min((cw + 8) / img.width, (gh + 16) / img.height), w = img.width * k, h = img.height * k; ctx.drawImage(img, x + cw / 2 - w / 2, y0 + gh / 2 - h / 2, w, h); }
      else { ctx.fillStyle = '#b0181f'; ctx.fillRect(x, y0, cw, gh); }
      ctx.restore();
      // the Scatter tiles stay on top of their track, wherever they landed on the reel
      for (let r = 0; r < C.rows; r++) if (G.board[f.c][r] === SC) { const [cx, cy] = cellCenter(f.c, r); drawCell(f.c, r, SC, cx, cy, t); }
      // burning fuse tip
      if (u < 1) { const yy = y0 + gh * reveal; emit('spark', x + cw / 2, yy, 2, { angle: Math.PI / 2, spread: 3, speed: 200, drag: 6, gravity: 150, life: .35, size: 8, color: ['#fff6c8', '#ffb000'] }); }
    });
  }
  // expanded special symbol: grows from its cells to fill the reel
  function drawExpanded(t) {
    const bigArt = A.real.sym_00_expanded ? A.get('sym_00_expanded') : null;   // optional full-reel art for symbol 0
    Object.entries(G.expanded).forEach(([c, e]) => {
      c = Number(c);
      const x = x0 + c * cw, u = e.t1 ? ease.out(clamp((t - e.t1) / sec(FR.expand[1]), 0, 1)) : 0;
      if (u >= 1) e.done = true;
      const top = lerp(e.y0, y0 - 4, u), bot = lerp(e.y1, y0 + gh + 4, u);
      ctx.save();
      ctx.beginPath(); ctx.roundRect(x + 3, top, cw - 6, bot - top, 14); ctx.clip();
      const anE = A.anim(e.sym);
      if (e.sym === 0 && bigArt && !anE) {
        // symbol 0 has its own full-reel art (sym_00_expanded), drawn over a panel in CONFIG.texts.expandedPanel colours
        const pc = (C.texts && C.texts.expandedPanel) || ['#7fd0ff', '#bfe9ff', '#ffffff'];
        const g = ctx.createLinearGradient(0, y0, 0, y0 + gh); g.addColorStop(0, pc[0]); g.addColorStop(.7, pc[1]); g.addColorStop(1, pc[2]);
        ctx.fillStyle = g; ctx.fillRect(x, y0 - 6, cw, gh + 12);
        const k = Math.min((cw - 14) / bigArt.width, (gh - 6) / bigArt.height), w = bigArt.width * k, h = bigArt.height * k;
        ctx.drawImage(bigArt, x + cw / 2 - w / 2, y0 + gh - h + 2, w, h);
      } else {
        const g = ctx.createLinearGradient(0, y0, 0, y0 + gh); g.addColorStop(0, 'rgba(50,28,14,.94)'); g.addColorStop(1, 'rgba(28,15,8,.94)');   // dark timber, like the reel panels
        ctx.fillStyle = g; ctx.fillRect(x, y0 - 6, cw, gh + 12);
        // once the expanded reels pay, every tile plays the symbol's win animation (or the shared shine), like a normal win
        for (let r = 0; r < C.rows; r++) {
          const [cx, cy] = cellCenter(c, r), fA = e.tA ? (t - e.tA) * C.fps * G.speed : -1;
          if (fA >= 0 && anE) drawAnimFrame(e.sym, anE, fA * anE.fps / C.fps, cx, cy, 1);
          else { drawSym(e.sym, cx, cy, { scale: .96 }); if (fA >= 0) shineFx(fA, cx, cy, .96); }
        }
      }
      ctx.restore();
      // gold frame with a pulse
      const pulse = .6 + .4 * Math.sin(t * 5);
      ctx.save(); ctx.strokeStyle = '#ffd34a'; ctx.lineWidth = 7; ctx.shadowColor = '#ffb000'; ctx.shadowBlur = 18 + 14 * pulse;
      ctx.beginPath(); ctx.roundRect(x + 3, top, cw - 6, bot - top, 14); ctx.stroke(); ctx.restore();
    });
  }
  // paylines: coloured paths with a number tag at both ends
  const LINE_COLORS = ['#ffd84a', '#ff5a5a', '#4ad0ff', '#7be35a', '#ff8a3a', '#c47bff', '#ff6ad5', '#3affb4', '#ffffff', '#ffb43a'];
  function linePath(li) {
    const line = C.paylines[li]; ctx.beginPath();
    line.forEach((r, c) => { const [cx, cy] = cellCenter(c, r); if (!c) { ctx.moveTo(x0 - 16, cy); } ctx.lineTo(cx, cy); });
    const [, ey] = cellCenter(C.reels - 1, line[C.reels - 1]); ctx.lineTo(x0 + gw + 16, ey);
  }
  function drawLines(t) {
    const L2 = G.lines; if (!L2) return;
    if (!C.showPaylines) { if (L2.fade && t - L2.fade > .25) G.lines = null; return; }   // win lines are not drawn (Darshan, 2026-11-17)
    const a = L2.fade ? clamp(1 - (t - L2.fade) / .25, 0, 1) : clamp((t - L2.t0) / .15, 0, 1);
    if (a <= 0) { G.lines = null; return; }
    ctx.save(); ctx.globalAlpha = a; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    L2.lines.forEach(li => {
      const col = LINE_COLORS[li % LINE_COLORS.length];
      linePath(li); ctx.strokeStyle = 'rgba(40,5,0,.65)'; ctx.lineWidth = 15; ctx.stroke(); ctx.strokeStyle = col; ctx.lineWidth = 7; ctx.stroke();
      const line = C.paylines[li];
      [[x0 - 16, line[0]], [x0 + gw + 16, line[C.reels - 1]]].forEach(([lx, r]) => {
        const ly = y0 + r * ch + ch / 2; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(lx, ly, 17, 0, 7); ctx.fill(); ctx.strokeStyle = '#3b0505'; ctx.lineWidth = 3; ctx.stroke();
        uiText(String(li + 1), lx, ly + 1, 19, '#3b0505', 'center', 700);
      });
    });
    ctx.restore();
    G.labels.forEach(l => blockText(l.text, l.x, l.y, l.size || 44, { scale: .6 + .4 * ease.back(clamp((t - l.t0) / .25, 0, 1)), alpha: a }));
  }

  /* ------------------------------------------------------------ HUD (follows the mockup's bottom bar) */
  function drawHUD(t) {
    const fs = G.fs, inFS = fs.active || (G.modal && G.modal.kind === 'outro');
    // bar: dark glass over the scene
    const g = ctx.createLinearGradient(0, hy - 30, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.3, inFS ? 'rgba(10,9,24,.82)' : 'rgba(26,14,8,.82)'); g.addColorStop(1, inFS ? 'rgba(6,5,14,.95)' : 'rgba(14,8,4,.95)');
    ctx.fillStyle = g; ctx.fillRect(0, hy - 30, W, barH + 30);
    const ring = (b, fill = 'rgba(0,0,0,.6)') => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); };
    // settings, sound, info
    ring(btn.settings); ctx.save(); ctx.translate(btn.settings.x, btn.settings.y); ctx.fillStyle = '#fff'; ctx.scale(.8, .8);
    for (let i = 0; i < 8; i++) { ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -14, 6, 7); } ctx.beginPath(); ctx.arc(0, 0, 9, 0, 7); ctx.fill(); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, 4, 0, 7); ctx.fill(); ctx.restore();
    ring(btn.sound); ctx.save(); ctx.translate(btn.sound.x, btn.sound.y); ctx.fillStyle = '#fff'; ctx.scale(.8, .8);
    ctx.beginPath(); ctx.moveTo(-9, -5); ctx.lineTo(-3, -5); ctx.lineTo(5, -12); ctx.lineTo(5, 12); ctx.lineTo(-3, 5); ctx.lineTo(-9, 5); ctx.closePath(); ctx.fill();
    if (SND.muted) { ctx.strokeStyle = '#ff5a5a'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-12, -12); ctx.lineTo(12, 12); ctx.stroke(); } ctx.restore();
    ring(btn.info); uiText('i', btn.info.x, btn.info.y + 2, 40, '#fff', 'center', 700);
    // credit and bet (label gold, value white), left aligned
    const pair = (lab, v, y, col = '#fff') => { uiText(lab, 250, y, 26, '#f5b800', 'right', 800); uiText(v, 262, y, 30, col, 'left', 700); };
    pair('CREDIT', fmt(G.balance), hc - 18); pair('BET', fmt(bet()), hc + 20);
    if (G.notice && performance.now() - G.notice.t0 < 2600) uiText(G.notice.text, 262, hy - 14, 18, '#ffd45a', 'left', 600);
    // message (or the free spin counter) in the middle; the win next to it
    let msg = G.message || C.message;
    if (inFS && !G.message) msg = `FREE SPIN ${Math.min(fs.played, fs.awarded)} OF ${fs.awarded}`;
    uiText(msg, 820, hc + 2, 32, inFS ? '#ffd45a' : '#fff', 'center', 800);
    const wv = G.winFrom + (G.win - G.winFrom) * ease.out(clamp((t - G.winT0) / .6, 0, 1));
    if (G.win > 0 || inFS) { uiText('WIN', 1230, hc - 18, 24, '#f5b800', 'center', 800); uiText(fmt(G.win > 0 ? wv : 0), 1230, hc + 18, 34, '#ffd45a', 'center', 800); }
    // bet - / + (locked during a round)
    ctx.save(); ctx.globalAlpha = G.busy ? .4 : 1;
    for (const b of [btn.minus, btn.plus]) { ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.fillRect(btn.minus.x - 11, btn.minus.y - 3, 22, 6); ctx.fillRect(btn.plus.x - 11, btn.plus.y - 3, 22, 6); ctx.fillRect(btn.plus.x - 3, btn.plus.y - 11, 6, 22);
    ctx.restore();
    // spin and autoplay
    const b = btn.spin;
    ctx.save(); ctx.fillStyle = G.busy && !G.spinning ? '#333' : '#000'; ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.fill(); ctx.lineWidth = 7; ctx.strokeStyle = '#fff'; ctx.stroke();
    if (G.spinning) { ctx.translate(b.x, b.y); ctx.rotate(t * 8); ctx.strokeStyle = '#ffd45a'; ctx.lineWidth = 7; ctx.beginPath(); ctx.arc(0, 0, b.r - 14, 0, 1.6); ctx.stroke(); ctx.beginPath(); ctx.arc(0, 0, b.r - 14, Math.PI, Math.PI + 1.6); ctx.stroke(); }
    ctx.restore();
    ctx.save(); ctx.font = `44px ${BLOCK}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = G.busy && !G.spinning ? '#999' : '#fff'; ctx.fillText(G.busy && !G.spinning ? 'SKIP' : 'SPIN', b.x, b.y + 2); ctx.restore();
    const ab = btn.auto;
    ctx.save(); ctx.fillStyle = G.autoplay ? '#ffd45a' : '#000'; ctx.beginPath(); ctx.roundRect(ab.x - 64, ab.y - 15, 128, 30, 15); ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore();
    uiText('AUTOPLAY', ab.x, ab.y + 1, 19, G.autoplay ? '#000' : '#fff', 'center', 700);
    // free spins: the special symbol card, bottom left over the clouds
    const panel = (b, top, bottom, armed) => {
      ctx.save(); const gg = ctx.createLinearGradient(0, b.y, 0, b.y + b.h); gg.addColorStop(0, top); gg.addColorStop(1, bottom);
      ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      ctx.fillStyle = gg; ctx.beginPath(); ctx.roundRect(b.x, b.y, b.w, b.h, 16); ctx.fill(); ctx.shadowColor = 'transparent';
      ctx.lineWidth = 5; ctx.strokeStyle = armed ? '#fff3a0' : '#ffd34a'; ctx.stroke();
      ctx.lineWidth = 2; ctx.strokeStyle = 'rgba(255,220,140,.45)'; ctx.beginPath(); ctx.roundRect(b.x + 8, b.y + 8, b.w - 16, b.h - 16, 10); ctx.stroke(); ctx.restore();
    };
    if (inFS && fs.special != null) {
      // free spins: the chosen expanding symbol on Darshan's wooden plank, right side above the Outlaw
      const pl = A.get('ui_buy_decor_wood_plank'), b = C.specialBoard, ph = b.w * pl.height / pl.width;
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 18; ctx.shadowOffsetY = 6;
      ctx.drawImage(pl, b.x - b.w / 2, b.y - ph / 2, b.w, ph); ctx.restore();
      uiText('EXPANDING SYMBOL', b.x, b.y - ph / 2 - 2, 22, '#ffe9a8', 'center', 900);
      const img = A.symbol(fs.special), k = Math.min(b.w * .62 / img.width, ph * .78 / img.height);
      ctx.drawImage(img, b.x - img.width * k / 2 + b.w * .02, b.y - img.height * k / 2, img.width * k, img.height * k);
    } else if (C.buy && C.buy.enabled) drawBuyMain(t);
  }

  /* ------------------------------------------------------------ Buy Feature UI (2026-11-21)
     Darshan's simplified pack: one PNG per control, interaction by scale only (normal 1.00, hover 1.03, pressed 0.98,
     release 1.00; 120 ms, cubic-bezier(0.2, 0.8, 0.2, 1)). Every control has a fixed box computed once; the image is
     scaled inside it around its centre, so nothing else moves. The board hangs on chains repeated up to the top. */
  const BU = C.buyUI || {};
  const BW = {                                   // widget -> image name
    main: 'buy_free_spins_button', close: 'close_button',
    free_spins: 'option_free_spins', super_free_spins: 'option_super_free_spins', feature_max: 'option_feature_max'
  };
  const BUY = { open: false, closing: false, t0: 0, st: {}, sc: {}, press: null, hover: null, ptr: 'mouse', lock: false, focus: 'main', kbd: false };
  Object.keys(BW).forEach(k => { BUY.st[k] = 'normal'; BUY.sc[k] = { from: 1, to: 1, t0: 0 }; });
  const buyImg = k => A.get('ui_buy_' + BW[k]);
  const buyReady = () => !!A.real['ui_buy_buy_free_spins_button'] && !!A.real['ui_buy_popup_board_with_title'];
  const buyOption = id => engine.buyOpt(id);
  // cubic-bezier(0.2, 0.8, 0.2, 1): solved for y at a given x
  const bez = (x1, y1, x2, y2) => u => { let t = u; for (let i = 0; i < 6; i++) { const x = 3 * (1 - t) * (1 - t) * t * x1 + 3 * (1 - t) * t * t * x2 + t * t * t - u, dx = 3 * (1 - t) * (1 - t) * x1 + 6 * (1 - t) * t * (x2 - x1) + 3 * t * t * (1 - x2); if (Math.abs(dx) < 1e-6) break; t = clamp(t - x / dx, 0, 1); } return 3 * (1 - t) * (1 - t) * t * y1 + 3 * (1 - t) * t * t * y2 + t * t * t; };
  const btnEase = bez(.2, .8, .2, 1);
  function buyScaleNow(k) { const s = BUY.sc[k], u = clamp((now() - s.t0) / (BU.ease || .12), 0, 1); return s.from + (s.to - s.from) * btnEase(u); }
  const buySP = k => (k === 'close' ? BU.closeScale : BU.scale) || { hover: 1.04, press: .97, release: 1.02, hold: 80 };
  function setBuyState(k, st) {
    if (BUY.st[k] === st) return;
    const sp = buySP(k);
    BUY.st[k] = st; const to = st === 'hover' ? sp.hover : st === 'pressed' ? sp.press : st === 'release' ? sp.release : 1;
    BUY.sc[k] = { from: buyScaleNow(k), to, t0: now() };
  }
  let buyBoxes = null;
  function buyLayout() {                         // fixed boxes, computed once
    if (buyBoxes) return buyBoxes;
    const box = (img, cx, cy, w) => { const h = w * img.height / img.width; return { x: cx - w / 2, y: cy - h / 2, w, h }; };
    const mi = buyImg('main'), mw = BU.mainW || buyBtn.w, b = {};
    b.main = { x: buyBtn.x + (buyBtn.w - mw) / 2, y: buyBtn.y, w: mw, h: mw * mi.height / mi.width };
    const bd = A.get('ui_buy_popup_board_with_title'), fw = BU.boardW, k = fw / bd.width, fh = bd.height * k, fx = W / 2 - fw / 2, fy = 0;
    b.frame = { x: fx, y: fy, w: fw, h: fh, k };                  // top at the stage top: the chains reach the top edge
    b.close = box(buyImg('close'), fx + fw * BU.close.x, fy + fh * BU.close.y, fw * BU.close.w);
    // the three cards share one scale (same height) and equal gaps
    const ids = ['free_spins', 'super_free_spins', 'feature_max'], ch = fh * BU.cards.h;
    const ws = ids.map(id => { const im = buyImg(id); return ch * im.width / im.height; });
    const gap = fw * BU.cards.gap, tot = ws.reduce((a, v) => a + v, 0) + gap * 2;
    let x = W / 2 - tot / 2;
    ids.forEach((id, i) => { b[id] = { x, y: fy + fh * BU.cards.y - ch / 2, w: ws[i], h: ch }; x += ws[i] + gap; });
    return (buyBoxes = b);
  }
  const buyInside = (b, x, y) => b && x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h;
  const mainEnabled = () => C.buy && C.buy.enabled && !G.busy && !G.fs.active && !G.info && !BUY.lock && buyReady();
  function buyWidgetAt(x, y) {
    const L = buyLayout();
    if (BUY.open && !BUY.closing) { for (const k of ['close', 'free_spins', 'super_free_spins', 'feature_max']) if (buyInside(L[k], x, y)) return k; return 'backdrop'; }
    if (!BUY.open && mainEnabled() && buyInside(L.main, x, y)) return 'main';
    return null;
  }
  function drawBuyWidget(k, alpha = 1) {
    const b = buyLayout()[k];
    let sc = buyScaleNow(k);
    if (BUY.kbd && BUY.focus === k && BUY.st[k] === 'normal') sc = buySP(k).hover;     // keyboard focus = hover scale
    ctx.save(); ctx.globalAlpha *= alpha; ctx.translate(b.x + b.w / 2, b.y + b.h / 2); ctx.scale(sc, sc);
    ctx.drawImage(buyImg(k), -b.w / 2, -b.h / 2, b.w, b.h); ctx.restore();
  }
  function drawBuyMain() {
    if (!buyReady()) return;
    const on = mainEnabled() || BUY.open;
    drawBuyWidget('main', on ? 1 : .5);
  }
  function drawBuyPopup() {
    if (!BUY.open || !buyReady()) return;
    const t = now(), L = buyLayout(), dt0 = t - BUY.t0;
    let p = clamp(dt0 / (BUY.closing ? BU.fadeOut : BU.fadeIn), 0, 1), po = clamp(dt0 / (BU.overlayIn || .12), 0, 1);
    if (BUY.closing) { if (p >= 1 && po >= 1) { BUY.open = false; BUY.closing = false; BUY.focus = 'main'; return; } p = 1 - p; po = 1 - po; }
    dimmer((BU.dim || .6) * po);                                                 // 60% black overlay, game stays visible
    ctx.save(); ctx.globalAlpha = p;
    const f = L.frame, s = .98 + .02 * p, pcy = f.y + f.h * .6;                   // one piece, scaled about the board
    ctx.translate(W / 2, pcy); ctx.scale(s, s); ctx.translate(-W / 2, -pcy);
    ctx.drawImage(A.get('ui_buy_popup_board_with_title'), f.x, f.y - (1 - s) * pcy / s, f.w, f.h);  // chain ends stay at the top
    ['free_spins', 'super_free_spins', 'feature_max', 'close'].forEach(k => drawBuyWidget(k));
    ctx.restore();
  }
  function openBuy() {
    if (BUY.open || !mainEnabled()) return;
    BUY.open = true; BUY.closing = false; BUY.t0 = now(); BUY.focus = 'free_spins';
    ['close', 'free_spins', 'super_free_spins', 'feature_max'].forEach(k => setBuyState(k, 'normal'));
    SND.play('sfx_spin_button_click');
  }
  function closeBuy() {
    if (!BUY.open || BUY.closing) return;
    BUY.closing = true; BUY.t0 = now();
    ['close', 'free_spins', 'super_free_spins', 'feature_max'].forEach(k => setBuyState(k, 'normal'));
    setBuyState('main', BUY.hover === 'main' ? 'hover' : 'normal'); BUY.focus = 'main';   // focus goes back to the main button
  }
  async function buyChoose(id) {
    if (BUY.lock) return;                                   // one purchase at a time: no double buy from rapid clicks
    const o = buyOption(id);
    ensureBuyFunds(o.price * bet());
    BUY.lock = true; closeBuy();
    try { await wait(BU.fadeOut); await play({ buy: id, direct: true }); } finally { BUY.lock = false; }
  }
  function buyAction(k) {
    if (k === 'main') openBuy();
    else if (k === 'close') closeBuy();
    else buyChoose(k);
  }
  // pointer handling: returns true when the Buy UI took the event
  function buyDown(x, y, e) {
    const k = buyWidgetAt(x, y); if (!k) return false;
    BUY.kbd = false; BUY.ptr = e.pointerType || 'mouse';
    if (k === 'backdrop') {                                  // outside the wooden board: close, back to the base game
      if (!buyInside(buyLayout().frame, x, y) && !BUY.lock) closeBuy();
      return true;
    }
    if (BUY.st[k] === 'release' || BUY.lock) return true;
    BUY.press = k; setBuyState(k, 'pressed');
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
    return true;
  }
  function buyUp(x, y) {
    const k = BUY.press; if (!k) return BUY.open;
    BUY.press = null;
    const over = buyInside(buyLayout()[k], x, y);
    if (!over) { setBuyState(k, 'normal'); return true; }
    setBuyState(k, 'release');
    setTimeout(() => {
      // after release (scale back to 1.00): hover if the cursor is still over it (mouse), otherwise normal; then the action
      setBuyState(k, BUY.ptr === 'mouse' && BUY.hover === k ? 'hover' : 'normal');
      buyAction(k);
    }, buySP(k).hold);
    return true;
  }
  function buyMove(x, y, e) {
    const k = e.pointerType === 'touch' ? null : buyWidgetAt(x, y);
    const h = k && k !== 'backdrop' ? k : null;
    if (h !== BUY.hover) {
      if (BUY.hover && BUY.st[BUY.hover] === 'hover') setBuyState(BUY.hover, 'normal');
      BUY.hover = h;
      if (h && BUY.st[h] === 'normal' && !BUY.press) setBuyState(h, 'hover');
    }
    if (BUY.press && BUY.press !== h && BUY.st[BUY.press] === 'pressed') { /* keep pressed until release, like a real button */ }
    cv.style.cursor = h ? 'pointer' : '';
  }
  function buyKey(e) {
    if (!buyReady()) return false;
    if (BUY.open) {
      const order = ['free_spins', 'super_free_spins', 'feature_max', 'close'];
      if (e.code === 'Escape') { closeBuy(); return true; }
      if (e.code === 'Tab' || e.code === 'ArrowRight' || e.code === 'ArrowLeft') {
        const d = e.code === 'ArrowLeft' || (e.code === 'Tab' && e.shiftKey) ? -1 : 1, i = order.indexOf(BUY.focus);
        BUY.focus = order[(i + d + order.length) % order.length]; BUY.kbd = true; return true;
      }
      if (e.code === 'Enter' || e.code === 'Space') { keyPress(BUY.focus); return true; }
      return true;                                           // the popup is modal: keys don't reach the game
    }
    if (e.code === 'Enter' && BUY.focus === 'main' && mainEnabled()) { BUY.kbd = true; keyPress('main'); return true; }
    return false;
  }
  function keyPress(k) {
    if (BUY.st[k] === 'release' || BUY.lock) return;
    setBuyState(k, 'pressed');
    setTimeout(() => { setBuyState(k, 'release'); setTimeout(() => { setBuyState(k, 'normal'); buyAction(k); }, buySP(k).hold); }, 90);
  }

  /* ------------------------------------------------------------ banners & modals */
  function dimmer(a) { if (a > 0) { ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  function rays(cx, cy, t, col, alpha, n = 16, R = 900) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(cx, cy); ctx.rotate(t * .5);
    for (let i = 0; i < n; i++) { ctx.rotate(Math.PI * 2 / n); const g = ctx.createLinearGradient(0, 0, 0, -R); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(-R * .08, -R); ctx.lineTo(R * .08, -R); ctx.closePath(); ctx.fill(); }
    ctx.restore();
  }
  function ribbon(cx, cy, w, h, cols) {
    ctx.save();
    const g = ctx.createLinearGradient(0, cy - h / 2, 0, cy + h / 2); g.addColorStop(0, cols[0]); g.addColorStop(.5, cols[1]); g.addColorStop(1, cols[2]);
    ctx.fillStyle = cols[2]; [-1, 1].forEach(s => { ctx.beginPath(); ctx.moveTo(cx + s * w * .42, cy - h * .2); ctx.lineTo(cx + s * w * .62, cy - h * .2); ctx.lineTo(cx + s * w * .55, cy + h * .15); ctx.lineTo(cx + s * w * .62, cy + h * .5); ctx.lineTo(cx + s * w * .42, cy + h * .5); ctx.closePath(); ctx.fill(); });
    ctx.shadowColor = 'rgba(0,0,0,.5)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8;
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(cx - w / 2, cy - h / 2); ctx.quadraticCurveTo(cx, cy - h * .8, cx + w / 2, cy - h / 2); ctx.lineTo(cx + w / 2, cy + h / 2); ctx.quadraticCurveTo(cx, cy + h * .2, cx - w / 2, cy + h / 2); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0; ctx.strokeStyle = '#ffd34a'; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  }
  function tierFx(fx, dt) {
    const p = n => Math.random() < n * dt;
    if (fx === 'fountain' || fx === 'cascade' || fx === 'fireworks') { if (p(fx === 'fountain' ? 18 : 30)) emit('coin', W / 2 + (Math.random() - .5) * 200, H + 20, 1, { spread: .7, speed: 1500, gravity: 1500, life: 2.2, size: 24 }); }
    if (fx === 'cascade') { if (p(30)) { emit('coin', W * .2, H + 20, 1, { angle: -Math.PI / 2 + .25, spread: .4, speed: 1500, gravity: 1500, life: 2.2, size: 24 }); emit('coin', W * .8, H + 20, 1, { angle: -Math.PI / 2 - .25, spread: .4, speed: 1500, gravity: 1500, life: 2.2, size: 24 }); } }
    if (fx === 'drop' || fx === 'epic' || fx === 'lasers') { if (p(fx === 'drop' ? 22 : 40)) emit('coin', Math.random() * W, -40, 1, { angle: Math.PI / 2, spread: .3, speed: 200, gravity: 900, life: 2.5, size: 24 }); }
    if (fx === 'fireworks' || fx === 'epic' || fx === 'lasers') { if (p(fx === 'epic' ? 3 : 1.8)) emit('rocket', W * (.15 + Math.random() * .7), H, 1, { spread: .25, speed: 1100, gravity: 600, life: .9 + Math.random() * .4, burst: ['#ff5a5a', '#ffd34a', '#ff9a3a', '#ffffff'][Math.floor(Math.random() * 4)] }); }
    // (the firecrackers thrown here in New Year Crackers are gone: gold coins only)
  }
  // progressive big win (2026-11-21): the tally counts up from 0 and the banner climbs tier by tier (NICE -> BIG ->
  // MEGA ...) as the amount passes each threshold, each step with its own pop, sound and effects; then a hold on the
  // final tier and out. Skip jumps straight to the final tier and amount.
  function drawBanner(t, dt) {
    const b = G.banner; if (!b) return;
    const f = (t - b.t0) * C.fps * G.speed, [fi, fl, fo] = FR.banner, step = FR.bannerStep;
    const n = b.tier + 1, countEnd = fi + n * step, holdEnd = countEnd + fl, total = holdEnd + fo;
    if (G.skip !== b.tok) { b.tok = G.skip; if (f < countEnd) b.t0 = t - sec(countEnd); }
    // which tier the count has reached, and the amount shown
    const cu = clamp((f - fi * .5) / (n * step), 0, 1) * n, k = Math.min(b.tier, Math.floor(cu)), su = cu - k;
    const lo = k === 0 ? 0 : C.winTiers[k].min * bet(), hi = k === b.tier ? b.amount : C.winTiers[k + 1].min * bet();
    const shown = cu >= n ? b.amount : lo + (hi - lo) * (k === b.tier ? ease.out(su) : su);
    if (b.k !== k) { b.k = k; b.kT = f; SND.play('banner_hit'); }
    const tier = C.winTiers[k], fk = f - b.kT;
    let dim = .75, scale, alpha = 1, dy = 0;
    if (f < fi) dim = .75 * f / fi;
    if (f < holdEnd) {                         // pop on every new tier, then a gentle pulse
      const u = clamp(fk / 22, 0, 1);
      scale = (k === 0 && f < fi ? ease.out(f / fi) : 1) * (u < 1 ? (u < .5 ? 1 + .35 * ease.out(u / .5) : 1.35 - .35 * ease.inOut((u - .5) / .5)) : 1 + .03 * Math.sin((fk - 22) / 30 * Math.PI * 2));
    } else { const u = clamp((f - holdEnd) / fo, 0, 1); dim = .75 * (1 - u); scale = 1 + .3 * u; alpha = 1 - u; dy = -120 * u; }
    if (cu < n && t - (b.tick || 0) > .07) { b.tick = t; SND.play('sfx_countup_loop'); }
    if (cu >= n && !b.ended) { b.ended = true; SND.play('sfx_countup_end'); setWin(G.spinBaseWin + b.amount, true); }
    dimmer(dim);
    if (f < holdEnd) tierFx(tier.fx, dt);
    if (fk < 6 && k > 0 && !b['burst' + k]) { b['burst' + k] = true; emit('spark', W / 2, H * .36, 60 + 20 * k, { spread: Math.PI * 2, speed: 900, drag: 2.5, gravity: 300, life: .9, size: 12, color: ['#fff6c8', '#ffd34a', '#ff8a2a'] }); }
    ctx.save(); ctx.globalAlpha = alpha;
    rays(W / 2, H * .42, t, 'rgba(255,200,90,.35)', alpha * .8, tier.fx === 'lasers' || tier.fx === 'epic' ? 24 : 16);
    const img = A.real['banner_win_' + tier.id] && A.get('banner_win_' + tier.id);
    const kk = img ? Math.min(W * .5 / img.width, H * .6 / img.height) : 1, ih = img ? img.height * kk : 190, cy = img ? H * .36 : H * .4;
    ctx.translate(W / 2, cy + dy); ctx.scale(scale, scale);
    if (img) ctx.drawImage(img, -img.width * kk / 2, -ih / 2, img.width * kk, ih);
    else { ribbon(0, 0, 1100, 190, ['#e8402a', '#b0101a', '#6a0a0a']); blockText(tier.label, 0, -6, 110, { colors: ['#ffffff', tier.colors[0], tier.colors[1]], maxW: 1000 }); }
    ctx.restore();
    blockText(fmt(shown), W / 2, (img ? cy + ih / 2 + 78 : H * .64) + dy, img ? 130 : 150, { alpha, scale: f < fi ? ease.out(f / fi) : 1, maxW: W * .8 });
    if (f >= total) { const r = b.resolve; G.banner = null; r(); }
  }
  function panel(w, h) {
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40; const g = ctx.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, '#c8202a'); g.addColorStop(1, '#5a060c');
    ctx.fillStyle = g; ctx.beginPath(); ctx.roundRect(-w / 2, -h / 2, w, h, 36); ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 9; ctx.strokeStyle = '#ffd34a'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(255,220,120,.7)'; ctx.beginPath(); ctx.roundRect(-w / 2 + 22, -h / 2 + 22, w - 44, h - 44, 24); ctx.stroke();
    // corner knots
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { ctx.save(); ctx.translate(sx * (w / 2 - 22), sy * (h / 2 - 22)); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#ffd34a'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#a8101a'; ctx.fillRect(-6, -6, 12, 12); ctx.restore(); });
  }
  // free spins intro (pulse + rays, START), special symbol pick, retrigger, summary (COLLECT)
  function drawModal(t, dt) {
    const m = G.modal; if (!m) return;
    const [fi, fl0, fo] = FR.banner, fl = m.kind === 'pick' ? FR.pick[0] + FR.pick[1] : fl0;
    let f = (t - m.t0) * C.fps * G.speed;
    if (f >= fi + fl && !m.release) { if (C.autoContinueModals || G.autoplay) m.release = true; else { m.t0 = t - sec(fi + fl - 1); f = fi + fl - 1; } }
    if (G.skip !== m.tok) { m.tok = G.skip; if (m.kind !== 'pick' && f > fi * .5 && f < fi + fl) { m.release = true; m.t0 = t - sec(fi + fl); f = fi + fl; } }
    const pop = m.kind !== 'outro';
    let scale = 1, alpha = 1, dy = 0, dim = .7;
    if (f < fi) { const u = f / fi; dim = .7 * u; if (pop) scale = ease.elastic(u); else dy = -H * (1 - ease.out(u)); }
    else if (f < fi + fl) scale = pop ? 1 + .03 * (.5 - .5 * Math.cos((f - fi) / 30 * Math.PI * 2)) : 1;
    else { const u = clamp((f - fi - fl) / fo, 0, 1); dim = .7 * (1 - u); alpha = 1 - u; scale = pop ? 1 + .15 * u : 1 - .2 * u; }
    dimmer(dim);
    ctx.save(); ctx.globalAlpha = alpha;
    if (pop) { rays(W / 2, H * .45, t, 'rgba(255,200,90,.45)', alpha); if (f > fi && f < fi + fl && Math.random() < .5) emit('spark', W / 2 + (Math.random() - .5) * 900, H * .45 + (Math.random() - .5) * 400, 1, { angle: 0, spread: 6, speed: 60, gravity: 0, life: .7, size: 8, color: ['#fff6c8', '#ffd34a'] }); }
    ctx.translate(W / 2, H * .45 + dy); ctx.scale(scale, scale);
    const pw = 1000, ph = m.kind === 'pick' ? 640 : 560;
    panel(pw, ph);
    const lamp = A.real.fx_lantern ? A.get('fx_lantern') : null;
    if (lamp && m.kind !== 'pick') [-1, 1].forEach(s => { const lw = 120, lh = lamp.height * lw / lamp.width; ctx.save(); ctx.translate(s * (pw / 2 - 10), -ph / 2 - 40); ctx.rotate(Math.sin(t * 2 + s) * .08); ctx.drawImage(lamp, -lw / 2, 0, lw, lh); ctx.restore(); });
    if (m.kind === 'intro') {
      blockText('CONGRATULATIONS!', 0, -170, 70, { maxW: 820 });
      blockText(m.text1, 0, -50, 60, { colors: ['#ffffff', '#fff0c8'], maxW: 860 });
      blockText(m.text2, 0, 70, 120, { maxW: 860 });
    } else if (m.kind === 'pick') {
      // the special symbol: symbols cycle fast, slow down and stop on the pick
      blockText('SPECIAL EXPANDING SYMBOL', 0, -250, 52, { maxW: 860 });
      const fp = clamp(f - fi, 0, FR.pick[0]), u = fp / FR.pick[0], n = C.regular.length;
      const steps = 3 * n + ((m.special - m.start + n) % n), idx = (m.start + Math.floor(steps * (1 - Math.pow(1 - u, 2.2)) + (u >= 1 ? 0 : 0))) % n;
      const shown = u >= 1 ? m.special : idx;
      if (shown !== m.last) { m.last = shown; SND.play(u >= 1 ? 'sfx_pick_stop' : 'sfx_pick_tick'); if (u >= 1) for (let i = 0; i < 30; i++) emit('spark', W / 2, H * .45, 1, { angle: 0, spread: 7, drag: 3.5, speed: 600, gravity: 300, life: .9, size: 10, color: ['#fff6c8', '#ffd34a', '#ff5a3a'] }); }
      ctx.save(); ctx.fillStyle = 'rgba(40,0,0,.55)'; ctx.beginPath(); ctx.roundRect(-210, -195, 420, 340, 24); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = u >= 1 ? '#fff3a0' : '#ffd34a'; if (u >= 1) { ctx.shadowColor = '#ffd34a'; ctx.shadowBlur = 30; } ctx.stroke(); ctx.restore();
      const img = A.symbol(shown), k = Math.min(380 / img.width, 300 / img.height) * (u >= 1 ? 1 + .06 * Math.sin(t * 6) : 1);
      ctx.drawImage(img, -img.width * k / 2, -25 - img.height * k / 2, img.width * k, img.height * k);
      blockText(u >= 1 ? C.symbolNames[shown].toUpperCase() : ' ', 0, 200, 54, { colors: ['#ffffff', '#ffe9a8'], maxW: 860 });
      blockText(u >= 1 ? 'EXPANDS TO FILL ITS REELS AND PAYS ON ALL LINES' : ' ', 0, 262, 28, { colors: ['#ffffff', '#ffe9a8'], maxW: 880 });
    } else if (m.kind === 'retrigger') {
      blockText((C.texts && C.texts.retrigger) || 'MORE FREE SPINS!', 0, -110, 64, { maxW: 860 });
      blockText(m.text2, 0, 30, 120, { maxW: 860 });
    } else {
      const tu = clamp((f - fi) / FR.summaryTally, 0, 1), shown = (m.amount || 0) * ease.out(tu);
      if (tu > 0 && tu < 1 && t - (m.tick || 0) > .07) { m.tick = t; SND.play('sfx_countup_loop'); }
      if (tu >= 1 && !m.ended) { m.ended = true; SND.play('sfx_countup_end'); }
      blockText('CONGRATULATIONS!', 0, -170, 70, { maxW: 820 });
      blockText('YOU HAVE WON', 0, -70, 54, { colors: ['#ffffff', '#fff0c8'] });
      blockText(fmt(shown), 0, 40, 120, { maxW: 860 });
      blockText(m.capped ? `MAX WIN ${C.maxWin}× REACHED` : `IN ${m.spins} FREE SPINS`, 0, 140, 46, { colors: ['#ffffff', '#fff0c8'], maxW: 860 });
    }
    if (m.kind !== 'pick') {
      const bl = m.kind === 'outro' ? 'COLLECT' : m.kind === 'retrigger' ? 'CONTINUE' : 'START', pulse = 1 + .04 * Math.sin(t * 6), by = ph / 2 + 20;
      ctx.save(); ctx.translate(0, by); ctx.scale(pulse, pulse); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.roundRect(-160, -40, 320, 80, 40); ctx.fill(); ctx.lineWidth = 6; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore();
      ctx.save(); ctx.font = `48px ${BLOCK}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.fillText(bl, 0, by + 2); ctx.restore();
    }
    ctx.restore();
    if (f >= fi + fl && !m.outroCalled) { m.outroCalled = true; if (m.onOutro) m.onOutro(); }
    if (f >= fi + fl + fo) { const r = m.resolve; G.modal = null; r(); }
  }
  // to free spins: a wall of locomotive steam; back to base: zoom out
  function drawTransition(t) {
    const tr = G.trans; if (!tr) return;
    const f = (t - tr.t0) * C.fps * G.speed;
    if (tr.kind === 'toFree') {
      // gunfight (re-uses the Outlaw mascot art, no extra asset): an Outlaw slides in on each side, they fire at each
      // other, the bullets meet in a spark burst, gunsmoke fills the scene, FREE SPINS stamps in, the smoke clears slowly
      const [a, b, c] = FR.transToFree, outU = clamp((f - a - b) / c, 0, 1);
      const img = A.get('char_mascot'), FIRE = [15, 15], MEET = 22;
      const sz = mascotSize() || [639, 1200], k = H * 1.55 / sz[1];
      // muzzle in the mascot's own pixels (puppet: its rest pose), so the guns line up with the flashes
      const tip0 = puppetOn() ? (() => { const r0 = rigCanvas('duel', k, 0, { gust: 1 }); return r0.rig.point('tip', 0, { gust: 1 }); })() : [525, 187], tipX = tip0[0], tipY = tip0[1];
      const tip = side => [side ? W * .70 : W * .30, H * .40];
      if (!tr.puffs) {
        let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
        tr.puffs = [];
        // gunsmoke from each muzzle (rolling toward the middle) and from the bullet collision
        for (const side of [0, 1]) for (let i = 0; i < 26; i++) { const [mx, my] = tip(side); tr.puffs.push({ f0: FIRE[side] + rnd() * 14, x: mx, y: my, dx: (side ? -1 : 1) * (80 + rnd() * 520), dy: (rnd() - .5) * 360, r: 130 + rnd() * 200, d: rnd(), sh: .78 + rnd() * .22 }); }
        for (let i = 0; i < 40; i++) { const q = rnd() * 7, dd = 150 + rnd() * 750; tr.puffs.push({ f0: MEET + rnd() * 14, x: W / 2, y: H * .40, dx: Math.cos(q) * dd, dy: Math.sin(q) * dd * .7, r: 160 + rnd() * 240, d: rnd(), sh: .8 + rnd() * .2 }); }
      }
      if (f >= a && !tr.swapped) { tr.swapped = true; tr.onCovered && tr.onCovered(); }
      // dusk dims the scene as the duel starts
      const dimA = clamp(f / 10, 0, 1) * (1 - outU);
      if (dimA > 0) { ctx.save(); ctx.globalAlpha = dimA * .6; ctx.fillStyle = '#120804'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      // the two Outlaws slide in, recoil when they fire, and vanish into the smoke
      const showA = clamp((a + 4 - f) / 8, 0, 1);
      if (img && showA > 0) for (const side of [0, 1]) {
        const slide = 1 - ease.out(clamp(f / 12, 0, 1)), rec = f >= FIRE[side] ? Math.exp(-(f - FIRE[side]) / 4) : 0;
        const [mx, my] = tip(side), dir = side ? -1 : 1;
        // the rigged Outlaw (src/rig.js): his arm really kicks up when he fires
        const tt = Math.floor(f) / C.fps, rg = rigCanvas('duel', k, tt, { fire: f >= FIRE[side] ? (f - FIRE[side]) / C.fps : null, gust: 1 });
        ctx.save(); ctx.globalAlpha = showA; ctx.translate(mx - dir * slide * 600, my); ctx.scale(dir, 1);
        if (rg) ctx.drawImage(rg.cv, -tipX * k, -tipY * k); else { ctx.scale(k, k); ctx.drawImage(img, -tipX, -tipY); }
        ctx.restore();
      }
      // muzzle flashes and bullet tracers
      for (const side of [0, 1]) {
        const df = f - FIRE[side], [mx, my] = tip(side), dir = side ? -1 : 1;
        if (df >= 0 && df < 5) { const r = 150 * (1 - df / 5) + 40; ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createRadialGradient(mx, my, 0, mx, my, r); g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(.3, 'rgba(255,200,90,.9)'); g.addColorStop(1, 'rgba(255,120,30,0)');
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(mx, my, r, 0, 7); ctx.fill(); ctx.restore();
          if (df < 1) { SND.play('sfx_cracker_pop'); emit('spark', mx, my, 18, { angle: dir > 0 ? 0 : Math.PI, spread: 1.2, speed: 600, drag: 6, gravity: 100, life: .4, size: 8, color: ['#fff6c8', '#ffd34a'] }); } }
        const bu = clamp((f - FIRE[side]) / (MEET - FIRE[side]), 0, 1);
        if (df >= 0 && bu < 1) { const bx = mx + (W / 2 - mx) * bu, by = my; ctx.save(); ctx.globalCompositeOperation = 'lighter';
          const g = ctx.createLinearGradient(bx - dir * 160, by, bx, by); g.addColorStop(0, 'rgba(255,200,100,0)'); g.addColorStop(1, 'rgba(255,245,200,1)');
          ctx.strokeStyle = g; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(bx - dir * 160, by); ctx.lineTo(bx, by); ctx.stroke(); ctx.restore(); }
      }
      // the bullets meet: flash and a burst of sparks
      const dm = f - MEET;
      if (dm >= 0 && dm < 8) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; const r = 80 + dm * 70, al = 1 - dm / 8;
        const g = ctx.createRadialGradient(W / 2, H * .4, 0, W / 2, H * .4, r); g.addColorStop(0, `rgba(255,255,235,${al})`); g.addColorStop(.4, `rgba(255,190,80,${al * .8})`); g.addColorStop(1, 'rgba(255,120,30,0)');
        ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
        if (!tr.met) { tr.met = true; SND.play('banner_hit'); emit('spark', W / 2, H * .4, 50, { angle: 0, spread: 7, speed: 800, drag: 4.5, gravity: 200, life: .7, size: 9, color: ['#fff6c8', '#ffd34a', '#ff8a2a'] }); } }
      // gunsmoke: puffs roll out, a solid haze closes the last gaps, then everything thins slowly (each puff on its own clock)
      const haze = clamp((f - (a - 10)) / 10, 0, 1) * (1 - ease.inOut(clamp(outU / .8, 0, 1)));
      if (haze > 0) { ctx.save(); ctx.globalAlpha = haze; const hg = ctx.createRadialGradient(W / 2, H * .45, 0, W / 2, H * .45, W * .75); hg.addColorStop(0, '#d8d0c6'); hg.addColorStop(1, '#a89a8c'); ctx.fillStyle = hg; ctx.fillRect(0, 0, W, H); ctx.restore(); }
      for (const p of tr.puffs) {
        const age = (f - p.f0) / C.fps; if (age <= 0) continue;
        const g2 = 1 - Math.exp(-age * 2.2), o = ease.inOut(clamp((outU - p.d * .35) / .65, 0, 1));
        const x = p.x + p.dx * g2 + Math.sin(t * .7 + p.d * 9) * 30 * o, y = p.y + p.dy * g2 - o * 200, r = p.r * (.3 + .9 * g2) * (1 + o * .6);
        const al = clamp(age * 6, 0, 1) * (1 - o); if (al <= 0) continue;
        const c1 = `${Math.round(220 * p.sh)},${Math.round(212 * p.sh)},${Math.round(202 * p.sh)}`;
        const gr = ctx.createRadialGradient(x - r * .15, y - r * .2, 0, x, y, r); gr.addColorStop(0, `rgba(${c1},${al * .95})`); gr.addColorStop(.55, `rgba(${c1},${al * .7})`); gr.addColorStop(1, `rgba(${c1},0)`);
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      // FREE SPINS stamps in once the smoke has covered the scene
      const sf = f - a;
      if (sf > 0 && outU < .3) {
        const kk = ease.back(clamp(sf / 12, 0, 1), 2.2), sc = 1.7 - .7 * kk, ta = clamp(sf / 5, 0, 1) * (1 - clamp(outU / .3, 0, 1));
        ctx.save(); ctx.globalAlpha = ta; ctx.translate(W / 2, H * .45); ctx.scale(sc, sc); blockText('FREE SPINS', 0, 0, 170); ctx.restore();
      }
      if (f >= a + b + c) { G.trans = null; tr.resolve(); }
    } else {
      const u = clamp(f / FR.transToBase, 0, 1);
      G.camera = 1.08 - .08 * ease.out(u);
      // steam rolls off the screen to the left as the base game settles back
      if (!tr.puffs) { let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647; tr.puffs = []; for (let i = 0; i < 50; i++) tr.puffs.push({ x: rnd(), y: rnd(), r: 140 + rnd() * 200, d: rnd() * .3 }); }
      for (const p of tr.puffs) {
        const k = ease.inOut(clamp((u - p.d) / .7, 0, 1)), al = 1 - k; if (al <= 0) continue;
        const x = (p.x - k * 1.3) * W, y = p.y * H - k * 120, r = p.r * (1 + k * .4);
        const gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(236,224,210,${al * .9})`); gr.addColorStop(1, 'rgba(236,224,210,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
      if (u >= 1) { G.camera = 1; G.trans = null; tr.resolve(); }
    }
  }
  function popAt(x, y) { emit('spark', x, y, 18, { angle: 0, spread: 7, speed: 400, drag: 5, gravity: 150, life: .7, size: 9, color: ['#fff6c8', '#ffd34a', '#ff5a3a'] }); SND.play('sfx_cracker_pop'); }

  /* ------------------------------------------------------------ paytable / rules (info button) */
  function drawInfo() {
    if (!G.info) return;
    dimmer(.88);
    ctx.save(); ctx.fillStyle = '#3a0a0e'; ctx.strokeStyle = '#ffd34a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.roundRect(80, 36, W - 160, H - 72, 30); ctx.fill(); ctx.stroke(); ctx.restore();
    blockText(`${C.title.toUpperCase()}  ·  PAYTABLE`, W / 2, 86, 50, { maxW: W - 320 });
    const b = bet(), PW = C.POWER || {}, pids = Object.keys(PW).map(Number);
    const icon = (s, x, y, bw, bh) => { const img = A.symbol(s); if (!img) return; const k = Math.min(bw / img.width, bh / img.height); ctx.drawImage(img, x - img.width * k / 2, y - img.height * k / 2, img.width * k, img.height * k); };
    // 15 pay symbols in 3 rows of 5, then Scatter, Wild and Power Dynamite
    C.regular.forEach((s, i) => {
      const x = 170 + (i % 5) * 216, y = 205 + Math.floor(i / 5) * 172;
      icon(s, x - 8, y, 92, 88);
      const pays = C.paytable[s];
      Object.keys(pays).map(Number).sort((a, b2) => b2 - a).forEach((n, j) => uiText(`${n}  ${fmt(pays[n] * b)}`, x + 44, y - 36 + j * 25, 18, '#fff', 'left', 600));
    });
    const y4 = 205 + 3 * 172 + 10;
    icon(SC, 170, y4, 120, 112);
    Object.keys(C.scatterPays).map(Number).sort((a, b2) => b2 - a).forEach((n, j) => uiText(`${n}  ${fmt(C.scatterPays[n] * b)}`, 240, y4 - 30 + j * 27, 20, '#fff', 'left', 600));
    uiText('SCATTER', 170, y4 + 74, 18, '#ffe9a8', 'center', 700);
    if (C.WILD != null) { icon(C.WILD, 470, y4, 120, 112); uiText('WILD · reels 2-4', 470, y4 + 74, 18, '#ffe9a8', 'center', 700); }
    if (pids.length) {
      icon(pids[0], 760, y4, 120, 112);
      pids.forEach((id, j) => { const pl = A.multPlate(id); if (pl) { const ph = 52, pw = pl.width * ph / pl.height; ctx.drawImage(pl, 840 + j * 74, y4 - 44, pw, ph); } });
      uiText('POWER DYNAMITE · Wild ×' + pids.map(id => PW[id]).join(' ×'), 760, y4 + 74, 18, '#ffe9a8', 'left', 700);
    }
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.font = `500 19px ${UIF}`; ctx.fillStyle = 'rgba(255,240,220,.95)';
    const mults = pids.map(id => '×' + PW[id]).join(', ');
    const rules = [
      C.WILD != null ? `The Wild appears on reels 2, 3 and 4 and substitutes for every symbol except the Scatter.` : `The ${C.symbolNames[SC]} is Wild and substitutes for all symbols.`,
      pids.length ? `Power Dynamite is a Wild that carries a multiplier (${mults}). A line it completes is multiplied; several multipliers on one line add up.` : '',
      `3, 4 or 5 Scatters anywhere pay ${fmt(C.scatterPays[3] * b)}, ${fmt(C.scatterPays[4] * b)} or ${fmt(C.scatterPays[5] * b)} and award ${C.freeSpins} free spins. 3 or more during free spins award ${C.freeSpinsRetrigger} more.`,
      `Before free spins start, one pay symbol is picked as the special expanding symbol. When it lands on enough reels for a win, it fills those reels and pays on all ${C.paylines.length} lines, even on reels that are not next to each other.`,
      `Line wins pay left to right on adjacent reels; only the highest win per line is paid. Maximum win ${C.maxWin.toLocaleString('en-US')}× the total bet per round.`
    ].filter(Boolean);
    let yy = 168; rules.forEach(r => { yy = wrap(r, 1250, yy, 560, 26) + 38; });
    // 10 payline thumbnails
    C.paylines.forEach((line, i) => {
      const bx = 1250 + (i % 5) * 112, by = 790 + Math.floor(i / 5) * 100, s = 18;
      ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(bx, by, 5 * s, 3 * s);
      line.forEach((r, c) => { ctx.fillStyle = LINE_COLORS[i]; ctx.fillRect(bx + c * s + 2, by + r * s + 2, s - 4, s - 4); });
      uiText(String(i + 1), bx + 2.5 * s, by + 3 * s + 16, 16, '#fff', 'center', 600);
    });
    uiText('Click anywhere to close', W / 2, H - 70, 20, 'rgba(255,230,200,.75)', 'center', 600);
    ctx.textBaseline = 'alphabetic';
  }
  function wrap(text, x, y, maxW, lh) {
    const words = text.split(' '); let line = '';
    for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW) { ctx.fillText(line, x, y); line = w; y += lh; } else line = test; }
    ctx.fillText(line, x, y); return y;
  }

  /* ------------------------------------------------------------ frame loop */
  let lastT = now();
  function frame() {
    const t = now(), dt = Math.min(.05, t - lastT); lastT = t;
    updateReels(t);
    G.env = clamp(G.env + (G.envTarget - G.env) * Math.min(1, dt * (G.trans && G.trans.kind === 'toBase' ? 1.6 : 6)), 0, 1);
    G.dim = clamp(G.dim + ((G.dimTarget || 0) - G.dim) * Math.min(1, dt * 8), 0, 1);
    ctx.save();
    if (G.camera !== 1) { ctx.translate(W / 2, H / 2); ctx.scale(G.camera, G.camera); ctx.translate(-W / 2, -H / 2); }
    drawEnvironment(t);
    drawReelFrame();
    drawGrid(t);
    drawExpanded(t);
    drawFuses(t);
    drawAnticipation(t);
    drawLines(t);
    drawMascot(t);      // beside the reels, in front of the frame edge
    drawLogo(t);        // on top of the reel frame
    ctx.restore();
    drawHUD(t);
    drawBuyPopup(t);
    drawBanner(t, dt);
    drawModal(t, dt);
    drawParticles(dt);
    drawTransition(t);
    drawInfo();
    requestAnimationFrame(frame);
  }

  /* ------------------------------------------------------------ step presentation */
  function setWin(v, instant) { G.winFrom = instant ? v : G.win; G.win = Math.round(v * 100) / 100; G.winT0 = instant ? 0 : now(); }
  function clearLines() { if (G.lines) G.lines.fade = now(); G.labels = []; }
  function highlight(cells, t0) { G.dimTarget = 1; cells.forEach(([c, r]) => { G.fx[c][r].win = t0; G.fx[c][r].keep = true; }); }
  function unhighlight() { G.dimTarget = 0; G.fx.forEach(col => col.forEach(f => { f.win = null; f.keep = false; f.pulse = null; })); }
  const symWinFrames = () => FR.symWin[0] + FR.symWin[1] + FR.symWin[2];

  // all winning lines together, then each line on its own once (only when more than one line won)
  async function showWin(step) {
    if (C.mascotRig && C.mascotRig.fireOn === 'win') shoot();
    clearLines(); await wait(.02);
    let t0 = now();
    G.lines = { lines: step.wins.map(w => w.line), t0 };
    const cells = []; step.wins.forEach(w => w.positions.forEach(p => cells.push(p)));
    highlight(cells, t0);
    G.labels = [{ x: x0 + gw / 2, y: y0 + gh / 2, t0, text: fmt(step.amount), size: 70 }];
    SND.play('sfx_symbol_win_line'); setWin(G.win + step.amount);
    await waitF(symWinFrames(), true);
    // a round that ends on a win banner goes straight to it: no line-by-line pass first
    if (step.wins.length > 1 && !G.autoplay && !G.bannerNext) {
      for (const w of step.wins) {
        if (G.skipLines) break;
        clearLines(); unhighlight(); await wait(.02);
        t0 = now(); G.lines = { lines: [w.line], t0 }; highlight(w.positions, t0);
        const [lc, lr] = w.positions[w.positions.length - 1], [cx, cy] = cellCenter(lc, lr);
        G.labels = [{ x: cx, y: cy + ch * .3, t0, text: fmt(w.amount) + (w.mult > 1 ? `  (×${w.mult})` : ''), size: 44 }];
        const tok = G.skip; await waitF(FR.lineCycle, true); if (G.skip !== tok) break;
      }
    }
    unhighlight(); clearLines();
  }
  async function showScatter(step) {
    clearLines(); const t0 = now();
    highlight(step.positions, t0);
    step.positions.forEach(([c, r]) => { G.fx[c][r].pulse = t0; });
    SND.play('sfx_scatter_win');
    if (step.amount) { G.labels = [{ x: x0 + gw / 2, y: y0 + gh / 2, t0, text: fmt(step.amount), size: 70 }]; setWin(G.win + step.amount); }
    await waitF(symWinFrames());
    unhighlight(); clearLines();
    if (step.freeSpins) {
      // light every Scatter's fuse: the firecracker string unrolls down the reel and pops
      const reels = [...new Set(step.positions.map(p => p[0]))];
      SND.play('sfx_fuse');
      reels.forEach((c, i) => setTimeout(() => G.fuses.push({ c, t0: now() }), i * 120 / G.speed));
      await waitF(FR.fuse[0] + 4);
      reels.forEach(c => popCrackers(c, 8));
      await waitF(FR.fuse[1] + FR.fuse[2]);
    }
  }
  async function showExpand(step) {
    clearLines();
    const [fl, gr, st] = FR.expand, t0 = now();
    // 1. the special symbols flash
    highlight(step.cells, t0); SND.play('sfx_expand_flash');
    await waitF(fl + 8);
    unhighlight();
    // 2. each reel grows from its special symbols to the full reel (left to right)
    for (const c of step.reels) {
      const rows = step.cells.filter(p => p[0] === c).map(p => p[1]);
      G.expanded[c] = { sym: step.sym, y0: y0 + Math.min(...rows) * ch, y1: y0 + (Math.max(...rows) + 1) * ch, t1: now() };
      SND.play('sfx_expand');
      const [cx] = cellCenter(c, 1); emit('spark', cx, y0 + gh / 2, 22, { angle: 0, spread: 7, speed: 460, drag: 6, gravity: 120, life: .6, size: 10, color: ['#fff6c8', '#ffd34a'] });
      await waitF(gr * .6);
    }
    await waitF(gr * .4 + st);
    for (let c = 0; c < C.reels; c++) if (step.reels.includes(c)) for (let r = 0; r < C.rows; r++) G.board[c][r] = step.sym;
    // 3. all lines pay
    const t2 = now(); G.lines = { lines: C.paylines.map((_, i) => i), t0: t2 };
    step.reels.forEach(c => { if (G.expanded[c]) G.expanded[c].tA = t2; });
    G.labels = [{ x: x0 + gw / 2, y: y0 + gh / 2, t0: t2, text: fmt(step.amount), size: 84 }];
    SND.play('sfx_symbol_win_line'); setWin(G.win + step.amount);
    await waitF(FR.expandLines, true);
    clearLines();
  }

  async function playSteps(steps) {
    for (const s of steps) {
      if (s.type === 'win') await showWin(s);
      else if (s.type === 'scatter') await showScatter(s);
      else if (s.type === 'expand') await showExpand(s);
    }
  }

  function bigWinBanner(amount) {
    const tier = engine.tierOf(amount, bet());
    if (tier < 0) return Promise.resolve();
    shoot();
    return new Promise(resolve => { G.banner = { tier, amount, t0: now(), tok: G.skip, resolve }; });
  }
  function modal(o) { return new Promise(resolve => { G.modal = Object.assign({ t0: now(), tok: G.skip, resolve }, o); }); }
  function transition(kind, onCovered) { return new Promise(resolve => { G.trans = { kind, t0: now(), resolve, onCovered }; }); }

  /* ------------------------------------------------------------ spin flow */
  async function spinOnce(item, inFS) {
    const bought = inFS && G.fs.bought;
    const res = director.build(item || { type: 'random' }, { bet: bet(), inFreeSpins: inFS, special: G.fs.special, bought });
    applySpeed();
    G.fx = newFx(); G.lines = null; G.labels = []; G.expanded = {}; G.fuses.forEach(f => { f.fade = f.fade || now(); });
    if (!inFS) { G.balance = Math.round((G.balance - spinCost(item)) * 100) / 100; setWin(0, true); }
    G.spinBaseWin = G.win;      // the HUD win box keeps the round total during free spins
    SND.play('sfx_spin_button_click'); SND.play('sfx_reel_spin');
    G.spinning = true; G.onChange();
    await startReels(res.start, inFS, G.fs.special, bought);
    G.spinning = false; G.onChange();
    await wait(.12 / G.speed);
    G.bannerNext = engine.tierOf(res.total, bet()) >= 0;
    await playSteps(res.steps);
    G.bannerNext = false;
    // the round's big win banner (free spins: per spin, the summary shows the total)
    await bigWinBanner(res.total);
    // base game: the winning symbols keep looping their win animation until the player starts the next spin
    // (spinOnce resets G.fx); not in free spins, and not when this spin started free spins
    if (!inFS && C.loopWinsUntilSpin && !res.steps.some(s => s.freeSpins)) {
      const cells = [], seen = new Set();
      res.steps.forEach(s => (s.type === 'win' ? s.wins.flatMap(w => w.positions) : s.type === 'scatter' && s.amount ? s.positions : []).forEach(p => { const k = p[0] + ',' + p[1]; if (!seen.has(k)) { seen.add(k); cells.push(p); } }));
      if (cells.length) { highlight(cells, now()); G.dimTarget = .6; }
    }
    return res;
  }
  // what a base spin costs: the bet, or the feature buy price
  const spinCost = item => (item && item.type === 'buy' && C.buy ? buyOption(item.option).price : 1) * bet();
  function nextItem() {
    const it = G.queue.length ? G.queue.shift() : { type: 'random' };
    G.onChange(); return it;
  }

  // a spin must be affordable: lower the bet to the highest one the balance covers, or refill the demo balance
  // demo game: a feature buy the credit can't cover tops the demo credit up (as spins refill it), so every buy option
  // works at every bet (Darshan 2026-11-21: clicking a buy option must always start free spins)
  function ensureBuyFunds(cost) {
    if (G.balance >= cost - 1e-9) return;
    G.balance = Math.round((Math.max(C.startBalance, 0) + cost) * 100) / 100;
    G.notice = { text: 'DEMO BALANCE REFILLED', t0: performance.now() }; G.onChange();
  }
  function ensureFunds() {
    if (G.balance >= bet() - 1e-9) return;
    if (G.balance < C.bets[0] - 1e-9) {
      G.balance = C.startBalance; G.notice = { text: 'DEMO BALANCE REFILLED', t0: performance.now() };
    } else {
      let i = G.betIndex; while (i > 0 && C.bets[i] > G.balance + 1e-9) i--;
      G.betIndex = i; G.notice = { text: 'BET LOWERED TO ' + fmt(bet()), t0: performance.now() };
    }
    G.onChange();
  }
  async function play(opts = {}) {
    if (G.busy || G.info || (BUY.open && !opts.buy)) return false;
    let first;
    if (opts.buy) {
      if (!C.buy || !C.buy.enabled) return false;
      first = { type: 'buy', option: typeof opts.buy === 'string' ? opts.buy : 'free_spins' };
      ensureBuyFunds(spinCost(first));
    } else ensureFunds();
    G.busy = true; G.onChange(); SND.init(root.ASSET_MANIFEST); SND.playMusic('bgm_basegame_loop');
    try {
      first = first || nextItem();
      if (first.type === 'buy' && G.balance < spinCost(first) - 1e-9) { first = { type: 'random' }; ensureFunds(); }   // a queued buy the balance can't cover plays as a spin
      let base, direct = false;
      if (first.type === 'buy' && opts.direct) {
        // bought from the popup (Darshan 2026-11-21): no visible trigger spin, the transition plays straight away.
        // The bought trigger board (3-5 Scatters, CONFIG.buy.scatterWeights) is still drawn and paid, so the maths
        // is the same as a spun buy; it is put on the reels while the transition covers the screen.
        base = director.build(first, { bet: bet(), inFreeSpins: false, special: null, bought: false });
        G.balance = Math.round((G.balance - spinCost(first)) * 100) / 100; setWin(0, true); G.fx = newFx(); G.onChange();
        direct = base;
      } else base = await spinOnce(first, false);
      let roundWin = base.total;
      if (base.freeSpins) {
        const bo = first.type === 'buy' ? buyOption(first.option) : null;
        const special = base.special != null ? base.special : engine.pickSpecial(bo && bo.specialPool);
        roundWin = await freeSpins(bo ? bo.spins : base.freeSpins, roundWin, special, bo ? bo.id : false, direct);
      }
      roundWin = Math.min(roundWin, C.maxWin * bet());
      G.balance = Math.round((G.balance + roundWin) * 100) / 100;
      setWin(roundWin, true);
    } catch (e) {
      // an error mid-round must not leave the game stuck on a banner, modal, transition or the free-spins look
      console.error(e);
      G.spinning = false; G.banner = null; G.modal = null; G.trans = null; G.antic = null; G.fuses = []; G.expanded = {};
      G.fs.active = false; G.fs.special = null; G.fs.bought = false; G.envTarget = 0; G.env = 0; G.autoplay = false; G.dimTarget = 0;
    }
    G.busy = false; G.onChange(); applySpeed();
    return true;
  }
  async function freeSpins(count, roundWin, special, bought, direct) {
    const fs = G.fs, baseWin = roundWin;
    Object.assign(fs, { left: count, played: 0, total: 0, awarded: count, capped: false, special: null, bought: bought || false });
    shoot();
    const enter = () => { fs.active = true; fs.special = special; G.envTarget = 1; G.env = 1; G.fuses = []; G.fx = newFx(); SND.playMusic('bgm_freegame_loop'); };
    if (direct) {
      // popup buy: transition first, then the expanding symbol pick inside free spins; the trigger's Scatter pay
      // shows in the win box
      await transition('toFree', () => { G.board = direct.end.map(c => c.slice()); enter(); fs.special = null; if (direct.total) setWin(direct.total, true); });   // the card shows after the pick
      await modal({ kind: 'pick', special, start: Math.floor(Math.random() * C.regular.length) });
      fs.special = special;
    } else {
      await modal({ kind: 'intro', text1: 'YOU HAVE WON', text2: `${count} FREE SPINS` });
      await modal({ kind: 'pick', special, start: Math.floor(Math.random() * C.regular.length) });
      await transition('toFree', enter);
    }
    while (fs.left > 0) {
      fs.left--; fs.played++;
      await wait(.35 / G.speed);
      const r = await spinOnce(nextItem(), true);
      fs.total = Math.round((fs.total + r.total) * 100) / 100; roundWin += r.total;
      if (roundWin >= C.maxWin * bet()) {
        // max win cap: stop the round, the summary shows the capped amount
        roundWin = C.maxWin * bet(); fs.total = Math.round((roundWin - baseWin) * 100) / 100; fs.capped = true; fs.left = 0; break;
      }
      if (r.freeSpins) {
        await modal({ kind: 'retrigger', text2: `+${r.freeSpins} FREE SPINS` });
        fs.left += r.freeSpins; fs.awarded += r.freeSpins;
        G.fuses.forEach(f => { f.fade = f.fade || now(); });
      }
    }
    await wait(.4 / G.speed);
    await modal({ kind: 'outro', amount: fs.total, spins: fs.played, capped: fs.capped, onOutro: () => { fs.active = false; fs.special = null; fs.bought = false; G.envTarget = 0; G.expanded = {}; } });
    await transition('toBase');
    SND.playMusic('bgm_basegame_loop');
    return roundWin;
  }
  let autoLoop = 0;    // id of the running autoplay loop, so toggling AUTO off and on never runs two loops
  async function autoplayLoop() {
    G.autoplay = !G.autoplay; G.onChange();
    const me = ++autoLoop;
    while (G.autoplay && me === autoLoop) { await play(); if (G.autoplay && me === autoLoop) await wait(.5); }
  }
  async function playQueue(n) {
    G.autoplay = true; G.onChange();
    const me = ++autoLoop;
    let i = 0; const max = n ?? G.queue.length;
    // stop once the list is used up: free spins consume list items inside a single round
    while (G.autoplay && me === autoLoop && i < max && (i === 0 || G.queue.length)) { await play(); i++; if (i < max && G.queue.length) await wait(.8); }
    if (me === autoLoop) { G.autoplay = false; G.onChange(); }
  }

  /* ------------------------------------------------------------ input */
  cv.addEventListener('pointerdown', e => {
    SND.init(root.ASSET_MANIFEST);
    const rc = cv.getBoundingClientRect(), x = (e.clientX - rc.left) / rc.width * W, y = (e.clientY - rc.top) / rc.height * H;
    if (G.info) { G.info = false; return; }
    if (buyDown(x, y, e)) return;
    const hit = b => Math.hypot(x - b.x, y - b.y) <= b.r * 1.15;
    if (hit(btn.spin)) { if (!G.busy) play(); else G.skip++; return; }
    if (Math.abs(x - btn.auto.x) < 72 && Math.abs(y - btn.auto.y) < 20) { autoplayLoop(); return; }
    if (hit(btn.info)) { if (!G.busy) G.info = true; return; }
    if (hit(btn.sound)) { SND.setMuted(!SND.muted); return; }
    if (hit(btn.minus)) { if (!G.busy) { G.betIndex = Math.max(0, G.betIndex - 1); G.onChange(); } return; }
    if (hit(btn.plus)) { if (!G.busy) { G.betIndex = Math.min(C.bets.length - 1, G.betIndex + 1); G.onChange(); } return; }
    G.skip++;
  });
  const stageXY = e => { const rc = cv.getBoundingClientRect(); return [(e.clientX - rc.left) / rc.width * W, (e.clientY - rc.top) / rc.height * H]; };
  cv.addEventListener('pointermove', e => { const [x, y] = stageXY(e); buyMove(x, y, e); });
  cv.addEventListener('pointerup', e => { const [x, y] = stageXY(e); buyUp(x, y); });
  cv.addEventListener('pointercancel', () => { if (BUY.press) { setBuyState(BUY.press, 'normal'); BUY.press = null; } });
  cv.addEventListener('pointerleave', () => { if (BUY.hover && BUY.st[BUY.hover] === 'hover') setBuyState(BUY.hover, 'normal'); BUY.hover = null; cv.style.cursor = ''; });
  document.addEventListener('keydown', e => {
    const tg0 = e.target.tagName; if (tg0 === 'INPUT' || tg0 === 'SELECT' || tg0 === 'BUTTON' || tg0 === 'TEXTAREA') return;
    if (buyKey(e)) { e.preventDefault(); return; }
    if (e.code !== 'Space') return;
    const tg = e.target.tagName; if (tg === 'INPUT' || tg === 'SELECT' || tg === 'BUTTON' || tg === 'TEXTAREA') return;
    e.preventDefault(); SND.init(root.ASSET_MANIFEST); if (G.info) G.info = false; else if (G.busy) G.skip++; else play();
  });

  /* ------------------------------------------------------------ boot */
  async function boot() {
    const splash = root.Splash && C.splash && C.splash.enabled && !/[?&]nosplash\b/.test(location.search) ? root.Splash : null;
    if (splash) splash.start(C);
    try { await Promise.race([Promise.all([document.fonts.load(`80px ${BLOCK}`), document.fonts.load(`700 40px ${UIF}`)]), new Promise(r => setTimeout(r, 2500))]); } catch (e) {}
    try { G.assetInfo = await A.load(root.ASSET_MANIFEST, W, H, L, splash && splash.progress); }
    catch (e) { console.error('asset load failed, starting with placeholders', e); G.assetInfo = G.assetInfo || { missing: [], loaded: 0 }; }
    requestAnimationFrame(frame);
    G.onChange();
    if (splash) splash.finish();
  }

  root.Game = { G, C, engine, director, setSpeed, mascot: () => Object.assign({}, VM), play, buy: id => play({ buy: id || true }), buyUI: () => ({ open: BUY.open, st: Object.assign({}, BUY.st), lock: BUY.lock, boxes: buyLayout() }), openBuy, playQueue, autoplayLoop, boot, canvas: cv, bet, cellCenter };
})(window);
