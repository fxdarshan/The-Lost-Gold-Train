# Logo animation prompts (Magnific AI, image to video)

Written 2026-11-23. Attach `assets/source/originals/logo/logo_greenscreen_16x9.png`: the logo on flat #00FF00 green, 16:9, 1920×1080, with room around it for smoke and sparks. Video can't carry transparency, so I key the green out when the video goes into the game. Each prompt is complete in one paste. They keep the lessons from the symbol videos: static camera, no added frame, every letter exact, the train fixed in place, and smoke from the chimney only.

1. **Idle loop** (5 s, seamless): plays in the corner of the game all the time. If you make only one, make this one.
2. **Intro reveal** (4 s, plays once): for the loading screen or splash, ending on the idle pose.

## 1. Idle loop
```text
Animate the attached image: a Wild West slot game logo reading "THE LOST GOLD TRAIN" on a wooden sign, with a black steam locomotive and carriages on top against a sunset sky with clouds and red mesas, a cowboy hat on the left, a coiled rope on the right, two crossed revolvers and a gold sheriff's star at the bottom, and a torn red ribbon behind "TRAIN". It sits on a flat pure green screen background. Make a subtle, premium IDLE animation that LOOPS perfectly.

STATIC TRIPOD SHOT: the camera never moves, pans, tilts, zooms or shakes. The logo stays on exactly the same pixels in every frame and never changes size, position or angle. The background stays flat pure green (#00FF00) in every frame: no scenery, no shadow, no light spill on the green.

THE LOGO IS RIGID: the wooden sign, the letters, the locomotive, the carriages, the hat, the rope, the revolvers and the star are fixed in place like a printed sign. Nothing jumps, bounces, slides, wobbles, rotates or swells.

ONLY THESE THINGS MOVE (smooth, calm, 5-second cycle):
1. CHIMNEY SMOKE: the dark smoke plume from the locomotive's tall chimney drifts and billows slowly to the left, curling and thinning. It is the only smoke. It stays inside the logo's sky area and returns to its starting shape at the end.
2. HEADLAMPS: the two round headlamps at the front of the locomotive glow and pulse warmly, with a soft lens-flare glint at the peak.
3. GOLD SHINE: one bright light sweep travels across the gold letters "LOST GOLD" from left to right, with a few small star sparkles popping on the letter edges. The letters' shape and colour never change.
4. SKY: the sunset clouds behind the train drift very slightly and the warm sunset glow breathes gently.
5. RIBBON AND STAR: the torn edges of the red ribbon flutter very slightly; the sheriff's star and the revolver barrels catch one quick glint each.

TIMING (5 s): 0-1.5 s, the headlamps brighten and the smoke billows; 1.5-3 s, the gold shine sweeps across "LOST GOLD" with sparkles; 3-4 s, the star and revolvers glint; 4-5 s, everything settles back to exactly the first frame.

KEEP: the exact text "THE LOST GOLD TRAIN", letter for letter, same font, colours and position in every frame; the exact design, colours and painted style of every element.

DO NOT: move or zoom the camera; move, scale or shake the logo or the train; make the train drive, jump or leave the sign; add smoke from anywhere except the chimney; add a frame, border, vignette, background, ground or shadow; add new objects, characters, hands, horses or text; change, misspell or redraw any letter; fade to black or white; end on a different image than the start.

NEGATIVE PROMPT: camera movement, pan, zoom, camera shake, logo moving, logo scaling, train moving, train jumping, bouncing, wobbling, smoke everywhere, extra smoke, fire, explosion, background, scenery replacing green, shadow on green, added frame, border, vignette, morphing, melting, distorted letters, misspelled text, new text, extra objects, characters, hands, blurry, low quality, flicker, watermark.

FINAL CHECK (regenerate if any fails):
- The camera and the logo never moved or changed size.
- The background is flat pure green in every frame.
- "THE LOST GOLD TRAIN" is spelled exactly right in every frame.
- Smoke comes only from the chimney.
- The last frame is identical to the first frame, so it loops seamlessly.

OUTPUT: 5 seconds, 30 fps, 16:9, seamless loop, no audio.
```

## 2. Intro reveal (plays once)
```text
Animate the attached image: a Wild West slot game logo reading "THE LOST GOLD TRAIN" on a wooden sign, with a black steam locomotive and carriages on top against a sunset sky, a cowboy hat on the left, a coiled rope on the right, two crossed revolvers and a gold sheriff's star at the bottom, and a torn red ribbon behind "TRAIN". It sits on a flat pure green screen background. Make a short, dramatic, premium REVEAL animation that ENDS on exactly the attached image.

STATIC TRIPOD SHOT: the camera never moves, pans, tilts or zooms. The background stays flat pure green (#00FF00) in every frame: no scenery, no ground, no shadow on the green. All dust, smoke and sparks stay close around the logo and are completely gone by the last second.

ACTION (4 s):
- 0.0-0.6 s: a burst of warm desert dust and a few sparks; the logo punches in from slightly smaller (90%) to full size with a firm, heavy landing and a small settle. It lands exactly in its final position.
- 0.6-1.4 s: the locomotive's headlamps flash on with a bright lens flare; a thick puff of smoke bursts from the chimney and drifts left.
- 1.4-2.4 s: a bright gold shine sweeps across "LOST GOLD" from left to right with star sparkles; the red ribbon's torn edges flutter.
- 2.4-3.2 s: the sheriff's star and both revolvers catch a quick glint.
- 3.2-4.0 s: the dust and sparks clear completely, the smoke thins, and the image settles to exactly the attached logo, holding still for the last half second.

KEEP: the exact text "THE LOST GOLD TRAIN", letter for letter, same font, colours and position; the exact design, colours and painted style of every element. The train and all props stay fixed on the sign; only the whole logo scales in at the start.

DO NOT: move or zoom the camera; make the train drive or jump; rotate, tilt or wobble the logo; add a frame, border, background, ground or shadow; add new objects, characters, hands, horses or text; change, misspell or redraw any letter; leave dust or smoke on the green at the end; end on a different image than the attached one.

NEGATIVE PROMPT: camera movement, pan, zoom on camera, camera shake, logo rotating, logo sliding, train moving, train jumping, background, scenery replacing green, shadow on green, added frame, border, vignette, morphing, melting, distorted letters, misspelled text, new text, extra objects, characters, hands, blurry, low quality, flicker, watermark.

FINAL CHECK (regenerate if any fails):
- The camera never moved; only the logo's single scale-in at the start.
- The background is flat pure green in every frame, and clean at the end.
- "THE LOST GOLD TRAIN" is spelled exactly right in every frame.
- The last frame is identical to the attached image.

OUTPUT: 4 seconds, 30 fps, 16:9, no audio.
```

## Prototype implementation status
- 2026-11-23: prompts and green-screen source written. The game still shows the still logo (`ui_splash_logo`) until the videos arrive.
