import { test, expect } from '@playwright/test';

// Wymaganie: klient wpisuje w koszyku kod CZARNY20. Kod zostaje przyjęty,
// a suma do zapłaty spada o 20%. Komunikat o błędnym kodzie się nie pojawia.

test('kod CZARNY20 zostaje przyjęty w koszyku', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester08');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester08')).toBeVisible();

  // Produkt do koszyka
  await page.getByRole('button', { name: 'Dodaj do koszyka: Żel pod prysznic' }).click();
  await page.goto('/koszyk');

  // Kod rabatowy
  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  // Kod przyjęty: nie ma komunikatu o błędnym kodzie
  await expect(page.getByText('Nieprawidłowy kod rabatowy')).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Koszyk' })).toBeVisible();

  // Sprzątanie: żel wraca z koszyka
  await page.getByRole('button', { name: 'Usuń: Żel pod prysznic' }).click();
});
// brak komunikatu o dodaniu produktu do koszyka
// brak sprawdzenia czy kod sie naliczył
// brak info czy kod został dodany