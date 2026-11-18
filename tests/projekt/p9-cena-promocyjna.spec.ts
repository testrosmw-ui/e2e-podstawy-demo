import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// P9. Ta sama cena promocyjna w trzech miejscach (docs/projekt.md).
// Koszyk należy do konta, więc przed testem i po nim czyścimy go przez API
// (page.request korzysta z logowania tej przeglądarki).

test.describe('P9: ta sama cena promocyjna w trzech miejscach', () => {
  test.beforeEach(async ({ page }) => {
    await zaloguj(page);
    const odpowiedz = await page.request.delete('/api/cart');
    expect(odpowiedz.status()).toBe(200);
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie: krem znika z koszyka także po nieudanym teście
    const odpowiedz = await page.request.delete('/api/cart');
    expect(odpowiedz.status()).toBe(200);
  });

  test('krem do twarzy ma cenę 26,39 zł zamiast 32,99 zł na kafelku, karcie i w koszyku', async ({ page }) => {
    await page.goto('/');

    // Kafelek pod tabelą produktów: stara cena, nowa cena i plakietka. Przekreślenia (styl) nie sprawdzamy
    const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
    // Starą cenę (element <s>) znajdujemy po data-testid: Playwright nie nadaje mu roli
    await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
    await expect(kafelek.getByText('26,39 zł', { exact: true })).toBeVisible();
    await expect(kafelek.getByText('-20%', { exact: true })).toBeVisible();

    // Karta produktu
    await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
    await expect(page.getByRole('heading', { name: 'Krem do twarzy na dzień', exact: true })).toBeVisible();
    const karta = page.getByTestId('product-card');
    await expect(karta.getByTestId('product-old-price')).toHaveText('32,99 zł');
    await expect(karta.getByText('26,39 zł', { exact: true })).toBeVisible();
    await expect(karta.getByText('-20%', { exact: true })).toBeVisible();

    // Koszyk: kolumna „Cena” w wierszu kremu (w beforeEach koszyk był pusty)
    await karta.getByRole('button', { name: 'Dodaj do koszyka' }).click();
    await page.getByRole('link', { name: 'Koszyk' }).click();
    const wiersz = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
    await expect(wiersz.getByTestId('cart-item-price')).toHaveText('32,99 zł 26,39 zł -20%');
  });
});
