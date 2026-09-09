# Publier et intégrer des artefacts dans les articles

Recherche du 9 septembre 2026. Proposition technique, sans modification du site.

## Conclusion

Gatsby possède les briques nécessaires. Pour ce site, conserver Gatsby et ajouter `gatsby-remark-embed-snippet` est une évolution plus limitée qu'une migration. Le même fichier peut servir de source au téléchargement et au bloc de code d'un article. Cette recommandation découle des capacités documentées ci-dessous ; aucune installation ni validation du build n'a été effectuée.

## Gatsby

Gatsby copie le contenu de `static/` dans la sortie, sans traitement ni ajout d'empreinte au nom. Par exemple, `static/artifacts/vscode/settings.json` devient `/artifacts/vscode/settings.json`. C'est adapté à une URL prévisible pour une autre machine. Le cache HTTP d'une URL dont le contenu change reste à gérer. [Documentation du dossier static](https://www.gatsbyjs.com/docs/how-to/images-and-media/static-folder/).

Le plugin officiel `gatsby-remark-embed-snippet` lit un fichier local et l'insère comme bloc de code. Son option `directory` fixe le répertoire source ; sans option, il utilise le dossier de l'article. Il doit précéder `gatsby-remark-prismjs`. Il sait aussi sélectionner des lignes (`#L3-8`) ou des extraits nommés. [Documentation du plugin](https://www.gatsbyjs.com/plugins/gatsby-remark-embed-snippet/).

Configuration proposée dans les plugins de `gatsby-transformer-remark`, avant Prism :

```js
{
  resolve: "gatsby-remark-embed-snippet",
  options: {
    directory: `${__dirname}/static/artifacts`,
  },
},
```

Puis dans un article Markdown :

```md
`embed:vscode/settings.json`

[Télécharger settings.json](/artifacts/vscode/settings.json)
```

Le code source du plugin lit directement le disque : ajouter ce répertoire à `gatsby-source-filesystem` n'est pas nécessaire pour cette lecture. Il retire les espaces en début et fin avec `.trim()` et infère le langage d'après l'extension. Un fichier sans extension, tel que `Brewfile`, reçoit `none` ; `.md` reçoit `markup`. L'intégration d'un `SKILL.md` est donc un affichage de son texte comme code, pas un rendu de son Markdown. Il faudra vérifier les reconstructions après modification du seul artefact : le module consulté ne montre pas d'enregistrement de dépendance pour invalider le cache des articles. [Code source du plugin](https://raw.githubusercontent.com/gatsbyjs/gatsby/master/packages/gatsby-remark-embed-snippet/src/index.js).

Le plugin officiel `gatsby-remark-copy-linked-files`, déjà configuré dans ce site avec Prism, convient aussi aux pièces jointes locales liées depuis un article. Par défaut, il copie sous une URL contenant une empreinte et réécrit le lien. Cette URL dépend du contenu ; `static/` exprime plus simplement le besoin d'adresses prévisibles. `destinationDir` permet toutefois de personnaliser les chemins. [Documentation du plugin](https://www.gatsbyjs.com/plugins/gatsby-remark-copy-linked-files/).

Le registre npm indique `gatsby-remark-embed-snippet` **8.16.0**, publié le **26 janvier 2026**, avec des dépendances homologues Gatsby `^5.0.0-next` et Prism `^7.0.0-next`. C'est cohérent avec la génération Gatsby 5 du site, sous réserve d'un build réel. Une date de publication ne suffit pas à conclure à la qualité ou à l'abandon de la maintenance. [Métadonnées npm](https://registry.npmjs.org/gatsby-remark-embed-snippet).

## Autres moteurs

| Moteur | Téléchargement | Intégration dans les articles |
| --- | --- | --- |
| Gatsby | Dossier `static/` natif | Plugin `gatsby-remark-embed-snippet`, compatible avec le Markdown déjà utilisé |
| Astro | Dossier `public/` copié tel quel | Import de texte avec `?raw`, puis composant natif `Code` dans un fichier `.astro` ou `.mdx` ; un composant personnalisé peut grouper aperçu et lien |
| Hugo | Ressources globales dans `assets/`, ou ressources associées à une page | Petit shortcode personnalisé combinant `resources.Get`, `.Content`, `transform.Highlight` et `.RelPermalink` |

Astro documente la [copie du dossier public](https://docs.astro.build/en/basics/project-structure/#public), les [imports d'assets et paramètres Vite](https://docs.astro.build/en/guides/imports/#other-assets) et le [composant Code utilisable dans Astro et MDX](https://docs.astro.build/en/guides/syntax-highlighting/#components-for-code-blocks). L'usage de composants dans les articles suppose MDX ; un fichier Markdown ordinaire demande une autre intégration. [Markdown et MDX dans Astro](https://docs.astro.build/en/guides/markdown-content/).

Hugo fournit nativement [resources.Get](https://gohugo.io/functions/resources/get/), [Resource.Content](https://gohugo.io/methods/resource/content/), [Resource.RelPermalink](https://gohugo.io/methods/resource/relpermalink/) et [transform.Highlight](https://gohugo.io/functions/transform/highlight/). Les [ressources de page](https://gohugo.io/content-management/page-resources/) regroupent article et pièces jointes ; les ressources globales sont plus directes pour réutiliser un artefact dans plusieurs articles. Le shortcode qui compose ces opérations reste à écrire.

Ces deux moteurs conviennent également. Astro peut intéresser une refonte fondée sur des composants ; Hugo peut intéresser une préférence pour Markdown et les templates. Ces appréciations sont des recommandations d'architecture, pas des fonctionnalités que Gatsby serait incapable de fournir.

## Organisation suggérée

Conserver une source versionnée par fichier sous `static/artifacts/`, avec des sous-dossiers `vscode/`, `ghostty/`, `homebrew/` et `skills/`. Un index lisible sur le site peut donner les URL et les indications d'installation ; un manifeste JSON devient utile si la découverte doit être automatisée.

Choisir explicitement si l'article affiche la configuration courante ou une version figée. Une URL stable peut représenter la version courante ; une URL versionnée distincte permet de conserver les exemples historiques. C'est un choix éditorial et d'organisation proposé, indépendant du moteur. Pour un artefact composé de plusieurs fichiers, prévoir éventuellement une archive : le plugin d'intégration ne crée pas de paquet d'installation.
