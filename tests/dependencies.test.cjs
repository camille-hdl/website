const test = require("node:test")
const assert = require("node:assert/strict")
const fs = require("node:fs/promises")
const os = require("node:os")
const path = require("node:path")
const http = require("node:http")
const { once } = require("node:events")

async function cacheFor(t) {
  const directory = await fs.realpath(
    await fs.mkdtemp(path.join(os.tmpdir(), "blog-dependency-test-"))
  )
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const entries = new Map()
  return {
    directory,
    get: async (key) => entries.get(key),
    set: async (key, value) => entries.set(key, value),
  }
}

test("Gatsby detects the extension of an image buffer", async (t) => {
  const { createFileNodeFromBuffer } = require("gatsby-source-filesystem")
  const cache = await cacheFor(t)
  const buffer = await fs.readFile("content/assets/apple-touch-icon.png")
  let created
  const node = await createFileNodeFromBuffer({
    buffer,
    cache,
    createNodeId: (value) => value,
    createNode: (value) => {
      created = value
    },
  })
  assert.equal(node.extension, "png")
  assert.equal(created.internal.mediaType, "image/png")
  assert.deepEqual(await fs.readFile(node.absolutePath), buffer)
})

test("Gatsby detects a downloaded image without a filename extension", async (t) => {
  const { fetchRemoteFile } = require("gatsby-core-utils")
  const cache = await cacheFor(t)
  const buffer = await fs.readFile("content/assets/apple-touch-icon.png")
  const server = http.createServer((request, response) => response.end(buffer))
  server.listen(0, "127.0.0.1")
  await once(server, "listening")
  t.after(() => new Promise((resolve) => server.close(resolve)))
  const filename = await fetchRemoteFile({
    url: `http://127.0.0.1:${server.address().port}/image`,
    cache,
    directory: cache.directory,
  })
  assert.equal(path.extname(filename), ".png")
  assert.deepEqual(await fs.readFile(filename), buffer)
})

test("Gatsby image query parameters retain their decoding behavior", () => {
  const queryString = require("query-string")
  const result = queryString.parse(
    "caption=caf%C3%A9+photo&width=640&height=480"
  )
  assert.deepEqual(
    { ...result },
    { caption: "café photo", width: "640", height: "480" }
  )
})

test(
  "Gatsby compiles a TypeScript configuration with its Parcel plugin suite",
  { timeout: 30000 },
  async (t) => {
    const cache = await cacheFor(t)
    await fs.writeFile(
      path.join(cache.directory, "package.json"),
      JSON.stringify({ name: "gatsby-compatibility-fixture", private: true })
    )
    await fs.writeFile(
      path.join(cache.directory, "gatsby-config.ts"),
      'export default { siteMetadata: { title: "Compatibility fixture" } }'
    )
    const {
      runParcel,
    } = require("gatsby/dist/utils/parcel/compile-gatsby-files")
    const originalDirectory = process.cwd()
    const originalWorkers = process.env.PARCEL_WORKERS
    process.env.PARCEL_WORKERS = "0"
    process.chdir(cache.directory)
    let bundles
    try {
      bundles = await runParcel(cache.directory)
    } finally {
      process.chdir(originalDirectory)
      if (originalWorkers === undefined) delete process.env.PARCEL_WORKERS
      else process.env.PARCEL_WORKERS = originalWorkers
    }
    const config = bundles.find((bundle) =>
      bundle.mainEntryPath.endsWith("gatsby-config.ts")
    )
    assert(config, "Expected a compiled Gatsby configuration")
    const compiled = require(config.filePath)
    assert.equal(
      (compiled.default || compiled).siteMetadata.title,
      "Compatibility fixture"
    )
  }
)

test("External links keep their target and rel attributes", () => {
  const externalLinks = require("../plugins/gatsby-remark-external-links")
  const link = (url) => ({ type: "link", url, children: [] })
  const markdownAST = {
    type: "root",
    children: [
      link("https://example.com/post"),
      link("mailto:hello@example.com"),
      link("/internal"),
      link("#anchor"),
      { type: "definition", identifier: "ref", url: "https://example.com" },
      { type: "linkReference", identifier: "ref", children: [] },
    ],
  }
  externalLinks(
    { markdownAST },
    { target: `_blank`, rel: [`noopener`, `noreferrer`] }
  )
  const properties = markdownAST.children.map(
    (node) => node.data && node.data.hProperties
  )
  const external = { target: `_blank`, rel: [`noopener`, `noreferrer`] }
  assert.deepEqual(properties[0], external, "absolute URL")
  assert.deepEqual(properties[1], external, "mailto URL")
  assert.equal(properties[2], undefined, "root-relative URL stays untouched")
  assert.equal(properties[3], undefined, "anchor stays untouched")
  assert.deepEqual(properties[5], external, "link reference follows definition")
})
