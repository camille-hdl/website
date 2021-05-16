---
title: Install the latest version of many npm dependencies at once
date: "2021-04-17T02:00:00.000Z"
description: Shell + awk snippet
---

I couldn't find a `npm` command to update a subset of my npm dependencies to their latest version at once, based on a pattern, so here's a one-liner to do it with pipes and `awk` (to be modified for your needs).  

In this case, I want to update all the dependencies containing the string "babel".

```shell 
npm outdated |awk 'BEGIN{OFS="@"} $1 ~ /babel/ { print $1, "latest" }'| xargs npm install
```

# Explanation of each command

`npm outdated` lists your outdated dependencies.  

`awk`:  

* `BEGIN{OFS="@"}` sets `@` as the output field separator (will be used by `print`)
* `$1 ~ /babel/` will select the lines containing "babel" in their first column
* `{ print $1, "latest" }` will output each selected lines concatenated with "latest" (using "@" as the `OFS`)

`xargs npm install` will give the output of `awk` as input arguments to `npm install`, like so : `npm install dependency1@latest dependency2@latest ...`
