import { defineConfig } from '@playwright/test'

/**
 * Phone Easy play-through. Serves the production build (`vite preview` / dist).
 * Not part of `npm test`. Install the browser once: npx playwright install chromium
 */
export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 12_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    viewport: { width: 375, height: 667 },
    isMobile: true,
    hasTouch: true,
    serviceWorkers: 'block',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
