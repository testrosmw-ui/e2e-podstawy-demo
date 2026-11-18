import { test, expect } from '@playwright/test';

// Wymaganie: klient zmienia adres dostawy. Po zapisie widzi komunikat
// „Zapisano adres dostawy.”, a formularz pokazuje nowy adres.

test('zmiana adresu dostawy zapisuje nowy adres', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

  await page.goto('/konto/adres');
  await page.getByLabel('Ulica i numer').fill('ul. Lipowa 7');
  await page.getByLabel('Kod pocztowy').fill('31-001');
  await page.getByLabel('Miasto').fill('Kraków');
  await page.getByLabel('Telefon').fill('600 200 300');
  await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

  await expect(page.getByTestId('success')).toHaveText('Zapisano adres dostawy.');
  await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
  await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
});
