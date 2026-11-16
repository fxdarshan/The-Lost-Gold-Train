# Symbol animation prompt (Darshan, 2026-11-16)

> Darshan's brief for turning the 16 key-pose sprite sheets into 45-frame animations. Supplied text below, unchanged; implementation status at the end.

For Claude, I’d make the prompt very explicit about the difference between the **16 Gemini key poses** and the **final 45 animation frames**. The biggest risk is Claude treating each source image as a hard frame and causing position drift, scale pumping, or wobble.

Use this as the **master prompt for the Gold Bars**, and the structure can later be reused for every symbol.

Use the attached 4×4 spritesheet as the ONLY visual source for this animation.

The spritesheet contains exactly **16 sequential key poses**, ordered **left-to-right, top-to-bottom**.

Create the final animation at:

- **45 total frames**
- **30 FPS**
- **1.5 seconds duration**
- Smooth, premium slot-game quality
- Seamless loop

## CRITICAL — PRESERVE THE ORIGINAL ART

Do NOT redraw, redesign, reinterpret, restyle, recolor, enhance, simplify, sharpen, or modify the symbol artwork.

Preserve exactly:
- Gold-bar design and arrangement
- Shape and proportions
- Art direction
- Rendering style
- Colors
- Lighting
- Textures
- Outlines
- Perspective
- Background
- Symbol scale

The supplied spritesheet defines the approved artwork.

## POSITION LOCK

The gold-bar stack must remain **perfectly anchored to the same position throughout all 45 frames**.

Do NOT introduce:
- Position drift
- Unintended translation
- Wobbling
- Shaking
- Floating
- Scale pumping
- Unintended rotation
- Camera movement
- Zoom
- Reframing
- Perspective changes

Use a fixed registration/anchor point based on the neutral first pose.

Any movement is allowed ONLY when clearly represented by the supplied key poses.

Do not invent additional object movement.

## USING THE 16 KEY POSES

Read the 16 images sequentially:

Row 1: poses 1–4  
Row 2: poses 5–8  
Row 3: poses 9–12  
Row 4: poses 13–16

These are **key poses**, NOT the final animation frames.

Interpolate them into a smooth **45-frame animation**.

Do not simply hold or repeat each key pose for several frames.

Generate smooth in-between motion between poses while preserving the original artwork.

Use natural animation curves:
- Ease-in
- Smooth acceleration
- Ease-out
- Controlled peak
- Smooth recovery

Avoid linear or robotic interpolation.

## GOLD BAR ANIMATION

The animation is primarily a **premium light/shimmer animation**.

The physical gold-bar stack should remain almost completely stable.

Follow the supplied key poses to animate:
1. Initial neutral gold
2. Warm highlight gradually building
3. Highlight travelling naturally across the gold surfaces
4. Controlled bright glints appearing on selected edges
5. Peak premium golden shine
6. Shine travelling away
7. Light intensity gradually reducing
8. Return to the original neutral state

Do NOT make the gold bars bounce, float, shake or wobble.

If the key poses contain tiny settling movement, keep it extremely subtle and weighty.

The gold must feel **heavy and valuable**.

## LIGHTING CONTINUITY

Shimmer and glints must travel smoothly across the existing surfaces.

Do not make highlights randomly teleport between locations.

A highlight visible in one frame should logically travel into the next frame.

Avoid:
- Flickering
- Flashing exposure
- Random brightness changes
- Changing base colors
- Changing shadows
- Unmotivated glow

Glints should appear quickly but still have a short build → peak → decay.

## FRAME PACING

Use approximately:

**Frames 1–5**  
Neutral hold and very subtle anticipation.

**Frames 6–15**  
Golden highlight gradually develops and begins travelling.

**Frames 16–25**  
Main shimmer movement and controlled glints.

**Frames 26–31**  
Peak premium shine.

**Frames 32–40**  
Highlight and glints smoothly decay.

**Frames 41–45**  
Return precisely toward the original neutral appearance.

Do not force this timing if it contradicts the supplied key poses; the visual sequence in the spritesheet has priority.

## LOOP REQUIREMENT

The animation must loop seamlessly.

**Frame 45 must transition naturally into Frame 1.**

There must be no visible:
- Jump
- Pop
- Position shift
- Scale change
- Lighting discontinuity
- Background shift

Frame 45 should closely approach the neutral state of Frame 1 while preserving enough motion continuity for the loop.

Do not simply duplicate Frame 1 as Frame 45 if doing so causes the motion to visibly stop.

## BACKGROUND LOCK

The background must remain completely static.

Do NOT animate:
- Background texture
- Border/frame
- Corners
- Screws
- Surface behind the gold
- Overall lighting of the complete image

Only animate elements explicitly represented by the symbol animation.

## INTERPOLATION QUALITY

When creating in-between frames:
- Preserve crisp original linework
- Preserve texture detail
- Preserve object boundaries
- Prevent morphing
- Prevent edge crawling
- Prevent texture swimming
- Prevent ghosting
- Prevent double images
- Prevent deformation
- Prevent AI-generated detail changes between frames

Every frame should look like the **same original artwork at a different animation moment**, not a newly generated image.

## FINAL QUALITY CHECK

Before output, verify all 45 frames sequentially.

Confirm:
1. Exactly 45 frames
2. Exactly 30 FPS
3. Total duration 1.5 seconds
4. Symbol remains registered to the same anchor
5. No unintended wobble or position drift
6. No scale changes
7. No camera movement
8. No artwork distortion
9. No color/style changes
10. No flickering
11. Smooth interpolation between all 16 source poses
12. Highlights move continuously rather than teleporting
13. Background remains static
14. Animation returns naturally to neutral
15. Frame 45 loops smoothly into Frame 1

The final result should feel like a **professionally animated premium slot-game symbol**, using the supplied 16 images as approved key artwork.

One rule I would keep in **every Claude symbol prompt** is the **POSITION LOCK** section. For symbols such as the revolver, Wanted poster, lantern, character, train, etc., we can then explicitly override it only for the parts that are supposed to move. This should prevent Claude from interpreting normal interpolation as permission to move the entire symbol.

## Prototype implementation status
Tool: `tools/asset-pipeline/anim_from_keys.py` (sheets kept in `assets/source/originals/anims/`).

| Symbol | In game | Options | How the brief is met |
| --- | --- | --- | --- |
| The Outlaw (`sym_00_win`) | yes | `motion --settle 13` | Keys aligned to pose 1 on the tile frame; in-betweens follow dense optical flow (no cross-fade). The gun-to-grin change is too big for flow, so it switches in under a frame; a dissolve was tried and ghosted. |
| Steam Train (`sym_01_win`) | yes (since the full symbol set) | `motion --settle 13` | Smoke and steam build and clear. |
| Gold Bars (`sym_02_win`) | yes | `light` | Pose 1 in all frames; the shine sweep and glints from the keys are lifted onto it. |
| Sheriff's Star (`sym_03_win`) | yes | `light --glints --glint-script glints/sheriff.json` | The keys redraw the badge at a slightly different scale, so the glint path is read from them and painted on pose 1. |
| Wanted Poster (`sym_04_win`) | yes (since the full symbol set) | `motion --settle 13` | Paper curls and flaps, settles flat. |
| Dynamite (`sym_05_win`) | yes | `motion --soft --settle 13` | Clock ticks, explodes into fire and smoke, reassembles. |
| Revolver (`sym_06_win`) | yes | `motion --soft --settle 12` | Barrel heats, muzzle flash, fireball, smoke clears; smoke and fire dissolve (`--soft`). |
| Money Bag (`sym_07_win`) | yes (since the full symbol set) | `motion --settle 13` | Bag hops, flops, gold dust bursts. |
| Horseshoe (`sym_08_win`) | yes (since the full symbol set) | `light --glints --glint-script glints/horseshoe.json` | Warm glow, then star glints on the left arm and right tip. |
| Lantern, A–10, Wild, Scatter, Power Dynamite | no sheets yet | | Static art with the code-side pop and glow until sheets arrive. |

Sheet ids were renumbered on 2026-11-16 when the full symbol set went in; the animations themselves didn't change.

`--settle K`: the last poses of every sheet are "back to neutral" but redrawn slightly moved or bigger, which made the loop jump. Those keys use pose 1 instead, so frame 45 eases exactly into frame 1. The tool prints every frame-to-frame step; all nine loops now wrap with a step of 0 to 0.2 (out of 255).

**Length changed (Darshan, 2026-11-16: "animations are too fast, make it smoother"):** every loop is now **75 frames at 30 fps = 2.5 s** instead of the brief's 45 frames / 1.5 s, re-rendered from the same key poses with `--frames 75`. That is 66% more in-betweens per key (about 4.7 frames per key instead of 2.8), so moves are slower and smoother. Sheets are 10×8 grids. The game holds a win (`frames.symWin` 15+45+15) and each line (`lineCycle`) for 75 frames, so every win still plays one whole loop. The biggest remaining steps are where two key poses are different drawings (the Outlaw's gun-to-grin, the explosions); a wider switch (`--switch 0.5`) was tried and didn't reduce them, so the default stays (no ghosting).

All: 75 frames (was 45), 30 fps, 2.5 s (was 1.5 s), the last frame wraps into frame 1 (checked by the tool's step report); tile silhouette and an outer border band are pose 1's in every frame (background and frame lock); the AI watermark in the last key is replaced with pose 1's pixels; frame 1 is also the idle symbol, so a win starts without a pop. In game, animated symbols skip the code-side pop/scale (position lock) and keep the glow. A win highlight lasts 45 frames, and each line in the line-by-line view also lasts 45 frames (`lineCycle`, now 75), so every win plays the complete loop.

Known limits: the key poses themselves are AI redraws, so the Outlaw's face and clothing detail differs slightly between keys and shows as soft texture change during the move; the light layers on the Gold Bars cross-fade between keys rather than tracking one highlight continuously.
