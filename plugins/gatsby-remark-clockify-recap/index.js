const markup = require("./markup.json")

module.exports = ({ markdownAST }) => {
  function insert(node) {
    if (
      node.type === "html" &&
      node.value.trim() === "<!-- clockify-recap -->"
    ) {
      node.value = markup
    }
    for (const child of node.children || []) insert(child)
  }
  insert(markdownAST)
}
