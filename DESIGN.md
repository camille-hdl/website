---
name: camillehdl.dev
description: A reading column on ft-paper, with a night edition.
typography:
  masthead:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "clamp(2.2rem, 9vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  title:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "1.4427rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "Merriweather, Georgia, serif"
    fontSize: "19px"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Montserrat, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.06em"
  code:
    fontFamily: "Fira Code, Consolas, Monaco, monospace"
    fontSize: "0.85em"
    lineHeight: 1.6
rounded:
  inline: "4px"
  block: "10px"
  image: "16px"
spacing:
  rhythm: "1.62rem"
  measure: "38rem"
  gutter-phone: "1rem"
---

# Design System: camillehdl.dev

## Overview

**Creative North Star: "The Pink Paper"**

A personal site set like a broadsheet's opinion page: salmon paper, slate ink,
a serif reading column and a geometric sans for the masthead and the small
print. The palette is the identity. Everything else is quiet so that the
column reads well for a long article, on a phone, by day or night.

The night edition is the same paper in the dark, not a different theme: warm
brown ground, wheat ink, the same accents lightened until they pass 4.5:1.

**Key Characteristics:**
- one column, about 68 characters of Merriweather;
- flat surfaces, depth by tone (paper, paper-raised, surface-1 to 3);
- links in oxford that turn claret on hover;
- Montserrat in small capitals for dates, labels and the theme switch.

## Colors

The palette's single source is `src/data/ft-paper.js` (day) and
`src/data/ft-paper-night.js` (night), rendered on `/palette` and
`/palette-night`; `src/layout.css` copies the roles as custom properties and
`tests/palette.test.mjs` fails when they differ. This file does not repeat the
values, so that it cannot drift from them.

### Primary
- **Oxford** (`--oxford`): links, notes, information.

### Secondary
- **Claret** (`--claret`): the identity accent, used sparingly: link hover,
  quote rule, the checked theme, highlighted code lines.

### Neutral
- **Paper** (`--paper`): the page. **Paper raised** (`--paper-raised`): code
  blocks and quotes. **Surface 1–3**: notes, inline code and selection,
  highlighted lines. **Rule** (`--rule`): separators, never text.
- **Ink** (`--ink`), **Ink 2** (`--ink-2`), **Ink muted** (`--ink-muted`):
  body, secondary text, metadata.

### Named Rules
**The Token Rule.** Every color is a palette custom property; nothing is
hard-coded, so the night edition follows automatically.

**The Suggestion Rule.** Design work may propose palette changes; it never
applies them. Palette changes go through the palette modules and their tests.

## Typography

**Display Font:** Montserrat (with sans-serif)
**Body Font:** Merriweather (with Georgia, serif)
**Label/Mono Font:** Fira Code for code and keys only

**Character:** a broad geometric sans for the masthead against a sturdy
screen serif for reading.

### Hierarchy
- **Masthead** (700, `clamp(2.2rem, 9vw, 3.6rem)`, 1.05): the site name on the
  home page.
- **Headline** (700, 2.5rem, 1.2): article titles, in Montserrat.
- **Title** (700, 1.4427rem, 1.2): article list titles and section headings,
  in Merriweather.
- **Body** (400, 19px, 1.62; 18px under 600px): the reading column, 38rem
  wide.
- **Label** (400, 0.72rem, 0.06em, uppercase): dates and small print.

### Named Rules
**The One Column Rule.** Body text stays in the 38rem column; only quotes,
notes and warnings bleed slightly into the gutter.

## Layout

A single centered column, `max-width: 38rem`, padded by 1.5 rhythm units top
and bottom and 1rem on the sides under 600px. The root size steps from 19px to
18px under 600px and everything else is in rem, so the page scales with it.
The theme switch sits in the top-left corner, outside the column.

## Elevation & Depth

Flat. Depth comes from tone: paper-raised for code and quotes, surface-1 for
notes, a 1px surface-2 border around code. The only shadow is the 1px
underline of links and keys.

## Shapes

Small, consistent radii: 4px for inline code, 10px for blocks (quotes, notes,
warnings, code), 16px for article images. Quotes, notes and warnings carry a
4px left rule in their semantic color (claret, oxford, crimson).

## Components

### Theme switch
- Three native radio buttons in a `fieldset` named "Theme": Auto, Day, Night.
- Montserrat small capitals in ink-muted; the checked one in ink with a
  claret underline; focus ring 2px oxford.

### Callouts
- **Quote** (`blockquote`): paper-raised, claret rule, ink-2 text.
- **Note** (`aside.my-comment`): surface-1, oxford rule.
- **Warning** (`section.warning`): crimson-wash, crimson rule and ⚠ sign.

### Code
- Fira Code on paper-raised, Prism tokens mapped onto the palette (keywords
  oxford, functions velvet, strings jade, numbers mandarin, properties claret).

## Do's and Don'ts

### Do:
- **Do** take every color from the custom properties of `src/layout.css`.
- **Do** check both palettes; the browser tests require 4.5:1 for every text.
- **Do** keep the cheat sheets fully visible and searchable with ⌘F.

### Don't:
- **Don't** change a palette value outside `src/data/` and its tests.
- **Don't** replace Montserrat or Merriweather, or the ft-paper ground.
- **Don't** edit `content/`: articles, images and front matter.
