---
title: Using ES modules w/ dynamic imports, with a fallback
date: "2018-07-19T16:00:00.000Z"
description: Dynamically import ES modules where possible, use SystemJS elsewhere.
---

Using ES modules with dynamic imports can still be a mine field due to [somewhat ambiguous](https://github.com/whatwg/html/issues/1442) `<script type="module">` semantics.

[In this medium post](https://medium.com/@camille_hdl/dynamic-import-of-es6-modules-with-fallback-to-systemjs-c72b30b8225e), I explain a way to load ES modules when possible or fallback to SystemJS.