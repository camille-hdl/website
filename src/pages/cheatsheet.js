import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as styles from "../cheatsheet.module.css"

const Keys = ({ keys, sequential = false }) => (
  <span className={styles.keys}>
    {keys.map((key, index) => (
      <React.Fragment key={index}>
        {index > 0 &&
          (sequential ? <span className={styles.then}> puis </span> : " ")}
        <kbd>{key}</kbd>
      </React.Fragment>
    ))}
  </span>
)

const Shortcuts = ({ entries }) => (
  <dl className={styles.shortcuts}>
    {entries.map(([description, keys]) => (
      <div className={styles.row} key={description}>
        <dt>{description}</dt>
        <dd>
          <Keys keys={keys} />
        </dd>
      </div>
    ))}
  </dl>
)

const essentialShortcuts = [
  ["Trouver un fichier dans le projet", ["Espace", "Espace"]],
  ["Chercher du texte dans le projet", ["Espace", "/"]],
  ["Arborescence du projet", ["Espace", "e"]],
  ["Rechercher et remplacer dans le projet", ["Espace", "s", "r"]],
  ["Tampons ouverts", ["Espace", "f", "b"]],
  ["Fermer le tampon courant", ["Espace", "b", "d"]],
  ["Enregistrer", ["Ctrl + s"]],
  ["Tout quitter", ["Espace", "q", "q"]],
  ["Raccourcis actifs dans ce tampon", ["Espace", "?"]],
]

const navigationShortcuts = [
  ["Bloc git suivant · précédent", [")", "h"]],
  ["Diagnostic suivant · précédent", [")", "d"]],
  ["Tampon suivant · précédent", [")", "b"]],
]

const lspShortcuts = [
  ["Définition", ["g", "d"]],
  ["Références", ["g", "r"]],
  ["Documentation du symbole", ["K"]],
  ["Renommer le symbole", ["Espace", "c", "r"]],
  ["Actions de code", ["Espace", "c", "a"]],
  ["Diagnostic de la ligne", ["Espace", "c", "d"]],
]

const CheatsheetPage = ({ data, location }) => (
  <Layout location={location} title={data.site.siteMetadata.title}>
    <article className={styles.sheet}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>macOS</p>
        <h1>Cheat sheet</h1>
        <nav className={styles.contents} aria-label="Sections">
          <a href="#herdr">Herdr / tmux</a>
          <a href="#neovim">Neovim</a>
          <a href="#fish">Alias fish</a>
          <a href="#fzf">fzf</a>
        </nav>
        <p className={styles.crossref}>
          Sur la machine Omarchy :{" "}
          <Link to="/cheatsheet-omarchy/">cheat sheet Omarchy</Link>.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="herdr">
        <h2 id="herdr">Herdr / tmux</h2>
        <p className={styles.note}>
          Préfixe commun : <Keys keys={["Ctrl + b"]} />.
        </p>
        <table className={styles.splits}>
          <thead>
            <tr>
              <th scope="col">Division</th>
              <th scope="col">Herdr</th>
              <th scope="col">tmux</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">
                Côte à côte
                <span className={styles.detail}>Séparation verticale</span>
              </th>
              <td>
                <Keys keys={["Ctrl + b", "v"]} sequential />
              </td>
              <td>
                <Keys keys={["Ctrl + b", "%"]} sequential />
              </td>
            </tr>
            <tr>
              <th scope="row">
                Empilés
                <span className={styles.detail}>Séparation horizontale</span>
              </th>
              <td>
                <Keys keys={["Ctrl + b", "-"]} sequential />
              </td>
              <td>
                <Keys keys={["Ctrl + b", '"']} sequential />
              </td>
            </tr>
          </tbody>
        </table>
        <p className={styles.note}>
          Herdr nomme la division côte à côte « verticale » ; tmux la nomme «
          horizontale ».
        </p>
      </section>

      <section className={styles.section} aria-labelledby="neovim">
        <h2 id="neovim">Neovim</h2>
        <p className={styles.note}>
          Installation LazyVim par défaut, leader <kbd>Espace</kbd>. Appuyer sur{" "}
          <kbd>Espace</kbd> seul ouvre un menu qui liste la suite&nbsp;: rien
          n’est à mémoriser, cette liste ne sert qu’au démarrage.
        </p>

        <h3>L’essentiel</h3>
        <p className={styles.note}>Mode normal · touches successives.</p>
        <Shortcuts entries={essentialShortcuts} />

        <h3>Aller au suivant, au précédent</h3>
        <p className={styles.note}>
          Vim utilise la paire <kbd>[</kbd> et <kbd>]</kbd> pour
          «&nbsp;précédent&nbsp;» et «&nbsp;suivant&nbsp;». En AZERTY elles
          demandent deux modificateurs, elles sont donc doublées par{" "}
          <kbd>(</kbd> et <kbd>)</kbd>, mêmes touches sans Option.{" "}
          <Keys keys={[")", "h"]} /> avance, <Keys keys={["(", "h"]} /> recule.
        </p>
        <Shortcuts entries={navigationShortcuts} />

        <h3>Recherche</h3>
        <p className={styles.note}>Mode normal.</p>
        <Shortcuts
          entries={[["Effacer le surlignage de recherche", ["Échap"]]]}
        />

        <h3>LSP</h3>
        <p className={styles.note}>
          Mode normal · lorsqu’un serveur de langage est attaché.
        </p>
        <Shortcuts entries={lspShortcuts} />

        <h3>Terminal intégré</h3>
        <dl className={styles.shortcuts}>
          <div className={styles.row}>
            <dt>Quitter le mode terminal</dt>
            <dd>
              <Keys keys={["Ctrl + \\", "Ctrl + n"]} sequential />
            </dd>
          </div>
        </dl>
      </section>

      <section className={styles.section} aria-labelledby="fish">
        <h2 id="fish">Alias fish</h2>
        <div className={styles.alias}>
          <h3>
            <code>sshnk</code>
          </h3>
          <pre>
            <code>{`ssh -o PreferredAuthentications=password \\
    -o PubkeyAuthentication=no \\
    -o IdentitiesOnly=yes \\
    -o IdentityAgent=none \\
    $argv`}</code>
          </pre>
          <p className={styles.note}>SSH par mot de passe uniquement.</p>
        </div>
        <div className={styles.alias}>
          <h3>
            <code>lt2</code>
          </h3>
          <pre>
            <code>eza --icons -TL 2 $argv</code>
          </pre>
          <p className={styles.note}>
            Arborescence sur deux niveaux, avec icônes.
          </p>
        </div>
        <p className={styles.note}>
          <code>$argv</code> transmet tous les arguments de l’alias.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="fzf">
        <h2 id="fzf">fzf</h2>
        <div className={styles.alias}>
          <h3>Activer pour cette session</h3>
          <pre>
            <code>fzf --fish | source</code>
          </pre>
        </div>
        <h3>Historique</h3>
        <Shortcuts entries={[["Rechercher une commande", ["Ctrl + r"]]]} />
        <p className={styles.note}>
          La sélection remplace la ligne de commande.
        </p>
        <div className={styles.alias}>
          <h3>Ouvrir un fichier dans Neovim</h3>
          <pre>
            <code>{"fzf --bind 'enter:become(nvim -- {})'"}</code>
          </pre>
          <p className={styles.note}>
            Rechercher un fichier, puis <kbd>Entrée</kbd> pour l’ouvrir.
          </p>
        </div>
        <p className={styles.note}>
          <Keys keys={["Ctrl + t"]} /> insère un chemin dans la ligne de
          commande ; il n’ouvre pas le fichier.
        </p>
      </section>
    </article>
  </Layout>
)

export default CheatsheetPage

export const Head = () => (
  <Seo
    title="Cheat sheet macOS"
    lang="fr"
    description="Raccourcis Herdr, tmux et Neovim, alias fish et recherche fzf sur macOS."
  />
)

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
