---
title: Artifacts
date: "2026-09-09T00:00:00.000Z"
description: Configuration files and tools I use, ready to download and reuse.
---

Configuration files from [my setup](/uses/), ready to download and reuse.

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
