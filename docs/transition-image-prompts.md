# Free spins transition: image prompts for ChatGPT

Written 2026-11-23 for Darshan. The transition is currently built in code from the Outlaw mascot, gunsmoke puffs and a zoom. These prompts make painted layers for one of two new transitions, in the game's watercolour style. The layers are animated in code (parallax, slide, shake, gun flashes, smoke wipe), so each image is a separate piece.

- **Concept A, "The Hold-Up":** the Outlaw gallops beside the gold train at night and reaches for the gold car. Fits the way **into** free spins, which take place on the night train.
- **Concept B, "High Noon Duel":** the Outlaw faces the Railroad Marshal on the tracks at sunset, with the gold train waiting behind them. Fits the way **back** to the base game, or can be used as an alternative into free spins.

Both can be made: A going in, B coming out.

## How to use
Every prompt below is complete in one paste: style, rules, negatives and a final check are inside it.
1. Open **one ChatGPT chat per concept**, so all its layers stay consistent.
2. For the first prompt of a concept (the key art), attach:
   - `docs/art-reference/ref_02_last_train_gold_watercolour.png` (style);
   - `art/backgrounds/bg_freegame_main.jpg` for A, or `art/backgrounds/bg_base_main.jpg` for B (palette and light);
   - `art/characters/char_mascot.png` (the Outlaw).
3. Approve the key art, then paste the layer prompts **in the same chat**, one at a time. Each one says to match the key art.
4. Save the files with the names given. Put them in `art/transitions/` (on GitHub: Add file, Upload files) or send them here. I cut out the backgrounds, line the layers up and animate them.

If a layer comes back with a background, reply in the same chat: `Same image, but on a fully transparent background (or flat pure green #00FF00 if transparency is not possible). Nothing else changes.`

The **FREE SPINS** title re-uses the ribbon already in the game (`ribbon_free_spins.png` from the outro pack). Gun flashes, sparks, bullets, dust, embers, camera shake and the screen flash are done in code, so none of the prompts ask for them.

---

## Concept A: "The Hold-Up" (into free spins)

**How it plays in the game (about 3 s):**
1. The base game darkens.
2. The night desert plate slides in.
3. The gold train thunders in from the left, shaking.
4. The Outlaw's horse gallops in from the left, and he leans out towards the open gold car with his revolver up.
5. Locomotive steam rolls across and covers the screen.
6. The FREE SPINS ribbon stamps in.
7. The steam clears on the free spins screen.

### A0: key art (approve the look first) → `trans_a_keyart.png`
```text
Create ONE wide cinematic illustration for a Wild West slot game transition screen, landscape 3:2 (1536x1024).

SCENE: night in the desert under a huge full moon. A black steam locomotive pulling an armoured gold car thunders along the tracks from left to right, seen from a low three-quarter angle so it feels fast and heavy. The gold car's sliding door is half open and stacks of gold bars inside glow warm yellow. Thick white steam and sparks pour from the chimney and stream backwards. In the foreground on the left, THE OUTLAW from the attached character image gallops on a dark horse beside the train, leaning out of the saddle towards the gold car with his revolver raised, his torn red poncho whipping in the wind. The horse is at full stretch, all four legs off the ground. Mesas and saguaro cacti on the horizon. The moment just before the robbery: tension, speed, danger.

THE OUTLAW must match the attached character image exactly: same face and stubble, same wide-brim cowboy hat, same torn red poncho and its pattern, same clothes, belt, holster, boots and revolver.

STYLE (match the attached reference images): hand-painted watercolour and ink illustration; loose wet-on-wet washes, pigment blooms, hard dried edges; bold, slightly rough dark-brown ink outlines; visible cold-press paper grain; dry-brush highlights. Night palette of deep indigo, slate blue and dusty teal washes, cold moonlight from the upper right, warm lamp-orange light from the train windows and firebox, and warm gold only on the gold bars. Painted action-movie poster energy: strong diagonals, motion, drama.

LAYOUT: keep the centre of the image readable; the horse and rider on the left third, the gold car in the centre, the locomotive on the right third.

DO NOT: add any text, letters, logo, title, UI, border, frame, watermark or signature. No 3D render, photorealism, glossy plastic look, anime or cartoon style. No extra riders, no extra people on the train, no second gun, no extra hands or legs, no explosions.

CHECK before you finish: one rider only, one revolver, horse anatomy correct with four legs, the Outlaw looks like the attached image, no text anywhere.
```

### A1: background plate → `trans_a_bg.png`
```text
Using the key art you just made in this chat, paint ONLY the background as a separate image, landscape 3:2 (1536x1024).

CONTENT: the night desert under the same full moon: deep indigo sky with soft stars and thin clouds, distant mesas and saguaro cacti, the railway track on a low embankment running across the lower third from left to right. The track is EMPTY: no train, no horse, no rider, no people, no steam. Extend the landscape so it continues naturally at the left and right edges (it will scroll sideways).

STYLE: exactly the same hand-painted watercolour and ink style, paper grain, ink outlines and night palette as the key art: indigo, slate blue and dusty teal washes, cold moonlight from the upper right.

DO NOT: add any text, logo, UI, frame, watermark, train, smoke, characters or animals. No 3D or photoreal look.

CHECK before you finish: the track is completely empty; same moon position, colours and paper texture as the key art.
```

### A2: the train (cut-out) → `trans_a_train.png`
```text
Using the key art you just made in this chat, paint ONLY the train as a separate cut-out image, landscape 3:2 (1536x1024), on a FULLY TRANSPARENT background (if transparency is not possible, a flat pure green #00FF00 background with no shadow or gradient).

CONTENT: the same black steam locomotive and the armoured gold car behind it, same low three-quarter angle, heading right. The gold car's sliding door half open, stacks of gold bars glowing inside. Lit windows and a glowing firebox. Show the whole train from the back of the gold car to the front of the locomotive, wheels and a short piece of rail under it. Only a small wisp of steam at the chimney top (big steam is a separate layer).

STYLE: exactly the same hand-painted watercolour and ink style as the key art: bold dark-brown ink outlines, wet-on-wet washes, paper grain, cold moonlight from the upper right, warm lamp and gold light.

DO NOT: add background, sky, ground, horse, rider, people, text, logo, frame or watermark. Do not cut off the locomotive or the gold car at the image edges. No 3D or photoreal look.

CHECK before you finish: transparent (or flat green) background everywhere around the train; the whole train is inside the image; it matches the key art.
```

### A3: the Outlaw on horseback (cut-out) → `trans_a_rider.png`
```text
Using the key art you just made in this chat and the attached Outlaw character image, paint ONLY the horse and rider as a separate cut-out image, landscape 3:2 (1536x1024), on a FULLY TRANSPARENT background (if transparency is not possible, a flat pure green #00FF00 background with no shadow or gradient).

CONTENT: THE OUTLAW galloping to the right on a dark horse at full stretch, all four hooves off the ground, mane and tail streaming back. He leans out of the saddle towards the right with his revolver raised, reins in the other hand, his torn red poncho whipping behind him. Fierce, focused expression under the hat brim. Whole horse and rider inside the image with some empty space around them.

THE OUTLAW must match the attached character image exactly: same face and stubble, same wide-brim cowboy hat, same torn red poncho and its pattern, same clothes, belt, holster, boots and revolver.

STYLE: exactly the same hand-painted watercolour and ink style as the key art: bold dark-brown ink outlines, wet-on-wet washes, paper grain, cold moonlight rim light from the upper right.

DO NOT: add background, ground, shadow, dust, train, other people, text, logo, frame or watermark. One revolver only, two hands only, a horse with exactly four legs. Do not crop the horse's legs, tail or the rider's hat. No 3D or photoreal look.

CHECK before you finish: transparent (or flat green) background; horse anatomy correct; the Outlaw matches the attached image; nothing cut off at the edges.
```

### A4: steam wall (cut-out, also re-used for B) → `trans_steam.png`
```text
Using the key art you just made in this chat as the style reference, paint ONLY a big rolling wall of locomotive steam as a separate cut-out image, landscape 3:2 (1536x1024), on a FULLY TRANSPARENT background (if transparency is not possible, a flat pure black #000000 background).

CONTENT: a dense, billowing bank of white-grey steam and smoke clouds rolling from left to right. The right half is solid, thick cloud that covers that whole half of the image edge to edge (top to bottom); the left half breaks up into soft separate puffs and wisps that trail off. Cool moonlit blue-grey shadows in the folds, soft white highlights on the tops of the billows.

STYLE: hand-painted watercolour: soft wet-on-wet washes, pigment blooms, a few loose dark-brown ink lines on the cloud edges only, paper grain. Same painting style as the key art.

DO NOT: add a train, people, sky, ground, sparks, fire, text, logo, frame or watermark. No photoreal smoke, no 3D render.

CHECK before you finish: transparent (or flat black) background in the left part between the puffs; the right half is fully covered by cloud from top edge to bottom edge.
```

---

## Concept B: "High Noon Duel" (back to the base game)

**How it plays in the game (about 3 s):**
1. The free spins screen letterboxes into widescreen.
2. The sunset plate with the waiting gold train slides in.
3. The Outlaw (left) and the Marshal (right) slide in, in their ready poses.
4. Two close-up eye strips flash on screen, one after the other.
5. Both draw: the art swaps to the firing poses, with flashes, tracers and a spark where the bullets meet.
6. A dust and gunsmoke wall covers the screen; the steam wall from A4 is tinted warm in code.
7. The smoke clears on the base game.

### B0: key art (approve the look first) → `trans_b_keyart.png`
```text
Create ONE wide cinematic illustration for a Wild West slot game transition screen, landscape 3:2 (1536x1024).

SCENE: a showdown at sunset on the railway tracks in the desert. Two gunslingers stand facing each other about twenty paces apart, the rails running between them towards the horizon. On the LEFT, THE OUTLAW from the attached character image, side-on, facing right, legs apart, his hand hovering over the holstered revolver, his torn red poncho lifting in the hot wind. On the RIGHT, the RAILROAD MARSHAL facing left: a tall, lean older lawman in a long black duster coat, flat-brim black hat, grey moustache, a silver star on his chest, his hand hovering over his holstered revolver. Far behind them, in the middle of the image, the gold train waits on the tracks with steam rising, small against a huge low setting sun. Red mesas, long shadows towards the viewer, dust drifting along the ground. The frozen second before the draw.

THE OUTLAW must match the attached character image exactly: same face and stubble, same wide-brim cowboy hat, same torn red poncho and its pattern, same clothes, belt, holster, boots and revolver.

STYLE (match the attached reference images): hand-painted watercolour and ink illustration; loose wet-on-wet washes, pigment blooms, hard dried edges; bold, slightly rough dark-brown ink outlines; visible cold-press paper grain; dry-brush highlights. Sunset palette of burnt orange, ochre, rust and sienna, cream paper whites, deep sepia shadows, gold only on valuable things; the low sun is BEHIND them, so both men have a warm rim light and long shadows. Spaghetti-western film poster drama.

LAYOUT: the two men in the left and right thirds, full body from hat to boots, the sun and the train between them in the centre.

DO NOT: add any text, letters, logo, title, UI, border, frame, watermark or signature. No 3D render, photorealism, glossy plastic look, anime or cartoon style. No guns drawn yet, no gunfire, no extra people, no extra hands, no horses.

CHECK before you finish: exactly two men, each with one holstered revolver and two hands; the Outlaw matches the attached image; no text anywhere.
```

### B1: background plate → `trans_b_bg.png`
```text
Using the key art you just made in this chat, paint ONLY the background as a separate image, landscape 3:2 (1536x1024).

CONTENT: the same sunset desert: the huge low sun in the centre, red mesas, the railway tracks running from the bottom of the image to the horizon in the centre, and the gold train waiting far away on the tracks with a soft column of steam. Dust haze along the ground. NO people in the foreground: the space on the left and right where the two men stood is empty desert.

STYLE: exactly the same hand-painted watercolour and ink style, paper grain, ink outlines and sunset palette as the key art: burnt orange, ochre, rust and sienna, deep sepia shadows.

DO NOT: add any text, logo, UI, frame, watermark, people, horses or gunfire. No 3D or photoreal look.

CHECK before you finish: no figures in the foreground; same sun, train, colours and paper texture as the key art.
```

### B2: the Outlaw, ready pose (cut-out) → `trans_b_outlaw_ready.png`
```text
Using the key art you just made in this chat and the attached Outlaw character image, paint ONLY THE OUTLAW as a separate cut-out image, portrait 2:3 (1024x1536), on a FULLY TRANSPARENT background (if transparency is not possible, a flat pure green #00FF00 background with no shadow or gradient).

POSE: full body from hat to boots, side-on, FACING RIGHT, legs apart in a duel stance, weight low, his right hand hovering just above his holstered revolver, fingers spread, the other arm loose. Cold, narrowed eyes. His torn red poncho lifting in the hot wind. Warm sunset rim light from behind him.

THE OUTLAW must match the attached character image exactly: same face and stubble, same wide-brim cowboy hat, same torn red poncho and its pattern, same clothes, belt, holster, boots and revolver.

STYLE: exactly the same hand-painted watercolour and ink style as the key art: bold dark-brown ink outlines, wet-on-wet washes, paper grain, sunset palette.

DO NOT: add background, ground, shadow, dust, other people, text, logo, frame or watermark. The revolver stays in its holster. Two hands only. Do not crop his hat or boots. No 3D or photoreal look.

CHECK before you finish: transparent (or flat green) background; full body inside the image; he faces right; he matches the attached image.
```

### B3: the Outlaw, firing pose (cut-out) → `trans_b_outlaw_fire.png`
```text
Using the Outlaw ready-pose image you just made in this chat, paint THE SAME OUTLAW in his firing pose as a separate cut-out image, portrait 2:3 (1024x1536), on a FULLY TRANSPARENT background (if transparency is not possible, a flat pure green #00FF00 background with no shadow or gradient).

POSE: exactly the same position, size, scale, stance and boots as the ready pose. Only his right arm changes: he has drawn the revolver and fires from the hip, arm extended straight out to the RIGHT, the gun level with his chest, barrel pointing right. His face snarls with effort. Poncho flaring back from the sudden move.

KEEP: the same face, hat, torn red poncho and pattern, clothes, belt, holster, boots and revolver; the same hand-painted watercolour and ink style, sunset rim light and colours.

DO NOT: add a muzzle flash, smoke, bullets or sparks (they are added in the game). Do not add background, ground, shadow, other people, text, logo, frame or watermark. One revolver only, two hands only. Do not move his feet or change his size. No 3D or photoreal look.

CHECK before you finish: if you lay this image on top of the ready pose, the boots, legs, body and hat line up; only the gun arm has moved.
```

### B4: the Railroad Marshal, ready pose (cut-out) → `trans_b_marshal_ready.png`
```text
Using the key art you just made in this chat, paint ONLY THE RAILROAD MARSHAL as a separate cut-out image, portrait 2:3 (1024x1536), on a FULLY TRANSPARENT background (if transparency is not possible, a flat pure green #00FF00 background with no shadow or gradient).

CHARACTER: exactly the Marshal from the key art: a tall, lean older lawman in a long black duster coat, flat-brim black hat, grey moustache, weathered face, a silver star on his chest, gun belt with one holstered revolver.

POSE: full body from hat to boots, side-on, FACING LEFT, legs apart in a duel stance, his right hand hovering just above his holstered revolver, the duster coat swept back behind the holster. Steely, calm eyes. The coat tails lift in the hot wind. Warm sunset rim light from behind him.

STYLE: exactly the same hand-painted watercolour and ink style as the key art: bold dark-brown ink outlines, wet-on-wet washes, paper grain, sunset palette with sepia and charcoal for the black coat.

DO NOT: add background, ground, shadow, dust, other people, text, logo, frame or watermark. The revolver stays in its holster. Two hands only. Do not crop his hat or boots. No 3D or photoreal look.

CHECK before you finish: transparent (or flat green) background; full body inside the image; he faces left; he matches the Marshal in the key art.
```

### B5: the Railroad Marshal, firing pose (cut-out) → `trans_b_marshal_fire.png`
```text
Using the Marshal ready-pose image you just made in this chat, paint THE SAME MARSHAL in his firing pose as a separate cut-out image, portrait 2:3 (1024x1536), on a FULLY TRANSPARENT background (if transparency is not possible, a flat pure green #00FF00 background with no shadow or gradient).

POSE: exactly the same position, size, scale, stance and boots as the ready pose. Only his gun arm changes: he has drawn the revolver and fires from the hip, arm extended straight out to the LEFT, the gun level with his chest, barrel pointing left. Teeth gritted. Duster coat flaring from the sudden move.

KEEP: the same face, moustache, hat, black duster coat, silver star, gun belt, boots and revolver; the same hand-painted watercolour and ink style, sunset rim light and colours.

DO NOT: add a muzzle flash, smoke, bullets or sparks (they are added in the game). Do not add background, ground, shadow, other people, text, logo, frame or watermark. One revolver only, two hands only. Do not move his feet or change his size. No 3D or photoreal look.

CHECK before you finish: if you lay this image on top of the ready pose, the boots, legs, body and hat line up; only the gun arm has moved.
```

### B6: close-up eye strips (optional, for the stare-down) → `trans_b_eyes.png`
```text
Using the Outlaw and Marshal images you just made in this chat, paint ONE image, landscape 3:2 (1536x1024), split into two equal horizontal strips with a thin dark-brown ink line between them:
- TOP STRIP: an extreme close-up of THE OUTLAW's eyes, from just under the hat brim to the bridge of the nose, looking to the RIGHT: cold, narrowed, sweat on the brow, hat brim shadow across the top, stubble at the bottom edge.
- BOTTOM STRIP: an extreme close-up of THE MARSHAL's eyes, from his black hat brim to the top of his grey moustache, looking to the LEFT: steely, deep crow's-feet wrinkles, weathered skin.
Both lit by warm sunset light from the side. Spaghetti-western film close-up.

STYLE: exactly the same hand-painted watercolour and ink style as the key art: bold dark-brown ink outlines, wet-on-wet washes, pigment blooms, paper grain, sunset palette.

DO NOT: add text, logo, frame, watermark, guns or other people. No 3D or photoreal look. Each strip shows only one face.

CHECK before you finish: two strips of equal height filling the whole image; the Outlaw is on top looking right and the Marshal is below looking left; the faces match the earlier images.
```

---

## Files, at a glance
| File | Concept | Background |
| --- | --- | --- |
| `trans_a_keyart.png` | A, look approval only | full scene |
| `trans_a_bg.png` | A | full plate |
| `trans_a_train.png` | A | transparent or green |
| `trans_a_rider.png` | A | transparent or green |
| `trans_steam.png` | A and B (tinted warm for B) | transparent or black |
| `trans_b_keyart.png` | B, look approval only | full scene |
| `trans_b_bg.png` | B | full plate |
| `trans_b_outlaw_ready.png`, `trans_b_outlaw_fire.png` | B | transparent or green |
| `trans_b_marshal_ready.png`, `trans_b_marshal_fire.png` | B | transparent or green |
| `trans_b_eyes.png` | B, optional | full image |

## Prototype implementation status
- Not in the game yet: waiting for the images. Until then the current code-built gunfight (into free spins) and zoom-out (back to base) stay.
- ChatGPT's largest landscape size is 1536×1024 (3:2). I scale the plates to fill the 1920×1080 stage, which crops the top and bottom a little, so the prompts keep the important parts in the middle.
