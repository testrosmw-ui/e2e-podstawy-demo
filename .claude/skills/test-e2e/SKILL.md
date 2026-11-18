---
name: test-e2e
description: Pisze test E2E Playwright według zasad z CLAUDE.md. Użyj, gdy użytkownik prosi o nowy test, automatyzację przypadku testowego albo scenariusza.
---

# Test E2E krok po kroku

Wejście: przypadek testowy, scenariusz albo jedno zdanie wymagania (argument polecenia).
Zasady pisania kodu są w `CLAUDE.md`. Ta procedura mówi tylko, w jakiej kolejności pracujesz.

1. Przeczytaj przypadek testowy albo wymaganie. Wypisz każdy oczekiwany wynik jako osobny punkt i policz je.
2. Przejdź scenariusz w aplikacji (http://localhost:4100) przez Playwright MCP. Zapisz dokładne etykiety, przyciski i komunikaty, które widzisz. Gdy MCP nie działa, odczytaj je z kodu w `app/` i napisz o tym.
3. Pokaż plan w punktach: nazwa testu, kroki, asercje z dokładnym tekstem, dane i sprzątanie. Przy każdej asercji podaj, który oczekiwany wynik z kroku 1 sprawdza. Zatrzymaj się i poczekaj na akceptację planu. Nie pisz kodu przed akceptacją.
4. Napisz test w `tests/cwiczenia/` według zaakceptowanego planu. Oczekiwane wartości bierz z wymagania, nie ze strony.
   Korzystaj z helpera do logowania `tests/pomocnicze/logowanie.ts`, zamiast wpisywać login i hasło ręcznie:
   - import: `import { zaloguj } from '../pomocnicze/logowanie';`
   - klient: `await zaloguj(page);`. Konto bierze się z `APP_USER` i `APP_PASSWORD` (plik `.env` albo `$env:` w oknie), domyślnie `user` / `user123`.
   - administrator: `await zalogujJakoAdmin(page);` (import z tego samego pliku). Konto bierze się z `APP_ADMIN_USER` i `APP_ADMIN_PASSWORD`, domyślnie `admin` / `admin123`.
   - testy API: `await zalogujPrzezApi(request);` z tego samego pliku.
   - kod rabatowy w koszyku: `await uzyjKoduRabatowego(page, 'CZARNY20');` z `tests/pomocnicze/koszyk.ts`, zamiast wpisywać pole i przycisk ręcznie.
   Po `zaloguj` jesteś na stronie głównej, więc przejdź na stronę testu przez `page.goto(...)`.
5. Uruchom `npm run typecheck`. Popraw błędy w swoim pliku.
6. Uruchom test dwa razy pod rząd poleceniem `npx playwright test <plik>`. Oba przebiegi muszą dać `passed`.
7. Pokaż, że test potrafi paść: zmień na chwilę jedną oczekiwaną wartość, uruchom test, pokaż `failed`, przywróć wartość i uruchom jeszcze raz (`passed`).
8. Przejdź test pytaniami z `docs/lista-kontrolna-review.md`. Pokaż tabelę: numer pytania, odpowiedź tak/nie, linia w pliku. Każde „nie” popraw przed oddaniem.
9. Na końcu podaj ścieżkę pliku i polecenie, którym użytkownik uruchomi test. Podawaj wyniki dosłownie z terminala. Nie pisz „jestem pewien”.
10. Popraw ten skill po każdym teście. Zapisz, co w tym teście poszło źle albo czego nie wiedziałeś na starcie (test padł z innego powodu niż oczekiwany, review coś znalazło, lokator nie zadziałał). Dopisz to jako jedno zdanie w trybie rozkazującym do sekcji „Wnioski z poprzednich testów” poniżej, z numerem testu w nawiasie. Nie dopisuj wniosku, który już tam jest. Gdy wniosek dotyczy kroku procedury, zmień ten krok. Pokaż użytkownikowi, co zmieniłeś w skillu.

## Wnioski z poprzednich testów

Przeczytaj je przed krokiem 3 i uwzględnij w planie.

- W `getByRole(..., { name })` dodawaj `exact: true`, bo bez tego nazwa dopasowuje się do fragmentu (P4).
- Przekreślona stara cena to element `<s>`, który w Playwright nie ma roli: znajdź ją po `data-testid` (`tile-old-price`, `product-old-price`) i nie sprawdzaj samego przekreślenia, bo to styl (P9).
- Na stronie „Produkty” sekcja „Oferta na Czarny Piątek” powtarza nazwy, ceny i kategorie produktów: szukaj w wierszu tabeli albo w kafelku `getByRole('article', { name })` (ćw. 10, P9).
- Koszyk przygotowuj i sprzątaj przez API: `page.request.delete('/api/cart')` w `beforeEach` i `afterEach`, produkt dodawaj przez `POST /api/cart/items` (status 201), a testy jednego pliku na wspólnym koszyku oznacz `test.describe.configure({ mode: 'serial' })` (P9, P11).
- Testy z różnych plików, które dzielą koszyk jednego konta, padają przy równoległym uruchomieniu (VS Code, tryb UI): trzymaj je w `tests/projekt/` albo `tests/polowanie/`: oba foldery należą do projektu `projekt` z `workers: 1` w `playwright.config.ts`. Nie twórz drugiego projektu z `workers: 1`, bo biegłby równolegle z pierwszym (P9, P11, P16, JESIEN10).
- Uruchamiaj `npx playwright test` zawsze z katalogu głównego repo: z innego katalogu Playwright nie wczyta `playwright.config.ts` i testy nie mają adresu aplikacji (P13–P16).
- Gdy sprzątanie wymaga innego konta (np. anulowanie jako admin w teście API klienta), zaloguj je w osobnym kontekście `playwright.request.newContext()`, żeby nie zmienić sesji klienta (P14).
- Gdy scenariusz sprawdza sam formularz logowania (np. powrót przez `next=`), nie używaj `zaloguj()`, bo otwiera `/logowanie` bez parametrów: wypełnij formularz kontem z `APP_USER` i `APP_PASSWORD` (domyślnie `user` / `user123`) i opisz wyjątek w komentarzu (P2).
- Gdy sprzątanie jest niemożliwe (wysłanego zamówienia nie da się anulować), napisz w komentarzu nad testem, co zostaje w bazie po każdym przebiegu (P15).
- Wartość, której wymaganie nie podaje wprost (np. kwota rabatu), wylicz z wymagania i zapisz obliczenie w komentarzu: rabat 20% z 4,99 zł to 1,00 zł po zaokrągleniu (P11).
- Po wysłaniu formularza z błędem nie używaj `page.reload()`, bo wyśle formularz jeszcze raz: wejdź na stronę od nowa przez link albo `page.goto` (ćw. 08).
- Dla wymagania „koszyk się nie zmienia” zacznij od pustego koszyka (`beforeEach`) i sprawdź „Pozycji: 0, razem: 0,00 zł” oraz `toHaveCount(0)` dla wiersza produktu. W kroku 7 zamiast tekstu zmień wartość graniczną na dozwoloną (1001 → 1000): test ma paść, gdy aplikacja przyjmie ilość (ćw. 12b).
- `npm run typecheck` zgłasza błędy w `tests/zepsute/03-lista-zamowien.spec.ts`. Ten plik jest zepsuty celowo do ćwiczeń, więc liczą się tylko błędy w Twoim pliku (ćw. 12b).
