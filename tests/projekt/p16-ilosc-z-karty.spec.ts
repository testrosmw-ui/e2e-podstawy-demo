import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// P16. Ilość z karty produktu (docs/projekt.md).
// Koszyk przygotowujemy i sprzątamy przez API (page.request korzysta z logowania tej przeglądarki).

test.describe('P16: ilość z karty produktu', () => {
  test.beforeEach(async ({ page }) => {
    await zaloguj(page);
    const odpowiedz = await page.request.delete('/api/cart');
    expect(odpowiedz.status()).toBe(200);
  });

  test.afterEach(async ({ page }) => {
    const odpowiedz = await page.request.delete('/api/cart');
    expect(odpowiedz.status()).toBe(200);
  });

  test('3 sztuki żelu z karty produktu dają w koszyku ilość 3 i wartość 29,97 zł', async ({ page }) => {
    await page.goto('/produkt/9');
    await expect(page.getByRole('heading', { name: 'Żel pod prysznic', exact: true })).toBeVisible();
    await page.getByLabel('Ilość').fill('3');
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();

    await page.getByRole('link', { name: 'Koszyk' }).click();
    // Kolumny koszyka: Produkt, Cena, Ilość, Wartość, przycisk „Usuń”. Wartość 3 × 9,99 zł = 29,97 zł
    const wiersz = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
    await expect(wiersz.getByRole('cell')).toHaveText(['Żel pod prysznic', '9,99 zł', '3', '29,97 zł', 'Usuń']);
    // Jedna pozycja w koszyku, więc „razem” równa się sumie kolumny „Wartość”
    await expect(page.getByText('Pozycji: 1, razem: 29,97 zł', { exact: true })).toBeVisible();
  });
});
