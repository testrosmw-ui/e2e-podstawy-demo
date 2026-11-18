import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: nowy adres w profilu nie zmienia adresu domyślnego.
// Adres staje się domyślny dopiero po „Ustaw jako domyślny” (PUT /api/account/addresses/{id}/default).
// Serwer jest wspólny: adres z unikalną nazwą usuwamy po teście.

const nazwa = `Polowanie domyślny ${Date.now()}`;

test.afterEach(async ({ request }) => {
  const lista = await request.get('/api/account/addresses');
  for (const adres of await lista.json()) {
    if (adres.name === nazwa) {
      const usuniecie = await request.delete(`/api/account/addresses/${adres.id}`);
      expect(usuniecie.status()).toBe(200);
    }
  }
  // Gdyby nowy adres został domyślnym, wracamy do „Adres główny” (id 0)
  await request.put('/api/account/addresses/0/default');
});

test('dodany adres nie jest domyślny, domyślny zostaje „Adres główny”', async ({ request }) => {
  await zalogujPrzezApi(request);

  const dodanie = await request.post('/api/account/addresses', {
    data: { name: nazwa, street: 'ul. Biurowa 7', postal_code: '00-950', city: 'Warszawa', phone: '600 700 800' },
  });
  expect(dodanie.status()).toBe(201);
  expect((await dodanie.json()).default).toBe(false);

  const lista = await request.get('/api/account/addresses');
  expect(lista.status()).toBe(200);
  const adresy = await lista.json();
  expect(adresy.find((a: { name: string }) => a.name === 'Adres główny').default).toBe(true);
  expect(adresy.find((a: { name: string }) => a.name === nazwa).default).toBe(false);
});
