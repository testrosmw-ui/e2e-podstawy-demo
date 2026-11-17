import { test, expect } from '@playwright/test';

// Wymaganie: filtr kategorii „Dziecko” na stronie produktów pokazuje dokładnie 3 produkty.
// Strona produktów jest publiczna i test niczego nie zapisuje, więc nie loguje się i nie sprząta.

test('filtr kategorii Dziecko pokazuje dokładnie 3 produkty', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Liczymy tylko w tabeli: pod nią sekcja „Oferta na Czarny Piątek” też pokazuje produkty.
  // Wiersze z komórkami to produkty (wiersz nagłówka ma tylko nagłówki kolumn).
  const tabela = page.getByRole('table');
  await expect(tabela.getByRole('row').filter({ has: page.getByRole('cell') })).toHaveCount(3);
  // Każdy z tych 3 produktów ma kategorię „Dziecko”
  await expect(tabela.getByRole('cell', { name: 'Dziecko', exact: true })).toHaveCount(3);
  await expect(page.getByText('Liczba produktów: 3', { exact: true })).toBeVisible();
});
