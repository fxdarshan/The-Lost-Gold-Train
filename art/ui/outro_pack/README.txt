THE LOST GOLD TRAIN — FREE SPINS OUTRO ASSET PACK

PURPOSE
Character-free outro screen shown after Free Spins end.

CORE LAYOUT
- Background full screen
- Main wooden board centered
- Red ribbon attached to / below board
- Optional small gold pile at board base
- No character
- No extra decorative clutter

DYNAMIC TEXT
Claude/game UI must render these values dynamically from the actual game result:

1) FREE SPINS
   Fixed label.

2) TOTAL WIN
   Fixed label.

3) {WIN_AMOUNT}
   Dynamic amount, for example:
   5,480x
   12,360x
   842.50

4) IN {FREE_SPIN_COUNT} FREE SPINS
   Dynamic number of Free Spins, for example:
   IN 10 FREE SPINS
   IN 12 FREE SPINS
   IN 20 FREE SPINS

Do NOT bake the win amount or spin count into any PNG.

FILES
- bg_outro.png
- board_main.png
- ribbon_free_spins.png
- gold_pile.png
- overlay_optional_30pct.png
- reference_full_composition.png
- CLAUDE_IMPLEMENTATION_PROMPT.txt
- MAGNIFIC_ANIMATION_PROMPT.txt

KEEP IT LIGHTWEIGHT
- Use CSS transforms + opacity only.
- No particle engine.
- No glow filters.
- No video texture.
- No character animation.
