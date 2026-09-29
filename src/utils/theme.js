/**
 * The reader's palette choice. "auto" follows the system setting and is the
 * default; "day" and "night" force one palette. A forced choice is kept in
 * localStorage and set as data-theme on <html>, which is what layout.css keys
 * the palettes on; "auto" is the absence of both.
 */
export const STORAGE_KEY = "theme"
export const CHOICES = ["auto", "day", "night"]

const isForced = (value) => value === "day" || value === "night"

/**
 * Runs inline in <head>, before the page is painted, so a forced palette never
 * flashes the other one first. Storage can throw (disabled, private mode): the
 * page then follows the system, as without JavaScript.
 */
export const earlyScript = `try{var t=localStorage.getItem(${JSON.stringify(
  STORAGE_KEY
)});if(t==="day"||t==="night")document.documentElement.setAttribute("data-theme",t)}catch(e){}`

export const currentChoice = () => {
  const value = document.documentElement.getAttribute("data-theme")
  return isForced(value) ? value : "auto"
}

let fade

export const applyChoice = (choice) => {
  const root = document.documentElement
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    root.classList.add("theme-transition")
    clearTimeout(fade)
    fade = setTimeout(() => root.classList.remove("theme-transition"), 400)
  }
  if (isForced(choice)) root.setAttribute("data-theme", choice)
  else root.removeAttribute("data-theme")
  try {
    if (isForced(choice)) localStorage.setItem(STORAGE_KEY, choice)
    else localStorage.removeItem(STORAGE_KEY)
  } catch (e) {
    // The choice still holds for this page; it just will not be remembered.
  }
}

/**
 * Notifies when the choice changes: from this page (the attribute) or from
 * another tab (the storage event, which the other tab's write fires here).
 */
export const subscribe = (onChange) => {
  const root = document.documentElement
  const observer = new MutationObserver(onChange)
  observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] })
  const onStorage = (event) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return
    if (isForced(event.newValue))
      root.setAttribute("data-theme", event.newValue)
    else root.removeAttribute("data-theme")
  }
  window.addEventListener("storage", onStorage)
  return () => {
    observer.disconnect()
    window.removeEventListener("storage", onStorage)
  }
}
