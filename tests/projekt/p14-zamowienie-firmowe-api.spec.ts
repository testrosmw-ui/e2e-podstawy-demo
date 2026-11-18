import { test, expect } from '@playwright/test';
import { zalogujPrzezApi } from '../pomocnicze/logowanie';

// P14. Zamówienie firmowe przez API (docs/projekt.md).
// Sprzątanie anuluje zamówienie kontem admin, więc test uruchamiaj tylko lokalnie (tag @admin).

test.describe('P14: zamówienie firmowe przez API', { tag: '@admin' }, () => {
  // Numer zamówienia założonego w teście; pusty, gdy test go nie założył
  let numer = '';

  test.beforeEach(async ({ request }) => {
    numer = '';
    await zalogujPrzezApi(request, 'biuro', 'biuro123');
  });

  test.afterEach(async ({ playwright }) => {
    if (!numer) return;
    // Sprzątanie: osobny kontekst żądań, żeby logowanie admina nie zmieniło sesji klienta.
    // Anulowanie oddaje kalendarze na stan.
    const admin = await playwright.request.newContext();
    await zalogujPrzezApi(admin, process.env.APP_ADMIN_USER || 'admin', process.env.APP_ADMIN_PASSWORD || 'admin123');
    const odpowiedz = await admin.post(`/api/admin/orders/${numer}/cancel`);
    // 200: anulowaliśmy teraz, 409: zamówienie było już anulowane
    expect([200, 409]).toContain(odpowiedz.status());
    await admin.dispose();
  });

  test('zamówienie firmowe ma status new, kwotę 39990 i fakturę FV/2026/<numer>', async ({ request }) => {
    const odpowiedz = await request.post('/api/business-orders', {
      data: { product_id: 21, qty: 10, nip: '101-202-30-36', company: 'Biuro Mikołaja' },
    });

    expect(odpowiedz.status()).toBe(201);
    const zamowienie = await odpowiedz.json();
    numer = zamowienie.number;
    expect(zamowienie.status).toBe('new');
    expect(zamowienie.qty).toBe(10);
    expect(zamowienie.total_cents).toBe(39990);
    expect(zamowienie.invoice.company).toBe('Biuro Mikołaja');

    const faktura = await request.get(`/api/orders/${numer}/invoice`);
    expect(faktura.status()).toBe(200);
    expect((await faktura.json()).invoice_number).toBe(`FV/2026/${numer}`);
  });

  test('ilość 1001 daje 400 z błędem pola qty', async ({ request }) => {
    const odpowiedz = await request.post('/api/business-orders', {
      data: { product_id: 21, qty: 1001, nip: '101-202-30-36', company: 'Biuro Mikołaja' },
    });

    expect(odpowiedz.status()).toBe(400);
    const bledy = (await odpowiedz.json()).errors;
    expect(bledy).toContainEqual(expect.objectContaining({ field: 'qty' }));
  });
});
