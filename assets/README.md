# Assets

The game loads only what `assets/manifest.js` lists, from `assets/images/` and `assets/audio/`. Missing files keep the code-drawn placeholder (`src/placeholders.js`) or the synthesised sound (`src/audio.js`), so art can arrive one file at a time.

- **Add art:** put it in `art/` named by asset ID and run `python3 tools/asset-pipeline/import_art.py` (see `art/README.md`). Don't edit files here by hand; re-import instead.
- **Fit:** symbol sizes are boxes in `manifest.js` → `fit`; the reel area is `CONFIG.window` in `src/config.js`.
- **Sounds:** MP3 in `assets/audio/` with the names in `manifest.js` → `sounds`; they load only when the game is served over http.
- **Delivered so far (2026-11-16):** all 9 symbols, the Dynamite, the Outlaw mascot and his full-reel art, and the fuse strip, from `Last_Train_Gold_Separated_Assets.zip` (originals in `assets/source/originals/last_train_gold/`, cut-outs in `art/`). Missing: backgrounds, banners, logo, lantern, sounds. Details: `docs/game-asset-specification.md`.
- **White-background tiles:** `python3 tools/asset-pipeline/cut_white_tiles.py in.png art/symbols/<id>.png`, then `import_art.py`.
