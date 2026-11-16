import { test, expect } from '@playwright/test';

// Ćwiczenie 04, scenariusz B: dodanie produktu do koszyka i usunięcie go.
// Karta: docs/cwiczenia/04-locatory-codegen.md

test('usunięty produkt znika z koszyka', async ({ page }) => {
  // TODO 1: zaloguj się jako user / user123.
  await page.goto('/');
  await page.getByRole('link', { name: 'Zaloguj' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('user');
  await page.getByRole('textbox', { name: 'Hasło' }).fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  // TODO 2: dodaj do koszyka „Żel pod prysznic”.
  // Po zalogowaniu aplikacja sama wraca na stronę główną z produktami.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Żel pod prysznic' }).click();
  // Komunikat potwierdza, że do koszyka trafił właściwy produkt.
  await expect(page.getByTestId('flash')).toContainText('Żel pod prysznic');

  // TODO 3: otwórz koszyk i sprawdź, że „Żel pod prysznic” w nim jest.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wierszZelu = page.getByRole('row').filter({ hasText: 'Żel pod prysznic' });
  await expect(wierszZelu).toBeVisible();

  // TODO 4: kliknij „Usuń” w wierszu „Żel pod prysznic”.
  await wierszZelu.getByRole('button', { name: 'Usuń: Żel pod prysznic' }).click();

  // TODO 5: sprawdź, że wiersza „Żel pod prysznic” już nie ma.
  // toHaveCount(0) czeka, aż wiersz zniknie z tabeli koszyka.
  await expect(wierszZelu).toHaveCount(0);
});
