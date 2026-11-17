import { test, expect } from '@playwright/test';

// Wymaganie: na stronie „Moje zamówienia” klient widzi swoje zamówienie ZAM-1004
// ze statusem „Nowe”.

test('lista moich zamówień pokazuje ZAM-1004 jako nowe', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/zamowienia');

  // Lista zamówień przychodzi z serwera, dajemy jej czas na załadowanie
  await page.waitForTimeout(3000);

  const numerWidoczny = await page.getByText('ZAM-1004').isVisible();
  expect(numerWidoczny).toBe(true);
  await expect(page.getByRole('cell', { name: 'Nowe' }).first()).toBeVisible();
});
//niepotrzebna informacja o timeout 3000