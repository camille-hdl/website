import React from "react"

import * as styles from "../palette.module.css"

// The swatch grid shared by /palette and /palette-night.
const PaletteGroups = ({ groups }) => (
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
              <code className={styles.value}>rgb({swatch.rgb.join(", ")})</code>
              <span className={styles.meta}>
                {swatch.contrast.toFixed(2)}:1 {swatch.contrastLabel}
                {swatch.ansi !== null && ` · ANSI ${swatch.ansi}`}
                {swatch.worst && swatch.worst.surface !== "paper" && (
                  <>
                    <br />
                    {swatch.worst.contrast.toFixed(2)}:1 at worst, on{" "}
                    {swatch.worst.surface}
                  </>
                )}
                <br />
                {swatch.note}
                {swatch.formula && (
                  <span className={styles.formula}>{swatch.formula}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
)

export default PaletteGroups
