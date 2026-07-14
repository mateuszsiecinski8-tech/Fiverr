// ============================================================
// SEKCJA 2: USŁUGI — trzy karty z ikoną, opisem
// i listą tego, co klient dostaje.
// Teksty edytujesz w lib/dane.ts (sekcja „uslugi").
// ============================================================

import Reveal from "./Reveal";
import KartaSpotlight from "./KartaSpotlight";
import OzdobyKosmos from "./OzdobyKosmos";
import { IkonaMonitor, IkonaPaleta, IkonaWarstwy, IkonaPtaszek } from "./Ikony";
import { uslugi } from "@/lib/dane";

// Dopasowanie nazwy ikony (z lib/dane.ts) do komponentu SVG
const ikony = {
  monitor: IkonaMonitor,
  paleta: IkonaPaleta,
  warstwy: IkonaWarstwy,
};

export default function Services() {
  return (
    // scroll-mt-20 = po kliknięciu w menu sekcja nie chowa się pod navbar
    <section id="uslugi" className="relative scroll-mt-20 px-5 py-24 md:px-8 md:py-32">
      {/* Kosmiczne smaczki w tle sekcji (dekoracja) */}
      <OzdobyKosmos wariant="uslugi" />
      <div className="relative mx-auto max-w-6xl">
        {/* Nagłówek sekcji */}
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-akcent">
            01 — Services
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Everything Your Brand Needs
          </h2>
        </Reveal>

        {/* Trzy karty usług */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {uslugi.map((usluga, indeks) => {
            const Ikona = ikony[usluga.ikona as keyof typeof ikony];
            return (
              // Każda kolejna karta pojawia się z małym opóźnieniem (efekt kaskady),
              // a KartaSpotlight dodaje poświatę podążającą za kursorem
              <Reveal key={usluga.tytul} opoznienie={indeks * 0.12}>
                <KartaSpotlight className="h-full rounded-3xl">
                <article className="group h-full rounded-3xl border border-zinc-200 bg-zinc-50/50 p-8 transition-all duration-300 hover:-translate-y-1.5 hover:border-akcent/40 hover:shadow-xl hover:shadow-akcent/10 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-akcent/40">
                  {/* Ikona w kolorowym kwadracie */}
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-akcent/10 text-akcent transition-transform duration-300 group-hover:scale-110">
                    <Ikona className="h-7 w-7" />
                  </div>

                  <h3 className="mt-6 text-xl font-bold">{usluga.tytul}</h3>
                  <p className="mt-3 leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {usluga.opis}
                  </p>

                  {/* Lista „co dostajesz" z ptaszkami */}
                  <ul className="mt-6 space-y-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                    {usluga.zawiera.map((punkt) => (
                      <li key={punkt} className="flex items-start gap-3 text-sm">
                        <IkonaPtaszek className="mt-0.5 h-4 w-4 shrink-0 text-akcent" />
                        <span className="text-zinc-700 dark:text-zinc-300">{punkt}</span>
                      </li>
                    ))}
                  </ul>
                </article>
                </KartaSpotlight>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
