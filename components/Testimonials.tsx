// ============================================================
// SEKCJA 5: OPINIE — trzy karty z testimonialami klientów.
// Na start są to placeholdery — prawdziwe opinie wpiszesz
// w lib/dane.ts (sekcja „opinie").
// ============================================================

import Reveal from "./Reveal";
import { IkonaGwiazdka } from "./Ikony";
import { opinie } from "@/lib/dane";

export default function Testimonials() {
  return (
    <section id="opinie" className="scroll-mt-20 bg-zinc-50 px-5 py-24 md:px-8 md:py-32 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-6xl">
        {/* Nagłówek sekcji */}
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-akcent">
            04 — Reviews
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            What clients say
          </h2>
        </Reveal>

        {/* Trzy karty z opiniami */}
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {opinie.map((opinia, indeks) => (
            <Reveal key={opinia.imie} opoznienie={indeks * 0.12}>
              <figure className="flex h-full flex-col rounded-3xl border border-zinc-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-zinc-200/60 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:shadow-black/40">
                {/* Pięć gwiazdek */}
                <div className="flex gap-1 text-amber-400">
                  {[1, 2, 3, 4, 5].map((gwiazdka) => (
                    <IkonaGwiazdka key={gwiazdka} className="h-4 w-4" />
                  ))}
                </div>

                {/* Treść opinii */}
                <blockquote className="mt-5 flex-1 leading-relaxed text-zinc-700 dark:text-zinc-300">
                  „{opinia.tresc}"
                </blockquote>

                {/* Autor: kółko z inicjałem + imię i rola */}
                <figcaption className="mt-6 flex items-center gap-3 border-t border-zinc-200 pt-6 dark:border-zinc-800">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-akcent/10 font-bold text-akcent">
                    {opinia.imie.charAt(0)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{opinia.imie}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{opinia.rola}</p>
                  </div>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
