---
title: Initiative Rocks!
date: "2019-04-30T21:00:00.000Z"
description: Combat tracker for D&D. Also "front-end kata".
---

[Initiative Rocks!](https://initiative.rocks/) is a simple combat tracker for D&D.


As I looked for an excuse to play with tech I didn't have the chance to work with yet (such as [workbox](https://developers.google.com/web/tools/workbox/)), I decided to do something less boring than a to-do list, and got inspired by [my recent svelte adventure](https://svelte.dev/repl/87ed34ec2adee623421bcdc442f16a59?version=3.0.1).  
Thus, D&D.

[repo](https://github.com/camille-hdl/initiative-rocks)

## Features

* works offline
* can be installed locally on compatible platforms (such as iOS, Android, Chrome...)
* mobile-friendly

## Challenges

* Persisting state in PWAs is surprisingly not straightforward yet. I use [localforage](https://www.npmjs.com/package/localforage) to save and restore state, but this approach implies that state is shared across windows.
* I've found focus management on iOS with React hooks rather uncooperative.