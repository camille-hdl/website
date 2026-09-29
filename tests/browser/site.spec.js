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

const storedChoice = (page) =>
  page.evaluate(() => localStorage.getItem("theme"))

// A choice made on an earlier visit, in place before any page script runs.
const rememberChoice = (page, choice) =>
  page.addInitScript((value) => {
    if (!sessionStorage.getItem("seeded")) {
      localStorage.setItem("theme", value)
      sessionStorage.setItem("seeded", "1")
    }
  }, choice)

test("the site follows the system palette", async ({ page }) => {
  await page.goto("/")
  expect(await paperOf(page)).toBe(DAY_PAPER)
  await page.emulateMedia({ colorScheme: "dark" })
  expect(await paperOf(page)).toBe(NIGHT_PAPER)
  await expect(page.getByRole("radio", { name: "Auto" })).toBeChecked()
})

test("the switch forces a palette, remembers it, and gives it back to the system", async ({
  page,
}) => {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.goto("/")
  const group = page.getByRole("group", { name: "Theme" })
  await expect(group.getByRole("radio")).toHaveCount(3)

  await group.getByText("Night", { exact: true }).click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "night")
  await expect.poll(() => paperOf(page)).toBe(NIGHT_PAPER)
  expect(await storedChoice(page)).toBe("night")

  await page.reload()
  expect(await paperOf(page)).toBe(NIGHT_PAPER)
  await expect(group.getByRole("radio", { name: "Night" })).toBeChecked()

  // A client-side navigation keeps the choice and shows it.
  await page.getByRole("link", { name: "Camille Hodoul", exact: true }).first().click()
  await page.getByRole("link", { name: "How to uninstall Podman Desktop on macos", exact: true }).click()
  await expect(page).toHaveURL(/\/uninstall-podman-desktop-macos\/$/)
  await expect(group.getByRole("radio", { name: "Night" })).toBeChecked()
  expect(await paperOf(page)).toBe(NIGHT_PAPER)

  await page.emulateMedia({ colorScheme: "dark" })
  await group.getByText("Day", { exact: true }).click()
  await expect.poll(() => paperOf(page)).toBe(DAY_PAPER)
  expect(await storedChoice(page)).toBe("day")

  await group.getByText("Auto", { exact: true }).click()
  await expect(page.locator("html")).not.toHaveAttribute("data-theme", /.*/)
  expect(await storedChoice(page)).toBeNull()
  await expect.poll(() => paperOf(page)).toBe(NIGHT_PAPER)
  expect(errors).toEqual([])
})

test("the switch works from the keyboard", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === "mobile", "no keyboard")
  await page.goto("/")
  await page.keyboard.press("Tab")
  const auto = page.getByRole("radio", { name: "Auto" })
  await expect(auto).toBeFocused()
  await page.keyboard.press("ArrowRight")
  await page.keyboard.press("ArrowRight")
  await expect(page.getByRole("radio", { name: "Night" })).toBeFocused()
  await expect(page.getByRole("radio", { name: "Night" })).toBeChecked()
  await expect.poll(() => paperOf(page)).toBe(NIGHT_PAPER)
  await expect(page.getByRole("group", { name: "Theme" })).toHaveScreenshot(
    "theme-switch-focused.png",
    { animations: "disabled", maxDiffPixels: 0 }
  )
})

test("a remembered palette is painted first, before any bundle runs", async ({
  page,
}) => {
  // With every script file refused, only the inline head script can set it.
  await page.route(/\.js(\?|$)/, (route) => route.abort())
  await rememberChoice(page, "night")
  await page.goto("/")
  expect(await paperOf(page)).toBe(NIGHT_PAPER)
  await page.emulateMedia({ colorScheme: "dark" })
  await page.evaluate(() => localStorage.setItem("theme", "day"))
  await page.goto("/links/")
  expect(await paperOf(page)).toBe(DAY_PAPER)
})

test("a broken storage leaves the site on the system palette", async ({
  page,
}) => {
  const errors = []
  page.on("pageerror", (error) => errors.push(error.message))
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("storage disabled")
      },
    })
  })
  await page.emulateMedia({ colorScheme: "dark" })
  await page.goto("/")
  expect(await paperOf(page)).toBe(NIGHT_PAPER)
  await page.getByRole("group", { name: "Theme" }).getByText("Day", { exact: true }).click()
  await expect.poll(() => paperOf(page)).toBe(DAY_PAPER)
  expect(errors).toEqual([])
})

test("the palette pages keep their own palette and have no switch", async ({
  page,
}) => {
  await rememberChoice(page, "night")
  await page.goto("/palette/")
  expect(await paperOf(page)).toBe(DAY_PAPER)
  await expect(page.getByRole("group", { name: "Theme" })).toHaveCount(0)
  await page.evaluate(() => localStorage.setItem("theme", "day"))
  await page.goto("/palette-night/")
  expect(await paperOf(page)).toBe(NIGHT_PAPER)
  await expect(page.getByRole("group", { name: "Theme" })).toHaveCount(0)
})

test("another tab's choice applies here too", async ({ context }) => {
  const [first, second] = [await context.newPage(), await context.newPage()]
  await first.goto("/")
  await second.goto("/links/")
  await first.getByRole("group", { name: "Theme" }).getByText("Night", { exact: true }).click()
  await expect.poll(() => paperOf(second)).toBe(NIGHT_PAPER)
  await expect(second.getByRole("radio", { name: "Night" })).toBeChecked()
})

test("the palettes fade into each other, unless motion is reduced", async ({
  page,
}) => {
  await page.goto("/")
  const group = page.getByRole("group", { name: "Theme" })
  const fading = () =>
    page.evaluate(() => [
      document.documentElement.classList.contains("theme-transition"),
      getComputedStyle(document.body).transitionDuration,
    ])
  await group.getByText("Night", { exact: true }).click()
  expect(await fading()).toEqual([true, "0.3s, 0.3s, 0.3s, 0.3s"])
  await expect.poll(fading).toEqual([false, "0s"])

  await page.emulateMedia({ reducedMotion: "reduce" })
  await group.getByText("Day", { exact: true }).click()
  expect(await fading()).toEqual([false, "0s"])
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
