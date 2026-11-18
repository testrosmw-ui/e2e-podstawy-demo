import { test, expect } from '@playwright/test';
import { zalogujJakoAdmin, zalogujPrzezApi } from '../pomocnicze/logowanie';

// P15. Status zamówienia w panelu admina (docs/projekt.md). Konto admin: tylko lokalnie (tag @admin).
// Sprzątania nie ma: wysłanego zamówienia nie da się anulować. Każdy przebieg zostawia
// jedno wysłane zamówienie na 1 „Mydło w kostce”. Test jest powtarzalny, bo zakłada własne zamówienie.

test.describe('P15: status zamówienia w panelu admina', { tag: '@admin' }, () => {
  let numer: string;

  test.beforeEach(async ({ request }) => {
    // Zamówienie klienta przez API: „Mydło w kostce” (id 11), 1 sztuka
    await zalogujPrzezApi(request);
    const odpowiedz = await request.post('/api/orders', { data: { product_id: 11, qty: 1 } });
    expect(odpowiedz.status()).toBe(201);
    numer = (await odpowiedz.json()).number;
  });

  test('admin zmienia status na Zapłacone, potem na Wysłane, a klient widzi shipped', async ({ page, request }) => {
    await zalogujJakoAdmin(page);
    await page.goto(`/admin/zamowienia/${numer}`);
    await expect(page.getByText('Status: Nowe', { exact: true })).toBeVisible();

    await page.getByLabel('Status zamówienia').selectOption('Zapłacone');
    await page.getByRole('button', { name: 'Zapisz status' }).click();
    await expect(page.getByText('Status: Zapłacone', { exact: true })).toBeVisible();

    await page.getByLabel('Status zamówienia').selectOption('Wysłane');
    await page.getByRole('button', { name: 'Zapisz status' }).click();
    await expect(page.getByText('Status: Wysłane', { exact: true })).toBeVisible();

    // Klient (sesja `request` z beforeEach) widzi status „shipped” w API
    const odpowiedz = await request.get(`/api/orders/${numer}`);
    expect(odpowiedz.status()).toBe(200);
    expect((await odpowiedz.json()).status).toBe('shipped');
  });
});
