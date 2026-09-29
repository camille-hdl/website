import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import PaletteGroups from "../components/palette-groups"
import PaletteRoles from "../components/palette-roles"
import * as styles from "../palette.module.css"
import { groups, roles, terminal, hexOf, asJson } from "../data/ft-paper-night"

const PaletteNightPage = ({ location }) => {
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
      {/* Sets the whole page in the palette it describes (see layout.css). */}
      <div className="ft-paper-night">
        <header>
          <h1>ft-paper-night</h1>
        </header>

        <PaletteGroups groups={groups} />

        <PaletteRoles roles={roles} terminal={terminal} hexOf={hexOf} />

        <hr />

        <p className={styles.credit}>
          Inspired by <a href="https://www.ft.com/">the Financial Times</a> and
          its{" "}
          <a href="https://registry.origami.ft.com/components/o-colors">
            Origami o-colors
          </a>{" "}
          palette.
        </p>

        <p className={styles.crossLink}>
          By day: <Link to="/palette/">ft-paper</Link>, the palette every night
          tone is mixed from.
        </p>

        {/* The same palette as structured data, so an agent deriving a theme for
          another tool reads exact values instead of scraping the markup. */}
        <script
          type="application/json"
          id="ft-paper-night-palette"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(asJson()) }}
        />
      </div>
    </Layout>
  )
}

export default PaletteNightPage

export const Head = () => (
  <Seo
    title="ft-paper-night palette"
    description="The ft-paper-night color palette: ft-paper after dark. Surfaces, ink, accents, semantic roles and terminal colors, with hex, rgb and contrast values."
  >
    <meta name="color-scheme" content="dark" />
  </Seo>
)
