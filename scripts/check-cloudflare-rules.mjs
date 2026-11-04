// Fails when public/_headers or public/_redirects is missing or breaks a rule of
// Workers Static Assets, so a deploy never silently drops headers or redirects.
// Limits: https://developers.cloudflare.com/workers/static-assets/headers/
// and https://developers.cloudflare.com/workers/static-assets/redirects/
import { readFileSync, existsSync } from "node:fs"

const HEADERS = "public/_headers"
const REDIRECTS = "public/_redirects"
const MAX_HEADER_RULES = 100
const MAX_HEADER_LINE = 2000
const MAX_STATIC_REDIRECTS = 2000
const MAX_DYNAMIC_REDIRECTS = 100
const MAX_REDIRECT_LINE = 1000

const errors = []

const lines = file => {
  if (!existsSync(file)) {
    errors.push(`${file} is missing: gatsby-plugin-netlify should write it.`)
    return []
  }
  return readFileSync(file, "utf8").split(/\r?\n/)
}

const headerLines = lines(HEADERS)
// A header rule starts with a URL pattern at column 0; its headers are indented.
const headerRules = headerLines.filter(line => /^(\/|https?:)/.test(line))
headerLines.forEach((line, index) => {
  if (line.length > MAX_HEADER_LINE) {
    errors.push(`${HEADERS}:${index + 1} has ${line.length} characters (max ${MAX_HEADER_LINE}).`)
  }
})

const redirects = lines(REDIRECTS)
  .map((line, index) => ({ line: line.trim(), number: index + 1 }))
  .filter(({ line }) => line && !line.startsWith("#"))
// A source with a splat (*) or a placeholder (/:name) is dynamic.
const isDynamic = ({ line }) => /\*|\/:[A-Za-z_]/.test(line.split(/\s+/)[0])
const dynamicRedirects = redirects.filter(isDynamic)
const staticRedirects = redirects.filter(redirect => !isDynamic(redirect))
for (const { line, number } of redirects) {
  if (line.length > MAX_REDIRECT_LINE) {
    errors.push(`${REDIRECTS}:${number} has ${line.length} characters (max ${MAX_REDIRECT_LINE}).`)
  }
}
const firstDynamic = redirects.findIndex(isDynamic)
if (firstDynamic !== -1) {
  for (const { number } of redirects.slice(firstDynamic).filter(r => !isDynamic(r))) {
    errors.push(`${REDIRECTS}:${number} is a static redirect after a dynamic one; Cloudflare expects static redirects first.`)
  }
}

for (const [count, max, label] of [
  [headerRules.length, MAX_HEADER_RULES, "_headers rules"],
  [staticRedirects.length, MAX_STATIC_REDIRECTS, "static _redirects rules"],
  [dynamicRedirects.length, MAX_DYNAMIC_REDIRECTS, "dynamic _redirects rules"],
]) {
  console.log(`${label}: ${count}/${max}`)
  if (count > max) errors.push(`${count} ${label}, above the limit of ${max}.`)
}

if (errors.length > 0) {
  for (const error of errors) console.error(error)
  console.error("Cloudflare would not apply every rule. See docs/deployment.md.")
  process.exit(1)
}
