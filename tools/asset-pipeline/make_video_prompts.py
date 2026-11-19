# Writes docs/symbol-video-prompts.md: image-to-video prompts for every symbol (edit here, rerun).
# v3 (2026-11-19, Darshan: "dull, lying dead... must feel like an action movie"): each image is treated as
# separate layers - border (locked), background (its own action), hero symbol (acts like a character) and FX.
# Rules kept from the first tests: describe exactly what is in each image, never invite a frame the image
# doesn't have, lock the camera, and make the hero snap back to its exact start pose so the loop closes.
import os

TILE = "the thin dark border and the four small rivets in the corners. It is locked: it never moves, glows or changes. Do NOT add any frame, panel, vignette or edge decoration."
PANEL = "the dark riveted metal panel edge. It is locked: it never moves or changes. Do NOT add another frame or decoration."
WHITE = "none. The background is plain white. Fire and sparks may cover it at the peak, but it is plain white again by the end. Do NOT add any frame, tile, shadow box or scenery."

PREFIX = """Animate the attached image as an explosive, action-movie win animation for a slot machine symbol. The image shows {desc}. The video must LOOP perfectly.

TREAT THE IMAGE AS SEPARATE LAYERS:
1. BORDER: {border}
2. BACKGROUND ({bg}): it animates on its own, independently of the symbol: {bg_action}
3. HERO SYMBOL ({subject}): it is a character with attitude and acts on its own: {hero_action}
4. FX on top of everything: {fx}

HARD RULES:
- STATIC TRIPOD SHOT: the camera is bolted down. No pan, no tracking, no side-to-side or up-down drift, no zoom, no rotation, no cuts, no shake. The border and the corners of the image stay at exactly the same pixels in every frame. Only things inside the image move.
- The {subject} stays inside the image and never touches the border. It may {may}, but it always snaps back to exactly its starting position, size and angle by the end.
- No new characters, hands, people, animals or objects.
- The video starts on the attached image and ends on exactly the same image.

TIMELINE (4 seconds, fast and punchy like a shot from an action movie):
"""
SUFFIX = """

STYLE: blockbuster Western action: snappy timing, strong anticipation, hard impacts, overshoot and follow-through; big bright flashes, heavy smoke, flying sparks; same painted art style, colours and detail as the image; the hero symbol keeps its exact design.

KEEP: {keep}

DO NOT: add a frame or border; let the {subject} leave the image or end in a new position; morph, melt or redesign anything; add or change any text, logo or watermark; slow, gentle or subtle motion; fade to black or white.

OUTPUT: 4 seconds, 30 fps, same aspect ratio as the image, no audio needed."""

S = [
 dict(name="Steam Train", sid="sym_01", file="02_steam_train",
  desc="a black steam locomotive with carriages on rails at sunset, under dark smoke clouds",
  subject="locomotive and its carriages", border=TILE,
  bg="sunset sky and clouds",
  bg_action="the clouds churn and boil in place, lit orange by the fire, and the sunset glow pulses; nothing in the background slides sideways.",
  hero_action="the train stands on the spot and does not travel: like a locomotive at full power before departure, its wheels spin in place on the rails, the connecting rods pump, the whole train shudders and strains, then lets out a huge whistle blast.",
  fx="black smoke columns, a white steam jet, orange sparks spraying from the wheels, a headlamp lens flare.",
  may="shudder and rock a little in place",
  beats=["0.0-0.6 s: the headlamp blazes on; the wheels start to turn in place; the train shudders as steam builds.",
         "0.6-1.6 s: full power: the wheels spin into a blur on the spot, the rods pump hard, sparks spray off the rails, a thick black smoke column blasts from the chimney and billows up into the clouds.",
         "1.6-2.4 s: PEAK: a huge white steam jet screams out of the whistle; the headlamp fires a blinding beam with a lens flare straight at the viewer; the train strains and shudders hard, still in the same place.",
         "2.4-3.3 s: the train settles; smoke and steam roll up and thin out; sparks fade.",
         "3.3-4.0 s: the wheels stop at their starting position; the smoke settles into exactly its starting shape."],
  keep="the locomotive's position on the rails, its shape, colours and details; the number of carriages; the sunset colours."),
 dict(name="Gold Bars", sid="sym_02", file="03_gold_bars",
  desc="a pile of shiny gold bars and small gold nuggets on a glowing orange-red painted background",
  subject="pile of gold bars", border=TILE,
  bg="glowing orange-red backdrop",
  bg_action="it erupts into spinning golden light rays and rolling heat shimmer, like a vault blown open.",
  hero_action="the top gold bar launches up, flips once end over end, catching the light, and slams back down into its exact place with a heavy clang; the whole pile jolts and the nuggets bounce.",
  fx="gold sparks, a white impact flash, gold dust, a shine slash across the bars.",
  may="jolt and bounce, and the top bar may flip up and land back",
  beats=["0.0-0.6 s: the pile trembles; the nuggets rattle; a glow builds underneath.",
         "0.6-1.4 s: the top bar launches up, spins once end over end, flashing in the light; the background bursts into spinning gold rays.",
         "1.4-2.0 s: PEAK: the bar slams back into its exact place: a white impact flash, a ring of gold sparks blasts outward, the whole pile jolts down and up, nuggets bounce.",
         "2.0-3.2 s: a bright shine slashes across all the bars; gold dust rains down; the rays keep spinning and slowly fade.",
         "3.2-4.0 s: everything settles to exactly the starting image."],
  keep="the exact number, size and arrangement of the gold bars and nuggets at the start and end; the background colours."),
 dict(name="Sheriff's Star", sid="sym_03", file="04_sheriff_badge",
  desc="a gold six-point sheriff's star badge with the word SHERIFF across it and a ball on each point, on a dark red-brown painted background",
  subject="badge", border=TILE,
  bg="dark red-brown backdrop",
  bg_action="dust blasts outward from behind the badge in a ring and the backdrop pulses with hot light, like a showdown at high noon.",
  hero_action="a bullet ricochets off the badge with a spark: the badge kicks back and swings, then punches forward toward the viewer and snaps back, proud and unbroken.",
  fx="a ricochet spark streak, a shockwave ring, star flashes on the point balls, a shine sweep.",
  may="kick back, swing up to 20 degrees and punch toward the viewer (up to 15% larger)",
  beats=["0.0-0.6 s: hot light builds behind the badge; the point balls glint one by one.",
         "0.6-1.2 s: CLANG: a bullet ricochets off the badge with a bright spark streak flying off to the side; the badge kicks back and swings.",
         "1.2-2.0 s: PEAK: the badge punches forward toward the viewer; a shockwave ring and a dust ring blast out behind it; star flashes pop on all six point balls.",
         "2.0-3.2 s: the badge springs back with a small overshoot; a bright shine sweeps across SHERIFF without changing the letters.",
         "3.2-4.0 s: the badge settles to exactly its starting position; the dust clears."],
  keep="the word SHERIFF exactly as written, letter for letter, in every frame; six points with a ball on each; no bullet hole, scratch or damage at the end."),
 dict(name="Wanted Poster", sid="sym_04", file="05_wanted_poster",
  desc="an old paper wanted poster nailed up, with WANTED at the top, a portrait of a bearded outlaw in a hat, and $10,000 at the bottom",
  subject="poster", border=TILE,
  bg="the wall behind the poster",
  bg_action="a desert wind storm hits it: dust and sand stream across from left to right and a hot orange light flickers over it.",
  hero_action="the wind tears at the poster: the paper flaps and snaps hard while it stays nailed at the corners; the outlaw in the portrait comes alive, his eyes dart to the viewer and narrow into a glare with a smirk.",
  fx="blowing dust and sand, a gold blaze on $10,000, flying embers.",
  may="flap, ripple and snap in the wind while staying nailed",
  beats=["0.0-0.6 s: the wind picks up; dust streams across; the paper edges start to flutter.",
         "0.6-1.6 s: a hard gust: the poster flaps and snaps; the outlaw's eyes dart to the viewer and narrow into a glare; a smirk.",
         "1.6-2.4 s: PEAK: $10,000 blazes bright gold with a burst of sparks and light rays; the paper strains against its nails.",
         "2.4-3.3 s: the gust drops; the paper ripples less and less; the outlaw's face goes back to its original expression.",
         "3.3-4.0 s: the paper lies flat exactly as at the start; the dust clears."],
  keep="the words WANTED and $10,000 exactly as written, letter for letter, in every frame; the portrait's face at the start and end; the nails; the paper never tears."),
 dict(name="Dynamite", sid="sym_05", file="06_dynamite_timer",
  desc="a bundle of red dynamite sticks with a round alarm clock strapped on the front and a coiled wire at the top, on a fiery orange burst background",
  subject="dynamite bundle and clock", border=TILE,
  bg="fiery orange burst",
  bg_action="it becomes a real explosion: a huge fireball erupts behind the bundle, a shockwave ring blasts outward, then it collapses back into the orange burst.",
  hero_action="the clock hands spin wildly, the bundle trembles harder and harder as if about to blow, then is jolted back by the blast behind it and rocks forward, still in one piece.",
  fx="fizzing sparks from the wire, the fireball, flying embers, black smoke.",
  may="tremble, shake and jolt back with the blast",
  beats=["0.0-0.6 s: sparks fizz from the wire; the clock hands start to spin faster and faster.",
         "0.6-1.4 s: the clock hands whirl; the clock face glows red; the bundle shakes harder; sparks spray.",
         "1.4-2.1 s: PEAK, KABOOM: a huge fireball erupts in the background behind the bundle with a white flash and a shockwave ring; the bundle is jolted back and rocks forward.",
         "2.1-3.2 s: the fireball rolls into black smoke and falling embers; the bundle shudders to a stop.",
         "3.2-4.0 s: the smoke clears, the clock hands return to their starting position, back to exactly the starting image."],
  keep="the bundle always stays whole: the exact number of sticks; the clock design and numbers; the wire coil."),
 dict(name="Revolver", sid="sym_06", file="07_revolver",
  desc="a silver revolver with a wooden grip lying diagonally on a streaky orange-red painted background",
  subject="revolver", border=TILE,
  bg="streaky orange-red backdrop",
  bg_action="it flashes white-hot with each shot and its streaks blur outward like a shockwave.",
  hero_action="the gun fires three shots: on each shot it kicks back with recoil, the hammer snaps and the cylinder turns; after the last shot it spins once around its middle, gunslinger style, and snaps back.",
  fx="big muzzle flashes, fire and sparks, shockwave rings, grey gun smoke.",
  may="recoil up to 15 degrees and spin once around its centre",
  beats=["0.0-0.5 s: a glint slides along the barrel; the hammer cocks.",
         "0.5-1.5 s: BANG, BANG: two shots, each with a muzzle flash, sparks and a hard recoil kick; the background flashes white-hot each time.",
         "1.5-2.2 s: PEAK: the third shot is the biggest: a blinding muzzle flash with fire and a shockwave ring.",
         "2.2-3.2 s: the revolver spins once around its centre, gunslinger style, and snaps back into place; gun smoke curls from the muzzle.",
         "3.2-4.0 s: the smoke fades; back to exactly the starting image."],
  keep="the revolver's design, its starting angle and position; the wooden grip; the background."),
 dict(name="Money Bag", sid="sym_07", file="08_money_bag",
  desc="a tied burlap money bag with a big dark dollar sign on it, sitting on wooden planks, on a streaky orange painted background",
  subject="money bag", border=TILE,
  bg="streaky orange backdrop and wooden planks",
  bg_action="gold coins rain down behind the bag and the backdrop flares with gold light rays.",
  hero_action="the bag is stuffed with loot: it bulges, jumps up, lands with a heavy thud, and a fountain of gold coins bursts out of its top.",
  fx="gold coins, gold dust, a dust puff from the planks, a gold blaze on the dollar sign.",
  may="squash, stretch, bulge and hop",
  beats=["0.0-0.6 s: the bag bulges and squashes down, ready to jump.",
         "0.6-1.3 s: the bag jumps up; a fountain of gold coins bursts out of the top.",
         "1.3-2.0 s: PEAK: THUD: it lands with a squash, a dust puff blasts off the planks; the dollar sign blazes gold; coins rain down behind it.",
         "2.0-3.2 s: the bag wobbles and settles; the coins fall out of view and fade; gold dust sparkles.",
         "3.2-4.0 s: back to exactly the starting image."],
  keep="the dollar sign exactly as it is; the bag's shape and tie at the start and end; the wooden planks."),
 dict(name="Horseshoe", sid="sym_08", file="09_horseshoe",
  desc="a metal horseshoe with nail holes, open end up, on a dark wooden plank background",
  subject="horseshoe", border=TILE,
  bg="dark wooden planks",
  bg_action="they are lit by a blacksmith's forge: orange fire light flickers over them and sparks bounce off them.",
  hero_action="the horseshoe is struck three times as if on an anvil: on each strike it jolts and a shower of sparks blasts off it; it heats up glowing orange-hot, then cools in a burst of lucky gold light.",
  fx="spark showers, a white impact flash on each strike, orange heat glow, a gold light burst.",
  may="jolt and shake on each strike",
  beats=["0.0-0.6 s: forge light flickers over the planks; the horseshoe starts to glow at its bottom.",
         "0.6-1.6 s: CLANG, CLANG: two strikes, each with a white flash, a jolt and a spark shower; the horseshoe glows orange-hot.",
         "1.6-2.3 s: PEAK: the third, biggest strike: a huge spark shower and the horseshoe glows white-hot.",
         "2.3-3.3 s: it cools in a burst of lucky gold light with star sparkles; sparks fall and bounce off the planks.",
         "3.3-4.0 s: back to its original metal colour, exactly the starting image."],
  keep="the horseshoe's shape and the number of nail holes; its starting colour at the start and end; the wooden planks."),
 dict(name="Lantern", sid="sym_09", file="10_lantern",
  desc="an old brass oil lantern with a glass globe and a glowing flame inside, on a fiery orange burst background",
  subject="lantern", border=TILE,
  bg="fiery orange burst",
  bg_action="it turns into a swirling firestorm that spins around the lantern, then calms back into the orange burst.",
  hero_action="the lantern swings hard as if grabbed by a wind, its glass rattles, and the flame roars up into a big fire that licks out of the top.",
  fx="flames, glowing embers, heat haze, warm light rays.",
  may="swing up to 25 degrees from its handle and rattle",
  beats=["0.0-0.6 s: the flame dims low; the background darkens; a wind picks up.",
         "0.6-1.5 s: the lantern swings hard to one side and back; the flame catches and grows; embers fly.",
         "1.5-2.4 s: PEAK: WHOOSH: the flame roars up into a big fire licking out of the top; the background becomes a spinning firestorm; light rays blast through the glass.",
         "2.4-3.3 s: the lantern swings back with smaller swings; the fire shrinks into the globe; embers drift up.",
         "3.3-4.0 s: the lantern hangs still and the flame is back to exactly the starting image."],
  keep="the lantern's design, brass colour and handle; the glass globe never breaks."),
]
ROY_FX = {"A": "flames and fire trails", "K": "gold sparks and gold coins of light", "Q": "copper embers and hot sparks",
          "J": "crackling blue-white electric sparks", "10": "steel sparks and white smoke"}
for L, f, col in [("A", "11_royal_A", "red"), ("K", "12_royal_K", "gold-orange"), ("Q", "13_royal_Q", "orange-copper"), ("J", "14_royal_J", "silver"), ("10", "15_royal_10", "silver")]:
    fx = ROY_FX[L]
    S.append(dict(name=L, sid="sym_%02d" % (10 + ["A", "K", "Q", "J", "10"].index(L)), file=f,
      desc='a big %s Western-style "%s" with small metal studs, on a scratched orange painted plate' % (col, L),
      subject='"%s"' % L, border=TILE,
      bg="scratched orange plate",
      bg_action="it blasts with a shockwave of dust and spinning light rays, then cools down.",
      hero_action='the "%s" winds up, punches forward toward the viewer like a fist, slams back into place with a metal impact, and its studs fire off %s.' % (L, fx),
      fx="%s, a white impact flash, a shine slash across the %s." % (fx, L),
      may="squash, stretch and punch toward the viewer (up to 20% larger)",
      beats=['0.0-0.6 s: the "%s" pulls back and squashes, winding up; light builds behind it.' % L,
             '0.6-1.3 s: it punches forward toward the viewer, stretching; %s burst from its studs.' % fx,
             "1.3-2.0 s: PEAK: it slams back into place: a white impact flash, a dust shockwave blasts across the plate, spinning light rays.",
             "2.0-3.2 s: a bright shine slashes across the %s; it wobbles with a small overshoot; the %s die down." % (L, fx.split(" and ")[0]),
             "3.2-4.0 s: back to exactly the starting image."],
      keep='the symbol exactly "%s" in the same font, colour and design in every frame; no other letter or number.' % L))
S += [
 dict(name="Wild", sid="sym_wild", file="17_wild",
  desc="a dark red panel with a round gold-rimmed emblem: a cowboy hat on top, the word WILD in big gold letters, and two crossed revolvers with a gold star below",
  subject="emblem, hat and revolvers", border=PANEL,
  bg="dark red panel behind the emblem",
  bg_action="it erupts in fire and spinning gold light rays, like a saloon shoot-out.",
  hero_action="the hat flips up off the emblem, spins once and lands back in place; both revolvers fire with big muzzle flashes; the letters W-I-L-D slam in one after another; the whole emblem pulses with power.",
  fx="muzzle flashes, fire, gold sparks, shockwave rings, gun smoke.",
  may="pulse and shake; the hat may flip up and land back",
  beats=["0.0-0.6 s: the emblem pulses; heat glow builds behind it.",
         "0.6-1.3 s: the hat flips up off the emblem, spinning once in the air.",
         "1.3-2.1 s: PEAK: both revolvers fire with big muzzle flashes; the letters W, I, L, D slam with a flash one after another; the background erupts in fire and gold rays; the emblem shakes.",
         "2.1-3.2 s: the hat lands back in place with a bounce; gun smoke curls; sparks rain down.",
         "3.2-4.0 s: back to exactly the starting image."],
  keep="the word WILD exactly as written, letter for letter, in every frame; the hat; two revolvers and one star."),
 dict(name="Scatter", sid="sym_scatter", file="18_scatter",
  desc="a dark red panel with a round emblem showing a black steam locomotive at sunset with smoke from its chimney, a red ribbon with the word SCATTER across the bottom, and a gold star below",
  subject="emblem, locomotive and ribbon", border=PANEL,
  bg="dark red panel and the sunset sky inside the emblem",
  bg_action="the sunset sky inside the emblem glows and pulses and its clouds churn in place; steam bursts out from behind the emblem's edge onto the red panel.",
  hero_action="the locomotive inside the emblem stays on the spot at full power: its wheels spin in place, it shudders with power and blows a huge whistle of steam; the ribbon snaps in the wind; the gold star spins once.",
  fx="smoke, steam, sparks, a headlamp lens flare, gold light rays.",
  may="pulse and shake; the ribbon may flap and the star may spin once",
  beats=["0.0-0.6 s: the headlamp blazes on; the wheels start to spin.",
         "0.6-1.5 s: full power: smoke blasts from the chimney; the clouds churn; sparks fly off the rails; the ribbon flaps.",
         "1.5-2.3 s: PEAK: a huge whistle of steam bursts out past the emblem's edge; the headlamp flares straight at the viewer; gold rays blast behind the emblem.",
         "2.3-3.3 s: the gold star spins once; the steam rolls away; a shine sweeps along SCATTER without changing the letters.",
         "3.3-4.0 s: everything slows and settles to exactly the starting image."],
  keep="the word SCATTER exactly as written, letter for letter, in every frame; the round emblem and ribbon shapes."),
 dict(name="Power Dynamite", sid="sym_power", file="19_power_symbol_dynamite",
  desc="a bundle of red dynamite sticks with a round clock on the front and a wire coil at the top, in front of an orange-yellow explosion burst, on a plain white background",
  subject="dynamite bundle and clock", border=WHITE,
  bg="orange-yellow explosion burst",
  bg_action="it detonates into a huge fireball with crackling electric energy, then collapses back to its starting shape.",
  hero_action="the bundle shakes violently, the clock hands spin wildly, it jolts back from the blast and rocks forward, still in one piece.",
  fx="fizzing sparks from the wire, fire, crackling orange electricity, embers.",
  may="shake violently and jolt back with the blast",
  beats=["0.0-0.6 s: sparks fizz from the wire; the clock hands start spinning.",
         "0.6-1.3 s: the sticks glow hot; the bundle shakes harder and harder; crackling energy runs over it.",
         "1.3-2.0 s: PEAK, KABOOM: the burst detonates into a huge fireball with a white flash; the bundle jolts back and rocks forward.",
         "2.0-3.2 s: the fireball shrinks, crackling electricity flickers and fades into embers.",
         "3.2-4.0 s: the clock hands return to their start; the burst shrinks back to its starting shape on plain white."],
  keep="the bundle always whole; the exact number of sticks; the clock design; plain white background at the start and end. No text or number (the game adds the multiplier plate)."),
]

out = ["# Symbol win animation video prompts (image-to-video)\n",
"Version 3, 2026-11-19. Darshan found v2 dull (\"a small sparkle, a dead light sweep\"), so every prompt now treats the image as separate layers: a locked border, a background with its own action, and the symbol as an action hero that moves, hits and recoils, then snaps back to its start pose so the loop closes. Generated by `tools/asset-pipeline/make_video_prompts.py`; edit the script and rerun to change all prompts at once.\n",
"## How to use",
"1. One video per symbol, in a new chat. Attach that symbol's tile as the **first frame** (for Power Dynamite use the original `19_power_symbol_dynamite.png` with its white background). If your tool supports a last frame, attach **the same image as the last frame**: that is what makes it loop.",
"2. Paste the prompt. 4 s, 30 fps (24 fps is fine), same aspect ratio as the image.",
"3. Check: the camera stayed still, no frame was added, text is spelled right, the symbol is back in place at the end. A slight drift is fine (I morph the last frames into the first).",
"4. Send me the MP4: I pick the 45 best frames, cut the background and close the loop (`tools/asset-pipeline/anim_from_video.py`).\n",
"Each prompt below is complete in one paste: the rules, the negative prompt and a final check are all inside it. The fix lines are only for a follow-up message if a result still comes out wrong.\n",
"**Fix lines** (reply in the same chat if the result is off):",
"- Still too calm: `Make it twice as intense: faster, harder impacts, bigger flashes, more smoke and sparks. Keep everything else. Regenerate.`",
"- Background didn't move: `The background must animate on its own as described, separately from the symbol. Regenerate.`",
"- Added a frame or border: `Do not add any frame or border. The edges of the image must stay exactly as in the original. Regenerate.`",
"- Symbol flew off or ended in a new place: `The symbol must stay inside the image and snap back to exactly its starting position and size by the end. Regenerate.`",
"- Camera moved or slid side to side: `Static tripod shot: the camera must not move at all. The border and image edges stay at exactly the same position in every frame; the train stays on the spot and does not travel. Regenerate.`",
"- Text changed: `The text must stay exactly as in the image, letter for letter, in every frame. Regenerate.`",
"- Doesn't loop: `The last frame must be identical to the first frame (the attached image). Regenerate.`\n",
"## The Outlaw (`sym_00`)\nDone 2026-11-19 from Darshan's own video; no prompt needed.\n"]
TAIL = """

NEGATIVE PROMPT: camera movement, pan, tracking shot, zoom, camera shake, camera rotation, added frame, added border, vignette, cropped edges, {neg_extra}morphing, melting, distorted shapes, changed design, misspelled text, new text, watermark, logo, new characters, people, hands, animals, fade to black, fade to white, blurry, low quality.

FINAL CHECK (fix before output, regenerate if any fails):
- The camera never moved and the border and image edges stayed on exactly the same pixels.
- No frame, border or decoration was added.
- {check_subject}
- Any text is exactly as in the image, letter for letter.
- The last frame is identical to the first frame, so the video loops seamlessly."""
CUSTOM = {"sym_01": open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "prompt_train.txt")).read().strip()}
for e in S:
    body = PREFIX.format(**{k: e[k] for k in ("desc", "border", "bg", "bg_action", "subject", "hero_action", "fx", "may")})
    body += "\n".join("- " + b for b in e["beats"]) + SUFFIX.format(subject=e["subject"], keep=e["keep"])
    if e["sid"] in CUSTOM: body = CUSTOM[e["sid"]]
    tr = e["sid"] == "sym_01"
    body = body.replace("\n\nOUTPUT:", TAIL.format(
        neg_extra="train moving, train jumping, train bouncing, smoke from wheels, smoke everywhere, poles in front of the train, " if tr else "",
        check_subject="The train body stayed fixed and only moved its wheels and rods; smoke came only from the chimney; poles and clouds passed only behind the train." if tr else "The " + e["subject"] + " is back in exactly its starting position, size and angle at the end, and it never touched the border.")
        + "\n\nOUTPUT:", 1) if "\n\nOUTPUT:" in body else body + TAIL.format(neg_extra="", check_subject="")
    out.append(f"## {e['name']} (`{e['sid']}`) — attach `{e['file']}`\n")
    out.append("```text\n" + body + "\n```\n")
out.append("## Prototype implementation status\n- 2026-11-19: Outlaw done from video (45 frames, 1.5 s). 2026-11-19: Steam Train to Lantern, Wild, Scatter and Power Dynamite done from Darshan's videos with `anim_from_video2.py` (75 frames). Still to come: A, K, Q, J, 10.\n- 2026-11-19: prompts rewritten as v3 (action-movie, layered). v1 and v2 are in git history.\n- 2026-11-19: v3.1: the train video panned side to side, so every prompt now asks for a static tripod shot, and the train and scatter no longer say \"races past\" or \"full speed\" (the trains stay on the spot at full power).\n- 2026-11-19: v3.2: the train still jumped and smoked everywhere, so it has its own short prompt (`prompt_train.txt`): the body is rigid, only the wheels, chimney smoke, lights and sparks move, and the chimney is the only smoke source.\n- 2026-11-19: v3.3: Darshan liked v3.2 but the train looked parked, so telegraph poles and clouds now rush past behind it while the camera and train stay fixed.\n")
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "docs", "symbol-video-prompts.md"), "w").write("\n".join(out))
print(len(S))
