const { readFileSync, readdirSync } = require("node:fs")
const { join } = require("node:path")
const { test, expect } = require("@playwright/test")
const { measureContrast } = require("./contrast")
const { stylesheetsDigest } = require("../../src/build/stylesheets-digest")

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
  await expect(page.locator("main title, main meta, main html")).toHaveCount(0)
  await expect(page.locator("head title")).toHaveCount(1)
  await expect
    .poll(() =>
      page
        .locator("[data-main-image]")
        .evaluateAll((images) =>
          images.every(
            (image) =>
              image.naturalWidth > 0 && getComputedStyle(image).opacity === "1"
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
    const snapshot =
      night && !fixedTheme.includes(name) ? `${name}-night` : name
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
  await page
    .getByRole("link", { name: "Camille Hodoul", exact: true })
    .first()
    .click()
  await page
    .getByRole("link", {
      name: "How to uninstall Podman Desktop on macos",
      exact: true,
    })
    .click()
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
  await page
    .getByRole("group", { name: "Theme" })
    .getByText("Day", { exact: true })
    .click()
  await expect.poll(() => paperOf(page)).toBe(DAY_PAPER)
  expect(errors).toEqual([])
})

// What the browser paints outside the page too: the root's color scheme
// (scrollbars, native controls), its background, and theme-color.
const rootOf = (page) =>
  page.evaluate(() => {
    const html = getComputedStyle(document.documentElement)
    const themeColor = [
      ...document.querySelectorAll('meta[name="theme-color"]'),
    ].find((meta) => !meta.media || matchMedia(meta.media).matches)?.content
    return {
      scheme: html.colorScheme,
      html: html.backgroundColor,
      body: getComputedStyle(document.body).backgroundColor,
      themeColor,
    }
  })

const DAY_ROOT = {
  scheme: "light",
  html: DAY_PAPER,
  body: DAY_PAPER,
  themeColor: "#fff1e5",
}
const NIGHT_ROOT = {
  scheme: "dark",
  html: NIGHT_PAPER,
  body: NIGHT_PAPER,
  themeColor: "#1f1915",
}

// Each palette page against the choice, then the system, of the other palette.
const paletteCases = [
  ["/palette/", "a forced night", { choice: "night" }, DAY_ROOT, NIGHT_ROOT],
  ["/palette/", "a dark system", { system: "dark" }, DAY_ROOT, NIGHT_ROOT],
  ["/palette-night/", "a forced day", { choice: "day" }, NIGHT_ROOT, DAY_ROOT],
  [
    "/palette-night/",
    "a light system",
    { system: "light" },
    NIGHT_ROOT,
    DAY_ROOT,
  ],
]

const setUp = async (page, { choice, system }) => {
  await page.emulateMedia({ colorScheme: system ?? "light" })
  if (choice) await rememberChoice(page, choice)
}

for (const [path, against, setting, own] of paletteCases) {
  test(`${path} keeps its palette against ${against}, from the first paint`, async ({
    page,
  }) => {
    await page.route(/\.js(\?|$)/, (route) => route.abort())
    await setUp(page, setting)
    await page.goto(path)
    expect(await rootOf(page)).toEqual(own)
  })

  test(`${path} keeps its palette against ${against}, once running`, async ({
    page,
  }) => {
    const errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    await setUp(page, setting)
    await page.goto(path)
    await expect(page.getByRole("group", { name: "Theme" })).toHaveCount(0)
    await expect.poll(() => rootOf(page)).toEqual(own)
    expect(errors).toEqual([])
  })
}

// Every frame the browser paints while a client navigation swaps the page.
const recordFrames = (page) =>
  page.evaluate(() => {
    window.__frames = []
    window.__recording = true
    const frame = () => {
      const html = getComputedStyle(document.documentElement)
      window.__frames.push({
        palette: document.querySelector(".ft-paper")
          ? "day"
          : document.querySelector(".ft-paper-night")
            ? "night"
            : null,
        scheme: html.colorScheme,
        html: html.backgroundColor,
      })
      if (window.__recording) requestAnimationFrame(frame)
    }
    requestAnimationFrame(frame)
  })

const recordedFrames = async (page) => {
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 250)))
  return page.evaluate(() => {
    window.__recording = false
    return window.__frames
  })
}

const navigate = (page, path) =>
  page.evaluate((to) => window.___navigate(to), path)

for (const [path, against, setting, own, site] of paletteCases) {
  test(`a client navigation to ${path} and back against ${against} never shows the other palette`, async ({
    page,
  }) => {
    const errors = []
    page.on("pageerror", (error) => errors.push(error.message))
    await setUp(page, setting)
    await page.goto("/")
    await expect.poll(() => rootOf(page)).toEqual(site)
    const palette = own === DAY_ROOT ? "day" : "night"
    const paints = (root) => ({ scheme: root.scheme, html: root.html })

    await recordFrames(page)
    await navigate(page, path)
    await expect(page).toHaveURL(new RegExp(`${path}$`))
    let frames = await recordedFrames(page)
    expect(frames.some((f) => f.palette === palette)).toBe(true)
    for (const { palette: shown, ...painted } of frames)
      expect(painted).toEqual(paints(shown === palette ? own : site))
    await expect.poll(() => rootOf(page)).toEqual(own)

    await recordFrames(page)
    await navigate(page, "/")
    await expect(page).toHaveURL(/\/$/)
    frames = await recordedFrames(page)
    expect(frames.some((f) => f.palette === null)).toBe(true)
    for (const { palette: shown, ...painted } of frames)
      expect(painted).toEqual(paints(shown === palette ? own : site))
    await expect.poll(() => rootOf(page)).toEqual(site)
    expect(errors).toEqual([])
  })
}

test("another tab's choice applies here too", async ({ context }) => {
  const [first, second] = [await context.newPage(), await context.newPage()]
  await first.goto("/")
  await second.goto("/links/")
  await first
    .getByRole("group", { name: "Theme" })
    .getByText("Night", { exact: true })
    .click()
  await expect.poll(() => paperOf(second)).toBe(NIGHT_PAPER)
  await expect(second.getByRole("radio", { name: "Night" })).toBeChecked()
})

// A palette page has no switch, yet a choice made meanwhile in another tab
// must hold as soon as the reader navigates away from it.
const otherTabCases = [
  ["/palette/", "night", "Day", DAY_ROOT],
  ["/palette/", "night", "Auto", DAY_ROOT],
  ["/palette-night/", "day", "Night", NIGHT_ROOT],
  ["/palette-night/", "day", "Auto", DAY_ROOT],
]

for (const [path, before, label, after] of otherTabCases) {
  test(`${label} chosen in another tab while ${path} is open holds after a client navigation`, async ({
    context,
  }) => {
    const errors = []
    const first = await context.newPage()
    first.on("pageerror", (error) => errors.push(error.message))
    await first.goto("/")
    await first.evaluate(
      (value) => localStorage.setItem("theme", value),
      before
    )
    await first.goto(path)
    const own = path === "/palette/" ? DAY_ROOT : NIGHT_ROOT
    await expect.poll(() => rootOf(first)).toEqual(own)

    const second = await context.newPage()
    await second.goto("/links/")
    await second
      .getByRole("group", { name: "Theme" })
      .getByText(label, { exact: true })
      .click()

    // The choice reaches <html> at once; the palette page still wins.
    const forced = label === "Auto" ? null : label.toLowerCase()
    await expect
      .poll(() =>
        first.evaluate(() =>
          document.documentElement.getAttribute("data-theme")
        )
      )
      .toBe(forced)
    expect(await rootOf(first)).toEqual(own)

    await navigate(first, "/")
    await expect(first).toHaveURL(/\/$/)
    await expect.poll(() => rootOf(first)).toEqual(after)
    await expect(
      first.getByRole("radio", { name: label, exact: true })
    ).toBeChecked()
    expect(errors).toEqual([])
  })
}

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
      test(`every text reaches 4.5:1 on ${path}`, async ({
        page,
      }, testInfo) => {
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

// ---------------------------------------------------------------- build

// A stylesheet-only edit must rebuild every page (see gatsby-node.js): each
// page's data carries the digest of the stylesheets it was built with.
test("every built page carries the current stylesheets digest", () => {
  const root = join(__dirname, "..", "..")
  const digest = stylesheetsDigest(join(root, "src"))
  const dir = join(root, "public", "page-data")
  const files = readdirSync(dir, { recursive: true }).filter((file) =>
    file.endsWith("page-data.json")
  )
  expect(files.length).toBeGreaterThan(allPaths.length)
  for (const file of files) {
    const { result } = JSON.parse(readFileSync(join(dir, file), "utf8"))
    expect(result.pageContext.stylesheets, file).toBe(digest)
  }
})
