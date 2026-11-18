# Projekt w parach: pakiet regresji przed Czarnym Piątkiem

Środa, dzień zamrożenia kodu. O 15:00 Bożena pyta: „wydajemy czy nie?”. Odpowiedź daje wasz pakiet testów.

Scenariusze są w dwóch grupach:
- **P1–P12**: zamówione wcześniej. Osiem z pierwszej wersji projektu i cztery z Czarnego Piątku (karta produktu, kod rabatowy, faktura, drugi adres).
- **P13–P16**: „scenariusze Bożeny”. Bożena zapowiada, że o 13:00 coś w nich zmieni.

Wybierzcie co najmniej cztery scenariusze z P1–P12, w tym co najmniej jeden API i jeden z kontem `admin`. Numery wpiszcie w linii „Wybrane” pod nagłówkiem „Scenariusze”. Do P13–P16 przechodzicie, gdy pierwsza czwórka jest gotowa.

Testy zapisujecie w folderze `tests/projekt/`, jeden scenariusz w jednym pliku: `tests/projekt/p1-zakup.spec.ts`, `tests/projekt/p9-cena-promocyjna.spec.ts` itd. Do logowania używajcie funkcji `zaloguj(page)` i `zalogujPrzezApi(request)` z `tests/pomocnicze/logowanie.ts` (ćwiczenie 11): wtedy ten sam test zadziała na wspólnym serwerze z kontem waszej pary.

## Zasada pracy

Każdy test przechodzi review drugiej osoby z pary, zanim trafi do commita. Osoba, która pisała test z Claude Code, oddaje klawiaturę. Druga osoba czyta test z listą kontrolną review (`docs/lista-kontrolna-review.md`) i mówi, co poprawić. Role zmieniacie po każdym teście.

## Scenariusze

Wybrane: P2, P4, P5, P9, P11

### P1. Zakup z płatnością przy odbiorze (E2E)

Zalogowany klient (`user`) dodaje do koszyka „Balsam do ciała” i klika „Złóż zamówienie (płatność przy odbiorze)”.

Oczekiwany wynik:
- aplikacja przechodzi na stronę „Moje zamówienia” i pokazuje komunikat „Złożono zamówienie: ZAM-…” z nowym numerem;
- na liście jest wiersz z tym numerem, produktem „Balsam do ciała” i statusem „Nowe”;
- na stronie „Produkty” stan „Balsam do ciała” jest mniejszy o 1 niż przed zakupem.

### P2. Koszyk wymaga logowania (E2E)

Niezalogowany klient otwiera adres `/koszyk`, a potem loguje się jako `user` / `user123`.

Oczekiwany wynik:
- przed logowaniem aplikacja pokazuje stronę „Logowanie”, adres zawiera `next=%2Fkoszyk`;
- po zalogowaniu klient wraca na stronę „Koszyk”, a nie na stronę główną.

### P3. Administrator dodaje produkt (E2E)

Administrator (`admin`) na stronie „Panel admina” › „Produkty” dodaje produkt: nazwa unikalna (np. z datą i godziną), kategoria „Testowe”, cena `12,50`, stan `5`.

Oczekiwany wynik:
- komunikat „Dodano produkt: <nazwa>”;
- na stronie „Produkty” wyszukiwarka znajduje ten produkt, z ceną „12,50 zł”, jako „Dostępny”, z aktywnym przyciskiem „Dodaj do koszyka”.

Uwaga: pod tabelą są kafelki z tymi samymi nazwami i cenami, więc `getByText` z nazwą albo ceną znajdzie dwa elementy. Sprawdzaj w wierszu tabeli: `page.getByRole('row').filter({ hasText: nazwa })`.

### P4. Klient nie wejdzie do panelu administratora (E2E)

Klient (`user`) po zalogowaniu otwiera adres `/admin`.

Oczekiwany wynik:
- strona z nagłówkiem „Brak uprawnień” i tekstem „Ta strona wymaga roli admin.”;
- w menu klienta nie ma pozycji „Panel admina”, a w menu administratora jest.

### P5. Katalog produktów w API (API)

`GET /api/products?category=Dziecko` oraz `GET /api/products/999`.

Oczekiwany wynik:
- pierwsze żądanie: status 200, lista 3 produktów, każdy z `category` równym `"Dziecko"`;
- drugie żądanie: status 404 i treść `{ "error": "Nie ma takiego produktu" }`.

### P6. Zamówienie przez API i błędne dane (API)

Klient loguje się przez `POST /api/login` i składa zamówienie `POST /api/orders` z treścią `{ "product_id": 10, "qty": 2 }`.

Oczekiwany wynik:
- status 201, w odpowiedzi nowy numer `ZAM-…`, `qty` równe 2, `status` równy `"new"`, `product` równy `"Balsam do ciała"`;
- `GET /api/orders/<numer>` zwraca 200 i to samo zamówienie;
- `qty` równe 0 daje status 400, a w `errors` jest pole `qty`;
- produkt niedostępny (`product_id` 3) daje status 409 i `{ "error": "Brak towaru na stanie" }`.

### P7. Klient nie widzi cudzych zamówień (API)

`ZAM-1005` należy do konta `admin`, `ZAM-1001` do konta `user`.

Oczekiwany wynik:
- klient `user`: `GET /api/orders/ZAM-1001` daje 200, `GET /api/orders/ZAM-1005` daje 404 i `{ "error": "Nie ma takiego zamówienia" }`;
- administrator: `GET /api/orders/ZAM-1001` daje 200;
- bez logowania: 401 i `{ "error": "Wymagane logowanie" }`.

### P8. Zamówienie z API anulowane w panelu (API + E2E)

Test zakłada zamówienie przez API jako `user`. Administrator znajduje je w „Panel admina” › „Zamówienia” po numerze i klika „Anuluj”.

Oczekiwany wynik:
- w wierszu tego zamówienia status „Anulowane” i brak przycisku „Anuluj”;
- `GET /api/orders/<numer>` zwraca `status` równy `"cancelled"`;
- inne zamówienia nie zmieniły statusu.

### P9. Ta sama cena promocyjna w trzech miejscach (E2E)

Zalogowany klient otwiera stronę „Produkty”, kafelek „Krem do twarzy na dzień”, potem jego kartę produktu i dodaje krem do koszyka.

Oczekiwany wynik:
- na kafelku i na karcie produktu: stara cena „32,99 zł” przekreślona, nowa cena „26,39 zł”, plakietka „-20%”;
- w koszyku w wierszu „Krem do twarzy na dzień” cena „26,39 zł”.

Test na koniec usuwa krem z koszyka.

### P10. Zamówienie na firmę i faktura (E2E)

Biuro Mikołaja (`biuro` / `biuro123`) dodaje do koszyka „Kalendarz adwentowy 2026”, zaznacza „Faktura na firmę”, wpisuje NIP `101-202-30-36` i nazwę firmy „Biuro Mikołaja”, klika „Złóż zamówienie (płatność przy odbiorze)”.

Oczekiwany wynik:
- strona „Moje zamówienia”, a w adresie strony numer nowego zamówienia (`zlozono=ZAM-…`);
- na stronie tego zamówienia: „Faktura na firmę: Biuro Mikołaja” i NIP `1012023036`;
- „Pobierz fakturę” pobiera plik `faktura-ZAM-….html` z numerem faktury `FV/2026/ZAM-…`, danymi nabywcy i kwotą „Razem do zapłaty: 39,99 zł”;
- NIP `101-202-30-37` (zła suma kontrolna) zatrzymuje zamówienie: komunikat „Nieprawidłowy NIP: błędna suma kontrolna”, klient zostaje w koszyku.

### P11. Kod rabatowy w koszyku (E2E)

Zalogowany klient ma w koszyku „Mydło w kostce” i wpisuje kod w pole „Kod rabatowy”.

Oczekiwany wynik:
- `CZARNY20`: komunikat „Kod CZARNY20 przyjęty: -20% na całe zamówienie.” i pod sumą linia „Przed rabatem: …, rabat (CZARNY20): -…”;
- `NIEMA`: komunikat „Nie ma takiego kodu rabatowego: NIEMA”, bez rabatu;
- `WLOSY15`, gdy w koszyku nie ma produktów z kategorii „Włosy”: komunikat „Kod WLOSY15 działa tylko na produkty z kategorii Włosy. W koszyku nie ma takich produktów.”

Test na koniec usuwa kod i mydło z koszyka.

### P12. Drugi adres w profilu (E2E)

Zalogowany klient na stronie „Moje adresy” dodaje adres: nazwa unikalna (np. „Praca” z godziną), `ul. Biurowa 7`, `00-950`, `Warszawa`, `600 700 800`. Potem ustawia go jako domyślny.

Oczekiwany wynik:
- komunikat „Dodano adres: <nazwa>” i nowy adres na liście;
- po kliknięciu „Ustaw jako domyślny” plakietka „Domyślny” jest przy nowym adresie i na stronie jest tylko jedna taka plakietka;
- „Adres główny” nie ma przycisku „Usuń”.

Test na koniec usuwa swój adres. Wtedy „Domyślny” wraca do „Adres główny”.

## Scenariusze Bożeny (P13–P16)

> Bożena, product ownerka: „Te cztery są już ostateczne. Najwyżej coś drobnego o 13:00. Ostatni raz, obiecuję.”

### P13. Odliczanie do Czarnego Piątku (API)

`GET /api/promocja` z nagłówkiem `X-Namssor-Teraz: 2026-11-20` (opis nagłówka w `/api/docs`).

Oczekiwany wynik:
- status 200, `days_left` równe 7, `message` równe „Czarny Piątek w Namssorze startuje 27.11.2026. Do startu promocji zostało 7 dni.”;
- nagłówek `X-Namssor-Teraz: jutro` daje status 400.

### P14. Zamówienie firmowe przez API (API)

Biuro Mikołaja loguje się przez `POST /api/login` i składa `POST /api/business-orders` z treścią `{ "product_id": 21, "qty": 10, "nip": "101-202-30-36", "company": "Biuro Mikołaja" }`.

Oczekiwany wynik:
- status 201, `status` równy `"new"`, `qty` równe 10, `total_cents` równe 39990, `invoice.company` równe `"Biuro Mikołaja"`;
- `GET /api/orders/<numer>/invoice` zwraca 200 i `invoice_number` równy `FV/2026/<numer>`;
- `qty` równe 1001 daje 400, a w `errors` jest pole `qty`.

### P15. Status zamówienia w panelu admina (API + E2E)

Test składa zamówienie przez API jako klient. Administrator otwiera `/admin/zamowienia/<numer>`, wybiera w polu „Status zamówienia” „Opłacone” i klika „Zapisz status”, potem tak samo „Wysłane”.

Oczekiwany wynik:
- po każdym zapisie status na stronie zamówienia to odpowiednio „Opłacone” i „Wysłane”;
- klient widzi w `GET /api/orders/<numer>` `status` równy `"shipped"`.

### P16. Ilość z karty produktu (E2E)

Zalogowany klient na karcie produktu „Żel pod prysznic” wpisuje w pole „Ilość” 3 i klika „Dodaj do koszyka”.

Oczekiwany wynik:
- w koszyku wiersz „Żel pod prysznic”: ilość 3, wartość „29,97 zł”;
- suma „razem” w koszyku jest równa sumie kolumny „Wartość”.

## Dane i stan aplikacji

- Konta lokalne: `user` / `user123`, `admin` / `admin123`, `biuro` / `biuro123`.
- Na wspólnym serwerze każda osoba ma swoje konto `tester01`–`tester12` (hasło `czarny-piatek-2026`). Konto `admin` tam jest, ale jego hasło zna tylko trener. Para ustawia konto w oknie testów, zanim uruchomi testy. Zamiast `tester05` wpiszcie swój numer:
  ```powershell
  $env:APP_USER="tester05"
  $env:APP_PASSWORD="czarny-piatek-2026"
  ```
  Testy z kontem `admin` uruchamiacie tylko lokalnie.
- Opis API: http://localhost:4100/api/docs.
- Koszyk i adresy należą do konta. Testy, które zmieniają koszyk tego samego konta, przeszkadzają sobie, gdy biegną równolegle. Dlatego pakiet sprawdzacie z `--workers=1`, a testy z jednego pliku, które dzielą koszyk, oznaczacie `test.describe.configure({ mode: 'serial' });`.
- Testy, które dodają dane, używają unikalnych nazw i po sobie sprzątają. Stan startowy lokalnie przywraca `npm run db:reset` (przy zatrzymanej aplikacji). Na wspólnym serwerze resetu nie ma: sprzątanie jest obowiązkowe.

## Kryteria oceny pary

| Kryterium | Jak sprawdzić |
|---|---|
| Co najmniej 4 scenariusze z P1–P12, w tym 1 API i 1 z kontem `admin` | pliki w `tests/projekt/`, linia „Wybrane” wyżej |
| Pakiet jest zielony za każdym razem | `npx playwright test tests/projekt --repeat-each=3 --workers=1` bez `failed` |
| Test pada, gdy wynik jest inny niż oczekiwany | para pokazuje: zmiana oczekiwanej wartości w jednej asercji daje `1 failed` |
| Asercje sprawdzają wynik biznesowy ze scenariusza | każdy punkt „Oczekiwany wynik” ma swoją asercję albo komentarz, dlaczego jej nie ma |
| Locatory odporne na zmiany UI | `getByRole`, `getByLabel`, `getByText`, potem `getByTestId`; bez CSS, XPath, `nth()` |
| Bez stałych pauz | w kodzie nie ma `waitForTimeout` |
| Każdy test po review drugiej osoby | w historii (`git log`) przy każdym teście linia `Review: OK` albo lista poprawek |
| Nazwa testu mówi, co ma się stać | po samej nazwie w raporcie wiadomo, jaki wynik jest oczekiwany |
| Test sprząta po sobie | drugi przebieg bez `db:reset` daje ten sam wynik |

## Review krzyżowe: karta punktacji

30 minut. Każda para robi review testów innej pary: trener podaje, czyje. Usiądźcie przy ich ekranie albo, jeśli mają fork, otwórzcie go na GitHubie w przeglądarce. Bez konta GitHub autorzy pokazują zmiany na swoim laptopie: `git log --oneline` (lista commitów) i `git show <skrót commita>` (co zmienił jeden commit). Autorzy nie podpowiadają, odpowiadają tylko na pytania.

Przejdźcie testy z listą kontrolną (`docs/lista-kontrolna-review.md`). Każde znalezisko wpiszcie do tabeli. Punkt liczy się, gdy autorzy się zgadzają albo gdy pokażecie to uruchomieniem testu.

| Co znaleźliście | Waga |
|---|---|
| Punkt „Oczekiwany wynik” ze scenariusza nie ma asercji albo asercja sprawdza coś innego | 3 |
| Test przechodzi także przy złym wyniku: po zmianie oczekiwanej wartości dalej `passed` | 3 |
| Tekst albo wartość w asercji, której nie ma ani w aplikacji, ani w scenariuszu | 2 |
| Test zależy od danych innego testu albo po sobie nie sprząta | 2 |
| Stała pauza (`waitForTimeout`) albo `isVisible()` w `if` | 2 |
| Locator CSS, XPath, `nth()` albo `first()` tam, gdzie wystarczy rola, etykieta albo tekst | 1 |
| Nazwa testu nie mówi, jaki wynik jest oczekiwany | 1 |
| Login i hasło wpisane w test zamiast `zaloguj()` | 1 |

Tabela do wypełnienia:

| Plik i linia | Co jest nie tak | Waga | Autorzy się zgadzają? |
|---|---|---|---|
| | | | |

Suma wag to wynik pary recenzentów. Autorzy poprawiają znalezisko z najwyższą wagą i robią commit z linią `Review krzyżowe: …`.

## Spotkanie „wydajemy czy nie”

5 minut na parę, przy rzutniku. Kolejność podaje trener. Pary, które nie prezentują, pracują dalej.

1. **Co pokrywa pakiet** (1,5 min): scenariusze, liczba testów, E2E i API. Czego pakiet nie sprawdza i dlaczego.
2. **Co znaleźliśmy** (2 min): błędy z polowania (test czerwony na `rc`, zielony na wersji zwykłej), wynik po hotfiksie Mirka, najważniejsze znalezisko z review krzyżowego.
3. **Rekomendacja** (1 min): „wydajemy”, „nie wydajemy” albo „wydajemy, jeśli…”. Uzasadnienie to nazwa testu i jego wynik, a nie opinia.
4. **Pytanie od Bożeny** (0,5 min).
