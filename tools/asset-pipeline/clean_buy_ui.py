"""Prepare Darshan's Buy Feature PNGs (Lost_Gold_Train_Buy_Feature_FINAL_Assets.zip) for the game.

The artwork is used exactly as supplied. Only leftovers of the presentation sheet are removed: file-name labels,
slivers of neighbouring cards and the sheet header, i.e. every opaque piece not connected to the main artwork.
Then the four states of each control are placed on ONE shared canvas, aligned on the artwork's solid body, at the
original pixel scale (no resizing), so swapping states never moves or rescales anything.

Usage: python3 clean_buy_ui.py SRC_DIR OUT_DIR
"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)

def clean(path):
    a = np.asarray(Image.open(path).convert('RGBA')).copy()
    al = a[..., 3].astype(np.float32) / 255
    solid = al > .6
    lab, n = ndimage.label(solid); sizes = np.bincount(lab.ravel()); sizes[0] = 0
    main = lab == sizes.argmax()
    # keep the soft glow that touches the main piece; drop everything else (labels, neighbours, sheet header)
    near = ndimage.binary_dilation(main, iterations=3)
    soft = al > .02
    lab2, n2 = ndimage.label(soft)
    keep_ids = set(np.unique(lab2[near & soft])) - {0}
    keep = np.isin(lab2, list(keep_ids))
    # a separate solid piece inside the kept glow (e.g. a neighbour card) is still dropped
    other_solid = solid & ~main
    lab3, n3 = ndimage.label(other_solid)
    for i in range(1, n3 + 1):
        piece = lab3 == i
        if piece.sum() > 30: keep &= ~ndimage.binary_dilation(piece, iterations=2)
    a[..., 3] = (a[..., 3] * keep).astype(np.uint8)
    body = ndimage.binary_fill_holes(main & (al > .95))
    ys, xs = np.where(body)
    return a, (xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)

import cv2
def register(norm, img):
    """scale and offset that map img onto norm, found by matching the middle of the artwork (lettering, plate)"""
    g = lambda x: (cv2.cvtColor(np.ascontiguousarray(x[..., :3]), cv2.COLOR_RGB2GRAY).astype(np.float32) * (x[..., 3].astype(np.float32) / 255)).astype(np.float32)
    gn, gi = g(norm), g(img)
    h, w = gn.shape; tpl = gn[int(h * .25):int(h * .8), int(w * .2):int(w * .8)]
    best = (-2, 1, 0, 0)
    for sc in [1.0]:                     # same scale as supplied (measured within 3%): position only, no resampling
        r = cv2.resize(gi, None, fx=1 / sc, fy=1 / sc, interpolation=cv2.INTER_AREA)
        if r.shape[0] < tpl.shape[0] or r.shape[1] < tpl.shape[1]: continue
        m = cv2.matchTemplate(r, tpl, cv2.TM_CCOEFF_NORMED); _, v, _, loc = cv2.minMaxLoc(m)
        if v > best[0]: best = (v, sc, loc[0] - int(w * .2), loc[1] - int(h * .25))
    return best   # (score, scale of img vs norm, x, y of norm's origin inside the resized img)

meta = {}
controls = ['buy_btn', 'option_free_spins', 'option_super_free_spins', 'option_feature_max', 'close']
for c in controls:
    imgs = {st: clean(os.path.join(src, f'{c}_{st}.png'))[0] for st in ['normal', 'hover', 'pressed', 'release']}
    norm = imgs['normal']; placed = {}; info = {}
    for st, a in imgs.items():
        if st == 'normal': placed[st] = (Image.fromarray(a), 0, 0); info[st] = [1.0, 1.0]; continue
        v, sc, x, y = register(norm, a)
        im = Image.fromarray(a).resize((round(a.shape[1] / sc), round(a.shape[0] / sc)), Image.LANCZOS)
        placed[st] = (im, -x, -y); info[st] = [round(float(sc), 2), round(float(v), 3)]
    # one canvas holding every state, in normal's coordinates
    x0 = min(ox for im, ox, oy in placed.values()); y0 = min(oy for im, ox, oy in placed.values())
    x1 = max(ox + im.width for im, ox, oy in placed.values()); y1 = max(oy + im.height for im, ox, oy in placed.values())
    W, H = x1 - x0, y1 - y0
    for st, (im, ox, oy) in placed.items():
        cv = Image.new('RGBA', (W, H), (0, 0, 0, 0)); cv.alpha_composite(im, (ox - x0, oy - y0))
        cv.save(os.path.join(out, f'{c}_{st}.png'), optimize=True)
    nb = norm.shape
    meta[c] = {'canvas': [W, H], 'normal_at': [-x0, -y0, nb[1], nb[0]], 'scale_score': info}
for f in ['popup_frame', 'popup_title_buy_free_spins']:
    a, b = clean(os.path.join(src, f + '.png'))
    ys, xs = np.where(a[..., 3] > 8)
    Image.fromarray(a).crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1)).save(os.path.join(out, f + '.png'), optimize=True)
    meta[f] = {'canvas': [int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)]}
print(json.dumps(meta, indent=1))

# ---- trim: keep each control's own artwork and its glow only. The cards and buttons are symmetric left to right:
# find the centre line of the normal image (best match with its own mirror image) and mirror each state's clean left
# edge to set its right edge (the sheet's neighbouring card touched the right side). Below the artwork, the sheet's
# file-name labels are cut at the same glow depth as above it.
def centre(gray, lo, hi):
    best = (1e18, None)
    for c in np.arange(lo, hi, .5):
        r = int(min(c, gray.shape[1] - 1 - c)) - 1
        if r < 30: continue
        L = gray[:, int(round(c - r)):int(round(c))]; R = gray[:, int(round(c)):int(round(c + r))][:, ::-1]
        n = min(L.shape[1], R.shape[1]); d = np.abs(L[:, -n:] - R[:, -n:]).mean()
        if d < best[0]: best = (d, c)
    return best[1]
# release images of the three cards are cut through the card on the left in the supplied files: use hover instead
BROKEN_RELEASE = ['option_free_spins', 'option_super_free_spins', 'option_feature_max']
for c in controls:
    if c in BROKEN_RELEASE:
        Image.open(os.path.join(out, f'{c}_hover.png')).save(os.path.join(out, f'{c}_release.png'))
    n = np.asarray(Image.open(os.path.join(out, f'{c}_normal.png'))).astype(np.float32)
    g = n[..., :3].mean(-1) * (n[..., 3] / 255)
    ys, xs = np.where(n[..., 3] > 230); y0, y1 = ys.min(), ys.max()
    band = g[y0 + (y1 - y0) // 5: y1 - (y1 - y0) // 5]
    cx = centre(band, xs.min() + (xs.max() - xs.min()) * .35, xs.max() - (xs.max() - xs.min()) * .35)
    for st in ['normal', 'hover', 'pressed', 'release']:
        p = os.path.join(out, f'{c}_{st}.png'); a = np.asarray(Image.open(p)).copy(); A = a[..., 3]
        H, W = A.shape; cols = np.where((A > 25).any(0))[0]; rows = np.where((A > 25).any(1))[0]
        left = cols.min(); xr = 2 * cx - left
        solid = np.where((A > 230).any(1))[0]; top_glow = solid.min() - rows.min()
        yb = solid.max() + max(4, top_glow)
        yy, xx = np.mgrid[0:H, 0:W]
        d = np.maximum(np.maximum(xx - xr, yy - yb), 0)
        A2 = A * np.clip(1 - d / 2.5, 0, 1)
        # the supplied cards carry a dark opaque margin; mirror the left margin to the right of the card body, so the
        # neighbouring card that starts after the right margin is cut away
        Lum = a[..., :3].astype(np.float32).mean(-1); bright = ((A > 200) & (Lum > 80)).mean(0)
        bw = np.where(bright > .3)[0]; bl = bw.min() if len(bw) else left; br = 2 * cx - bl; margin = bl - left
        A2 = np.where(xx > br + margin + 1, 0, A2)
        a[..., 3] = A2.astype(np.uint8); Image.fromarray(a).save(p, optimize=True)
    print('trim', c, 'centre', cx)
    # a pressed image cut through the card on the left in the supplied file: use the normal image instead (the game
    # adds the 0.98 press scale the spec allows)
    sw = lambda st: (np.asarray(Image.open(os.path.join(out, f'{c}_{st}.png')))[..., 3] > 230).mean(0)
    wn = (sw('normal') > .3).sum(); wp = (sw('pressed') > .3).sum()   # after trimming
    if wp < .93 * wn:
        Image.open(os.path.join(out, f'{c}_normal.png')).save(os.path.join(out, f'{c}_pressed.png'))
        print('pressed replaced by normal:', c, wp, wn)
