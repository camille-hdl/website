import { test } from "node:test"
import assert from "node:assert/strict"

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

test("the night stylesheet tokens match the night palette", async () => {
  const { readFile } = await import("node:fs/promises")
  const css = await readFile(
    new URL("../src/layout.css", import.meta.url),
    "utf8"
  )
  const block = css.match(/body:has\(\.ft-paper-night\) \{([^}]*)\}/)[1]
  const tokens = [...block.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6});/g)]
  assert.ok(tokens.length > 0)
  for (const [, role, hex] of tokens) {
    assert.equal(hex, night.hexOf[role], `--${role}`)
  }
})
