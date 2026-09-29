/**
 * ft-paper — the palette shared by this site and the themes built from it:
 * Ghostty, Herdr, Neovim, VS Code, glow and btop. /palette renders it.
 *
 * This module is the single source of truth. Only the palette colors below are
 * written as hex; `rgb`, every contrast figure and every derived fill are
 * computed, so a swatch can never disagree with its own label and a fill can
 * never drift from the color it claims to come from.
 *
 * `ansi` records the slot a color occupies in the 16-color terminal palette,
 * which is what keeps the terminal themes and this page in step.
 *
 * `on` lists the surfaces a color is cleared for as text: it clears 4.5:1 on
 * each of them, and the tests hold it there. A color with no `on` is not text.
 */

import { toRgb, contrastRatio, blend, round } from "./color.js"

// The palette as published. Everything else in this module is derived from it.
const HEX = {
  paper: "#fff1e5",
  "paper-raised": "#fff9f2",
  "surface-1": "#f7e7d8",
  "surface-2": "#f2dfce",
  "surface-3": "#efdcca",
  rule: "#b8afa5",
  ink: "#262a33",
  "ink-2": "#4a4f59",
  "ink-muted": "#6b6259",
  "ink-faint": "#7d746b",
  claret: "#990f3d",
  "claret-bright": "#bf5f80",
  oxford: "#0f5499",
  "oxford-bright": "#1e6ec4",
  jade: "#00733a",
  "jade-bright": "#00994d",
  teal: "#0d7680",
  "teal-bright": "#009aa8",
  mandarin: "#99521f",
  "mandarin-bright": "#bf6626",
  velvet: "#593380",
  crimson: "#cc0000",
  "warm-grey": "#8a827a",
}

const PAPER = HEX.paper
const INK = HEX.ink

// Surfaces a text color may be set on, from the page up.
const SURFACES = ["paper", "paper-raised", "surface-1", "surface-2", "surface-3"]
const upTo = (last) => SURFACES.slice(0, SURFACES.indexOf(last) + 1)

const own = (role) => ({ hex: HEX[role] })

/**
 * Some fills cannot come from the palette: a diff or search background needs a
 * desaturated wash, and a bright tone laid flat behind text buries it. Each is
 * a palette color over paper at a fixed alpha, recorded as that formula.
 */
const wash = (role, alpha) => ({
  hex: blend(HEX[role], alpha, PAPER),
  formula: `${role} at ${Math.round(alpha * 100)}% over paper`,
})

/**
 * A surface is judged by whether body ink reads on it; every other color by
 * whether it reads on paper, and — for anything that is text — by the worst
 * surface it is cleared for.
 */
const swatch = (isSurface) => ({ role, name, hex, formula, ansi, note, on }) => {
  const worst = on
    ?.map((surface) => ({ surface, contrast: contrastRatio(hex, HEX[surface]) }))
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
  group("Surfaces", "Backgrounds, from the page up. Each step is one shade deeper than the last, and each figure is how well body ink reads on it.", [
    { role: "paper", name: "Paper", ...own("paper"), note: "Page, editor and terminal background" },
    { role: "paper-raised", name: "Paper raised", ...own("paper-raised"), ansi: 15, note: "Code and quote blocks, popups, widgets" },
    { role: "surface-1", name: "Surface 1", ...own("surface-1"), note: "Panels, side bars, status lines, notes" },
    { role: "surface-2", name: "Surface 2", ...own("surface-2"), note: "Selection, inline code, active rows" },
    { role: "surface-3", name: "Surface 3", ...own("surface-3"), note: "Current and highlighted lines, meters, Herdr panels" },
    { role: "rule", name: "Rule", ...own("rule"), ansi: 7, note: "Dividers, borders, whitespace glyphs" },
  ], { surfaces: true }),
  group("Ink", "Text, from primary down to faint. Each figure is the contrast against paper, then against the deepest surface the ink is cleared for. Faint and disabled stay under 4.5:1: they are never content.", [
    { role: "ink", name: "Slate", ...own("ink"), ansi: 0, note: "Body text, terminal foreground", on: SURFACES },
    { role: "ink-2", name: "Slate 2", ...own("ink-2"), note: "Secondary text, parameters, properties, quotes", on: SURFACES },
    { role: "ink-muted", name: "Muted", ...own("ink-muted"), note: "Metadata, captions, code comments, line numbers", on: upTo("surface-2") },
    { role: "ink-faint", name: "Faint", ...own("ink-faint"), note: "Hints and inactive labels, under 4.5:1" },
    { role: "ink-disabled", name: "Disabled", ...own("rule"), formula: "same as rule", ansi: 7, note: "Disabled text" },
  ]),
  group("Highlight 1 — Claret", "The identity color. One accent, used sparingly.", [
    { role: "claret", name: "Claret", ...own("claret"), ansi: 1, note: "Accent, links on hover, cursor, headings in editors", on: SURFACES },
    { role: "claret-bright", name: "Candy", ...own("claret-bright"), ansi: 13, note: "Decorative only" },
  ]),
  group("Highlight 2 — Oxford", "The working accent: links, information, the calm counterweight to claret.", [
    { role: "oxford", name: "Oxford", ...own("oxford"), ansi: 4, note: "Links, information, focus", on: SURFACES },
    { role: "oxford-bright", name: "Oxford bright", ...own("oxford-bright"), ansi: 12, note: "Gradient starts, hovered buttons; base of the change fills", on: upTo("paper-raised") },
  ]),
  group("Supporting", "Status and category hues. The deep tone is text on paper; the bright one is for fills and the bright terminal slots.", [
    { role: "jade", name: "Jade", ...own("jade"), ansi: 2, note: "Success, strings, additions", on: upTo("surface-2") },
    { role: "jade-bright", name: "Jade bright", ...own("jade-bright"), ansi: 10, note: "Bright green; base of the add fill" },
    { role: "teal", name: "Teal", ...own("teal"), ansi: 6, note: "Secondary category: types in editors, hints", on: upTo("paper-raised") },
    { role: "teal-bright", name: "Teal bright", ...own("teal-bright"), ansi: 14, note: "Bright cyan" },
    { role: "mandarin", name: "Mandarin", ...own("mandarin"), ansi: 3, note: "Warning, numbers, constants", on: upTo("surface-2") },
    { role: "mandarin-bright", name: "Mandarin bright", ...own("mandarin-bright"), ansi: 11, note: "Bright yellow; base of the match fill" },
    { role: "velvet", name: "Velvet", ...own("velvet"), ansi: 5, note: "Tertiary category: keywords in editors", on: SURFACES },
    { role: "crimson", name: "Crimson", ...own("crimson"), ansi: 9, note: "Error, deletions, exceptions", on: upTo("surface-2") },
    { role: "warm-grey", name: "Warm grey", ...own("warm-grey"), ansi: 8, note: "Dim glyphs, under 4.5:1" },
  ]),
  group("Derived fills", "Mixed from the palette, not part of it. A diff or search background has to sit behind text, which rules out the bright tones at full strength; each of these is a palette color washed over paper at a fixed alpha. Every figure is how well body ink reads on the result.", [
    { role: "fill-add", name: "Add", ...wash("jade-bright", 0.2), note: "Added line" },
    { role: "fill-remove", name: "Remove", ...wash("crimson", 0.16), note: "Removed line" },
    { role: "fill-change", name: "Change", ...wash("oxford-bright", 0.16), note: "Changed line" },
    { role: "fill-change-focus", name: "Change focus", ...wash("oxford-bright", 0.32), note: "The part that actually changed, inside a changed line" },
    { role: "fill-match", name: "Match", ...wash("mandarin-bright", 0.34), note: "Every hit of a search" },
    { role: "fill-target", name: "Target", ...wash("claret", 0.4), note: "The one hit being jumped to" },
    { role: "crimson-wash", name: "Warning wash", ...wash("crimson", 0.08), note: "Warning callouts on this site" },
  ], { surfaces: true }),
]

/** Every day swatch by role, for this page and the palettes derived from it. */
export const hexOf = Object.fromEntries(
  groups.flatMap(({ swatches }) => swatches.map(({ role, hex }) => [role, hex]))
)

/** Where ft-paper is in use, as the roles below credit it. */
export const tools = {
  site: "camillehdl.dev",
  ghostty: "Ghostty",
  herdr: "Herdr",
  neovim: "Neovim",
  vscode: "VS Code",
  glow: "glow",
  btop: "btop",
}

/**
 * What to use for what: each semantic role as a text role over a background
 * role, and the tools that actually set it that way. Where the tools disagree,
 * each choice is its own line. `contrast` is that pair; `exempt` says why a
 * pair under 4.5:1 is not held to it.
 */
const pair = (use, text, background, { note, by, exempt } = {}) => ({
  use,
  text,
  background,
  note: note ?? null,
  tools: by ?? Object.keys(tools),
  exempt: exempt ?? null,
  contrast: round(contrastRatio(hexOf[text], hexOf[background])),
})

const EDITORS = ["neovim", "vscode", "glow"]
// The editors color code the way this site does.
const CODE = ["site", ...EDITORS]
const NOT_CONTENT = "Never content: a hint sits beside what it describes"

export const roles = [
  {
    title: "Text and accents",
    pairs: [
      pair("Body text", "ink", "paper"),
      pair("Secondary text", "ink-2", "paper", { by: ["site", "herdr", "neovim", "vscode", "glow"] }),
      pair("Metadata, captions", "ink-muted", "paper", { by: ["site", "herdr", "neovim", "vscode", "btop"] }),
      pair("Hints, inactive labels", "ink-muted", "paper", { by: ["herdr", "neovim", "vscode"] }),
      pair("Inactive labels in btop", "ink-faint", "paper", { by: ["btop"], exempt: NOT_CONTENT }),
      pair("Link", "oxford", "paper", { by: ["site", "neovim", "vscode", "glow"] }),
      pair("Link on hover", "claret", "paper", { by: ["site", "vscode"] }),
      pair("Identity accent", "claret", "paper", { note: "Cursor, headings, the active tab, quote borders" }),
      pair("Information", "oxford", "paper", { by: ["site", "neovim", "vscode"] }),
      pair("Success", "jade", "paper", { by: ["herdr", "neovim", "vscode"] }),
      pair("Warning", "mandarin", "paper", { by: ["herdr", "neovim", "vscode"] }),
      pair("Error", "crimson", "paper", { by: ["site", "herdr", "neovim", "vscode"] }),
      pair("Hint", "teal", "paper", { by: ["neovim", "vscode"] }),
    ],
  },
  {
    title: "Interface",
    pairs: [
      pair("Panel, side bar, note", "ink", "surface-1", { by: ["site", "herdr", "vscode"] }),
      pair("Status line", "ink-2", "surface-1", { by: ["neovim", "vscode"] }),
      pair("Inactive tab", "ink-muted", "surface-1", { by: ["neovim", "vscode"] }),
      pair("Popup, widget", "ink", "paper-raised", { by: ["neovim", "vscode"] }),
      pair("Selection", "ink", "surface-2", { by: ["site", "ghostty", "herdr", "neovim", "vscode", "btop"] }),
      pair("Current line, active row", "ink", "surface-3", { by: ["herdr", "neovim", "vscode"], note: "VS Code draws it as a border only" }),
      pair("Block cursor", "paper", "claret", { by: ["ghostty", "herdr", "neovim", "vscode"], note: "A thick cursor is claret, with paper as the character under it: the terminal and Herdr's panes, Neovim outside insert mode, VS Code's terminal" }),
      pair("Bar cursor", "ink", "paper", { by: ["neovim", "vscode"], note: "A thin cursor is ink: Neovim in insert mode, VS Code's editor" }),
      pair("Label on the accent", "paper", "claret", { by: ["neovim", "glow"], note: "Current search hit and jump labels in Neovim, the title band in glow" }),
      pair("Marked text", "paper-raised", "claret", { by: ["site"] }),
      pair("Button, badge", "paper", "oxford", { by: ["vscode", "btop"] }),
      pair("Line number", "ink-muted", "paper", { by: ["site", "neovim", "vscode"] }),
      pair("Border, divider", "rule", "paper", { by: ["site", "neovim", "vscode", "glow", "btop"], exempt: "Not text: a line only has to be seen" }),
      pair("Disabled", "ink-disabled", "paper", { by: ["vscode"], exempt: "Not content: disabled text is exempt" }),
    ],
  },
  {
    title: "Code",
    pairs: [
      pair("Comment (italic)", "ink-muted", "paper", { by: CODE }),
      pair("Punctuation", "ink-2", "paper", { by: CODE }),
      pair("Keyword, import", "oxford", "paper", { by: CODE }),
      pair("String, inserted, tag attribute", "jade", "paper", { by: CODE }),
      pair("Number, boolean", "mandarin", "paper", { by: CODE }),
      pair("Function, class, type", "velvet", "paper", { by: CODE }),
      pair("Operator, URL", "teal", "paper", { by: CODE }),
      pair("Tag, property, constant, deleted", "claret", "paper", { by: CODE }),
      pair("Macro, escape, decorator", "claret", "paper", { by: EDITORS }),
      pair("Regex, exception, important", "crimson", "paper", { by: CODE }),
      pair("Variable", "ink", "paper", { by: ["neovim", "vscode"], note: "The site leaves plain names uncolored too" }),
      pair("Parameter", "ink-2", "paper", { by: ["neovim", "vscode"] }),
      pair("Code block", "ink", "paper-raised", { by: ["site", "neovim"] }),
      pair("Inline code", "ink", "surface-2", { by: CODE }),
      pair("Highlighted line", "ink", "surface-3", { by: ["site"], note: "Marked by a claret left border" }),
    ],
  },
  {
    title: "Diff and search",
    pairs: [
      pair("Added line", "ink", "fill-add", { by: EDITORS }),
      pair("Removed line", "ink", "fill-remove", { by: EDITORS }),
      pair("Changed line", "ink", "fill-change", { by: ["neovim"] }),
      pair("Changed part", "ink", "fill-change-focus", { by: ["neovim"] }),
      pair("Search hit", "ink", "fill-match", { by: ["neovim", "vscode"] }),
      pair("Current search hit", "ink", "fill-target", { by: ["neovim", "vscode"] }),
      pair("Warning callout", "ink", "crimson-wash", { by: ["site"] }),
    ],
  },
]

/**
 * The 16-color terminal palette, read off the `ansi` slots above — the slots
 * the Ghostty theme and VS Code's integrated terminal set. On a light terminal
 * the white slots (7, 15) are the light end, as ANSI expects.
 */
const ANSI_NAMES = [
  "black", "red", "green", "yellow", "blue", "magenta", "cyan", "white",
  "bright black", "bright red", "bright green", "bright yellow",
  "bright blue", "bright magenta", "bright cyan", "bright white",
]

const swatches = groups.flatMap(({ swatches }) => swatches)

export const terminal = {
  background: "paper",
  foreground: "ink",
  cursor: "claret",
  cursorText: "paper",
  cursorBar: "ink",
  selectionBackground: "surface-2",
  selectionForeground: "ink",
  pairs: [
    pair("Background and foreground", "ink", "paper", { by: ["ghostty", "vscode"] }),
    pair("Block cursor", "paper", "claret", { by: ["ghostty", "vscode"], note: "cursor-color claret, cursor-text paper" }),
    pair("Bar cursor", "ink", "paper", { by: ["neovim"], note: "A thin cursor, where a program asks for one, is ink" }),
    pair("Selection", "ink", "surface-2", { by: ["ghostty", "vscode"] }),
  ],
  ansi: ANSI_NAMES.map((name, index) => {
    const { role, hex } = swatches.find(({ ansi }) => ansi === index)
    return { name, role, hex, contrast: round(contrastRatio(hex, PAPER)) }
  }),
}

export const asJson = () => ({
  name: "ft-paper",
  background: PAPER,
  inspiration: "Financial Times (ft.com) Origami o-colors",
  nightPalette: "https://camillehdl.dev/palette-night/",
  contrastNote:
    "Surfaces are measured as ink on the surface; every other color as the color on paper, and text colors also at their worst on the surfaces listed in readsOn. A color with an empty readsOn is not cleared for text.",
  tools,
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
