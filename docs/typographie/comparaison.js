const fields = Object.fromEntries(["variant", "theme", "size", "viewport"].map(id => [id, document.getElementById(id)]))
const preview = document.getElementById("preview")
function updatePreview() {
  const { variant, theme, size, viewport } = Object.fromEntries(Object.entries(fields).map(([key, el]) => [key, el.value]))
  const url = `article.html?${new URLSearchParams({ variant, theme, size })}`
  if (preview.getAttribute("src") !== url) preview.src = url
  preview.classList.toggle("mobile", viewport === "mobile")
  fields.size.disabled = variant === "actuelle"
  document.getElementById("direct").href = url
  document.getElementById("preview-status").textContent = `${variant === "plex" ? "IBM Plex" : "Typographie actuelle"} · ${theme === "day" ? "Clair" : "Sombre"} · ${viewport === "mobile" ? "390 px au maximum" : "Largeur disponible"}`
}
Object.values(fields).forEach(el => el.addEventListener("change", updatePreview))
document.querySelector("form").addEventListener("submit", e => e.preventDefault())
updatePreview()
const kib = bytes => `${(bytes / 1024).toLocaleString("fr-FR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Kio`
const baseline = window.typographyMeasurements.cases.find(item => item.variant === "actuelle")
const alternative = window.typographyMeasurements.cases.find(item => item.variant === "plex")
document.getElementById("weight-summary").textContent = `Pour ce texte et cet échantillon, Plex charge ${kib(alternative.fontBytes - baseline.fontBytes)} de plus, soit environ ${Math.round((alternative.fontBytes / baseline.fontBytes - 1) * 100)} %. Les fichiers variables couvrent aussi les graisses intermédiaires utilisées la nuit.`
for (const viewport of ["desktop", "mobile"]) {
  for (const theme of ["day", "night"]) {
    const pair = window.typographyMeasurements.cases.filter(item => item.viewport === viewport && item.theme === theme)
    const current = pair.find(item => item.variant === "actuelle")
    const plex = pair.find(item => item.variant === "plex")
    const label = `${viewport === "desktop" ? "Bureau" : "Mobile"} · ${theme === "day" ? "Clair" : "Sombre"}`
    const tr = document.createElement("tr")
    for (const text of [label, `${kib(current.fontBytes)} · ${current.fonts.length} fichiers`, `${kib(plex.fontBytes)} · ${plex.fonts.length} fichiers`]) {
      const td = document.createElement("td")
      td.textContent = text
      tr.append(td)
    }
    document.getElementById("totals").append(tr)
    document.querySelector(`[data-case="${viewport}-${theme}"]`).textContent = `Actuelle ${current.styles.body.fontSize} · Plex ${plex.styles.body.fontSize}, graisse ${plex.styles.body.fontWeight}`
  }
}
for (const variant of ["actuelle", "plex"]) {
  const sample = window.typographyMeasurements.cases.find(item => item.variant === variant)
  const details = document.createElement("details")
  const summary = document.createElement("summary")
  summary.textContent = `${variant === "plex" ? "IBM Plex" : "Typographie actuelle"} : détail des ${sample.fonts.length} fichiers, ${kib(sample.fontBytes)}`
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
