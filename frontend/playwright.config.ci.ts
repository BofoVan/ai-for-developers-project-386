import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  globalSetup: './e2e/globalSetup.ts',
  globalTeardown: './e2e/globalTeardown.ts',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'cd ../backend && npm start',
      url: 'http://localhost:4010/api/event-types',
      timeout: 120_000,
      reuseExistingServer: false,
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173',
      timeout: 120_000,
      reuseExistingServer: false,
    },
  ],
});
