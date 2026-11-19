# Outlaw full-body character: video prompts (image-to-video, green screen)

Written 2026-11-19 for Darshan. These are three animations for the mascot beside the reels: two idles and one win.

## How to use
1. Attach `assets/source/originals/last_train_gold/24_full_body_outlaw_greenscreen.png` (9:16, 1080×1920, flat #00FF00 green) as the **first frame**. If your tool supports a last frame, attach **the same image** as the last frame too, so the clip loops.
2. Use a new chat for each animation. Paste the prompt, choose 9:16, and set the camera to **static** if the tool has that setting.
3. **Negative prompt**, if the tool has a field for one: `camera movement, zoom, background, scenery, ground, floor, shadow, extra people, extra gun, extra hand, walking, jumping, feet moving, changing face, changing costume`.
4. Send me the MP4. I key out the green, pick the best frames, close the loop and put it in the game as the mascot's idle 1, idle 2 and win.

**Fix lines** (reply in the same chat if a result is off):
- Background changed: `The background must stay flat pure green (#00FF00) in every frame: no scenery, ground, floor or shadow. Regenerate.`
- Camera moved: `Static tripod shot: the camera must not move or zoom at all. Regenerate.`
- Feet slid or he walked: `His boots stay planted on exactly the same spot the whole time. Regenerate.`
- Face or costume changed: `Keep his face, beard, hat, poncho and clothes exactly as in the image. Regenerate.`
- Doesn't loop: `The last frame must be identical to the first frame (the attached image). Regenerate.`

## Shared rules (already inside every prompt)
- Static camera, and the background stays flat green.
- His boots stay planted, and his design never changes.
- Every clip starts and ends on the attached pose.
- The smoke is thin and wispy. Thick grey smoke over green is hard to key cleanly.

## 1. Idle 1: "Ready" (4 s loop)
```text
Animate the attached image: a full-body Western gunslinger in a cowboy hat and a torn red poncho, aiming a revolver to the right, standing on a flat pure green screen background. This is an idle animation for a slot game character and must LOOP perfectly.

STATIC TRIPOD SHOT: the camera does not move, pan or zoom. The background stays flat pure green (#00FF00) in every frame: no scenery, ground, floor, shadow or light change on the green.

HE STAYS IN HIS POSE: his boots stay planted on exactly the same spot. He keeps aiming the revolver to the right the whole time.

WHAT MOVES (alive, tense, confident, like a gunslinger waiting for the draw):
- He breathes slowly and deeply; his chest and shoulders rise and fall.
- A hot desert wind blows from the left: the torn red poncho billows and ripples strongly, and its fringe and torn edges flutter. A few strands of his hair move.
- His eyes narrow and scan slightly left, then back at the viewer, with a cold stare.
- The revolver sways very slightly with his breathing, steady and ready.

TIMING (4 s): 0-2 s, a breath in while the wind gusts and the poncho billows up; 2-4 s, a breath out while the wind drops and the poncho settles back to exactly its starting shape.

KEEP: his face, beard, hat, poncho pattern, clothes, belt, holster, spurs and revolver exactly as in the image; same painted comic style and colours.

DO NOT: move the camera; change or add a background; move his feet; walk, jump or turn around; change his face or costume; add other people, objects or extra hands; end on a different pose than the start.

OUTPUT: 4 seconds, 30 fps, 9:16, seamless loop, no audio needed.
```

## 2. Idle 2: "Gun spin" (5 s loop)
```text
Animate the attached image: a full-body Western gunslinger in a cowboy hat and a torn red poncho, aiming a revolver to the right, standing on a flat pure green screen background. This is a second idle animation for a slot game character and must LOOP perfectly.

STATIC TRIPOD SHOT: the camera does not move, pan or zoom. The background stays flat pure green (#00FF00) in every frame: no scenery, ground, floor, shadow or light change on the green.

HIS BOOTS STAY PLANTED on exactly the same spot the whole time.

ACTION (cool, showy, full of attitude):
- 0.0-0.8 s: he lowers the revolver to his side and gives the viewer a cocky smirk.
- 0.8-2.2 s: he twirls the revolver around his trigger finger: two fast, slick spins with a flash of light on the silver metal. His poncho swings with the movement.
- 2.2-3.0 s: he catches the grip with a snap and flicks the gun up.
- 3.0-4.0 s: he swings back into his aiming pose, pointing the revolver to the right, and his eyes lock on the viewer.
- 4.0-5.0 s: he holds the aim and breathes; the poncho settles back to exactly its starting shape.

KEEP: one revolver only, always in his right hand; his face, beard, hat, poncho pattern, clothes, belt, holster and spurs exactly as in the image; same painted comic style and colours.

DO NOT: move the camera; change or add a background; move his feet; walk, jump or turn around; drop the gun or add a second gun; change his face or costume; add other people, objects or extra hands; end on a different pose than the start.

OUTPUT: 5 seconds, 30 fps, 9:16, seamless loop, no audio needed.
```

## 3. Win: "Three shots and blow the smoke" (7 s, starts and ends on the idle pose)
```text
Animate the attached image: a full-body Western gunslinger in a cowboy hat and a torn red poncho, aiming a revolver to the right, standing on a flat pure green screen background. This is his big WIN animation for a slot game, like the hero moment of a Western action movie. It starts and ends on exactly the attached pose.

STATIC TRIPOD SHOT: the camera does not move, pan or zoom. The background stays flat pure green (#00FF00) in every frame: no scenery, ground, floor, shadow or light change on the green. Muzzle flashes are short and bright and stay close to the gun.

HIS BOOTS STAY PLANTED on exactly the same spot the whole time.

ACTION:
- 0.0-0.6 s: his eyes narrow; he thumbs back the hammer with a click.
- 0.6-2.2 s: BANG, BANG, BANG: he fires three fast shots to the right. On each shot there is a big bright orange muzzle flash at the barrel, the gun kicks up with hard recoil, his arm and shoulder jolt back, and his poncho snaps with the shock.
- 2.2-3.2 s: a thin wisp of grey smoke curls up from the barrel. He slowly brings the revolver up beside his face, barrel pointing up, close to his lips.
- 3.2-4.4 s: he purses his lips and blows the smoke off the barrel; the wisp swirls away and fades. He gives the viewer a satisfied smirk.
- 4.4-5.6 s: he gives the revolver one quick spin and swings back into his aiming pose, pointing to the right.
- 5.6-7.0 s: he holds the aim with a cold stare; the poncho settles; back to exactly the starting image.

KEEP: one revolver only, always in his right hand; his face, beard, hat, poncho pattern, clothes, belt, holster and spurs exactly as in the image; same painted comic style and colours. The smoke stays thin and wispy and fades away completely.

DO NOT: move the camera; change or add a background; move his feet; walk, jump or turn around; add a second gun, bullets, targets, other people or extra hands; leave smoke on screen at the end; change his face or costume; end on a different pose than the start.

OUTPUT: 7 seconds, 30 fps, 9:16, no audio needed.
```

## Prototype implementation status
- 2026-11-19: prompts written and the green-screen source made. The game still uses the cutout puppet (`Rig.createPuppet`) for the mascot until these videos arrive.
