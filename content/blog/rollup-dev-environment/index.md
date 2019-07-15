---
title: Rollup-based development environment
date: "2019-03-22T20:00:00.000Z"
description: How to setup Rollup, code-splitting, dynamic imports, and Service Workers.
---

This 3-parts series I've written on medium describes how I setup a JavaScript development environment based on [Rollup](https://rollupjs.org/).

The code explained in the articles is hosted in [this repo](https://github.com/camille-hdl/rollup-react-example) and can be used as a boilerplate.

* [The first part](
https://medium.com/@camille_hdl/rollup-based-dev-environment-for-javascript-part-1-eab8523c8ee6) covers the bundler (Rollup), compiler (Babel), type checker (Flow) and HTTP server (serve).
* [The second part](https://medium.com/@camille_hdl/rollup-based-dev-environment-for-javascript-part-2-service-workers-3892e36c4415) sets up a simple Service Worker capable of precaching our application.
* [The third and last part](https://medium.com/@camille_hdl/rollup-based-dev-environment-for-javascript-part-3-testing-ci-cd-5e31ca5fa4d5) focuses on testing (jest and cypress), continuous integration and deployment.