const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './',
  testMatch: ['e2e-integration-test-fixed.js'],
  timeout: 30000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...require('@playwright/test').devices['Desktop Chrome'] },
    },
  ],
});
