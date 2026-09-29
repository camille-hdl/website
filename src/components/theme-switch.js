import React, { useSyncExternalStore } from "react"

import * as styles from "./theme-switch.module.css"
import { CHOICES, applyChoice, currentChoice, subscribe } from "../utils/theme"

const labels = { auto: "Auto", day: "Day", night: "Night" }
const titles = {
  auto: "Follow the system setting",
  day: "Always ft-paper",
  night: "Always ft-paper-night",
}

// The server renders "auto": it cannot know the reader's choice. Hydration
// then re-renders with the choice the head script already applied.
const serverChoice = () => "auto"

const ThemeSwitch = () => {
  const choice = useSyncExternalStore(subscribe, currentChoice, serverChoice)

  return (
    <fieldset className={styles.themeSwitch}>
      <legend className={styles.legend}>Theme</legend>
      {CHOICES.map((value) => (
        <label className={styles.option} key={value} title={titles[value]}>
          <input
            className={styles.input}
            type="radio"
            name="theme"
            value={value}
            checked={choice === value}
            onChange={() => applyChoice(value)}
          />
          <span className={styles.label}>{labels[value]}</span>
        </label>
      ))}
    </fieldset>
  )
}

export default ThemeSwitch
