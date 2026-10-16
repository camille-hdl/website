const { test, expect } = require("@playwright/test")

// The reading layout must also work in the static HTML, before hydration.
test.use({ javaScriptEnabled: false })

for (const path of [
  "/ship-modern-javascript-rollup/",
  "/cooler-master-mk730-keyboard-on-macos/",
]) {
  test(`reading column and wide media fit on ${path}`, async ({ page }, testInfo) => {
    await page.goto(path)
    await page.evaluate(() => document.fonts.ready)
    const mobile = testInfo.project.name === "mobile"
    const body = page.locator('[itemprop="articleBody"]')
    const text = await body.boundingBox()
    expect(text.width).toBe(mobile ? 350 : 840)
    await expect(body).toHaveCSS("font-size", mobile ? "20px" : "25px")

    const viewport = page.viewportSize().width
    const blocks = await body.locator(".gatsby-highlight, .gatsby-resp-image-wrapper").evaluateAll(elements =>
      elements.map(element => {
        const { x, width, right } = element.getBoundingClientRect()
        return { x, width, right, image: element.classList.contains("gatsby-resp-image-wrapper"),
          maxWidth: parseFloat(element.style.maxWidth) }
      })
    )
    expect(blocks.length).toBeGreaterThan(0)
    for (const block of blocks) {
      expect(block.x).toBeGreaterThanOrEqual(0)
      expect(block.right).toBeLessThanOrEqual(viewport)
      expect(block.x + block.width / 2).toBeCloseTo(viewport / 2, 1)
      if (block.image) expect(block.width).toBeLessThanOrEqual(block.maxWidth)
      else expect(block.width).toBeGreaterThanOrEqual(text.width)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport)
  })
}
