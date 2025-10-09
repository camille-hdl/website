---
title: Ship modern JavaScript with Rollup
date: "2020-04-07T08:10:00.000Z"
description: preset-modules, module/nomodule pattern and other techniques to ship modern syntax to evergreen browsers while supporting IE11 with a legacy build.
---
<section class="warning">
<p>
    This article is now (thankfully) out-of-date.<br>
    If you are using babel 8, you can safely use <code>@babel/preset-env</code> configured with <code>assumptions</code> and <code>bugfixes: true</code>. You don't need <code>preset-modules</code> anymore.<br>
    Moreover, unless you wish to support IE11, you don't need the systemjs fallback.<br>
    See:<br>
    <ul>
        <li><a href="https://babeljs.io/docs/assumptions#migrating-from-babelpreset-envs-loose-and-spec-modes" rel="noopener noreferrer" target="_blank">https://babeljs.io/docs/assumptions#migrating-from-babelpreset-envs-loose-and-spec-modes</a></li>
        <li><a href="https://babeljs.io/docs/babel-preset-env" rel="noopener noreferrer" target="_blank">https://babeljs.io/docs/babel-preset-env</a></li>
    </ul>
</p>
</section>

Using ES2017 (and newer) syntax in our codebase is one thing, sending it to our users is another.  

Chances are, if we have to support IE11 and/or use `@babel/preset-env` and/or ship a single bundle (even with code-splitting), we're probably sending ES5 to everybody, even if their browser is perfectly capable of understanding [classes](https://caniuse.com/#feat=es6-class) or [async/await](https://caniuse.com/#feat=mdn-javascript_operators_await).  

This is suboptimal, because **we're sending more code than needed** and, long term, **we'll miss out on some "free" performance gains**.

You can read more about the peformance of ES6 features compared to their ES5 transpiled versions on the [Six Speed project](http://incaseofstairs.com/six-speed/). The status quo isn't set in stone, as browser vendors regularly improve the performance of new syntax (see [this](https://v8.dev/blog/high-performance-es2015) and [this](https://v8.dev/blog/spread-elements)).


Moreover, even if all our `preset-env` targets are up-to-date, Babel [may still be transpiling some syntax because of edge-cases](https://podcast.babeljs.io/preset-env/). Besides, our dependencies are probably transpiled to ES5 anyway.

A better thing to do would be to **ship transpiled ES5 to legacy browsers** and **as much ES2017 as possible to modern browsers**.  

The steps we need to take to achieve this are:

1. create 2 distinct bundles
    1. use `preset-modules` instead of `preset-env` for our modern build,
    2. configure terser to output ES2017
3. load each bundle in the correct browsers.

You can see a working example [in this repo](https://github.com/camille-hdl/rollup-react-example).

## Bundling

If you're using Rollup, you can already output ES modules or a fallback out-of-the-box.  
To create each build with a different config however, we have to add a bit of configuration.  

One way to do this could be to use an environment variable `ROLLUP_BUILD_TYPE`, in npm scripts.

### Rollup and Terser configuration

```js
// package.json
{
    /** ... **/
    "scripts": {
        "build": "npm-run-all --parallel \"build:*\"",
        "build:legacy": "env ROLLUP_BUILD_TYPE=\"legacy\" rollup -c",
        "build:modern": "env ROLLUP_BUILD_TYPE=\"modern\" rollup -c"
    },
    "devDependencies" : {
        "npm-run-all": "...",
        "rollup": "..."
    }
    /** ... **/
}
```

```js
// rollup.config.js
export default () => {
    const buildType = typeof process.env.ROLLUP_BUILD_TYPE !== "undefined" ? process.env.ROLLUP_BUILD_TYPE : "modern";
    return {
        input: ["./src/index.jsx"],
        output: buildType === "modern" ?
        {
            dir: `/public/js/system/`,
            format: "system"
        } :
        {
            dir: `/public/js/esm/`,
            format: "esm"
        },
        plugins: [
            /** ... **/
            babel({
                /**
                * Uncomment to ignore node_modules. This will accelerate yur build,
                * but prevent you from using modern syntax in your dependencies
                */
                // exclude: "node_modules/**"
            }),
            terser({
                compress: {
                    unused: false,
                    collapse_vars: false
                },
                sourcemap: true,
                ecma: buildType === "legacy" ? 5 : 2017,
                safari10: true,
            })
            /** ... **/
        ]
    };
};
```
Notice how **we didn't exclude node_modules/** from Babel. This will let us optimally transpile our dependencies if they export modern syntax. More on that later.

[Terser](https://github.com/terser/terser) is a minifier which needs to be told which version of the language we are using. 

### Babel configuration

Babel 7 can be configured with a function instead of a static object. We can take advantage of this feature in order to write conditional and annotated code.

Remember that our goal is to transpile as little as possible. In this example, I include a preset for react as well as plugins for [ES2020 features](https://tc39.es/ecma262/2020/), that will still be used for a while even in modern browsers.

```js
// in babel.config.cjs
module.exports = function(api) {
    api.cache.invalidate(() => [
        process.env.NODE_ENV, 
        process.env.ROLLUP_BUILD_TYPE
    ].join("-"));
    const environment = api.env();
    const modern = process.env.ROLLUP_BUILD_TYPE === "modern";
    /**
     * Will be used for the legacy build
     */
    const presetEnv = [
        "@babel/preset-env",
        {
            modules: false,
            targets: {
                browsers: [">0.25%", "not op_mini all"],
            },
        },
    ];
    /**
     * Will be used for the modern build
     */
    const presetModule = [
        "@babel/preset-modules",
        {
            loose: true,
        },
    ];
    const alwaysUsedPresets = ["@babel/preset-react"];

    const alwaysUsedPlugins = [
        "@babel/plugin-syntax-dynamic-import",
        "@babel/plugin-proposal-optional-chaining",
        "@babel/plugin-proposal-nullish-coalescing-operator",
    ];
    /**
     * Only loaded in the legacy build
     */
    const legacyPlugins = [
        "@babel/plugin-proposal-object-rest-spread"
    ];

    const productionConfig =
        modern === "modern"
            ? {
                  /**
                   * Modern build
                   */
                  presets: [
                      presetModule, 
                      ...alwaysUsedPresets
                    ],
                  plugins: [...alwaysUsedPlugins],
              }
            : {
                  /**
                   * Legacy build
                   */
                  presets: [
                      presetEnv,
                      ...alwaysUsedPresets
                    ],
                  plugins: [
                      ...alwaysUsedPlugins,
                      ...legacyPlugins
                    ],
              };

    const developmentConfig =
        modern === "modern"
            ? {
                  /**
                   * Modern build
                   */
                  presets: [
                      presetModule,
                      ...alwaysUsedPresets
                    ],
                  plugins: [
                      ...alwaysUsedPlugins
                    ],
              }
            : {
                  /**
                   * Legacy build
                   */
                  presets: [
                      presetEnv, 
                      ...alwaysUsedPresets
                    ],
                  plugins: [
                      ...alwaysUsedPlugins, 
                      ...legacyPlugins
                      ],
              };
    return {
        env: {
            production: productionConfig,
            development: developmentConfig,
            test: {
                /**
                 * Chances are tests will run in node
                **/
                presets: [
                    "@babel/preset-env",
                    ...alwaysUsedPresets
                ],
                plugins: [
                    ...alwaysUsedPlugins, 
                    ...legacyPlugins
                ],
            },
        },
    };
};
```
We didn't use the .mjs alternative because it only works when babel is loaded asynchonously.  

`preset-modules` will transpile less code than `preset-env`. Read [the documentation](https://github.com/babel/preset-modules) to understand why.

Now that we have our bundles, we need a way to load them in their targets.

## The module/nomodule pattern

This technique (from [2017](https://philipwalton.com/articles/deploying-es2015-code-in-production-today/)) utilizes `<script type="module">` support as a breakpoint between legacy browsers (mostly IE nowadays) and "evergreen" browsers (Chrome, Firefox, Safari, Edge, ...).  
This gives us a way to send a modern bundle to modern browsers, and a legacy bundle to old browsers.  

For a long time, things weren't as simple as [some browsers did support modules, but didn't support `import()`](/dynamic-import-esm-fallback). This has now been delt wih though, and `<script type="module">` can be safely used.

The pattern:
```html
<script type="module">
import("/js/esm/main.js").then((module) => {
    /** ... **/
});
</script>
<script nomodule src="/js/legacy/main.js"></script>
```

## The future

While this post talks about ES2017, the techniques explained here can be updated later to use newer versions of the language, as long as browser support keeps up.  
One important limitation to note is that most third-party libraries still [don't export untranspiled code](https://podcast.babeljs.io/dependencies/). Unfortunately, this means the majority of the code you ship will still be ES5 for now.  
However, if you stop excluding node_modules/ from your Babel config, and more people do the same, things might improve soon enough.