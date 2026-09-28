/**
 * Color arithmetic shared by the palettes. Every derived value on /palette and
 * /palette-night goes through here, so the two pages measure the same way.
 */

export const toRgb = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16))

const relativeLuminance = (hex) => {
  const [r, g, b] = toRgb(hex).map((channel) => {
    const value = channel / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

// WCAG 2 contrast ratio.
export const contrastRatio = (hex, against) => {
  const a = relativeLuminance(hex)
  const b = relativeLuminance(against)
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)
}

// `hex` laid over `over` at `alpha`.
export const blend = (hex, alpha, over) => {
  const source = toRgb(hex)
  const base = toRgb(over)
  return `#${source
    .map((channel, i) =>
      Math.round(channel * alpha + base[i] * (1 - alpha))
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`
}

export const round = (n) => Math.round(n * 100) / 100
