# Changelog

Newest first.

## 2026-11-16: art direction
- `docs/art-direction.md`: watercolour Western direction from Darshan's references (saved in `docs/art-reference/`), proposed symbol set in Book of Tut roles, free spins moments, prompts for every asset ID. No code changes.

## 2026-11-16: The Lost Gold Train started
- New repo from `slot-starter-template`. Title set to The Lost Gold Train (`CONFIG.title`, `CONFIG.texts`).
- `docs/reference-game.md`: research on *John Hunter and the Book of Tut* (rules, pay table, RTP variants, measured play stats, feature buy, the separate Respin version, unknowns), every fact with its source.
- Game still plays the template's sample maths and placeholder art.

## 2026-11-16: template created
- Made from New Year Crackers (`fxdarshan/01_New_Year_Crackers` at 9afcb2b): game art removed, sample config with neutral symbol names (Crown, Ruby, Emerald, Sapphire, Gold Bar, Coins, A-10, Scatter), theme texts moved to `CONFIG.texts`, the single-file build named after `CONFIG.title`.
- Art inbox `art/` and `tools/asset-pipeline/import_art.py`: files named by asset ID are imported with no manifest edits. Mockup clean-up tools take the reel window as an argument.
- Optional art (`sym_00_expanded`, `fx_lantern`, banners, splash logo) is only drawn when supplied.
- `CLAUDE.md` house rules, `HANDOFF.md`, `WORKFLOW.md` (Claude Code at home + claude.ai chat elsewhere, GitHub as the bridge), `NEW_GAME.md`, spec templates in `docs/templates/`, and five project skills in `.claude/skills/`.
- Checks: 20/20 edge cases pass with placeholder art.
