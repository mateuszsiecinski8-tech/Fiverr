// ============================================================
// SEKCJA 3: PORTFOLIO — siatka bento z 6 projektami.
// Każdy kafelek to obrazek-mockup (z folderu public/portfolio/),
// a klik otwiera żywe demo projektu (z folderu public/prace/).
//
// Nowy projekt dodajesz w lib/dane.ts:
//   1. wrzuć obrazek do public/portfolio/
//   2. dopisz wpis z polami: tytul, kategoria, uklad, obraz, link
//   uklad: "szeroki" = kafelek na 2 kolumny, "waski" = na 1 kolumnę
// ============================================================

import Image from "next/image";
import Reveal from "./Reveal";
import { IkonaStrzalka } from "./Ikony";
import { portfolio } from "@/lib/dane";

export default function Portfolio() {
  return (
    <section id="portfolio" className="scroll-mt-20 bg-zinc-50 px-5 py-24 md:px-8 md:py-32 dark:bg-zinc-900/40">
      <div className="mx-auto max-w-6xl">
        {/* Nagłówek sekcji */}
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-akcent">
            Portfolio
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Wybrane projekty
          </h2>
          <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
            Kliknij dowolny projekt, żeby zobaczyć go na żywo.
          </p>
        </Reveal>

        {/* Siatka bento: na komórce 1 kolumna, na komputerze 3 kolumny.
            Karty „szerokie" zajmują 2 kolumny. */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {portfolio.map((projekt, indeks) => (
            <Reveal
              key={projekt.tytul}
              opoznienie={(indeks % 3) * 0.1}
              className={projekt.uklad === "szeroki" ? "md:col-span-2" : ""}
            >
              {/* Cały kafelek jest linkiem — otwiera demo w nowej karcie */}
              <a
                href={projekt.link}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block h-72 overflow-hidden rounded-3xl bg-zinc-200 md:h-80 dark:bg-zinc-800"
              >
                {/* Obrazek-mockup projektu; delikatnie przybliża się na hover */}
                <Image
                  src={projekt.obraz}
                  alt={projekt.tytul}
                  fill
                  sizes="(max-width: 768px) 100vw, 66vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                />

                {/* Ciemna winieta u góry, żeby podpisy były czytelne */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-transparent" />

                {/* Podpisy: kategoria + tytuł projektu */}
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6">
                  <div>
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                      {projekt.kategoria}
                    </span>
                    <h3 className="mt-3 max-w-[16rem] text-xl font-bold text-white drop-shadow-sm md:text-2xl">
                      {projekt.tytul}
                    </h3>
                  </div>

                  {/* Kółko ze strzałką — pojawia się na hover */}
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                    <IkonaStrzalka className="h-4 w-4 -rotate-45" />
                  </span>
                </div>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
