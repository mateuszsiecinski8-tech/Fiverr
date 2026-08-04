# ZUI v2 — projekt (spec)

Data: 2026-08-04 · Gałąź: `experiment/zui-space-scroll` · **Deploy tylko jako preview.**

Cel: podnieść eksperymentalny tryb ZUI z poziomu „ciekawy prototyp" do poziomu
portfolio studia projektowego. Klasyczna wersja (mobile + `prefers-reduced-motion`)
ma zostać nietknięta.

---

## 0. Decyzje właściciela (sesja 2026-08-04)

| Pytanie | Wybór |
|---|---|
| Forma portfolio | **B** — mozaika z hierarchią + rozbudowane case study |
| Case study | **Prawdziwe podstrony** `/case/<slug>` (link do wysłania klientowi + SEO) |
| Nowe projekty pokazowe | **4** — restauracja fine dining, klinika stomatologiczna, fotograf, sklep odzieżowy |
| Kadry | **Równowaga** — planeta ~45% kadru, bliżej środka, treść na czystym kosmosie |
| Dźwięk | **Nie robimy** (decyzja Claude, zaakceptowana milcząco — do cofnięcia jednym słowem) |
| Miniatury | Generowane headless Chrome (`C:\Program Files\Google\Chrome\Application\chrome.exe`) |

## 1. Sprzeczność w briefie i jej rozstrzygnięcie

Brief chce **usunąć zaciemnienia tła** (2.4) i **jednocześnie wsunąć planety bliżej
środka kadru** (2.5). To kierunki przeciwne: im więcej jasnej planety w kadrze, tym
trudniej o czytelny biały tekst bez ściemniacza.

Rozstrzygnięcie — czytelność bierzemy z czterech innych źródeł niż mgła pod sekcją:

1. **Kadrowanie rozłączne.** Planeta i kolumna treści zajmują rozłączne obszary
   ekranu. Weryfikacja liczbowa (nie „na oko"): skrypt Node importuje `three`,
   odtwarza kod kamery i rzutuje środek + brzegi tarczy na ekran. Warunek:
   pionowy pas kolumny tekstu nie przecina rzutu tarczy.
2. **Materiał kart.** Ciemne szkło z jasnym rantem od strony światła — karta sama
   niesie kontrast, niezależnie od tego, co jest za nią.
3. **Winieta przy krawędziach kadru** — jedna, na `position: fixed`, w jednostkach
   ekranu. Nie ma szans pokazać krawędzi (to był grzech starych mgieł: prostokąt
   z gradientem pionowym w sekcji na trzy ekrany).
4. **Cień pod literami** — wąski, nie „halo".

Prostokątne `::before` z mgłą (`#uslugi::before` … `#opinie::before`) znikają
całkowicie.

## 2. Zakres — osiem etapów

### Etap 1 — Nawigacja
- `pasek-podrozy` (kropki przy lewej krawędzi) **usunięty** z `LotSekcja.tsx`
  i z `globals.css`.
- Navbar dostaje **animowany kafelek** („pill"): jeden element pozycjonowany
  absolutnie pod linkami, przesuwany `transform: translate3d` — bez layout thrash.
- Pozycja kafelka i jego kolor są **interpolowane postępem scrolla** między
  przystankami, nie przełączane skokowo. Kolory = paleta ciał niebieskich
  (liliowy → fiolet → mięta → róż → złoto).
- Navbar musi umieć działać **bez** trybu lotu (mobile, klasyka) — kafelek jest
  opcjonalny, sterowany kontekstem/propsem, domyślnie wyłączony.
- Dostępność: kafelek jest czysto dekoracyjny (`aria-hidden`), stan aktywnej
  sekcji niesie `aria-current` na linku.

### Etap 2 — Kadry i koniec zaciemnień
- Nowe wartości `kadr`, `dystans`, `obrot` dla przystanków 1–5. Hero (0) **bez
  zmian** (zakaz z briefu).
- Docelowo tarcza planety zajmuje ~45% wysokości kadru i leży bliżej środka niż
  dziś, ale nigdy pod kolumną treści.
- Układ HTML sekcji projektowany **razem** z kadrem (jedna kompozycja).
- Usunięcie mgieł, dodanie winiety krawędziowej.
- Weryfikacja: skrypt geometryczny + zrzuty z przeglądarki.

### Etap 3 — Tekstury
- **Księżyc** (przystanek Usługi, kamera podchodzi najbliżej): przepisany od zera.
  Wymagania: pole wysokości (heightfield) jako źródło prawdy → z niego kolor
  **i mapa normalnych** (Sobel), morfologia krateru (wał, ejecta, cień, centralny
  szczyt dla dużych), jasne promienie od młodych kraterów, ciemne morza, kratery
  w kilku skalach (od 3 px do 120 px).
- Przegląd pozostałych tekstur; podniesienie tych, przy których kamera stoi blisko.
- Ograniczenie: wszystko proceduralnie na canvasie, zero plików graficznych.

### Etap 4 — Finał (słońce)
- CSS-owy `repeating-conic-gradient` z promieniami **usunięty**.
- Zastąpiony efektem **w scenie 3D** (sprite'y additive przy tarczy słońca) —
  dzięki temu jest zakotwiczony w tarczy z definicji, nie przez zgadywanie `top: 91vh`.

### Etap 5 — Portfolio (kierunek B)
- Mozaika z hierarchią: prawdziwi klienci = duże kadry, spec-work = kafelki
  o zróżnicowanej wadze.
- Klik → `/case/<slug>`. Żywy podgląd (iframe) zostaje jako efekt hover.
- Wymagania twarde: skanowalne, dostępne z klawiatury, dobre na mobile.
- Komponent współdzielony przez oba tryby; różnice wizualne pod `.tryb-lot`.

### Etap 6 — Nowe projekty pokazowe
- 4 nowe strony-demo w `public/prace/`, treść **po angielsku**, responsywne,
  kompletne (nie makiety).
- Dopisane do `lib/dane.ts` — **wyłącznie jako nowe pozycje**, istniejące teksty
  nietknięte.
- Miniatury: headless Chrome, ten sam styl mockupu co obecne.

### Etap 7 — Wow
- Mikrointerakcje, typografia (hierarchia + rytm pionowy), animacje wejścia
  zsynchronizowane z ruchem kamery (nie generyczny fade-in), preloader jako
  część doświadczenia.
- Zasada: **każdy efekt musi mieć powód**. Brak powodu = brak efektu.
- Bez dźwięku.

### Etap 8 — Jakość
- Pomiar FPS, kontrola `backdrop-filter`.
- Dostępność: klawiatura, widoczny focus, `aria`, kontrast.
- `prefers-reduced-motion` → ZUI się nie włącza (już działa, potwierdzić).
- SSR/SEO: serwer dalej renderuje pełną klasyczną wersję.
- `npm run build` przechodzi, `KONTEKST.md` zaktualizowany, push na
  `experiment/zui-space-scroll`.

## 3. Ograniczenia (z briefu i CLAUDE.md)

- ❌ Nie deployować na `claude/freelancer-portfolio-nextjs-0e9u0j`.
- ❌ Zero nowych bibliotek (Three.js + GSAP wystarczają).
- ❌ Nie zmieniać istniejących tekstów w `lib/dane.ts`.
- ❌ Nie psuć klasycznej wersji; style ZUI pod `.tryb-lot`.
- ❌ Nie ruszać kadru hero.
- ✅ Komentarze po polsku, przyjazne dla początkującego.

## 4. Pułapki z poprzednich sesji (obowiązują)

1. `position: sticky` jeździ tylko w **polu treści** rodzica — padding się nie liczy,
   miejsce robi się przez `min-height`.
2. `:not(#id)` przejmuje specyficzność ID → używać `:not([id="…"])`.
3. Kamera czyta `window.scrollY` sama; okna postoju **w pikselach**. Nie mieszać
   z ułamkami ze ScrollTriggera.
4. Przesuwanie kadru: obrót kamery w jej własnych osiach (`rotateY`/`rotateX`)
   **po** przechyle (`rotateZ`). Przesuwanie celu patrzenia nie działa przewidywalnie.
5. Gradienty liniowe w wysokich sekcjach rozjeżdżają się — wygaszać maską w `vh`.
6. Małe księżyce wjeżdżają pod obiektyw — `schowajGdyPodObiektywem()`.
7. `npm run build` przy działającym `next dev` psuje `.next` — najpierw zatrzymać serwer.
8. Weryfikacja przy schowanym oknie: `requestAnimationFrame` staje. Do kadrów
   liczyć geometrię offline, przeglądarki używać do oceny estetyki.

## 5. Definicja gotowości

- [ ] Pasek z lewej zniknął; navbar ma płynny kafelek zmieniający kolor ze sceną.
- [ ] Portfolio w formie mozaiki + case study, lepiej niż lista.
- [ ] Tekstura księżyca z prawdziwym reliefem (i inne, jeśli trzeba).
- [ ] Brak zaciemnień pod kartami, tekst wszędzie czytelny — sprawdzone na zrzutach.
- [ ] Kadry przemyślane, planety dobrze widoczne, HTML + 3D jako jedna kompozycja.
- [ ] Promienie na dole naprawione (w 3D).
- [ ] 4 nowe projekty pokazowe + miniatury, dopięte do portfolio.
- [ ] Wskazane konkretnie, co buduje efekt „wow".
- [ ] `npm run build` przechodzi, mobile nietknięte, `KONTEKST.md` zaktualizowany.
- [ ] Wypchnięte na `experiment/zui-space-scroll`, produkcja nietknięta.
