
import { test, expect } from '@playwright/test';

// Ćwiczenie 06, część B: płatność w ramce (iframe).
// Karta: docs/cwiczenia/06-dynamiczne-id.md
//
// Formularz karty jest w ramce <iframe title="Bramka płatnicza">. Locatory strony głównej
// nie widzą jej wnętrza. Wejście do ramki:
//   const bramka = page.getByTitle('Bramka płatnicza').contentFrame();
//   await bramka.getByLabel('Numer karty').fill('...');

// Płatność zamawia cały koszyk klienta. Konto tester07 ma koszyk tylko dla tych testów,
// więc inne testy nie dokładają do niego produktów. Oba testy dzielą ten koszyk, więc biegną po kolei.
test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester07');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester07')).toBeVisible();

  // Płacić można tylko za niepusty koszyk.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Maseczka glinkowa' }).click();
  await expect(page.getByText('Dodano do koszyka: Maseczka glinkowa')).toBeVisible();
});

test('karta odrzucona przez bank pokazuje komunikat w ramce', async ({ page }) => {
  // 1. Strona płatności i wejście do ramki
  await page.goto('/koszyk/platnosc');
  const bramka = page.getByTitle('Bramka płatnicza').contentFrame();

  // 2. Karta odrzucana przez bank; pole i przycisk są w ramce
  await bramka.getByLabel('Numer karty').fill('4000 0000 0000 0002');
  await bramka.getByRole('button', { name: 'Zapłać' }).click();

  // 3. Komunikat też jest w ramce
  await expect(bramka.getByRole('alert')).toHaveText('Płatność odrzucona przez bank. Użyj innej karty.');

  // 4. Sprzątanie: płatność nie przeszła, więc produkt został w koszyku
  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Usuń: Maseczka glinkowa' }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Maseczka glinkowa' })).toHaveCount(0);
});

test('przyjęta płatność daje numer zamówienia', async ({ page, request }) => {
  // 1. Płatność kartą, która przechodzi
  await page.goto('/koszyk/platnosc');
  const bramka = page.getByTitle('Bramka płatnicza').contentFrame();
  await bramka.getByLabel('Numer karty').fill('4111 1111 1111 1111');
  await bramka.getByRole('button', { name: 'Zapłać' }).click();

  // 2. Nagłówek po płatności (w ramce)
  await expect(bramka.getByRole('heading', { name: 'Płatność przyjęta' })).toBeVisible();

  // 3. Numery zamówień: jeden na pozycję koszyka, po przecinku
  const numery = bramka.getByTestId('payment-order');
  await expect(numery).toHaveText(/^ZAM-\d+(, ZAM-\d+)*$/);

  // 4. Sprzątanie przez API: admin anuluje każde zamówienie
  const listaNumerow = (await numery.innerText()).split(', ');

  const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  const { token } = await logowanie.json();

  for (const numer of listaNumerow) {
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(odpowiedz.status()).toBe(200);
  }
});
