# 📒 KONTEKST PROJEKTU — historia, decyzje, co dalej

Ten plik to „pamięć" projektu. Nowy czat z Claude? Powiedz po prostu:
**„Przeczytaj KONTEKST.md i CLAUDE.md"** — i możecie kontynuować pracę,
jakby nic nie przerwało rozmowy.

---

## 1. Co to za projekt

Jednostronicowe portfolio freelancera (Maty, na Fiverr: **matthew_maty**),
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

**Etap 5 — scena 3D w hero.** Komponent `components/Scena3D.tsx`:
tekst po lewej, interaktywna scena Spline po prawej (desktop). Dwa tryby
linku (ustawiane w `lib/dane.ts` → `hero.scena3d`): adres `.splinecode`
→ silnik `@splinetool/runtime` na canvasie; zwykły link Spline → iframe
(działa w darmowym planie). Ładowanie leniwe + spinner; na mobile,
przy `prefers-reduced-motion` i przy braku dostępu do serwera Spline —
statyczny fallback (kula CSS z pierścieniami). Waga strony bez zmian
(silnik dociąga się osobno, tylko na desktopie).

**Etap 6 — strona jako pokaz umiejętności (inspiracje: supaste /
dreiraum / haoqi).** Imię na całej stronie zmienione na „Maty".
CENNIK CHWILOWO UKRYTY (komponent `Pricing.tsx` zostaje w projekcie;
przywrócenie = odkomentowanie 2 linijek w `app/page.tsx`). Nowości:
- `KartaProjektu.tsx` — kafelki portfolio z ŻYWYM PODGLĄDEM (hover →
  statyczny obrazek płynnie przechodzi w prawdziwe demo w iframe,
  plakietka „podgląd na żywo"; iframe montowany leniwie, tylko desktop)
  + tilt 3D karty w stronę kursora;
- `Ozdoby3D.tsx` — szklane chipy (Next.js/UI-UX/Figma/3D·Spline)
  unoszące się wokół sceny 3D w hero, z parallaxą za ruchem myszy;
- menu: „Cennik" zastąpiony pozycją „Opinie" (#opinie).

**Etap 7 — planeta 3D + gwiazdozbiór.** Spline wyleciał całkiem
(pokazywał swój cennik zamiast sceny). Zamiast niego:
- `Scena3D.tsx` = kolorowa planeta z pierścieniami zbudowana w **Three.js**
  (tekstury malowane kodem na canvasie: pasy fiolet→róż→turkus, pierścienie,
  księżyc na orbicie, poświata). Ładowana leniwie, tylko desktop, fallback
  CSS na mobile/braku WebGL. UWAGA: pierścień czyta teksturę w pasie
  57–100% promienia — malować promienie 150–254 px na płótnie 512.
- `Ozdoby3D.tsx` = 16 chipów-„gwiazd" (nazwy z listy `technologie`
  w dane.ts) rozrzuconych po CAŁYM hero; poruszają się TYLKO pod myszką
  (sprężysty odskok od kursora), część migocze. Hero: kontener treści ma
  pointer-events-none (+ [&_a]:auto), żeby gwiazdy pod tekstem reagowały.
- Tekst hero przesunięty mocniej w lewo (grid 0.85/1.15, max-w-7xl) —
  planeta jest głównym elementem strony.

**Etap 8 — rozbudowa sceny 3D (Three.js).** Hero to teraz mini-układ
planetarny:
- planeta główna z PIERŚCIENIAMI dostała wymyślone KONTYNENTY (ocean +
  lądy + czapy polarne malowane na canvasie) zamiast „sztucznych chmur";
- KSIĘŻYC krąży po prawdziwej orbicie w płaszczyźnie pierścieni
  (R=1.95, zawsze > promień planety 1.35 → NIGDY nie przechodzi przez
  planetę; wcześniej był błąd — orbita była elipsą wchodzącą w planetę);
- RÓŻOWA planeta bez pierścieni w prawym górnym rogu (obraca się szybciej);
- SŁOŃCE w oddali: prawie biała kula + żółte halo (blending additive) +
  ciepłe światło punktowe oświetlające planety z lewej.
- Chipy „gwiazdy" (Ozdoby3D) przeniesione do GÓRNEGO i DOLNEGO pasa hero —
  nie nachodzą na planety ani na tekst.
- Tekst przesunięty mocniej w lewo (grid 0.78/1.22, max-w-[94rem]).
- Usunięty wskaźnik myszki (scroll) z dołu hero.
UWAGA na przyszłość: kanwa 3D bywa wąska (na szerokich monitorach prawa
kolumna jest wysoka-wąska) — dlatego promień orbity księżyca jest mały,
żeby księżyc nie wychodził poza kadr.

**Etap 9 — kompozycja sceny, angielski, szklany navbar.**
- Planeta główna wróciła do wyglądu GAZOWEGO OLBRZYMA (pasy fiolet→róż
  + faliste smugi chmur + turkusowe burze) — właściciel wolał go od
  kontynentów. Pozycja (0.35, 0.1): pierścienie widoczne W CAŁOŚCI.
- Różowa planeta w prawym górnym rogu (2.7, 2.0, −0.6); słońce bez zmian.
- Chipy-gwiazdy rozrzucone po CAŁYM hero (16 szt., nierówno, w lukach
  między planetami/słońcem/tekstem — pozycje w Ozdoby3D.tsx).
- CAŁA strona przetłumaczona na ANGIELSKI (klienci z Fiverr!) —
  treści w lib/dane.ts po angielsku, lang="en", ceny w cenniku w $.
  Strony-demo w public/prace/ zostały po polsku (osobne projekty).
- NOWY NAVBAR: bez ciężkiego paska — logo „Maty." maksymalnie po lewej,
  po prawej pływająca SZKLANA PIGUŁKA (backdrop-blur) z linkami,
  przełącznikiem motywu i akcentowym przyciskiem „Hire me".

**Etap 10 — dopracowanie sceny, drugi klient, mockupy, dark-only.**
- SŁOŃCE w hero przesunięte wyżej i w lewo: `slonce.position.set(-4.6, 3.4, -7)`
  w `Scena3D.tsx` (kierunek wskazany przez właściciela strzałką).
- JASNY MOTYW USUNIĘTY całkowicie (decyzja designerska: kosmiczna scena
  działa tylko na ciemnym tle; jeden mocny motyw > dwa przeciętne).
  Klasa `dark` na stałe w `layout.tsx`, `ThemeToggle.tsx` skasowany,
  `color-scheme: dark` w globals.css. Style `dark:` w komponentach zostały
  (są zawsze aktywne) — NIE czyścić masowo, za duże ryzyko regresji.
- BUG naprawiony: chipy-gwiazdy zaczynają się POD navbarem
  (`top-20` w Ozdoby3D.tsx) — „Tailwind CSS" nachodził na menu.
- STRONY-DEMO w `public/prace/` przetłumaczone NA ANGIELSKI (spójność
  z resztą strony; ceny w $). Komentarze w kodzie zostały po polsku.
- DRUGI PRAWDZIWY KLIENT: Kancelaria Adwokacka Marcin Sieciński
  (kancelaria-adwokacka-marcin-siecinski.pl). `projektWyrozniony` w dane.ts
  zamieniony na TABLICĘ `projektyWyroznione` (Justyna + kancelaria);
  Portfolio.tsx renderuje karty naprzemiennie (co druga: obraz po lewej).
- MINIATURY przerobione na PRAWDZIWE zrzuty ekranu w mockupach:
  okno przeglądarki z PASKIEM ZAKŁADEK (Home/Pricing/…) + nakładający się
  telefon z wersją mobilną, na kosmicznym gradiencie w kolorach marki.
  Generator: szablon + skrypt PowerShell + headless Chrome (skrypty
  w scratchpadzie sesji, łatwo odtworzyć; wymiary: szerokie 1680×760,
  wąskie 1000×900, wyróżnione 1400×1000).
- KOSMICZNE DEKORACJE SEKCJI: nowy komponent `OzdobyKosmos.tsx` —
  dryfujące chipy technologii (animacja `dryf`), mini-planetki
  z pierścieniem, komety (animacja `kometa-lot`), migoczące gwiazdki.
  Wpięty w Services/Portfolio/Process/Testimonials/Contact (hero BEZ zmian
  — tam chipy tylko odskakują od kursora). Czysty CSS, zero JS.

**Etap 11 — ZUI v2 (gałąź `experiment/zui-space-scroll`).**
Podniesienie trybu „lot kosmiczny" z prototypu do poziomu portfolio
studia. ⚠️ To wciąż WERSJA EKSPERYMENTALNA — deploy tylko jako preview,
NIGDY na `claude/freelancer-portfolio-nextjs-0e9u0j`.

- **Nawigacja.** Pasek kropek przy lewej krawędzi USUNIĘTY. Jego rolę
  przejęło górne menu: kafelek przejeżdża między pozycjami razem
  z kamerą i zmienia kolor na kolor sceny. Żeby napisy zostały
  czytelne także w POŁOWIE przejazdu, menu renderuje się dwa razy,
  a ciemna kopia jest przycięta do kształtu kafelka (`clip-path`).
  Komunikacja silnik → navbar: `components/lot/stanPodrozy.ts`.
- **Kadry wydzielone do `components/lot/kadry.ts`** — plik bez
  zależności od przeglądarki, więc działa też w Node. Dzięki temu
  `node narzedzia/policzKadry.mts` LICZY, w którym miejscu ekranu
  wyląduje każda planeta, zamiast dobierać liczby na oko.
- **Koniec zaciemnień tła.** Prostokątne mgły pod sekcjami wyleciały
  (było widać ich ukośną krawędź przecinającą planetę). Czytelność
  niesie teraz: rozłączne kadrowanie (planeta i kolumna tekstu nigdy
  się nie nakładają), materiał kart, jedna winieta krawędziowa
  przyklejona do ekranu i cień pod nagłówkami.
- **Księżyc ma prawdziwą rzeźbę.** Najpierw powstaje mapa wysokości
  (misa, wał, ejecta, centralny szczyt, ciemne morza), a z niej kolor
  I MAPA NORMALNYCH. Światło samo tworzy cienie na wałach.
- **Portfolio to mozaika, nie lista.** Dwaj prawdziwi klienci mają
  największe pola, dziesięć projektów pokazowych układa się w rzędy
  o zmiennym rytmie. Opisy przeniosły się na PODSTRONY `/case/<nazwa>`
  (statyczne, indeksowane, link do wysłania klientowi na Fiverr).
- **Cztery nowe projekty pokazowe:** Aurelio (restauracja), Northfield
  Dental (klinika), Elena Voss (fotograf), KANO (sklep) — każdy
  w innym stylu.
- **Ekran startowy** na czas budowania sceny (mierzone: ~5 s).
  Bez sztucznego opóźnienia — znika, gdy scena wstanie.

## 3. Ważne decyzje (nie zmieniać bez powodu)

- Treści edytuje się TYLKO w `lib/dane.ts` — nigdy na sztywno w komponentach.
- Zero ciężkich bibliotek animacji — czysty CSS + IntersectionObserver;
  każdy efekt ma fallback `prefers-reduced-motion`.
- Jeden kolor akcentu (fiolet `--color-akcent` w `app/globals.css`).
- Strona musi pozostać lekka (~100 kB First Load JS) — sprawdzać po buildzie.
- Miniatura Justyny = `public/portfolio/justyna.jpg`; podmiana pliku
  (ta sama nazwa!) wystarczy, żeby zmienić obrazek — zero zmian w kodzie.

## 4. Do zrobienia (checklista właściciela)

- [x] **Miniatura Justyny 1:1** — zrobione: prawdziwy zrzut
      justynarodziewicz.pl w mockupie przeglądarki (etap 10).
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

## 4b. Narzędzia deweloperskie (katalog `narzedzia/`)

Powstały w etapie 11, bo poprzednie skrypty przepadły razem z sesją.
Teraz są w repo i można ich użyć w każdej chwili.

- **`node narzedzia/policzKadry.mts`** — wypisuje, w którym miejscu
  ekranu wyląduje każda planeta na każdym przystanku (w % ekranu).
  Importuje ten sam `components/lot/kadry.ts`, z którego korzysta
  strona, więc wyliczenia nie mogą się rozjechać z rzeczywistością.
  Można podać rozdzielczość: `node narzedzia/policzKadry.mts 2560 1080`.
- **`node narzedzia/miniatury.mjs --wszystkie`** — generuje miniatury
  kafelków portfolio: robi zrzut strony-demo w wersji na komputer
  i na telefon, skleja je w mockup (okno przeglądarki + telefon na
  kosmicznym gradiencie) i zapisuje do `public/portfolio/`.
  ⚠️ Wymaga uruchomionego `npm run dev` na porcie 3000.
  Nowy projekt dopisujesz w tablicy `PROJEKTY` na górze skryptu.

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
