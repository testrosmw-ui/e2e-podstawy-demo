import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: walidacja kodu pocztowego w „Moich adresach”.
// Kod pocztowy ma format 00-000 (tak jak w adresie dostawy). „00950” ma być odrzucony.
// Serwer jest wspólny: gdyby błędny adres się zapisał, usuwamy go po teście.

const nazwa = `Polowanie kod ${Date.now()}`;

test.afterEach(async ({ request }) => {
  const lista = await request.get('/api/account/addresses');
  for (const adres of await lista.json()) {
    if (adres.name === nazwa) await request.delete(`/api/account/addresses/${adres.id}`);
  }
  // Gdyby błędny adres ustawił się jako domyślny, wracamy do „Adres główny” (id 0)
  await request.put('/api/account/addresses/0/default');
});

test('adres z kodem pocztowym 00950 jest odrzucony z błędem pola postal_code', async ({ request }) => {
  await zalogujPrzezApi(request);

  const odpowiedz = await request.post('/api/account/addresses', {
    data: { name: nazwa, street: 'ul. Biurowa 7', postal_code: '00950', city: 'Warszawa', phone: '600 700 800' },
  });

  expect(odpowiedz.status()).toBe(400);
  expect(await odpowiedz.json()).toEqual({
    error: 'Błędne dane',
    errors: [{ field: 'postal_code', message: 'Kod pocztowy musi mieć format 00-000' }],
  });
});
