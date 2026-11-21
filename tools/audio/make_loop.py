"""Game loops from Darshan's supplied music (2026-11-21). The music itself is not changed.

  python3 make_loop.py intro IN OUT.mp3 S E    -> plays from 0 once, then loops [S, E] (both found by measurement)
  python3 make_loop.py tail  IN OUT.mp3 S L    -> loops [S, S + L]; the reverb/decay after S + L is mixed onto the start

intro: the file is the track up to E; the last 60 ms before E are cross-faded into the music just before S, so the
       jump from E back to S is seamless. Manifest: { start: S, length: E - S, intro: true }.
tail:  a loop with its decay folded in, written with PRE s pre/post-roll. Manifest: { start: PRE, length: L }.
S, E and L are refined here to the best sample match (+/- 15 ms) of the waveform.
"""
import sys, subprocess
import numpy as np
from scipy.io import wavfile

mode, src, out = sys.argv[1:4]; a1, a2 = float(sys.argv[4]), float(sys.argv[5]); SR = 44100; PRE = .5
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', src, '-ac', '2', '-ar', str(SR), '-f', 'wav', '/tmp/_loop_in.wav'], check=True)
_, x = wavfile.read('/tmp/_loop_in.wav'); x = x.astype(np.float64) / 32768; m = x.mean(1)

def refine(p, q, n=2646, r=660):
    """shift q so that the n samples after q best match those after p"""
    seg = m[p:p + n]; best = max(range(q - r, q + r), key=lambda k: np.dot(m[k:k + n], seg) / (np.linalg.norm(m[k:k + n]) + 1e-9))
    return best

def encode(arr, path):
    wavfile.write('/tmp/_loop_out.wav', SR, (np.clip(arr, -1, 1) * 32767).astype(np.int16))
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', '/tmp/_loop_out.wav', '-codec:a', 'libmp3lame', '-b:a', '192k', path], check=True)

xf = int(.06 * SR); ramp = (.5 - .5 * np.cos(np.linspace(0, np.pi, xf)))[:, None]
if mode == 'intro':
    S = int(a1 * SR); E = refine(S, int(a2 * SR))
    y = x[:E].copy()
    y[E - xf:E] = x[E - xf:E] * (1 - ramp) + x[S - xf:S] * ramp          # arrive at E sounding like just before S
    encode(y, out)
    print(f'intro loop: plays 0-{E / SR:.4f}s, then loops {S / SR:.4f}-{E / SR:.4f}s (length {(E - S) / SR:.4f}s)')
else:
    S = int(a1 * SR); E = refine(S, int(round((a1 + a2) * SR))); L = E - S
    loop = x[S:E].copy(); tail = x[E:]; nt = min(len(tail), L)
    loop[:nt] += tail[:nt]                                                # the decay rings on into the next pass
    loop[:xf] = loop[:xf] * ramp + x[S - xf:S][::-1][:xf] * 0 * (1 - ramp) if S >= xf else loop[:xf]
    peak = np.abs(loop).max(); loop *= min(1, .98 / peak)
    Pn = int(PRE * SR); encode(np.concatenate([loop[-Pn:], loop, loop[:Pn]]), out)
    print(f'tail loop: {S / SR:.4f}s + {L / SR:.4f}s, tail {nt / SR:.2f}s folded in, gain {min(1, .98 / peak):.2f}')
