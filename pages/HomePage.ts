import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
  page: Page;
  searchBox: Locator;
  cartCount: Locator;
  cartLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchBox = page.getByRole('searchbox', { name: 'Search Amazon.in' });
    this.cartCount = page.locator('#nav-cart-count');
    this.cartLink = page.getByRole('link', { name: 'items in cart' });
  }

  async open() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
  }

  async search(productName: string) {
    await this.searchBox.fill(productName);
    await this.searchBox.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async getCartCount() {
    await expect(this.cartCount).toBeVisible();
    const text = await this.cartCount.innerText();
    return Number(text);
  }

  async verifyCartCount(expectedCount: number) {
    await expect(this.cartCount).toHaveText(expectedCount.toString());
  }

  async openCart() {
    await this.cartLink.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
