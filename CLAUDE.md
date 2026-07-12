# Portfolio freelancera — Maty (matthew_maty na Fiverr)

Jednostronicowe portfolio web designera: Next.js 15 (App Router) + Tailwind CSS 4.
Właściciel jest POCZĄTKUJĄCY — tłumacz zmiany prostym językiem, po polsku.

⭐ Pełna historia projektu, podjęte decyzje i checklista „do zrobienia"
są w pliku `KONTEKST.md` — przy większych zadaniach przeczytaj go najpierw.

## Komendy
- `npm install` — instalacja zależności (raz, na start)
- `npm run dev` — podgląd lokalny na http://localhost:3000
- `npm run build` — build produkcyjny (uruchom przed pushem, żeby wykryć błędy)

## Gdzie co jest
- `lib/dane.ts` — WSZYSTKIE teksty strony (usługi, cennik, opinie, linki,
  portfolio). Zmiany treści rób TYLKO tutaj, nie w komponentach.
- `app/globals.css` — kolor akcentu (sekcja `@theme` na górze) + animacje
  (wjazd, marquee, spotlight, błysk, ziarno).
- `components/` — sekcje strony (Hero, Services, Portfolio, Process,
  Testimonials, Pricing, Contact, Footer) + pomocnicy (Reveal = animacja
  przy scrollu, KartaSpotlight, ThemeToggle, Marquee, ScrollProgress).
- `public/prace/*.html` — samodzielne strony-demo projektów pokazowych
  (spec work); klik w kafelek portfolio otwiera je w nowej karcie.
- `public/portfolio/*.jpg` — miniatury kafelków portfolio.
  `justyna.jpg` to miniatura PRAWDZIWEGO klienta (Justyna Rodziewicz,
  justynarodziewicz.pl) — podmiana pliku = nowa miniatura, bez zmian w kodzie.
- `FIVERR.md` — gotowe teksty do profilu i gigów na Fiverr.

## Konwencje
- Komentarze w kodzie po polsku, przyjazne dla początkującego.
- Styl: minimalistyczny premium; jeden akcent kolorystyczny (fiolet
  `--color-akcent`); animacje subtelne, zawsze z fallbackiem
  `prefers-reduced-motion`.
- Tryb ciemny: klasa `dark` na `<html>`, przełącznik w Navbarze,
  zapis w localStorage (klucz `motyw`).
- Zero dodatkowych bibliotek bez wyraźnej potrzeby — animacje robimy
  czystym CSS + IntersectionObserver.

## Deploy
Vercel podpięty pod to repo GitHub (mateuszsiecinski8-tech/Fiverr,
gałąź `claude/freelancer-portfolio-nextjs-0e9u0j` = domyślna).
Push na GitHub automatycznie aktualizuje stronę online.
