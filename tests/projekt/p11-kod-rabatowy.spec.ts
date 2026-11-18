import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';
import { uzyjKoduRabatowego } from '../pomocnicze/koszyk';

// P11. Kod rabatowy w koszyku (docs/projekt.md).
// Wszystkie testy używają koszyka jednego konta, więc biegną po kolei.
// Koszyk przygotowujemy i sprzątamy przez API (page.request korzysta z logowania tej przeglądarki).

test.describe('P11: kod rabatowy w koszyku', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    await zaloguj(page);
    // W koszyku jest tylko „Mydło w kostce” (id 11, 4,99 zł)
    const czyszczenie = await page.request.delete('/api/cart');
    expect(czyszczenie.status()).toBe(200);
    const dodanie = await page.request.post('/api/cart/items', { data: { product_id: 11 } });
    expect(dodanie.status()).toBe(201);

    await page.goto('/koszyk');
    await expect(page.getByText('Pozycji: 1, razem: 4,99 zł', { exact: true })).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie: DELETE /api/cart usuwa z koszyka mydło i kod rabatowy
    const odpowiedz = await page.request.delete('/api/cart');
    expect(odpowiedz.status()).toBe(200);
  });

  test('kod CZARNY20 daje 20% rabatu na całe zamówienie', async ({ page }) => {
    await uzyjKoduRabatowego(page, 'CZARNY20');

    await expect(page.getByText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.', { exact: true })).toBeVisible();
    // 20% z 4,99 zł to 0,998 zł, po zaokrągleniu rabat 1,00 zł
    await expect(page.getByText('Przed rabatem: 4,99 zł, rabat (CZARNY20): -1,00 zł', { exact: true })).toBeVisible();
  });

  test('nieistniejący kod NIEMA jest odrzucony i nie daje rabatu', async ({ page }) => {
    await uzyjKoduRabatowego(page, 'NIEMA');

    await expect(page.getByText('Nie ma takiego kodu rabatowego: NIEMA', { exact: true })).toBeVisible();
    // Bez rabatu: brak linii „Przed rabatem…” (widać ją przy CZARNY20) i suma bez zmian
    await expect(page.getByText(/^Przed rabatem:/)).toHaveCount(0);
    await expect(page.getByText('Pozycji: 1, razem: 4,99 zł', { exact: true })).toBeVisible();
  });

  test('kod WLOSY15 bez produktów z kategorii Włosy jest odrzucony', async ({ page }) => {
    await uzyjKoduRabatowego(page, 'WLOSY15');

    await expect(
      page.getByText('Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.', {
        exact: true,
      }),
    ).toBeVisible();
  });
});
