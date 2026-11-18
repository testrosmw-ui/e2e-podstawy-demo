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

## Ćwiczenie 08 część B: porównanie formatów

Porównanie `docs/scenariusze/biuro-mikolaja.md` (TC-FV-01, Azure Test Plans) z `docs/scenariusze/biuro-mikolaja.feature` (Gherkin). Numery linii dotyczą pliku `.feature`.

### Kroki z Azure Test Plans i linie w Gherkinie

| Krok w Azure Test Plans | Linia w `.feature` | Różnica |
|---|---|---|
| 1. Zaloguj się jako `@klient` → „Zalogowano jako biuro (user)” | 8 (`Zakładając, że jestem zalogowany jako "biuro"…`) | Gherkin nie ma oczekiwanego wyniku (napisu w nagłówku). Logowanie jest tylko założeniem |
| (warunek wstępny: koszyk pusty) | 9 (`Oraz mój koszyk jest pusty`) | W Azure tylko jako warunek wstępny, w Gherkinie jako krok założeń |
| 2. Karta produktu, „Ilość” 10, „Dodaj do koszyka” → „Dodano do koszyka: Kalendarz adwentowy 2026” | 12 | Gherkin nie ma komunikatu „Dodano do koszyka: …” ani nazwy pola „Ilość” |
| 3. Otwórz „Koszyk” → jedna pozycja, ilość 10, „Pozycji: 1, razem: 399,90 zł” | brak | W Gherkinie nie ma sprawdzenia koszyka |
| 4. „Faktura na firmę”, NIP, nazwa firmy, „Złóż zamówienie (płatność przy odbiorze)” → „Złożono zamówienie: ZAM-…” | 13–17 | Brak. Gherkin podaje dokładne etykiety pól („NIP”, „Nazwa firmy”) |
| 5. Kliknij numer na liście „Moje zamówienia” → status „Nowe”, „Faktura na firmę: Biuro Mikołaja, NIP 2412241228”, przycisk „Pobierz fakturę” | 18 | Gherkin nie mówi, jak otworzyć zamówienie, i nie sprawdza nazwy firmy ani przycisku „Pobierz fakturę” |
| 6. Wyloguj, zaloguj jako `admin`, `/admin/zamowienia/<numer>` → status „Nowe”, pole „Status zamówienia” | 19 (częściowo) | Gherkin nie mówi o wylogowaniu, koncie i haśle admina ani o adresie strony. Brak oczekiwanego wyniku |
| 7. Status „Opłacone”, „Zapisz status” → status „Opłacone” | 19 | Brak asercji po zmianie na „Opłacone” i przycisku „Zapisz status” |
| 8. Status „Wysłane”, „Zapisz status” → status „Wysłane” | 19 | Brak asercji w panelu admina |
| 9. Wyloguj, zaloguj jako `@klient`, otwórz zamówienie → status „Wysłane” | 20 | Gherkin nie mówi o ponownym zalogowaniu jako `biuro` |
| 10. „Pobierz fakturę” → `faktura-<numer>.html`, „NIP nabywcy: 2412241228”, nabywca „Biuro Mikołaja”, pozycja 10 × 39,99 zł = 399,90 zł, „Razem do zapłaty: 399,90 zł” | 21–27 | Gherkin nie sprawdza nabywcy „Biuro Mikołaja” na fakturze |
| Po teście: zamówienie zostaje jako „Wysłane”, stan przywraca `npm run db:reset` | brak | Gherkin nie mówi o stanie po teście |

### Czego brakuje w Gherkinie

- Oczekiwanych wyników kroków pośrednich: napisu po zalogowaniu (krok 1), komunikatu „Dodano do koszyka: …” (krok 2) i całego sprawdzenia koszyka z sumą 399,90 zł (krok 3).
- Nazwy firmy „Biuro Mikołaja” na stronie zamówienia (krok 5) i na fakturze (krok 10). Gherkin sprawdza tylko NIP, a księgowej zależy na danych nabywcy.
- Szczegółów kroków admina (kroki 6–8): konta `admin` / `admin123`, adresu `/admin/zamowienia/<numer>`, pola „Status zamówienia”, przycisku „Zapisz status” i statusu po każdej zmianie. Linia 19 łączy trzy kroki w jedno zdanie bez asercji.
- Wylogowania i ponownego zalogowania jako `biuro` (krok 9).
- Informacji o stanie po teście (zamówienie zostaje w bazie, `npm run db:reset`).

### Czego brakuje w krokach Azure Test Plans

- Dokładnych etykiet pól faktury. Azure pisze „wpisz NIP `@nip` i nazwę firmy `@firma`”, a Gherkin w tabeli w liniach 14–15 podaje etykiety „NIP” i „Nazwa firmy”.
- Układu pozycji na fakturze. W Azure wartości są wymienione w zdaniu („ilość 10, cena 39,99 zł, wartość 399,90 zł”). Gherkin w liniach 25–26 podaje tabelę z kolumnami „Nazwa | Ilość | Cena | Wartość”, więc wiadomo, która wartość jest w której kolumnie.
- Krótkiego opisu, kto i po co korzysta z funkcji (linie 3–4: klient firmowy zamawia na fakturę, admin zmienia status, klient pobiera fakturę z NIP-em). Azure ma tylko tytuł.

## Ćwiczenie 10: skill test-e2e

Test `tests/cwiczenia/10-filtr-kategorii.spec.ts` napisany przez `/test-e2e`. Przeszedł listą kontrolną bez „nie”: liczba wierszy i licznik padają bez filtra (21 zamiast 3), z liczbą 4 test dał `1 failed`. Wniosek dla skilla: krok 2 (przejście w przeglądarce) wykrył sekcję „Oferta na Czarny Piątek” z kartami produktów, więc liczymy tylko w tabeli.

### Marketplace skilli

- **Kto byłby właścicielem skilla?** Zespół QA, a w nim jedna wskazana osoba (opiekun repo testów). Ona zatwierdza zmiany i odpowiada za to, że skill pasuje do aktualnego `CLAUDE.md` i listy kontrolnej.
- **Jak zgłosić poprawkę, gdy skill napisze zły test?** Zgłoszenie (issue albo pull request) w repo marketplace: nazwa i wersja skilla, polecenie, którym go wywołano, zły test i punkt listy kontrolnej, który nie przeszedł, oraz propozycja zmiany kroku w `SKILL.md` jako polecenia. Opiekun robi review, zmienia skill i wydaje nową wersję dla całego zespołu.

## Ćwiczenie 11: funkcja zaloguj i uruchamianie wybranych testów

### Odpowiedzi z kroku 1 (`tests/pomocnicze/logowanie.ts`)

- **Którym kontem loguje `await zaloguj(page);` bez zmiennych?** `user` / `user123`: linie 10–11 biorą `APP_USER` i `APP_PASSWORD`, a gdy ich nie ma, wartości domyślne.
- **Jak zalogować inne konto bez zmiany pliku?** (1) Zmienne środowiskowe `$env:APP_USER` i `$env:APP_PASSWORD` przed uruchomieniem testów. (2) Parametry w wywołaniu: `await zaloguj(page, 'biuro', 'biuro123');`.
- **Co się stanie przy złym haśle?** Test pada od razu w funkcji `zaloguj`, po czasie oczekiwania asercji, z błędem `toBeVisible` na „Zalogowano jako …”. Decyduje linia 22: `await expect(page.getByText(`Zalogowano jako ${login}`)).toBeVisible();`. Bez niej test szedłby dalej niezalogowany.

### Polecenia uruchamiania (PowerShell)

| Co | Polecenie |
|---|---|
| Jeden katalog | `npx playwright test tests/czytanie` |
| Testy z tagiem | `npx playwright test --grep "@zamowienia"` |
| Wszystko poza tagiem | `npx playwright test --grep-invert "@zamowienia"` |
| Wybrana przeglądarka | `npx playwright test tests/czytanie --project=chromium` |
| Z oknem przeglądarki | `npx playwright test tests/czytanie/01-wyszukiwarka.spec.ts --headed` |
| Tryb UI | `npx playwright test --ui` |
| Wspólny serwer | `$env:BASE_URL="https://namssor-376292984721.europe-central2.run.app"`, potem polecenie testów, na koniec `Remove-Item Env:BASE_URL` |
| Konto pary | `$env:APP_USER="tester05"` i `$env:APP_PASSWORD="czarny-piatek-2026"`, potem polecenie testów, na koniec `Remove-Item Env:APP_USER` i `Remove-Item Env:APP_PASSWORD` |

## Ćwiczenie 12c: hotfix Mirka

Przed hotfiksem: `88 passed`, `8 skipped`. Z `APP_VERSION=hotfix`: `17 failed`, `8 skipped`, `65 passed`.

### Diagnoza

| Test (plik i linia) | Pierwsza linia błędu | Przyczyna | Decyzja |
|---|---|---|---|
| `cwiczenia/04-adres-walidacja:6`, `cwiczenia/08-zmiana-adresu:44`, `review/03-adres-walidacja:7`, `review/05-zmiana-adresu:6`, `test-4:3` | `locator.click: Test timeout` na przycisku „Zapisz adres” | przycisk ma napis „Zapisz”: zmieniony tekst | test do poprawy |
| `cwiczenia/04-karta-produktu:7` i `:44`, `cwiczenia/06-platnosc-w-ramce:28`, `cwiczenia/08-biuro-mikolaja:11` (pierwszy błąd) | „Dodano do koszyka: …” not found | komunikat „Produkt w koszyku: …”: zmieniony tekst | test do poprawy |
| `czytanie/05-karta-produktu:13` i `:26`, `smoke:36` | `Received: "Na stanie: 100 szt."` / `"Chwilowo brak"` | nowe teksty dostępności: zmieniony tekst | test do poprawy |
| `polowanie/kod-jesien10-wygasl:22`, `review/06-kod-rabatowy:6`, `projekt/p11-kod-rabatowy:29` | `locator.click: Test timeout` na „Zastosuj kod” | przycisk „Użyj kodu”: zmieniony tekst | test do poprawy |
| `projekt/p15-status-zamowienia:19` | `locator.selectOption: Test timeout` na „Opłacone” | opcja „Zapłacone” (podpowiedź pod polem nadal mówi „Opłacone”): zmieniony tekst | test do poprawy |
| `projekt/p16-ilosc-z-karty:20`, `cwiczenia/08-biuro-mikolaja:11` (po poprawie tekstów) | „Pozycji: 1, razem: 959,76 zł” / „399,90 zł” not found | koszyk liczy źle: suma „razem” to cena jednej sztuki | **błąd do zgłoszenia** |

Gałąź `hotfix-testy` (commit „Testy pod hotfix: nowe etykiety”): z hotfiksem `86 passed`, `2 failed` (tylko błąd sumy), `8 skipped`. Na `main` bez hotfiksu: `88 passed`.

### Zgłoszenie dla Mirka

```
Tytuł: Suma „razem” w koszyku liczy jedną sztukę zamiast całej pozycji
Wersja: hotfix
Kroki: 1. Zaloguj się jako user / user123.
       2. Otwórz kartę „Kalendarz adwentowy 2026”, wpisz „Ilość” 24, kliknij „Dodaj do koszyka”.
       3. Otwórz „Koszyk”.
Oczekiwany wynik: wiersz: ilość 24, wartość 959,76 zł; pod tabelą „Pozycji: 1, razem: 959,76 zł”.
Faktyczny wynik: wiersz poprawny (24, 959,76 zł), ale „Pozycji: 1, razem: 39,99 zł”. Klient zapłaciłby za 1 sztukę zamiast 24.
Test: tests/projekt/p16-ilosc-z-karty.spec.ts › P16: ilość z karty produktu › 24 kalendarze adwentowe z karty produktu
      dają w koszyku ilość 24 i wartość 959,76 zł (failed na hotfix, passed bez APP_VERSION).
      Drugi dowód: tests/cwiczenia/08-biuro-mikolaja.spec.ts (10 kalendarzy: „razem” 39,99 zł zamiast 399,90 zł).
```

Uwaga: hotfix nie był „tylko tekstami”. Zmiana tekstów popsuła 15 testów w 14 plikach, bo te same napisy stoją w wielu plikach.

### Dla szybszych: ile testów poprawiliśmy przez jedną zmianę tekstu

Pięć zmian tekstu w hotfiksie popsuło 15 testów w 14 plikach:

| Zmieniony tekst | Pliki do poprawy |
|---|---|
| „Zapisz adres” → „Zapisz” | 5 |
| „Dodano do koszyka” → „Produkt w koszyku” | 4 |
| „Dostępny” / „Niedostępny” → „Na stanie:” / „Chwilowo brak” | 3 |
| „Zastosuj kod” → „Użyj kodu” | 3 (w P11 trzy razy w jednym pliku) |
| „Opłacone” → „Zapłacone” | 1 |

Dlaczego tyle: każdy test sam wpisuje napis przycisku albo komunikatu. Logowanie nie padło ani razu, bo stoi w jednym miejscu (`zaloguj`).

**Przepisany test:** `tests/projekt/p11-kod-rabatowy.spec.ts` używa funkcji `uzyjKoduRabatowego(page, kod)` z `tests/pomocnicze/koszyk.ts`. Napis „Zastosuj kod” stoi tylko tam. Sprawdzenie:
- wersja zwykła: `3 passed`;
- hotfix: `1 failed` (czeka na przycisk „Zastosuj kod”);
- hotfix po zmianie jednej linii w `koszyk.ts` na „Użyj kodu”: `3 passed` (zmianę cofnęliśmy, bo `main` jest bez hotfiksu).

Pozostałe pliki z „Zastosuj kod” (`polowanie/kod-jesien10-wygasl`, `review/06-kod-rabatowy`, `cwiczenia/04-karta-produktu`) można przepiąć tak samo.

Kryterium 4 po powrocie na `main` (bez `APP_VERSION`, po `npm run db:reset`): `89 passed`, `8 skipped`.

## Ćwiczenie 12: spotkanie „wydajemy czy nie” (szkic, 5 minut)

**1. Co pokrywa pakiet (1,5 min).** `tests/projekt/`: 9 scenariuszy, 17 testów. E2E: P2 (koszyk wymaga logowania), P4 (brak uprawnień do panelu), P9 (cena promocyjna w 3 miejscach), P11 (kody rabatowe), P15 (statusy w panelu admina), P16 (ilość z karty, także granica 1001). API: P5 (katalog), P13 (odliczanie, 26.11 i 27.11 po zmianie Bożeny), P14 (zamówienie firmowe i faktura). `--repeat-each=3`: 51 passed. Nie pokrywamy: P1, P3, P6–P8, P10, P12 (brak czasu; P10 częściowo w ćwiczeniu 08 „Biuro Mikołaja”). Testy z kontem admin (P14, P15) biegną tylko lokalnie.

**2. Co znaleźliśmy (2 min).**
- Polowanie na `rc` (konto tester08): 6 zaliczonych błędów: wygasły kod JESIEN10 przyjęty (#2), NIP sprzedawcy na fakturze zamiast NIP-u nabywcy (#3), sortowanie po cenie jak tekst (#5), kod pocztowy 00950 w „Moich adresach” (#6), nowy adres sam domyślny (#7), 200 i `{}` zamiast 404 dla nieistniejącego zamówienia (#8). Do tego 2 niespodzianki. Podwójna promocja w koszyku (krem 21,11 zł zamiast 26,39 zł) nie zaliczona przez trenera.
- Hotfix Mirka: nie tylko teksty. Suma „razem” w koszyku liczy 1 sztukę: 24 kalendarze = 39,99 zł zamiast 959,76 zł. Test: `p16-ilosc-z-karty.spec.ts` (failed na hotfix, passed bez niego).
- Review krzyżowe: (uzupełnić po 13:30).

**3. Rekomendacja (1 min): nie wydajemy ani `rc`, ani hotfiksu.**
- Hotfix: test „24 kalendarze adwentowe z karty produktu dają w koszyku ilość 24 i wartość 959,76 zł” jest czerwony: klient Biura Mikołaja zapłaciłby za 1 kalendarz zamiast 24.
- `rc`: test „faktura zamówienia firmowego ma NIP nabywcy z zamówienia, a nie NIP sprzedawcy” jest czerwony: dokładnie to, o co prosiła księgowa Biura.
- Wydajemy, gdy oba testy będą zielone na nowej wersji i pakiet `tests/projekt` przejdzie 3 razy pod rząd.

**Pokaz:** P16 zielony na wersji zwykłej (`npx playwright test tests/projekt/p16`) i czerwony z `$env:APP_VERSION="hotfix"` (aplikacja uruchomiona z tą zmienną).

## Ćwiczenie 12b dla szybszych

**Nowy test w P16:** „ilość 1001 z karty produktu pokazuje komunikat o zakresie i nie zmienia koszyka” (`tests/projekt/p16-ilosc-z-karty.spec.ts`). Sprawdza alert „Ilość musi być liczbą całkowitą od 1 do 1000.” i pusty koszyk („Pozycji: 0, razem: 0,00 zł”). Pada, gdy wpiszemy 1000 zamiast 1001.

### Asercje, które padną przy następnej zmianie Bożeny (notatki na prezentację)

Zależne od **daty**:
- `tests/projekt/p13-odliczanie.spec.ts`: tablica `daty` (26.11 → 1 dzień, 27.11 → „trwa!”). Bezpieczne, bo data idzie w nagłówku `X-Namssor-Teraz`, ale każda nowa data od Bożeny to zmiana tablicy.
- `tests/projekt/p14-zamowienie-firmowe-api.spec.ts`: numer faktury `FV/2026/<numer>`. Padnie 1 stycznia 2027.
- `tests/polowanie/kod-jesien10-wygasl.spec.ts`: „Kod JESIEN10 wygasł 31.10.2026.”. Zakłada, że dziś jest po 31.10.2026.
- `tests/projekt/p9-cena-promocyjna.spec.ts`, `tests/projekt/p11-kod-rabatowy.spec.ts`, `tests/polowanie/cena-promocyjna-w-koszyku.spec.ts`: cena 26,39 zł (-20%) i kod CZARNY20. Padną, jeśli promocja ma datę końca albo Bożena zmieni rabat.

Zależne od **ilości**:
- `tests/projekt/p16-ilosc-z-karty.spec.ts`: 24 sztuki, „959,76 zł”, „Pozycji: 1, razem: 959,76 zł” oraz limit 1000 w nowym teście.
- `tests/cwiczenia/08-biuro-mikolaja.spec.ts`: 10 kalendarzy, „399,90 zł” w koszyku i na fakturze (scenariusz sprzed zmiany na 24 sztuki).
- `tests/cwiczenia/09-api.spec.ts`: limit API „Ilość musi być liczbą całkowitą od 1 do 10” (inny niż 1000 na karcie produktu).
- `tests/projekt/p11-kod-rabatowy.spec.ts`, `tests/polowanie/kod-jesien10-wygasl.spec.ts`: „Pozycji: 1, razem: 4,99 zł” (jedno mydło).
- `tests/cwiczenia/10-filtr-kategorii.spec.ts`: „dokładnie 3 produkty” w kategorii Dziecko. Padnie po dodaniu produktu do katalogu.
