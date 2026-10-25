import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import fs from 'node:fs';

dotenv.config();

const isCI = !!process.env.CI;
const authFile = '.auth/user.json';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.AMAZON_BASE_URL || 'https://www.amazon.in',
    headless: isCI,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ...( !isCI && fs.existsSync(authFile)
      ? { storageState: authFile }
      : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: isCI ? [
        'auth.setup.ts',
        'session.spec.ts',
        'amazon-checkout.spec.ts',
      ] : [],
    },
  ],
});
