import { test, expect } from '@playwright/test';

// Ćwiczenie 04b: ta sama cena promocyjna na kafelku, na karcie produktu i w koszyku.
// Karta: docs/cwiczenia/04-locatory-codegen.md (część 04b)
// Konto tester11 ma osobny koszyk: testy z ćwiczeń 02 i 04 dodają produkty do koszyka konta user.

test('cena promocyjna kremu jest taka sama na kafelku, karcie produktu i w koszyku', async ({ page }) => {
  // TODO 1: zaloguj się jako tester11
  await page.goto('/');
  await page.getByRole('link', { name: 'Zaloguj' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('tester11');
  await page.getByRole('textbox', { name: 'Hasło' }).fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();

  // TODO 2: znajdź kafelek kremu w sekcji „Oferta na Czarny Piątek” i sprawdź ceny oraz plakietkę.
  const kafelek = page.getByRole('article', { name: 'Krem do twarzy na dzień' });
  await expect(kafelek.getByTestId('tile-price')).toHaveText('26,39 zł');
  await expect(kafelek.getByTestId('tile-old-price')).toHaveText('32,99 zł');
  await expect(kafelek.getByTestId('tile-badge')).toHaveText('-20%');

  // TODO 3: kliknij nazwę produktu w kafelku i sprawdź kartę produktu.
  await kafelek.getByRole('link', { name: 'Krem do twarzy na dzień' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Krem do twarzy na dzień');
  await expect(page.getByTestId('product-price')).toHaveText('26,39 zł');
  await expect(page.getByTestId('product-old-price')).toHaveText('32,99 zł');
  await expect(page.getByTestId('product-badge')).toHaveText('-20%');

  // TODO 4: dodaj krem do koszyka i sprawdź komunikat (znika po kilku sekundach, więc od razu po kliknięciu).
  await page.getByRole('button', { name: 'Dodaj do koszyka' }).click();
  await expect(page.getByTestId('flash')).toHaveText('Dodano do koszyka: Krem do twarzy na dzień');

  // TODO 5: przejdź do koszyka i sprawdź cenę w wierszu kremu.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  const wierszKremu = page.getByRole('row').filter({ hasText: 'Krem do twarzy na dzień' });
  await expect(wierszKremu.getByTestId('cart-item-price')).toContainText('26,39 zł');

  // TODO 6: usuń krem, żeby następne uruchomienie zaczynało od pustego koszyka.
  await page.getByRole('button', { name: 'Usuń: Krem do twarzy na dzień' }).click();
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
});

// Dla szybszych 1: tester12 ma własny koszyk, więc kod rabatowy nie miesza się z testem powyżej.
test('kod CZARNY20 obniża sumę do zapłaty za krem do 21,11 zł', async ({ page }) => {
  // Logowanie jako tester12 (hasło takie samo jak tester11).
  await page.goto('/');
  await page.getByRole('link', { name: 'Zaloguj' }).click();
  await page.getByRole('textbox', { name: 'Login' }).fill('tester12');
  await page.getByRole('textbox', { name: 'Hasło' }).fill('czarny-piatek-2026');
  await page.getByRole('button', { name: 'Zaloguj' }).click();
  await expect(page.getByRole('heading', { name: 'Produkty' })).toBeVisible();

  // Krem do koszyka prosto z tabeli produktów.
  await page.getByRole('button', { name: 'Dodaj do koszyka: Krem do twarzy na dzień' }).click();
  await expect(page.getByTestId('flash')).toHaveText('Dodano do koszyka: Krem do twarzy na dzień');

  // Wpisz kod rabatowy w koszyku.
  await page.getByRole('link', { name: 'Koszyk' }).click();
  await page.getByLabel('Kod rabatowy').fill('CZARNY20');
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();

  // Kod przyjęty, a suma spada z 26,39 zł o 20%.
  await expect(page.getByText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.')).toBeVisible();
  await expect(page.getByTestId('cart-total')).toHaveText('21,11 zł');

  // Sprzątanie: najpierw kod, potem krem, żeby kolejne uruchomienie zaczynało od zera.
  await page.getByRole('button', { name: 'Usuń kod' }).click();
  await expect(page.getByText('Kod CZARNY20 przyjęty: -20% na całe zamówienie.')).toHaveCount(0);
  await page.getByRole('button', { name: 'Usuń: Krem do twarzy na dzień' }).click();
  await expect(page.getByText('Koszyk jest pusty.')).toBeVisible();
});

// Dla szybszych 2: serum ma stan 0, więc karta produktu nie pozwala go zamówić.
test('niedostępne serum ma wyłączony przycisk „Dodaj do koszyka” i pole „Ilość”', async ({ page }) => {
  // Strona „Produkty” działa bez logowania.
  await page.goto('/');

  // Kartę otwieramy przez kafelek w sekcji „Oferta na Czarny Piątek”.
  const kafelek = page.getByRole('article', { name: 'Serum z witaminą C' });
  await kafelek.getByRole('link', { name: 'Serum z witaminą C' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Serum z witaminą C');

  // Zamówić się nie da: przycisk i pole ilości są wyłączone.
  await expect(page.getByRole('button', { name: 'Dodaj do koszyka' })).toBeDisabled();
  await expect(page.getByLabel('Ilość')).toBeDisabled();
});
