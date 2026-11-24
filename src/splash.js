/*
 * Splash / loading screen. A DOM overlay on top of the stage (so it never appears in recordings).
 * Logo: ui_splash_logo when supplied (else the title in text). Backdrop: ui_splash_bg (the night train key art).
 * The bar follows real asset loading but never finishes before CONFIG.splash.minMs,
 * so the screen is always readable. When loading is done a CLICK TO RIDE sign appears; a click anywhere enters the game
 * (CONFIG.splash.clickToStart; the click also unlocks the music). Layout from Darshan's Google Stitch design (2026-11-24).
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

  // feature card icons and the progress locomotive, from Darshan's Stitch design (2026-11-24)
  const CARD_ICON = [
    '<svg viewBox="0 0 36 36" fill="none"><path d="M18 3l3.9 7.8 8.6 1.3-6.2 6.1 1.5 8.6L18 22.8l-7.8 4 1.5-8.6-6.2-6.1 8.6-1.3L18 3z" fill="#F2B13A" stroke="#23140A" stroke-width="2" stroke-linejoin="round"/><circle cx="18" cy="3" r="1.8" fill="#FFD66B" stroke="#23140A" stroke-width="1.2"/><circle cx="30.5" cy="12.1" r="1.8" fill="#FFD66B" stroke="#23140A" stroke-width="1.2"/><circle cx="25.8" cy="26.8" r="1.8" fill="#FFD66B" stroke="#23140A" stroke-width="1.2"/><circle cx="10.2" cy="26.8" r="1.8" fill="#FFD66B" stroke="#23140A" stroke-width="1.2"/><circle cx="5.5" cy="12.1" r="1.8" fill="#FFD66B" stroke="#23140A" stroke-width="1.2"/></svg>',
    '<svg viewBox="0 0 36 36" fill="none"><rect x="8" y="13" width="6" height="17" rx="2" fill="#9E2B25" stroke="#23140A" stroke-width="2"/><rect x="15" y="11" width="6" height="19" rx="2" fill="#9E2B25" stroke="#23140A" stroke-width="2"/><rect x="22" y="13" width="6" height="17" rx="2" fill="#9E2B25" stroke="#23140A" stroke-width="2"/><rect x="7" y="18" width="22" height="4" fill="#3B2414" stroke="#23140A" stroke-width="1.5"/><path d="M18 11 C18 7, 23 6, 26 4" stroke="#23140A" stroke-width="2" stroke-linecap="round"/><circle cx="27" cy="4" r="2.5" fill="#FFD66B" stroke="#9E2B25" stroke-width="1.2"/></svg>',
    '<svg viewBox="0 0 36 36" fill="none"><polygon points="7,27 11,19 21,19 25,27" fill="#F2B13A" stroke="#23140A" stroke-width="2" stroke-linejoin="round"/><polygon points="15,27 19,19 29,19 33,27" fill="#FFD66B" stroke="#23140A" stroke-width="2" stroke-linejoin="round"/><polygon points="11,19 15,11 25,11 29,19" fill="#FFD66B" stroke="#23140A" stroke-width="2" stroke-linejoin="round"/><path d="M16 14h6" stroke="#23140A" stroke-width="1.5" stroke-linecap="round"/></svg>',
  ];
  const LOCO = '<svg viewBox="0 0 64 48" fill="none"><rect x="6" y="16" width="14" height="18" rx="1" fill="#23140A" stroke="#0B1326" stroke-width="1.5"/><rect x="9" y="19" width="7" height="6" fill="#FFD66B" stroke="#23140A" stroke-width="1"/><rect x="4" y="14" width="18" height="3" rx="1" fill="#9E2B25" stroke="#23140A" stroke-width="1.2"/><rect x="20" y="20" width="26" height="14" rx="2" fill="#1A1614" stroke="#0B1326" stroke-width="1.5"/><rect x="24" y="22" width="18" height="2" fill="#B8893A"/><polygon points="38,20 36,10 44,10 42,20" fill="#23140A" stroke="#0B1326" stroke-width="1.5"/><rect x="35" y="8" width="10" height="3" rx="1" fill="#B8893A" stroke="#23140A" stroke-width="1"/><circle cx="47" cy="25" r="3" fill="#FFD66B" stroke="#23140A" stroke-width="1.2"/><polygon points="46,34 56,38 46,38" fill="#9E2B25" stroke="#23140A" stroke-width="1.5"/><circle cx="13" cy="37" r="4.5" fill="#3B2414" stroke="#B8893A" stroke-width="1.5"/><circle cx="26" cy="37" r="4.5" fill="#3B2414" stroke="#B8893A" stroke-width="1.5"/><circle cx="38" cy="37" r="4.5" fill="#3B2414" stroke="#B8893A" stroke-width="1.5"/><line x1="13" y1="37" x2="38" y2="37" stroke="#FFD66B" stroke-width="1.5"/></svg>';

  let el, cv, ctx, raf, parts = [], st = null, ro, cfg = { minMs: 2600, fadeMs: 700 };

  function build() {
    const C = root.CONFIG; MSG = (C.texts && C.texts.loading) || MSG;
    const wrap = document.getElementById('wrap'), manifest = root.ASSET_MANIFEST || { images: {} };
    el = document.createElement('div');
    el.className = 'splash';
    el.setAttribute('aria-label', 'Loading');
    const bg = manifest.images.ui_splash_bg || manifest.images.bg_base_main, logo = manifest.images.ui_splash_logo;
    const rivets = '<b></b><b></b><b></b><b></b>';
    const card = (icon, h, p) => `<article class="sp-card">${rivets}<div>${icon}<span><h2>${h}</h2><p>${p}</p></span></div></article>`;
    const cards = (C.texts && C.texts.splashCards) || [];
    el.innerHTML = `
      <div class="sp-bg"${bg ? ` style="background-image:url('${bg}')"` : ''}></div>
      <div class="sp-shade"></div>
      <div class="sp-moon"></div>
      <canvas class="sp-snow"></canvas>
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
      <div class="sp-main">
        <div class="sp-cards" role="group" aria-label="Game features">${cards.map((c, k) => card(CARD_ICON[k % CARD_ICON.length], c[0], c[1])).join('')}</div>
        <div class="sp-load" role="group" aria-label="Loading progress">
          <div class="sp-status"><span class="sp-msg" aria-live="polite">${MSG[0]}</span><b class="sp-pct">0%</b>
            <button class="sp-ride" type="button">${rivets}${(C.texts && C.texts.splashGo) || 'PLAY'}</button></div>
          <div class="sp-track" role="progressbar" aria-valuemin="0" aria-valuemax="100">
            <div class="sp-cap"><i></i><i></i></div>
            <div class="sp-rail"><div class="sp-sleepers"></div><div class="sp-fill"><div class="sp-sheen"></div><div class="sp-loco"><i></i><i></i><i></i>${LOCO}</div></div></div>
            <div class="sp-cap"><i></i><i></i></div>
          </div>
        </div>
        <p class="sp-foot">${(C.texts && C.texts.splashFoot) || ''}</p>
      </div>`;
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
    return { x: Math.random() * cv.width, y: first ? Math.random() * cv.height : cv.height + 10, r: (Math.random() * 2.2 + .8) * Math.max(u * 1.3, .6),
      vy: -(Math.random() * .7 + .3) * Math.max(u * 1.4, .6), vx: (Math.random() - .3) * .4, a: Math.random() * .6 + .2, life: 0 };
  }
  function snow() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    for (const p of parts) {
      p.y += p.vy; p.x += p.vx + Math.sin(p.y * .01) * .3;
      if (p.y < cv.height * .25) Object.assign(p, spawn(false));
      const fade = Math.min(1, (p.y - cv.height * .25) / (cv.height * .3));
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
      ctx.fillStyle = `rgba(255,${190 + (p.r * 20 | 0)},90,${p.a * fade})`;
      ctx.shadowBlur = 6; ctx.shadowColor = '#ffb347';
      ctx.fill();
    }
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
    if (pct >= 100 && st.real >= 1 && !st.ready) { st.ready = true; st.tReady = t; el.classList.add('ready'); }
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
      parts = Array.from({ length: 40 }, () => spawn(true));
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
