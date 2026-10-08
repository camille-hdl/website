/**
 * ft-paper-night — ft-paper after dark, for the evening: the same Financial
 * Times hues on a very dark sepia instead of paper. /palette-night renders it,
 * and the night terminal and editor themes take their values from it.
 *
 * Same rules as ft-paper.js: `rgb` and every contrast figure are derived, and
 * every accent is written as its formula — a day color mixed into day paper —
 * so a night tone can never drift from the hue it claims to come from.
 *
 * One rule of its own: nothing that is ever drawn as text sits near the
 * background. Every ink and accent clears 4.5:1 on each surface it is cleared
 * for (`on`), and the tests hold it there.
 */

import { toRgb, contrastRatio, blend, round } from "./color.js"
import { hexOf as day, paper as dayPaper } from "./ft-paper.js"

const PAPER = "#1f1915"
const INK = "#e3d1bf"

// Surfaces an ink may be set on, from the page up.
const SURFACES = {
  paper: PAPER,
  "paper-raised": "#261f1a",
  "surface-1": "#2b231d",
  "surface-2": "#3a2f27",
  "surface-3": "#40342b",
}
const EVERY_SURFACE = Object.keys(SURFACES)
const UP_TO_SURFACE_1 = EVERY_SURFACE.slice(0, 3)

// A night accent: the day color washed into day paper, lightened without
// leaving its hue family.
const lighten = (role, alpha) => ({
  hex: blend(day[role], alpha, dayPaper),
  formula: `${role} at ${Math.round(alpha * 100)}% over day paper`,
})

// A night fill: a bright day tone washed over night paper, dark enough for ink.
const wash = (role, alpha) => ({
  hex: blend(day[role], alpha, PAPER),
  formula: `${role} at ${Math.round(alpha * 100)}% over night paper`,
})

/**
 * A surface is judged by whether body ink reads on it; every other color by
 * whether it reads on paper, and — for anything that is text — by the worst
 * surface it is cleared for.
 */
const swatch = (isSurface) => ({ role, name, hex, formula, ansi, note, on }) => {
  const worst = on
    ?.map((surface) => ({ surface, contrast: contrastRatio(hex, SURFACES[surface]) }))
    .reduce((a, b) => (b.contrast < a.contrast ? b : a))
  return {
    role,
    name,
    hex,
    formula: formula ?? null,
    ansi: ansi ?? null,
    note,
    rgb: toRgb(hex),
    contrast: isSurface
      ? round(contrastRatio(INK, hex))
      : round(contrastRatio(hex, PAPER)),
    contrastLabel: isSurface ? "ink on this" : "on paper",
    readsOn: on ?? [],
    worst: worst ? { surface: worst.surface, contrast: round(worst.contrast) } : null,
  }
}

const group = (title, purpose, entries, { surfaces = false } = {}) => ({
  title,
  purpose,
  swatches: entries.map(swatch(surfaces)),
})

export const paper = PAPER

export const groups = [
  group("Surfaces", "Backgrounds, from the page up. At night a surface rises by getting lighter; each figure is how well body ink reads on it.", [
    { role: "paper", name: "Paper", hex: PAPER, note: "Page and terminal background" },
    { role: "paper-raised", name: "Paper raised", hex: SURFACES["paper-raised"], note: "Code and quote blocks" },
    { role: "surface-1", name: "Surface 1", hex: SURFACES["surface-1"], note: "Panels, popups, status lines" },
    { role: "surface-2", name: "Surface 2", hex: SURFACES["surface-2"], note: "Selection, inline code" },
    { role: "surface-3", name: "Surface 3", hex: SURFACES["surface-3"], note: "Meters, highlighted and current lines" },
    { role: "rule", name: "Rule", hex: "#5c4f45", note: "Dividers, borders and disabled ink" },
  ], { surfaces: true }),
  group("Ink", "Text, from primary down to faint. The body ink stays under 12:1, so the page does not glare; the faintest ink still reads, which is the point of having one. Each figure is the contrast against paper, then against the darkest-lit surface the ink is cleared for.", [
    { role: "ink", name: "Paper ink", hex: INK, ansi: null, note: "Body text, terminal foreground", on: EVERY_SURFACE },
    { role: "ink-bright", name: "Wheat", hex: day["surface-2"], formula: "surface-2 from ft-paper", ansi: 15, note: "Bold emphasis only", on: EVERY_SURFACE },
    { role: "ink-2", name: "Paper ink 2", hex: "#c8b7a6", ansi: 7, note: "Secondary text", on: EVERY_SURFACE },
    { role: "ink-muted", name: "Muted", hex: "#b09f8f", ansi: null, note: "Metadata, captions, code comments", on: EVERY_SURFACE },
    { role: "ink-faint", name: "Faint", hex: "#998a7c", ansi: 8, note: "Hints, autosuggestions — on paper, raised and surface 1", on: UP_TO_SURFACE_1 },
    { role: "ink-disabled", name: "Disabled", hex: "#5c4f45", ansi: null, note: "Disabled text, never content" },
  ]),
  group("Highlight 1 — Claret", "The identity color. One accent, used sparingly.", [
    { role: "claret", name: "Claret", ...lighten("claret", 0.44), ansi: 1, note: "Accent, links on hover, cursor", on: EVERY_SURFACE },
    { role: "claret-bright", name: "Candy", ...lighten("claret-bright", 0.6), ansi: 13, note: "Decorative, bright magenta", on: EVERY_SURFACE },
  ]),
  group("Highlight 2 — Oxford", "The working accent: links, information, the calm counterweight to claret. Oxford itself goes grey when lightened, so both night tones come from oxford bright.", [
    { role: "oxford", name: "Oxford", ...lighten("oxford-bright", 0.58), ansi: 4, note: "Links, notes, information", on: EVERY_SURFACE },
    { role: "oxford-bright", name: "Oxford bright", ...lighten("oxford-bright", 0.45), ansi: 12, note: "Emphasis, bright blue", on: EVERY_SURFACE },
  ]),
  group("Supporting", "Status and category hues. The base tone is text on any surface; the bright one is emphasis and the bright terminal slots.", [
    { role: "jade", name: "Jade", ...lighten("jade-bright", 0.7), ansi: 2, note: "Success, strings", on: EVERY_SURFACE },
    { role: "jade-bright", name: "Jade bright", ...lighten("jade-bright", 0.5), ansi: 10, note: "Emphasis, bright green", on: EVERY_SURFACE },
    { role: "teal", name: "Teal", ...lighten("teal-bright", 0.7), ansi: 6, note: "Secondary category, variables", on: EVERY_SURFACE },
    { role: "teal-bright", name: "Teal bright", ...lighten("teal-bright", 0.55), ansi: 14, note: "Emphasis, bright cyan", on: EVERY_SURFACE },
    { role: "mandarin", name: "Mandarin", ...lighten("mandarin-bright", 0.7), ansi: 3, note: "Warning, numbers", on: EVERY_SURFACE },
    { role: "mandarin-bright", name: "Mandarin bright", ...lighten("mandarin-bright", 0.55), ansi: 11, note: "Emphasis, bright yellow", on: EVERY_SURFACE },
    { role: "velvet", name: "Velvet", ...lighten("velvet", 0.45), ansi: 5, note: "Tertiary category, functions", on: EVERY_SURFACE },
    { role: "crimson", name: "Crimson", ...lighten("crimson", 0.45), ansi: 9, note: "Error", on: EVERY_SURFACE },
    { role: "warm-grey", name: "Warm grey", hex: day["warm-grey"], formula: "unchanged from ft-paper", ansi: 0, note: "Dim glyphs; the darkest terminal slot, still text on paper", on: ["paper"] },
  ]),
  group("Derived fills", "Mixed from the palette, not part of it. A diff or search background sits behind text, so each is a day bright tone washed over night paper: enough hue to tell them apart, dark enough for ink. Every figure is how well body ink reads on the result.", [
    { role: "fill-add", name: "Add", ...wash("jade-bright", 0.22), note: "Added line" },
    { role: "fill-remove", name: "Remove", ...wash("crimson", 0.2), note: "Removed line" },
    { role: "fill-change", name: "Change", ...wash("oxford-bright", 0.2), note: "Changed line" },
    { role: "fill-change-focus", name: "Change focus", ...wash("oxford-bright", 0.36), note: "The part that actually changed, inside a changed line" },
    { role: "fill-match", name: "Match", ...wash("mandarin-bright", 0.34), note: "Every hit of a search" },
    { role: "fill-target", name: "Target", ...wash("claret", 0.45), note: "The one hit being jumped to" },
    { role: "crimson-wash", name: "Warning wash", ...wash("crimson", 0.1), note: "Warning callouts on the site" },
  ], { surfaces: true }),
]

const hexOf = Object.fromEntries(
  groups.flatMap(({ swatches }) => swatches.map(({ role, hex }) => [role, hex]))
)

/**
 * What to use for what: the semantic roles a theme for another tool needs,
 * each as a text role over a background role. `contrast` is that pair.
 */
const pair = (use, text, background, note) => ({
  use,
  text,
  background,
  note: note ?? null,
  contrast: round(contrastRatio(hexOf[text], hexOf[background])),
})

export const roles = [
  {
    title: "Text and accents",
    pairs: [
      pair("Body text", "ink", "paper"),
      pair("Strong emphasis", "ink-bright", "paper"),
      pair("Secondary text", "ink-2", "paper"),
      pair("Metadata, captions", "ink-muted", "paper"),
      pair("Hints, placeholders", "ink-faint", "paper"),
      pair("Link", "oxford", "paper"),
      pair("Link on hover", "claret", "paper"),
      pair("Identity accent", "claret", "paper"),
      pair("Information", "oxford", "paper"),
      pair("Success", "jade", "paper"),
      pair("Warning", "mandarin", "paper"),
      pair("Error", "crimson", "paper"),
    ],
  },
  {
    title: "Interface",
    pairs: [
      pair("Panel, popup, status line", "ink", "surface-1"),
      pair("Selection", "ink", "surface-2"),
      pair("Selection on camillehdl.dev", "ink", "fill-change-focus", "The site selects text on the change fill; surface-2 sits too close to paper to show on a page"),
      pair("Current line", "ink", "surface-3"),
      pair("Block cursor", "paper", "claret", "A thick cursor is claret, with paper as the character under it: the terminal, Neovim outside insert mode"),
      pair("Bar cursor", "ink", "paper", "A thin cursor is ink: Neovim in insert mode"),
      pair("Border, divider", "rule", "paper", "Not text: a line only has to be seen"),
      pair("Disabled", "ink-disabled", "paper", "Not content: disabled text is exempt"),
    ],
  },
  {
    title: "Code",
    pairs: [
      pair("Code block", "ink", "paper-raised"),
      pair("Inline code", "ink", "surface-2"),
      pair("Comment (italic)", "ink-muted", "paper-raised"),
      pair("Punctuation", "ink-2", "paper-raised"),
      pair("Keyword, import", "oxford", "paper-raised"),
      pair("String, inserted, tag attribute", "jade", "paper-raised"),
      pair("Number, boolean", "mandarin", "paper-raised"),
      pair("Function, class, type", "velvet", "paper-raised"),
      pair("Operator, URL", "teal", "paper-raised"),
      pair("Tag, property, constant, deleted", "claret", "paper-raised"),
      pair("Macro, escape, decorator", "claret", "paper-raised", "Editors only"),
      pair("Regex, exception, important", "crimson", "paper-raised"),
      pair("Variable", "ink", "paper-raised", "Plain names stay uncolored"),
      pair("Parameter", "ink-2", "paper-raised", "Editors only"),
      pair("Highlighted line", "ink", "surface-3", "Marked by a claret left border"),
    ],
  },
  {
    title: "Diff and search",
    pairs: [
      pair("Added line", "ink", "fill-add"),
      pair("Removed line", "ink", "fill-remove"),
      pair("Changed line", "ink", "fill-change"),
      pair("Changed part", "ink", "fill-change-focus"),
      pair("Search hit", "ink", "fill-match"),
      pair("Current search hit", "ink", "fill-target"),
      pair("Warning callout", "ink", "crimson-wash"),
    ],
  },
]

/**
 * The 16-color terminal palette, as the night terminal themes set it. The
 * darkest slot is warm grey, not a near-background brown: programs written for
 * light terminals print body text in ANSI 0, and it has to stay readable.
 */
const slot = (name, role) => ({
  name,
  role,
  hex: hexOf[role],
  contrast: round(contrastRatio(hexOf[role], PAPER)),
})

export const terminal = {
  background: "paper",
  foreground: "ink",
  cursor: "claret",
  cursorText: "paper",
  cursorBar: "ink",
  selectionBackground: "surface-2",
  selectionForeground: "ink",
  pairs: [
    pair("Background and foreground", "ink", "paper"),
    pair("Block cursor", "paper", "claret", "cursor-color claret, cursor-text paper"),
    pair("Bar cursor", "ink", "paper", "A thin cursor, where a program asks for one, is ink"),
    pair("Selection", "ink", "surface-2"),
  ],
  ansi: [
    slot("black", "warm-grey"),
    slot("red", "claret"),
    slot("green", "jade"),
    slot("yellow", "mandarin"),
    slot("blue", "oxford"),
    slot("magenta", "velvet"),
    slot("cyan", "teal"),
    slot("white", "ink-2"),
    slot("bright black", "ink-faint"),
    slot("bright red", "crimson"),
    slot("bright green", "jade-bright"),
    slot("bright yellow", "mandarin-bright"),
    slot("bright blue", "oxford-bright"),
    slot("bright magenta", "claret-bright"),
    slot("bright cyan", "teal-bright"),
    slot("bright white", "ink-bright"),
  ],
}

export { hexOf }

export const asJson = () => ({
  name: "ft-paper-night",
  background: PAPER,
  inspiration: "Financial Times (ft.com) Origami o-colors",
  dayPalette: "https://camillehdl.dev/palette/",
  contrastNote:
    "Surfaces are measured as ink on the surface; every other color as the color on paper, and text colors also at their worst on the surfaces listed in readsOn.",
  groups: groups.map(({ title, purpose, swatches }) => ({
    title,
    purpose,
    swatches: swatches.map(
      ({ role, name, hex, formula, rgb, ansi, contrast, contrastLabel, readsOn, worst, note }) => ({
        role,
        name,
        hex,
        rgb: `rgb(${rgb.join(", ")})`,
        formula,
        ansi,
        contrast,
        contrastMeans: contrastLabel,
        readsOn,
        worstContrast: worst,
        note,
      })
    ),
  })),
  roles: roles.map(({ title, pairs }) => ({
    title,
    pairs: pairs.map((p) => ({
      ...p,
      textHex: hexOf[p.text],
      backgroundHex: hexOf[p.background],
    })),
  })),
  terminal: {
    ...Object.fromEntries(
      Object.entries(terminal)
        .filter(([key]) => !["ansi", "pairs"].includes(key))
        .map(([key, role]) => [key, { role, hex: hexOf[role] }])
    ),
    ansi: terminal.ansi.map((entry, index) => ({ index, ...entry })),
  },
})
