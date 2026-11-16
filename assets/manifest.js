/*
 * ASSET MANIFEST
 * ---------------------------------------------------------------------------
 * Every image and sound, keyed by asset ID. Paths follow one rule:
 *   assets/images/<folder>/<asset id>.<webp|jpg>
 * so art dropped into art/ with the asset ID as its file name is imported by
 * tools/asset-pipeline/import_art.py with no edits here. Missing files keep the
 * code-drawn placeholder (src/placeholders.js), so art can arrive one file at a time.
 *
 * Sizes (after import_art.py):
 *   bg_*_main ........ 1920 x 1080 JPG; the reel window is CONFIG.window (default x 215-1703, y 139-916)
 *   sym_*_idle ....... about 600 px wide, transparent, trimmed; fitted into the cell with the box in `fit`
 *   sym_00_expanded .. optional full-reel art for symbol 0 when it expands (else the symbol is stacked)
 *   fx_scatter_full .. full-reel Scatter, revealed down the reel when free spins trigger
 *   fx_lantern ....... small hanging decoration for anticipation and modals (any themed object)
 *   banner_win_* ..... title art above the amount (code-drawn ribbon when missing)
 *
 * Sounds: MP3 or WAV. They only load when the game is served over http(s). Without files,
 * synthesised placeholder sounds play.
 */
window.ASSET_MANIFEST = {
  // fitting box per symbol, [width, height] as a fraction of the cell; art may overflow the cell a little
  fit: {
    // the supplied symbols are framed tiles (watercolour panel + art), so they share one box
    default:          [0.96, 0.98],
    sym_wild_idle:    [0.98, 1.02],                 // round badges: a little larger, they have no panel
    sym_scatter_idle: [0.98, 1.02],
    sym_power_idle:   [0.98, 1.02]
  },

  images: {
    bg_base_main:           'assets/images/environment/bg_base_main.jpg',
    bg_freegame_main:       'assets/images/environment/bg_freegame_main.jpg',

    // symbols (Darshan's full asset sheet, docs/art-direction.md §2), highest pay first
    sym_00_idle:            'assets/images/symbols/sym_00_idle.webp',       // The Outlaw
    sym_00_expanded:        'assets/images/symbols/sym_00_expanded.webp',   // The Outlaw, full reel (on the train roof)
    sym_01_idle:            'assets/images/symbols/sym_01_idle.webp',       // Steam Train
    sym_02_idle:            'assets/images/symbols/sym_02_idle.webp',       // Gold Bars
    sym_03_idle:            'assets/images/symbols/sym_03_idle.webp',       // Sheriff's Star
    sym_04_idle:            'assets/images/symbols/sym_04_idle.webp',       // Wanted Poster
    sym_05_idle:            'assets/images/symbols/sym_05_idle.webp',       // Dynamite
    sym_06_idle:            'assets/images/symbols/sym_06_idle.webp',       // Revolver
    sym_07_idle:            'assets/images/symbols/sym_07_idle.webp',       // Money Bag
    sym_08_idle:            'assets/images/symbols/sym_08_idle.webp',       // Horseshoe
    sym_09_idle:            'assets/images/symbols/sym_09_idle.webp',       // Lantern
    sym_10_idle:            'assets/images/symbols/sym_10_idle.webp',       // A
    sym_11_idle:            'assets/images/symbols/sym_11_idle.webp',       // K
    sym_12_idle:            'assets/images/symbols/sym_12_idle.webp',       // Q
    sym_13_idle:            'assets/images/symbols/sym_13_idle.webp',       // J
    sym_14_idle:            'assets/images/symbols/sym_14_idle.webp',       // 10
    sym_wild_idle:          'assets/images/symbols/sym_wild_idle.webp',     // Wild (hat badge), reels 2-4
    sym_scatter_idle:       'assets/images/symbols/sym_scatter_idle.webp',  // Scatter (train badge)
    sym_power_idle:         'assets/images/symbols/sym_power_idle.webp',    // Power Dynamite: a Wild with a multiplier
    mult_x2:                'assets/images/symbols/mult_x2.webp',           // multiplier plates worn by Power Dynamite
    mult_x3:                'assets/images/symbols/mult_x3.webp',
    mult_x5:                'assets/images/symbols/mult_x5.webp',
    mult_x10:               'assets/images/symbols/mult_x10.webp',

    // win animations: 45 frames at 30 fps in a 9 x 5 sheet (see `anims` below), made from Darshan's 16-key-pose
    // sheets with tools/asset-pipeline/anim_from_keys.py; frame 1 of each is also the symbol's idle art
    sym_00_win:             'assets/images/anims/sym_00_win.webp',          // The Outlaw: draws, grins, holsters
    sym_01_win:             'assets/images/anims/sym_01_win.webp',          // Steam Train: steam and wheels
    sym_02_win:             'assets/images/anims/sym_02_win.webp',          // Gold Bars: shine sweep and glints
    sym_03_win:             'assets/images/anims/sym_03_win.webp',          // Sheriff's Star: glints travel round the badge
    sym_04_win:             'assets/images/anims/sym_04_win.webp',          // Wanted Poster: flutters
    sym_05_win:             'assets/images/anims/sym_05_win.webp',          // Dynamite: ticks, explodes, reassembles
    sym_06_win:             'assets/images/anims/sym_06_win.webp',          // Revolver: barrel heats, fires, smoke clears
    sym_07_win:             'assets/images/anims/sym_07_win.webp',          // Money Bag: bounces, coins glint
    sym_08_win:             'assets/images/anims/sym_08_win.webp',          // Horseshoe: glints

    // the Outlaw mascot beside the reels (full body, transparent, tall)
    char_mascot:            'assets/images/characters/char_mascot.webp',

    fx_scatter_full:        'assets/images/fx/fx_scatter_full.webp',
    fx_lantern:             'assets/images/fx/fx_lantern.webp',

    banner_win_nice:        'assets/images/banners/banner_win_nice.webp',
    banner_win_big:         'assets/images/banners/banner_win_big.webp',
    banner_win_mega:        'assets/images/banners/banner_win_mega.webp',
    banner_win_superb:      'assets/images/banners/banner_win_superb.webp',
    banner_win_sensational: 'assets/images/banners/banner_win_sensational.webp',
    banner_win_epic:        'assets/images/banners/banner_win_epic.webp',

    ui_splash_logo:         'assets/images/ui/ui_splash_logo.webp'
  },

  // sprite sheet layout for each *_win image: frames left to right, top to bottom
  anims: {
    sym_00_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_01_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_02_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_03_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_04_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_05_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_06_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_07_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_08_win: { cols: 9, rows: 5, frames: 45, fps: 30 }
  },

  sounds: {
    bgm_basegame_loop:      'assets/audio/bgm_basegame_loop.mp3',
    bgm_freegame_loop:      'assets/audio/bgm_freegame_loop.mp3',
    sfx_spin_button_click:  'assets/audio/sfx_spin_button_click.mp3',
    sfx_reel_spin:          'assets/audio/sfx_reel_spin.mp3',
    sfx_reel_stop_01:       'assets/audio/sfx_reel_stop_01.mp3',
    sfx_reel_stop_02:       'assets/audio/sfx_reel_stop_02.mp3',
    sfx_reel_stop_03:       'assets/audio/sfx_reel_stop_03.mp3',
    sfx_reel_stop_04:       'assets/audio/sfx_reel_stop_04.mp3',
    sfx_reel_stop_05:       'assets/audio/sfx_reel_stop_05.mp3',
    sfx_scatter_land:       'assets/audio/sfx_scatter_land.mp3',
    sfx_scatter_win:        'assets/audio/sfx_scatter_win.mp3',
    sfx_fuse:               'assets/audio/sfx_fuse.mp3',
    sfx_cracker_pop:        'assets/audio/sfx_cracker_pop.mp3',
    sfx_pick_tick:          'assets/audio/sfx_pick_tick.mp3',
    sfx_pick_stop:          'assets/audio/sfx_pick_stop.mp3',
    sfx_expand_flash:       'assets/audio/sfx_expand_flash.mp3',
    sfx_expand:             'assets/audio/sfx_expand.mp3',
    sfx_symbol_win_line:    'assets/audio/sfx_symbol_win_line.mp3',
    sfx_countup_loop:       'assets/audio/sfx_countup_loop.mp3',
    sfx_countup_end:        'assets/audio/sfx_countup_end.mp3',
    banner_hit:             'assets/audio/banner_hit.mp3'
  }
};
