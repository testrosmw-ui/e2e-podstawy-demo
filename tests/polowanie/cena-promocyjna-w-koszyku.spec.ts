import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Polowanie: cena promocyjna w koszyku.
// „Krem do twarzy na dzień” kosztuje 32,99 zł, a w promocji -20% kosztuje 26,39 zł
// (tak pokazują kafelek i karta produktu). W koszyku ma być ta sama cena.
// Serwer jest wspólny: koszyk konta czyścimy przed testem i po nim.

test.beforeEach(async ({ page }) => {
  await zaloguj(page);
  const odpowiedz = await page.request.delete('/api/cart');
  expect(odpowiedz.status()).toBe(200);
});

test.afterEach(async ({ page }) => {
  const odpowiedz = await page.request.delete('/api/cart');
  expect(odpowiedz.status()).toBe(200);
});

test('krem w promocji -20% ma w koszyku cenę 26,39 zł, tak jak na karcie produktu', async ({ page }) => {
  await page.goto('/produkt/5');
  await expect(page.getByRole('heading', { name: 'Krem do twarzy na dzień', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();

  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  // Kolumna „Cena”: stara cena, cena promocyjna i plakietka
  await expect(wiersz.getByTestId('cart-item-price')).toHaveText('32,99 zł 26,39 zł -20%');
  await expect(page.getByText('Pozycji: 1, razem: 26,39 zł', { exact: true })).toBeVisible();
});
