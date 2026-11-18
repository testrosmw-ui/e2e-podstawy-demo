import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: API dla zamówienia, którego nie ma.
// Według /api/docs GET /api/orders/{number} odpowiada 404, gdy zamówienia nie ma.
// Test tylko czyta dane, niczego nie zmienia.

test('GET /api/orders/ZAM-9999 zwraca 404 z komunikatem o braku zamówienia', async ({ request }) => {
  await zalogujPrzezApi(request);

  const odpowiedz = await request.get('/api/orders/ZAM-9999');

  expect(odpowiedz.status()).toBe(404);
  expect(await odpowiedz.json()).toEqual({ error: 'Nie ma takiego zamówienia' });
});
