import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz A: filtr kategorii na stronie „Produkty”.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('filtr „Dziecko” pokazuje tylko produkty dla dzieci', async ({ page }) => {
  // Strona „Produkty” jest dostępna bez logowania. Adres bazowy jest w playwright.config.ts.
  await page.goto('/');

  // Wybierz kategorię „Dziecko” i zastosuj filtr.
  await page.getByLabel('Kategoria').selectOption('Dziecko');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Liczba produktów po filtrowaniu to dokładnie 3.
  await expect(page.getByTestId('product-count')).toHaveText('3');

  // Widać wszystkie trzy produkty dla dzieci.
  await expect(page.getByRole('row').filter({ hasText: 'Chusteczki nawilżane dla dzieci' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Szampon dla dzieci' })).toBeVisible();
  await expect(page.getByRole('row').filter({ hasText: 'Krem ochronny dla dzieci' })).toBeVisible();

  // Produktu z innej kategorii (Włosy) nie ma na liście.
  await expect(page.getByRole('row').filter({ hasText: 'Szampon nawilżający' })).toHaveCount(0);

  // Dla szybszych 3: trzy widoczne produkty to jeszcze nie dowód, że innych nie ma.
  // Wiersze produktów to te z przyciskiem „Dodaj do koszyka” (nagłówek tabeli go nie ma).
  const wierszeProduktow = page.getByRole('row').filter({ has: page.getByRole('button', { name: /Dodaj do koszyka/ }) });
  // Tyle wierszy, ile pokazuje licznik „Liczba produktów”.
  const licznik = await page.getByTestId('product-count').textContent();
  await expect(wierszeProduktow).toHaveCount(Number(licznik));
  // Każdy z tych wierszy ma kategorię „Dziecko”.
  await expect(page.getByRole('cell', { name: 'Dziecko', exact: true })).toHaveCount(Number(licznik));
});
