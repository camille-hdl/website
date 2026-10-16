const { createHash } = require("node:crypto")
const { readFileSync } = require("node:fs")
const { join } = require("node:path")
const { test, expect } = require("@playwright/test")

const manifest = JSON.parse(readFileSync(join(__dirname, "../../src/fonts/sources.json")))
const sources = new Map(manifest.files.map(font => [font.sha256, font]))

for (const night of [false, true]) {
  for (const path of ["/", "/ship-modern-javascript-rollup/"]) {
    test(`Plex fonts on ${path} ${night ? "at night" : "by day"}`, async ({ page }, testInfo) => {
      const responses = []
      page.on("response", response => {
        if (response.request().resourceType() === "font") responses.push(response)
      })
      await page.emulateMedia({ colorScheme: night ? "dark" : "light" })
      await page.goto(path)
      await page.evaluate(() => document.fonts.ready)
      const expectedSize = testInfo.project.name === "mobile" ? "20px" : "25px"
      await expect(page.locator("body")).toHaveCSS("font-size", expectedSize)
      await expect(page.locator("body")).toHaveCSS("font-weight", night ? "450" : "400")
      for (const selector of ["body", "h1", ...(path === "/" ? [] : ["h2"])]) {
        await expect(page.locator(selector).first()).toHaveCSS("font-family", /IBM Plex Sans Var/)
      }
      if (path !== "/") {
        const code = page.locator(".gatsby-highlight code").first()
        await expect(code).toHaveCSS("font-family", /IBM Plex Mono Var/)
        await expect(code).toHaveCSS("font-size", expectedSize)
        await expect(code).toHaveCSS("font-weight", night ? "450" : "400")
        await expect(code).toHaveCSS("font-variant-ligatures", "none")
      }
      const loaded = []
      for (const response of responses) {
        expect(response.status()).toBe(200)
        const data = await response.body()
        const font = sources.get(createHash("sha256").update(data).digest("hex"))
        expect(font, response.url()).toBeDefined()
        loaded.push({ file: font.file, bytes: data.length })
      }
      const expected = ["IBM Plex Sans Var-Roman-Latin1.woff2"]
      expected.push(path === "/" ? "IBM Plex Sans Var-Italic-Latin1.woff2" : "IBM Plex Mono Var-Roman-Latin1.woff2")
      expect(loaded.map(font => font.file).sort()).toEqual(expected.sort())
      await testInfo.attach("font-payload", {
        body: JSON.stringify({ path, night, loaded, totalBytes: loaded.reduce((sum, font) => sum + font.bytes, 0) }, null, 2),
        contentType: "application/json",
      })
    })
  }
}
