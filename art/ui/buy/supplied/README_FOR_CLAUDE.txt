THE LOST GOLD TRAIN - BUY FEATURE UI ASSETS

MAIN SCREEN
buy_btn_normal.png
buy_btn_hover.png
buy_btn_pressed.png
buy_btn_release.png

POPUP
popup_frame.png
popup_title_buy_free_spins.png
popup_overlay_60pct_black.png

FREE SPINS OPTION
option_free_spins_normal.png
option_free_spins_hover.png
option_free_spins_pressed.png
option_free_spins_release.png

SUPER FREE SPINS OPTION
option_super_free_spins_normal.png
option_super_free_spins_hover.png
option_super_free_spins_pressed.png
option_super_free_spins_release.png

FEATURE MAX OPTION
option_feature_max_normal.png
option_feature_max_hover.png
option_feature_max_pressed.png
option_feature_max_release.png

CLOSE BUTTON
close_normal.png
close_hover.png
close_pressed.png
close_release.png

OPTIONAL DECOR
decor_hat.png
decor_gold_bars.png
decor_money_bag.png
decor_bullets.png
decor_wanted_poster.png
decor_lantern.png
decor_sheriff_star.png
decor_rope.png

INTERACTION FLOW
Normal -> Hover -> Pressed on pointer-down -> Release on pointer-up -> action.

IMPORTANT IMPLEMENTATION RULES
- Use one fixed-size wrapper per clickable element.
- Swap images inside the wrapper; do not reflow/reposition between states.
- Preload all states before enabling interaction.
- Main screen has ONE Buy Free Spins button only.
- Clicking it opens the modal with 3 options.
- Dim the underlying game with popup_overlay_60pct_black.png or equivalent CSS rgba(0,0,0,.6).
- Keep popup centered and scale the whole composition proportionally on smaller screens.
