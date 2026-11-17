import { test, expect } from '@playwright/test';

// Wymaganie: kod pocztowy bez myślnika („00000”) jest odrzucany. Przy polu
// „Kod pocztowy” pojawia się komunikat „Kod pocztowy musi mieć format 00-000”,
// a adres dostawy nie zostaje zapisany.

test('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako user')).toBeVisible();

  await page.goto('/konto/adres');

  // Wszystkie pola poprawne poza kodem pocztowym
  await page.getByLabel('Ulica i numer').fill('ul. Przykładowa 12/3');
  await page.getByLabel('Kod pocztowy').fill('00000');
  await page.getByLabel('Miasto').fill('Warszawa');
  await page.getByLabel('Telefon').fill('500 100 200');
  await page.getByRole('button', { name: 'Zapisz adres' }).click();

  // Formularz zgłasza błąd w ramce w stylu błędu
  await expect(page.getByRole('alert')).toContainText('Popraw błędy');
  await expect(page.getByRole('alert')).toHaveClass('error');
});
// brak komunikatu Kod pocztowy musi mieć format 00-000