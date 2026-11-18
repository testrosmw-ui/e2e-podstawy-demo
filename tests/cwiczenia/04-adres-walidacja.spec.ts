import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz C: adres dostawy z błędnym kodem pocztowym.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
  // Krok 1: logowanie jako klient user / user123.
  await page.goto('/');
  await page.getByRole('link', { name: 'Zaloguj' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('user');
  await page.getByRole('textbox', { name: 'Hasło' }).fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  // Krok 2: otwieramy „Adres dostawy” z menu.
  await page.getByRole('link', { name: 'Adres dostawy' }).click();

  // Krok 3: kod pocztowy bez myślnika i próba zapisu.
  await page.getByRole('textbox', { name: 'Kod pocztowy' }).fill('00000');
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

  // Krok 4: podsumowanie błędów nad formularzem.
  await expect(page.getByText('Popraw błędy w formularzu (1).')).toBeVisible();

  // Krok 5: komunikat przy polu „Kod pocztowy”.
  await expect(page.getByText('Kod pocztowy musi mieć format 00-000')).toBeVisible();

  // Krok 6: adres nie został zapisany, więc nie ma komunikatu o sukcesie.
  await expect(page.getByText('Zapisano adres dostawy.')).toBeHidden();
});
