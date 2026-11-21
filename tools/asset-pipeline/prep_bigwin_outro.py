"""Prepare Darshan's Big Win screens and Free Spins outro pieces (2026-11-21 asset packs) for the game.

Big Win: the five screens are used as supplied (already transparent), saved as WebP.
Outro: the pieces are crops of a presentation sheet: opaque, on the sheet's dark background, with its labels.
- board_main / ribbon / gold_pile: the dark sheet background is keyed out (alpha from brightness against the
  sheet colour) and the label text removed (only the main piece is kept). The board's right edge is cut off in the
  supplied crop; the board is symmetric, so its left half is mirrored to complete it.
- bg_outro: the label strip and frame are cut away; the panorama is kept at its size (the game covers the screen).
Usage: python3 prep_bigwin_outro.py BIGWIN_DIR OUTRO_DIR REPO_ROOT
"""
import sys, os
import numpy as np
from PIL import Image
from scipy import ndimage

bw, fo, root = sys.argv[1:4]
for i, n in enumerate(['nice', 'big', 'mega', 'super', 'epic']):
    f = ['01_nice_win_screen', '02_big_win_screen', '03_mega_win_screen', '04_super_win_screen', '05_epic_win_screen'][i]
    Image.open(os.path.join(bw, f + '.png')).convert('RGBA').save(os.path.join(root, f'assets/images/banners/bigwin/bigwin_{n}.webp'), 'WEBP', quality=92, method=6)

def key_dark(a, lo=34, hi=80):
    """sheet background is near-black brown: alpha rises with brightness; colour un-premultiplied from black"""
    rgb = a[..., :3].astype(np.float32); v = rgb.max(-1)
    al = np.clip((v - lo) / (hi - lo), 0, 1)
    lab, k = ndimage.label(al > .5); sz = np.bincount(lab.ravel()); sz[0] = 0
    main = ndimage.binary_fill_holes(ndimage.binary_closing(lab == sz.argmax(), iterations=4))
    al = np.where(main, np.maximum(al, ndimage.binary_erosion(main, iterations=2)), al * ndimage.binary_dilation(main, iterations=3))
    out = np.dstack([rgb, al * 255]).clip(0, 255).astype(np.uint8)
    ys, xs = np.where(al > .02)
    return out[ys.min():ys.max() + 1, xs.min():xs.max() + 1]

for n in ['ribbon_free_spins', 'gold_pile']:
    a = np.asarray(Image.open(os.path.join(fo, n + '.png')).convert('RGBA'))
    Image.fromarray(key_dark(a)).save(os.path.join(root, f'assets/images/ui/outro/{n}.png'), optimize=True)

# board: drop the label rows (top) and caption (bottom), key, then mirror the left half (right edge is cropped)
a = np.asarray(Image.open(os.path.join(fo, 'board_main.png')).convert('RGBA')).copy()
a[:18] = 0; a[205:] = 0
b = key_dark(a)
h, w = b.shape[:2]
ys, xs = np.where(b[..., 3] > 200)
# centre of the board from its top rail: the leftmost solid column mirrored at the plaque centre
left = xs.min(); top_rows = b[:, :, 3] > 200
cx = left + (w - left) // 2 if b[:, -3:, 3].max() > 200 else (left + xs.max()) / 2
half = b[:, :int(round(cx))]
full = np.concatenate([half, half[:, ::-1]], axis=1)
Image.fromarray(full).save(os.path.join(root, 'assets/images/ui/outro/board_main.png'), optimize=True)

bg = np.asarray(Image.open(os.path.join(fo, 'bg_outro.png')).convert('RGB'))
Image.fromarray(bg[48:162, 10:561]).save(os.path.join(root, 'assets/images/ui/outro/bg_outro.webp'), 'WEBP', quality=92)
print('done', full.shape)
