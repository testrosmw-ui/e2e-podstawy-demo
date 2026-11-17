import { test, expect } from '@playwright/test';

// Ćwiczenie 09: testy API zamówień i dane przygotowane przez API.
// Opis endpointów: http://localhost:4100/api/docs (plik app/openapi.json).
//
// Logowanie przez API zwraca token. Token wysyłasz w nagłówku Authorization:
//   const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
//   const { token } = await logowanie.json();
//   await request.get('/api/orders', { headers: { Authorization: `Bearer ${token}` } });
//
// Gdy test jest gotowy, zamień test.fixme na test i uruchom:
//   npx playwright test tests/cwiczenia/09-api.spec.ts

test.describe('API zamówień', () => {
  test('GET /api/orders zwraca zamówienia zalogowanego klienta', async ({ request }) => {
    // Ten test jest gotowy: wzór dla pozostałych.
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.get('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(odpowiedz.status()).toBe(200);
    const zamowienia = await odpowiedz.json();
    expect(zamowienia).toContainEqual(
      expect.objectContaining({ number: 'ZAM-1001', product: 'Szampon nawilżający', customer: 'user' }),
    );
  });

  test.fixme('POST /api/orders tworzy zamówienie ze statusem „new”', async ({ request }) => {
    // TODO 1: zaloguj się jako user i weź token
    // TODO 2: POST /api/orders z danymi { product_id: 20, qty: 2 }
    // TODO 3: sprawdź status 201 i treść: product „Płyn do mycia naczyń”, qty 2, status „new”,
    //   numer w formacie ZAM-1234
    // TODO 4: posprzątaj: zaloguj się jako admin i wyślij
    //   POST /api/admin/orders/<numer>/cancel (oczekiwany status 200)
  });

  test('POST /api/orders z ilością 0 zwraca 400 z błędem pola qty', async ({ request }) => {
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 0 },
    });

    // Cała treść: ogólny błąd i dokładnie jeden błąd pola qty
    expect(odpowiedz.status()).toBe(400);
    expect(await odpowiedz.json()).toEqual({
      error: 'Błędne dane',
      errors: [{ field: 'qty', message: 'Ilość musi być liczbą całkowitą od 1 do 10' }],
    });
  });

  test('GET /api/orders bez logowania zwraca 401', async ({ request }) => {
    // Żądanie bez nagłówka Authorization
    const odpowiedz = await request.get('/api/orders');

    expect(odpowiedz.status()).toBe(401);
    expect(await odpowiedz.json()).toEqual({ error: 'Wymagane logowanie' });
  });

  test.fixme('GET /api/orders/ZAM-9999 zwraca 404', async ({ request }) => {
    // TODO: zaloguj się jako user, zapytaj o nieistniejące zamówienie, sprawdź status 404 i treść
  });
});

test.describe('Anulowanie zamówienia przygotowanego przez API', () => {
  // Numer zamówienia utworzonego przed testem
  let numer: string;

  test.beforeEach(async ({ request }) => {
    // Dane do testu: nowe zamówienie klienta user, założone przez API
    const logowanie = await request.post('/api/login', { data: { login: 'user', password: 'user123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.post('/api/orders', {
      headers: { Authorization: `Bearer ${token}` },
      data: { product_id: 20, qty: 1 },
    });
    expect(odpowiedz.status()).toBe(201);
    numer = (await odpowiedz.json()).number;
  });

  test.afterEach(async ({ request }) => {
    // Sprzątanie także po nieudanym teście: anulowanie oddaje towar na stan.
    const logowanie = await request.post('/api/login', { data: { login: 'admin', password: 'admin123' } });
    expect(logowanie.status()).toBe(200);
    const { token } = await logowanie.json();

    const odpowiedz = await request.post(`/api/admin/orders/${numer}/cancel`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // 200: anulowaliśmy teraz. 409: test już je anulował. Oba są w porządku.
    expect([200, 409]).toContain(odpowiedz.status());
  });

  test('admin anuluje nowe zamówienie w panelu', async ({ page }) => {
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('admin');
    await page.getByLabel('Hasło').fill('admin123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako admin (admin)')).toBeVisible();

    await page.goto('/admin/zamowienia');
    // Wiersz zamówienia z beforeEach, znaleziony po numerze
    const wiersz = page.getByRole('row').filter({ hasText: numer });
    await expect(wiersz.getByRole('cell', { name: 'Nowe', exact: true })).toBeVisible();
    await wiersz.getByRole('button', { name: 'Anuluj' }).click();

    await expect(page.getByText(`Anulowano zamówienie ${numer}`, { exact: true })).toBeVisible();
    await expect(wiersz.getByRole('cell', { name: 'Anulowane', exact: true })).toBeVisible();
    // Anulowanego zamówienia nie da się anulować drugi raz
    await expect(wiersz.getByRole('button', { name: 'Anuluj' })).toHaveCount(0);
  });
});
