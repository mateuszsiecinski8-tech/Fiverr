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
import KartaProjektu from "./KartaProjektu";
import OzdobyKosmos from "./OzdobyKosmos";
import { IkonaStrzalka } from "./Ikony";
import { portfolio, projektyWyroznione } from "@/lib/dane";

export default function Portfolio() {
  return (
    <section id="portfolio" className="relative scroll-mt-20 bg-zinc-50 px-5 py-24 md:px-8 md:py-32 dark:bg-zinc-900/40">
      {/* Kosmiczne smaczki w tle sekcji (dekoracja) */}
      <OzdobyKosmos wariant="portfolio" />
      <div className="relative mx-auto max-w-6xl">
        {/* Nagłówek sekcji (z licznikiem projektów) */}
        <Reveal>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-akcent">
            02 — Portfolio
          </p>
          <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight md:text-5xl">
            Selected Work{" "}
            <sup className="text-lg font-semibold text-akcent md:text-xl">
              ({String(portfolio.length + projektyWyroznione.length).padStart(2, "0")})
            </sup>
          </h2>
          <p className="mt-4 max-w-xl text-zinc-600 dark:text-zinc-400">
            Click any project to see it live.
          </p>
        </Reveal>

        {/* ============================================================
            PROJEKTY WYRÓŻNIONE — prawdziwi klienci, duże karty na całą
            szerokość. Dane edytujesz w lib/dane.ts (projektyWyroznione).
            Co druga karta ma odbity układ (obraz po lewej) — rytm wizualny.
            ============================================================ */}
        {projektyWyroznione.map((projekt, indeks) => (
          <Reveal key={projekt.tytul} className={indeks === 0 ? "mt-14" : "mt-6"}>
            <a
              href={projekt.link}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative grid overflow-hidden rounded-3xl border border-akcent/30 bg-white shadow-xl shadow-akcent/10 transition-all duration-300 hover:-translate-y-1 hover:border-akcent/60 hover:shadow-2xl hover:shadow-akcent/20 md:grid-cols-2 dark:border-akcent/30 dark:bg-zinc-900"
            >
              {/* Połowa z opisem projektu (w co drugiej karcie po prawej) */}
              <div
                className={`flex flex-col justify-center p-8 md:p-12 ${
                  indeks % 2 === 1 ? "md:order-2" : ""
                }`}
              >
                {/* Odznaka „Prawdziwy klient" */}
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-akcent to-pink-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-akcent/30">
                  ★ {projekt.odznaka}
                </span>

                <h3 className="mt-5 text-2xl font-bold tracking-tight md:text-3xl">
                  {projekt.tytul}
                </h3>
                <p className="mt-2 font-medium text-zinc-700 dark:text-zinc-300">
                  {projekt.podtytul}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {projekt.opis}
                </p>

                {/* Tagi projektu */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {projekt.tagi.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 px-3 py-1 text-xs font-semibold text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* „Przycisk" (cała karta jest linkiem) */}
                <span className="mt-7 inline-flex w-fit items-center gap-2 rounded-full bg-zinc-900 px-6 py-3 text-sm font-semibold text-white transition-colors duration-300 group-hover:bg-akcent dark:bg-white dark:text-zinc-900 dark:group-hover:bg-akcent dark:group-hover:text-white">
                  View live
                  <IkonaStrzalka className="h-4 w-4 -rotate-45 transition-transform duration-300 group-hover:rotate-0" />
                </span>
              </div>

              {/* Połowa z miniaturą strony klienta */}
              <div className={`relative min-h-64 md:min-h-full ${indeks % 2 === 1 ? "md:order-1" : ""}`}>
                <Image
                  src={projekt.obraz}
                  alt={projekt.tytul}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-left-top transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            </a>
          </Reveal>
        ))}

        {/* Siatka bento: na komórce 1 kolumna, na komputerze 3 kolumny.
            Karty „szerokie" zajmują 2 kolumny. */}
        <div className="mt-6 grid gap-5 md:grid-cols-3">
          {portfolio.map((projekt, indeks) => (
            <Reveal
              key={projekt.tytul}
              opoznienie={(indeks % 3) * 0.1}
              className={projekt.uklad === "szeroki" ? "md:col-span-2" : ""}
            >
              {/* Karta z tiltem 3D i żywym podglądem po najechaniu —
                  cała magia siedzi w components/KartaProjektu.tsx */}
              <KartaProjektu projekt={projekt} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
