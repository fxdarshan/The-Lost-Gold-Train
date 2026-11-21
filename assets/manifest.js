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
    default:          [0.99, 0.99],
    sym_power_idle:   [0.98, 1.02],                 // round badge with no panel: a little larger
    sym_wild_idle:    [0.99, 1.04],                 // square panels from the 2026-11-19 videos
    sym_scatter_idle: [0.99, 1.04]
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
    sym_00_win:             'assets/images/anims/sym_00_win.webp',          // The Outlaw: from Darshan's video, 45 frames, 1.5 s loop
    sym_01_win:             'assets/images/anims/sym_01_win.webp',          // Steam Train: poles rush past, wheels, chimney smoke, headlamp (video, 45 frames)
    sym_02_win:             'assets/images/anims/sym_02_win.webp',          // Gold Bars: top bar flips and slams back, gold burst (video, 45 frames)
    sym_03_win:             'assets/images/anims/sym_03_win.webp',          // Sheriff's Star: bullet ricochet, punch forward, dust ring (video, 45 frames)
    sym_04_win:             'assets/images/anims/sym_04_win.webp',          // Wanted Poster: wind storm, $10,000 blazes (video, 45 frames)
    sym_05_win:             'assets/images/anims/sym_05_win.webp',          // Dynamite: clock whirls, fireball behind (video, 45 frames)
    sym_06_win:             'assets/images/anims/sym_06_win.webp',          // Revolver: three shots, recoil, gunslinger spin (video, 45 frames)
    sym_07_win:             'assets/images/anims/sym_07_win.webp',          // Money Bag: jumps, coin fountain (video, 45 frames)
    sym_08_win:             'assets/images/anims/sym_08_win.webp',          // Horseshoe: anvil strikes, white-hot, lucky gold (video, 45 frames)
    sym_09_win:             'assets/images/anims/sym_09_win.webp',          // Lantern: flame roars, firestorm (video, 45 frames)
    sym_11_win:             'assets/images/anims/sym_11_win.webp',          // K: glints
    sym_12_win:             'assets/images/anims/sym_12_win.webp',          // Q: glints
    sym_13_win:             'assets/images/anims/sym_13_win.webp',          // J: glints
    sym_14_win:             'assets/images/anims/sym_14_win.webp',          // 10: glints
    sym_wild_win:           'assets/images/anims/sym_wild_win.webp',        // Wild: hat flip, both revolvers fire (video, 45 frames)
    sym_scatter_win:        'assets/images/anims/sym_scatter_win.webp',     // Scatter: train charges, steam burst (video, 45 frames)
    sym_power_win:          'assets/images/anims/sym_power_win.webp',       // Power Dynamite: fuse, blast (video, 45 frames)

    // the Outlaw mascot beside the reels (full body, transparent, tall)
    char_mascot:            'assets/images/characters/char_mascot.webp',
    char_outlaw_parts:      'assets/images/characters/char_outlaw_parts.webp',   // cutout puppet atlas (assets/rigs/outlaw.js)
    // the Outlaw mascot from Darshan's green-screen videos (2026-11-19), keyed and cut to 15 fps sheets of 288-320 x 528 cells (played at 30 fps, drawn about 1.75x)
    char_outlaw_idle1:      'assets/images/characters/char_outlaw_idle1.webp',   // wind in the poncho, 5 s
    char_outlaw_idle2:      'assets/images/characters/char_outlaw_idle2.webp',   // gun spin, 5 s
    char_outlaw_win:        'assets/images/characters/char_outlaw_win.webp',     // fires, blows the smoke, 10 s

    fx_scatter_full:        'assets/images/fx/fx_scatter_full.webp',
    fx_lantern:             'assets/images/fx/fx_lantern.webp',

    // Big Win screens (Darshan 2026-11-21): one full illustration per tier, the amount is drawn below in code
    banner_win_nice:        'assets/images/banners/bigwin/bigwin_nice.webp',
    banner_win_big:         'assets/images/banners/bigwin/bigwin_big.webp',
    banner_win_mega:        'assets/images/banners/bigwin/bigwin_mega.webp',
    banner_win_super:       'assets/images/banners/bigwin/bigwin_super.webp',
    banner_win_epic:        'assets/images/banners/bigwin/bigwin_epic.webp',
    // Free Spins outro (Darshan 2026-11-21): background, board, ribbon, gold; all text drawn in code from the result
    ui_outro_bg:            'assets/images/ui/outro/bg_outro.webp',
    ui_outro_board:         'assets/images/ui/outro/board_main.png',
    ui_outro_ribbon:        'assets/images/ui/outro/ribbon_free_spins.png',
    ui_outro_gold:          'assets/images/ui/outro/gold_pile.png',

    ui_splash_logo:         'assets/images/ui/ui_splash_logo.webp',
    // Buy Feature UI: Darshan's clean final PNGs (Lost_Gold_Train_Buy_Feature_CLEAN_FINAL.zip, 2026-11-21), one image
    // per control, unscaled; neighbour slivers trimmed by tools/asset-pipeline/clean_buy_ui_final.py (originals in
    // art/ui/buy/supplied/). The board already carries the title and chains long enough to reach the top.
    ui_buy_buy_free_spins_button: 'assets/images/ui/buy/buy_free_spins_button.png',
    ui_buy_popup_board_with_title: 'assets/images/ui/buy/popup_board_with_title.png',
    ui_buy_option_free_spins: 'assets/images/ui/buy/option_free_spins.png',
    ui_buy_option_super_free_spins: 'assets/images/ui/buy/option_super_free_spins.png',
    ui_buy_option_feature_max: 'assets/images/ui/buy/option_feature_max.png',
    ui_buy_close_button: 'assets/images/ui/buy/close_button.png',
    ui_buy_decor_wood_plank: 'assets/images/ui/buy/decor_wood_plank.png'   // free spins: board for the expanding symbol
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
    sym_08_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_09_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_11_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_12_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_13_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_14_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_wild_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_scatter_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    sym_power_win: { cols: 9, rows: 5, frames: 45, fps: 30 },
    char_outlaw_idle1: { cols: 14, rows: 6, frames: 77, fps: 15 },
    char_outlaw_idle2: { cols: 14, rows: 6, frames: 77, fps: 15 },
    char_outlaw_win: { cols: 20, rows: 8, frames: 151, fps: 15 }
  },

  // music loop points (s): each file has 0.5 s of the loop's end before it and 0.5 s of its start after it, so the
  // loop [start, start + length] is seamless whatever padding the MP3 encoder adds (tools/audio/compose_music.py)
  music: {
    bgm_basegame_loop: { start: 0.5, length: 45.7143 },   // "Rattlesnake Ridge", 84 BPM, 16 bars
    bgm_freegame_loop: { start: 0.5, length: 26.6667 }    // "Gold Train Heist", 144 BPM, 16 bars
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
