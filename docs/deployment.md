# Deployment

Netlify still serves `camillehdl.dev`. Each push to `master` also deploys the
site to the Cloudflare Worker `camillehdl-blog`, on
<https://camillehdl-blog.camilleh.workers.dev>, until the domain moves to
Cloudflare.

## Cloudflare Worker

- `wrangler.jsonc` describes an assets-only Worker: no server code, only the
  files in `public/`. It has no route and no custom domain.
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
- The Worker does not send `Strict-Transport-Security`; Netlify does. Add it
  when the domain moves.
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
