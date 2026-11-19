# Writes docs/symbol-video-prompts.md: image-to-video prompts for every symbol (edit here, rerun).
import os
PREFIX = """Animate the attached image. It is a slot machine symbol tile; the video is its win animation and must LOOP perfectly.

CAMERA AND TILE (most important):
- Locked-off camera: no zoom, no pan, no tilt, no dolly, no shake, no cuts.
- The tile's frame, corner rivets and background stay exactly as in the image for the whole video. Only the {subject} and the effects described below move.
- The {subject} stays the same size and in the same place; it never leaves the tile or crosses the frame.
- The video starts on the attached image and ends on exactly the same image, so the last frame matches the first.

ACTION ({secs} seconds):
"""
SUFFIX = """

STYLE: premium slot-game symbol animation; same painted watercolour Western style, colours and lighting as the image; smooth, eased motion with a clear build-up, a dramatic peak and a calm settle; effects (glow, sparks, smoke, flashes) are drawn over the subject, not replacing it.

KEEP: {text_rule}

DO NOT: add any new object, character, animal, hand or background element; change the {subject}'s design, colours or proportions; morph or melt shapes; add text, logos, subtitles or watermarks; fade to black or white; end on a different pose than the start.

OUTPUT: {secs} seconds, 30 fps, same aspect ratio as the image, no audio needed."""
S = [
 ("The Outlaw", "sym_00", "01_character_portrait", "Outlaw", "There is no text in this tile; add none.", [
   "0.0-0.8 s: he narrows his eyes and slowly lifts his head; the poncho stirs in the wind.",
   "0.8-1.6 s: he swings the revolver toward the viewer, the barrel pointing straight at us.",
   "1.6-2.2 s: a bright muzzle flash and sparks; the gun kicks up with recoil; a curl of smoke rises from the barrel.",
   "2.2-3.2 s: he gives a slow confident smirk while the smoke drifts away.",
   "3.2-4.0 s: he settles back into exactly the starting pose."], "Done (2026-11-19) from Darshan's video; keep for remakes."),
 ("Steam Train", "sym_01", "02_steam_train", "steam locomotive", "There is no text in this tile; add none.", [
   "0.0-0.6 s: the headlamp flickers on with a warm glow.",
   "0.6-1.4 s: steam puffs from the chimney; the wheels start turning with motion blur; sparks under the wheels.",
   "1.4-2.2 s: the whistle blasts a white jet of steam; the headlamp flares with light rays; the locomotive rocks slightly forward (a few pixels only).",
   "2.2-3.2 s: the steam clouds roll back and thin out; a warm glint slides along the boiler.",
   "3.2-4.0 s: the wheels stop, the headlamp dims, last wisps fade; back to the starting image."], None),
 ("Gold Bars", "sym_02", "03_gold_bars", "stack of gold bars", "The exact number and arrangement of the gold bars.", [
   "0.0-0.8 s: a warm golden glow rises around the stack.",
   "0.8-1.8 s: a bright shine band sweeps across the bars from left to right; edges catch the light.",
   "1.8-2.4 s: star sparkles pop on bar corners; gold dust lifts up; light rays burst behind the stack.",
   "2.4-3.2 s: the top bar hops a few pixels and lands back exactly in place with a puff of gold dust.",
   "3.2-4.0 s: rays and sparkles fade; back to the starting image."], None),
 ("Sheriff's Star", "sym_03", "04_sheriff_badge", "sheriff's star badge", "The word SHERIFF exactly as written, letter for letter, in every frame.", [
   "0.0-0.8 s: a soft golden glow appears behind the badge.",
   "0.8-1.8 s: a bright light streak travels around the five star points, crossing the word SHERIFF without changing it.",
   "1.8-2.5 s: a big four-point star flash on the top point; light rays around the badge; the badge tilts a few degrees as if catching the sun.",
   "2.5-3.3 s: small sparkles twinkle on each star tip; the badge tilts back.",
   "3.3-4.0 s: glow fades; back to the starting image."], None),
 ("Wanted Poster", "sym_04", "05_wanted_poster", "wanted poster", "The words WANTED and $10,000 exactly as written, letter for letter, in every frame.", [
   "0.0-0.8 s: a breeze lifts the bottom corners of the poster; dust drifts across.",
   "0.8-1.6 s: the paper ripples gently, the printed face and text still readable.",
   "1.6-2.4 s: a red ink circle is drawn around $10,000; the outlaw's eyes on the poster glint.",
   "2.4-3.2 s: the $10,000 glows gold with sparkles; the red circle fades away.",
   "3.2-4.0 s: the paper flattens; back to the starting image."], None),
 ("Dynamite", "sym_05", "06_dynamite_timer", "dynamite bundle with the alarm clock", "The exact number of dynamite sticks and the clock design.", [
   "0.0-0.8 s: the clock hands tick forward; the fuse starts to fizz with small sparks.",
   "0.8-1.5 s: the sparks grow; the bundle trembles; the clock face glows red.",
   "1.5-2.1 s: a bright orange-white explosion flash and fireball, contained inside the tile.",
   "2.1-3.2 s: smoke clears and reveals the bundle back in place, unharmed, with a small bounce.",
   "3.2-4.0 s: the clock hands spin back to the start; last smoke fades; back to the starting image."], None),
 ("Revolver", "sym_06", "07_revolver", "revolver", "There is no text in this tile; add none.", [
   "0.0-0.8 s: a glint slides along the barrel; the hammer pulls back.",
   "0.8-1.4 s: the cylinder turns one chamber; the revolver tilts up slightly.",
   "1.4-2.0 s: a bright muzzle flash and sparks at the barrel tip; recoil kicks the gun up a little.",
   "2.0-3.2 s: a curl of grey smoke rises from the barrel; the cylinder spins with motion blur and stops.",
   "3.2-4.0 s: the revolver settles back; smoke fades; back to the starting image."], None),
 ("Money Bag", "sym_07", "08_money_bag", "money bag", "The dollar sign exactly as it is, in every frame.", [
   "0.0-0.6 s: the bag squashes down slightly.",
   "0.6-1.4 s: it springs up and hops a few pixels, the drawstring flipping up.",
   "1.4-2.2 s: it lands with a squash; gold coins pop out of the top, spinning and sparkling, and fall back in.",
   "2.2-3.2 s: the dollar sign glows gold with sparkles; the bag wobbles left and right.",
   "3.2-4.0 s: it settles upright; glow fades; back to the starting image."], None),
 ("Horseshoe", "sym_08", "09_horseshoe", "horseshoe", "There is no text in this tile; add none.", [
   "0.0-0.8 s: a warm glow rises inside the horseshoe's curve.",
   "0.8-1.6 s: the horseshoe swings gently left and right as if hanging on a nail.",
   "1.6-2.4 s: a glint travels around the curve; a burst of golden lucky light behind it with sparkles.",
   "2.4-3.2 s: the light turns into floating gold specks that drift up.",
   "3.2-4.0 s: it settles at centre; glow fades; back to the starting image."], None),
 ("Lantern", "sym_09", "10_lantern", "oil lantern", "There is no text in this tile; add none.", [
   "0.0-0.8 s: the flame dims and almost goes out; the tile gets a little darker.",
   "0.8-1.5 s: the flame catches again with a bright flicker.",
   "1.5-2.4 s: the flame flares tall; warm light rays fill the tile; the lantern sways slightly.",
   "2.4-3.2 s: tiny glowing specks circle the lantern and drift away.",
   "3.2-4.0 s: the lantern swings back to centre; light settles; back to the starting image."], None),
]
ROY = [
 "0.0-0.6 s: the {L} squashes down slightly.",
 "0.6-1.2 s: it springs up a few pixels taller and settles back with a small bounce.",
 "1.2-2.2 s: a warm light band sweeps across the {L} from left to right; the metal rivets glint.",
 "2.2-3.0 s: a star sparkle pops on the top corner with a soft glow, then a smaller one on the bottom corner.",
 "3.0-4.0 s: glow fades; back to the starting image."]
for i,(L,f) in enumerate([("A","11_royal_A"),("K","12_royal_K"),("Q","13_royal_Q"),("J","14_royal_J"),("10","15_royal_10")]):
    S.append((L, "sym_%02d" % (10 + i), f, 'letter "%s"' % L, 'The symbol exactly "%s" in the same font in every frame; no other letter or number.' % L, [x.replace("{L}", L) for x in ROY], None))
S += [
 ("Wild", "sym_wild", "17_wild", "WILD badge with the hat and crossed revolvers", "The word WILD exactly as written, letter for letter, in every frame.", [
   "0.0-0.8 s: the hat lifts a little off the badge, tipped in greeting, and lands back with a bounce.",
   "0.8-1.6 s: the crossed revolvers glint; the letters W-I-L-D light up gold one after another from left to right.",
   "1.6-2.4 s: a gold starburst flashes behind the badge; sparks fly.",
   "2.4-3.2 s: sparks fall; the starburst shrinks; letters fade back to normal.",
   "3.2-4.0 s: last glint on the star; back to the starting image."], None),
 ("Scatter", "sym_scatter", "18_scatter", "SCATTER badge with the steam train", "The word SCATTER exactly as written, letter for letter, in every frame.", [
   "0.0-0.8 s: the train's headlamp lights up; a puff of steam rises from the chimney.",
   "0.8-1.6 s: the train rocks slightly forward, wheels glinting; the headlamp beam flares.",
   "1.6-2.4 s: the SCATTER ribbon glows gold; gold light rays burst from behind the badge with sparks.",
   "2.4-3.2 s: the glow sweeps along the ribbon; steam thins; the train rocks back.",
   "3.2-4.0 s: headlamp dims; back to the starting image."], None),
 ("Power Dynamite", "sym_power", "19_power_symbol_dynamite", "Power Dynamite bundle", "The plain white background, with no frame added. No text or number (the game adds the multiplier plate).", [
   "0.0-0.8 s: the fuse sparks and the spark runs down the fuse; a red glow on the sticks.",
   "0.8-1.4 s: the bundle swells slightly and trembles; sparks fly.",
   "1.4-2.0 s: a bright explosion flash and an orange shockwave ring around the bundle (kept within the image).",
   "2.0-3.2 s: smoke clears; the bundle is back, glowing hot orange with crackling orange energy.",
   "3.2-4.0 s: the energy and heat glow fade; back to the starting image."], None),
]
out = ["# Symbol win animation video prompts (image-to-video)\n",
"Written 2026-11-19 for Darshan, after the Outlaw video worked well. Generated by `tools/asset-pipeline/make_video_prompts.py`; edit the script and rerun to change all prompts at once.\n",
"## How to use",
"1. One video per symbol. Attach that symbol's tile image (file named under each heading) as the **first frame**. If your tool supports a last frame (Veo \"frames to video\", Kling, Runway, Luma), attach **the same image as the last frame** too: that is what makes it loop.",
"2. Paste the prompt. Generate 4 s at 30 fps (24 fps is fine too; I convert it). Same aspect ratio as the image.",
"3. Check before sending: the camera never moves, the frame and background stay still, text is spelled right, the last frame matches the first. A slight drift is fine (I morph the last frames into the first).",
"4. Send me the MP4. I pick the 45 smoothest frames, cut the background and close the loop (`tools/asset-pipeline/anim_from_video.py`), as for the Outlaw.\n",
"**Fix lines** (reply in the same chat if the result is off):",
"- Camera moved: `Keep the camera completely still: no zoom, pan or shake. Regenerate.`",
"- Frame or background changed: `The tile frame, rivets and background must not move or change at all; only the subject and effects move. Regenerate.`",
"- Text changed: `The text must stay exactly as in the image, letter for letter, in every frame. Regenerate.`",
"- Doesn't loop: `The last frame must be identical to the first frame (the attached image). Regenerate.`",
"- Too little happening: `Make the flash, glow and effects at the peak bigger and brighter; keep the subject unchanged. Regenerate.`\n"]
for name, sid, f, subj, text_rule, beats, note in S:
    pre = PREFIX.format(subject=subj, secs=4)
    if sid == "sym_power":
        pre = pre.replace("It is a slot machine symbol tile;", "It is a slot machine symbol on a plain white background;").replace("- The tile's frame, corner rivets and background stay exactly as in the image for the whole video.", "- The plain white background stays plain white for the whole video; add no frame or scenery.").replace("it never leaves the tile or crosses the frame", "it never leaves the image")
    body = pre + "\n".join("- " + b for b in beats) + SUFFIX.format(subject=subj, secs=4, text_rule=text_rule)
    out.append(f"## {name} (`{sid}`) — attach `{f}`\n")
    if note: out.append(f"*{note}*\n")
    out.append("```text\n" + body + "\n```\n")
out.append("## Prototype implementation status\n- 2026-11-19: Outlaw done from video (45 frames, 1.5 s). The other symbols still use their key-pose sheets (75 frames) until their videos arrive.\n")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs", "symbol-video-prompts.md"), "w").write("\n".join(out))
print(len(S))
