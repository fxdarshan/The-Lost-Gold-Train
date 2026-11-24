/*
 * Splash / loading screen. A DOM overlay on top of the stage (so it never appears in recordings).
 * Logo: ui_splash_logo when supplied (else the title in text). Backdrop: ui_splash_bg (the night train key art).
 * The bar follows real asset loading but never finishes before CONFIG.splash.minMs,
 * so the screen is always readable. When loading is done a CLICK TO RIDE sign appears; a click anywhere enters the game
 * (CONFIG.splash.clickToStart; the click also unlocks the music). Built from the game's own art (2026-11-24): feature boards
 * on the outro board frame with real symbol art, and a burning dynamite fuse as the loading bar.
 * Turn it off with CONFIG.splash.enabled = false, or open the page with ?nosplash.
 * "Replay splash screen" in the demo panel runs it again.
 */
(function (root) {
  let MSG = ['Loading...'];
  const ICON = {
    star: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.2l7.1-.6z"/></svg>',
    vol: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>',
    mute: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 4V5L8 9z" fill="currentColor"/><path d="M17 9l5 6M22 9l-5 6"/></svg>',
    full: '<svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
  };

  let el, cv, ctx, raf, parts = [], st = null, ro, cfg = { minMs: 2600, fadeMs: 700 };

  function build() {
    const C = root.CONFIG; MSG = (C.texts && C.texts.loading) || MSG;
    const wrap = document.getElementById('wrap'), manifest = root.ASSET_MANIFEST || { images: {} };
    el = document.createElement('div');
    el.className = 'splash';
    el.setAttribute('aria-label', 'Loading');
    const im = manifest.images, bg = im.ui_splash_bg || im.bg_base_main, logo = im.ui_splash_logo;
    const board = im.ui_outro_board ? `url('${new URL(im.ui_outro_board, location.href).href}')` : 'none';   // absolute: the var is used inside style.css
    const cards = (C.texts && C.texts.splashCards) || [];
    el.innerHTML = `
      <div class="sp-bg"${bg ? ` style="background-image:url('${bg}')"` : ''}></div>
      <div class="sp-shade"></div>
      <div class="sp-top">
        <div class="sp-brand">${ICON.star}<span>${(C.texts && C.texts.brand) || C.title}</span></div>
        <div class="sp-btns"><button class="sp-btn" data-act="vol" aria-label="Toggle sound"></button><button class="sp-btn" data-act="full" aria-label="Fullscreen">${ICON.full}</button></div>
      </div>
      <div class="sp-hero">
        <div class="sp-logo">
          <div class="sp-halo"></div>
          ${logo ? `<img alt="${C.title}" src="${logo}" onerror="this.outerHTML='<div class=&quot;sp-title&quot;>${C.title.replace(/'/g, '')}</div>'"><div class="sp-sweep" style="--logo:url('${logo}')"><i></i></div>` : `<div class="sp-title">${C.title}</div>`}
        </div>
      </div>
      <div class="sp-cards" role="group" aria-label="Game features" style="--board:${board}">${cards.map(c =>
        `<div class="sp-card">${im[c[2]] ? `<img alt="" src="${im[c[2]]}">` : ''}<div><h2>${c[0]}</h2><p>${c[1]}</p></div></div>`).join('')}</div>
      <div class="sp-load" role="group" aria-label="Loading progress" style="--board:${board}">
        <div class="sp-status"><span class="sp-msg" aria-live="polite">${MSG[0]}</span><b class="sp-pct">0%</b></div>
        <div class="sp-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
          <div class="sp-fuse"><div class="sp-fill"><i class="sp-spark"></i></div></div>
          ${im.sym_power_idle ? `<img class="sp-dyn" alt="" src="${im.sym_power_idle}">` : ''}
        </div>
        <button class="sp-ride" type="button">${(C.texts && C.texts.splashGo) || 'PLAY'}</button>
      </div>
      <div class="sp-flash"></div>
      <canvas class="sp-snow"></canvas>
      <p class="sp-foot">${(C.texts && C.texts.splashFoot) || ''}</p>`;
    wrap.appendChild(el);
    cv = el.querySelector('.sp-snow'); ctx = cv.getContext('2d');
    el.addEventListener('click', e => {
      const b = e.target.closest('.sp-btn');
      if (b) {
        if (b.dataset.act === 'vol' && root.Audio2) { root.Audio2.setMuted(!root.Audio2.muted); icons(); }
        if (b.dataset.act === 'full') { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {}); else document.exitFullscreen(); }
        return;
      }
      if (st && st.ready) { leave(); if (Splash.onEnter) Splash.onEnter(); }   // the click also starts the music
    });
    ro = new ResizeObserver(place); ro.observe(wrap); ro.observe(document.getElementById('stage'));
  }

  const icons = () => { const b = el.querySelector('[data-act=vol]'); if (b) b.innerHTML = root.Audio2 && root.Audio2.muted ? ICON.mute : ICON.vol; };

  // cover exactly the visible stage, and size everything from its width (1920 design px = full width)
  function place() {
    if (!el) return;
    const w = document.getElementById('wrap').getBoundingClientRect(), s = document.getElementById('stage').getBoundingClientRect();
    el.style.left = (s.left - w.left) + 'px'; el.style.top = (s.top - w.top) + 'px';
    el.style.width = s.width + 'px'; el.style.height = s.height + 'px';
    el.style.setProperty('--u', (s.width / 1920) + 'px');
    cv.width = Math.max(1, Math.round(s.width)); cv.height = Math.max(1, Math.round(s.height));
  }

  function spawn(first) {                     // embers drifting up from the bottom
    const u = cv.width / 1920;
    return { x: Math.random() * cv.width, y: first ? cv.height * (.45 + Math.random() * .55) : cv.height + 10, r: (Math.random() * 2.2 + .8) * Math.max(u * 1.3, .6),
      vy: -(Math.random() * .7 + .3) * Math.max(u * 1.4, .6), vx: (Math.random() - .3) * .4, a: Math.random() * .6 + .2 };
  }
  let sparks = [];
  function snow() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const u = cv.width / 1920;
    ctx.shadowBlur = 6; ctx.shadowColor = '#ffb347';
    for (const p of parts) {
      p.y += p.vy; p.x += p.vx + Math.sin(p.y * .01) * .3;
      if (p.y < cv.height * .3) Object.assign(p, spawn(false));
      const fade = Math.min(1, (p.y - cv.height * .3) / (cv.height * .3));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = `rgba(255,${190 + (p.r * 20 | 0)},90,${p.a * fade})`; ctx.fill();
    }
    // sparks thrown off the burning end of the fuse
    const sp = st && !st.ready && el.querySelector('.sp-spark');
    if (sp) {
      const a = sp.getBoundingClientRect(), b = el.getBoundingClientRect(), k = cv.width / b.width;
      const x = (a.left + a.width / 2 - b.left) * k, y = (a.top + a.height / 2 - b.top) * k;
      for (let n = 0; n < 3; n++) { const ang = -Math.PI / 2 + (Math.random() - .5) * 2.6, v = (2 + Math.random() * 5) * u * 1.6;
        sparks.push({ x, y, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, life: 1, d: .025 + Math.random() * .04 }); }
    }
    ctx.shadowColor = '#ffcf5a';
    for (const s of sparks) {
      s.x += s.vx; s.y += s.vy; s.vy += .18 * u * 1.6; s.life -= s.d;
      ctx.beginPath(); ctx.moveTo(s.x, s.y); ctx.lineTo(s.x - s.vx * 1.6, s.y - s.vy * 1.6);
      ctx.strokeStyle = `rgba(255,${200 + (s.life * 55 | 0)},${120 * s.life | 0},${Math.max(0, s.life)})`; ctx.lineWidth = Math.max(1, 2.2 * u * 1.4); ctx.stroke();
    }
    sparks = sparks.filter(s => s.life > 0);
    ctx.shadowBlur = 0;
  }

  function tick(t) {
    if (!st) return;
    snow();
    const elapsed = t - st.t0;
    const shown = Math.min(st.real, Math.min(1, elapsed / cfg.minMs));     // never ahead of the real load, never faster than minMs
    st.shown += (shown - st.shown) * .35;                                     // glide
    const pct = shown >= 1 && st.real >= 1 ? 100 : Math.min(99, Math.round(st.shown * 100));
    el.querySelector('.sp-fill').style.width = Math.max(pct, 2) + '%';
    el.querySelector('.sp-pct').textContent = pct + '%';
    const i = Math.min(MSG.length - 1, Math.floor(pct / 25)), m = el.querySelector('.sp-msg');
    const txt = MSG[i];
    if (m.textContent !== txt) m.textContent = txt;
    el.querySelector('.sp-track').setAttribute('aria-valuenow', pct);
    const dyn = el.querySelector('.sp-dyn'); if (dyn) dyn.classList.toggle('hot', pct >= 85 && !st.ready);
    if (pct >= 100 && st.real >= 1 && !st.ready) {                        // the spark reaches the dynamite: flash, then the board
      st.ready = true; st.tReady = t;
      if (dyn) { const a = dyn.getBoundingClientRect(), b = el.getBoundingClientRect();
        el.style.setProperty('--fx', ((a.left + a.width / 2 - b.left) / b.width * 100) + '%'); el.style.setProperty('--fy', ((a.top + a.height / 2 - b.top) / b.height * 100) + '%'); }
      el.classList.add('ready');
      if (root.Audio2 && root.Audio2.play) try { root.Audio2.play('sfx_cracker_pop'); } catch (e) {}
    }
    if (st.ready && !(cfg.clickToStart && !/[?&]scenario=/.test(location.search)) && t - st.tReady > 450) return leave();
    raf = requestAnimationFrame(tick);
  }

  function leave() {
    if (!st || st.leaving) return;
    st.leaving = true; cancelAnimationFrame(raf);
    el.classList.add('out');
    const e = el; setTimeout(() => { if (el === e && st && st.leaving) { e.hidden = true; e.classList.remove('out'); st = null; } }, cfg.fadeMs + 50);
  }

  const Splash = {
    start(C) {
      cfg = Object.assign({ minMs: 2600, fadeMs: 700 }, C && C.splash);
      if (!el) build();
      cancelAnimationFrame(raf);
      el.hidden = false; el.classList.remove('out', 'ready'); el.style.setProperty('--fade', cfg.fadeMs + 'ms');
      place(); icons();
      parts = Array.from({ length: 40 }, () => spawn(true)); sparks = [];
      st = { t0: performance.now(), real: 0, shown: 0, ready: false, leaving: false };
      raf = requestAnimationFrame(tick);
    },
    progress(p) { if (st) st.real = Math.max(st.real, Math.min(.99, p)); },
    finish() { if (st) st.real = 1; },
    replay(C) { Splash.start(C); Splash.finish(); },
    active() { return !!st; },
    skip() { if (st) { st.real = 1; st.ready = true; leave(); } },
    ready() { return !!(st && st.ready); },
  };
  root.Splash = Splash;
})(window);
