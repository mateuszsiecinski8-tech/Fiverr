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

**Etap 12 — ZUI v3 (runda poprawek po obejrzeniu etapu 11).**
Nadal gałąź `experiment/zui-space-scroll`, nadal TYLKO preview.

- **Hero: wariant „cisza wokół sceny".** Właściciel wybrał minimalizm
  przez ODJĘCIE TEKSTU, nie przez wyciszenie grafiki. Scena 3D zostaje
  bohaterem; w trybie lotu znika blok trzech statystyk. W wersji
  klasycznej (telefon) statystyki ZOSTAJĄ — tam nie ma sceny 3D i to
  one budują wiarygodność.
- **Wspólne niebo na całej trasie.** Wcześniej hero miało własne
  fioletowe poświaty, a dalsze sceny już nie — więc przy pierwszym
  przelocie tło „zmieniało kolor". Teraz ta sama mgławica jest
  przyklejona do ekranu i towarzyszy całej podróży
  (`.tryb-lot .pojemnik-kosmos::before`). Jest CELOWO niezmienna —
  gdyby zmieniała barwę razem ze sceną, wróciłby ten sam problem.
  Kolor planety wolno nosić tylko kartom i tekstowi, nie całemu kadrowi.
- **Księżyce złagodzone (koryguje etap 11).** Poprzednia wersja była
  zbyt agresywna — „dziurawy ser". Siła rzeźby zeszła z 15 na 5,5,
  wał krateru z 0.6 na 0.3 (i szerszy), jasne obwódki i promienie
  o połowę słabsze, za to WIĘCEJ MÓRZ. Wzorzec: Księżyc widziany
  z Ziemi — rozpoznawalne ciemne plamy, kratery jako drugi plan.
- **Portfolio: kafelki NA WPROST + parallaksa.** Płaska siatka nad
  przestrzenną sceną czytała się jak naklejka na zdjęciu. Teraz
  kolejne rzędy przesuwają się przy scrollu o różną wartość
  (`GLEBIA` w LotSekcja.tsx) i mają różną siłę cienia. Kafelków
  CELOWO nie obracamy w perspektywie — obrót zniekształcałby
  miniatury, a to one sprzedają.
- **Kontakt: słońce jako podłoga.** `ulamek` 0.22 → 0.62,
  `kadr.y` 0.42 → 0.74. Górny brzeg tarczy ląduje na ~58% wysokości,
  więc dolne 42% kadru to świecąca powierzchnia, a tekst wisi nad nią.
- **Stopka przeprojektowana.** Była jedną linijką z copyrightem
  i wyglądała, jakby strona się urwała. Teraz trzy piętra: wezwanie
  do działania, mapa strony, podpis — plus ciepła łuna, echo słońca
  z ostatniej sceny.
- **BUG naprawiony: ucięte ogonki liter w nagłówku Kontaktu.**
  Nagłówek ma rozmiar 60 px i interlinię 60 px, więc pudełko dwóch
  linijek miało DOKŁADNIE 120 px. Ponieważ w trybie lotu tekst jest
  malowany gradientem przez `background-clip: text`, litery były
  przycinane do pudełka i „g", „y", „j" traciły ogonki. Zwykły biały
  tekst by się nie przyciął — stąd błąd tylko w jednej scenie.
  Lekarstwo: `line-height: 1.12` + `padding-bottom: 0.14em`.
- **Statystyka poprawiona:** „6+ projects" → „12+" (10 pokazowych
  + 2 prawdziwych klientów) — za zgodą właściciela.

**Etap 12 — ZUI v3 (runda poprawek po obejrzeniu v2).**
Wciąż gałąź `experiment/zui-space-scroll`, wciąż tylko preview.

- **Hero: wariant „cisza wokół sceny".** Właściciel wybrał minimalizm
  przez ODJĘCIE TEKSTU, nie przez wyciszenie grafiki. Blok trzech
  statystyk znika w trybie lotu (`.tryb-lot #start dl`), zostaje
  plakietka, nagłówek, jedno zdanie i dwa przyciski. Statystyki
  nadal widać w wersji klasycznej — tam nie ma sceny 3D i to one
  budują wiarygodność.
- **Wspólne niebo na całej trasie.** Wcześniej hero miało własne
  fioletowe poświaty, a dalsze sceny nie — więc przy pierwszym
  przelocie tło zmieniało kolor. Teraz ta sama mgławica jest
  przyklejona do ekranu pod kanwą (`.pojemnik-kosmos::before`)
  i towarzyszy całej podróży. ⚠️ To celowo JEDNA, NIEZMIENNA
  warstwa — gdyby zmieniała kolor razem ze sceną, wróciłby
  dokładnie ten problem. Kolor planety wolno nosić tylko kartom
  i tekstowi, nigdy całemu kadrowi.
- **Księżyce złagodzone (koryguje etap 11).** Poprzednia wersja była
  zbyt agresywna — „dziurawy ser". Teraz: mniej kraterów, więcej
  mórz, siła rzeźby 0,6 zamiast 1, kontrast obwódek i promieni
  ścięty o połowę, jaśniejsza baza. Wzór: Księżyc widziany z Ziemi.
- **Portfolio: kafelki NA WPROST + parallaksa.** Kafelki NIE są
  obracane w perspektywie (obrót zniekształcał miniatury, a to one
  sprzedają). Głębia bierze się z ruchu: rzędy `.rzad-N` przesuwają
  się przy scrollu z różną prędkością (GSAP w LotSekcja.tsx),
  mają różną wielkość i różną siłę cienia.
- **Kontakt: słońce jako podłoga.** `ulamek` 0,22 → 0,62 i `kadr.y`
  0,42 → 0,74. Gwiazda wypełnia dolne ~42% kadru jak horyzont,
  a tekst wisi nad nią.
- **Stopka przeprojektowana.** Trzy piętra: wezwanie do działania,
  mapa strony w kolumnach, podpis. Góra stopki jest przezroczysta,
  żeby scena wtapiała się w nią bez twardego szwu.
- **Naprawiony bug:** ucięte ogonki liter w nagłówku Kontaktu.
  `background-clip: text` maluje litery TŁEM elementu, a nagłówek
  miał interlinię równą rozmiarowi pisma — pudełko nie miało zapasu
  na litery „g", „y", „j". Lekarstwo: `line-height: 1.12` +
  `padding-bottom: 0.14em`. Uwaga na przyszłość: ten błąd dotyczy
  wyłącznie tekstu malowanego gradientem.
- **Statystyka poprawiona:** „6+ projects" → „12+" (10 pokazowych
  + 2 prawdziwych klientów).

### Etap 13 — ZUI v4: koniec loterii w scenie Usługi, planeta odzyskuje prawą stronę

Runda dotyczyła dwóch scen. Najważniejsze odkrycie: to, co wyglądało
jak „brzydka tekstura księżyca", w dużej części było **niepowtarzalnym
kadrem** — scena Usługi wyglądała INACZEJ przy każdym wejściu na stronę.

- **Trzy źródła losowości, wszystkie usunięte.** Wcześniej: (1) kąt
  startowy orbity księżyca był losowany, (2) księżyc miał obrót
  ustawiony raz na sztywno, więc w miarę obiegu kamera oglądała go
  z coraz innej strony, (3) samo ZIARNO tekstury było losowe, czyli
  każdy odwiedzający dostawał inny księżyc. Teraz kąt startowy jest
  stały (0,7), księżyc jest **pływowo związany z orbitą** (jak
  prawdziwy Księżyc — zawsze ta sama twarz; robią to dwa zagnieżdżone
  uchwyty `orbitaKsiezyca`/`wahaczKsiezyca` zamiast liczenia pozycji
  w pętli), a ziarno to wpisana na stałe liczba, dobrana i sprawdzona
  na zrzucie z bliska.
- **Kadr Usług opisany w UKŁADZIE ORBITY, nie w świecie.** Nowe pola
  w `kadry.ts`: `wzdluz` (ile stopni w bok od „promieniowo na zewnątrz"
  w stronę ruchu księżyca) i `pion: "pierscienie"` (górą kadru jest oś
  pierścieni, nie pion świata). Dzięki temu pierścienie kładą się na
  ekranie ZAWSZE tak samo, a księżyc — który krąży w ich płaszczyźnie —
  siedzi dokładnie na nich. Stąd „jedna linia", o którą prosił właściciel.
  Wartości: `unies -31°`, `wzdluz 69°`.
  ⚠️ Bez `pion: "pierscienie"` nachylenie pierścieni na ekranie kręci
  się razem z fazą orbity — to był główny winowajca.
- **Orbita głównego księżyca spowolniona 0,12 → 0,02 rad/s.** To nie
  kosmetyka: kamera na tym przystanku stoi w układzie orbity, więc
  RAZEM z księżycem objeżdża olbrzyma. Przy dawnym tempie zdążyła
  przelecieć pół okrążenia, zanim ktokolwiek doscrollował — i tło
  (poświata, różowa planeta) za każdym razem wypadało gdzie indziej.
  Za żywy ruch w hero odpowiada teraz mniejszy księżyc (0,4 rad/s).
- **Pierścienie: miękkie krawędzie + szczelina pasterska.** Kamera
  w scenie Usług przelatuje tuż nad pierścieniami, a ich ostra
  krawędź kładła się na księżycu jak prostokątna płyta. Teraz obie
  krawędzie gasną łagodnie. Do tego w miejscu orbity księżyca jest
  ciemna szczelina — tak jak Keelera w pierścieniach Saturna. Widać
  ją też w hero i tłumaczy, skąd w pierścieniach wziął się księżyc.
- **Tekstura księżyca spokojniejsza:** `srednie` 38→30, `male` 240→170,
  `morza` 5→6. Trzecie podejście do tej samej uwagi — tym razem
  poparte tym, że w ogóle DA SIĘ ją ocenić, bo kadr jest powtarzalny.
- **Portfolio: mozaika zwężona i dosunięta do lewej.** Właściciel
  najpierw wybrał „pole odłamków" (swobodne rozsypanie), a potem
  doprecyzował: kafelki mają być równo, prosto ułożone, tylko po
  lewej — „połączenie stanu obecnego z opcją A". Tak zostało zrobione:
  układ kafelków jest DOKŁADNIE ten sam co wcześniej (równe rzędy,
  ten sam rytm szerokości), zmieniła się tylko szerokość kolumny.
  Prawa strona kadru należy wyłącznie do olbrzyma.
- **Pas na kafelki liczony, nie zgadywany.** `polePodKafelki()`
  w `kadry.ts` rzutuje sylwetkę olbrzyma tą samą matematyką, którą
  kadruje kamera, i zwraca miejsce, w którym zaczyna się jego tarcza.
  `LotSekcja.tsx` wstawia to do CSS jako `--pole-kafelkow`.
  ⚠️ Wpisanie „52%" na sztywno rozjechałoby się na innych proporcjach
  ekranu — kadr liczony jest z WYSOKOŚCI, więc szerokość zależy
  od proporcji.
- **Wspólny kod pomiarowy.** `kameraPrzystanku()` i `sylwetkaNaEkranie()`
  mieszkają teraz w `kadry.ts` i korzysta z nich zarówno strona, jak
  i `narzedzia/policzKadry.mts`. Wcześniej narzędzie miało własną
  kopię — prosta droga do tego, żeby „zmierzone" rozjechało się
  z „widocznym".
- **Pułapka rzutowania (dopisana do narzędzia):** punkty ZA obiektywem
  trzeba odrzucać ręcznie. Rzutowanie perspektywiczne daje dla nich
  liczby rzędu „23 000% szerokości" — poprawne matematycznie,
  bez sensu jako kadr. Widać to przy planetach oglądanych z bliska
  (Usługi, Kontakt), gdzie pół sylwetki naprawdę jest za kamerą.
- **Test determinizmu w `policzKadry.mts`:** liczy scenę Usług na
  ośmiu punktach orbity i wypisuje rozrzut. Ma wychodzić 0,00°.
- Zmierzone: build ✓ (16 stron statycznych), 60 fps w Usługach
  i w Portfolio, wersja mobilna nietknięta (tryb lotu wyłączony,
  12 kafelków, statystyki widoczne, zero poziomego przewijania).

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
  Od etapu 13 wypisuje też **nachylenie pierścieni** na ekranie
  i uruchamia **test determinizmu** sceny Usługi (osiem punktów
  orbity — rozrzut ma wynosić 0,00°).
- **`node narzedzia/scena.js`** — sterowanie przeglądarką po protokole
  DevTools. Powstało, bo panel podglądu w edytorze nie renderuje
  klatek przy schowanym oknie (pułapka nr 8), a zwykły
  `chrome --screenshot` nie umie przewinąć strony. Zero zależności.
  - `node narzedzia/scena.js zrzut <url> <scrollY> <plik.png> [czekajMs] [x,y,w,h,skala]`
  - `node narzedzia/scena.js ocen <url> <scrollY> <wyrażenieJS> [czekajMs]`
  - `node narzedzia/scena.js fps <url> <scrollY>` — pomiar płynności
  - `node narzedzia/scena.js stop` — zamyka przeglądarkę pomiarową
  ⚠️ Współrzędne wycinka są w układzie CAŁEJ STRONY, nie okna —
  do `y` trzeba doliczyć scrollY.
  ⚠️ Jeśli scena nie zdąży się zbudować, ekran startowy blokuje
  przewijanie i zrzut wychodzi z HERO zamiast z zamówionej sekcji.
  Skrypt to wykrywa i pisze ostrzeżenie; limit zmienia `GOTOWOSC_MS`.
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
