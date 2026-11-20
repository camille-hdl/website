# Deployment

The Cloudflare Worker `camillehdl-blog` serves `camillehdl.dev`. Each push to
`master` deploys it from GitHub Actions. Netlify no longer serves
`camillehdl.dev` or `www.camillehdl.dev`, and it still builds a deploy preview
for each pull request.

## Domain and DNS

The `camillehdl.dev` zone is on Cloudflare, with the name servers
`kehlani.ns.cloudflare.com` and `rocky.ns.cloudflare.com`.

| Hostname             | DNS record                       | What answers                                              |
| -------------------- | -------------------------------- | --------------------------------------------------------- |
| `camillehdl.dev`     | `AAAA 100::`, proxied, read-only | The Worker `camillehdl-blog`, attached as a Custom Domain |
| `www.camillehdl.dev` | `A 192.0.2.1`, proxied           | A Page Rule that redirects to the apex                    |

The Custom Domain is attached in Cloudflare, not in `wrangler.jsonc`, and
Cloudflare created its DNS record. A `wrangler deploy` run after the
attachment left the domain in place.

The Page Rule matches `www.camillehdl.dev/*` and forwards to
`https://camillehdl.dev/$1` with a 301. It keeps the path and the query string:
`https://www.camillehdl.dev/rss.xml?x=1` redirects to
`https://camillehdl.dev/rss.xml?x=1`. The address `192.0.2.1` is a placeholder.
A Page Rule runs only on a proxied record, and no request reaches that
address. Cloudflare recommends Single Redirects over Page Rules for new rules.
To move this rule to a Single Redirect, use an API token with the
**Single Redirect** edit permission.

The Universal SSL certificate covers `camillehdl.dev` and `*.camillehdl.dev`,
so it also covers `www`.

## HSTS

Cloudflare adds `Strict-Transport-Security: max-age=31536000` from the zone
setting **SSL/TLS > Edge Certificates > HTTP Strict Transport Security**.
Its `includeSubDomains`, `preload`, and `nosniff` options are off. The Worker
does not send the header. A response from
<https://camillehdl-blog.camilleh.workers.dev> has none. The 301 from
`www.camillehdl.dev` carries the same header.

`X-Content-Type-Options: nosniff` comes from `public/_headers`, not from this
setting.

## Cloudflare Worker

- `wrangler.jsonc` describes an assets-only Worker: no server code, only the
  files in `public/`. It declares no route and no custom domain. The Worker
  also answers on <https://camillehdl-blog.camilleh.workers.dev>.
- `public/_redirects` and `public/_headers` come from `gatsby-plugin-netlify`.
  Workers Static Assets reads the same format.
- `.github/workflows/deploy-cloudflare.yml` runs on each push to `master`, or
  when run by hand on `master`. Pull requests never deploy. It has two jobs:
  - `build` installs the project, tests, builds and checks the rule limits,
    without any secret, then uploads `public/` as an artifact;
  - `deploy` installs only Wrangler, from `deploy/package-lock.json` and
    without install scripts, downloads `public/` and deploys. It alone reads
    the `CLOUDFLARE_API_TOKEN` secret and the `CLOUDFLARE_ACCOUNT_ID`
    variable, so the dependencies of the site never run next to the token.
- `deploy/package.json` pins Wrangler. Update it there: the site itself does
  not depend on Wrangler.

## Netlify

The Netlify site `camillehdl` builds a deploy preview for each pull request,
at `https://deploy-preview-<number>--camillehdl.netlify.app`. `netlify.toml`
configures that build with `@netlify/plugin-gatsby`. Neither `camillehdl.dev`
nor `www.camillehdl.dev` points to Netlify. `camillehdl.netlify.app` still
answers, but it is not the production site.

Other hostnames in the zone still point to other Netlify sites, outside this
repository: `squishy2x`, `cuisine-ead`, and `ddtools` are DNS-only `CNAME`
records to `*.netlify.app`.

Netlify posts commit statuses on pull requests only. It posted none on
`master`, before or after the move to Cloudflare, so GitHub does not show
whether Netlify still builds `master`. The Netlify dashboard shows it.

## Rule limits

Cloudflare applies at most 100 `_headers` rules, 2,000 static redirects and
100 dynamic redirects. A `_headers` line holds at most 2,000 characters, a
redirect 1,000, and static redirects must come before dynamic ones.
`gatsby-plugin-netlify` writes one header rule per hashed file, so the count
grows with the number of JavaScript chunks and fonts.
`scripts/check-cloudflare-rules.mjs` fails the build when `public/_headers` or
`public/_redirects` is missing or breaks one of these rules; run it after
`npm run build`.

## Known differences from Netlify

- Paths without a trailing slash redirect with 307, not 301.
- `/index.html` redirects to `/` instead of serving the page.
- `Content-Type` of HTML pages has no `charset`; each page declares
  `<meta charSet="utf-8">`.

## Deploying by hand

```sh
npm ci
npm run build
node scripts/check-cloudflare-rules.mjs
npm ci --prefix deploy --ignore-scripts
cd deploy
CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=… npm exec --no -- wrangler deploy --config ../wrangler.jsonc
```

Read the token from a local file rather than typing it on the command line.
