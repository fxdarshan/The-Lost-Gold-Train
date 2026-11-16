# Key-pose sprite sheet prompt: The Outlaw (template for every symbol)

Written 2026-11-16 after Darshan's note: "symbol animations are not good … they just play without any interesting animation flow or soul."

## Why the current loops feel flat
- The 16 keys in the current sheets are evenly spaced "variations" (a glow here, a sparkle there), not a performance. There is no anticipation, no strong action, no overshoot, no hold, so the in-betweens just drift from picture to picture.
- Every key gets the same screen time, about 5 frames each. Real animation lives in timing: fast actions (2–3 frames) and long holds on the readable poses (8–10 frames).
- Keys are redrawn independently, so the scale, the light and small details drift. Flow interpolation turns that drift into wobble.

The prompt below fixes the first and third points: a story with acting beats, and strict consistency rules. The timing chart fixes the second: `anim_from_keys.py` will be given these per-key durations instead of equal spacing.

## Prompt (paste with the Outlaw symbol image attached as the reference)

> Create a **4×4 sprite sheet of 16 key poses** for a slot-machine symbol win animation, using the attached image as the exact character, framing and tile. Sheet 2400×1792 px, 16 equal cells of 600×448 px, read left to right, top to bottom, with thin dark gutters between cells and no text, numbers or labels.
>
> **Locked in every cell (most important):** same tile, frame, rivets and painted background, pixel-identical; same camera, zoom and crop; the character's head stays the same size and his feet and body stay in the same place unless the action moves them. Same watercolour Western style, line weight, palette and lighting as the reference. Only the acting changes. Nothing may leave the tile.
>
> **The performance: "The Outlaw's quick draw"**
> 1. **Idle**: identical to the reference image.
> 2. **Anticipation**: eyes narrow, head tilts down slightly, a breath in, shoulders rise a little.
> 3. **Wind-up**: the shooting hand drops to the holster, shoulders dip, body coils (squash).
> 4. **Draw (smear)**: arm and revolver whip up in a fast curved motion-blur smear; the hat brim lifts from the speed.
> 5. **Aim (extreme)**: revolver pointed straight at the viewer, barrel foreshortened large, steely stare, body stretched tall.
> 6. **Fire**: bright muzzle flash and spark burst in front of the barrel, recoil kicks the hand up, coat flaps.
> 7. **Recoil settle**: arm lowers a little, a thin curl of smoke rises from the barrel.
> 8. **Cool beat**: he brings the barrel near his lips and blows the smoke away, one eyebrow raised, smirk.
> 9. **Spin 1**: revolver spinning on his trigger finger, circular motion-blur ring.
> 10. **Spin 2**: the spin continues at a different angle; a glint of light runs along the barrel.
> 11. **Holster**: revolver slides back into the holster, shoulder dips, follow-through on the coat.
> 12. **The sell (hold)**: he tips his hat brim with two fingers, wide confident grin, a wink; a small gold sparkle on his tooth or belt buckle.
> 13. **Glint**: hat back in place, a warm gold glint travels across the hat band.
> 14. **Overshoot**: he settles back with a tiny bounce, slightly lower than idle.
> 15. **Breath out**: nearly identical to idle, shoulders relaxed.
> 16. **Loop**: identical to cell 1.
>
> Clear silhouettes, strong readable poses, exaggerated acting like premium slot symbols (Pragmatic Play / NetEnt quality). No extra characters, no text, no UI.

## Timing chart (frames at 30 fps, 75 frames = 2.5 s)

| Key | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Frames | 6 | 4 | 3 | 2 | 3 | 3 | 5 | 8 | 3 | 3 | 4 | 10 | 6 | 5 | 5 | 5 |

Fast on the draw, fire and spin (2–3 frames); long holds on the readable beats: the smoke blow (8) and the hat-tip grin (10).

## Using it for other symbols
Keep the structure: **idle, anticipation, wind-up, action (smear), extreme, impact or FX, follow-through, hold the sell, settle with a small overshoot, back to idle**. Change only the story. Examples:
- **Dynamite:** clock ticks → fuse sparks → bundle swells (squash) → BOOM flash → smoke clears → bundle pops back with a bounce → clock hands spin back to 12.
- **Steam Train:** headlight flickers on → wheels brace → lurches toward the viewer (stretch) → whistle blast of steam → screech back with an overshoot.
- **Card ranks (A–10):** squash down → spring up taller → gold light sweeps left to right → sparkle on a corner → settle with a small bounce. Keep these short and simple (lower symbols).

## Prototype implementation status
- 2026-11-16: Darshan generated the Outlaw sheet with this prompt in Gemini (`assets/source/originals/anims/v2/`). It is in the game as `sym_00_win`; its pose 1 is the new Outlaw idle art.
- `anim_from_keys.py --timing 6,4,3,2,3,3,5,8,3,3,4,10,6,5,5,5 --mode motion --settle 16`: each key holds, then moves into the next over its last 1–3 frames (fast keys snap, long keys hold).
- Known: poses 13–15 hide the revolver under the poncho, so the gun briefly disappears near the end of the loop; a few one-frame in-betweens between very different drawings (the draw, the holster) are slightly smeared, which reads as motion blur at speed.
