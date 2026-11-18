import { test, expect } from '@playwright/test';

// P13. Odliczanie do Czarnego Piątku (docs/projekt.md). Endpoint jest publiczny.
// Nagłówek X-Namssor-Teraz ustawia „dzisiejszą” datę tylko dla jednego żądania (opis w /api/docs).

// Zmiana wymagań Bożeny z 13:00: zamiast 20.11 dzień przed startem (26.11) i sam start (27.11).
const daty = [
  { data: '2026-11-26', dni: 1, komunikat: 'Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji został 1 dzień.' },
  { data: '2026-11-27', dni: 0, komunikat: 'Czarny Piątek w Namssorze trwa! Tylko dziś najniższe ceny.' },
];

test.describe('P13: odliczanie do Czarnego Piątku', () => {
  // Osobny test dla każdej daty; data w nazwie, żeby nazwy testów się nie powtarzały
  for (const { data, dni, komunikat } of daty) {
    test(`data ${data} daje days_left ${dni} i komunikat dla tego dnia`, async ({ request }) => {
      const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': data } });

      expect(odpowiedz.status()).toBe(200);
      const promocja = await odpowiedz.json();
      expect(promocja.days_left).toBe(dni);
      expect(promocja.message).toBe(komunikat);
    });
  }

  test('nagłówek z datą „jutro” daje 400', async ({ request }) => {
    const odpowiedz = await request.get('/api/promocja', { headers: { 'X-Namssor-Teraz': 'jutro' } });

    expect(odpowiedz.status()).toBe(400);
    // Treść błędu 400 według tabeli kodów API (ćwiczenie 09)
    expect((await odpowiedz.json()).error).toBe('Błędne dane');
  });
});
