"""Original music for The Lost Gold Train, composed and synthesised in code (no samples, no third-party material).

  python3 tools/audio/compose_music.py            -> assets/audio/bgm_basegame_loop.mp3, bgm_freegame_loop.mp3

Base game: "Dust on the Rails" - A minor, 92 BPM, 16 bars. Whistled lead (spaghetti-western), galloping nylon
guitar, plucked bass, brushed snare and hoof clip-clops, a distant bell, warm room reverb.
Free spins: "Gold Rush Express" - A minor, 128 BPM, 16 bars. Brass lead, choir pad, train-rhythm snare, driving
bass ostinato, timpani, strummed guitar, whip cracks at the phrase starts.

Loops are seamless: every voice is rendered on a circular timeline (tails wrap to the start) and the file carries
PRE seconds of the loop's end before it and PRE seconds of its start after it. The game loops the region
[PRE, PRE + loop length] (C.music), so encoder padding never causes a click.
"""
import os, subprocess
import numpy as np
from scipy import signal

SR = 44100
PRE = 0.5
rng = np.random.default_rng(7)
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..')
NOTE = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}

def hz(n):
    """'A4', 'G#5', 'Bb3' -> frequency"""
    s = NOTE[n[0]]; i = 1
    if n[i] == '#': s += 1; i += 1
    elif n[i] == 'b': s -= 1; i += 1
    return 440.0 * 2 ** ((s + 12 * (int(n[i:]) - 4)) / 12)

class Track:
    """a circular stereo buffer of one loop"""
    def __init__(self, seconds):
        self.n = int(round(seconds * SR)); self.buf = np.zeros((2, self.n))
    def add(self, x, t, gain=1.0, pan=0.0):
        i0 = int(round(t * SR)) % self.n; L = len(x)
        l, r = gain * np.cos((pan + 1) * np.pi / 4), gain * np.sin((pan + 1) * np.pi / 4)
        idx = (np.arange(L) + i0) % self.n
        np.add.at(self.buf[0], idx, x * l * 1.414); np.add.at(self.buf[1], idx, x * r * 1.414)

def env_adsr(L, a=.005, d=.1, s=.6, r=.1, hold=None):
    t = np.arange(L) / SR; hold = hold if hold is not None else L / SR - r
    e = np.where(t < a, t / max(a, 1e-4), np.where(t < a + d, 1 - (1 - s) * (t - a) / max(d, 1e-4), s))
    return e * np.clip(1 - (t - hold) / max(r, 1e-4), 0, 1)

# ---------------------------------------------------------------- instruments
def pluck(f, dur, bright=.5, decay=.996):
    """Karplus-Strong string (vectorised period by period)"""
    N = max(2, int(round(SR / f))); L = int(dur * SR) + N
    y = np.zeros(L); burst = rng.uniform(-1, 1, N)
    burst = signal.lfilter([bright, 1 - bright], [1], burst); y[:N] = burst
    k = N
    while k < L:
        e = min(L, k + N); idx = np.arange(k, e)
        y[k:e] = decay * .5 * (y[idx - N] + y[np.maximum(idx - N - 1, 0)])
        k = e
    y = y[N:]; y *= env_adsr(len(y), .001, .0, 1, .05)
    return y / (np.abs(y).max() + 1e-9)

def whistle(f, dur, glide_from=None):
    L = int(dur * SR); t = np.arange(L) / SR
    vib = 1 + .009 * np.sin(2 * np.pi * 5.6 * t) * np.clip((t - .18) / .25, 0, 1)
    ff = np.full(L, f)
    if glide_from: g = np.clip(t / .07, 0, 1); ff = glide_from * (f / glide_from) ** g
    ph = 2 * np.pi * np.cumsum(ff * vib) / SR
    x = np.sin(ph) + .06 * np.sin(2 * ph) + .02 * np.sin(3 * ph)
    breath = signal.lfilter(*signal.butter(2, [f * .9 / (SR / 2), min(.95, f * 1.3 / (SR / 2))], 'band'), rng.normal(0, 1, L)) * .05
    return (x + breath) * env_adsr(L, .04, .1, .85, min(.12, dur * .3))

def brass(f, dur, bright=1.0):
    L = int(dur * SR); t = np.arange(L) / SR
    vib = 1 + .006 * np.sin(2 * np.pi * 5.2 * t) * np.clip((t - .2) / .3, 0, 1)
    out = np.zeros(L)
    for det in (-.004, 0, .005):
        ph = np.cumsum(f * (1 + det) * vib) / SR
        out += 2 * (ph % 1) - 1
    e = env_adsr(L, .03, .15, .8, min(.1, dur * .25))
    cut = np.clip(700 + 3800 * bright * (e ** 1.5), 300, 9000)        # brass: brighter as it gets louder
    y = np.zeros(L); z = 0.0; a = np.exp(-2 * np.pi * cut / SR)
    for i in range(0, L, 64):                                          # block-wise one-pole with moving cutoff
        b = out[i:i + 64]; zz, _ = signal.lfilter([1 - a[i]], [1, -a[i]], b, zi=[z * a[i]]); y[i:i + 64] = zz; z = zz[-1] if len(zz) else z
    y = signal.lfilter([1 - .6], [1, -.6], y)
    return y * e * .5

def choir(freqs, dur):
    L = int(dur * SR); t = np.arange(L) / SR; out = np.zeros(L)
    for f in freqs:
        for det in (-.006, .0, .007):
            ph = np.cumsum(np.full(L, f * (1 + det)) * (1 + .004 * np.sin(2 * np.pi * (4.7 + det * 100) * t))) / SR
            out += 2 * (ph % 1) - 1
    y = np.zeros(L)
    for fc, q, g in ((700, 5, 1.0), (1220, 6, .6), (2600, 8, .25)):     # "ah" formants
        b, a = signal.iirpeak(fc / (SR / 2), q); y += g * signal.lfilter(b, a, out)
    return y * env_adsr(L, .35, .2, .9, .6) / (len(freqs) * 3)

def bass(f, dur):
    L = int(dur * SR); t = np.arange(L) / SR
    x = np.sin(2 * np.pi * f * t) + .35 * np.sin(4 * np.pi * f * t) + .1 * np.sin(6 * np.pi * f * t)
    return x * np.exp(-t * 3.5) * env_adsr(L, .004, 0, 1, .05)

def kick(dur=.35):
    L = int(dur * SR); t = np.arange(L) / SR
    f = 50 + 90 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)

def timpani(f, dur=1.2):
    L = int(dur * SR); t = np.arange(L) / SR
    x = sum(a * np.sin(2 * np.pi * f * m * t) for m, a in ((1, 1), (1.5, .5), (1.98, .3), (2.44, .15)))
    hit = signal.lfilter(*signal.butter(2, 400 / (SR / 2)), rng.normal(0, 1, L)) * np.exp(-t * 40) * .6
    return (x * np.exp(-t * 3) + hit) * .7

def snare(dur=.16, brush=True):
    L = int(dur * SR); t = np.arange(L) / SR; n = rng.normal(0, 1, L)
    if brush: n = signal.lfilter(*signal.butter(2, [1500 / (SR / 2), 7000 / (SR / 2)], 'band'), n); return n * np.exp(-t * 28) * .7
    n = signal.lfilter(*signal.butter(2, 900 / (SR / 2), 'high'), n)
    return (n * np.exp(-t * 22) + .5 * np.sin(2 * np.pi * 190 * t) * np.exp(-t * 30)) * .8

def shaker(dur=.06):
    L = int(dur * SR); t = np.arange(L) / SR
    return signal.lfilter(*signal.butter(2, 6000 / (SR / 2), 'high'), rng.normal(0, 1, L)) * np.exp(-t * 60) * .5

def hoof(dur=.07, f=900):
    L = int(dur * SR); t = np.arange(L) / SR
    n = signal.lfilter(*signal.butter(2, [f * .6 / (SR / 2), f * 1.6 / (SR / 2)], 'band'), rng.normal(0, 1, L))
    return (n * 2 + np.sin(2 * np.pi * f * .5 * t)) * np.exp(-t * 70) * .5

def bell(f, dur=2.5):
    L = int(dur * SR); t = np.arange(L) / SR
    return sum(a * np.sin(2 * np.pi * f * m * t) * np.exp(-t * d) for m, a, d in ((1, 1, 1.6), (2.76, .5, 2.6), (5.4, .25, 4), (8.9, .12, 6))) * .4

def whip(dur=.35):
    L = int(dur * SR); t = np.arange(L) / SR; n = rng.normal(0, 1, L)
    f = signal.lfilter(*signal.butter(2, [2500 / (SR / 2), 9000 / (SR / 2)], 'band'), n)
    crack = np.exp(-((t - .12) / .006) ** 2) * 3
    return f * (np.exp(-((t - .1) / .05) ** 2) * .4 + crack)

def reverb(x, seconds=1.6, mix=.22, pre=.012):
    """stereo convolution with a decaying-noise impulse; circular so the tail wraps into the loop start"""
    L = int(seconds * SR); t = np.arange(L) / SR
    out = x.copy()
    for ch in range(2):
        ir = rng.normal(0, 1, L) * np.exp(-t * 6.9 / seconds)
        ir = signal.lfilter(*signal.butter(1, 5200 / (SR / 2)), ir); ir[:int(pre * SR)] = 0; ir /= np.sqrt((ir ** 2).sum())
        wet = signal.fftconvolve(np.concatenate([x[ch], x[ch][:L]]), ir)[:len(x[ch]) + L]
        w = wet[:len(x[ch])].copy(); w[:L] += wet[len(x[ch]):len(x[ch]) + L]          # wrap the tail
        out[ch] = x[ch] + mix * w
    return out

# ---------------------------------------------------------------- arrangement helpers
def chord_tones(name, octave=3):
    root = name.rstrip('m7'); minor = name.endswith('m') or name.endswith('m7')
    base = {'A': 'A', 'C': 'C', 'D': 'D', 'E': 'E', 'F': 'F', 'G': 'G'}[root[0]] + root[1:]
    r = hz(base + str(octave)); third = r * 2 ** ((3 if minor else 4) / 12); fifth = r * 2 ** (7 / 12)
    return r, third, fifth

def place_melody(tr, mel, beat, start, voice, gain, pan, octave_glide=True):
    t = start; prev = None
    for n, d in mel:
        if n != 'r':
            f = hz(n); x = voice(f, d * beat * .97, glide_from=prev) if voice is whistle else voice(f, d * beat * .95)
            tr.add(x, t, gain, pan); prev = f
        t += d * beat

def render(tr, name, bars, bpm):
    x = tr.buf
    x = reverb(x)
    x = x / (np.abs(x).max() + 1e-9) * .98
    x = np.tanh(x * 1.6) / np.tanh(1.6)                                   # gentle glue
    x *= .89
    P = int(PRE * SR)
    full = np.concatenate([x[:, -P:], x, x[:, :P]], axis=1)
    os.makedirs(os.path.join(ROOT, 'assets/audio'), exist_ok=True)
    wav = f'/tmp/{name}.wav'
    from scipy.io import wavfile
    wavfile.write(wav, SR, (full.T * 32767).astype(np.int16))
    mp3 = os.path.join(ROOT, f'assets/audio/{name}.mp3')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-codec:a', 'libmp3lame', '-b:a', '160k', mp3], check=True)
    print(name, f'{tr.n / SR:.3f}s loop, {bars} bars at {bpm} BPM ->', mp3, os.path.getsize(mp3) // 1024, 'KB')
    return tr.n / SR

# ---------------------------------------------------------------- base game: "Dust on the Rails"
def base_game():
    bpm = 92; beat = 60 / bpm; bars = 16; tr = Track(bars * 4 * beat)
    chords = ['Am', 'Am', 'G', 'Am', 'F', 'G', 'Am', 'E', 'Am', 'Am', 'Dm', 'Am', 'F', 'G', 'E', 'Am']
    for b, c in enumerate(chords):
        t0 = b * 4 * beat; r, th, fi = chord_tones(c, 3)
        # galloping guitar: (eighth, two sixteenths) x4 on chord tones
        pat = [r * 2, fi, th * 2, fi * 2, r * 2, th * 2]
        k = 0
        for q in range(4):
            for off, dur, acc in ((0, .5, 1), (.5, .25, .7), (.75, .25, .75)):
                f = pat[k % len(pat)]; k += 1
                tr.add(pluck(f, .6, .55, .995), t0 + (q + off) * beat, .3 * acc, -.35)
        # bass on 1 and 3 (root, fifth)
        tr.add(bass(r / 2, beat * 1.8), t0, .32, 0); tr.add(bass(fi / 2, beat * 1.8), t0 + 2 * beat, .26, 0)
        # brushes on 2 and 4, shaker on eighths, hooves like a trotting horse
        for q in range(4):
            if q in (1, 3): tr.add(snare(.18), t0 + q * beat, .22, .1)
            tr.add(shaker(), t0 + q * beat + beat / 2, .1, .5)
            tr.add(hoof(.06, 1000), t0 + q * beat + beat * .75, .14, -.6); tr.add(hoof(.06, 820), t0 + q * beat + beat, .12, -.6) if q < 3 else None
        if b % 4 == 0: tr.add(kick(), t0, .35, 0)
    # a distant mission bell at the top of each 8-bar phrase
    for b in (0, 8): tr.add(bell(hz('E5'), 3.0), b * 4 * beat, .09, .5)
    mel = [('E5', 2), ('A5', 1), ('B5', 1), ('C6', 1.5), ('B5', .5), ('A5', 2), ('G5', 1), ('E5', 1), ('D5', 1), ('E5', 1), ('A4', 4),
           ('F5', 2), ('E5', 1), ('D5', 1), ('D5', 1.5), ('E5', .5), ('G5', 2), ('E5', 1), ('C5', 1), ('B4', 1), ('C5', 1), ('B4', 2), ('E5', 2),
           ('A5', 3), ('G5', 1), ('E5', 2), ('D5', 1), ('C5', 1), ('D5', 2), ('F5', 1), ('A5', 1), ('E5', 4),
           ('F5', 1), ('E5', 1), ('F5', 1), ('A5', 1), ('G5', 2), ('F5', 1), ('E5', 1), ('B5', 2), ('G#5', 2), ('A5', 3.5), ('r', .5)]
    place_melody(tr, mel, beat, 0, whistle, .3, .15)
    return render(tr, 'bgm_basegame_loop', bars, bpm)

# ---------------------------------------------------------------- free spins: "Gold Rush Express"
def free_spins():
    bpm = 128; beat = 60 / bpm; bars = 16; tr = Track(bars * 4 * beat)
    chords = ['Am', 'F', 'G', 'E', 'Am', 'F', 'Dm', 'E', 'Am', 'C', 'G', 'E', 'F', 'G', 'E', 'Am']
    for b, c in enumerate(chords):
        t0 = b * 4 * beat; r, th, fi = chord_tones(c, 3)
        # driving bass ostinato in eighths: root root fifth root
        for e8, f in enumerate([r, r, fi, r] * 2):
            tr.add(bass(f / 2, beat * .48), t0 + e8 * beat / 2, .24 if e8 % 2 == 0 else .17, 0)
        # train rhythm: brushed sixteenths with accents on the "chug"
        for s16 in range(16):
            acc = 1.0 if s16 % 4 == 0 else .55 if s16 % 2 == 0 else .35
            tr.add(snare(.09), t0 + s16 * beat / 4, .16 * acc, .15)
        tr.add(snare(.2, brush=False), t0 + beat, .2, -.05); tr.add(snare(.2, brush=False), t0 + 3 * beat, .2, -.05)
        tr.add(kick(), t0, .42, 0); tr.add(kick(), t0 + 2 * beat, .35, 0)
        # strummed guitar on the off-beats
        for q in range(4):
            for j, f in enumerate([r * 2, fi * 2, th * 4]):
                tr.add(pluck(f, .35, .7, .992), t0 + (q + .5) * beat + j * .012, .2, .45)
        # choir pad holding the chord (second half louder)
        tr.add(choir([r * 2, th * 2, fi * 2], 4 * beat * 1.02), t0, 1.5 if b >= 8 else .9, -.2)
        if b % 4 == 0:
            tr.add(timpani(r / 2), t0, .28, 0)
            if b in (0, 8): tr.add(whip(), t0 - .12, .12, .6)
    tr.add(timpani(hz('E2'), 1.5), 15 * 4 * beat - 2 * beat, .22, 0)
    mel = [('A4', 1.5), ('C5', .5), ('E5', 2), ('F5', 1.5), ('E5', .5), ('C5', 2), ('D5', 1), ('B4', 1), ('G4', 1), ('B4', 1), ('E5', 4),
           ('A5', 1.5), ('G5', .5), ('E5', 2), ('F5', 1), ('E5', 1), ('D5', 1), ('C5', 1), ('D5', 2), ('F5', 1), ('A5', 1), ('G#5', 2), ('B5', 2),
           ('E5', 1), ('A5', 1), ('C6', 2), ('E5', 1), ('G5', 1), ('C6', 2), ('B5', 1.5), ('A5', .5), ('G5', 2), ('G#5', 2), ('E5', 2),
           ('A5', 1.5), ('G5', .5), ('F5', 1), ('A5', 1), ('B5', 1.5), ('A5', .5), ('G5', 2), ('G#5', 1), ('B5', 1), ('E5', 2), ('A5', 3.5), ('r', .5)]
    place_melody(tr, mel, beat, 0, brass, .55, -.1)
    return render(tr, 'bgm_freegame_loop', bars, bpm)

if __name__ == '__main__':
    a = base_game(); b = free_spins()
    print(f"C.music loops: base {a:.4f}s, free spins {b:.4f}s, pre-roll {PRE}s")
