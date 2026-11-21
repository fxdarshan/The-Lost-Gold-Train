"""Prepare Darshan's simplified Buy Feature PNGs (Lost_Gold_Train_Buy_Feature_SIMPLE_FIXED.zip, 2026-11-21).

One PNG per control; artwork used as supplied (no scaling, no colour change). Only presentation-sheet leftovers are
removed: the file-name / state labels and the sheet header, and slivers of neighbouring items, i.e. opaque pieces
that are not the control itself. The chain extension is cut to a clean repeating tile of chain links (the supplied
strip repeats a sheet header every 134 px).

Usage: python3 clean_buy_ui_simple.py SRC_DIR OUT_DIR
"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
meta = {}

def keep_main(a, glow_max=12, body=False):
    """Keep the control and drop sheet leftovers.
    body=False: the control is the biggest opaque piece (filled), plus its soft glow up to the glow width seen on its
                top side. Used for the board, title and main button.
    body=True:  the control sits in a wide half-transparent halo that also holds the sheet's state label and a
                neighbour's edge, so the control is its fully opaque piece and only glow_max px of the halo is kept
                around it. Used for the three cards and the close button."""
    a = a.copy(); al = a[..., 3].astype(np.float32) / 255
    if body:
        solid = al > .97                     # the card itself is fully opaque; its orange halo and the labels are not
    else:
        solid = al > .6
    lab, n = ndimage.label(ndimage.binary_closing(solid, iterations=2)); sizes = np.bincount(lab.ravel()); sizes[0] = 0
    main = ndimage.binary_fill_holes(ndimage.binary_closing(lab == sizes.argmax(), iterations=6))
    if body:
        g = glow_max
    else:
        ys, xs = np.where(main); top = ys.min(); cx0, cx1 = xs.min(), xs.max()
        col = al[:top, cx0 + (cx1 - cx0) // 3: cx1 - (cx1 - cx0) // 3]
        rows = np.where((col > .03).any(1))[0]; g = min(glow_max, top - rows.min()) if len(rows) else 4
    dist = ndimage.distance_transform_edt(~main)
    keep = np.clip((g + 1.5 - dist) / 1.5, 0, 1)
    if not body:
        other = (al > .6) & ~main
        lab3, n3 = ndimage.label(other)
        for i in range(1, n3 + 1):
            piece = lab3 == i
            if piece.sum() > 25 and not (piece & ndimage.binary_dilation(main, iterations=2)).any(): keep[ndimage.binary_dilation(piece, iterations=3)] = 0
    a[..., 3] = (a[..., 3] * keep).astype(np.uint8)
    return a

def crop(a, pad=2):
    ys, xs = np.where(a[..., 3] > 6)
    return a[max(0, ys.min() - pad):ys.max() + 1 + pad, max(0, xs.min() - pad):xs.max() + 1 + pad]

for n in ['buy_free_spins_button', 'close_button', 'option_free_spins', 'option_super_free_spins', 'option_feature_max', 'popup_title_buy_free_spins']:
    a = np.asarray(Image.open(os.path.join(src, n + '.png')).convert('RGBA'))
    c = keep_main(a, glow_max=8 if n.startswith(('option', 'close', 'popup_title')) else 12, body=n.startswith(('option', 'close')))
    if n == 'popup_title_buy_free_spins':      # the sheet's header line above the sign
        r = np.where(((c[..., 3] > 230).sum(1)) > 250)[0][0]; c[:max(0, r - 12), :, 3] = 0
    c = crop(c); Image.fromarray(c).save(os.path.join(out, n + '.png'), optimize=True)
    meta[n] = list(c.shape[1::-1])

# board: the sheet header sits over the top of the left chain; cut the board just below it (the chain extension
# continues the chains above), then the usual leftovers
b = np.asarray(Image.open(os.path.join(src, 'popup_board.png')).convert('RGBA'))
rgb = b[..., :3].astype(np.float32); hdr = ((rgb.min(-1) > 200) & (b[..., 3] > 200)).sum(1)
rows = np.where(hdr[:80] > 2)[0]; cut = (rows.max() + 12) if len(rows) else 0
b2 = b.copy(); b2[:cut, :, 3] = 0
b2 = keep_main(b2, glow_max=16)
ys, xs = np.where(b2[..., 3] > 6); b2 = b2[cut:ys.max() + 3, max(0, xs.min() - 2):xs.max() + 3]
# the supplied board's planks are partly see-through (alpha down to 0 in places), so the reels showed through the
# popup: inside the board's own outline the alpha is made solid (colours untouched)
ab = b2[..., 3] > 200
body = ndimage.binary_fill_holes(ndimage.binary_closing(ab, iterations=8))
lab, k = ndimage.label(body); sz = np.bincount(lab.ravel()); sz[0] = 0; body = lab == sz.argmax()
body = ndimage.binary_erosion(body, iterations=2)
import cv2
holes = (body & (b2[..., 3] < 200)).astype(np.uint8)          # colour there is unreliable: fill it from around
rgbI = cv2.inpaint(np.ascontiguousarray(b2[..., :3]), holes, 5, cv2.INPAINT_TELEA)
aa = (b2[..., 3:4].astype(np.float32) / 255)
mix = (b2[..., :3] * aa + rgbI * (1 - aa)).astype(np.uint8)     # semi-transparent pixels keep their share of colour
b2[..., :3] = np.where(body[..., None], mix, b2[..., :3])
b2[..., 3] = np.where(body, 255, b2[..., 3])
Image.fromarray(b2).save(os.path.join(out, 'popup_board.png'), optimize=True)
# chain attachment points at the board's (new) top edge: centres of the two opaque runs in the top rows
top = (b2[:12, :, 3] > 150).any(0); lab, k = ndimage.label(top)
runs = sorted(((np.where(lab == i)[0].mean(), (lab == i).sum()) for i in range(1, k + 1)), key=lambda t: -t[1])
pts = [runs[0]] + [r for r in runs[1:] if abs(r[0] - runs[0][0]) > 100][:1]
meta['popup_board'] = {'size': list(b2.shape[1::-1]), 'chains_x': sorted(round(p[0], 1) for p in pts), 'cut_top': int(cut)}

# chain tile: one clean stretch between the repeated headers, cut to a whole number of link periods
e = np.asarray(Image.open(os.path.join(src, 'popup_chain_extension.png')).convert('RGBA')).astype(np.float32)
seg = e[30:132]; g = seg[..., :3].mean(-1) * seg[..., 3] / 255
per = min(range(24, 50), key=lambda p: np.abs(g[p:] - g[:-p]).mean())
best = min(range(0, 102 - 2 * per), key=lambda y: np.abs(g[y] - g[y + 2 * per]).mean())
tile = seg[best:best + 2 * per].astype(np.uint8)
# the strip sits on a half-transparent patch of the sheet: keep the chain links (lit gold) and a soft edge only
rgbT = tile[..., :3].astype(np.float32); satT = rgbT.max(-1) - rgbT.min(-1)
link = (rgbT.max(-1) > 165) & (satT > 60) & (tile[..., 3] > 150)
link = ndimage.binary_closing(link, iterations=2)
lab, k = ndimage.label(link); sz = np.bincount(lab.ravel()); sz[0] = 0
link = np.isin(lab, [i for i in range(1, k + 1) if sz[i] > 15])
soft = np.clip(1.5 - ndimage.distance_transform_edt(~link) / 1.2, 0, 1)
tile[..., 3] = (tile[..., 3] * soft).astype(np.uint8)
cols = np.where(tile[..., 3].max(0) > 6)[0]
Image.fromarray(tile).save(os.path.join(out, 'popup_chain_extension.png'), optimize=True)
cx = float((tile[..., 3].astype(np.float32) * np.arange(tile.shape[1])[None]).sum() / tile[..., 3].sum())
meta['popup_chain_extension'] = {'size': list(tile.shape[1::-1]), 'period': per, 'centre_x': round(cx, 1)}
print(json.dumps(meta))
