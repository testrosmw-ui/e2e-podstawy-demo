import { test, expect } from '@playwright/test';

// Polowanie: sortowanie produktów po cenie.
// „Cena: od najniższej” ma ustawić produkty od najtańszego do najdroższego.
// Liczy się cena, którą płaci klient: przy promocji ostatnia (nowa) cena w komórce.
// Strona produktów jest publiczna, test niczego nie zmienia.

test('„Cena: od najniższej” ustawia produkty od najtańszego, pierwsze jest „Mydło w kostce” za 4,99 zł', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Sortuj').selectOption('Cena: od najniższej');
  await page.getByRole('button', { name: 'Filtruj' }).click();

  // Wiersze produktów w tabeli (wiersz nagłówka nie ma komórek)
  const wiersze = page.getByRole('table').getByRole('row').filter({ has: page.getByRole('cell') });
  await expect(wiersze).toHaveCount(21);
  await expect(wiersze.first()).toContainText('Mydło w kostce');

  // Cena każdego wiersza: ostatnia kwota „00,00 zł” w wierszu (przy promocji to nowa cena)
  const ceny = (await wiersze.allInnerTexts()).map((tekst) => {
    const kwoty = tekst.match(/\d+,\d{2} zł/g) ?? [];
    return Number(kwoty[kwoty.length - 1].replace(' zł', '').replace(',', '.'));
  });
  const posortowane = [...ceny].sort((a, b) => a - b);
  expect(ceny).toEqual(posortowane);
});
