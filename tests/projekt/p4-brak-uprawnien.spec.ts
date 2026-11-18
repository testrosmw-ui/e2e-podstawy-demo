import { test, expect } from '@playwright/test';
import { zaloguj, zalogujJakoAdmin } from '../pomocnicze/logowanie';

// P4. Klient nie wejdzie do panelu administratora (docs/projekt.md).
// Test z kontem admin uruchamiaj tylko lokalnie: na wspólnym serwerze hasło admina zna trener.

test.describe('P4: klient nie wejdzie do panelu administratora', () => {
  test('klient na /admin widzi „Brak uprawnień” i nie ma w menu „Panel admina”', async ({ page }) => {
    await zaloguj(page);
    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Brak uprawnień', exact: true })).toBeVisible();
    await expect(page.getByText('Ta strona wymaga roli admin.', { exact: true })).toBeVisible();

    const menu = page.getByRole('navigation', { name: 'Menu główne' });
    // Najpierw menu klienta jest widoczne, dopiero potem sprawdzamy brak pozycji
    await expect(menu.getByRole('link', { name: 'Moje zamówienia' })).toBeVisible();
    await expect(menu.getByRole('link', { name: 'Panel admina' })).toHaveCount(0);
  });

  test('administrator ma w menu pozycję „Panel admina”', { tag: '@admin' }, async ({ page }) => {
    await zalogujJakoAdmin(page);

    const menu = page.getByRole('navigation', { name: 'Menu główne' });
    await expect(menu.getByRole('link', { name: 'Panel admina' })).toBeVisible();
  });
});
