// ============================================================
// SEKCJA 7: KONTAKT / CTA — mocne wezwanie do działania.
// Ciemna karta z gradientową poświatą, dużym przyciskiem
// do Fiverr i adresem email.
// Teksty edytujesz w lib/dane.ts (sekcje „kontakt" i „linki").
// ============================================================

import Reveal from "./Reveal";
import OzdobyKosmos from "./OzdobyKosmos";
import { IkonaStrzalka, IkonaKoperta } from "./Ikony";
import { kontakt, linki } from "@/lib/dane";

export default function Contact() {
  return (
    <section id="kontakt" className="relative scroll-mt-20 px-5 pb-24 md:px-8 md:pb-32">
      {/* Kosmiczne smaczki w tle sekcji (dekoracja) */}
      <OzdobyKosmos wariant="kontakt" />
      <div className="relative mx-auto max-w-6xl">
        <Reveal>
          {/* Ciemna karta CTA (ciemna w obu motywach — celowo, dla kontrastu) */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-950 px-6 py-20 text-center md:px-12 md:py-28 dark:bg-zinc-900">
            {/* Fioletowa poświata w tle karty — „oddycha" (pulsuje) */}
            <div
              aria-hidden="true"
              className="pulsuje pointer-events-none absolute left-1/2 top-0 h-96 w-[40rem] rounded-full bg-akcent/40 blur-[100px]"
            />
            {/* Ziarno — tekstura, dzięki której gradient wygląda szlachetnie */}
            <div aria-hidden="true" className="ziarno" />

            <div className="relative">
              <h2 className="mx-auto max-w-3xl text-4xl font-extrabold tracking-tight text-white md:text-6xl">
                {kontakt.naglowek}
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-zinc-400">
                {kontakt.opis}
              </p>

              {/* Duży przycisk do Fiverr */}
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <a
                  href={linki.fiverr}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="blysk group inline-flex items-center gap-3 rounded-full bg-akcent px-10 py-5 text-lg font-bold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-akcent-hover hover:shadow-2xl hover:shadow-akcent/40"
                >
                  {kontakt.przycisk}
                  <IkonaStrzalka className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </a>

                {/* Link mailowy */}
                <a
                  href={`mailto:${linki.email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-700 px-8 py-5 font-semibold text-zinc-300 transition-all duration-300 hover:-translate-y-1 hover:border-zinc-500 hover:text-white"
                >
                  <IkonaKoperta className="h-5 w-5" />
                  {linki.email}
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
