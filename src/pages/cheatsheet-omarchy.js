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

const Shortcuts = ({ entries, sequential = false }) => (
  <dl className={styles.shortcuts}>
    {entries.map(([description, keys]) => (
      <div className={styles.row} key={description}>
        <dt>{description}</dt>
        <dd>
          <Keys keys={keys} sequential={sequential} />
        </dd>
      </div>
    ))}
  </dl>
)

/**
 * Schematics.
 *
 * One frame is one screen: the outline is the monitor, the strip along the top
 * is the Omarchy bar, the lettered boxes are windows. Windows are placed in
 * fractions of the tiling area, so a schema reads as a layout rather than as a
 * set of coordinates; `raw` escapes that grid for the windows that ignore it
 * (full screen covers the bar, floating windows sit wherever they like).
 *
 * Proportions are legibility-first, not to scale: the bar and the gaps are
 * drawn thicker than the 26 px and 12 px they measure on the real monitor.
 */
const FRAME = { width: 104, height: 66 }
const AREA = { x: 2, y: 10, width: 100, height: 54 }
const GAP = 1.5

const place = ({ raw, x = 0, y = 0, w = 1, h = 1 }) =>
  raw
    ? { x: raw[0], y: raw[1], width: raw[2], height: raw[3] }
    : {
        x: AREA.x + x * AREA.width + GAP,
        y: AREA.y + y * AREA.height + GAP,
        width: w * AREA.width - GAP * 2,
        height: h * AREA.height - GAP * 2,
      }

const Window = (window) => {
  const { label, aside, active, bare, ghost, tabs } = window
  const { x, y, width, height } = place(window)
  const ink = active ? "var(--claret)" : "var(--ink-muted)"
  // A grouped window wears its tabs where a lone window wears its title bar,
  // and the tabs are labelled: a grouped B that left no trace would read as a
  // window that simply closed.
  const header = tabs ? 6.5 : 3.4
  const tabWidth = tabs
    ? (width - 1 - (tabs.length - 1) * 0.8) / tabs.length
    : width - 1
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="2"
        fill={ghost ? "none" : "var(--surface-2)"}
        stroke={active ? "var(--claret)" : "var(--rule)"}
        strokeWidth={active ? 1.6 : 1}
        strokeDasharray={ghost ? "3 2.5" : undefined}
      />
      {!ghost &&
        !bare &&
        (tabs || [null]).map((tab, index) => {
          const tabX = x + 0.5 + index * (tabWidth + 0.8)
          const selected = tabs ? index === 0 : active
          return (
            <g key={index}>
              <rect
                x={tabX}
                y={y + 0.5}
                width={tabWidth}
                height={header - 1}
                rx="1"
                fill={selected ? "var(--claret)" : "var(--surface-3)"}
                stroke={selected ? "none" : "var(--rule)"}
                strokeWidth="0.6"
              />
              {tab && (
                <text
                  x={tabX + tabWidth / 2}
                  y={y + header / 2}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{ fontSize: "4.6px" }}
                  fill={selected ? "var(--paper)" : "var(--ink-muted)"}
                >
                  {tab}
                </text>
              )}
            </g>
          )
        })}
      {label && (
        <text
          x={aside ? x + width * 0.2 : x + width / 2}
          y={y + height / 2 + 2}
          textAnchor="middle"
          dominantBaseline="central"
          fill={ghost ? "var(--rule)" : ink}
        >
          {label}
        </text>
      )}
    </g>
  )
}

const Separator = ({ at, horizontal }) =>
  horizontal ? (
    <line
      x1={AREA.x + 1}
      y1={AREA.y + at * AREA.height}
      x2={AREA.x + AREA.width - 1}
      y2={AREA.y + at * AREA.height}
      stroke="var(--oxford)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  ) : (
    <line
      x1={AREA.x + at * AREA.width}
      y1={AREA.y + 1.5}
      x2={AREA.x + at * AREA.width}
      y2={AREA.y + AREA.height - 1.5}
      stroke="var(--oxford)"
      strokeWidth="2"
      strokeLinecap="round"
    />
  )

const Screen = ({ windows, separator, workspace, offset = 0 }) => (
  <g transform={`translate(${offset} 0)`}>
    <rect
      x="0.5"
      y="0.5"
      width={FRAME.width - 1}
      height={FRAME.height - 1}
      rx="3"
      fill="var(--paper-raised)"
      stroke="var(--rule)"
    />
    <rect
      x="1.5"
      y="1.5"
      width={FRAME.width - 3}
      height="7"
      rx="1.5"
      fill="var(--surface-1)"
    />
    {workspace && (
      <text x="6" y="5.2" dominantBaseline="central" fill="var(--ink-muted)">
        {workspace}
      </text>
    )}
    {windows.map((window, index) => (
      <Window key={index} {...window} />
    ))}
    {separator && <Separator {...separator} />}
  </g>
)

const SPAN = FRAME.width + 26

const Schema = ({ id, title, action, keys, before, after }) => (
  <figure className={styles.schema}>
    <svg
      className={styles.diagram}
      viewBox={`0 0 ${SPAN + FRAME.width} ${FRAME.height}`}
      role="img"
      aria-labelledby={`${id}-title`}
      focusable="false"
    >
      <title id={`${id}-title`}>{title}</title>
      <Screen {...before} />
      <path
        d={`M${FRAME.width + 7} 33 h11`}
        fill="none"
        stroke="var(--ink-muted)"
        strokeWidth="1.2"
      />
      <path
        d={`M${FRAME.width + 14} 29.5 l4 3.5 l-4 3.5`}
        fill="none"
        stroke="var(--ink-muted)"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Screen {...after} offset={SPAN} />
    </svg>
    <figcaption>
      <span className={styles.schemaAction}>{action}</span>
      <Keys keys={keys} />
    </figcaption>
  </figure>
)

const sideBySide = (activeIndex, at = 0.5) => ({
  windows: [
    { x: 0, w: at, label: "A", active: activeIndex === 0 },
    { x: at, w: 1 - at, label: "B", active: activeIndex === 1 },
  ],
})

const launchShortcuts = [
  ["Terminal", ["SUPER + ENTRÉE"]],
  ["Herdr", ["SUPER + CTRL + ENTRÉE"]],
  ["tmux", ["SUPER + ALT + ENTRÉE"]],
  ["Navigateur", ["SUPER + MAJ + ENTRÉE"]],
  ["Gestionnaire de fichiers", ["SUPER + MAJ + F"]],
  ["Éditeur", ["SUPER + MAJ + N"]],
  ["Liste des raccourcis", ["SUPER + K"]],
  ["Menu Omarchy", ["SUPER + ESPACE"]],
  ["Menu des applications", ["SUPER + ALT + ESPACE"]],
  ["Menu système", ["SUPER + ÉCHAP"]],
  ["Verrouiller", ["SUPER + CTRL + L"]],
]

const windowShortcuts = [
  ["Plein écran", ["SUPER + F"]],
  ["Pleine largeur", ["SUPER + ALT + F"]],
  ["Plein écran tuilé", ["SUPER + CTRL + F"]],
  ["Fermer la fenêtre", ["SUPER + W"]],
  ["Fermer toutes les fenêtres", ["CTRL + ALT + SUPPR"]],
  ["Basculer flottant / tuilé", ["SUPER + T"]],
  ["Détacher : flottante, centrée, épinglée", ["SUPER + O"]],
  ["Inverser le sens du prochain split", ["SUPER + J"]],
  ["Fenêtre pseudo", ["SUPER + P"]],
  ["Mémoriser la largeur de cette fenêtre", ["SUPER + ALT + Début"]],
  ["Restaurer la largeur mémorisée", ["SUPER + Début"]],
  ["Layout du workspace : dwindle ↔ scrolling", ["SUPER + L"]],
  ["Transparence de la fenêtre", ["SUPER + Retour arrière"]],
  ["Espacement entre les fenêtres", ["SUPER + MAJ + Retour arrière"]],
  ["Aspect carré quand une seule fenêtre", ["SUPER + CTRL + Retour arrière"]],
]

const focusShortcuts = [
  ["Focaliser la fenêtre voisine", ["SUPER + ←↓↑→"]],
  ["Échanger avec la fenêtre voisine", ["SUPER + MAJ + ←↓↑→"]],
  ["Fenêtre suivante · la remonte au premier plan", ["ALT + TAB"]],
  ["Fenêtre précédente", ["MAJ + ALT + TAB"]],
  ["Moniteur suivant", ["CTRL + ALT + TAB"]],
  ["Moniteur précédent", ["MAJ + CTRL + ALT + TAB"]],
  ["Déplacer la fenêtre à la souris", ["SUPER + clic gauche"]],
  ["Redimensionner à la souris", ["SUPER + clic droit"]],
]

const workspaceShortcuts = [
  ["Aller à l’espace 1 à 9", ["SUPER + 1…9"]],
  ["Aller à l’espace 10", ["SUPER + 0"]],
  ["Y déplacer la fenêtre et la suivre", ["SUPER + MAJ + 1…0"]],
  ["Y déplacer la fenêtre en restant ici", ["SUPER + MAJ + ALT + 1…0"]],
  ["Espace suivant", ["SUPER + TAB"]],
  ["Espace précédent", ["SUPER + MAJ + TAB"]],
  ["Dernier espace visité", ["SUPER + CTRL + TAB"]],
  ["Faire défiler les espaces", ["SUPER + molette"]],
  ["Déplacer l’espace vers un autre écran", ["SUPER + MAJ + ALT + ←↓↑→"]],
  ["Afficher le bloc-notes", ["SUPER + S"]],
  ["Y envoyer la fenêtre", ["SUPER + ALT + S"]],
]

const groupShortcuts = [
  ["Grouper / dégrouper", ["SUPER + G"]],
  ["Sortir la fenêtre du groupe", ["SUPER + ALT + G"]],
  ["Y faire entrer la voisine", ["SUPER + ALT + ←↓↑→"]],
  ["Onglet suivant", ["SUPER + ALT + TAB"]],
  ["Onglet précédent", ["SUPER + MAJ + ALT + TAB"]],
  ["Onglet à gauche / à droite", ["SUPER + CTRL + ←→"]],
  ["Onglet 1 à 5", ["SUPER + ALT + 1…5"]],
  ["Onglet suivant / précédent à la souris", ["SUPER + ALT + molette"]],
]

const clipboardShortcuts = [
  ["Copier", ["SUPER + C"]],
  ["Coller", ["SUPER + V"]],
  ["Couper", ["SUPER + X"]],
  ["Historique du presse-papiers", ["SUPER + CTRL + V"]],
  ["Émojis", ["SUPER + CTRL + E"]],
]

const captureShortcuts = [
  ["Capture d’écran", ["IMPR. ÉCRAN"]],
  ["Enregistrement d’écran", ["ALT + IMPR. ÉCRAN"]],
  ["Pipette à couleur", ["SUPER + IMPR. ÉCRAN"]],
  ["Extraire le texte (OCR)", ["SUPER + CTRL + IMPR. ÉCRAN"]],
  ["Menu de capture", ["SUPER + CTRL + C"]],
]

const notificationShortcuts = [
  ["Fermer la dernière notification", ["SUPER + ,"]],
  ["Rouvrir la dernière notification", ["SUPER + ALT + ,"]],
  ["Tout fermer", ["SUPER + MAJ + ,"]],
  ["Historique des notifications", ["SUPER + MAJ + ALT + ,"]],
  ["Silence", ["SUPER + CTRL + ,"]],
]

const systemMenuShortcuts = [
  ["Audio", ["SUPER + CTRL + A"]],
  ["Bluetooth", ["SUPER + CTRL + B"]],
  ["Affichage", ["SUPER + CTRL + D"]],
  ["Réseau", ["SUPER + CTRL + W"]],
  ["Alimentation", ["SUPER + CTRL + P"]],
  ["Matériel", ["SUPER + CTRL + H"]],
  ["Activité", ["SUPER + CTRL + T"]],
  ["Calculatrice", ["SUPER + CTRL + Q"]],
  ["Rappel", ["SUPER + CTRL + R"]],
  ["Fond d’écran", ["SUPER + CTRL + ESPACE"]],
  ["Filtre nuit", ["SUPER + CTRL + N"]],
  ["Verrouillage sur inactivité", ["SUPER + CTRL + I"]],
]

const screenShortcuts = [
  ["Zoom écran", ["SUPER + CTRL + Z"]],
  ["Réinitialiser le zoom", ["SUPER + CTRL + ALT + Z"]],
  ["Masquer / afficher la barre", ["SUPER + MAJ + ESPACE"]],
  ["Panneaux de la barre", ["SUPER + CTRL + 1…9"]],
]

const herdrPanes = [
  ["Split côte à côte", ["Ctrl + Espace", "v"], ["Alt + Maj + Entrée"]],
  ["Split empilé", ["Ctrl + Espace", "h"], ["Alt + Entrée"]],
  ["Fermer le pane", ["Ctrl + Espace", "x"], ["Alt + Échap"]],
  ["Zoom sur le pane", ["Ctrl + Espace", "z"], null],
  ["Dernier pane", ["Ctrl + Espace", ";"], null],
  ["Focaliser un pane", null, ["Ctrl + Alt + ←↓↑→"]],
  [
    "Redimensionner",
    ["Ctrl + Espace", "Ctrl + ←↓↑→"],
    ["Ctrl + Alt + Maj + ←↓↑→"],
  ],
]

const herdrTabs = [
  ["Nouvel onglet", ["Ctrl + Espace", "c"], null],
  ["Renommer l’onglet", ["Ctrl + Espace", "r"], null],
  ["Fermer l’onglet", ["Ctrl + Espace", "k"], null],
  ["Aller à l’onglet 1 à 9", ["Ctrl + Espace", "1…9"], ["Alt + 1…9"]],
  ["Onglet précédent", ["Ctrl + Espace", "p"], ["Alt + ←"]],
  ["Onglet suivant", ["Ctrl + Espace", "n"], ["Alt + →"]],
  ["Déplacer l’onglet", null, ["Alt + Maj + ←→"]],
]

const herdrWorkspaces = [
  ["Nouveau", ["Ctrl + Espace", "Maj + c"], null],
  ["Renommer", ["Ctrl + Espace", "Maj + r"], null],
  ["Fermer", ["Ctrl + Espace", "Maj + k"], null],
  ["Précédent", ["Ctrl + Espace", "Maj + p"], ["Alt + ↑"]],
  ["Suivant", ["Ctrl + Espace", "Maj + n"], ["Alt + ↓"]],
]

const herdrMisc = [
  ["Aide", ["Ctrl + Espace", "?"]],
  ["Recharger la configuration", ["Ctrl + Espace", "q"]],
  ["Détacher", ["Ctrl + Espace", "d"]],
  ["Mode copie", ["Ctrl + Espace", "["]],
  ["Renommer le pane", ["Ctrl + Espace", "Maj + o"]],
]

const PrefixTable = ({ caption, rows }) => (
  <table className={styles.splits}>
    <thead>
      <tr>
        <th scope="col">{caption}</th>
        <th scope="col">Avec le préfixe</th>
        <th scope="col">Sans préfixe</th>
      </tr>
    </thead>
    <tbody>
      {rows.map(([label, prefixed, direct]) => (
        <tr key={label}>
          <th scope="row">{label}</th>
          <td>{prefixed ? <Keys keys={prefixed} sequential /> : "—"}</td>
          <td>{direct ? <Keys keys={direct} /> : "—"}</td>
        </tr>
      ))}
    </tbody>
  </table>
)

const CheatsheetOmarchyPage = ({ data, location }) => (
  <Layout location={location} title={data.site.siteMetadata.title}>
    <article className={styles.sheet}>
      <header className={styles.heading}>
        <p className={styles.eyebrow}>Omarchy</p>
        <h1>Cheat sheet</h1>
        <nav className={styles.contents} aria-label="Sections">
          <a href="#differences">Différences avec le Mac</a>
          <a href="#hyprland">Hyprland</a>
          <a href="#systeme">Système</a>
          <a href="#herdr">Herdr / tmux</a>
          <a href="#bash">Alias bash</a>
          <a href="#fzf">fzf</a>
          <a href="#neovim">Neovim</a>
        </nav>
        <p className={styles.crossref}>
          Sur le Mac : <Link to="/cheatsheet/">cheat sheet macOS</Link>.
        </p>
      </header>

      <section className={styles.section} aria-labelledby="differences">
        <h2 id="differences">Différences avec le Mac</h2>
        <p className={styles.note}>
          Les mêmes outils, réglés autrement. Ce qui change d’une machine à
          l’autre.
        </p>
        <table className={styles.splits}>
          <thead>
            <tr>
              <th scope="col">Sujet</th>
              <th scope="col">macOS</th>
              <th scope="col">Omarchy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Préfixe Herdr</th>
              <td>
                <Keys keys={["Ctrl + b"]} />
              </td>
              <td>
                <Keys keys={["Ctrl + Espace"]} />
              </td>
            </tr>
            <tr>
              <th scope="row">
                Préfixe tmux
                <span className={styles.detail}>
                  Sur le Mac, aucun fichier de configuration : les défauts tmux
                </span>
              </th>
              <td>
                <Keys keys={["Ctrl + b"]} />
              </td>
              <td>
                <Keys keys={["Ctrl + Espace"]} />
                <span className={styles.detail}>
                  <Keys keys={["Ctrl + b"]} /> reste en préfixe secondaire
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">Splits tmux</th>
              <td>
                <Keys keys={["Ctrl + b", "%"]} sequential /> et{" "}
                <Keys keys={["Ctrl + b", '"']} sequential />
              </td>
              <td>
                <Keys keys={["Ctrl + Espace", "v"]} sequential /> et{" "}
                <Keys keys={["Ctrl + Espace", "h"]} sequential />
                <span className={styles.detail}>
                  Les mêmes touches que dans herdr
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">Shell</th>
              <td>fish</td>
              <td>
                bash
                <span className={styles.detail}>
                  Aucun fish installé sur la machine
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">Alias</th>
              <td>
                Maison : <code>lt2</code>, <code>sshnk</code>
              </td>
              <td>
                Défauts Omarchy, aucun alias personnel
                <span className={styles.detail}>
                  <code>lt</code> remplace <code>lt2</code>
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">fzf</th>
              <td>
                À activer : <code>fzf --fish | source</code>
              </td>
              <td>
                Déjà chargé, rien à taper
                <span className={styles.detail}>
                  Complétion et raccourcis sourcés au démarrage du shell
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">Neovim</th>
              <td>
                LazyVim, thème ft-paper, <Keys keys={["("]} /> et{" "}
                <Keys keys={[")"]} /> en alias de <kbd>[</kbd> et <kbd>]</kbd>
                <span className={styles.detail}>
                  Seul écart avec l’amont, pour un clavier AZERTY
                </span>
              </td>
              <td>
                LazyVim livré par Omarchy, aucun keymap personnel
                <span className={styles.detail}>
                  Les raccourcis sont ceux de LazyVim en amont
                </span>
              </td>
            </tr>
            <tr>
              <th scope="row">Fenêtres</th>
              <td>Gestion macOS</td>
              <td>
                Hyprland, layout <code>dwindle</code>, tout sous{" "}
                <kbd>SUPER</kbd>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className={styles.section} aria-labelledby="hyprland">
        <h2 id="hyprland">Hyprland</h2>
        <p className={styles.note}>
          Layout <code>dwindle</code> sur un écran unique. Aucun raccourci
          personnel : ce sont les défauts Omarchy.
        </p>
        <p className={styles.legend}>
          Dans les schémas : le cadre est l’écran et la bande du haut la barre
          Omarchy ; les rectangles sont les fenêtres ; la fenêtre en{" "}
          <span className={styles.swatchClaret}>bordeaux</span> est celle sur
          laquelle le raccourci agit ; le trait{" "}
          <span className={styles.swatchOxford}>bleu</span> est le séparateur.
        </p>

        <h3>Lancer</h3>
        <Shortcuts entries={launchShortcuts} />

        <h3>Fenêtre</h3>
        <div className={styles.schemas}>
          <Schema
            id="schema-fullscreen"
            action="Plein écran"
            keys={["SUPER + F"]}
            title="Plein écran : la fenêtre active couvre tout l’écran, barre comprise, et masque l’autre fenêtre."
            before={sideBySide(0)}
            after={{
              windows: [
                { x: 0.5, w: 0.5, label: "B" },
                { raw: [1.5, 1.5, 101, 63], label: "A", active: true },
              ],
            }}
          />
          <Schema
            id="schema-fullwidth"
            action="Pleine largeur"
            keys={["SUPER + ALT + F"]}
            title="Pleine largeur : la fenêtre active remplit la zone de tuilage, sous la barre, et recouvre l’autre fenêtre qui garde sa tuile."
            before={sideBySide(0)}
            after={{
              windows: [
                { x: 0.5, w: 0.5, label: "B" },
                { label: "A", active: true },
              ],
            }}
          />
          <Schema
            id="schema-tiled-fullscreen"
            action="Plein écran tuilé"
            keys={["SUPER + CTRL + F"]}
            title="Plein écran tuilé : la tuile ne bouge pas, seule l’application se croit en plein écran et masque sa propre décoration."
            before={sideBySide(0)}
            after={{
              windows: [
                { x: 0, w: 0.5, label: "A", active: true, bare: true },
                { x: 0.5, w: 0.5, label: "B" },
              ],
            }}
          />
          <Schema
            id="schema-float"
            action="Flottant ou tuilé"
            keys={["SUPER + T"]}
            title="Flottant : la fenêtre active quitte la tuile et flotte au-dessus ; l’autre fenêtre récupère toute la place."
            before={sideBySide(0)}
            after={{
              windows: [
                { label: "B", aside: true },
                { raw: [34, 20, 60, 38], label: "A", active: true },
              ],
            }}
          />
          <Schema
            id="schema-pop"
            action="Détacher la fenêtre"
            keys={["SUPER + O"]}
            title="Détacher : la fenêtre active devient flottante, est centrée à 1300 sur 900, épinglée et mise au premier plan."
            before={sideBySide(0)}
            after={{
              windows: [
                { label: "B", aside: true },
                { raw: [30, 19, 60, 40], label: "A", active: true },
              ],
            }}
          />
          <Schema
            id="schema-split"
            action="Sens du prochain split"
            keys={["SUPER + J"]}
            title="Sens du prochain split : la prochaine fenêtre s’ouvrira empilée au lieu de s’ouvrir à côté."
            before={{
              windows: [
                { w: 0.5, label: "A", active: true },
                { x: 0.5, w: 0.5, label: "", ghost: true },
              ],
            }}
            after={{
              windows: [
                { h: 0.5, label: "A", active: true },
                { y: 0.5, h: 0.5, label: "", ghost: true },
              ],
            }}
          />
        </div>
        <Shortcuts entries={windowShortcuts} />
        <p className={styles.note}>
          <Keys keys={["SUPER + O"]} /> redimensionne la fenêtre à 1300 × 900,
          la centre, l’épingle et la met au premier plan ; un second appel
          revient en arrière. <Keys keys={["SUPER + ALT + Début"]} /> mémorise
          la largeur par couple espace de travail et application.
        </p>

        <h3>Focus et déplacement</h3>
        <div className={styles.schemas}>
          <Schema
            id="schema-focus"
            action="Focaliser à gauche"
            keys={["SUPER + ←"]}
            title="Focus : rien ne bouge, l’attention passe de la fenêtre de droite à celle de gauche."
            before={sideBySide(1)}
            after={sideBySide(0)}
          />
          <Schema
            id="schema-swap"
            action="Échanger avec la voisine de gauche"
            keys={["SUPER + MAJ + ←"]}
            title="Échanger : la fenêtre active prend la place de sa voisine de gauche, et la voisine prend la sienne."
            before={sideBySide(1)}
            after={{
              windows: [
                { w: 0.5, label: "B", active: true },
                { x: 0.5, w: 0.5, label: "A" },
              ],
            }}
          />
        </div>
        <Shortcuts entries={focusShortcuts} />
        <p className={styles.callout}>
          <strong>Il n’existe pas de raccourci « aligner à gauche »</strong>{" "}
          dans le layout <code>dwindle</code>. L’équivalent pratique est{" "}
          <Keys keys={["SUPER + MAJ + ←"]} />, qui échange la fenêtre active
          avec sa voisine de gauche et la place donc dans l’emplacement de
          gauche.
        </p>

        <h3>Redimensionner</h3>
        <p className={styles.callout}>
          <strong>Le raccourci déplace le séparateur</strong>, pas la fenêtre.
          Les libellés d’Omarchy (« Expand window left ») parlent du point de
          vue de la fenêtre active et induisent en erreur : la même touche
          pousse le séparateur du même côté, que la fenêtre active soit à gauche
          ou à droite. Elle grandit dans un cas, elle rétrécit dans l’autre.
        </p>
        <div className={styles.schemas}>
          <Schema
            id="schema-resize-right"
            action="Fenêtre active à droite : elle grandit"
            keys={["SUPER + )"]}
            title="Le séparateur part vers la gauche : la fenêtre active, qui est à droite, gagne de la largeur."
            before={{ ...sideBySide(1), separator: { at: 0.5 } }}
            after={{ ...sideBySide(1, 0.35), separator: { at: 0.35 } }}
          />
          <Schema
            id="schema-resize-left"
            action="Fenêtre active à gauche : elle rétrécit"
            keys={["SUPER + )"]}
            title="La même touche avec la fenêtre active à gauche : le séparateur part encore vers la gauche, donc la fenêtre active perd de la largeur."
            before={{ ...sideBySide(0), separator: { at: 0.5 } }}
            after={{ ...sideBySide(0, 0.35), separator: { at: 0.35 } }}
          />
          <Schema
            id="schema-resize-down"
            action="Séparateur horizontal vers le bas"
            keys={["SUPER + MAJ + -"]}
            title="Le séparateur horizontal descend : la fenêtre du haut gagne de la hauteur, celle du bas en perd."
            before={{
              windows: [
                { h: 0.5, label: "A", active: true },
                { y: 0.5, h: 0.5, label: "B" },
              ],
              separator: { at: 0.5, horizontal: true },
            }}
            after={{
              windows: [
                { h: 0.68, label: "A", active: true },
                { y: 0.68, h: 0.32, label: "B" },
              ],
              separator: { at: 0.68, horizontal: true },
            }}
          />
        </div>
        <Shortcuts
          entries={[
            ["Séparateur vertical vers la gauche", ["SUPER + )"]],
            ["Séparateur vertical vers la droite", ["SUPER + -"]],
            ["Séparateur horizontal vers le bas", ["SUPER + MAJ + -"]],
            ["Séparateur horizontal vers le haut", ["SUPER + MAJ + )"]],
          ]}
        />
        <p className={styles.note}>
          Amplitude : <kbd>SUPER</kbd> seul déplace de 100 px, avec{" "}
          <kbd>ALT</kbd> de 25 px, avec <kbd>CTRL</kbd> de 300 px. À la souris :{" "}
          <Keys keys={["SUPER + clic droit"]} />.
        </p>
        <p className={styles.callout}>
          <strong>Les touches affichées ne sont pas celles à presser.</strong>{" "}
          Ces raccourcis sont définis par code physique et{" "}
          <code>omarchy menu keybindings</code> les nomme à l’américaine. Sur ce
          clavier <code>fr(mac)</code>, <code>MINUS</code> est la touche{" "}
          <kbd>)</kbd> et <code>EQUAL</code> la touche <kbd>-</kbd>.
        </p>
        <table className={styles.splits}>
          <thead>
            <tr>
              <th scope="col">Effet</th>
              <th scope="col">À presser</th>
              <th scope="col">Affiché par Omarchy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row">Séparateur vertical vers la gauche</th>
              <td>
                <Keys keys={["SUPER + )"]} />
              </td>
              <td>
                <code>SUPER + MINUS</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Séparateur vertical vers la droite</th>
              <td>
                <Keys keys={["SUPER + -"]} />
              </td>
              <td>
                <code>SUPER + EQUAL</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Séparateur horizontal vers le bas</th>
              <td>
                <Keys keys={["SUPER + MAJ + -"]} />
              </td>
              <td>
                <code>SUPER SHIFT + EQUAL</code>
              </td>
            </tr>
            <tr>
              <th scope="row">Séparateur horizontal vers le haut</th>
              <td>
                <Keys keys={["SUPER + MAJ + )"]} />
              </td>
              <td>
                <code>SUPER SHIFT + MINUS</code>
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Espaces de travail</h3>
        <div className={styles.schemas}>
          <Schema
            id="schema-workspace"
            action="Envoyer la fenêtre sur l’espace 3"
            keys={["SUPER + MAJ + 3"]}
            title="La fenêtre active quitte l’espace 1 pour l’espace 3, et l’écran suit : on arrive sur l’espace 3 avec elle."
            before={{ ...sideBySide(0), workspace: "1" }}
            after={{
              windows: [{ label: "A", active: true }],
              workspace: "3",
            }}
          />
        </div>
        <Shortcuts entries={workspaceShortcuts} />

        <h3>Groupes de fenêtres</h3>
        <div className={styles.schemas}>
          <Schema
            id="schema-group"
            action="Grouper en onglets"
            keys={["SUPER + G"]}
            title="Grouper : les deux fenêtres se superposent dans une seule tuile et se partagent une barre d’onglets."
            before={sideBySide(0)}
            after={{
              windows: [{ active: true, tabs: ["A", "B"] }],
            }}
          />
        </div>
        <Shortcuts entries={groupShortcuts} />
      </section>

      <section className={styles.section} aria-labelledby="systeme">
        <h2 id="systeme">Système</h2>

        <h3>Presse-papiers</h3>
        <p className={styles.note}>
          Universel : les mêmes touches dans le terminal et dans les
          applications.
        </p>
        <Shortcuts entries={clipboardShortcuts} />

        <h3>Capture</h3>
        <Shortcuts entries={captureShortcuts} />

        <h3>Notifications</h3>
        <Shortcuts entries={notificationShortcuts} />

        <h3>Menus système</h3>
        <Shortcuts entries={systemMenuShortcuts} />

        <h3>Écran et barre</h3>
        <Shortcuts entries={screenShortcuts} />
        <p className={styles.note}>
          L’échelle du moniteur est sur <code>SUPER + SLASH</code> et{" "}
          <code>SUPER ALT + SLASH</code>. Sur ce clavier, la barre oblique est
          en majuscule de la touche <kbd>:</kbd> ; la combinaison exacte à
          presser n’a pas été vérifiée.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="herdr">
        <h2 id="herdr">Herdr / tmux</h2>
        <p className={styles.callout}>
          <strong>
            Préfixe commun : <Keys keys={["Ctrl + Espace"]} />
          </strong>{" "}
          — et non <Keys keys={["Ctrl + b"]} /> comme sur le Mac. tmux garde{" "}
          <Keys keys={["Ctrl + b"]} /> en préfixe secondaire, herdr non. Dans
          tmux seulement, deux <Keys keys={["Ctrl + Espace"]} /> envoient le
          préfixe au programme.
        </p>
        <p className={styles.note}>
          La configuration herdr reprend celle de tmux : session tmux →
          workspace herdr, fenêtre tmux → onglet herdr, pane → pane. Les deux
          tableaux ci-dessous valent donc pour l’un comme pour l’autre.
        </p>

        <h3>Panes</h3>
        <PrefixTable caption="Pane" rows={herdrPanes} />
        <p className={styles.note}>
          Le split « côte à côte » est celui que herdr nomme
          «&nbsp;vertical&nbsp;» et tmux <code>split-window -h</code>. Les
          splits héritent du répertoire courant. Focus et redimensionnement
          direct valent pour les quatre flèches.
        </p>

        <h3>Onglets</h3>
        <PrefixTable caption="Onglet" rows={herdrTabs} />
        <p className={styles.note}>
          herdr parle d’onglets, tmux de fenêtres : ce sont les mêmes touches.
        </p>

        <h3>Workspaces et sessions</h3>
        <PrefixTable caption="Workspace" rows={herdrWorkspaces} />
        <p className={styles.note}>
          herdr parle de workspaces, tmux de sessions.
        </p>

        <h3>Divers</h3>
        <Shortcuts entries={herdrMisc} sequential />
        <p className={styles.note}>
          Le renommage de pane est sur{" "}
          <Keys keys={["Ctrl + Espace", "Maj + o"]} sequential /> : le défaut{" "}
          <Keys keys={["Ctrl + Espace", "Maj + p"]} sequential /> sert déjà au
          workspace précédent. Mode copie vi : <kbd>v</kbd> sélectionne,{" "}
          <kbd>y</kbd> copie. La liste complète est aussi sous{" "}
          <Keys keys={["SUPER + CTRL + K"]} /> pour herdr et{" "}
          <Keys keys={["SUPER + ALT + K"]} /> pour tmux.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="bash">
        <h2 id="bash">Alias bash</h2>
        <p className={styles.note}>
          Shell <code>bash</code>, alias livrés par Omarchy. Aucun alias
          personnel : <code>~/.bashrc</code> ne fait que charger les défauts.
        </p>

        <h3>Fichiers</h3>
        <dl className={styles.shortcuts}>
          <div className={styles.row}>
            <dt>
              <code>ls</code>
            </dt>
            <dd>
              <code>eza -lh --group-directories-first --icons=auto</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>lsa</code>
            </dt>
            <dd>
              <code>ls -a</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>lt</code>
            </dt>
            <dd>
              <code>eza --tree --level=2 --long --icons --git</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>lta</code>
            </dt>
            <dd>
              <code>lt -a</code>
            </dd>
          </div>
        </dl>
        <p className={styles.note}>
          <code>lt</code> tient ici le rôle du <code>lt2</code> maison du Mac.
        </p>

        <h3>Navigation</h3>
        <dl className={styles.shortcuts}>
          <div className={styles.row}>
            <dt>
              <code>..</code> · <code>...</code> · <code>....</code>
            </dt>
            <dd>Remonter d’un, deux ou trois niveaux</dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>cd</code>
            </dt>
            <dd>
              <code>zd</code>, qui délègue à <code>zoxide</code> quand
              l’argument n’est pas un répertoire existant
            </dd>
          </div>
        </dl>

        <h3>Outils</h3>
        <dl className={styles.shortcuts}>
          <div className={styles.row}>
            <dt>
              <code>n</code>
            </dt>
            <dd>
              <code>nvim</code> — sans argument, <code>nvim .</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>h</code>
            </dt>
            <dd>
              <code>herdr</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>t</code>
            </dt>
            <dd>
              <code>tmux attach || tmux new -s Work</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>a</code>
            </dt>
            <dd>
              <code>omarchy-agent --inline</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>c</code>
            </dt>
            <dd>
              <code>opencode --auto</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>cx</code>
            </dt>
            <dd>
              Efface l’écran puis <code>claude --permission-mode auto</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>cy</code>
            </dt>
            <dd>
              <code>codex --approve-for-me</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>d</code> · <code>r</code>
            </dt>
            <dd>
              <code>docker</code> · <code>rails</code>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>mup</code>
            </dt>
            <dd>
              <code>mise up</code> sans délai minimal
            </dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>g</code> · <code>gcm</code> · <code>gcam</code> ·{" "}
              <code>gcad</code>
            </dt>
            <dd>git et ses commits</dd>
          </div>
          <div className={styles.row}>
            <dt>
              <code>open</code>
            </dt>
            <dd>
              <code>xdg-open</code> en arrière-plan
            </dd>
          </div>
        </dl>

        <h3>Ligne de commande</h3>
        <p className={styles.note}>Réglages readline livrés par Omarchy.</p>
        <Shortcuts
          entries={[
            ["Historique filtré par ce qui est déjà tapé", ["↑ ↓"]],
            ["Parcourir les complétions", ["TAB ou MAJ + TAB"]],
          ]}
        />
        <p className={styles.note}>
          Les flèches ne font pas défiler tout l’historique : elles cherchent
          les commandes qui commencent par ce qui est saisi. La complétion est
          insensible à la casse et propose d’abord le préfixe commun.
        </p>
      </section>

      <section className={styles.section} aria-labelledby="fzf">
        <h2 id="fzf">fzf</h2>
        <p className={styles.callout}>
          <strong>Rien à activer.</strong> Contrairement au Mac, où il faut
          taper <code>fzf --fish | source</code>, Omarchy charge la complétion
          et les raccourcis fzf au démarrage du shell.
        </p>
        <Shortcuts
          entries={[
            ["Rechercher dans l’historique", ["Ctrl + r"]],
            ["Insérer un chemin dans la ligne de commande", ["Ctrl + t"]],
            ["Changer de répertoire", ["Alt + c"]],
          ]}
        />
        <p className={styles.note}>
          <Keys keys={["Ctrl + t"]} /> insère un chemin ; il n’ouvre pas le
          fichier.
        </p>
        <div className={styles.alias}>
          <h3>
            <code>ff</code>
          </h3>
          <p className={styles.note}>
            Chercher un fichier, avec aperçu <code>bat</code>.
          </p>
        </div>
        <div className={styles.alias}>
          <h3>
            <code>eff</code>
          </h3>
          <pre>
            <code>$EDITOR "$(ff)"</code>
          </pre>
          <p className={styles.note}>Chercher un fichier, puis l’ouvrir.</p>
        </div>
        <div className={styles.alias}>
          <h3>
            <code>sff</code> <span className={styles.detail}>destination</span>
          </h3>
          <p className={styles.note}>
            Choisir un fichier récent, puis l’envoyer par <code>scp</code>.
          </p>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="neovim">
        <h2 id="neovim">Neovim</h2>
        <p className={styles.callout}>
          Les deux machines tournent sous LazyVim depuis le 14 septembre 2026.
          Ici, celui livré par Omarchy, sans aucun keymap personnel : les
          raccourcis sont ceux de LazyVim en amont, leader <kbd>Espace</kbd>. Le
          Mac y ajoute le thème ft-paper et les alias <kbd>(</kbd> et{" "}
          <kbd>)</kbd>. Les raccourcis maison des projets Arko, eux, ne sont que
          sur le Mac.
        </p>
        <p className={styles.note}>
          Deux réglages locaux seulement : numérotation absolue et formatage
          automatique désactivé. Le presse-papiers passe en OSC 52 quand Neovim
          tourne sous tmux, herdr ou SSH, donc <kbd>y</kbd> remonte jusqu’au
          presse-papiers de la machine qui affiche le terminal.
        </p>
      </section>
    </article>
  </Layout>
)

export default CheatsheetOmarchyPage

export const Head = () => (
  <Seo
    title="Cheat sheet Omarchy"
    lang="fr"
    description="Raccourcis Hyprland, Herdr, tmux et Neovim, alias bash et fzf sur Omarchy, avec des schémas pour les fenêtres."
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
