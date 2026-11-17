/* Mesh rig: animates ONE character image the way Spine's mesh deform does, with no extra art.
 * The image is covered by a grid of triangles. Soft-edged "bones" (polygons, ellipses, capsules in image
 * pixels, from CONFIG.mascotRig) give every grid vertex a weight; each frame the vertices are moved by
 * the bones (cloth wave, breathing, head turn, arm recoil) and every triangle is drawn with an affine
 * transform. Cells that no bone touches are copied as plain rectangles.
 *
 *   const rig = Rig.create(img, CONFIG.mascotRig);
 *   rig.render(ctx2, scale, t, { fire: secondsSinceShot | null, gust: 0..1 });   // draws into ctx2 at 0,0
 *   rig.point('tip', t, state)  -> [x, y] in image pixels after deformation (e.g. the gun muzzle)
 */
(function (root) {
  'use strict';
  const smooth = (e0, e1, x) => { const u = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return u * u * (3 - 2 * u); };

  // signed distance inside a polygon (positive inside)
  function polyDist(px, py, P) {
    let inside = false, d = 1e9;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const [xi, yi] = P[i], [xj, yj] = P[j];
      if ((yi > py) !== (yj > py) && px < (xj - xi) * (py - yi) / (yj - yi) + xi) inside = !inside;
      const dx = xj - xi, dy = yj - yi, L = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((px - xi) * dx + (py - yi) * dy) / L));
      d = Math.min(d, Math.hypot(px - xi - u * dx, py - yi - u * dy));
    }
    return inside ? d : -d;
  }
  function shapeWeight(s, x, y) {
    const soft = s.soft || 40;
    if (s.poly) return smooth(0, soft, polyDist(x, y, s.poly));
    if (s.ellipse) { const [cx, cy, rx, ry] = s.ellipse, q = Math.hypot((x - cx) / rx, (y - cy) / ry); return 1 - smooth(1 - soft / Math.min(rx, ry), 1, q); }
    if (s.capsule) {
      const [ax, ay, bx, by, r] = s.capsule, dx = bx - ax, dy = by - ay, u = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy)));
      return 1 - smooth(r - soft, r, Math.hypot(x - ax - u * dx, y - ay - u * dy));
    }
    return 0;
  }
  // keyframed animations: each track is [[seconds, value], ...], eased between keys (smoothstep)
  const ANIMS = {
    // idle 1 "watchful": always running underneath (breathing, poncho in the wind, aim drift, head looks round)
    // idle 2 "wind gust": he lowers the gun and squints into a gust that lifts the poncho, then snaps back to aim
    idle2: { dur: 4.2, tracks: {
      armDrop: [[0, 0], [.7, .3], [2.9, .3], [3.25, -.05], [3.6, 0]],
      head:    [[0, 0], [.9, .07], [2.0, .07], [2.6, -.03], [3.4, 0]],
      gust:    [[0, 0], [.6, 1.8], [2.6, 1.8], [3.8, 0]],
      dip:     [[0, 0], [.7, .01], [2.9, .01], [3.3, -.006], [3.7, 0]] } },
    // win "quick draw": crouch and dip the gun (anticipation), snap up, three shots, stand tall with the poncho flaring, settle
    // win "quick draw": crouch and dip the gun to the holster (anticipation), whip it up (the draw), three shots,
    // bring the barrel up to his lips and blow the smoke away, then back to aim with a small overshoot
    win: { dur: 4.6, shots: [.6, .92, 1.24], blow: [2.2, 3.3], tracks: {
      armDrop: [[0, 0], [.3, .42], [.46, -.08], [.56, 0], [1.45, 0], [1.95, -.04], [3.5, -.04], [3.95, .03], [4.25, 0]],
      bend:    [[0, 0], [1.45, 0], [2.05, 1], [3.45, 1], [3.95, 0]],
      dip:     [[0, 0], [.3, .035], [.46, -.02], [.62, 0], [1.45, 0], [2.0, -.012], [3.4, -.012], [3.95, .006], [4.3, 0]],
      head:    [[0, 0], [.3, .07], [.46, -.03], [.62, 0], [1.45, 0], [2.0, .03], [3.4, .03], [3.9, -.02], [4.3, 0]],
      gust:    [[0, 0], [.46, 2.2], [1.6, 1.4], [2.4, .6], [3.0, 1.6], [4.6, 0]] } }
  };
  function track(keys, u) {
    if (!keys) return 0;
    if (u <= keys[0][0]) return keys[0][1];
    for (let i = 1; i < keys.length; i++) if (u < keys[i][0]) { const [t0, v0] = keys[i - 1], [t1, v1] = keys[i], q = smooth(0, 1, (u - t0) / (t1 - t0)); return v0 + (v1 - v0) * q; }
    return keys[keys.length - 1][1];
  }
  const rot = (x, y, cx, cy, a) => { const c = Math.cos(a), s = Math.sin(a), dx = x - cx, dy = y - cy; return [cx + dx * c - dy * s, cy + dx * s + dy * c]; };

  function create(img, cfg) {
    const IW = img.width, IH = img.height, cols = cfg.cols || 18, rows = cfg.rows || 34, N = (cols + 1) * (rows + 1);
    const rx = new Float32Array(N), ry = new Float32Array(N);
    for (let j = 0; j <= rows; j++) for (let i = 0; i <= cols; i++) { const n = j * (cols + 1) + i; rx[n] = i * IW / cols; ry[n] = j * IH / rows; }
    const W = {};
    for (const name of ['cloth', 'head', 'torso', 'arm', 'fore']) {
      W[name] = new Float32Array(N);
      if (cfg[name]) for (let n = 0; n < N; n++) W[name][n] = shapeWeight(cfg[name], rx[n], ry[n]);
    }
    // cells no bone touches are drawn as plain rectangles
    const moving = new Uint8Array(cols * rows);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      let s = 0; for (const n of [j * (cols + 1) + i, j * (cols + 1) + i + 1, (j + 1) * (cols + 1) + i, (j + 1) * (cols + 1) + i + 1]) s += W.cloth[n] + W.head[n] + W.torso[n] + W.arm[n] + W.fore[n];
      moving[j * cols + i] = s > 1e-3 ? 1 : 0;
    }
    const px = new Float32Array(N), py = new Float32Array(N);
    const A = cfg.anchors;

    // the pose at time t: cloth wave, breathing, head turn, arm aim and recoil
    function pose(t, st) {
      st = st || {};
      const f = st.fire, an = st.anim && ANIMS[st.anim.name], u = st.anim ? st.anim.u : 0, k = n => an ? track(an.tracks[n], u) : 0;
      const gust = 1 + (st.gust || 0) * 1.5 + k('gust');
      const kick = f == null || f < 0 ? 0 : (f < .05 ? f / .05 : Math.exp(-(f - .05) / .16));
      return {
        breathe: Math.sin(t * 2.2),
        head: .022 * Math.sin(t * .8) + .012 * Math.sin(t * 1.9) - .05 * kick + k('head'),
        arm: .018 * Math.sin(t * 1.3) - .34 * kick + k('armDrop'),
        recoil: 16 * kick, gust, t, dip: k('dip'), bend: k('bend')
      };
    }
    function deform(x, y, n, p, w) {
      // 1. cloth: a travelling wave, stronger further from where the cloth hangs
      if (w.cloth) {
        const [ax, ay] = A.clothRoot, d = Math.min(1.4, Math.hypot(x - ax, y - ay) / 700) * w.cloth * p.gust, T = p.t;
        x += d * (20 * Math.sin(T * 1.6 - y * .007) + 7 * Math.sin(T * 2.9 - y * .017 + x * .01));
        y += d * 6 * Math.sin(T * 1.6 - y * .007 + 1.2);
      }
      // 1b. whole-body crouch (dip > 0) or stretch (dip < 0) about the feet; boots stay planted
      if (p.dip) y = IH - (IH - y) * (1 - p.dip);
      // 2. breathing: chest and everything above it rise and fall around the waist
      const wb = Math.max(w.torso, w.head, w.arm);
      if (wb) y -= wb * Math.max(0, A.waist[1] - y) * .012 * p.breathe;
      // 3. head turn about the neck
      if (w.head) { const [hx, hy] = rot(x, y, A.neck[0], A.neck[1], p.head); x += (hx - x) * w.head; y += (hy - y) * w.head; }
      // 4. gun arm: aim drift and recoil (rotate up about the shoulder, kick back along the arm)
      if (w.arm) {
        let [ax2, ay2] = rot(x, y, A.shoulder[0], A.shoulder[1], p.arm);
        const dx = A.tip[0] - A.shoulder[0], dy = A.tip[1] - A.shoulder[1], L = Math.hypot(dx, dy);
        ax2 -= dx / L * p.recoil; ay2 -= dy / L * p.recoil;
        x += (ax2 - x) * w.arm; y += (ay2 - y) * w.arm;
      }
      // 5. forearm bend (bend 0..1): the forearm and gun fold up at the elbow and slide in toward the face, so
      //    the barrel comes up to his lips (anchors.mouth)
      if (w.fore && p.bend) {
        const [ex, ey] = rot(A.elbow[0], A.elbow[1], A.shoulder[0], A.shoulder[1], p.arm);
        const B = cfg.bend || {}, ang = (B.angle ?? -.66) * p.bend, sl = (B.slide ?? 70) * p.bend;
        let [fx, fy] = rot(x, y, ex, ey, ang);
        const tdx = A.tip[0] - A.elbow[0], tdy = A.tip[1] - A.elbow[1], [rdx, rdy] = rot(tdx, tdy, 0, 0, ang), L = Math.hypot(rdx, rdy);
        fx -= rdx / L * sl; fy -= rdy / L * sl;
        x += (fx - x) * w.fore; y += (fy - y) * w.fore;
      }
      return [x, y];
    }
    const wAt = n => ({ cloth: W.cloth[n], head: W.head[n], torso: W.torso[n], arm: W.arm[n], fore: W.fore[n] });
    function weightsAt(x, y) { return { cloth: cfg.cloth ? shapeWeight(cfg.cloth, x, y) : 0, head: cfg.head ? shapeWeight(cfg.head, x, y) : 0, torso: cfg.torso ? shapeWeight(cfg.torso, x, y) : 0, arm: cfg.arm ? shapeWeight(cfg.arm, x, y) : 0, fore: cfg.fore ? shapeWeight(cfg.fore, x, y) : 0 }; }

    function render(c, k, t, st) {
      const p = pose(t, st);
      for (let n = 0; n < N; n++) { const [x, y] = deform(rx[n], ry[n], n, p, wAt(n)); px[n] = x * k; py[n] = y * k; }
      const cw = IW / cols, ch = IH / rows;
      // static cells: one rectangle per run along each row
      for (let j = 0; j < rows; j++) {
        let i = 0;
        while (i < cols) {
          if (moving[j * cols + i]) { i++; continue; }
          let e = i; while (e < cols && !moving[j * cols + e]) e++;
          c.drawImage(img, i * cw, j * ch, (e - i) * cw, ch, i * cw * k - .4, j * ch * k - .4, (e - i) * cw * k + .8, ch * k + .8);
          i = e;
        }
      }
      // moving cells: two triangles each, affine-mapped
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        if (!moving[j * cols + i]) continue;
        const a = j * (cols + 1) + i, b = a + 1, d = a + cols + 1, e = d + 1;
        tri(c, a, b, e); tri(c, a, e, d);
      }
    }
    function tri(c, a, b, d) {
      const u0 = rx[a], v0 = ry[a], u1 = rx[b], v1 = ry[b], u2 = rx[d], v2 = ry[d];
      const x0 = px[a], y0 = py[a], x1 = px[b], y1 = py[b], x2 = px[d], y2 = py[d];
      const den = (u1 - u0) * (v2 - v0) - (u2 - u0) * (v1 - v0); if (!den) return;
      const m11 = ((x1 - x0) * (v2 - v0) - (x2 - x0) * (v1 - v0)) / den, m12 = ((y1 - y0) * (v2 - v0) - (y2 - y0) * (v1 - v0)) / den;
      const m21 = ((x2 - x0) * (u1 - u0) - (x1 - x0) * (u2 - u0)) / den, m22 = ((y2 - y0) * (u1 - u0) - (y1 - y0) * (u2 - u0)) / den;
      const dx = x0 - m11 * u0 - m21 * v0, dy = y0 - m12 * u0 - m22 * v0;
      // clip to the triangle grown by ~0.7 px so neighbouring triangles overlap (no hairline seams)
      const cx = (x0 + x1 + x2) / 3, cy = (y0 + y1 + y2) / 3, g = (x, y) => { const l = Math.hypot(x - cx, y - cy) || 1; return [x + (x - cx) / l * .7, y + (y - cy) / l * .7]; };
      const [ax, ay] = g(x0, y0), [bx, by] = g(x1, y1), [ex, ey] = g(x2, y2);
      c.save(); c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.lineTo(ex, ey); c.closePath(); c.clip();
      c.transform(m11, m12, m21, m22, dx, dy); c.drawImage(img, 0, 0); c.restore();
    }
    // where an anchor point (e.g. the gun muzzle) is after deformation, in image pixels
    function point(name, t, st) { const [x, y] = A[name]; return deform(x, y, -1, pose(t, st), weightsAt(x, y)); }
    return { render, point, width: IW, height: IH, anims: ANIMS };
  }
  root.Rig = { create, ANIMS };
})(typeof window !== 'undefined' ? window : globalThis);
