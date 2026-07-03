// ============================================================
// SEKCJA 4: PROCES — cztery kroki współpracy
// (Brief → Projekt → Poprawki → Gotowe).
// Teksty edytujesz w lib/dane.ts (sekcja „proces").
// ============================================================

import Reveal from "./Reveal";
import { proces } from "@/lib/dane";

export default function Process() {
  return (
    <section id="proces" className="scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      <div className="mx-auto max-w-6xl">
        {/* Nagłówek sekcji */}
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-akcent">
            Proces
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Jak wygląda współpraca
          </h2>
        </Reveal>

        {/* Cztery kroki obok siebie (na komórce jeden pod drugim) */}
        <div className="mt-14 grid gap-10 md:grid-cols-4 md:gap-6">
          {proces.map((krok, indeks) => (
            <Reveal key={krok.tytul} opoznienie={indeks * 0.12}>
              <div className="group relative">
                {/* Duży numer kroku (01, 02...) */}
                <div className="flex items-center gap-4">
                  <span className="text-5xl font-extrabold tracking-tight text-zinc-200 transition-colors duration-300 group-hover:text-akcent dark:text-zinc-800 dark:group-hover:text-akcent">
                    {String(indeks + 1).padStart(2, "0")}
                  </span>
                  {/* Linia łącząca kroki — tylko na komputerze */}
                  {indeks < proces.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-zinc-200 md:block dark:bg-zinc-800"
                    />
                  )}
                </div>

                <h3 className="mt-4 text-xl font-bold">{krok.tytul}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {krok.opis}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
