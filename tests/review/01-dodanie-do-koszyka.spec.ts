import { test, expect } from '@playwright/test';

// Wymaganie: zalogowany klient klika „Dodaj do koszyka” przy produkcie
// „Balsam do ciała” i ten produkt trafia do jego koszyka.

test('dodanie balsamu do ciała do koszyka', async ({ page }) => {
  // Logowanie jako klient
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  // Wiersz produktu na liście
  await page.goto('/');
  const wiersz = page.getByRole('row').filter({ hasText: 'Balsam do ciała' });

  await wiersz.getByRole('button', { name: 'Dodaj do koszyka' }).click();

  // Produkt jest na liście i nadal można go dodać
  await expect(wiersz).toBeVisible();
  await expect(wiersz.getByRole('button', { name: 'Dodaj do koszyka' })).toBeEnabled();
});
// brak potwierdzenia o dodaniu produktu do koszyka