import { Page, Locator, expect } from '@playwright/test';

export class CheckoutPage {
  page: Page;
  paymentHeading: Locator;

  constructor(page: Page) {
    this.page = page;
    this.paymentHeading = page.getByText('payment method').first();
  }

  async verifyPaymentPage() {
    await expect(this.paymentHeading).toBeVisible();

    const url = this.page.url();
    expect(url.includes('pay') || url.includes('checkout')).toBeTruthy();

    await this.page.screenshot({ path: 'test-results/payment-page.png', fullPage: true });
    // Stopping here on purpose: no payment is made.
  }
}
