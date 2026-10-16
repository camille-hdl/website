const options = new URLSearchParams(location.search)
const root = document.documentElement
const variant = ["plex", "plex-sans", "plex-all-sans"].includes(options.get("variant"))
  ? options.get("variant") : "actuelle"
const theme = options.get("theme") === "night" ? "night" : "day"
const size = ["matched", "large"].includes(options.get("size"))
  ? options.get("size") : "distance"
root.classList.toggle("type-plex", variant !== "actuelle")
root.dataset.variant = variant
root.dataset.theme = theme
root.dataset.size = size
// Choisir les déclarations avant le premier rendu évite de télécharger
// les polices actuelles pendant le chargement de la feuille Plex.
const link = document.createElement("link")
link.rel = "stylesheet"
link.href = variant === "actuelle" ? "fonts-actuelle.css" : "plex.css"
document.head.append(link)
const variantTitle = { actuelle: "Typographie actuelle", plex: "Plex Serif", "plex-sans": "Plex Sans", "plex-all-sans": "Plex tout Sans" }
document.title = `${variantTitle[variant]} · Rollup`
