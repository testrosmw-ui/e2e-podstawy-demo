import { test, expect } from '@playwright/test';
import { zaloguj } from '../pomocnicze/logowanie';

// Ćwiczenie 03: przeczytaj ten plik i opisz słowami, co sprawdza.

test.describe('Moje zamówienia', { tag: '@zamowienia' }, () => {
  test('lista pokazuje zamówienia klienta z ich statusem', async ({ page }) => {
    await zaloguj(page);
    await page.goto('/zamowienia');

    await expect(page).toHaveURL(/\/zamowienia$/);
    await expect(page.getByRole('heading', { name: 'Moje zamówienia' })).toBeVisible();

    const zamowienie1001 = page.getByRole('row').filter({ hasText: 'ZAM-1001' });
    await expect(zamowienie1001).toContainText('Szampon nawilżający');

    const zamowienie1002 = page.getByRole('row').filter({ hasText: 'ZAM-1002' });
    await expect(zamowienie1002).toContainText('Pasta do zębów');
    await expect(zamowienie1002).toContainText('Anulowane');

    await expect(page.getByText('Ładowanie…')).toBeHidden();
  });

  test('klient nie widzi zamówienia innej osoby', async ({ page }) => {
    await zaloguj(page);
    await page.goto('/zamowienia');

    await expect(page.getByRole('row').filter({ hasText: 'ZAM-1001' })).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'ZAM-1005' })).toHaveCount(0);
  });
});
