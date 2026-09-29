import React from "react"
import typography from "./src/utils/typography"
import { goatcounterEndpoint } from "./src/utils/goatcounter-endpoint"
import { earlyScript } from "./src/utils/theme"

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
export const onRenderBody = ({
  setHtmlAttributes,
  setHeadComponents,
  setPostBodyComponents,
}) => {
  setHtmlAttributes({ lang: `en` })
  setHeadComponents([
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
