import { test, expect } from '@playwright/test';
import { zaloguj, zalogujJakoAdmin } from '../pomocnicze/logowanie';

// Wymaganie: pozycję „Panel admina” w menu głównym widzi tylko administrator.

test('administrator widzi w menu pozycję Panel admina', async ({ page }) => {
  await zalogujJakoAdmin(page);

  const menu = page.getByRole('navigation', { name: 'Menu główne' });
  await expect(menu.getByRole('link', { name: 'Panel admina' })).toBeVisible();
});

test('klient nie widzi w menu pozycji Panel admina', async ({ page }) => {
  await zaloguj(page);

  const menu = page.getByRole('navigation', { name: 'Menu główne' });
  // Najpierw sprawdzamy, że menu klienta się wczytało, dopiero potem brak pozycji
  await expect(menu.getByRole('link', { name: 'Moje zamówienia' })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Panel admina' })).toHaveCount(0);
});
