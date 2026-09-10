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

## Herdr: ft-paper

A matching light interface for [Herdr](https://herdr.dev/), the terminal workspace manager. Its sidebar, tab bar and popups otherwise stay dark on the paper background.

<a href="/artifacts/herdr/ft-paper.toml" download="ft-paper.toml">Download the ft-paper theme for Herdr</a>

Herdr has no theme files: it reads a built-in theme name plus token overrides from its configuration. Paste these sections into `~/.config/herdr/config.toml`, merging the `[ui]` key into that section if you already have one, then reload with `herdr server reload-config`.

The `terminal` base theme takes the pane background and the ANSI palette from the host terminal, so pair this with the Ghostty theme above.

## btop: ft-paper

A matching theme for [btop](https://github.com/aristocratos/btop), the resource monitor. It ships a good number of light themes, but none on this palette, and its default one washes out on the paper background.

<a href="/artifacts/btop/ft-paper.theme" download="ft-paper.theme">Download the ft-paper theme for btop</a>

Save it as `~/.config/btop/themes/ft-paper.theme`, then set `color_theme = "ft-paper"` in `~/.config/btop/btop.conf` — or pick it from Options with `Esc`, since btop rewrites its configuration when it exits.

Every color rendered as text or as graph glyphs clears a 4.5:1 contrast ratio on the paper background, apart from the deliberately faint free-memory meter and inactive text.

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
