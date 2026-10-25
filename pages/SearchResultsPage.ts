import { Page, Locator, expect } from '@playwright/test';

export class SearchResultsPage {
  page: Page;
  addToCartButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addToCartButton = page.getByRole('button', { name: 'Add to cart' }).first();
  }

  async addFirstProductToCart() {
    await expect(this.addToCartButton).toBeVisible();
    await this.addToCartButton.click();
  }
}
