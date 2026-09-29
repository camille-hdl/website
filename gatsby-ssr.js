import React from "react"
import typography from "./src/utils/typography"
import { goatcounterEndpoint } from "./src/utils/goatcounter-endpoint"
import {
  earlyScript,
  PAGE_PALETTES,
  PAPER,
  THEME_COLORS,
} from "./src/utils/theme"

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
export const onRenderBody = ({
  pathname,
  setHtmlAttributes,
  setHeadComponents,
  setPostBodyComponents,
}) => {
  setHtmlAttributes({ lang: `en` })
  // One theme-color per system scheme. A palette page sets both to its own
  // paper, and the head script leaves them alone.
  const pagePalette = PAGE_PALETTES[pathname]
  setHeadComponents([
    ...THEME_COLORS.map(({ scheme, media }) => (
      <meta
        key={`theme-color-${scheme}`}
        name="theme-color"
        media={media}
        content={PAPER[pagePalette ?? scheme]}
        data-scheme={scheme}
        data-page-palette={pagePalette}
      />
    )),
    // Applies a forced palette before the first paint (see src/utils/theme.js).
    <script key="theme" dangerouslySetInnerHTML={{ __html: earlyScript }} />,
    <style
      key="TypographyStyle"
      id="typography.js"
      dangerouslySetInnerHTML={{ __html: typography.toString() }}
    />,
  ])
  if (goatcounterEndpoint) {
    setPostBodyComponents([
      <script
        key="goatcounter"
        data-goatcounter={goatcounterEndpoint}
        async
        src="//gc.zgo.at/count.js"
      />,
    ])
  }
}

// Keep the typography reset before all page styles, as the former plugin did.
export const onPreRenderHTML = ({
  getHeadComponents,
  replaceHeadComponents,
}) => {
  const components = getHeadComponents()
  replaceHeadComponents([
    ...components.filter((component) => component?.key === "TypographyStyle"),
    ...components.filter((component) => component?.key !== "TypographyStyle"),
  ])
}
