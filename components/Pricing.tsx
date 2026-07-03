// ============================================================
// SEKCJA 6: CENNIK — trzy pakiety (Basic / Standard / Premium).
// Ceny, opisy i punkty edytujesz w lib/dane.ts (sekcja „cennik").
// Pakiet z „wyrozniony: true" dostaje kolorową ramkę i odznakę.
// ============================================================

import Reveal from "./Reveal";
import KartaSpotlight from "./KartaSpotlight";
import { IkonaPtaszek } from "./Ikony";
import { cennik, linki } from "@/lib/dane";

export default function Pricing() {
  return (
    <section id="cennik" className="scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Nagłówek sekcji */}
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-akcent">
            05 — Cennik
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Przejrzyste pakiety, zero ukrytych kosztów
          </h2>
        </Reveal>

        {/* Trzy karty pakietów */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cennik.map((pakiet, indeks) => (
            <Reveal key={pakiet.nazwa} opoznienie={indeks * 0.12}>
              <KartaSpotlight className="h-full rounded-3xl">
              <article
                className={`relative flex h-full flex-col rounded-3xl border p-8 transition-all duration-300 hover:-translate-y-1.5 ${
                  pakiet.wyrozniony
                    ? // Wyróżniony pakiet: kolorowa ramka + cień
                      "border-akcent bg-white shadow-xl shadow-akcent/15 dark:bg-zinc-900"
                    : "border-zinc-200 bg-zinc-50/50 hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-zinc-700"
                }`}
              >
                {/* Odznaka „Najczęściej wybierany" nad wyróżnioną kartą */}
                {pakiet.wyrozniony && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-akcent px-4 py-1 text-xs font-bold text-white shadow-lg shadow-akcent/30">
                    Najczęściej wybierany
                  </span>
                )}

                <h3 className="text-lg font-bold">{pakiet.nazwa}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{pakiet.opis}</p>

                {/* Cena */}
                <p className="mt-6 text-4xl font-extrabold tracking-tight">
                  {pakiet.cena}
                </p>

                {/* Lista tego, co pakiet zawiera */}
                <ul className="mt-8 flex-1 space-y-3 border-t border-zinc-200 pt-8 dark:border-zinc-800">
                  {pakiet.zawiera.map((punkt) => (
                    <li key={punkt} className="flex items-start gap-3 text-sm">
                      <IkonaPtaszek className="mt-0.5 h-4 w-4 shrink-0 text-akcent" />
                      <span className="text-zinc-700 dark:text-zinc-300">{punkt}</span>
                    </li>
                  ))}
                </ul>

                {/* Przycisk zamówienia — prowadzi na Fiverr */}
                <a
                  href={linki.fiverr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`relative z-10 mt-8 block rounded-full py-3.5 text-center text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 ${
                    pakiet.wyrozniony
                      ? "blysk bg-akcent text-white hover:bg-akcent-hover hover:shadow-lg hover:shadow-akcent/30"
                      : "border border-zinc-300 text-zinc-800 hover:border-akcent hover:text-akcent dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-akcent dark:hover:text-akcent"
                  }`}
                >
                  Wybieram {pakiet.nazwa}
                </a>
              </article>
              </KartaSpotlight>
            </Reveal>
          ))}
        </div>

        {/* Dopisek pod cennikiem */}
        <Reveal opoznienie={0.2}>
          <p className="mt-10 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Potrzebujesz czegoś nietypowego? Napisz — przygotuję wycenę pod Twój projekt.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
