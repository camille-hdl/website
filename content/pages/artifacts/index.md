---
title: Artifacts
date: "2026-09-09T00:00:00.000Z"
description: Configuration files and tools I use, ready to download and reuse.
---

Configuration files from [my setup](/uses/), ready to download and reuse.

## Ghostty: ft-paper

A light terminal theme inspired by the Financial Times, with a paper background and slate text.

<a href="/artifacts/ghostty/ft-paper" download="ft-paper">Download the ft-paper theme</a>

Save it as `~/.config/ghostty/themes/ft-paper` (or `$XDG_CONFIG_HOME/ghostty/themes/ft-paper` if you use a custom config directory). Set `theme = ft-paper` in your Ghostty configuration, then reload the configuration.

See the [Ghostty theme documentation](https://ghostty.org/docs/features/theme) for details.

## Homebrew

My selection of packages for macOS.

<a href="/artifacts/homebrew/Brewfile" download="Brewfile">Download the Brewfile</a>

With [Homebrew](https://brew.sh/) installed, download the file and install its packages:

```shell
curl --fail --location \
  https://camillehdl.dev/artifacts/homebrew/Brewfile \
  --output Brewfile
brew bundle install --file=./Brewfile
```

`embed:homebrew/Brewfile`
