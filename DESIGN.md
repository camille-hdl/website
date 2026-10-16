---
name: camillehdl.dev
description: A reading column on ft-paper, with a night edition.
typography:
  masthead:
    fontFamily: "IBM Plex Sans Var, sans-serif"
    fontSize: "clamp(2.2rem, 9vw, 3.6rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "IBM Plex Sans Var, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  title:
    fontFamily: "IBM Plex Sans Var, sans-serif"
    fontSize: "1.4427rem"
    fontWeight: 700
    lineHeight: 1.2
  body:
    fontFamily: "IBM Plex Sans Var, sans-serif"
    fontSize: "25px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Sans Var, sans-serif"
    fontSize: "0.72rem"
    fontWeight: 400
    letterSpacing: "0.06em"
  code:
    fontFamily: "IBM Plex Mono Var, monospace"
    fontSize: "1em"
    lineHeight: 1.6
rounded:
  inline: "4px"
  block: "10px"
  image: "16px"
spacing:
  rhythm: "1.6rem"
  measure: "56ch"
  media-measure: "90ch"
  gutter-phone: "1rem"
---

# Design System: camillehdl.dev

## Overview

**Creative North Star: "The Pink Paper"**

A personal site set like a broadsheet's opinion page: salmon paper, slate ink,
IBM Plex Sans for the reading column, headings and small print, and Plex
Mono for code. The palette is the identity. Everything else is quiet so that the
column reads well for a long article, on a phone, by day or night.

The night edition is the same paper in the dark, not a different theme: warm
brown ground, wheat ink, the same accents lightened until they pass 4.5:1.

**Key Characteristics:**
- one reading column of `56ch`, about 70 characters per line in Plex Sans;
- flat surfaces, depth by tone (paper, paper-raised, surface-1 to 3);
- links in oxford that turn claret on hover;
- Plex Sans in small capitals for dates, labels and the theme switch.

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

**Display and body font:** IBM Plex Sans Var, with sans-serif fallback.
**Code and keys:** IBM Plex Mono Var, with monospace fallback.

Camille selected the all-Sans comparison on 2026-10-16. The three official IBM
Latin1 WOFF2 files are served unchanged from `src/fonts/files/`, with OFL and
pinned source URLs and SHA-256 hashes in `src/fonts/`. No font is preloaded.
The Roman Sans file covers headings, prose and labels, including the heavier
night weights. Sans italic loads only when used; Mono loads for code and keys.

### Hierarchy
- **Masthead** (700, `clamp(2.2rem, 9vw, 3.6rem)`, 1.05): the site name on the
  home page.
- **Headline** (700, 2.5rem, 1.2): article titles, in Plex Sans.
- **Title** (700, 1.4427rem, 1.2): article list titles and section headings,
  in Plex Sans.
- **Body** (400 by day, 450 by night; 25px, 1.6; 20px under 600px): the
  reading column, at most `56ch` wide.
- **Label** (400 by day, 450 by night; 0.72rem, 0.06em, uppercase): dates and
  small print. Explicit bold labels and headings retain weight 700.
- **Code** (400 by day, 450 by night; 1em, 1.6): Plex Mono keeps the same
  x-height as prose. Code ligatures are disabled.

### Named Rules
**The One Column Rule.** Body text stays in the `56ch` column. Code blocks and
images can extend to about 90 characters, within the viewport. Quotes, notes
and warnings bleed slightly into the gutter.

## Layout

A single centered column contains up to `56ch` of body text, excluding its
horizontal padding. Camille selected this width on 2026-10-16 after comparing
62, 70 and 78 characters per line. At 25px, the text is 840px wide and the
container is 900px wide, including 1.2rem padding on each side. The measured
mean is 70.1 characters per complete line in `/ship-modern-javascript-rollup/`.
The `ch` unit measures the zero glyph, so other texts have different counts.

The container is padded by 1.5 rhythm units top and bottom and 1rem on the
sides under 600px. The root size steps from 25px to 20px under 600px. A 390px
phone retains 350px of body text. At 80–85cm and about 0.233mm per logical screen point,
25px Plex gives an x-height angle of about 0.203–0.215° at browser zoom 100%.
This is the distance setting Camille chose in the local comparison.
The theme switch sits in the top-left corner, outside the column.

Article code blocks allow 90 Plex Mono characters plus padding and borders.
Responsive images allow `90ch` of Plex Sans, up to their original size.
Gatsby generates image sources for a 1350px maximum and sets `sizes` at build
time. Both kinds of block keep at least `1rem` between them and the viewport
edge. Long code lines scroll inside their block.

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
- Plex Sans small capitals in ink-muted; the checked one in ink with a
  claret underline; focus ring 2px oxford.

### Callouts
- **Quote** (`blockquote`): paper-raised, claret rule, ink-2 text.
- **Note** (`aside.my-comment`): surface-1, oxford rule.
- **Warning** (`section.warning`): crimson-wash, crimson rule and ⚠ sign.

### Code
- Plex Mono on paper-raised, Prism tokens mapped onto the palette (keywords
  oxford, functions velvet, strings jade, numbers mandarin, properties claret).

## Do's and Don'ts

### Do:
- **Do** take every color from the custom properties of `src/layout.css`.
- **Do** check both palettes; the browser tests require 4.5:1 for every text.
- **Do** keep the cheat sheets fully visible and searchable with ⌘F.

### Don't:
- **Don't** change a palette value outside `src/data/` and its tests.
- **Don't** replace the chosen Plex families or the ft-paper ground.
- **Don't** edit `content/`: articles, images and front matter.
