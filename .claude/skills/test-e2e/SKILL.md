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
   Po `zaloguj` jesteś na stronie głównej, więc przejdź na stronę testu przez `page.goto(...)`.
5. Uruchom `npm run typecheck`. Popraw błędy w swoim pliku.
6. Uruchom test dwa razy pod rząd poleceniem `npx playwright test <plik>`. Oba przebiegi muszą dać `passed`.
7. Pokaż, że test potrafi paść: zmień na chwilę jedną oczekiwaną wartość, uruchom test, pokaż `failed`, przywróć wartość i uruchom jeszcze raz (`passed`).
8. Przejdź test pytaniami z `docs/lista-kontrolna-review.md`. Pokaż tabelę: numer pytania, odpowiedź tak/nie, linia w pliku. Każde „nie” popraw przed oddaniem.
9. Na końcu podaj ścieżkę pliku i polecenie, którym użytkownik uruchomi test. Podawaj wyniki dosłownie z terminala. Nie pisz „jestem pewien”.
