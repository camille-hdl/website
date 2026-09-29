const { test } = require("node:test")
const assert = require("node:assert/strict")
const { mkdtempSync, mkdirSync, writeFileSync, renameSync } = require("node:fs")
const { tmpdir } = require("node:os")
const { join } = require("node:path")

const { stylesheetsDigest } = require("../src/build/stylesheets-digest")

const tree = () => {
  const dir = mkdtempSync(join(tmpdir(), "stylesheets-"))
  mkdirSync(join(dir, "components"))
  writeFileSync(join(dir, "layout.css"), ":root { --paper: #fff1e5; }")
  writeFileSync(join(dir, "components", "a.module.css"), ".a { color: red; }")
  writeFileSync(join(dir, "page.js"), "export default 1")
  return dir
}

test("the stylesheets digest is stable while nothing changes", () => {
  const dir = tree()
  assert.equal(stylesheetsDigest(dir), stylesheetsDigest(dir))
})

test("the stylesheets digest changes with any rule, in any stylesheet", () => {
  const dir = tree()
  const before = stylesheetsDigest(dir)
  writeFileSync(join(dir, "components", "a.module.css"), ".a { color: blue; }")
  assert.notEqual(stylesheetsDigest(dir), before)
})

test("the stylesheets digest changes when a stylesheet moves", () => {
  const dir = tree()
  const before = stylesheetsDigest(dir)
  renameSync(join(dir, "layout.css"), join(dir, "components", "layout.css"))
  assert.notEqual(stylesheetsDigest(dir), before)
})

test("the stylesheets digest ignores everything but stylesheets", () => {
  const dir = tree()
  const before = stylesheetsDigest(dir)
  writeFileSync(join(dir, "page.js"), "export default 2")
  assert.equal(stylesheetsDigest(dir), before)
})
