import { test, expect } from '@playwright/test';

test('session is reused without logging in again', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: /account & lists/i })).not.toContainText(/sign in/i);
});
