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

  const passwordInput = page.getByRole('textbox', { name: 'Password' });
  const enterPassword = page
    .getByRole('link', { name: 'Enter your password' })
    .or(page.getByRole('button', { name: 'Enter your password' }));
  const signInButton = page.getByRole('button', { name: 'Sign in' });

  for (let attempt = 1; attempt <= 3; attempt++) {
    await expect(passwordInput.or(enterPassword)).toBeVisible();
    if (await enterPassword.isVisible()) {
      await enterPassword.click();
    }
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(process.env.AMAZON_PASSWORD!);
    await signInButton.click();
    await page.waitForLoadState('load');

    await expect(accountLink.or(enterPassword)).toBeVisible();
    if (await accountLink.isVisible()) {
      break;
    }
  }

  await expect(accountLink).not.toContainText(/sign in/i);

  await page.context().storageState({ path: authFile });
});
