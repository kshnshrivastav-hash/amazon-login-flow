import { test, expect } from '@playwright/test';

test('Playwright CI smoke test', async ({ page }) => {
  const response = await page.goto('https://example.com', {
    waitUntil: 'domcontentloaded',
  });

  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/Example Domain/);
  await expect(
    page.getByText(/This domain is for use in documentation examples/)
  ).toBeVisible();
});
