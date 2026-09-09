# Downloadable artifacts

Keep downloadable files in `static/artifacts/`. Gatsby copies them unchanged,
so `static/artifacts/homebrew/Brewfile` is available at
`/artifacts/homebrew/Brewfile`.

The index lives in `content/pages/artifacts/index.md`. Include a file in a
Markdown article with an inline code directive on its own line:

```md
`embed:homebrew/Brewfile`

[Download the Brewfile](/artifacts/homebrew/Brewfile)
```

Edit the source file, not the rendered snippets. These URLs and snippets
represent the current configuration; use a separate versioned filename when
an article needs a frozen example.

## Cached builds

`gatsby-source-filesystem` watches the artifact directory. A patch to
`gatsby-remark-embed-snippet` registers included files through Gatsby Remark's
`getRemarkFileDependency`, so changing only an artifact invalidates the cached
article HTML. The existing `postinstall` command applies the patch.

When upgrading the plugin, build once, change only the Brewfile, and build again
without running `gatsby clean`. Both `/artifacts/` and `/uses/` must show the new
content, and the downloaded file must match the source. Restore the temporary
change and rebuild afterward.
