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

  // Zmiana wymagań Bożeny z 13:00: Biuro Mikołaja kupuje 24 kalendarze (po jednym na okienko), nie żel.
  test('24 kalendarze adwentowe z karty produktu dają w koszyku ilość 24 i wartość 959,76 zł', async ({ page }) => {
    await page.goto('/produkt/21');
    await expect(page.getByRole('heading', { name: 'Kalendarz adwentowy 2026', exact: true })).toBeVisible();
    await page.getByLabel('Ilość').fill('24');
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();

    await page.getByRole('link', { name: 'Koszyk' }).click();
    // Kolumny koszyka: Produkt, Cena, Ilość, Wartość, przycisk „Usuń”. Wartość 24 × 39,99 zł = 959,76 zł
    const wiersz = page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' });
    await expect(wiersz.getByRole('cell')).toHaveText(['Kalendarz adwentowy 2026', '39,99 zł', '24', '959,76 zł', 'Usuń']);
    // Jedna pozycja w koszyku, więc „razem” równa się sumie kolumny „Wartość”
    await expect(page.getByText('Pozycji: 1, razem: 959,76 zł', { exact: true })).toBeVisible();
  });

  // Ćw. 12b „Dla szybszych”: przypadek graniczny, 1001 to o jedną sztukę ponad limit 1000.
  test('ilość 1001 z karty produktu pokazuje komunikat o zakresie i nie zmienia koszyka', async ({ page }) => {
    await page.goto('/produkt/21');
    await expect(page.getByRole('heading', { name: 'Kalendarz adwentowy 2026', exact: true })).toBeVisible();
    await page.getByLabel('Ilość').fill('1001');
    await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();

    await expect(page.getByRole('alert')).toHaveText('Ilość musi być liczbą całkowitą od 1 do 1000.');

    // Koszyk był pusty przed testem (beforeEach), więc po odrzuceniu ilości nadal ma 0 pozycji
    await page.getByRole('link', { name: 'Koszyk' }).click();
    await expect(page.getByText('Pozycji: 0, razem: 0,00 zł', { exact: true })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'Kalendarz adwentowy 2026' })).toHaveCount(0);
  });
});
