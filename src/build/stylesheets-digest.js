const { createHash } = require("node:crypto")
const { readdirSync, readFileSync } = require("node:fs")
const { join, relative } = require("node:path")

/**
 * One digest of every stylesheet under `dir`, paths included, in a stable
 * order: it changes whenever a rule, a file name or the set of files does.
 */
const stylesheetsDigest = (dir) => {
  const hash = createHash("sha256")
  const files = readdirSync(dir, { recursive: true })
    .filter((file) => file.endsWith(".css"))
    .sort()
  for (const file of files) {
    hash.update(relative(dir, join(dir, file)))
    hash.update("\0")
    hash.update(readFileSync(join(dir, file)))
    hash.update("\0")
  }
  return hash.digest("hex")
}

module.exports = { stylesheetsDigest }
