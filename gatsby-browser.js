// Custom typefaces, vendored in src/fonts. The `typeface-*` packages that used
// to provide them were abandoned in 2019; the font files and @font-face rules
// there are the ones those packages shipped, so the site renders identically.
import "./src/fonts/merriweather.css"
import "./src/fonts/montserrat.css"
import "./src/fonts/fira-code.css"
import "prismjs/themes/prism.css"
import "prismjs/plugins/line-numbers/prism-line-numbers.css"

// count.js records the first pageview on load. Gatsby client navigations do
// not reload the document, so record those here and skip the initial route to
// avoid double-counting. https://www.goatcounter.com/help/spa
let isInitialRoute = true

/**
 * @type {import('gatsby').GatsbyBrowser['onRouteUpdate']}
 */
export const onRouteUpdate = ({ location }) => {
  if (isInitialRoute) {
    isInitialRoute = false
    return
  }
  window.goatcounter?.count?.({
    path: location.pathname + location.search + location.hash,
  })
}
