import { test, expect } from '@playwright/test';

test('administrator widzi link do panelu admina', async ({ page }) => {
  await page.goto('/logowanie');

  await page.getByLabel('Login').fill('admin');
  await page.getByLabel('Hasło').fill('admin123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako admin')).toBeVisible();

  await expect(page.getByRole('link', { name: 'Panel admina' })).toBeVisible();
});
