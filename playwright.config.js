const { defineConfig } = require("@playwright/test")

module.exports = defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  workers: 2,
  use: {
    baseURL: process.env.SITE_URL || "http://127.0.0.1:9000",
    serviceWorkers: "block",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1280, height: 900 } } },
    {
      name: "mobile",
      use: {
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: process.env.SITE_URL
    ? undefined
    : {
        command: "npm run serve -- --host 127.0.0.1 --port 9000",
        url: "http://127.0.0.1:9000",
      },
})
