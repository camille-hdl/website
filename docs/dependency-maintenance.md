# Dependency maintenance — 2026-09-05

## Changes

- Updated Gatsby to 5.16.1 and its plugins to their current stable releases.
- Updated the Bluesky SDK to 0.20.42, Sharp to 0.35.4, Prism to 1.30.0,
  and the remaining direct dependencies to their latest compatible releases.
- Require Node 24.20.0 or a newer Node 24 patch. `.node-version` selects
  24.20.0 for local development and Netlify.
- Keep React and React DOM on 18.3.1: `react-typography@0.16.23` declares
  support through React 18. Gatsby 5.16 supports both React 18 and Node 24
  ([release notes](https://www.gatsbyjs.com/docs/reference/release-notes/v5.16/)).
- Removed the unused `npm` and `gatsby-plugin-react-helmet` dependencies;
  moved Prettier to development dependencies.
- Regenerated `package-lock.json` with npm 11, using lockfile format 3.

## Security results

Results from `npm audit`, including dependencies used by the build tools:

| Severity | Before | After |
| --- | ---: | ---: |
| Critical | 4 | 0 |
| High | 78 | 0 |
| Moderate | 35 | 32 |
| Low | 13 | 0 |
| Total affected packages | 130 | 32 |

The 32 remaining affected packages trace back to three distinct advisories.
These counts include parent packages affected through their dependencies;
they are not counts of independently exploitable vulnerabilities on the site.

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

## Remaining moderate advisories

| Dependency | Advisory and next step |
| --- | --- |
| `@parcel/reporter-dev-server@2.8.3` | [Origin validation](https://github.com/advisories/GHSA-qm9p-f9j5-w83w), fixed in 2.16.4. Gatsby pins Parcel core and its plugin suite to 2.8.3. Upgrade that suite together and validate Gatsby's configuration compilation; replacing only this reporter mixes incompatible Parcel engine versions. |
| `decode-uri-component@0.2.2` | [Malformed-input decoding denial of service](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), fixed in 0.5.0. Gatsby and `gatsby-remark-images` use `query-string@6`, which calls a CommonJS function export; the patched decoder is an ES module. Upgrade/adapt the callers together. |
| `file-type@16.5.4` | [Malformed ASF parsing infinite loop](https://github.com/advisories/GHSA-5v7r-6r5c-r473), fixed in 21.3.1. Gatsby's filesystem and remote-file utilities call `fromBuffer` and `fromFile`; newer versions rename these exports and use ES modules. Update/adapt those consumers before replacing the dependency. |

The site is generated statically. The Parcel alert concerns development
tooling; the file parser concerns build inputs. Keep development servers on
localhost and review downloaded build inputs. These exposure limits do not
remove the advisories. `npm audit fix --force` proposes obsolete Gatsby/plugin
versions for this tree and is not a suitable resolution.

## Validation

- A fresh `npm ci` succeeded under Node 24.20.0.
- `npm run clean` followed by `npm run build` exited successfully, generating
  all 47 pages and processing the images with the updated Sharp.
- 141 HTTP checks passed against the production output, covering pages and
  referenced assets. The homepage contains 40 articles, the RSS feed 43 items,
  and the manifest eight icons; the service worker and sitemap are available.
- The Bluesky SDK's record and thread type guards used by the comments
  component passed a smoke check.
- The development server compiled successfully and passed HTTP and GraphQL
  checks (43 Markdown records). Validation used `WATCHPACK_POLLING=1000` and
  `CHOKIDAR_USEPOLLING=1` after the local file-watcher limit was reached.
- `npm audit --audit-level=high` exited 0.
- `npm ls --depth=0` reports a valid direct dependency tree. `npm outdated`
  lists only React and React DOM, held on 18 for the typography peer dependency.
- Browser rendering and interaction could not be checked: no connected browser
  was available. The existing `npm test` script is a placeholder, not a test suite.

Gatsby's build logs include an upstream `punycode` deprecation warning, which
its worker logger labels `ERROR UNKNOWN`; the final build still exits 0.

To repeat the checks after installing the Node version in `.node-version`:

```sh
npm ci
npm run clean
npm run build
npm audit --audit-level=high
```

In a restricted agent environment, use a writable temporary npm cache and
`XDG_CONFIG_HOME`, and set `GATSBY_TELEMETRY_DISABLED=1` and
`GATSBY_FEEDBACK_DISABLED=1` to avoid writes to the user's Gatsby preferences.
