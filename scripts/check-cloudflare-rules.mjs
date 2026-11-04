// Fails when public/_headers or public/_redirects exceed what Workers Static
// Assets accepts, so a deploy never silently drops rules.
// Limits: https://developers.cloudflare.com/workers/static-assets/headers/
// and https://developers.cloudflare.com/workers/static-assets/redirects/
import { readFileSync, existsSync } from "node:fs"

const MAX_HEADER_RULES = 100
const MAX_STATIC_REDIRECTS = 2000
const MAX_DYNAMIC_REDIRECTS = 100

const lines = file =>
  existsSync(file) ? readFileSync(file, "utf8").split("\n") : []

// A header rule starts with a URL pattern at column 0; its headers are indented.
const headerRules = lines("public/_headers").filter(line => /^(\/|https?:)/.test(line))

const redirects = lines("public/_redirects")
  .map(line => line.trim())
  .filter(line => line && !line.startsWith("#"))
const isDynamic = line => /[*:]/.test(line.split(/\s+/)[0])
const dynamicRedirects = redirects.filter(isDynamic)
const staticRedirects = redirects.filter(line => !isDynamic(line))

const failures = [
  [headerRules.length, MAX_HEADER_RULES, "_headers rules"],
  [staticRedirects.length, MAX_STATIC_REDIRECTS, "static _redirects rules"],
  [dynamicRedirects.length, MAX_DYNAMIC_REDIRECTS, "dynamic _redirects rules"],
].filter(([count, max, label]) => {
  console.log(`${label}: ${count}/${max}`)
  return count > max
})

if (failures.length > 0) {
  console.error("Cloudflare would not apply every rule. See docs/deployment.md.")
  process.exit(1)
}
