import { defineConfig } from "@playwright/test";

/**
 * E2E runs against the real production build served by `astro preview`.
 * Set PLAYWRIGHT_CHROME_PATH to use a local Chrome instead of Playwright's
 * downloaded browser (useful in sandboxes/CI images that ship Chrome).
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  use: {
    baseURL: "http://127.0.0.1:4173",
    launchOptions: process.env.PLAYWRIGHT_CHROME_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROME_PATH, args: ["--no-sandbox"] }
      : {},
  },
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --host 127.0.0.1",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 300_000,
  },
});
