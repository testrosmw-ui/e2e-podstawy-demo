# Moje review

## Ćwiczenie 08: poprawki do planu

Plan: testy zmiany adresu dostawy na podstawie `docs/scenariusze/zmiana-adresu.md` (TC-ADR-01, TC-ADR-02) i `docs/scenariusze/zmiana-adresu.feature`. Review według `docs/lista-kontrolna-review.md`.

### Oczekiwane wyniki i punkty planu, które je sprawdzają

| Nr | Oczekiwany wynik (źródło) | Punkt planu | Ocena |
|---|---|---|---|
| W1 | Nagłówek „Zalogowano jako user (user)” (TC-ADR-01 krok 1) | beforeEach: logowanie, „czekamy na” napis | Jest, ale tylko jako „czekamy”. Ma być jawna asercja (poprawka 6) |
| W2 | Nagłówek strony „Zmiana adresu dostawy” (TC-ADR-01 krok 2) | beforeEach: sprawdzenie nagłówka | OK |
| W3 | Pola zawierają adres startowy (TC-ADR-01 krok 2) | T1 krok 1 | Częściowo: tylko Miasto i Kod pocztowy (poprawka 4) |
| W4 | Pola pokazują wpisane wartości (TC-ADR-01 krok 3) | brak osobnej asercji | Pokryte pośrednio przez W6 (pola po odświeżeniu). Asercja zaraz po `fill` przeszłaby zawsze, więc jej nie dodajemy |
| W5 | Komunikat „Zapisano adres dostawy.” (TC-ADR-01 krok 4, .feature) | T1: `status` ma tekst | OK |
| W6 | Po odświeżeniu pola mają nowy adres (TC-ADR-01 krok 5, .feature: Miasto „Kraków”) | T1: 4 pola `toHaveValue` po `reload` | OK, plan sprawdza więcej niż .feature |
| W7 | Formularz z adresem startowym (TC-ADR-02 krok 1) | brak w T2–T4 | Luka (poprawka 4) |
| W8 | „Popraw błędy w formularzu (1).” (TC-ADR-02 krok 3, .feature) | T2–T4: `alert` ma tekst | OK |
| W9 | Pod polem komunikat błędu, 3 przykłady (TC-ADR-02 krok 3, .feature) | T2–T4: `getByText` albo `toHaveAccessibleDescription(/…/)` | Do poprawy: plan zostawia wybór i dopuszcza dopasowanie fragmentu (poprawka 3) |
| W10 | Brak komunikatu „Zapisano adres dostawy.” (TC-ADR-02 krok 3) | T2–T4: `getByRole('status')` → `not.toBeVisible()` | Do poprawy: szukać prawdziwego tekstu (poprawka 5) |
| W11 | Błędny adres się nie zapisał (TC-ADR-02 krok 4, .feature „adres się nie zmieni”) | T2–T4 krok 3: ponowne wejście przez menu, „np. Kod pocztowy = 00-001” | Częściowo: tylko jedno pole, opisane jako „np.” (poprawka 2) |
| W12 | Po teście adres startowy (TC-ADR-01 „Po teście”) | afterEach: POST `/api/account/address` z adresem startowym, status 200 | OK, ale bez sprawdzenia treści odpowiedzi (poprawka 7) |

### Trzy rzeczy do sprawdzenia

- **Czy plan przywraca adres startowy po teście?** Tak. `afterEach` wysyła adres startowy przez API i sprawdza status 200. Dodatkowo `beforeEach` ustawia ten adres przed testem, więc test nie zależy od „zabrudzonej” bazy (przy przejściu w przeglądarce Kod pocztowy miał `00-000` zamiast `00-001`). Brakuje sprawdzenia treści odpowiedzi (poprawka 7).
- **Czy sprawdza, że błędny adres się nie zapisał?** Tak, ale za słabo: tylko jedno pole i „np.” zamiast konkretnej asercji (poprawka 2).
- **Czy używa konta `user`?** Tak, `user` / `user123` w `beforeEach`. Asercja na „Zalogowano jako user (user)” ma być jawna (poprawka 6).

### Lista poprawek

1. **Ścieżka pliku.** Test ma być w `tests/cwiczenia/08-zmiana-adresu.spec.ts`, nie w `tests/zmiana-adresu.spec.ts`. Linia `test.describe.configure({ mode: 'serial' });` na początku grupy zostaje.
2. **Błędny adres się nie zapisał: sprawdź cały adres.** W T2–T4 po ponownym wejściu przez link „Adres dostawy” sprawdź `toHaveValue` dla wszystkich 4 pól: `ul. Przykładowa 12/3`, `00-001`, `Warszawa`, `500 100 200`. Bez „np.”.
3. **Komunikat pod polem: dokładny tekst.** Zamknij pytanie z sekcji 5 planu: `await expect(page.getByText('Kod pocztowy musi mieć format 00-000', { exact: true })).toBeVisible()`. Bez `{ exact: true }` `getByText` dopasowuje fragment tekstu i nie zwraca uwagi na wielkość liter. Nie używaj wyrażenia regularnego `/…/` w `toHaveAccessibleDescription`: to też dopasowanie fragmentu (lista kontrolna, pyt. 5). `aria-invalid` zostaw jako dodatek, nie zamiast tekstu.
4. **Adres startowy na początku każdego testu.** W T1 krok 1 sprawdź wszystkie 4 pola, nie tylko Miasto i Kod pocztowy. Dodaj tę samą asercję jako krok 0 w T2–T4 (TC-ADR-02 krok 1: „Formularz z adresem startowym”). Dzięki temu asercja z poprawki 2 nie przejdzie przypadkiem (lista kontrolna, pyt. 3).
5. **Brak komunikatu sukcesu: prawdziwy tekst.** Zamiast `getByRole('status')` → `not.toBeVisible()` użyj `getByText('Zapisano adres dostawy.')` → `not.toBeVisible()`. Ten tekst aplikacja naprawdę pokazuje (widziany w T1), więc asercja z `not` coś sprawdza (lista kontrolna, pyt. 13).
6. **Konto `user`: jawna asercja.** W `beforeEach` po kliknięciu „Zaloguj”: `await expect(page.getByText('Zalogowano jako user (user)')).toBeVisible()`. W planie jest tylko „czekamy na”.
7. **Sprzątanie: status i treść odpowiedzi.** W `afterEach` (i w `beforeEach`) sprawdź status 200 i to, że odpowiedź zawiera `city: 'Warszawa'` i `postal_code: '00-001'` (CLAUDE.md: „sprawdzaj status i treść odpowiedzi”).
8. **Trzy osobne testy zamiast pętli.** Zamknij pytanie z sekcji 5 planu: T2, T3, T4 jako trzy osobne `test(...)` z nazwami „Błędny kod pocztowy blokuje zapis adresu”, „Błędny telefon blokuje zapis adresu”, „Puste miasto blokuje zapis adresu”. Testy czytają osoby, które uczą się kodu (CLAUDE.md), a w raporcie od razu widać, który przykład padł.
9. **Nazwy i komentarze z numerem przypadku.** W komentarzu nad testem podaj, co test sprawdza: `// TC-ADR-01` przy T1, `// TC-ADR-02 i .feature, przykład 1` przy T2 itd. (lista kontrolna, pyt. 1).
10. **Weryfikacja, że test potrafi paść.** Dopisz do planu: (a) uruchom plik dwa razy pod rząd, za każdym razem `4 passed`; (b) zmień na chwilę oczekiwany komunikat w T2 i uruchom, ma być `1 failed`; (c) po teście otwórz „Adres dostawy” jako `user` i sprawdź, że Miasto to „Warszawa” (lista kontrolna, pyt. 9 i 12; kryterium „gotowe”).
11. **Pozostałe pomysły z sekcji 5 planu (+48, dwa błędy naraz, test API) poza zakresem.** Nie ma ich w przypadku testowym. Nie dopisujemy ich do tego pliku.
