import { test, expect } from '@playwright/test';

// Wymaganie: po zalogowaniu klient widzi na stronie „Moje zamówienia” co najmniej jedno zamówienie.

test('klient widzi swoje zamówienia', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');

  // Policz wiersze tabeli zamówień
  const liczbaWierszy = await page.getByTestId('order-row').count();
  expect(liczbaWierszy).toBeGreaterThan(0);
});


import { test, expect } from '@playwright/test';

// Wymaganie: po zalogowaniu klient widzi na stronie „Moje zamówienia” co najmniej jedno zamówienie.

test('klient widzi swoje zamówienia', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');

  // Policz wiersze tabeli zamówień
  const liczbaWierszy = await page.getByTestId('order-row').count();
  expect(liczbaWierszy).toBeGreaterThan(0);
});