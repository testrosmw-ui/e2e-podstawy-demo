import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';
import { uzyjKoduRabatowego } from '../pomocnicze/koszyk';

// Polowanie: wygasły kod rabatowy.
// Kod JESIEN10 był ważny do 31.10.2026. Dziś (listopad 2026) koszyk ma go odrzucić i nie dać rabatu.
// Serwer jest wspólny: koszyk konta (z kodem) czyścimy przed testem i po nim.

test.beforeEach(async ({ page }) => {
  await zaloguj(page);
  const czyszczenie = await page.request.delete('/api/cart');
  expect(czyszczenie.status()).toBe(200);
  // W koszyku tylko „Mydło w kostce” (id 11, 4,99 zł)
  const dodanie = await page.request.post('/api/cart/items', { data: { product_id: 11 } });
  expect(dodanie.status()).toBe(201);
});

test.afterEach(async ({ page }) => {
  const odpowiedz = await page.request.delete('/api/cart');
  expect(odpowiedz.status()).toBe(200);
});

test('wygasły kod JESIEN10 jest odrzucony i nie daje rabatu', async ({ page }) => {
  await page.goto('/koszyk');
  await expect(page.getByText('Pozycji: 1, razem: 4,99 zł', { exact: true })).toBeVisible();

  await uzyjKoduRabatowego(page, 'JESIEN10');

  await expect(page.getByText('Kod JESIEN10 wygasł 31.10.2026.', { exact: true })).toBeVisible();
  // Bez rabatu: suma bez zmian i brak linii „Przed rabatem…”
  await expect(page.getByText('Pozycji: 1, razem: 4,99 zł', { exact: true })).toBeVisible();
  await expect(page.getByText(/^Przed rabatem:/)).toHaveCount(0);
});
