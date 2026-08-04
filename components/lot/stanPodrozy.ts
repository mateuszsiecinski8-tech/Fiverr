// ============================================================
// STAN PODRÓŻY — malutka „tablica ogłoszeń" dla trybu ZUI
//
// Po co to jest? Navbar wisi na samej górze strony (app/page.tsx),
// a silnik 3D siedzi głęboko w środku (components/lot/…). To dwa
// różne miejsca w drzewie Reacta i normalnie nie mają jak ze sobą
// pogadać.
//
// Zamiast przebudowywać całą stronę, robimy najprostszą rzecz
// z możliwych: jeden plik, w którym silnik ZAPISUJE, gdzie jest
// kamera, a navbar to CZYTA. Kto chce wiedzieć — zapisuje się na
// listę i dostaje powiadomienie przy każdej zmianie.
//
// UWAGA na wydajność: silnik odzywa się tutaj przy KAŻDEJ klatce
// (60 razy na sekundę). Dlatego navbar NIE robi z tego stanu
// Reacta — wpisuje wartości prosto w style kafelka. Przerysowanie
// całego menu 60 razy na sekundę zjadałoby telefon na śniadanie.
// ============================================================

/** Kolory ciał niebieskich — po jednym na przystanek, w kolejności
    trasy kamery (patrz components/lot/silnik.ts → PRZYSTANKI).
    Trzymamy je jako trójki RGB, bo kafelek w navbarze PŁYNNIE
    przechodzi z koloru na kolor — a mieszać da się tylko liczby,
    nie napisy typu „#e4dffd".

    Te same kolory (już jako zapis szesnastkowy) są w app/globals.css
    przy każdej scenie — tam ubierają karty i nagłówki sekcji. */
export const KOLORY_PRZYSTANKOW: [number, number, number][] = [
  [207, 201, 255], // 0. Start   — chłodny błękit kosmosu
  [228, 223, 253], // 1. Usługi  — liliowy regolit księżyca
  [201, 188, 255], // 2. Portfolio — fiolet gazowego olbrzyma
  [181, 232, 221], // 3. Proces  — mięta turkusowej planety
  [255, 196, 224], // 4. Opinie  — róż różowej planety
  [255, 224, 168], // 5. Kontakt — ciepłe złoto słońca
];

/** Funkcja, którą wywołujemy przy każdej zmianie pozycji. */
type Sluchacz = (pozycja: number, aktywna: boolean) => void;

/* Pozycja na trasie jako UŁAMEK, nie numer przystanku:
     2      = stoimy przy przystanku 2 (Portfolio),
     2.37   = jesteśmy w 37% drogi z Portfolio do Procesu.
   Dzięki temu kafelek w navbarze może płynnie przejeżdżać
   między pozycjami menu, zamiast przeskakiwać. */
let pozycja = 0;
/* Czy tryb lotu w ogóle działa? Na telefonie i przy „ograniczeniu
   animacji" strona zostaje klasyczna — wtedy kafelka nie ma. */
let aktywna = false;
const sluchacze = new Set<Sluchacz>();

function ogłoś() {
  for (const s of sluchacze) s(pozycja, aktywna);
}

/** Silnik lotu melduje, gdzie jest kamera (wywoływane co klatkę). */
export function ustawPozycjePodrozy(nowa: number) {
  if (nowa === pozycja) return; // nic się nie zmieniło — nie budzimy nikogo
  pozycja = nowa;
  ogłoś();
}

/** Tryb lotu włączył się (albo wyłączył przy sprzątaniu). */
export function ustawTrybLotu(wlaczony: boolean) {
  if (wlaczony === aktywna) return;
  aktywna = wlaczony;
  ogłoś();
}

/** Zapisz się na powiadomienia. Zwraca funkcję do wypisania się
    (wywołaj ją przy sprzątaniu komponentu — inaczej zostaje śmieć). */
export function sledzPodroz(s: Sluchacz): () => void {
  sluchacze.add(s);
  s(pozycja, aktywna); // od razu podaj stan na teraz
  return () => {
    sluchacze.delete(s);
  };
}
