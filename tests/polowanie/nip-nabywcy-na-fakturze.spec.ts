import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// Polowanie: NIP nabywcy na fakturze.
// Klient zamawia na firmę z NIP-em 101-202-30-36. Na fakturze ma być NIP nabywcy 1012023036,
// a nie NIP sprzedawcy (Namssor). Test zakłada jedno zamówienie firmowe na 1 „Mydło w kostce”:
// konto klienta nie może go anulować, więc zostaje na liście zamówień konta.

test('faktura zamówienia firmowego ma NIP nabywcy z zamówienia, a nie NIP sprzedawcy', async ({ request }) => {
  await zalogujPrzezApi(request);

  const zamowienie = await request.post('/api/business-orders', {
    data: { product_id: 11, qty: 1, nip: '101-202-30-36', company: 'Polowanie faktura' },
  });
  expect(zamowienie.status()).toBe(201);
  const numer = (await zamowienie.json()).number;

  const odpowiedz = await request.get(`/api/orders/${numer}/invoice`);
  expect(odpowiedz.status()).toBe(200);
  const faktura = await odpowiedz.json();
  expect(faktura.buyer).toEqual({ name: 'Polowanie faktura', nip: '1012023036' });
  expect(faktura.buyer.nip).not.toBe(faktura.seller.nip);
});
