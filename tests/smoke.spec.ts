import { test, expect } from '@playwright/test';

// Testy dymne (@smoke): czy środowisko w ogóle działa.
// Uruchomienie samych tych testów: npm run test:smoke

test('strona główna pokazuje listę produktów', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();
  await expect(page.getByRole('cell', { name: 'Szampon nawilżający', exact: true })).toBeVisible();
});

test('użytkownik może się zalogować', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/logowanie');

  await page.getByLabel('Login').fill('user');
  await page.getByLabel('Hasło').fill('user123');
  await page.getByRole('button', { name: 'Zaloguj' }).click();

  await expect(page.getByText('Zalogowano jako user')).toBeVisible();
});

test('kafelek produktu prowadzi do karty produktu z ceną promocyjną', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/');

  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();

  await expect(page.getByRole('heading', { name: 'Krem do twarzy na dzień' })).toBeVisible();
  await expect(page.getByTestId('product-old-price')).toHaveText('32,99 zł');
  await expect(page.getByTestId('product-price')).toHaveText('26,39 zł');
  await expect(page.getByTestId('product-badge')).toHaveText('-20%');
});

test('karta dostępnego produktu ma opis i aktywny przycisk „Dodaj do koszyka”', { tag: '@smoke' }, async ({ page }) => {
  await page.goto('/produkt/1');

  await expect(page.getByRole('heading', { name: 'Szampon nawilżający' })).toBeVisible();
  await expect(page.getByTestId('product-description')).not.toBeEmpty();
  await expect(page.getByTestId('product-availability')).toContainText('Na stanie:');
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeEnabled();
});
