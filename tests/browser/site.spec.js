const { readFileSync } = require("node:fs")
const { test, expect } = require("@playwright/test")
const { measureContrast } = require("./contrast")

const thread = {
  $type: "app.bsky.feed.defs#threadViewPost",
  post: {
    uri: "at://did:plc:test/app.bsky.feed.post/root",
    likeCount: 8,
    repostCount: 2,
    replyCount: 5,
  },
  replies: [3, 1, 5, 2, 4].map((likes) => ({
    $type: "app.bsky.feed.defs#threadViewPost",
    post: {
      uri: `at://did:plc:test/app.bsky.feed.post/reply${likes}`,
      author: {
        did: "did:plc:test",
        handle: "reader.test",
        displayName: "Reader",
      },
      record: { $type: "app.bsky.feed.post", text: `Test comment ${likes}` },
      likeCount: likes,
    },
    replies: [],
  })),
}

test.beforeEach(async ({ page }) => {
  await page.route("https://public.api.bsky.app/**", (route) =>
    route.fulfill({ json: { thread } })
  )
})

const pages = [
  ["home", "/"],
  ["links", "/links/"],
  ["comments", "/uninstall-podman-desktop-macos/"],
  ["images", "/cooler-master-mk730-keyboard-on-macos/"],
  ["code", "/ship-modern-javascript-rollup/"],
  ["palette", "/palette/"],
  ["palette-night", "/palette-night/"],
]

async function checkAppearance(page, name, path, snapshot) {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto(path)
  await page.evaluate(() => document.fonts.ready)
  if (name === "comments")
    await expect(
      page.getByText("Test comment 5", { exact: true })
    ).toBeVisible()
  // Load lazy images before comparing the entire page.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y)
      await new Promise((resolve) => setTimeout(resolve, 30))
    }
    await Promise.all(
      [...document.images].map((image) => image.decode().catch(() => {}))
    )
    window.scrollTo(0, 0)
  })
  await expect(page.locator("main title, main meta, main html")).toHaveCount(
    0
  )
  await expect(page.locator("head title")).toHaveCount(1)
  await expect
    .poll(() =>
      page
        .locator("[data-main-image]")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image.naturalWidth > 0 &&
              getComputedStyle(image).opacity === "1"
          )
        )
    )
    .toBe(true)
  await expect(page).toHaveScreenshot(`${snapshot}.png`, {
    fullPage: true,
    animations: "disabled",
    maxDiffPixels: 0,
  })
  expect(
    await page.locator('style[id="typography.js"]').textContent()
  ).toMatchSnapshot("typography.css")
  expect(errors).toEqual([])
}

// The palette pages keep their own palette whatever the system says, so at
// night they must match their day snapshot.
const fixedTheme = ["palette", "palette-night"]

for (const [name, path] of pages) {
  for (const night of [false, true]) {
    const title = `appearance: ${name}${night ? " at night" : ""}`
    const snapshot = night && !fixedTheme.includes(name) ? `${name}-night` : name
    test(title, async ({ page }) => {
      if (night) await page.emulateMedia({ colorScheme: "dark" })
      await checkAppearance(page, name, path, snapshot)
    })
  }
}

test("client navigation and comments remain interactive", async ({ page }) => {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  await expect(page.locator("article")).toHaveCount(41)
  await page.evaluate(() => {
    window.navigationSentinel = true
  })
  await page
    .getByRole("link", {
      name: "How to uninstall Podman Desktop on macos",
      exact: true,
    })
    .click()
  await expect(page).toHaveURL(/\/uninstall-podman-desktop-macos\/$/)
  expect(await page.evaluate(() => window.navigationSentinel)).toBe(true)
  await expect(page.getByText("Test comment 5", { exact: true })).toBeVisible()
  await expect(page.getByText("Test comment 1", { exact: true })).toHaveCount(0)
  await page.getByRole("button", { name: "Show more comments" }).click()
  await expect(page.getByText("Test comment 1", { exact: true })).toBeVisible()
  await expect(
    page.getByRole("button", { name: "Show more comments" })
  ).toHaveCount(0)
  await page
    .getByRole("link", { name: "Camille Hodoul", exact: true })
    .first()
    .click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.locator("article")).toHaveCount(41)
  expect(errors).toEqual([])
})

test("comments display a request failure", async ({ page }) => {
  await page.route("https://public.api.bsky.app/**", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" })
  )
  await page.goto("/uninstall-podman-desktop-macos/")
  await expect(
    page.getByText("Error loading comments", { exact: true })
  ).toBeVisible()
})

// ---------------------------------------------------------------- theme

const DAY_PAPER = "rgb(255, 241, 229)"
const NIGHT_PAPER = "rgb(31, 25, 21)"

const paperOf = (page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor)

test("the site follows the system palette", async ({ page }) => {
  await page.goto("/")
  expect(await paperOf(page)).toBe(DAY_PAPER)
  await page.emulateMedia({ colorScheme: "dark" })
  expect(await paperOf(page)).toBe(NIGHT_PAPER)
})

test("the palette pages keep their own palette", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" })
  await page.goto("/palette/")
  expect(await paperOf(page)).toBe(DAY_PAPER)
  await page.emulateMedia({ colorScheme: "light" })
  await page.goto("/palette-night/")
  expect(await paperOf(page)).toBe(NIGHT_PAPER)
})

// ---------------------------------------------------------------- contrast

// Every page the site publishes, from the sitemap of the build under test.
const sitemap = readFileSync(`${__dirname}/../../public/sitemap-0.xml`, "utf8")
const allPaths = [
  ...[...sitemap.matchAll(/<loc>https?:\/\/[^/]+(\/[^<]*)<\/loc>/g)].map(
    ([, path]) => path
  ),
  "/404/",
]

for (const night of [false, true]) {
  test.describe(`contrast ${night ? "at night" : "by day"}`, () => {
    for (const path of allPaths) {
      test(`every text reaches 4.5:1 on ${path}`, async ({ page }, testInfo) => {
        test.skip(
          testInfo.project.name !== "desktop",
          "colors do not depend on the viewport"
        )
        if (night) await page.emulateMedia({ colorScheme: "dark" })
        await page.goto(path)
        await page.evaluate(() => document.fonts.ready)
        const { measured, failures } = await page.evaluate(
          `(${measureContrast})()`
        )
        expect(measured).toBeGreaterThan(0)
        expect(failures).toEqual([])
      })
    }
  })
}
