import React from "react"

import * as styles from "../palette.module.css"

// One text role over one background role, shown as it renders, with the tools
// that set it that way when the palette records them.
const Pair = ({
  use,
  text,
  background,
  contrast,
  note,
  exempt,
  tools,
  hexOf,
  toolNames,
}) => (
  <li className={styles.pair}>
    {/* A specimen, not content: some pairs are shown because they fail. */}
    <span
      aria-hidden="true"
      className={styles.sample}
      style={{ color: hexOf[text], backgroundColor: hexOf[background] }}
    >
      Aa
    </span>
    <span className={styles.pairUse}>
      {use}
      {(note || exempt) && (
        <span className={styles.pairNote}>
          {[note, exempt].filter(Boolean).join(". ")}
        </span>
      )}
      {tools && (
        <span className={styles.pairTools}>
          {tools.map((tool) => toolNames[tool]).join(" · ")}
        </span>
      )}
    </span>
    <code className={styles.pairRoles}>
      {text} on {background}
    </code>
    <span className={styles.pairContrast}>{contrast.toFixed(2)}:1</span>
  </li>
)

const Pairs = ({ pairs, hexOf, toolNames }) => (
  <ul className={styles.pairs}>
    {pairs.map((pair) => (
      <Pair
        key={`${pair.use} ${pair.text}`}
        {...pair}
        hexOf={hexOf}
        toolNames={toolNames}
      />
    ))}
  </ul>
)

// The semantic roles and the terminal palette, shared by /palette and
// /palette-night.
export const PaletteRoles = ({ roles, terminal, hexOf, tools: toolNames }) => (
  <>
    {roles.map(({ title, pairs }) => (
      <section className={styles.group} key={title}>
        <h2 className={styles.groupTitle}>Roles — {title}</h2>
        <Pairs pairs={pairs} hexOf={hexOf} toolNames={toolNames} />
      </section>
    ))}

    <section className={styles.group}>
      <h2 className={styles.groupTitle}>Terminal</h2>
      <Pairs pairs={terminal.pairs} hexOf={hexOf} toolNames={toolNames} />
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
  </>
)

export default PaletteRoles
