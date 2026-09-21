"use strict"

// Canonical live endpoint; override with GATSBY_GOATCOUNTER_ENDPOINT.
const DEFAULT_ENDPOINT = `https://camillehdl.goatcounter.com/count`

// Off during `gatsby develop` unless the env var is set, to avoid noise in
// the dashboard and loading a third-party script locally.
const goatcounterEndpoint =
  process.env.GATSBY_GOATCOUNTER_ENDPOINT ||
  (process.env.NODE_ENV === `production` ? DEFAULT_ENDPOINT : ``)

module.exports = { DEFAULT_ENDPOINT, goatcounterEndpoint }
