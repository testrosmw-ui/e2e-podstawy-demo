import type { Page } from '@playwright/test';

// Kod rabatowy w koszyku (ćwiczenie 12c, „Dla szybszych”).
// Hotfix Mirka zmienił napis przycisku z „Zastosuj kod” na „Użyj kodu” i popsuł trzy pliki testów.
// Napis stoi teraz tylko tutaj, więc przy następnej zmianie poprawiamy jedną linię.
// Wywołanie w teście (na stronie /koszyk): await uzyjKoduRabatowego(page, 'CZARNY20');
// Wynik (komunikat, rabat) sprawdza sam test, bo każdy kod daje inny komunikat.
export async function uzyjKoduRabatowego(page: Page, kod: string) {
  await page.getByLabel('Kod rabatowy').fill(kod);
  await page.getByRole('button', { name: 'Zastosuj kod' }).click();
}
