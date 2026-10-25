import { test as setup, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const authFile = '.auth/user.json';

setup('Amazon login and save storage state', async ({ page }) => {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('WebAuthn.enable');
  await cdp.send('WebAuthn.addVirtualAuthenticator', {
    options: {
      protocol: 'ctap2',
      transport: 'internal',
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: false,
      automaticPresenceSimulation: false,
    },
  });

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
  await expect(
    passwordInput,
    'Amazon did not display the password field after selecting password sign-in.',
  ).toBeVisible({ timeout: 15000 });

  await passwordInput.fill(process.env.AMAZON_PASSWORD!);
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(
    accountLink,
    'Amazon login did not return to a page with the Account & Lists link. Check for verification or another sign-in prompt.',
  ).toBeVisible({ timeout: 30000 });

  await expect(accountLink).not.toContainText(/sign in/i);

  await page.context().storageState({ path: authFile });
});
