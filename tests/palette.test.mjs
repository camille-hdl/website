import { test } from "node:test"
import assert from "node:assert/strict"

import * as day from "../src/data/ft-paper.js"
import * as night from "../src/data/ft-paper-night.js"

const swatches = night.groups.flatMap(({ swatches }) => swatches)

test("every night ink and accent reads on each surface it is cleared for", () => {
  for (const { role, worst } of swatches.filter(({ worst }) => worst)) {
    assert.ok(
      worst.contrast >= 4.5,
      `${role}: ${worst.contrast}:1 on ${worst.surface}`
    )
  }
})

test("night body ink is readable without glaring", () => {
  const ink = swatches.find(({ role }) => role === "ink")
  assert.ok(ink.contrast >= 10 && ink.contrast <= 12, `${ink.contrast}:1`)
})

test("ink reads on every night surface and fill", () => {
  for (const { title, swatches } of night.groups.filter(({ title }) =>
    ["Surfaces", "Derived fills"].includes(title)
  )) {
    for (const { role, contrast } of swatches.filter(
      ({ role }) => role !== "rule"
    )) {
      assert.ok(contrast >= 7, `${title} ${role}: ${contrast}:1`)
    }
  }
})

test("every terminal slot is readable as text on the night background", () => {
  for (const [index, { role, contrast }] of night.terminal.ansi.entries()) {
    assert.ok(contrast >= 4.5, `ANSI ${index} (${role}): ${contrast}:1`)
  }
})

test("every semantic role that carries text meets 4.5:1", () => {
  const exempt = ["Border, divider", "Disabled"]
  for (const { pairs } of night.roles) {
    for (const { use, contrast } of pairs.filter(
      ({ use }) => !exempt.includes(use)
    )) {
      assert.ok(contrast >= 4.5, `${use}: ${contrast}:1`)
    }
  }
})

// The stylesheet repeats the palette as custom properties; every token must be
// the module's value for that role. Non-hex tokens (--masthead) are not roles.
const readStylesheet = async () => {
  const { readFile } = await import("node:fs/promises")
  return readFile(new URL("../src/layout.css", import.meta.url), "utf8")
}

const stylesheetTokens = async (selector) => {
  const css = await readStylesheet()
  const escaped = selector.replace(/[().[\]"]/g, "\\$&")
  const block = css.match(new RegExp(`^\\s*${escaped} \\{([^}]*)\\}`, "m"))
  assert.ok(block, selector)
  const declarations = [...block[1].matchAll(/--([\w-]+):\s*([^;]+);/g)]
  return {
    names: declarations.map(([, name]) => name),
    hexes: declarations.filter(([, , value]) => /^#[0-9a-f]{6}$/.test(value)),
  }
}

const DAY = ":root"
const NIGHT_SYSTEM = ':root:not([data-theme="day"]):not(:has(.ft-paper))'
const NIGHT_FORCED =
  ':root[data-theme="night"]:not(:has(.ft-paper)),\n:root:has(.ft-paper-night)'

test("the night stylesheet tokens match the night palette", async () => {
  for (const selector of [NIGHT_SYSTEM, NIGHT_FORCED]) {
    const { hexes } = await stylesheetTokens(selector)
    assert.ok(hexes.length > 0, selector)
    for (const [, role, hex] of hexes) {
      assert.equal(hex, night.hexOf[role], `${selector} --${role}`)
    }
  }
})

test("the day stylesheet tokens match the day palette", async () => {
  const { hexes } = await stylesheetTokens(DAY)
  assert.ok(hexes.length > 0)
  for (const [, role, hex] of hexes) {
    assert.equal(hex, day.hexOf[role], `--${role}`)
  }
})

test("the night blocks set every token the day block sets", async () => {
  const { names } = await stylesheetTokens(DAY)
  for (const selector of [NIGHT_SYSTEM, NIGHT_FORCED]) {
    assert.deepEqual((await stylesheetTokens(selector)).names, names, selector)
  }
})

test("every token the site uses is set by the palette", async () => {
  const { readFile, readdir } = await import("node:fs/promises")
  const { names } = await stylesheetTokens(DAY)
  const src = new URL("../src/", import.meta.url)
  const files = (await readdir(src, { recursive: true })).filter((file) =>
    /\.(css|js)$/.test(file)
  )
  for (const file of files) {
    const text = await readFile(new URL(file, src), "utf8")
    for (const [, name] of text.matchAll(/var\(--([\w-]+)\)/g)) {
      assert.ok(names.includes(name), `${file}: --${name}`)
    }
  }
})

const daySwatches = day.groups.flatMap(({ swatches }) => swatches)

test("every day color cleared for text reads on each of its surfaces", () => {
  for (const { role, worst } of daySwatches.filter(({ worst }) => worst)) {
    assert.ok(
      worst.contrast >= 4.5,
      `${role}: ${worst.contrast}:1 on ${worst.surface}`
    )
  }
})

test("ink reads on every day surface and fill", () => {
  for (const { title, swatches } of day.groups.filter(({ title }) =>
    ["Surfaces", "Derived fills"].includes(title)
  )) {
    for (const { role, contrast } of swatches.filter(
      ({ role }) => role !== "rule"
    )) {
      assert.ok(contrast >= 4.5, `${title} ${role}: ${contrast}:1`)
    }
  }
})

test("every day role that carries text meets 4.5:1 or says why not", () => {
  for (const { pairs } of day.roles) {
    for (const { use, contrast, exempt } of pairs) {
      if (exempt) assert.ok(contrast < 4.5, `${use} needs no exemption`)
      else assert.ok(contrast >= 4.5, `${use}: ${contrast}:1`)
    }
  }
})

test("every day role credits known tools", () => {
  for (const { pairs } of [...day.roles, day.terminal]) {
    for (const { use, tools } of pairs) {
      assert.ok(tools.length > 0, use)
      for (const tool of tools) assert.ok(tool in day.tools, `${use}: ${tool}`)
    }
  }
})

test("the day terminal fills each ANSI slot once, from the swatches", () => {
  assert.deepEqual(
    day.terminal.ansi.map(({ role }) => day.hexOf[role]),
    day.terminal.ansi.map(({ hex }) => hex)
  )
  for (let slot = 0; slot < 16; slot++) {
    const holders = daySwatches.filter(({ ansi }) => ansi === slot)
    assert.ok(holders.length > 0, `ANSI ${slot}`)
    assert.equal(new Set(holders.map(({ hex }) => hex)).size, 1, `ANSI ${slot}`)
  }
})
