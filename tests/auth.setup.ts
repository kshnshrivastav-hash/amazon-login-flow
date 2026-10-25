import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const authFile = '.auth/user.json';

setup('Amazon login and save storage state', async ({ page }) => {
  await page.goto('/');

  const continueShopping = page.getByRole('button', {
    name: /continue shopping/i,
  });

  if (await continueShopping.isVisible().catch(() => false)) {
    await continueShopping.click();
    await page.waitForLoadState('domcontentloaded').catch(() => {});
  }

  const accountLink = page.getByRole('link', { name: /account & lists/i });
  await expect(accountLink).toBeVisible({ timeout: 15000 });
  await accountLink.click();
  await expect(page).toHaveURL(/\/ap\/signin/);

  const emailInput = page.getByLabel(/mobile number or email/i);
  await expect(emailInput).toBeVisible();
  await emailInput.fill(process.env.AMAZON_EMAIL!);
  await page.getByRole('button', { name: 'Continue' }).click();

  const enterPassword = page.getByRole('button', {
    name: /enter your password/i,
  }).or(page.getByRole('link', {
    name: /enter your password/i,
  }));

  if (await enterPassword.isVisible().catch(() => false)) {
    await enterPassword.click();
  }

  const passwordInput = page.locator('input#ap_password');
  try {
    await expect(passwordInput).toBeVisible({ timeout: 15000 });
  } catch (error) {
    const diagnostics = await page.evaluate(() => ({
      url: location.href,
      title: document.title,
      headings: Array.from(document.querySelectorAll('h1, h2'))
        .map(el => el.textContent?.trim())
        .filter(Boolean),
      buttons: Array.from(document.querySelectorAll('button'))
        .map(el => el.innerText.trim())
        .filter(Boolean)
        .slice(0, 25),
      passwordInputs: Array.from(
        document.querySelectorAll<HTMLInputElement>('input[type="password"]')
      ).map(el => ({
        id: el.id,
        name: el.getAttribute('name'),
        visible: el.getClientRects().length > 0,
      })),
    }));
    console.error('AMAZON LOGIN PAGE DIAGNOSTICS:', JSON.stringify(diagnostics));
    throw error;
  }

  await passwordInput.fill(process.env.AMAZON_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(
    accountLink,
    'Amazon login did not return to a page with the Account & Lists link. Check for verification or another sign-in prompt.',
  ).toBeVisible({ timeout: 30000 });

  await expect(accountLink).not.toContainText(/sign in/i);

  await page.context().storageState({ path: authFile });
});
