"use client";
// ============================================================
// NAVBAR — lekki, „szklany" pasek nawigacji.
// • BEZ ciężkiego tła na całą szerokość — logo wisi maksymalnie
//   po lewej, a po prawej pływa szklana pigułka z linkami
//   (rozmyte szkło / glassmorphism — styl znany z premium stron).
// • Na komórce zamienia się w szklany przycisk-hamburger.
//
// ⭐ NOWE (tryb ZUI): KAFELEK PODRÓŻY.
//   W trybie lotu menu przejmuje rolę mapy — kolorowy kafelek
//   przejeżdża między pozycjami dokładnie tak, jak kamera leci
//   między planetami, i po drodze zmienia kolor na kolor sceny
//   (liliowy księżyc → fiolet olbrzyma → mięta → róż → złoto).
//   Dzięki temu z ekranu mógł zniknąć pasek kropek przy lewej
//   krawędzi: mówił to samo, a zabierał miejsce w kadrze.
//
//   SZTUCZKA Z CZYTELNOŚCIĄ — dlaczego menu jest tu DWA RAZY?
//   Przerwy między sekcjami są długie, więc kafelek potrafi przez
//   chwilę stać w POŁOWIE drogi między dwiema pozycjami. Jasny
//   kafelek zakrywałby wtedy połówki dwóch jasnych napisów i nic
//   nie dałoby się przeczytać. Dlatego rysujemy menu dwukrotnie:
//   normalnie (jasne litery) i jeszcze raz w ciemnym kolorze na
//   wierzchu — a tę ciemną kopię PRZYCINAMY dokładnie do kształtu
//   kafelka (clip-path). Litery robią się ciemne co do piksela tam,
//   gdzie wjechał kafelek. Ciemna kopia jest aria-hidden, więc
//   czytniki ekranu widzą menu tylko raz.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { IkonaMenu, IkonaZamknij } from "./Ikony";
import { linki, hero } from "@/lib/dane";
import { KOLORY_PRZYSTANKOW, sledzPodroz } from "./lot/stanPodrozy";

// Linki w menu — prowadzą do sekcji na tej samej stronie.
// KOLEJNOŚĆ MA ZNACZENIE: pozycja nr 0 („Services") odpowiada
// przystankowi nr 1 na trasie kamery (nr 0 to hero, które nie ma
// swojej pozycji w menu).
const pozycjeMenu = [
  { nazwa: "Services", href: "#uslugi" },
  { nazwa: "Portfolio", href: "#portfolio" },
  { nazwa: "Process", href: "#proces" },
  { nazwa: "Reviews", href: "#opinie" },
  { nazwa: "Contact", href: "#kontakt" },
];

/** Wymieszaj dwa kolory w proporcji `t` (0 = pierwszy, 1 = drugi). */
function zmieszajKolor(a: [number, number, number], b: [number, number, number], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ].join(" ");
}

export default function Navbar() {
  // Czy menu mobilne jest otwarte?
  const [otwarte, setOtwarte] = useState(false);
  // Która pozycja menu jest aktywna (−1 = żadna, np. na samej górze).
  // To JEDYNA rzecz, która przechodzi przez stan Reacta — zmienia się
  // rzadko (raz na scenę). Sam kafelek jeździ 60 razy na sekundę,
  // więc jego pozycję wpisujemy prosto w style, z pominięciem Reacta.
  const [aktywny, setAktywny] = useState(-1);

  const rzad = useRef<HTMLDivElement>(null); // pasek z pozycjami menu
  const kafelek = useRef<HTMLSpanElement>(null); // kolorowy kafelek
  const ciemna = useRef<HTMLDivElement>(null); // ciemna kopia napisów
  // zmierzone pozycje linków (lewa krawędź + szerokość, w pikselach)
  const miary = useRef<{ x: number; w: number }[]>([]);

  useEffect(() => {
    const rz = rzad.current;
    const kaf = kafelek.current;
    const cm = ciemna.current;
    if (!rz || !kaf || !cm) return;

    /* — 1. ZMIERZ, gdzie stoją pozycje menu —
         Robimy to raz i zapamiętujemy. Czytanie rozmiarów w każdej
         klatce zmuszałoby przeglądarkę do ciągłego przeliczania
         układu strony (to jeden z klasycznych zabójców płynności). */
    function zmierz() {
      const elementy = rz!.querySelectorAll<HTMLElement>("[data-pozycja]");
      miary.current = Array.from(elementy).map((el) => ({
        x: el.offsetLeft,
        w: el.offsetWidth,
      }));
      rysuj(); // po zmianie rozmiarów kafelek musi się przesunąć
    }

    /* — 2. NARYSUJ kafelek dla podanej pozycji na trasie —
         `pozycja` to ułamek: 2.37 = 37% drogi z przystanku 2 do 3. */
    let ostatnia = { pozycja: -1, aktywna: false };
    function rysuj() {
      const { pozycja, aktywna } = ostatnia;
      const m = miary.current;
      if (!m.length) return;

      if (!aktywna) {
        // tryb klasyczny (telefon, ograniczone animacje) — kafelka nie ma
        kaf!.style.opacity = "0";
        cm!.style.opacity = "0";
        return;
      }

      /* Przystanek 1 = pozycja menu 0, więc odejmujemy jeden.
         Na samej górze strony (przystanek 0 = hero) żadna pozycja
         menu nie jest aktywna — kafelek dopiero się wtapia w miarę
         odlotu w stronę Usług. */
      const m0 = Math.min(Math.max(pozycja - 1, 0), m.length - 1);
      const i = Math.min(Math.floor(m0), m.length - 2);
      const t = Math.min(Math.max(m0 - i, 0), 1);
      const a = m[i];
      const b = m[i + 1] ?? a;

      const x = a.x + (b.x - a.x) * t;
      const w = a.w + (b.w - a.w) * t;
      // krycie: 0 w hero → 1, gdy dolecimy do pierwszej sekcji
      const krycie = Math.min(Math.max(pozycja, 0), 1);

      // kolor sceny — mieszany tak samo płynnie jak pozycja
      const k = Math.min(Math.floor(pozycja), KOLORY_PRZYSTANKOW.length - 2);
      const kt = Math.min(Math.max(pozycja - k, 0), 1);
      const kolor = zmieszajKolor(KOLORY_PRZYSTANKOW[k], KOLORY_PRZYSTANKOW[k + 1], kt);

      kaf!.style.transform = `translate3d(${x}px,0,0)`;
      kaf!.style.width = `${w}px`;
      kaf!.style.opacity = String(krycie);
      kaf!.style.setProperty("--kolor-kafelka", kolor);

      /* Ciemna kopia napisów przycięta DOKŁADNIE do kafelka —
         dlatego litery ciemnieją idealnie tam, gdzie on wjechał. */
      cm!.style.clipPath = `inset(0 ${Math.max(0, rz!.offsetWidth - (x + w))}px 0 ${x}px round 999px)`;
      cm!.style.opacity = String(krycie);

      // aktywna pozycja menu — dla czytników ekranu (aria-current)
      const nowy = pozycja < 0.5 ? -1 : Math.min(Math.round(pozycja) - 1, m.length - 1);
      setAktywny((stary) => (stary === nowy ? stary : nowy));
    }

    /* — 3. Podłącz się pod „tablicę ogłoszeń" silnika lotu — */
    const odepnij = sledzPodroz((pozycja, aktywna) => {
      ostatnia = { pozycja, aktywna };
      rysuj();
    });

    zmierz();
    window.addEventListener("resize", zmierz);
    // szerokość napisów zmienia się, gdy doładuje się font — wtedy
    // trzeba przemierzyć wszystko od nowa, inaczej kafelek jest krzywy
    document.fonts?.ready.then(zmierz).catch(() => {});

    return () => {
      odepnij();
      window.removeEventListener("resize", zmierz);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="flex h-20 items-center justify-between px-5 md:px-8">
        {/* Logo — maksymalnie po lewej, klik przewija na samą górę */}
        <a href="#start" className="text-xl font-bold tracking-tight">
          {hero.imie}
          <span className="text-akcent">.</span>
        </a>

        {/* Szklana pigułka z linkami — tylko na komputerze */}
        <div className="hidden items-center gap-1 rounded-full border border-zinc-200/70 bg-white/60 p-1.5 shadow-lg shadow-zinc-900/5 backdrop-blur-xl md:flex dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-black/20">
          {/* Pasek pozycji menu — tu jeździ kafelek podróży */}
          <div ref={rzad} className="relative flex items-center gap-1">
            {/* KAFELEK — czysta dekoracja, stąd aria-hidden */}
            <span ref={kafelek} aria-hidden="true" className="kafelek-menu" />

            {/* Warstwa 1: prawdziwe linki (jasne litery) */}
            {pozycjeMenu.map((pozycja, i) => (
              <a
                key={pozycja.href}
                href={pozycja.href}
                data-pozycja=""
                aria-current={i === aktywny ? "true" : undefined}
                className="relative z-10 rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:text-zinc-950 dark:text-zinc-300 dark:hover:text-white"
              >
                {pozycja.nazwa}
              </a>
            ))}

            {/* Warstwa 2: ta sama treść w CIEMNYM kolorze, przycięta
                do kształtu kafelka. Niewidoczna dla czytników ekranu
                i dla myszki — to tylko sztuczka graficzna. */}
            <div
              ref={ciemna}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 z-20 flex items-center gap-1"
            >
              {pozycjeMenu.map((pozycja) => (
                // UWAGA: klasy MUSZĄ być identyczne jak w prawdziwym
                // linku wyżej (ta sama grubość i te same odstępy) —
                // inaczej ciemne litery przesuną się o włos względem
                // jasnych i napis zrobi się rozmazany.
                <span
                  key={pozycja.href}
                  className="rounded-full px-4 py-2 text-sm font-medium text-[#0b0818]"
                >
                  {pozycja.nazwa}
                </span>
              ))}
            </div>
          </div>

          {/* separator */}
          <span className="mx-1 h-5 w-px bg-zinc-300/70 dark:bg-white/10" />

          {/* Przycisk Fiverr — akcentowy, na końcu pigułki */}
          <a
            href={linki.fiverr}
            target="_blank"
            rel="noopener noreferrer"
            className="blysk ml-1 rounded-full bg-akcent px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-akcent-hover hover:shadow-lg hover:shadow-akcent/30"
          >
            Hire me
          </a>
        </div>

        {/* Wersja mobilna: szklany hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={() => setOtwarte(!otwarte)}
            aria-label={otwarte ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200/70 bg-white/60 text-zinc-700 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200"
          >
            {otwarte ? <IkonaZamknij className="h-5 w-5" /> : <IkonaMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Rozwijane menu mobilne — szklany panel */}
      {otwarte && (
        <div className="mx-4 rounded-3xl border border-zinc-200/70 bg-white/85 p-3 shadow-2xl backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-zinc-950/85">
          <ul className="flex flex-col gap-1">
            {pozycjeMenu.map((pozycja) => (
              <li key={pozycja.href}>
                <a
                  href={pozycja.href}
                  onClick={() => setOtwarte(false)} // klik zamyka menu
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  {pozycja.nazwa}
                </a>
              </li>
            ))}
            <li className="mt-1">
              <a
                href={linki.fiverr}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl bg-akcent px-4 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-akcent-hover"
              >
                Hire me on Fiverr
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
