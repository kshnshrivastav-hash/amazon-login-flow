import { test } from '../fixtures/pomFixture';

test('add mobile to cart', async ({ homePage, searchResultsPage }) => {
  await homePage.open();
  const countBefore = await homePage.getCartCount();

  await homePage.search('iphone');
  await searchResultsPage.addFirstProductToCart();

  await homePage.verifyCartCount(countBefore + 1);
});

test('add laptop to cart', async ({ homePage, searchResultsPage }) => {
  await homePage.open();
  const countBefore = await homePage.getCartCount();

  await homePage.search('macbook pro');
  await searchResultsPage.addFirstProductToCart();

  await homePage.verifyCartCount(countBefore + 1);
});

test('add book to cart', async ({ homePage, searchResultsPage }) => {
  await homePage.open();
  const countBefore = await homePage.getCartCount();

  await homePage.search('book');
  await searchResultsPage.addFirstProductToCart();

  await homePage.verifyCartCount(countBefore + 1);
});

test('verify items in cart', async ({ homePage, cartPage }) => {
  await homePage.open();
  await homePage.openCart();

  await cartPage.verifyItemsInCart(3);
});

test('go to payment page', async ({ homePage, cartPage, checkoutPage }) => {
  await homePage.open();
  await homePage.openCart();
  await cartPage.verifyItemsInCart(3);

  await cartPage.clickProceedToBuy();
  await checkoutPage.verifyPaymentPage();
});
