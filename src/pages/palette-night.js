import React from "react"
import { Link, useStaticQuery, graphql } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import PaletteGroups from "../components/palette-groups"
import * as styles from "../palette.module.css"
import { groups, roles, terminal, hexOf, asJson } from "../data/ft-paper-night"

// One text role over one background role, shown as it renders.
const Pair = ({ use, text, background, contrast, note }) => (
  <li className={styles.pair}>
    <span
      className={styles.sample}
      style={{ color: hexOf[text], backgroundColor: hexOf[background] }}
    >
      Aa
    </span>
    <span className={styles.pairUse}>
      {use}
      {note && <span className={styles.pairNote}>{note}</span>}
    </span>
    <code className={styles.pairRoles}>
      {text} on {background}
    </code>
    <span className={styles.pairContrast}>{contrast.toFixed(2)}:1</span>
  </li>
)

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

        {roles.map(({ title, pairs }) => (
          <section className={styles.group} key={title}>
            <h2 className={styles.groupTitle}>Roles — {title}</h2>
            <ul className={styles.pairs}>
              {pairs.map((pair) => (
                <Pair key={pair.use} {...pair} />
              ))}
            </ul>
          </section>
        ))}

        <section className={styles.group}>
          <h2 className={styles.groupTitle}>Terminal</h2>
          <ul className={styles.pairs}>
            {terminal.pairs.map((pair) => (
              <Pair key={pair.use} {...pair} />
            ))}
          </ul>
          <ul className={`${styles.swatches} ${styles.ansi}`}>
            {terminal.ansi.map(({ name, role, hex, contrast }, index) => (
              <li className={styles.swatch} key={index}>
                <div className={styles.chip} style={{ backgroundColor: hex }} />
                <span className={styles.name}>
                  {index} · {name}
                </span>
                <code className={styles.role}>{role}</code>
                <code className={styles.value}>{hex}</code>
                <span className={styles.meta}>
                  {contrast.toFixed(2)}:1 on paper
                </span>
              </li>
            ))}
          </ul>
        </section>

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
