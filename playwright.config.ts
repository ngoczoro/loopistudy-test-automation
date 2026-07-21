import path from 'path';
import dotenv from 'dotenv';
import { defineConfig, devices } from '@playwright/test';

dotenv.config({ path: path.resolve(__dirname, '.env') });

// Keep localhost for Vite (often bound to ::1 only on Windows).
const baseURL = process.env.BASE_URL ?? 'http://localhost:5173';
const isCI = !!process.env.CI;

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * CI defaults: chromium-only, 1 worker, 2 retries, longer timeouts.
 * Local: all configured browsers unless PLAYWRIGHT_PROJECT overrides.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  timeout: isCI ? 90_000 : 60_000,
  expect: {
    timeout: isCI ? 15_000 : 10_000,
  },
  reporter: isCI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: isCI ? 20_000 : 15_000,
    navigationTimeout: isCI ? 30_000 : 20_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Extra browsers are local/manual (`npm run test:auth:all`). CI stays chromium-only.
    ...(!isCI
      ? [
          {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
          },
          {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
          },
        ]
      : []),
  ],
});
