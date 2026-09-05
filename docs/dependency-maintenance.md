# Dependency maintenance — 2026-09-05

## Changes

- Updated Gatsby to 5.16.1 and its plugins to their current stable releases.
- Updated the Bluesky SDK to 0.20.42, Sharp to 0.35.4, Prism to 1.30.0,
  and the remaining direct dependencies to their latest compatible releases.
- Require Node 24.20.0 or a newer Node 24 patch. `.node-version` selects
  24.20.0 for local development and Netlify.
- Updated React and React DOM to 19.2.8. Gatsby 5.16 supports React 19 and
  Node 24 ([release notes](https://www.gatsbyjs.com/docs/reference/release-notes/v5.16/)).
- Replaced `gatsby-plugin-typography` and `react-typography` with a small
  Gatsby SSR hook. It emits the same CSS from the existing Typography theme,
  in the same position before page styles; fonts and theme settings are unchanged.
- Removed the unused `npm` and `gatsby-plugin-react-helmet` dependencies;
  moved Prettier to development dependencies.
- Regenerated `package-lock.json` with npm 11, using lockfile format 3.

## Security results

Results from `npm audit`, including dependencies used by the build tools:

| Severity | Before | After |
| --- | ---: | ---: |
| Critical | 4 | 0 |
| High | 78 | 0 |
| Moderate | 35 | 0 |
| Low | 13 | 0 |
| Total affected packages | 130 | 0 |

The first security pass left 32 moderate findings from three advisories;
this update also resolves those. These counts describe affected packages,
including build tools, in the npm advisory database at the time of the check.

## Why the overrides exist

Gatsby and some of its dependencies constrain versions below the security
fixes. Keep the overrides in `package.json` until the parent packages accept
patched releases. Recheck both development and production builds when removing
an override or updating these dependencies again.

| Override | Purpose |
| --- | --- |
| `sharp` → the direct dependency | Replace every Gatsby copy of Sharp, including manifest and image processing, with 0.35.4 and libvips 8.18.6. [Security advisory](https://github.com/advisories/GHSA-f88m-g3jw-g9cj). |
| Relay compiler's `immutable` → 4.3.9+ | Fix prototype pollution and denial of service in the legacy Immutable dependency. |
| `lodash@~4.17.0` → 4.18.1+ | Update GraphQL code generator copies past the template injection and prototype pollution fixes. |
| `path-to-regexp@0.1.12` → 0.1.13 | Apply the routing regular expression denial of service fix while retaining the 0.1 API. |
| `qs@~6.15.1` → 6.16.0+ | Apply query parsing denial of service fixes to Express's pinned copies. |
| `serialize-javascript` → 7.1.1+ | Fix unsafe serialization and CPU exhaustion in the CSS minimizer's dependency. |
| Gatsby's `webpack` → 5.110.3+ | Apply the buildHttp URL allow-list fixes. |
| Gatsby's `cookie` → 0.7.2+ | Validate cookie names, paths and domains. |
| Gatsby's `uuid` → 11.1.1+ | Apply buffer bounds checks while retaining a CommonJS-compatible release. |
| `tmp` → 0.2.7+ | Fix temporary-file path traversal, including the CLI editor's older copy. |

## Compatibility adaptations

The final three advisories required upgrading consumers together with their
dependencies:

| Dependency | Resolution |
| --- | --- |
| Parcel | Align Gatsby's Parcel core and plugin suite on 2.16.4, fixing [development-server origin validation](https://github.com/advisories/GHSA-qm9p-f9j5-w83w). A test compiles a real TypeScript Gatsby configuration with the upgraded suite. |
| `decode-uri-component` | Upgrade to 0.5.0, fixing [malformed-input decoding](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr). Patch `query-string@6.14.1` to read its ES module default export. |
| `file-type` | Upgrade to 22.0.2, fixing [malformed ASF parsing](https://github.com/advisories/GHSA-5v7r-6r5c-r473). Patch Gatsby's filesystem and remote-file utilities to call `fileTypeFromBuffer` and `fileTypeFromFile`. |

The three small patches live in `patches/` and are applied automatically by
`postinstall`. `patch-package --error-on-fail` stops installation if a patch
cannot be applied. Keep Node 24: the adaptations rely on its support for
requiring these ES modules from CommonJS. Tests exercise the actual Gatsby
image utilities and query-string consumer, including a local HTTP download.

The `lmdb` override retains Gatsby's existing 2.5.3 across the upgraded Parcel
suite. The 2.8.5 and 2.9.4 native bindings crashed during local Node 24/macOS
validation; 2.5.3 passed the configuration compilation and clean site build.
Revalidate both before changing this pin.

## Rendering preservation

Browser testing exposed invalid document metadata inside the page body,
which caused React hydration errors even in the pre-upgrade build. Each page
now exports Gatsby's `Head` API for the existing SEO component. The description
uses the actual page description instead of the old literal `tesT` placeholder.
A CSS margin-containment rule preserves the existing page-heading positions.
The small biography avatar loads eagerly to remain visible after hydration.

Visual references were captured from the React 18 production build before
these changes. Ten full-page screenshots cover the homepage, links page and
articles with comments, images and code, at desktop and mobile sizes. All
comparisons pass with `maxDiffPixels: 0`; the generated Typography CSS also
matches the original text exactly.

## Validation

- A fresh `npm ci` succeeded under Node 24.20.0 and applied all three patches.
- All four dependency compatibility tests passed after that fresh install.
- A clean production build succeeded and generated all 47 pages.
- 144 HTTP checks passed for pages and referenced assets. The homepage has
  40 articles, the RSS feed 43 items, and the manifest eight icons; the service
  worker and sitemap are available.
- All 14 Chromium tests passed: ten visual comparisons, plus client navigation,
  comment expansion and comment request failures on desktop and mobile.
  Tested pages had no uncaught browser errors.
- The development server compiled successfully; its GraphQL endpoint returned
  43 Markdown records, and all four navigation/comment tests also passed there.
- `npm audit` reports zero vulnerabilities, including build dependencies.
- `npm outdated` reports no outdated direct dependencies, and
  `npm ls --depth=0` succeeds.

The browser tests mock Bluesky responses for stable screenshots and repeatable
success/failure cases. They do not establish live Bluesky availability. Service
workers are blocked during those tests; offline behavior is not covered.
Screenshot references use macOS and the Chromium shipped with the pinned
Playwright 1.63.0. Other operating systems can render fonts differently.
Do not regenerate references merely to make an upgrade pass.

Gatsby still carries old React peer declarations in its bundled reach-router
and experimental react-server-dom-webpack packages. Installation emits peer
warnings despite Gatsby's documented React 19 support; the tested navigation
and rendering work. `npm ls --all` exits nonzero for those peers and also labels
some semver-compatible transitive edges invalid in this overridden tree.
The direct tree, clean install, compatibility tests and builds pass.

Gatsby's build logs include an upstream `punycode` deprecation warning, which
its worker logger labels `ERROR UNKNOWN`; the final build still exits 0.

To repeat the checks with the Node version in `.node-version`:

```sh
npm ci
npm test
npm run clean
npm run build
npx playwright install chromium
npm run test:browser
npm audit
npm outdated
```

The browser test command starts a production server on port 9000. To use an
existing server, set `SITE_URL`, for example `http://127.0.0.1:9019`.

In a restricted agent environment, use a writable temporary npm cache and
`XDG_CONFIG_HOME`, and set `GATSBY_TELEMETRY_DISABLED=1` and
`GATSBY_FEEDBACK_DISABLED=1` to avoid writes to the user's Gatsby preferences.
If local file-watcher limits are reached during development, set
`WATCHPACK_POLLING=1000` and `CHOKIDAR_USEPOLLING=1`.
