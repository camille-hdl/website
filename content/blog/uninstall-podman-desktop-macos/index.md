---
title: How to uninstall Podman Desktop on macos
date: "2024-05-07T12:00:00.000Z"
image: thumbnail.jpg
---

After an update, my podman machine stopped working and I didn't manage to fix it without a full reinstall.  

As far as I know, there is no included uninstall procedure, so after some googling, here is what worked:

```shell

podman machine list

# Repeat the next 2 lines for every podman machine you have
podman machine stop podman-machine-default
podman machine rm podman-machine-default

sudo /opt/podman/bin/podman-mac-helper uninstall
sudo rm /etc/paths.d/podman-pkg
sudo rm -rfv /opt/podman
sudo rm /var/run/docker.sock
rm -fr ~/.local/share/containers/podman
rm -fr ~/.local/share/containers/podman-desktop
```

Then, remove the Podman Desktop app with a tool like [AppCleaner](https://freemacsoft.net/appcleaner/).
