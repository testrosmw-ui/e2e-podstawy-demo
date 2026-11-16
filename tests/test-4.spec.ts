import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('http://localhost:4100/');
  await page.getByRole('link', { name: 'Zaloguj' }).click();
  await page.getByRole('textbox', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('user');
  await page.getByRole('textbox', { name: 'Hasło' }).click();
  await page.getByRole('textbox', { name: 'Hasło' }).fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await page.getByRole('link', { name: 'Adres dostawy' }).click();
  await page.getByRole('textbox', { name: 'Kod pocztowy' }).dblclick();
  await page.getByRole('textbox', { name: 'Kod pocztowy' }).click();
  await page.getByRole('textbox', { name: 'Kod pocztowy' }).fill('00-000');
  await page.getByRole('button', { name: 'Zapisz adres' }).click();
  await expect(page.getByTestId('success')).toBeVisible();
});