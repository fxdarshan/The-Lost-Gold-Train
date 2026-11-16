/*
 * Placeholder art, drawn in code. Used for any image in assets/manifest.js that is
 * missing, so the game always runs and art can be swapped in file by file.
 * Every function returns a canvas the same way a loaded image would be used.
 */
(function (root) {
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const TILE = ['#d4a017', '#8a2be2', '#1e6fd9', '#1aa0a0', '#1a9a3a', '#c2185b', '#d32f2f', '#1976d2', '#7b1fa2', '#388e3c', '#f57c00'];

  // a coloured tile with the symbol's name, 600 x 520 (same framing as the supplied art)
  function symbol(id, name) {
    const c = mk(600, 520), x = c.getContext('2d');
    if (id === root.CONFIG.SCATTER) {   // Scatter: red octagon
      x.fillStyle = '#ffd34a'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; x.lineTo(300 + 250 * Math.cos(a), 260 + 250 * Math.sin(a)); } x.fill();
      x.fillStyle = '#c8101a'; x.beginPath(); for (let i = 0; i < 8; i++) { const a = Math.PI / 8 + i * Math.PI / 4; x.lineTo(300 + 215 * Math.cos(a), 260 + 215 * Math.sin(a)); } x.fill();
      x.fillStyle = '#ffe27a'; x.font = 'bold 92px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SCATTER', 300, 260); return c;
    }
    x.fillStyle = TILE[id % TILE.length]; x.beginPath(); x.roundRect(20, 30, 560, 460, 30); x.fill();
    x.lineWidth = 14; x.strokeStyle = '#ffd34a'; x.stroke();
    x.fillStyle = '#fff'; x.font = `bold ${name.length > 3 ? 70 : 200}px sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(name, 300, 265, 520);
    return c;
  }
  // a multiplier plate (x2 ...), 200 x 220
  function plate(label) {
    const c = mk(200, 220), x = c.getContext('2d');
    x.fillStyle = '#b8541a'; x.beginPath(); x.roundRect(8, 8, 184, 204, 24); x.fill(); x.lineWidth = 10; x.strokeStyle = '#ffd34a'; x.stroke();
    x.fillStyle = '#fff3c0'; x.font = 'bold 96px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(label, 100, 112, 170); return c;
  }
  function background(W, H, free) {
    const c = mk(W, H), x = c.getContext('2d'), L = root.CONFIG.window;
    // sunset desert (base) or moonlit night (free spins), a timber frame and dark-wood reel panels
    const g = x.createLinearGradient(0, 0, 0, H);
    (free ? ['#141a3a', '#2a3a6a', '#4a4a6a'] : ['#e8783a', '#f0a050', '#d89a60']).forEach((c2, i) => g.addColorStop(i / 2, c2));
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    x.fillStyle = free ? '#2a2030' : '#a0522d'; x.beginPath(); x.moveTo(0, H * .55); x.lineTo(W * .2, H * .38); x.lineTo(W * .32, H * .5); x.lineTo(W * .55, H * .33); x.lineTo(W * .8, H * .45); x.lineTo(W, H * .36); x.lineTo(W, H); x.lineTo(0, H); x.fill();
    x.fillStyle = '#6a4224'; x.fillRect(L.x - 40, L.y - 50, L.w + 80, L.h + 90);
    for (let i = 0; i < 5; i++) { x.fillStyle = free ? '#1e2438' : '#3a2414'; x.fillRect(L.x + i * L.w / 5 + 4, L.y, L.w / 5 - 8, L.h); }
    return c;
  }
  function scatterFull() {
    const c = mk(260, 620), x = c.getContext('2d');
    x.fillStyle = '#1a2a8a'; x.fillRect(0, 0, 260, 620);
    for (let i = 0; i < 18; i++) { x.fillStyle = '#d61f26'; x.fillRect(80 + (i % 2) * 50, 160 + i * 25, 48, 22); x.fillStyle = '#ffd34a'; x.fillRect(80 + (i % 2) * 50, 160 + i * 25, 6, 22); }
    x.drawImage(symbol(root.CONFIG.SCATTER, 'Scatter'), 10, 0, 240, 210); return c;
  }
  function lantern() {
    const c = mk(120, 260), x = c.getContext('2d');
    x.fillStyle = '#ffd34a'; x.fillRect(58, 0, 4, 40); x.fillStyle = '#e8202a'; x.beginPath(); x.ellipse(60, 120, 55, 75, 0, 0, 7); x.fill();
    x.fillStyle = '#ffd34a'; x.fillRect(35, 40, 50, 10); x.fillRect(35, 190, 50, 10); x.fillStyle = '#c8101a'; x.fillRect(56, 200, 8, 60); return c;
  }
  // the Outlaw mascot as a simple painted silhouette: hat, poncho, revolver arm
  function mascot() {
    const c = mk(400, 800), x = c.getContext('2d');
    x.fillStyle = '#3a2418'; x.beginPath(); x.ellipse(200, 120, 150, 30, 0, 0, 7); x.fill();        // hat brim
    x.fillRect(130, 40, 140, 85);                                                                     // crown
    x.fillStyle = '#c89a6a'; x.beginPath(); x.ellipse(200, 175, 55, 60, 0, 0, 7); x.fill();           // face
    x.fillStyle = '#b0201a'; x.fillRect(150, 220, 100, 40);                                            // bandana
    x.fillStyle = '#6a4228'; x.beginPath(); x.moveTo(80, 260); x.lineTo(320, 260); x.lineTo(300, 560); x.lineTo(100, 560); x.closePath(); x.fill();   // coat
    x.fillStyle = '#2a3a4a'; x.fillRect(120, 560, 70, 230); x.fillRect(210, 560, 70, 230);           // legs
    x.fillStyle = '#6a4228'; x.save(); x.translate(300, 290); x.rotate(-.9); x.fillRect(0, -20, 150, 40); x.restore();   // arm
    x.fillStyle = '#556a76'; x.fillRect(370, 150, 30, 60);                                             // revolver
    x.fillStyle = 'rgba(255,255,255,.85)'; x.font = 'bold 28px sans-serif'; x.textAlign = 'center'; x.fillText('THE OUTLAW', 200, 420);
    return c;
  }
  root.Placeholders = { symbol, background, scatterFull, lantern, mascot, plate };
})(window);
