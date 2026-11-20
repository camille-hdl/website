const { test, expect } = require("@playwright/test")
const { mkdirSync } = require("node:fs")
const { join } = require("node:path")

for (const theme of ["day", "night"]) {
  test(`Clockify recap follows the ${theme} palette at column width`, async ({ page }, testInfo) => {
    const errors = []
    page.on("pageerror", error => errors.push(error.message))
    await page.emulateMedia({ colorScheme: theme === "day" ? "dark" : "light", reducedMotion: "reduce" })
    await page.addInitScript(choice => localStorage.setItem("theme", choice), theme)
    await page.goto("/bye-bye-time-tracking/")
    await page.evaluate(() => document.fonts.ready)
    const figure = page.locator(".clockify-recap")
    await expect(figure).toBeVisible()
    await expect(page.locator("h1")).toHaveText("bye bye time-tracking")
    await expect(page.locator("[itemprop=articleBody] h1")).toHaveCount(0)
    await expect(figure.locator(".cr-day")).toHaveCount(2305)
    await expect(figure.locator(".cr-days")).toHaveCount(76)
    await expect(figure.locator(".cr-year-label")).toHaveText(["2020", "2021", "2022", "2023", "2024", "2025", "2026"])
    const dimensions = await figure.evaluate(el => {
      const bounds = el.getBoundingClientRect()
      const parent = el.parentElement.getBoundingClientRect()
      const cell = el.querySelector(".cr-day").getBoundingClientRect()
      return { width: bounds.width, parent: parent.width, left: bounds.left - parent.left,
        square: Math.abs(cell.width - cell.height), overflow: document.documentElement.scrollWidth > innerWidth,
        color: getComputedStyle(el.querySelector('[data-level="4"]')).backgroundColor,
        jade: getComputedStyle(el).getPropertyValue("--jade").trim(), mask: getComputedStyle(el).maskImage }
    })
    expect(dimensions.width).toBeCloseTo(dimensions.parent, 0)
    expect(dimensions.left).toBeCloseTo(0, 0)
    expect(dimensions.square).toBeLessThan(1)
    expect(dimensions.overflow).toBe(false)
    expect(dimensions.mask).toContain("linear-gradient")
    expect(dimensions.color).toBe(theme === "day" ? "rgb(0, 115, 58)" : "rgb(77, 179, 123)")
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /thumbnail-day/)
    const day = figure.locator('[data-date="2020-07-10"]')
    await day.focus()
    await expect(day).toHaveAttribute("aria-label", /10\/07\/2020/)
    expect(await day.evaluate(el => getComputedStyle(el, "::after").content)).toContain("10/07/2020")
    const directory = process.env.CLOCKIFY_CAPTURES || testInfo.outputPath("captures")
    mkdirSync(directory, { recursive: true })
    await day.blur()
    await page.screenshot({ path: join(directory, `${testInfo.project.name}-${theme}.png`), fullPage: true })
    await figure.screenshot({ path: join(directory, `${testInfo.project.name}-${theme}-chart.png`) })
    expect(errors).toEqual([])
  })
}
