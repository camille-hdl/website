import React from "react"
import typography from "./src/utils/typography"

/**
 * @type {import('gatsby').GatsbySSR['onRenderBody']}
 */
export const onRenderBody = ({ setHtmlAttributes, setHeadComponents }) => {
  setHtmlAttributes({ lang: `en` })
  setHeadComponents([
    <style
      key="TypographyStyle"
      id="typography.js"
      dangerouslySetInnerHTML={{ __html: typography.toString() }}
    />,
  ])
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
