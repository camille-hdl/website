/**
 * ft-paper — the palette shared by this site and the terminal themes published
 * on /artifacts/ (Ghostty, Herdr, btop).
 *
 * This module is the single source of truth. `rgb` and `contrast` are derived,
 * never hand-written, so a swatch can never disagree with its own label.
 *
 * `ansi` records the slot a color occupies in the 16-color terminal palette,
 * which is what lets the terminal themes and this stylesheet stay in step.
 */

const PAPER = "#fff1e5"

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

const relativeLuminance = (hex) => {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const contrastRatio = (hex, against) => {
  const a = relativeLuminance(hex)
  const b = relativeLuminance(against)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

const INK = "#262a33"

const round = (n) => Math.round(n * 100) / 100

/**
 * A surface is judged by whether body ink reads on it; every other color by
 * whether it reads on paper. Same measure, opposite direction.
 */
const swatch = (isSurface) => ({ role, name, hex, ansi, note }) => ({
  role,
  name,
  hex,
  ansi,
  note,
  rgb: toRgb(hex),
  contrast: isSurface
    ? round(contrastRatio(INK, hex))
    : round(contrastRatio(hex, PAPER)),
  contrastLabel: isSurface ? "ink on this" : "on paper",
})

const group = (title, purpose, entries, { surfaces = false } = {}) => ({
  title,
  purpose,
  swatches: entries.map(swatch(surfaces)),
})

export const paper = PAPER

export const groups = [
  group("Surfaces", "Backgrounds, from the page up. Each step is one shade deeper than the last, and each figure is how well body ink reads on it.", [
    { role: "paper", name: "Paper", hex: "#fff1e5", ansi: null, note: "Page background" },
    { role: "paper-raised", name: "Paper raised", hex: "#fff9f2", ansi: 15, note: "Code and quote blocks" },
    { role: "surface-1", name: "Surface 1", hex: "#f7e7d8", ansi: null, note: "Panels" },
    { role: "surface-2", name: "Surface 2", hex: "#f2dfce", ansi: null, note: "Selection, inline code" },
    { role: "surface-3", name: "Surface 3", hex: "#efdcca", ansi: null, note: "Meters, highlighted lines" },
    { role: "rule", name: "Rule", hex: "#b8afa5", ansi: 7, note: "Dividers and disabled ink" },
  ], { surfaces: true }),
  group("Ink", "Text, from primary down to faint. Each figure is the contrast against paper.", [
    { role: "ink", name: "Slate", hex: "#262a33", ansi: 0, note: "Body text" },
    { role: "ink-2", name: "Slate 2", hex: "#4a4f59", ansi: null, note: "Secondary text" },
    { role: "ink-muted", name: "Muted", hex: "#6b6259", ansi: null, note: "Metadata, captions" },
    { role: "ink-faint", name: "Faint", hex: "#7d746b", ansi: null, note: "Hints" },
    { role: "ink-disabled", name: "Disabled", hex: "#b8afa5", ansi: 7, note: "Disabled text" },
  ]),
  group("Highlight 1 — Claret", "The identity color. One accent, used sparingly.", [
    { role: "claret", name: "Claret", hex: "#990f3d", ansi: 1, note: "Accent, links on hover" },
    { role: "claret-bright", name: "Candy", hex: "#bf5f80", ansi: 13, note: "Decorative only" },
  ]),
  group("Highlight 2 — Oxford", "The working accent: links, information, the calm counterweight to claret.", [
    { role: "oxford", name: "Oxford", hex: "#0f5499", ansi: 4, note: "Links, notes" },
    { role: "oxford-bright", name: "Oxford bright", hex: "#1e6ec4", ansi: 12, note: "Gradient starts" },
  ]),
  group("Supporting", "Status and category hues. The deep tone reads on paper; the bright one is for fills.", [
    { role: "jade", name: "Jade", hex: "#00733a", ansi: 2, note: "Success" },
    { role: "jade-bright", name: "Jade bright", hex: "#00994d", ansi: 10, note: "Fills" },
    { role: "teal", name: "Teal", hex: "#0d7680", ansi: 6, note: "Secondary category" },
    { role: "teal-bright", name: "Teal bright", hex: "#009aa8", ansi: 14, note: "Fills" },
    { role: "mandarin", name: "Mandarin", hex: "#99521f", ansi: 3, note: "Warning" },
    { role: "mandarin-bright", name: "Mandarin bright", hex: "#bf6626", ansi: 11, note: "Fills" },
    { role: "velvet", name: "Velvet", hex: "#593380", ansi: 5, note: "Tertiary category" },
    { role: "crimson", name: "Crimson", hex: "#cc0000", ansi: 9, note: "Error" },
    { role: "warm-grey", name: "Warm grey", hex: "#8a827a", ansi: 8, note: "Dim glyphs" },
  ]),
]

export const asJson = () => ({
  name: "ft-paper",
  background: PAPER,
  inspiration: "Financial Times (ft.com) Origami o-colors",
  contrastNote:
    "Surfaces are measured as ink on the surface; every other color as the color on paper.",
  groups: groups.map(({ title, purpose, swatches }) => ({
    title,
    purpose,
    swatches: swatches.map(
      ({ role, name, hex, rgb, ansi, contrast, contrastLabel, note }) => ({
        role,
        name,
        hex,
        rgb: `rgb(${rgb.join(", ")})`,
        ansi,
        contrast,
        contrastMeans: contrastLabel,
        note,
      })
    ),
  })),
})
