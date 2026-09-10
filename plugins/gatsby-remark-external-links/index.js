/**
 * Local replacement for `gatsby-remark-external-links`, which was last
 * published in 2019 and pulled in `babel-runtime` and two abandoned unist
 * helpers. It reproduces that plugin's behavior exactly, without dependencies.
 *
 * A URL counts as external when it starts with a scheme, matching the
 * `is-absolute-url@2` regular expression the original resolved. That regexp is
 * lowercase-only and deliberately ignores protocol-relative `//host` URLs, so
 * those stay untouched here too.
 */

const absoluteUrl = /^[a-z][a-z0-9+.-]*:/

const defaultTarget = `_blank`
const defaultRel = `nofollow noopener noreferrer`

function visit(node, type, visitor) {
  if (node && node.type === type) visitor(node)
  for (const child of (node && node.children) || []) visit(child, type, visitor)
}

function findDefinition(node, identifier) {
  if (node && node.type === `definition` && node.identifier === identifier) {
    return node
  }
  for (const child of (node && node.children) || []) {
    const found = findDefinition(child, identifier)
    if (found) return found
  }
  return undefined
}

module.exports = ({ markdownAST }, options = {}) => {
  const decorate = (link, url) => {
    if (absoluteUrl.test(url)) {
      link.data = { hProperties: {} }
      if (options.target !== null) {
        link.data.hProperties.target = options.target || defaultTarget
      }
      if (options.rel !== null) {
        link.data.hProperties.rel = options.rel || defaultRel
      }
    }
  }

  visit(markdownAST, `linkReference`, link => {
    const definition = findDefinition(markdownAST, link.identifier)
    if (definition && definition.url) decorate(link, definition.url)
  })

  visit(markdownAST, `link`, link => {
    decorate(link, link.url)
  })
}
