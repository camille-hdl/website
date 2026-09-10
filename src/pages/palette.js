import React from "react"
import { useStaticQuery, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../palette.module.css"
import { groups, asJson } from "../data/ft-paper"

const PalettePage = ({ location }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }
  `)

  return (
    <Layout location={location} title={data.site.siteMetadata.title}>
      <header>
        <h1>ft-paper</h1>
      </header>

      <div className={styles.groups}>
        {groups.map((group) => (
          <section className={styles.group} key={group.title}>
            <h2 className={styles.groupTitle}>{group.title}</h2>
            <ul className={styles.swatches}>
              {group.swatches.map((swatch) => (
                <li className={styles.swatch} key={swatch.role}>
                  <div
                    className={styles.chip}
                    style={{ backgroundColor: swatch.hex }}
                  />
                  <span className={styles.name}>{swatch.name}</span>
                  <code className={styles.role}>{swatch.role}</code>
                  <code className={styles.value}>{swatch.hex}</code>
                  <code className={styles.value}>
                    rgb({swatch.rgb.join(", ")})
                  </code>
                  <span className={styles.meta}>
                    {swatch.contrast.toFixed(2)}:1 {swatch.contrastLabel}
                    {swatch.ansi !== null && ` · ANSI ${swatch.ansi}`}
                    <br />
                    {swatch.note}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <hr />

      <p className={styles.credit}>
        Inspired by{" "}
        <a href="https://www.ft.com/">the Financial Times</a> and its{" "}
        <a href="https://registry.origami.ft.com/components/o-colors">
          Origami o-colors
        </a>{" "}
        palette.
      </p>

      {/* The same palette as structured data, so an agent deriving a theme for
          another tool reads exact values instead of scraping the markup. */}
      <script
        type="application/json"
        id="ft-paper-palette"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(asJson()) }}
      />
    </Layout>
  )
}

export default PalettePage

export const Head = () => (
  <Seo
    title="ft-paper palette"
    description="The ft-paper color palette: surfaces, ink and accents, with hex, rgb and contrast values."
  />
)
