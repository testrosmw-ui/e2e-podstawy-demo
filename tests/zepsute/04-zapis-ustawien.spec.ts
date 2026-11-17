import { test, expect } from '@playwright/test';

// Wymaganie: administrator zapisuje ustawienia sklepu bez zmian. Widzi komunikat
// „Zapisano ustawienia”, a tryb konserwacji zostaje wyłączony.

test('zapis ustawień pokazuje komunikat i nie włącza trybu konserwacji', async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

  await page.goto('/admin/ustawienia');
  const stan = page.getByTestId('maintenance-state');

  // Stan przed akcją
  await expect(stan).toHaveText('Stan: wyłączony');

  await page.getByRole('button', { name: 'Zapisz' }).click();

  // Komunikat sprawdzony od razu: asercja sama czeka, aż się pojawi
  await expect(page.getByText('Zapisano ustawienia')).toBeVisible();

  // Stan po zapisie, także po ponownym wczytaniu strony z serwera
  await expect(stan).toHaveText('Stan: wyłączony');
  await page.reload();
  await expect(stan).toHaveText('Stan: wyłączony');
});
