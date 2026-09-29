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
// the module's value for that role.
const stylesheetTokens = async (selector) => {
  const { readFile } = await import("node:fs/promises")
  const css = await readFile(
    new URL("../src/layout.css", import.meta.url),
    "utf8"
  )
  const escaped = selector.replace(/[().]/g, "\\$&")
  const block = css.match(new RegExp(`^${escaped} \\{([^}]*)\\}`, "m"))[1]
  const tokens = [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/g)]
  assert.ok(tokens.length > 0, selector)
  return tokens
}

test("the night stylesheet tokens match the night palette", async () => {
  for (const [, role, hex] of await stylesheetTokens(
    "body:has(.ft-paper-night)"
  )) {
    assert.equal(hex, night.hexOf[role], `--${role}`)
  }
})

const daySwatches = day.groups.flatMap(({ swatches }) => swatches)

test("the day stylesheet tokens match the day palette", async () => {
  for (const [, role, hex] of await stylesheetTokens(":root")) {
    assert.equal(hex, day.hexOf[role], `--${role}`)
  }
})

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
