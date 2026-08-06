// ============================================================
// SEKCJA 8: STOPKA
//
// Przeprojektowana w rundzie v3. Poprzednia była jedną cienką
// linijką z copyrightem i pięcioma linkami — wyglądała, jakby
// strona się URWAŁA, a nie skończyła.
//
// Nowa zasada: stopka to OSTATNIA rzecz, jaką widzi klient,
// a ktoś, kto doscrollował aż tutaj, jest najbardziej
// zainteresowany ze wszystkich odwiedzających. Szkoda takiej
// osoby na sam copyright. Stąd trzy piętra:
//   1. jeszcze jedno wezwanie do działania,
//   2. mapa strony w kolumnach — żeby dało się wrócić,
//   3. podpis i social media.
//
// Kolorystycznie stopka przejmuje CIEPŁO ostatniej sceny
// (słońca), więc podróż domyka się, zamiast kończyć ścianą.
//
// Teksty edytujesz w lib/dane.ts (sekcje „stopka" i „linki").
// ============================================================

import { linki, stopka, uslugi, kontakt } from "@/lib/dane";
import { IkonaStrzalka } from "./Ikony";

// Lista social media wyświetlana w stopce
const social = [
  { nazwa: "Fiverr", href: linki.fiverr },
  { nazwa: "Instagram", href: linki.instagram },
  { nazwa: "Behance", href: linki.behance },
  { nazwa: "Dribbble", href: linki.dribbble },
  { nazwa: "LinkedIn", href: linki.linkedin },
];

// Skróty do sekcji strony (działają też z podstron /case/…)
const prace = [
  { nazwa: "Selected work", href: "/#portfolio" },
  { nazwa: "Process", href: "/#proces" },
  { nazwa: "Client reviews", href: "/#opinie" },
];

export default function Footer() {
  // Rok aktualizuje się sam — nie trzeba go zmieniać co roku
  const rok = new Date().getFullYear();

  return (
    // BEZ `border-t`: przejście ze sceny do stopki robi teraz miękki
    // gradient (klasa `stopka-kosmos` w globals.css). Kreska w tym
    // miejscu wyglądała jak szew między dwiema stronami.
    <footer className="stopka-kosmos relative overflow-hidden px-5 pb-10 pt-28 md:px-8">
      {/* Ciepła łuna u dołu — echo słońca z ostatniej sceny.
          Czysta dekoracja, więc schowana przed czytnikami ekranu. */}
      <div aria-hidden="true" className="stopka-luna" />

      <div className="relative mx-auto max-w-6xl">
        {/* ===== 1. OSTATNIE WEZWANIE DO DZIAŁANIA ===== */}
        <div className="flex flex-col items-start justify-between gap-8 border-b border-white/10 pb-14 md:flex-row md:items-end">
          <div>
            <h2 className="max-w-lg text-3xl font-bold tracking-tight md:text-4xl">
              {stopka.zachetaNaglowek}
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-zinc-400">
              {stopka.zachetaOpis}
            </p>
          </div>
          <a
            href={linki.fiverr}
            target="_blank"
            rel="noopener noreferrer"
            className="blysk group inline-flex shrink-0 items-center gap-3 rounded-full bg-akcent px-8 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-akcent-hover hover:shadow-xl hover:shadow-akcent/30"
          >
            {stopka.zachetaPrzycisk}
            <IkonaStrzalka className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>

        {/* ===== 2. MAPA STRONY ===== */}
        <div className="grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div>
            <p className="text-2xl font-bold tracking-tight">
              Maty<span className="text-akcent">.</span>
            </p>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              {stopka.haslo}
            </p>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              {stopka.kolumnaPrace}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {prace.map((p) => (
                <li key={p.href}>
                  <a
                    href={p.href}
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {p.nazwa}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              {stopka.kolumnaUslugi}
            </h3>
            <ul className="mt-4 space-y-2.5">
              {uslugi.map((u) => (
                <li key={u.tytul}>
                  <a
                    href="/#uslugi"
                    className="text-sm text-zinc-400 transition-colors hover:text-white"
                  >
                    {u.tytul}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-[0.18em] text-zinc-500">
              {stopka.kolumnaKontakt}
            </h3>
            <ul className="mt-4 space-y-2.5">
              <li>
                <a
                  href={`mailto:${linki.email}`}
                  className="break-all text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {linki.email}
                </a>
              </li>
              <li>
                <a
                  href={linki.fiverr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  {kontakt.przycisk}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ===== 3. PODPIS ===== */}
        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/10 pt-8 md:flex-row">
          <p className="text-sm text-zinc-500">
            © {rok} {stopka.nazwa}. All rights reserved.
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {social.map((pozycja) => (
              <li key={pozycja.nazwa}>
                <a
                  href={pozycja.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-zinc-400 transition-colors hover:text-akcent"
                >
                  {pozycja.nazwa}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <p className="mt-6 text-center text-xs text-zinc-600 md:text-left">
          {stopka.zbudowane}
        </p>
      </div>
    </footer>
  );
}
