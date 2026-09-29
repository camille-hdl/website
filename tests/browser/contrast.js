/**
 * Runs in the page: every piece of visible text, its color composited over
 * what is actually behind it, and the WCAG 2 contrast ratio of the two.
 *
 * HTML text is measured against its ancestors' backgrounds; SVG text against
 * the shape under its middle. Decorative subtrees (aria-hidden) are skipped,
 * and so is text over a background image, which has no single color.
 */
function measureContrast() {
  const parse = (value) => {
    const match = value.match(/rgba?\(([^)]+)\)/)
    if (!match) return null
    const [r, g, b, a = 1] = match[1]
      .split(/[\s,/]+/)
      .filter(Boolean)
      .map(Number)
    return [r, g, b, a]
  }
  // `top` laid over the opaque `bottom`.
  const over = ([r, g, b, a], [R, G, B]) => [
    r * a + R * (1 - a),
    g * a + G * (1 - a),
    b * a + B * (1 - a),
    1,
  ]
  const luminance = (rgb) => {
    const [r, g, b] = rgb.slice(0, 3).map((channel) => {
      const value = channel / 255
      return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const ratio = (a, b) => {
    const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x)
    return (hi + 0.05) / (lo + 0.05)
  }

  const canvas =
    parse(getComputedStyle(document.body).backgroundColor) || [255, 255, 255, 1]

  // Backgrounds from the element up, composited from the bottom one.
  const backgroundOf = (element) => {
    const layers = []
    for (let node = element; node && node !== document.documentElement; node = node.parentElement) {
      const style = getComputedStyle(node)
      if (style.backgroundImage !== "none") return null
      const color = parse(style.backgroundColor)
      if (color && color[3] > 0) {
        layers.push(color)
        if (color[3] === 1) break
      }
    }
    return layers.reverse().reduce((below, layer) => over(layer, below), canvas)
  }

  const opacityOf = (element) => {
    let opacity = 1
    for (let node = element; node; node = node.parentElement)
      opacity *= Number(getComputedStyle(node).opacity)
    return opacity
  }

  // Hit testing only sees the viewport, so the text is brought into it first.
  const svgBackgroundOf = (text) => {
    text.scrollIntoView({ block: "center", inline: "center" })
    const box = text.getBoundingClientRect()
    const x = box.left + box.width / 2
    const y = box.top + box.height / 2
    for (const node of document.elementsFromPoint(x, y)) {
      if (node === text || node.tagName === "text" || node.tagName === "tspan") continue
      if (node instanceof SVGGeometryElement) {
        const fill = parse(getComputedStyle(node).fill)
        if (fill && fill[3] > 0) return over(fill, backgroundOf(node.ownerSVGElement) || canvas)
        continue
      }
      return backgroundOf(node)
    }
    return canvas
  }

  const failures = []
  let measured = 0
  const elements = [...document.body.querySelectorAll("*")].filter(
    (element) =>
      !["SCRIPT", "STYLE", "NOSCRIPT", "TEMPLATE"].includes(element.tagName) &&
      [...element.childNodes].some(
        (node) => node.nodeType === Node.TEXT_NODE && node.textContent.trim()
      )
  )
  for (const element of elements) {
    if (element.closest('[aria-hidden="true"]')) continue
    if (!element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue
    const box = element.getBoundingClientRect()
    if (box.width <= 1 || box.height <= 1) continue
    const style = getComputedStyle(element)
    const isSvg = element instanceof SVGElement
    const color = parse(isSvg ? style.fill : style.color)
    if (!color) continue
    const background = isSvg ? svgBackgroundOf(element) : backgroundOf(element)
    if (!background) continue
    color[3] *= opacityOf(element)
    const contrast = ratio(over(color, background), background)
    measured++
    if (contrast < 4.5)
      failures.push({
        text: element.textContent.trim().slice(0, 40),
        tag: element.tagName.toLowerCase(),
        className: String(element.className?.baseVal ?? element.className).slice(0, 60),
        contrast: Math.round(contrast * 100) / 100,
      })
  }
  return { measured, failures }
}

module.exports = { measureContrast }
