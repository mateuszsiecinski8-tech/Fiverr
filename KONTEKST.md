# 📒 KONTEKST PROJEKTU — historia, decyzje, co dalej

Ten plik to „pamięć" projektu. Nowy czat z Claude? Powiedz po prostu:
**„Przeczytaj KONTEKST.md i CLAUDE.md"** — i możecie kontynuować pracę,
jakby nic nie przerwało rozmowy.

---

## 1. Co to za projekt

Jednostronicowe portfolio freelancera (Mateusz, na Fiverr: **matthew_maty**),
oferującego: strony/landing page, grafikę i branding, UI/UX design.
Strona sama w sobie jest popisem umiejętności — poziom „agencja premium".

- **Stack:** Next.js 15 (App Router) + Tailwind CSS 4, TypeScript
- **Repo:** github.com/mateuszsiecinski8-tech/Fiverr
  (gałąź `claude/freelancer-portfolio-nextjs-0e9u0j` — jest domyślna)
- **Hosting docelowy:** Vercel (auto-deploy po każdym pushu na GitHub)
- **Właściciel jest początkujący** — wszystko tłumaczymy prostym językiem,
  komentarze w kodzie po polsku.

## 2. Historia prac (co już zrobiliśmy, w kolejności)

**Etap 1 — strona.** 8 sekcji: Hero → Usługi → Portfolio → Proces → Opinie
→ Cennik → Kontakt/CTA → Stopka. Tryb jasny/ciemny (zapamiętywany),
menu mobilne, animacje przy scrollu (Reveal + IntersectionObserver).
Wszystkie TEKSTY w jednym pliku `lib/dane.ts`.

**Etap 2 — portfolio (spec work).** 6 fikcyjnych, ale pełnowartościowych
projektów pokazowych. Każdy kafelek w portfolio jest KLIKALNY i otwiera
żywe demo z `public/prace/`:
- Flowly (landing SaaS), PULS Studio (fitness, dark), NOIA (kosmetyki,
  elegancki serif), Palona (kawiarnia — strona + osobno plansza brandingowa),
  Calmo (aplikacja do medytacji, 3 ekrany UI, dark mode).
- Miniatury kafelków (`public/portfolio/*.jpg`) to zrzuty tych dem
  oprawione w ramki przeglądarki/telefonu na gradientach — generowane
  Playwrightem (skrypty były w scratchpadzie sesji, łatwo odtworzyć).

**Etap 3 — Fiverr + animacje premium.** Powstał `FIVERR.md` (kompletne
teksty na profil i 3 gigi, po angielsku). Strona dostała: animację wjazdu
hero z rozmycia, falujący gradient, dryfujące poświaty, pasek marquee,
spotlight za kursorem na kartach, błysk na przyciskach, pasek postępu
scrolla, ziarno na tłach, statystyki w hero, numerację sekcji 01–05.

**Etap 4 — prawdziwy klient.** Wyróżniona karta „★ Prawdziwy klient":
**Justyna Rodziewicz — Nieruchomości Premium** (justynarodziewicz.pl),
nad siatką bento, z tagami i case study. Dema z etapu 2 dostały sekcje
opinii, wielokolumnowe stopki i animacje reveal. Link Fiverr podpięty
wszędzie: https://www.fiverr.com/matthew_maty

## 3. Ważne decyzje (nie zmieniać bez powodu)

- Treści edytuje się TYLKO w `lib/dane.ts` — nigdy na sztywno w komponentach.
- Zero ciężkich bibliotek animacji — czysty CSS + IntersectionObserver;
  każdy efekt ma fallback `prefers-reduced-motion`.
- Jeden kolor akcentu (fiolet `--color-akcent` w `app/globals.css`).
- Strona musi pozostać lekka (~100 kB First Load JS) — sprawdzać po buildzie.
- Miniatura Justyny = `public/portfolio/justyna.jpg`; podmiana pliku
  (ta sama nazwa!) wystarczy, żeby zmienić obrazek — zero zmian w kodzie.

## 4. Do zrobienia (checklista właściciela)

- [ ] **Vercel:** vercel.com → Add New → Project → Import repo „Fiverr"
      → Deploy. Potem każdy push sam aktualizuje stronę.
- [ ] **Miniatura Justyny 1:1:** zrób zrzut justynarodziewicz.pl (bez paska
      przeglądarki), zapisz jako `public/portfolio/justyna.jpg`, commit+push.
      (Obecnie jest tam wierna rekonstrukcja hero zrobiona kodem — OK,
      ale prawdziwy zrzut ze zdjęciem klientki będzie lepszy.)
- [ ] **Email:** w `lib/dane.ts` podmień `twoj@email.com` na prawdziwy.
- [ ] **Zdjęcia AI (opcjonalnie):** w bibliotece Higgsfield czekają 2 zdjęcia
      (kawiarnia + kosmetyki). Pobierz i zapisz jako
      `public/prace/img/kawa.png` i `public/prace/img/kosmetyki.png` —
      strony-demo Palona i NOIA same je pokażą zamiast ilustracji CSS.
- [ ] **Fiverr:** załóż gigi według `FIVERR.md` (zacznij od Giga #1,
      obniżone ceny na pierwsze opinie; do galerii wrzuć obrazki
      z `public/portfolio/`).
- [ ] **Prawdziwe opinie:** gdy pojawią się pierwsze zlecenia, podmień
      placeholdery w `lib/dane.ts` (sekcja `opinie`).

## 5. Jak pracować z Claude nad tym projektem

Nowy czat (lokalnie w folderze projektu albo na claude.ai/code z tym repo)
sam przeczyta `CLAUDE.md`. Przy większych zadaniach dodaj:
„przeczytaj też KONTEKST.md". Przykładowe polecenia, które zadziałają
od ręki:
- „Zmień cenę pakietu Standard na 1800 zł" (→ `lib/dane.ts`)
- „Dodaj nowy projekt do portfolio: [nazwa], obrazek wrzuciłem do
  public/portfolio/x.jpg" (→ `lib/dane.ts`, sekcja `portfolio`)
- „Zmień kolor akcentu na szmaragdowy" (→ `app/globals.css`, `@theme`)
- „Po zmianach zrób build, sprawdź że działa, commit i push"
