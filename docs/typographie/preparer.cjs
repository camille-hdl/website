// Exécuter après npm run build. L'article et les styles viennent du HTML Gatsby.
const fs = require("node:fs")
const path = require("node:path")
const crypto = require("node:crypto")
const cheerio = require("cheerio")
const { execFileSync } = require("node:child_process")
const repo = path.resolve(__dirname, "../..")
const slug = "ship-modern-javascript-rollup"
const source = `public/${slug}/index.html`
const $ = cheerio.load(fs.readFileSync(path.join(repo, source), "utf8"))
const article = $("section[itemprop=articleBody]")
if (article.text().length < 8000) throw Error("L'article long est absent du build.")
const typography = $('style[id="typography.js"]').text()
if (!typography) throw Error("Les styles Typography.js sont absents du build.")
fs.writeFileSync(path.join(__dirname, "typography.css"), typography + "\n")
// Conserver l'ordre exact des règles du bundle. Retirer local() permet de
// mesurer les mêmes fichiers même si une police est installée sur le poste.
let bundle = $("style").filter((i, el) => $(el).text().includes("@font-face")).text()
bundle = bundle.replace(/local\([^)]*\),?/g, "")
bundle = bundle.replace(/url\(\/?static\/([^)]*)\)/g, (match, file) => {
  const name = file.replace(/-[a-f0-9]{32}(?=\.woff2?$)/, "")
  const dest = path.join(repo, "src/fonts/files", name)
  if (!fs.existsSync(dest)) throw Error(`Police introuvable : ${file}`)
  return `url("../../src/fonts/files/${name}")`
})
const faces = bundle.match(/@font-face\{[^}]*\}/g)
if (!faces?.length) throw Error("Les déclarations de polices sont absentes du build.")
fs.writeFileSync(path.join(__dirname, "fonts-actuelle.css"), faces.join("\n") + "\n")
bundle = bundle.replace(/@font-face\{[^}]*\}/g, "")
fs.writeFileSync(path.join(__dirname, "actuelle.css"), bundle + "\n")
const header = $(".site-container > header").toString()
const title = $("main > header").toString()
const specimen = `<section class="specimen" lang="fr" aria-labelledby="specimen-title">
  <hr><h2 id="specimen-title">Échantillon complémentaire</h2>
  <p>Hors article. Accents, italiques et graisses pour compléter le texte anglais.</p>
  <p>À Noël, Éléonore vérifie les requêtes : <em>une lecture précise</em>,
    <strong>une réponse fiable</strong> et <strong><em>un résultat vérifié</em></strong>.</p>
  <p><code class="language-text">I l 1 | O 0 · != !== =&gt; &lt;= · café / élève</code></p>
</section>`
const html = `<!doctype html>
<html lang="en" data-theme="day"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex,nofollow"><title>Comparaison typographique · Rollup</title>
<link rel="stylesheet" href="typography.css"><link rel="stylesheet" href="actuelle.css">
<script src="article.js"></script></head><body>
<div class="site-container" style="margin-left:auto;margin-right:auto;max-width:38rem;padding:2.43rem 1.215rem">
${header}<main>${title}${article.toString()}${specimen}</main></div>
</body></html>\n`
fs.writeFileSync(path.join(__dirname, "article.html"), html)
fs.writeFileSync(path.join(__dirname, "source.json"), JSON.stringify({
  commit: execFileSync("git", ["rev-parse", "HEAD"], { cwd: repo, encoding: "utf8" }).trim(),
  article: `content/blog/${slug}/index.md`,
  build: source,
  articleHTMLSha256: crypto.createHash("sha256").update(article.toString()).digest("hex"),
  articleCharacters: article.text().length,
}, null, 2) + "\n")
console.log("Article et styles de référence extraits du build Gatsby.")
