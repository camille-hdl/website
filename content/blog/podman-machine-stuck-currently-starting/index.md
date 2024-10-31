---
title: How to fix podman machine stuck on "Currently starting"
date: "2024-05-10T09:00:00.000Z"
---

If `podman machine list` (or Podman Desktop) shows your machine "Currently starting" but it never actually starts, this might help you.

For MacOS: 
Find the file `~/.config/containers/podman/machine/applehv/<your podman machine name>.json` (in my case, `~/.config/containers/podman/machine/applehv/podman-machine-default.json`) and edit it.  

For Windows:
Find the file `%UserProfile%\.config\containers\podman\machine\wsl\<your podman machine name>.json` (by default this is `%UserProfile%\.config\containers\podman\machine\wsl\podman-machine-default.json`)

Near the end of the file, change `"Starting":true` to `"Starting":false`.

The machine should now start as expected.


- https://github.com/containers/podman/issues/16945
