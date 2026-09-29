import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import PaletteGroups from "../components/palette-groups"
import PaletteRoles from "../components/palette-roles"
import * as styles from "../palette.module.css"
import { groups, roles, terminal, hexOf, tools, asJson } from "../data/ft-paper"

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
      {/* Sets the whole page in the palette it describes (see layout.css). */}
      <div className="ft-paper">
        <header>
          <h1>ft-paper</h1>
        </header>

        <PaletteGroups groups={groups} />

        <PaletteRoles
          roles={roles}
          terminal={terminal}
          hexOf={hexOf}
          tools={tools}
        />

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
          After dark: <Link to="/palette-night/">ft-paper-night</Link>, the same
          hues on a sepia night.
        </p>

        {/* The same palette as structured data, so an agent deriving a theme for
          another tool reads exact values instead of scraping the markup. */}
        <script
          type="application/json"
          id="ft-paper-palette"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(asJson()) }}
        />
      </div>
    </Layout>
  )
}

export default PalettePage

export const Head = () => (
  <Seo
    title="ft-paper palette"
    description="The ft-paper color palette: surfaces, ink, accents, semantic roles and terminal colors, with hex, rgb and contrast values, and where each is used."
  >
    <meta name="color-scheme" content="light" />
  </Seo>
)
