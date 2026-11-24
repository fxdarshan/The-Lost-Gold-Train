# Loading screen: Google Stitch prompt

Written 2026-11-24 for Darshan, to design a more thematic loading screen. The current one (`src/splash.js`) is the base game background, the logo, a plain bar and rotating status lines (`CONFIG.texts.loading`).

Attach in Stitch: `art/ui/ui_splash_logo.png` (logo), `assets/source/originals/transitions/trans_a_keyart.png` (night train key art), `docs/art-reference/ref_02_last_train_gold_watercolour.png` (style).

The feature lines are taken from the game: expanding symbols in free spins, Power Dynamite, and the 5,500× max win (`CONFIG.maxWin`). "CLICK TO RIDE" and "ALL ABOARD" are ASSUMED wording.

```text
Design a premium LOADING SCREEN for "The Lost Gold Train", a Wild West slot game (Pragmatic Play quality). Desktop landscape, 1920x1080, one screen. Use the attached images: the game logo, the night train key art (Outlaw on horseback chasing the gold train) and the watercolour style reference. The screen must look hand-painted and cinematic, part of the game world, not a generic web page.

MOOD: night heist on the desert railroad: danger, adventure, gold. Like the opening title of a Western action movie.

LAYOUT (top to bottom):
1. BACKGROUND: the attached night train key art full screen, softly darkened at the edges with a vignette and a dark gradient at the bottom so text reads clearly. Moon glow top right, faint drifting dust and embers.
2. TOP BAR (thin, transparent): left, a small sheriff-star icon and "ALL ABOARD" in small caps; right, two round brass-rimmed icon buttons: sound on/off and fullscreen.
3. LOGO: the attached game logo, large, centred in the upper third, with a warm gold glow behind it and a subtle shadow so it stands out from the art.
4. FEATURE TEASERS: three small parchment cards on wood frames with brass corner rivets, in a row under the logo, each with an icon and two short lines:
   - Sheriff badge icon: "EXPANDING SYMBOLS" / "One symbol takes the reels in free spins"
   - Dynamite icon: "POWER DYNAMITE" / "Blasts in bigger wins"
   - Gold bars icon: "WIN UP TO 5,500x" / "Ride the gold train"
5. LOADING BAR (the hero element, bottom third, about 60% of the width, centred): a railway track seen from the side (wooden sleepers and iron rails). The progress fill is glowing molten gold running along the rails from left to right. A small black steam locomotive sits at the front of the fill, puffing steam, as the progress marker. Brass end caps on both sides of the track.
6. STATUS LINE above the bar: a rotating status message in a Western font, left aligned, e.g. "Stoking the Engine...", with the percentage "64%" right aligned in gold.
7. READY STATE (show as a second variant of the same screen): the bar full, the locomotive at the right end, and the status replaced by a pulsing button "CLICK TO RIDE" (wooden sign with gold lettering and a brass frame).
8. FOOTER: tiny centred line "18+ Play responsibly" in light grey.

STYLE: hand-painted watercolour and ink, dark-brown ink outlines, paper grain. Palette: night indigo and teal backgrounds; warm gold (#F2B13A to #FFD66B) for progress, highlights and key text; aged parchment (#EAD7B0) for cards; dark wood (#3B2414) for frames; brass (#B8893A) for rims and caps; deep red (#9E2B25) for small accents only. Typography: a bold slab-serif Western display face (like Rye or Ultra) for headings and the button; a clean, readable serif (like Bitter) for small text. Strong contrast; all text readable on the art.

DETAILS: soft gold glows, a subtle light sweep across the logo, steam puffs from the small locomotive, wood grain and rivets on frames, slight worn edges on parchment. Keep the centre clear and uncluttered; generous spacing.

DO NOT: use flat modern web UI, plain grey progress bars, neon colours, glassmorphism, emojis, photographs, stock icons in a different style, cartoon or anime style, or extra text, prices, menus or navigation. Do not redraw or change the logo. Do not cover the Outlaw and the train with UI; keep the cards and bar inside the darker areas.

OUTPUT: two frames of the same screen, "Loading (64%)" and "Ready (Click to Ride)", plus a mobile portrait version (390x844) with the logo on top, the three cards stacked smaller, and the track loading bar near the bottom.
```

## Prototype implementation status
- Prompt only. When the Stitch design comes back, rebuild `src/splash.js` and its CSS to match, re-using the game's art.
