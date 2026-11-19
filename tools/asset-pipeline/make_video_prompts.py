# Writes docs/symbol-video-prompts.md: image-to-video prompts for every symbol (edit here, rerun).
# Rules learned from the first tests (2026-11-19): describe exactly what is in each image, never mention a
# "frame" the image doesn't have (the model adds one), and keep the main object completely still (any
# hop / rock / tilt / squash wording made the model move or jump it). Drama comes from light, smoke, sparks.
import os

TILE = "The thin dark border and the four small rivets in the corners stay exactly as they are. Do NOT add any frame, border, panel, vignette or edge decoration."
PANEL = "The dark riveted metal panel edge stays exactly as it is. Do NOT add another frame, border or decoration."
WHITE = "The background is plain white and stays plain white. Do NOT add any frame, border, tile, shadow box or scenery."

PREFIX = """Animate the attached image. It is a slot machine symbol: {desc}. The video is its win animation and must LOOP perfectly.

CAMERA AND IMAGE (most important):
- Locked-off camera: no zoom, no pan, no tilt, no shake, no cuts. The picture never moves or scales.
- {border}
- The {subject} is completely still: it does not move, slide, rock, bounce, jump, rotate, shake or change size. {still_extra}
- The video starts on the attached image and ends on exactly the same image, so the last frame matches the first.

ACTION (4 seconds; only light, glow, sparks{extra_movers} move):
"""
SUFFIX = """

STYLE: premium slot-game symbol animation; same painted Western style, colours and lighting as the image; smooth, eased motion with a build-up, a bright peak and a calm settle; all effects are drawn over the {subject}, never replacing or redrawing it.

KEEP: {keep}

DO NOT: move the {subject}; add a frame or border; add any new object, character, animal, hand or background element; morph or melt shapes; add or change any text, logo or watermark; fade to black or white; end on a different image than the start.

OUTPUT: 4 seconds, 30 fps, same aspect ratio as the image, no audio needed."""

S = [
 dict(name="Steam Train", sid="sym_01", file="02_steam_train",
  desc="a full painted scene of a black steam locomotive with carriages on rails at sunset, under dark smoke clouds",
  subject="locomotive and its carriages", border=TILE, still_extra="The rails and ground do not move. The wheels do not turn.",
  movers=", smoke and steam",
  beats=["0.0-0.8 s: the round headlamp on the front flickers on with a warm glow; the dark smoke above the chimney starts to billow slowly.",
         "0.8-1.6 s: a thick puff of dark smoke rises from the chimney and rolls back over the carriages; small orange embers float up.",
         "1.6-2.4 s: a jet of white steam hisses out low beside the front wheels; the headlamp flares bright with soft light rays; the firebox glow under the cab pulses orange.",
         "2.4-3.2 s: the steam and smoke drift back and thin out; a warm glint slides along the boiler from front to back.",
         "3.2-4.0 s: the headlamp dims to its starting glow; the smoke settles into exactly its starting shape."],
  keep="the locomotive's shape, colours and details; the number of carriages; the sunset sky colours."),
 dict(name="Gold Bars", sid="sym_02", file="03_gold_bars",
  desc="a pile of shiny gold bars and small gold nuggets on a glowing orange-red painted background",
  subject="pile of gold bars", border=TILE, still_extra="No bar moves, lifts or changes place.", movers="",
  beats=["0.0-0.8 s: a warm golden glow rises around the pile.",
         "0.8-1.8 s: a bright shine band sweeps across the bars from left to right; the bar edges catch the light one after another.",
         "1.8-2.4 s: star sparkles pop on the corners of the top bars; soft golden light rays burst out from behind the pile.",
         "2.4-3.2 s: tiny gold dust specks float up and fade; the rays shrink.",
         "3.2-4.0 s: the glow settles back to exactly the starting image."],
  keep="the exact number, size and arrangement of the gold bars and nuggets; the background colours."),
 dict(name="Sheriff's Star", sid="sym_03", file="04_sheriff_badge",
  desc="a gold six-point sheriff's star badge with the word SHERIFF across it and a ball on each point, on a dark red-brown painted background",
  subject="badge", border=TILE, still_extra="It does not tilt or turn.", movers="",
  beats=["0.0-0.8 s: a soft golden glow appears behind the badge.",
         "0.8-1.8 s: a bright light streak travels around the six star points one after another; the balls on the points shine as it passes.",
         "1.8-2.4 s: a big four-point star flash on the top point; soft light rays spread behind the badge.",
         "2.4-3.2 s: a shine sweeps across the word SHERIFF from left to right without changing the letters; small sparkles twinkle on the point balls.",
         "3.2-4.0 s: the glow fades back to exactly the starting image."],
  keep='the word SHERIFF exactly as written, letter for letter, in every frame; six points with a ball on each; the engraving.'),
 dict(name="Wanted Poster", sid="sym_04", file="05_wanted_poster",
  desc='an old paper wanted poster nailed up, with WANTED at the top, a portrait of a bearded outlaw in a hat, and $10,000 at the bottom',
  subject="poster", border=TILE, still_extra="The paper does not flap, curl or move; the portrait does not move or change expression.", movers=", dust",
  beats=["0.0-0.8 s: warm sunlight brightens across the paper from the left; a few dust specks drift across the image.",
         "0.8-1.6 s: the outlaw's eyes in the portrait glint once.",
         "1.6-2.4 s: $10,000 glows bright gold with sparkles around the numbers; soft light rays spread behind it.",
         "2.4-3.2 s: a shine sweeps across WANTED from left to right without changing the letters; the sparkles fade.",
         "3.2-4.0 s: the light settles back to exactly the starting image."],
  keep="the words WANTED and $10,000 exactly as written, letter for letter, in every frame; the portrait's face; the nails at the corners of the paper."),
 dict(name="Dynamite", sid="sym_05", file="06_dynamite_timer",
  desc="a bundle of red dynamite sticks with a round alarm clock strapped on the front and a coiled wire at the top, on a fiery orange burst background",
  subject="dynamite bundle and clock", border=TILE, still_extra="It does not explode, break apart, shake or swell.", movers=", the clock hands, sparks",
  beats=["0.0-0.8 s: the clock's second hand ticks forward; small sparks fizz from the wire at the top.",
         "0.8-1.5 s: the sparks grow; the clock face glows red; the red sticks pulse with a warm glow.",
         "1.5-2.2 s: the orange burst behind the bundle flares bright like a blast, with sparks shooting outward (behind and around the bundle only, the bundle stays intact).",
         "2.2-3.2 s: the flare fades into drifting embers and thin smoke wisps.",
         "3.2-4.0 s: the clock hands return to exactly their starting position; everything settles back to the starting image."],
  keep="the exact number of dynamite sticks; the clock design and its numbers; the wire coil."),
 dict(name="Revolver", sid="sym_06", file="07_revolver",
  desc="a silver revolver with a wooden grip lying diagonally on a streaky orange-red painted background",
  subject="revolver", border=TILE, still_extra="The cylinder and hammer do not move.", movers=", smoke",
  beats=["0.0-0.8 s: a glint slides along the barrel from the grip to the muzzle.",
         "0.8-1.4 s: a warm glow gathers at the muzzle.",
         "1.4-2.0 s: a bright muzzle flash bursts from the end of the barrel with sparks (in front of the muzzle, inside the image).",
         "2.0-3.2 s: a curl of grey smoke rises from the muzzle and drifts away; a shine passes over the cylinder.",
         "3.2-4.0 s: the smoke fades completely; back to exactly the starting image."],
  keep="the revolver's shape, angle and position; the wooden grip; the background."),
 dict(name="Money Bag", sid="sym_07", file="08_money_bag",
  desc="a tied burlap money bag with a big dark dollar sign on it, sitting on wooden planks, on a streaky orange painted background",
  subject="money bag", border=TILE, still_extra="It does not hop, wobble or squash; the knot and the tie do not move.", movers=", gold dust",
  beats=["0.0-0.8 s: a warm glow rises behind the bag.",
         "0.8-1.6 s: golden sparkles and gold dust puff up from the tied opening at the top and float upward.",
         "1.6-2.4 s: the dollar sign glows bright gold; soft light rays spread behind the bag.",
         "2.4-3.2 s: a shine sweeps across the burlap from left to right; star sparkles twinkle around the bag.",
         "3.2-4.0 s: the gold dust fades and the glow settles back to exactly the starting image."],
  keep="the dollar sign exactly as it is, in every frame; the bag's shape; the wooden planks."),
 dict(name="Horseshoe", sid="sym_08", file="09_horseshoe",
  desc="a metal horseshoe with nail holes, open end up, on a dark wooden plank background",
  subject="horseshoe", border=TILE, still_extra="It does not swing, tilt or turn.", movers="",
  beats=["0.0-0.8 s: a warm lucky golden glow rises inside the horseshoe's curve.",
         "0.8-1.8 s: a bright glint travels around the horseshoe from the left tip, along the curve, to the right tip; the nail holes shine as it passes.",
         "1.8-2.4 s: a burst of golden light behind the horseshoe with star sparkles.",
         "2.4-3.2 s: the light breaks into floating gold specks that drift up and fade.",
         "3.2-4.0 s: the glow settles back to exactly the starting image."],
  keep="the horseshoe's shape, colour and the number of nail holes; the wooden planks."),
 dict(name="Lantern", sid="sym_09", file="10_lantern",
  desc="an old brass oil lantern with a glass globe and a glowing flame inside, on a fiery orange burst background",
  subject="lantern", border=TILE, still_extra="It does not swing or sway.", movers=", the flame, embers",
  beats=["0.0-0.8 s: the flame inside the glass dims and flickers low; the image gets a little darker.",
         "0.8-1.5 s: the flame catches again with a bright flicker.",
         "1.5-2.4 s: the flame flares tall and bright; warm light rays shine out through the glass; the orange burst behind brightens.",
         "2.4-3.2 s: a few glowing embers float up around the lantern and fade.",
         "3.2-4.0 s: the flame and light settle back to exactly the starting image."],
  keep="the lantern's shape, brass colour and handle; the glass globe."),
]
ROY_BEATS = [
 "0.0-0.8 s: a warm glow appears behind the {L}.",
 "0.8-1.8 s: a bright light band sweeps across the {L} from left to right; the small metal studs on the {L} glint as it passes.",
 "1.8-2.4 s: a star sparkle pops on the top corner of the {L} with soft light rays.",
 "2.4-3.2 s: a smaller sparkle on the bottom corner; the glow fades.",
 "3.2-4.0 s: back to exactly the starting image."]
for L, f, col in [("A", "11_royal_A", "red"), ("K", "12_royal_K", "gold-orange"), ("Q", "13_royal_Q", "orange-copper"), ("J", "14_royal_J", "silver"), ("10", "15_royal_10", "silver")]:
    S.append(dict(name=L, sid="sym_%02d" % (10 + ["A", "K", "Q", "J", "10"].index(L)), file=f,
      desc='a big %s Western-style "%s" with small metal studs, on a scratched orange painted plate' % (col, L),
      subject='"%s"' % L, border=TILE, still_extra="It does not squash, stretch or bounce.", movers="",
      beats=[b.replace("{L}", L) for b in ROY_BEATS],
      keep='the symbol exactly "%s" in the same font, colour and position in every frame; no other letter or number.' % L))
S += [
 dict(name="Wild", sid="sym_wild", file="17_wild",
  desc="a dark red panel with a round gold-rimmed emblem: a cowboy hat on top, the word WILD in big gold letters, and two crossed revolvers with a gold star below",
  subject="emblem, hat and revolvers", border=PANEL, still_extra="The hat does not lift or move.", movers="",
  beats=["0.0-0.8 s: a warm golden glow appears behind the round emblem.",
         "0.8-1.8 s: the letters W-I-L-D light up gold one after another from left to right without changing shape.",
         "1.8-2.4 s: a gold starburst of light rays flashes behind the emblem; sparks fly outward (inside the image).",
         "2.4-3.2 s: the two revolvers glint; the gold star twinkles; the sparks fade.",
         "3.2-4.0 s: the light settles back to exactly the starting image."],
  keep="the word WILD exactly as written, letter for letter, in every frame; the hat; two revolvers and one star."),
 dict(name="Scatter", sid="sym_scatter", file="18_scatter",
  desc="a dark red panel with a round emblem showing a black steam locomotive at sunset with smoke from its chimney, a red ribbon with the word SCATTER across the bottom, and a gold star below",
  subject="emblem, locomotive and ribbon", border=PANEL, still_extra="The locomotive does not move and its wheels do not turn.", movers=", smoke",
  beats=["0.0-0.8 s: the locomotive's headlamp lights up with a warm glow; the smoke from its chimney starts to billow slowly.",
         "0.8-1.6 s: a puff of smoke rises from the chimney and drifts back; the sunset sky inside the emblem brightens.",
         "1.6-2.4 s: gold light rays burst out from behind the round emblem; the headlamp flares.",
         "2.4-3.2 s: a shine sweeps along the ribbon across the word SCATTER without changing the letters; the gold star twinkles.",
         "3.2-4.0 s: the smoke settles into its starting shape and the light fades back to exactly the starting image."],
  keep="the word SCATTER exactly as written, letter for letter, in every frame; the round emblem and ribbon shapes."),
 dict(name="Power Dynamite", sid="sym_power", file="19_power_symbol_dynamite",
  desc="a bundle of red dynamite sticks with a round clock on the front and a wire coil at the top, in front of an orange-yellow explosion burst, on a plain white background",
  subject="dynamite bundle and clock", border=WHITE, still_extra="It does not explode, break apart, shake or swell.", movers=", the clock hands, sparks",
  beats=["0.0-0.8 s: small sparks fizz from the wire at the top; the clock's second hand ticks.",
         "0.8-1.4 s: the red sticks glow hot; the orange burst behind starts to pulse.",
         "1.4-2.0 s: the burst flares bright and expands a little with sparks shooting outward (staying within the image).",
         "2.0-3.2 s: crackling orange energy flickers around the bundle, then fades into embers.",
         "3.2-4.0 s: the burst shrinks back to its starting shape; back to exactly the starting image."],
  keep="the plain white background; the exact number of sticks; the clock design. No text or number (the game adds the multiplier plate)."),
]

out = ["# Symbol win animation video prompts (image-to-video)\n",
"Written 2026-11-19 for Darshan; revised the same day after the train test added a frame and made the locomotive jump. Generated by `tools/asset-pipeline/make_video_prompts.py`; edit the script and rerun to change all prompts at once.\n",
"## How to use",
"1. One video per symbol, in a new chat. Attach that symbol's tile as the **first frame** (the art you see in the game; for Power Dynamite use the original `19_power_symbol_dynamite.png` with its white background). If your tool supports a last frame, attach **the same image as the last frame** too: that is what makes it loop.",
"2. Paste the prompt. 4 s, 30 fps (24 fps is fine), same aspect ratio as the image.",
"3. Check: the camera and the main object never move, no frame was added, text is spelled right, the last frame matches the first. A slight drift is fine (I morph the last frames into the first).",
"4. Send me the MP4: I pick the 45 smoothest frames, cut the background and close the loop (`tools/asset-pipeline/anim_from_video.py`).\n",
"**Fix lines** (reply in the same chat if the result is off):",
"- Added a frame or border: `Do not add any frame or border. The edges of the image must stay exactly as in the original. Regenerate.`",
"- Object moved or jumped: `The main object must stay completely still; only light, glow, sparks and smoke move. Regenerate.`",
"- Camera moved: `Keep the camera completely still: no zoom, pan or shake. Regenerate.`",
"- Text changed: `The text must stay exactly as in the image, letter for letter, in every frame. Regenerate.`",
"- Doesn't loop: `The last frame must be identical to the first frame (the attached image). Regenerate.`",
"- Too little happening: `Make the glow, flash and sparks at the peak bigger and brighter; keep everything else unchanged. Regenerate.`\n",
"## The Outlaw (`sym_00`)\nDone 2026-11-19 from Darshan's own video; no prompt needed.\n"]
for e in S:
    body = PREFIX.format(desc=e["desc"], border=e["border"], subject=e["subject"], still_extra=e["still_extra"], extra_movers=e["movers"])
    body += "\n".join("- " + b for b in e["beats"]) + SUFFIX.format(subject=e["subject"], keep=e["keep"])
    out.append(f"## {e['name']} (`{e['sid']}`) — attach `{e['file']}`\n")
    out.append("```text\n" + body + "\n```\n")
out.append("## Prototype implementation status\n- 2026-11-19: Outlaw done from video (45 frames, 1.5 s). The other symbols still use their key-pose sheets (75 frames) until their videos arrive.\n")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs", "symbol-video-prompts.md"), "w").write("\n".join(out))
print(len(S))
