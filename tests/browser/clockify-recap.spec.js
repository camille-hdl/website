const { test, expect } = require("@playwright/test")
const { mkdirSync } = require("node:fs")
const { join } = require("node:path")
const { measureContrast } = require("./contrast")

for (const theme of ["day", "night"]) {
  test(`Clockify recap follows the ${theme} palette at column width`, async ({
    page,
  }, testInfo) => {
    const errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    // The saved reader choice must win over the opposite system palette.
    await page.emulateMedia({
      colorScheme: theme === "day" ? "dark" : "light",
      reducedMotion: "reduce",
    })
    await page.addInitScript(
      (choice) => localStorage.setItem("theme", choice),
      theme
    )
    await page.goto("/bye-bye-time-tracking/")
    await page.evaluate(() => document.fonts.ready)
    const figure = page.locator(".clockify-recap")
    await expect(figure).toBeVisible()
    await expect(figure).toHaveAttribute("lang", "en")
    await expect(figure).toHaveAttribute(
      "aria-label",
      "Time tracked in Clockify, one square per day"
    )
    await expect(figure).toHaveAttribute(
      "aria-description",
      "Use the Left and Right arrow keys to move between days, and Home and End to jump to the first and last day."
    )
    await expect(page.locator("h1")).toHaveText("bye bye time-tracking")
    await expect(page.locator("[itemprop=articleBody] h1")).toHaveCount(0)
    await expect(figure.locator(".cr-day")).toHaveCount(2305)
    await expect(figure.locator(".cr-days")).toHaveCount(76)
    await expect(figure.locator(".cr-year-label")).toHaveText([
      "2020",
      "2021",
      "2022",
      "2023",
      "2024",
      "2025",
      "2026",
    ])
    const dimensions = await figure.evaluate((el) => {
      const bounds = el.getBoundingClientRect()
      const parent = el.parentElement.getBoundingClientRect()
      const cell = el.querySelector(".cr-day").getBoundingClientRect()
      return {
        width: bounds.width,
        parent: parent.width,
        left: bounds.left - parent.left,
        square: Math.abs(cell.width - cell.height),
        overflow: document.documentElement.scrollWidth > innerWidth,
        color: getComputedStyle(el.querySelector('[data-level="4"]'))
          .backgroundColor,
        jade: getComputedStyle(el).getPropertyValue("--jade").trim(),
        mask: getComputedStyle(el).maskImage,
      }
    })
    expect(dimensions.width).toBeCloseTo(dimensions.parent, 0)
    expect(dimensions.left).toBeCloseTo(0, 0)
    expect(dimensions.square).toBeLessThan(1)
    expect(dimensions.overflow).toBe(false)
    expect(dimensions.mask).toContain("linear-gradient")
    expect(dimensions.color).toBe(
      theme === "day" ? "rgb(0, 115, 58)" : "rgb(77, 179, 123)"
    )
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      /thumbnail-day/
    )
    expect(
      await figure
        .locator(".cr-year-label")
        .first()
        .evaluate((el) => getComputedStyle(el).fontWeight)
    ).toBe(theme === "day" ? "400" : "450")
    const contrast = await page.evaluate(`(${measureContrast})()`)
    expect(contrast.measured).toBeGreaterThan(0)
    expect(contrast.failures).toEqual([])
    await page.waitForFunction(
      () => !!document.querySelector(".clockify-recap")?.onkeydown
    )
    for (const [date, label] of [
      ["2025-05-14", "May 14, 2025 · 5 h 48 min"],
      ["2020-12-14", "Dec 14, 2020 · 8 h 44 min 58 s"],
      ["2020-07-11", "Jul 11, 2020 · No time tracked"],
      ["2026-10-31", "Oct 31, 2026 · Outside tracked period"],
    ]) {
      const cell = figure.locator(`[data-date="${date}"]`)
      await expect(cell).toHaveAttribute("aria-label", label)
      await cell.focus()
      expect(
        await cell.evaluate((el) => getComputedStyle(el, "::after").content)
      ).toBe(JSON.stringify(label))
    }
    await expect(figure.locator('[tabindex="0"]')).toHaveCount(1)
    const day = figure.locator('[data-date="2020-07-10"]')
    await day.focus()
    await expect(figure).toHaveCSS("mask-image", "none")
    await expect(day).toHaveAttribute("aria-label", "Jul 10, 2020 · 1 h 28 min")
    expect(
      await day.evaluate((el) => getComputedStyle(el, "::after").content)
    ).toContain("Jul 10, 2020 · 1 h 28 min")
    await day.press("ArrowRight")
    await expect(figure.locator('[data-date="2020-07-11"]')).toBeFocused()
    await page.keyboard.press("Home")
    await expect(day).toBeFocused()
    // A clicked day need not be the day in the Tab order.
    await figure.locator('[data-date="2020-07-14"]').click()
    await page.keyboard.press("ArrowRight")
    await expect(figure.locator('[data-date="2020-07-15"]')).toBeFocused()
    await expect(figure.locator('[tabindex="0"]')).toHaveCount(1)
    await page.keyboard.press("Tab")
    await expect(figure.locator(":focus")).toHaveCount(0)
    const directory =
      process.env.CLOCKIFY_CAPTURES || testInfo.outputPath("captures")
    mkdirSync(directory, { recursive: true })
    await day.blur()
    await page.screenshot({
      path: join(directory, `${testInfo.project.name}-${theme}.png`),
      fullPage: true,
    })
    await figure.screenshot({
      path: join(directory, `${testInfo.project.name}-${theme}-chart.png`),
    })
    // A client navigation creates a new figure, so its keyboard behavior must return.
    await page
      .getByRole("link", { name: "Camille Hodoul", exact: true })
      .first()
      .click()
    await page
      .getByRole("link", { name: "bye bye time-tracking", exact: true })
      .click()
    await page.waitForFunction(
      () => !!document.querySelector(".clockify-recap")?.onkeydown
    )
    await day.focus()
    await day.press("End")
    await expect(figure.locator(".cr-day").last()).toBeFocused()
    await expect(figure).toHaveCSS("mask-image", "none")
    await page.screenshot({
      path: join(
        directory,
        `${testInfo.project.name}-${theme}-keyboard-end.png`
      ),
    })
    await page.keyboard.press("Home")
    await expect(day).toBeFocused()
    expect(errors).toEqual([])
  })
}
