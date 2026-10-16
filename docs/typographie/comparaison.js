const fields = Object.fromEntries(["variant", "theme", "size", "viewport"].map(id => [id, document.getElementById(id)]))
const preview = document.getElementById("preview")
const variants = ["actuelle", "plex", "plex-sans", "plex-all-sans"]
const variantNames = { actuelle: "Actuelle", plex: "Plex Serif", "plex-sans": "Plex Sans", "plex-all-sans": "Plex tout Sans" }
function updatePreview() {
  const { variant, theme, size, viewport } = Object.fromEntries(Object.entries(fields).map(([key, el]) => [key, el.value]))
  const url = `article.html?${new URLSearchParams({ variant, theme, size })}`
  if (preview.getAttribute("src") !== url) preview.src = url
  preview.classList.toggle("mobile", viewport === "mobile")
  fields.size.disabled = variant === "actuelle"
  document.getElementById("direct").href = url
  document.getElementById("preview-status").textContent = `${variantNames[variant]} · ${theme === "day" ? "Clair" : "Sombre"} · ${viewport === "mobile" ? "390 px au maximum" : "Largeur disponible"}`
}
Object.values(fields).forEach(el => el.addEventListener("change", updatePreview))
document.querySelector("form").addEventListener("submit", e => e.preventDefault())
updatePreview()
const kib = bytes => `${(bytes / 1024).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Kio`
const baseline = window.typographyMeasurements.cases.find(item => item.variant === "actuelle")
document.getElementById("weight-summary").textContent = variants.slice(1).map(variant => {
  const alternative = window.typographyMeasurements.cases.find(item => item.variant === variant)
  return `${variantNames[variant]} charge ${kib(alternative.fontBytes - baseline.fontBytes)} de plus que la référence, soit environ ${Math.round((alternative.fontBytes / baseline.fontBytes - 1) * 100)} %.`
}).join(" ") + " Les fichiers variables couvrent aussi les graisses intermédiaires utilisées la nuit."
for (const viewport of ["desktop", "mobile"]) {
  for (const theme of ["day", "night"]) {
    const pair = window.typographyMeasurements.cases.filter(item => item.viewport === viewport && item.theme === theme)
    const label = `${viewport === "desktop" ? "Bureau" : "Mobile"} · ${theme === "day" ? "Clair" : "Sombre"}`
    const tr = document.createElement("tr")
    for (const text of [label, ...variants.map(variant => {
      const item = pair.find(item => item.variant === variant)
      return `${kib(item.fontBytes)} · ${item.fonts.length} fichiers`
    })]) {
      const td = document.createElement("td")
      td.textContent = text
      tr.append(td)
    }
    document.getElementById("totals").append(tr)
    document.querySelector(`[data-case="${viewport}-${theme}"]`).textContent = variants.map(variant => {
      const item = pair.find(item => item.variant === variant)
      return `${variantNames[variant]} ${item.styles.body.fontSize}, graisse ${item.styles.body.fontWeight}`
    }).join(" · ")
  }
}
for (const variant of variants) {
  const sample = window.typographyMeasurements.cases.find(item => item.variant === variant)
  const details = document.createElement("details")
  const summary = document.createElement("summary")
  summary.textContent = `${variantNames[variant]} : détail des ${sample.fonts.length} fichiers, ${kib(sample.fontBytes)}`
  details.append(summary)
  const list = document.createElement("ul")
  for (const font of sample.fonts) {
    const li = document.createElement("li")
    li.textContent = `${font.file} : ${kib(font.bytes)} (${font.bytes.toLocaleString("fr-FR")} octets)`
    list.append(li)
  }
  details.append(list)
  document.getElementById("font-details").append(details)
}
