import { test, expect, type Page } from '@playwright/test';

// Ćwiczenie 03b: przeczytaj ten plik i opisz słowami, co sprawdza.

// Funkcja pomocnicza: otwiera kartę produktu przez kafelek na stronie głównej
// i upewnia się, że karta się otworzyła.
async function otworzKarteProduktu(page: Page, nazwa: string) {
  await page.goto('/');
  await page.getByRole('article', { name: nazwa }).getByRole('link', { name: nazwa }).click();
  await expect(page.getByRole('heading', { level: 1, name: nazwa })).toBeVisible();
}

test('karta produktu pokazuje opis i dostępność', async ({ page }) => {
  await otworzKarteProduktu(page, 'Szampon nawilżający');

  await expect(page.getByTestId('product-description')).toContainText('400 ml');
  await expect(page.getByTestId('product-availability')).toContainText('Na stanie:');
});

test('cena na karcie produktu jest taka sama jak na kafelku', async ({ page }) => {
  await otworzKarteProduktu(page, 'Krem do twarzy na dzień');

  await expect(page.getByTestId('product-price')).toHaveText('26,39 zł');
});

test('produktu niedostępnego nie da się dodać do koszyka z karty produktu', async ({ page }) => {
  await otworzKarteProduktu(page, 'Maska do włosów z olejem arganowym');

  await expect(page.getByTestId('product-availability')).toHaveText('Chwilowo brak');
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
});
