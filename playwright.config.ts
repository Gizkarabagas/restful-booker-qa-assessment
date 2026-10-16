import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

const testDir = defineBddConfig({
  features: 'features/**/*.feature',
  steps: ['steps/**/*.ts', 'fixtures/fixture.ts'],
});

export default defineConfig({
  testDir,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // Single worker avoids race conditions on the shared demo sandbox
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'results/results.xml' }], // Ready for Jira Xray execution import
  ],
  use: {
    baseURL: 'https://automationintesting.online',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
