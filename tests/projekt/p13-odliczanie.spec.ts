import { test, expect } from '@playwright/test';

// P13. Odliczanie do Czarnego Piątku (docs/projekt.md). Endpoint jest publiczny.
// Nagłówek X-Namssor-Teraz ustawia „dzisiejszą” datę tylko dla jednego żądania (opis w /api/docs).

test.describe('P13: odliczanie do Czarnego Piątku', () => {
  test('data 2026-11-20 daje 7 dni do Czarnego Piątku', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': '2026-11-20' } });

    expect(odpowiedz.status()).toBe(200);
    const promocja = await odpowiedz.json();
    expect(promocja.days_left).toBe(7);
    expect(promocja.message).toBe('Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji zostało 7 dni.');
  });

  test('nagłówek z datą „jutro” daje 400', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

    expect(odpowiedz.status()).toBe(400);
    // Treść błędu 400 według tabeli kodów API (ćwiczenie 09)
    expect((await odpowiedz.json()).error).toBe('Błędne dane');
  });
});
