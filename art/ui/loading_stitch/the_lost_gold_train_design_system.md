---
name: "The Lost Gold Train"
description: "Hand-painted Western watercolour and ink design system for The Lost Gold Train slot loading experience."
---

## Overview

The Lost Gold Train is a high-stakes Wild West slot game set during a moonlit desert railroad heist. The interface feels like an interactive title card painted in watercolour and dark-brown ink—tactile, cinematic, and woven directly into the key art rather than floating like a generic web page.

The aesthetic combines **hand-painted watercolour & ink** illustration with **tactile Western craft**: dark timber frames pinned with brass rivets, aged parchment feature cards with worn edges, and a cast-iron railway track where molten gold and a steaming locomotive mark loading progress.

## Colors

The palette is anchored in deep night indigo and teal skies so warm gold highlights, glowing embers, and aged parchment cards command immediate contrast.

- **Gold (`#F2B13A` / `#FFD66B`):** Molten progress fill, key percentages, logo back-glow, and primary action lettering.
- **Parchment (`#EAD7B0`):** Aged paper cards for feature teasers, paired with dark-brown ink text (`#23140A`).
- **Wood (`#3B2414`) & Brass (`#B8893A`):** Timber frames, signboards, corner rivets, button rims, and railway track end caps.
- **Crimson (`#9E2B25`):** Small high-drama accents such as dynamite sticks and wax/ribbon highlights.

```yaml
colors:
  gold: "#F2B13A"
  gold-bright: "#FFD66B"
  gold-deep: "#C08604"
  parchment: "#EAD7B0"
  parchment-edge: "#D5C4AF"
  on-parchment: "#23140A"
  wood: "#3B2414"
  wood-dark: "#26160B"
  on-wood: "#FFD66B"
  brass: "#B8893A"
  brass-light: "#E3B866"
  crimson: "#9E2B25"
  ink: "#23140A"
  night-indigo: "#0B1326"
  night-teal: "#0D2430"
  muted-mist: "#B8C2D6"
  dark:
    primary: "#F2B13A"
    on-primary: "#281900"
    primary-container: "#3B2414"
    on-primary-container: "#FFD66B"
    secondary: "#9E2B25"
    on-secondary: "#FFEEDA"
    surface: "#0B1326"
    surface-container: "#131B2E"
    surface-container-high: "#23140A"
    on-surface: "#FAF8FF"
    on-surface-variant: "#D5C4AF"
    outline: "#B8893A"
    outline-variant: "#504535"
```

## Typography

A bold Western slab-serif display face (**Rye**) gives titles, status callouts, and the primary CTA authentic frontier poster weight. **Bitter**, a sturdy, readable serif, handles feature descriptions, utility labels, and legal micro-copy with crisp legibility over dark scrims and aged parchment.

Custom hand-drawn inline SVGs with dark-brown ink outlines (`#23140A`) are used for all icons (sheriff star, dynamite, gold bars, sound, fullscreen, and the steam locomotive) so every graphic matches the watercolour-and-ink world.

```yaml
typography:
  display-lg:
    fontFamily: "Rye"
    fontSize: 40px
    fontWeight: 400
    lineHeight: 46px
    letterSpacing: 1.5px
  display-lg-mobile:
    fontFamily: "Rye"
    fontSize: 24px
    fontWeight: 400
    lineHeight: 30px
    letterSpacing: 1px
  headline-md:
    fontFamily: "Rye"
    fontSize: 28px
    fontWeight: 400
    lineHeight: 34px
    letterSpacing: 1px
  title-sm:
    fontFamily: "Rye"
    fontSize: 16px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0.8px
  label-caps:
    fontFamily: "Bitter"
    fontSize: 13px
    fontWeight: 700
    lineHeight: 18px
    letterSpacing: 2px
  body-md:
    fontFamily: "Bitter"
    fontSize: 15px
    fontWeight: 500
    lineHeight: 21px
    letterSpacing: 0.2px
  body-sm:
    fontFamily: "Bitter"
    fontSize: 13px
    fontWeight: 500
    lineHeight: 18px
    letterSpacing: 0.2px
  caption-xs:
    fontFamily: "Bitter"
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.4px
```

## Layout & Spacing

The composition preserves the central battleground of the key art—never covering the Outlaw on horseback or the gold-laden train. UI elements anchor cleanly into the darker upper sky and the darkened bottom desert band.

- **Desktop (1920×1080):** Full-bleed key art canvas (`min-h-screen`), thin transparent top utility bar, centered logo in the upper third, three parchment-and-wood feature teaser cards in a horizontal row, centered 60%-width railway loading track in the bottom third, and centered legal footer.
- **Mobile Portrait (390×844):** Compact top utility bar, centered logo near the top, three feature teaser cards stacked vertically in a tighter format, and the railway track loading bar anchored near the bottom above the legal line.

```yaml
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
```

## Elevation & Depth

Depth comes from atmospheric lighting and physical layering rather than modern web drop shadows or glassmorphism:

- **Vignette & Bottom Scrim:** Radial edge darkening and a deep night-indigo bottom gradient ensure crisp text contrast without obscuring the moonlit train.
- **Warm Gold Glow:** Soft radial gold halos behind the logo, molten progress rail, and Ready CTA button.
- **Ink Outlines & Wood Frames:** Dark-brown ink borders (`#23140A`) and inner brass bevels give cards and buttons painted, physical thickness. Never use `backdrop-blur` or glassmorphism.

## Shapes

Cards and signboards use slightly irregular, hand-crafted proportions with dark wood frames, brass corner rivets, and subtle worn-parchment edges. Utility icon buttons are circular with brass rims.

```yaml
rounded:
  none: 0px
  sm: 4px
  DEFAULT: 6px
  md: 10px
  lg: 14px
  full: 9999px
```

## Motion & Micro-interaction

Motion reinforces the live cinematic world:

- **Logo Light Sweep:** A subtle, slow diagonal gold sheen passes across the game logo.
- **Steam & Embers:** Delicate steam puffs drift upward from the mini locomotive progress marker, while faint golden embers and dust float across the night sky.
- **Ready CTA Pulse:** When loading completes, the wooden "CLICK TO RIDE" signboard pulses gently with a warm gold rim glow.

```yaml
motion:
  state-change:
    duration: 180ms
    delay: 0ms
    timingFunction: ease-out
  cta-pulse:
    duration: 2200ms
    delay: 0ms
    timingFunction: ease-in-out
  light-sweep:
    duration: 4500ms
    delay: 0ms
    timingFunction: ease-in-out
```

## Voice & Content Strategy

Copy is terse, evocative, and rooted in Wild West heist lore:

- **Headings & Callouts:** All-caps `Rye` display type (`EXPANDING SYMBOLS`, `POWER DYNAMITE`, `WIN UP TO 5,500x`, `CLICK TO RIDE`).
- **Status & Subcopy:** Title-case or sentence-case `Bitter` (`Stoking the Engine...`, `One symbol takes the reels in free spins`).
- **Restraint:** Zero menus, zero prices, zero extra chrome. Only the requested game elements and `18+ Play responsibly`.

## Components

Component implementations live as individual HTML sticker sheet files in
`components/`. Each file contains the canonical, styled HTML components with
`<!-- COMPONENT: name -->` comment markers. Read each file before use.

- **Button** → `@components/button.html`: `button-primary`, `button-icon`, `button-with-icon`
- **Card** → `@components/card.html`: `card-elevated`, `card-action`, `card-interactive`, `card-interactive-2`
- **Loading** → `@components/loading.html`: `loading-linear`, `loading-linear-2`, `loading-circular`, `loading-circular-2`, `loading-meter`
- **Typography** → `@components/typography.html`: `typography-display`, `typography-body`, `typography-label`
