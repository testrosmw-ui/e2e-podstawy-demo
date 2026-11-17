import { test, expect } from '@playwright/test';

// Wymaganie: wyszukanie słowa „szampon” pokazuje produkt „Szampon nawilżający”.

test('wyszukiwarka znajduje szampon nawilżający', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Szukaj produktu').fill('szampon');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  await expect(
  page.getByRole('cell', { name: 'Szampon nawilżający', exact: true })
).toBeVisible();

});



