"""Prepare Darshan's clean Buy Feature PNGs (Lost_Gold_Train_Buy_Feature_CLEAN_FINAL.zip, 2026-11-21).

The artwork is used as supplied (no scaling, no colour change). The only clean-up: slivers of neighbouring items that
sit at the edges of some PNGs (opaque pieces not connected to the control) are removed, then the image is trimmed.

Usage: python3 clean_buy_ui_final.py SRC_DIR OUT_DIR
"""
import sys, os, json
import numpy as np
from PIL import Image
from scipy import ndimage

src, out = sys.argv[1], sys.argv[2]; os.makedirs(out, exist_ok=True)
meta = {}
for n in ['buy_free_spins_button', 'popup_board_with_title', 'option_free_spins', 'option_super_free_spins', 'option_feature_max', 'close_button']:
    a = np.asarray(Image.open(os.path.join(src, n + '.png')).convert('RGBA')).copy()
    vis = a[..., 3] > 8
    lab, k = ndimage.label(ndimage.binary_closing(vis, iterations=2)); sz = np.bincount(lab.ravel()); sz[0] = 0
    keep = lab == sz.argmax()                                          # the control (with its own soft edge)
    a[..., 3] = (a[..., 3] * ndimage.binary_dilation(keep, iterations=1)).astype(np.uint8)
    ys, xs = np.where(a[..., 3] > 4)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    Image.fromarray(a).save(os.path.join(out, n + '.png'), optimize=True)
    meta[n] = {'size': list(a.shape[1::-1]), 'dropped_pieces': int(k - 1)}
print(json.dumps(meta))
