const options = new URLSearchParams(location.search)
const root = document.documentElement
const variant = options.get("variant") === "plex" ? "plex" : "actuelle"
const theme = options.get("theme") === "night" ? "night" : "day"
const size = ["matched", "large"].includes(options.get("size"))
  ? options.get("size") : "distance"
root.classList.toggle("type-plex", variant === "plex")
root.dataset.theme = theme
root.dataset.size = size
// Choisir les déclarations avant le premier rendu évite de télécharger
// les polices actuelles pendant le chargement de la feuille Plex.
const link = document.createElement("link")
link.rel = "stylesheet"
link.href = variant === "plex" ? "plex.css" : "fonts-actuelle.css"
document.head.append(link)
document.title = `${variant === "plex" ? "IBM Plex" : "Typographie actuelle"} · Rollup`
