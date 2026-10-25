import { Page, Locator, expect } from '@playwright/test';

export class CartPage {
  page: Page;
  cartItems: Locator;
  proceedToBuyButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.cartItems = page.locator('[data-name="Active Items"] [data-asin]');
    this.proceedToBuyButton = page.getByRole('button', { name: 'Proceed to Buy' });
  }

  async verifyItemsInCart(expectedCount: number) {
    // Waits until the cart lists at least the expected number of items
    await expect(this.cartItems.nth(expectedCount - 1)).toBeVisible();
  }

  async clickProceedToBuy() {
    await this.proceedToBuyButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
