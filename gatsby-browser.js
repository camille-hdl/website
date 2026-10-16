// Official IBM WOFF2 files, unchanged, with provenance and OFL in src/fonts.
import "./src/fonts/plex.css"
import "prismjs/themes/prism.css"
import "prismjs/plugins/line-numbers/prism-line-numbers.css"
import { syncThemeColor, watchTheme } from "./src/utils/theme"

/**
 * @type {import('gatsby').GatsbyBrowser['onClientEntry']}
 */
export const onClientEntry = () => {
  watchTheme()
}

// count.js records the first pageview on load. Gatsby client navigations do
// not reload the document, so record those here and skip the initial route to
// avoid double-counting. https://www.goatcounter.com/help/spa
let isInitialRoute = true

/**
 * @type {import('gatsby').GatsbyBrowser['onRouteUpdate']}
 */
export const onRouteUpdate = ({ location }) => {
  // A palette page brings its own palette, and leaving one gives the choice
  // back: the browser's color follows.
  syncThemeColor()
  if (isInitialRoute) {
    isInitialRoute = false
    return
  }
  window.goatcounter?.count?.({
    path: location.pathname + location.search + location.hash,
  })
}
