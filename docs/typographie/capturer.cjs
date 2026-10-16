const fs = require("node:fs/promises")
const path = require("node:path")
const http = require("node:http")
const crypto = require("node:crypto")
const assert = require("node:assert/strict")
const { chromium } = require("@playwright/test")
const sharp = require("sharp")
const repo = path.resolve(__dirname, "../..")
const types = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".json": "application/json" }
const selectors = {
  body: "body", title: "main > header h1", heading: '[itemprop="articleBody"] h2',
  prose: '[itemprop="articleBody"] > p', code: ".gatsby-highlight code",
  label: ".post-date", italic: ".specimen em", bold: ".specimen strong",
}
async function inspect(page) {
  return page.evaluate(selectors => {
    const styles = {}
    for (const [name, selector] of Object.entries(selectors)) {
      const el = document.querySelector(selector)
      if (!el) throw Error(`Échantillon absent : ${selector}`)
      const style = getComputedStyle(el)
      styles[name] = Object.fromEntries(["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "color"].map(key => [key, style[key]]))
    }
    return {
      styles,
      rootFontSize: getComputedStyle(document.documentElement).fontSize,
      paper: getComputedStyle(document.body).backgroundColor,
      overflow: document.documentElement.scrollWidth > innerWidth,
      articleHTML: document.querySelector('[itemprop="articleBody"]').outerHTML,
      contentWidth: document.querySelector('[itemprop="articleBody"]').getBoundingClientRect().width,
    }
  }, selectors)
}
async function renderedFonts(page) {
  const session = await page.context().newCDPSession(page)
  await session.send("DOM.enable")
  await session.send("CSS.enable")
  const { root } = await session.send("DOM.getDocument")
  const fonts = {}
  for (const key of ["title", "heading", "prose", "code", "label", "italic", "bold"]) {
    const { nodeId } = await session.send("DOM.querySelector", { nodeId: root.nodeId, selector: selectors[key] })
    fonts[key] = (await session.send("CSS.getPlatformFontsForNode", { nodeId })).fonts
  }
  await session.detach()
  return fonts
}
async function pairImages(images, output, width, theme) {
  const metadata = await Promise.all(images.map(buffer => sharp(buffer).metadata()))
  const height = Math.max(...metadata.map(meta => meta.height))
  await sharp({ create: { width: width * 2, height, channels: 3, background: theme === "day" ? "#fff1e5" : "#1f1915" } })
    .composite(images.map((input, i) => ({ input, top: 0, left: i * width })))
    .png().toFile(path.join(__dirname, "captures", output))
}
async function main() {
  // Un serveur local et un navigateur sans interface, une seule page à la fois.
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost")
      let file = path.resolve(repo, "." + decodeURIComponent(url.pathname))
      if (!file.startsWith(repo + path.sep)) { res.writeHead(403).end(); return }
      try { await fs.access(file) } catch {
        file = path.resolve(repo, "public", "." + decodeURIComponent(url.pathname))
        if (!file.startsWith(path.join(repo, "public") + path.sep)) { res.writeHead(403).end(); return }
      }
      const buffer = await fs.readFile(file)
      res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream", "Cache-Control": "no-store" })
      res.end(buffer)
    } catch { res.writeHead(404).end() }
  })
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve))
  let browser
  try {
    browser = await chromium.launch({ headless: true })
    const origin = `http://127.0.0.1:${server.address().port}`
    const source = JSON.parse(await fs.readFile(path.join(__dirname, "source.json")))
    const manifest = JSON.parse(await fs.readFile(path.join(__dirname, "fonts/sources.json")))
    for (const font of manifest.files) {
      const buffer = await fs.readFile(path.join(__dirname, "fonts", font.file))
      assert.equal(crypto.createHash("sha256").update(buffer).digest("hex"), font.sha256)
    }
    const report = { browser: browser.version(), deviceScaleFactor: 1, cache: "empty context per render", includes: "complete article and supplementary French specimen", cases: [], checks: [] }
    for (const viewport of ["desktop", "mobile"]) {
      const size = viewport === "desktop" ? { width: 1280, height: 900 } : { width: 390, height: 844 }
      for (const theme of ["day", "night"]) {
        const crops = [], full = []
        for (const variant of ["actuelle", "plex"]) {
          const context = await browser.newContext({ viewport: size, deviceScaleFactor: 1, isMobile: viewport === "mobile", colorScheme: theme === "day" ? "light" : "dark", serviceWorkers: "block" })
          await context.route("**/*", route => new URL(route.request().url()).origin === origin ? route.continue() : route.abort())
          const page = await context.newPage()
          const failures = []
          page.on("pageerror", error => failures.push(error.message))
          page.on("response", response => { if (response.status() >= 400) failures.push(`${response.status()} ${response.url()}`) })
          const fontResponses = []
          page.on("response", response => { if (response.request().resourceType() === "font") fontResponses.push(response) })
          await page.goto(`${origin}/docs/typographie/article.html?${new URLSearchParams({ variant, theme })}`, { waitUntil: "networkidle" })
          await page.evaluate(() => document.fonts.ready)
          const info = await inspect(page)
          assert.equal(info.overflow, false, `${viewport} ${theme} ${variant} déborde`)
          assert.deepEqual(failures, [])
          const articleHash = crypto.createHash("sha256").update(info.articleHTML).digest("hex")
          assert.equal(articleHash, source.articleHTMLSha256, "L'article diffère de la source Gatsby")
          delete info.articleHTML
          const fonts = []
          for (const response of fontResponses) {
            const file = path.basename(decodeURIComponent(new URL(response.url()).pathname))
            const bytes = (await response.body()).length
            fonts.push({ file, bytes })
          }
          fonts.sort((a, b) => a.file.localeCompare(b.file))
          assert.ok(fonts.length > 0)
          assert.ok(fonts.every(font => variant === "plex" ? font.file.startsWith("IBM Plex") : !font.file.startsWith("IBM Plex")), "Une variante charge les polices de l'autre")
          const platformFonts = await renderedFonts(page)
          for (const [key, fonts] of Object.entries(platformFonts)) {
            assert.ok(fonts.some(font => font.isCustomFont), `Police web absente pour ${key}`)
            const expected = variant === "plex" ? (key === "code" ? "Plex Mono" : ["title", "label"].includes(key) ? "Plex Sans" : "Plex Serif") : (key === "code" ? "Fira Code" : ["title", "label"].includes(key) ? "Montserrat" : "Merriweather")
            assert.ok(fonts.some(font => font.familyName.includes(expected)), `${key} attend ${expected}, reçu ${JSON.stringify(fonts)}`)
          }
          assert.equal(info.styles.body.fontSize, variant === "plex" ? (viewport === "desktop" ? "25px" : "20px") : (viewport === "desktop" ? "19px" : "18px"))
          assert.equal(info.styles.body.fontWeight, variant === "plex" && theme === "night" ? "450" : "400")
          if (variant === "plex") {
            assert.equal(info.styles.code.fontSize, info.styles.body.fontSize)
            assert.equal(info.styles.code.fontWeight, info.styles.body.fontWeight)
          }
          crops.push(await page.screenshot())
          full.push(await page.screenshot({ fullPage: true }))
          report.cases.push({ viewport, width: size.width, height: size.height, theme, variant, ...info, platformFonts, fonts, fontBytes: fonts.reduce((sum, font) => sum + font.bytes, 0) })
          await context.close()
        }
        const pair = report.cases.slice(-2)
        assert.equal(pair[0].paper, pair[1].paper)
        await pairImages(crops, `${viewport}-${theme}.png`, size.width, theme)
        await pairImages(full, `${viewport}-${theme}-integral.png`, size.width, theme)
        console.log(`${viewport} ${theme} : ${pair.map(item => `${item.variant} ${item.fontBytes} octets, ${item.fonts.length} fichiers`).join(" ; ")}`)
      }
    }
    // Comparer les styles de la référence à la vraie page de production locale.
    const referenceContext = await browser.newContext({ viewport: { width: 1280, height: 900 }, colorScheme: "light", serviceWorkers: "block" })
    await referenceContext.route("**/*", route => route.request().resourceType() === "script" || new URL(route.request().url()).origin !== origin ? route.abort() : route.continue())
    const reference = await referenceContext.newPage()
    await reference.goto(`${origin}/${source.build}`, { waitUntil: "networkidle" })
    await reference.evaluate(() => document.fonts.ready)
    const referenceStyles = await reference.evaluate(selectors => Object.fromEntries(Object.entries(selectors).filter(([key]) => !["italic", "bold"].includes(key)).map(([name, selector]) => {
      const style = getComputedStyle(document.querySelector(selector))
      return [name, Object.fromEntries(["fontFamily", "fontSize", "fontWeight", "fontStyle", "lineHeight", "color"].map(key => [key, style[key]]))]
    })), selectors)
    const baseline = report.cases.find(item => item.variant === "actuelle")
    for (const [name, style] of Object.entries(referenceStyles)) assert.deepEqual(style, baseline.styles[name], `La référence locale diffère du blog pour ${name}`)
    report.productionReferenceStyles = referenceStyles
    await referenceContext.close()
    // Vérifier les réglages secondaires et le fonctionnement depuis file://.
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } })
    const page = await context.newPage()
    for (const [size, expected] of [["matched", "20.44px"], ["large", "30px"]]) {
      await page.goto(`file://${path.join(__dirname, "article.html")}?variant=plex&theme=night&size=${size}`)
      await page.evaluate(() => document.fonts.ready)
      assert.equal((await inspect(page)).styles.body.fontSize, expected)
    }
    report.checks = ["Plex SHA-256 matches IBM source manifest", "Same complete Gatsby article in all eight renders", "Current typography matches computed styles of the actual local Gatsby production page", "Correct web fonts rendered, verified by Chromium CDP", "No mixed font families downloaded", "Identical palette in each pair", "No document horizontal overflow", "Plex night body and code weight 450", "Plex code at body size", "Matched and large sizes work via file URL"]
    const json = JSON.stringify(report, null, 2) + "\n"
    await fs.writeFile(path.join(__dirname, "mesures.json"), json)
    await fs.writeFile(path.join(__dirname, "mesures.js"), "window.typographyMeasurements = " + json)
    await page.goto(`file://${path.join(__dirname, "comparaison.html")}`)
    await page.locator("#totals tr").nth(3).waitFor()
    await page.selectOption("#theme", "night")
    await page.selectOption("#size", "matched")
    await page.selectOption("#viewport", "mobile")
    const frame = page.frameLocator("#preview")
    await frame.locator("html.type-plex[data-theme=night][data-size=matched]").waitFor()
    assert.equal(await frame.locator("body").evaluate(el => getComputedStyle(el).fontSize), "19.36px")
    await page.selectOption("#variant", "actuelle")
    assert.equal(await page.locator("#size").isDisabled(), true)
    await frame.locator("html:not(.type-plex)").waitFor()
    await page.setViewportSize({ width: 390, height: 844 })
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    await page.selectOption("#variant", "plex")
    await page.selectOption("#theme", "day")
    await page.selectOption("#size", "distance")
    await frame.locator("html.type-plex[data-theme=day][data-size=distance]").waitFor()
    await page.locator("#preview").scrollIntoViewIfNeeded()
    await frame.locator("body").evaluate(() => document.fonts.ready)
    await frame.locator("main h1").waitFor({ state: "visible" })
    await frame.locator("body").evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.screenshot({ path: "/private/tmp/blog-plex-preview-mobile.png" })
    await page.screenshot({ path: "/private/tmp/blog-plex-comparaison-mobile.png", fullPage: true })
    await page.setViewportSize({ width: 1440, height: 1000 })
    await page.selectOption("#viewport", "desktop")
    await page.locator("#preview").scrollIntoViewIfNeeded()
    await frame.locator("body").evaluate(() => document.fonts.ready)
    await frame.locator("main h1").waitFor({ state: "visible" })
    await frame.locator("body").evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
    await page.screenshot({ path: "/private/tmp/blog-plex-preview-desktop.png" })
    await page.screenshot({ path: "/private/tmp/blog-plex-comparaison-desktop.png", fullPage: true })
    await context.close()
    console.log("Huit rendus, huit images assemblées, polices et contrôles file:// vérifiés.")
  } finally {
    await browser?.close()
    await new Promise(resolve => server.close(resolve))
  }
}
main().catch(error => { console.error(error); process.exitCode = 1 })
