import { test, expect } from '@playwright/test';

// Wymaganie: klient składa zamówienie z koszyka (płatność przy odbiorze)
// i widzi komunikat „Złożono zamówienie: …” z numerem nowego zamówienia.

test('zamówienie z koszyka pokazuje numer zamówienia', async ({ page, request }) => {
  await page.goto('/logowanie');
  await page.getByLabel('Login').fill('tester09');
  await page.getByLabel('Hasło').fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByText('Zalogowano jako tester09')).toBeVisible();

  // Dane wejściowe: przy pustym koszyku przycisk „Złóż zamówienie” jest wyłączony.
  await page.goto('/');
  await page.getByRole('button', { name: 'Dodaj do koszyka: Maseczka glinkowa' }).click();
  await expect(page.getByText('Dodano do koszyka: Maseczka glinkowa')).toBeVisible();

  await page.goto('/koszyk');
  await page.getByRole('button', { name: 'Złóż zamówienie (płatność przy odbiorze)' }).click();

  const komunikat = page.getByText(/Złożono zamówienie: ZAM-\d+/);
  await expect(komunikat).toBeVisible();

  // Sprzątanie: admin anuluje zamówienia utworzone przez test (jedno na pozycję koszyka).
  const numery = (await komunikat.innerText()).match(/ZAM-\d+/g) ?? [];
  const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
  const { token } = await logowanie.json();
  for (const numer of numery) {
    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(odpowiedz.status()).toBe(200);
  }
});
