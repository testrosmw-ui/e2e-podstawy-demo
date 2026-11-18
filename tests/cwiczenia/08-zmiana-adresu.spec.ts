import { test, expect } from '@playwright/test';

// Przypadki testowe: docs/scenariusze/zmiana-adresu.md (TC-ADR-01, TC-ADR-02)
// i docs/scenariusze/zmiana-adresu.feature.

// Adres startowy konta user (seed bazy). Każdy test zaczyna i kończy na tym adresie.
const adresStartowy = {
  street: 'ul. Przykładowa 12/3',
  postal_code: '00-001',
  city: 'Warszawa',
  phone: '500 100 200',
};

test.describe('Zmiana adresu dostawy', () => {
  // Wszystkie testy zmieniają adres jednego konta user, więc biegną po kolei.
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Logowanie jako klient
    await page.goto('/logowanie');
    await page.getByLabel('Login').fill('user');
    await page.getByLabel('Hasło').fill('user123');
    await page.getByRole('button', { name: 'Zaloguj' }).click();
    await expect(page.getByText('Zalogowano jako user (user)')).toBeVisible();

    // Ustawiamy adres startowy przez API, bo inne testy mogły go zmienić.
    // page.request korzysta z ciasteczek zalogowanej strony.
    const odpowiedz = await page.request.post('/api/account/address', { data: adresStartowy });
    expect(odpowiedz.status()).toBe(200);
    expect(await odpowiedz.json()).toMatchObject(adresStartowy);

    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByRole('heading', { name: 'Zmiana adresu dostawy' })).toBeVisible();
  });

  test.afterEach(async ({ page }) => {
    // Sprzątanie: przywracamy adres startowy, żeby inne testy widziały stan z seeda.
    const odpowiedz = await page.request.post('/api/account/address', { data: adresStartowy });
    expect(odpowiedz.status()).toBe(200);
    expect(await odpowiedz.json()).toMatchObject(adresStartowy);
  });

  // TC-ADR-01, kroki 2–5
  test('zapisany adres dostawy jest widoczny po odświeżeniu strony', async ({ page }) => {
    // Na starcie formularz pokazuje adres startowy
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');

    await page.getByLabel('Ulica i numer').fill('ul. Lipowa 7');
    await page.getByLabel('Kod pocztowy').fill('31-001');
    await page.getByLabel('Miasto').fill('Kraków');
    await page.getByLabel('Telefon').fill('600 200 300');
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

    await expect(page.getByRole('status')).toHaveText('Zapisano adres dostawy.');
    await expect(page).toHaveURL(/zapisano=1/);

    // Po odświeżeniu pola czytają adres z bazy, więc widać, że zapis się udał
    await page.reload();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Lipowa 7');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('31-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Kraków');
    await expect(page.getByLabel('Telefon')).toHaveValue('600 200 300');
  });

  // TC-ADR-02 i .feature, przykład 1
  test('błędny kod pocztowy blokuje zapis adresu', async ({ page }) => {
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');

    await page.getByLabel('Kod pocztowy').fill('31001');
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Kod pocztowy musi mieć format 00-000', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Kod pocztowy')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Wchodzimy na stronę od nowa (bez reload, który wysłałby formularz jeszcze raz)
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  // .feature, przykład 2
  test('błędny telefon blokuje zapis adresu', async ({ page }) => {
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');

    await page.getByLabel('Telefon').fill('12345');
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Telefon musi mieć 9 cyfr (opcjonalnie z +48)', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Telefon')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Wchodzimy na stronę od nowa (bez reload, który wysłałby formularz jeszcze raz)
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });

  // .feature, przykład 3
  test('puste miasto blokuje zapis adresu', async ({ page }) => {
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');

    await page.getByLabel('Miasto').fill('');
    await page.getByRole('button', { name: 'Zapisz', exact: true }).click();

    await expect(page.getByRole('alert')).toHaveText('Popraw błędy w formularzu (1).');
    await expect(page.getByText('Podaj miasto', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Miasto')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByText('Zapisano adres dostawy.')).not.toBeVisible();

    // Wchodzimy na stronę od nowa (bez reload, który wysłałby formularz jeszcze raz)
    await page.getByRole('link', { name: 'Adres dostawy' }).click();
    await expect(page.getByLabel('Ulica i numer')).toHaveValue('ul. Przykładowa 12/3');
    await expect(page.getByLabel('Kod pocztowy')).toHaveValue('00-001');
    await expect(page.getByLabel('Miasto')).toHaveValue('Warszawa');
    await expect(page.getByLabel('Telefon')).toHaveValue('500 100 200');
  });
});
