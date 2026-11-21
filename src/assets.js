/*
 * Asset loader. Tries every path in assets/manifest.js and falls back to the
 * placeholder art in placeholders.js when a file is missing. UI, banners and modals
 * are drawn in code unless a real file exists (check Assets.real[key]).
 */
(function (root) {
  const P = root.Placeholders;
  const Assets = { img: {}, real: {}, W: 1920, H: 1080, L: null };
  // symbol id -> manifest key: regular symbols sym_00_idle, sym_01_idle, ...; the Scatter sym_scatter_idle
  const SYM_KEYS = {};
  root.CONFIG.regular.forEach(i => { SYM_KEYS[i] = 'sym_' + String(i).padStart(2, '0') + '_idle'; });
  SYM_KEYS[root.CONFIG.SCATTER] = 'sym_scatter_idle';
  if (root.CONFIG.WILD != null) SYM_KEYS[root.CONFIG.WILD] = 'sym_wild_idle';
  // every Power Dynamite id shares one picture; its multiplier plate (mult_x2 ...) is drawn on top
  Object.keys(root.CONFIG.POWER || {}).forEach(i => { SYM_KEYS[i] = 'sym_power_idle'; });
  Assets.SYM_KEYS = SYM_KEYS;

  function loadImage(src) {
    return new Promise(res => {
      if (!src) return res(null);
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = () => res(null);
      im.src = src.startsWith('data:') || !root.BUILD_VERSION ? src : src + '?v=' + root.BUILD_VERSION;   // never a stale cached file
    });
  }
  function placeholder(key) {
    const { W, H } = Assets, C = root.CONFIG;
    const id = Object.keys(SYM_KEYS).find(k => SYM_KEYS[k] === key);
    if (id != null) return P.symbol(Number(id), C.symbolNames[id]);
    switch (key) {
      case 'sym_00_expanded': return P.symbol(0, 'PIG');
      case 'bg_base_main': return P.background(W, H, false);
      case 'bg_freegame_main': return P.background(W, H, true);
      case 'fx_scatter_full': return P.scatterFull();
      case 'fx_lantern': return P.lantern();
      case 'mult_x2': case 'mult_x3': case 'mult_x5': case 'mult_x10': return P.plate(key.slice(6));
      case 'char_mascot': return P.mascot();
    }
    return null;
  }

  Assets.load = async function (manifest, W, H, layout, onProgress) {
    Assets.W = W; Assets.H = H; Assets.L = layout; Assets.fits = manifest.fit || {};
    const entries = Object.entries(manifest.images || {});
    let done = 0;
    const loaded = await Promise.all(entries.map(([, src]) => loadImage(src).then(im => { if (onProgress) onProgress(++done / entries.length); return im; })));
    const missing = [];
    entries.forEach(([key], i) => {
      if (loaded[i]) { Assets.img[key] = loaded[i]; Assets.real[key] = true; }
      else { Assets.img[key] = placeholder(key); missing.push(key); }
    });
    if (missing.length) console.info('[assets] using placeholders for:', missing.join(', '));
    return { missing, loaded: entries.length - missing.length };
  };

  Assets.get = key => Assets.img[key] || null;
  // win animation for a symbol id: { img, cols, rows, frames, fps, fw, fh } when its sheet loaded, else null
  Assets.anim = id => {
    const key = (SYM_KEYS[id] || '').replace('_idle', '_win'), meta = (root.ASSET_MANIFEST.anims || {})[key];
    if (!meta || !Assets.real[key]) return null;
    const img = Assets.img[key];
    return Object.assign({ img, fw: img.width / meta.cols, fh: img.height / meta.rows }, meta);
  };
  Assets.symbol = id => Assets.img[SYM_KEYS[id]] || null;
  // multiplier plate for a Power Dynamite id (mult_x2 ...), or null
  Assets.multPlate = id => { const m = (root.CONFIG.POWER || {})[id]; return m ? Assets.img['mult_x' + m] || null : null; };
  // [width, height] of the box a symbol is fitted into, as a fraction of the cell (manifest.fit)
  Assets.fit = id => Assets.fits[SYM_KEYS[id]] || Assets.fits.default || [.98, 1.06];

  root.Assets = Assets;
})(window);
