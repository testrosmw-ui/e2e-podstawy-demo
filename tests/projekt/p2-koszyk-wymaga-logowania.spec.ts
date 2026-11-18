import { test, expect } from '@playwright/test';

// P2. Koszyk wymaga logowania (docs/projekt.md). Test niczego nie zapisuje, więc nie sprząta.
// Wyjątek od zasady „loguj funkcją zaloguj()”: zaloguj() otwiera /logowanie bez parametru next,
// a ten scenariusz sprawdza właśnie powrót przez next. Konto jak w zaloguj(): ze zmiennych
// APP_USER i APP_PASSWORD, domyślnie user / user123 (działa też z kontem pary na wspólnym serwerze).
const login = process.env.APP_USER || 'user';
const haslo = process.env.APP_PASSWORD || 'user123';

test('niezalogowany na /koszyk trafia do logowania i po nim wraca do koszyka', async ({ page }) => {
  await page.goto('/koszyk');

  // Przed logowaniem: strona „Logowanie” z adresem powrotu do koszyka
  await expect(page).toHaveURL(/next=%2Fkoszyk/);
  await expect(page.getByRole('heading', { name: 'Logowanie', exact: true })).toBeVisible();

  await page.getByLabel('Login').fill(login);
  await page.getByLabel('Hasło').fill(haslo);
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  // Po logowaniu: strona „Koszyk”, a nie strona główna
  await expect(page.getByText(`Zalogowano jako ${login}`)).toBeVisible();
  await expect(page).toHaveURL(/\/koszyk$/);
  await expect(page.getByRole('heading', { name: 'Koszyk', exact: true })).toBeVisible();
});
