import { test as setup, expect, Page } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const email = process.env.AMAZON_EMAIL || '';
const password = process.env.AMAZON_PASSWORD || '';

// Prints what is on the page, so we can see why a step failed in CI
async function printPageInfo(page: Page, label: string) {
  const info = await page.evaluate(() => {
    const texts = (selector: string) =>
      Array.from(document.querySelectorAll(selector))
        .map((el) => (el.textContent || '').trim())
        .filter((text) => text.length > 0)
        .slice(0, 20);
    return {
      url: location.href,
      title: document.title,
      headings: texts('h1, h2'),
      links: texts('a'),
      buttons: texts('button, input[type=submit], .a-button-text'),
      passwordInputs: document.querySelectorAll('input[type=password]').length,
    };
  });
  console.error(label, JSON.stringify(info));
}

setup('Amazon login and save storage state', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  // Amazon sometimes shows a "Continue shopping" page first
  const continueShopping = page.getByRole('button', { name: 'Continue shopping' });
  if (await continueShopping.isVisible()) {
    await continueShopping.click();
  }

  // Open sign in
  const accountLink = page.getByRole('link', { name: 'Account & Lists' });
  await accountLink.click();

  // Step 1: email, then Continue
  const emailBox = page.getByRole('textbox', { name: 'Enter mobile number or email' });
  await emailBox.fill(email);
  await page.getByRole('button', { name: 'Continue' }).click();

  // Step 2: the next page is either "Use your passkey" or the password page.
  // WAIT until one of them is on screen, then decide (this was the bug).
  const passwordLink = page.getByRole('link', { name: 'Enter your password' });
  const passwordBox = page.getByRole('textbox', { name: 'Password' });
  try {
    await expect(passwordLink.or(passwordBox)).toBeVisible();
  } catch (error) {
    await printPageInfo(page, 'NEITHER PASSWORD LINK NOR BOX FOUND:');
    throw error;
  }

  if (await passwordLink.isVisible()) {
    await passwordLink.click();
  }

  // Step 3: password, then Sign in
  try {
    await expect(passwordBox).toBeVisible();
  } catch (error) {
    await printPageInfo(page, 'PASSWORD BOX NOT FOUND:');
    throw error;
  }
  await passwordBox.fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Step 4: logged in = header shows the Account & Lists link
  try {
    await expect(accountLink).toBeVisible();
  } catch (error) {
    await printPageInfo(page, 'AFTER SIGN IN (verification page?):');
    throw error;
  }
  await expect(page.locator('#nav-link-accountList-nav-line-1')).not.toContainText('sign in');

  // Save the session
  await page.context().storageState({ path: '.auth/user.json' });
});
