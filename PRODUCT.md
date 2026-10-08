# Product

<!-- impeccable:product-schema 1 -->

Written on 2026-10-08 from the repository and Camille's brief, without an
interview. Lines marked *(inferred)* come from the repository, not from Camille;
confirm or correct them.

## Platform

web

## Users

- Developers who land on an article from a search engine or a link, read it
  once, often on a phone, and copy a command or a code sample from it.
  *(inferred from the articles' subjects: macOS, Podman, PHP, Rollup, Nginx)*
- Camille, who reads `/cheatsheet` and `/cheatsheet-omarchy` as a reference on
  their own machines.
- People who reuse the ft-paper palette and themes: `/palette`,
  `/palette-night`, `/artifacts`, `/uses`.

## Product Purpose

camillehdl.dev is Camille Hodoul's personal site: a blog of technical notes
and essays, a few reference pages, and the published source of the ft-paper
palette that Camille's tools (Ghostty, Herdr, Neovim, VS Code, glow) are
themed with. Success means an article reads comfortably at any width, by day
or night, and a reference page shows everything without interaction.

## Capabilities and Constraints

- Gatsby static site, deployed by Netlify. A push to `master` publishes the
  site; work happens on branches.
- Articles and their images live in `content/` and are not to be edited by
  design work: text, images, front matter.
- Day and night palettes follow the system, and a reader can force either one
  with the switch in the top-left corner (`data-theme` on `<html>`).
- `/palette` and `/palette-night` keep their own palette whatever the system
  or the reader says.
- Every text on every page of the sitemap must reach 4.5:1, day and night
  (`tests/browser/site.spec.js`).
- The cheat sheets are static HTML, entirely visible and findable with ⌘F: no
  collapsed panel, filter, or intercepted shortcut.
- Optional Bluesky comments load under an article that names a post.

## Brand Commitments

- The ft-paper palette by day and ft-paper-night by night, as published on
  `/palette` and `/palette-night`, from `src/data/ft-paper.js` and
  `src/data/ft-paper-night.js`. Design work may suggest palette changes; it
  does not apply them.
- Montserrat for the masthead, headlines on the cheat sheets and small labels;
  Merriweather for reading; Fira Code for code. All three are self-hosted.

## Evidence on Hand

- Articles in `content/blog/`, pages in `content/pages/`.
- Profile picture `src/images/profile-pic.png`.
- No testimonials, metrics, or client list: do not invent any.

## Product Principles

1. Reading comes first: a calm column at a real measure, in both palettes.
2. The palette is the identity; layout and type serve it.
3. Reference pages show everything at once.
4. Every color is a palette token; nothing is hard-coded.

## Accessibility & Inclusion

WCAG 2.2 AA: 4.5:1 text contrast, enforced by the browser tests; keyboard use
of the theme switch; `prefers-reduced-motion` turns off the palette fade.
