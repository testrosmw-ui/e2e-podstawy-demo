import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';

// Dane logowania z pliku .env (wzór: .env.example; plik .env jest w .gitignore).
// Wczytujemy go tylko, gdy istnieje. Zmienne ustawione w oknie ($env:...) mają pierwszeństwo.
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

// Konfiguracja Playwright. Dokumentacja: https://playwright.dev/docs/test-configuration
export default defineConfig({
  // Gdzie są testy.
  testDir: './tests',
  // Testy z różnych plików biegną równolegle.
  fullyParallel: true,
  // Na serwerze CI zabroń zostawionego przypadkiem test.only.
  forbidOnly: !!process.env.CI,
  // Lokalnie bez powtórek: test, który padł, ma być widać od razu.
  retries: process.env.CI ? 2 : 0,
  // Wynik w terminalu (list) i raport HTML w folderze playwright-report.
  // Raport otworzysz poleceniem: npx playwright show-report
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    // Adres aplikacji. Dzięki temu w testach piszesz page.goto('/koszyk').
    // Inny adres (np. aplikacja w chmurze) ustawisz zmienną BASE_URL.
    baseURL: process.env.BASE_URL || `http://localhost:${process.env.PORT || 4100}`,
    // Nagranie przebiegu (trace) zostaje po każdym nieudanym teście.
    // Otwórz je z raportu HTML albo: npx playwright show-trace <plik.zip>
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Firmowe proxy: gdy ustawisz HTTPS_PROXY, przeglądarka i testy API (fixture request)
    // łączą się przez nie. Adresy z NO_PROXY (domyślnie localhost) idą bez proxy.
    // Bez zmiennej HTTPS_PROXY nic się nie zmienia.
    ...(process.env.HTTPS_PROXY
      ? {
          proxy: {
            server: process.env.HTTPS_PROXY,
            bypass: process.env.NO_PROXY || 'localhost,127.0.0.1',
          },
        }
      : {}),
  },

  projects: [
    {
      name: 'chromium',
      // Testy bezpieczeństwa aplikacji (dla trenera) biegną tylko w projekcie „bezpieczenstwo”.
      // Testy z tests/zepsute (ćwiczenie 07) mają padać, więc biegną tylko w projekcie „zepsute”.
      // Testy tablicy wyników (dla trenera) biegną tylko w projekcie „tablica”.
      // Pakiet z tests/projekt biegnie w osobnym projekcie „projekt”.
      testIgnore: ['**/bezpieczenstwo/**', '**/zepsute/**', '**/tablica/**', '**/projekt/**'],
      use: { ...devices['Desktop Chrome'] },
    },
    // Ćwiczenie 12: testy projektu dzielą koszyk i zamówienia jednego konta,
    // więc biegną jeden po drugim (workers: 1), także w trybie UI i w VS Code.
    {
      name: 'projekt',
      testMatch: '**/projekt/**/*.spec.ts',
      workers: 1,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'bezpieczenstwo',
      default: false,
      testMatch: '**/bezpieczenstwo/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // Ćwiczenie 07: npx playwright test --project=zepsute
    {
      name: 'zepsute',
      default: false,
      testMatch: '**/zepsute/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // Tablica wyników gry „polowanie na błędy” (dla trenera): npx playwright test --project=tablica
    {
      name: 'tablica',
      default: false,
      testMatch: '**/tablica/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'] },
    },
    // Inne przeglądarki nie biegną domyślnie. Uruchomienie (po `npx playwright install firefox`):
    //   npx playwright test --project=firefox
    {
      name: 'firefox',
      default: false,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      default: false,
      use: { ...devices['Desktop Safari'] },
    },
  ],

  // Playwright sam uruchamia aplikację przed testami i zamyka ją po nich.
  // Jeśli aplikacja już działa (npm start w innym oknie), użyje działającej.
  // Gdy BASE_URL wskazuje inny komputer niż localhost, aplikacji lokalnie nie uruchamiamy.
  webServer: /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(process.env.BASE_URL || 'http://localhost')
    ? {
        command: 'node --disable-warning=ExperimentalWarning app/server.mjs',
        url: `http://localhost:${process.env.PORT || 4100}/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      }
    : undefined,
});
