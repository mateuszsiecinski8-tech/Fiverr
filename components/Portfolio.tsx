// ============================================================
// SEKCJA 3: PORTFOLIO — MOZAIKA Z HIERARCHIĄ
//
// Co się zmieniło (ZUI v2) i dlaczego:
//
// Wcześniej były to dwie wielkie karty prawdziwych klientów
// (każda z akapitem opisu) jedna pod drugą, a pod nimi siatka
// sześciu kafelków. Czytało się to jak lista — a portfolio ma
// się SKANOWAĆ, nie czytać. Klient z Fiverr daje tej sekcji
// kilka sekund.
//
// Teraz wszystko jest kafelkiem, ale kafelki NIE SĄ RÓWNE:
//   • dwaj prawdziwi klienci dostają największe pola u góry
//     (to jedyny dowód, że ktoś naprawdę za to zapłacił),
//   • dziesięć projektów pokazowych układa się w mozaikę
//     o zmiennym rytmie — raz szeroki + wąski, raz odwrotnie,
//     raz dwa równe. Rzędy mają różną wysokość.
//
// Opisy przeniosły się tam, gdzie ktoś naprawdę je przeczyta:
// na podstrony /case/<nazwa>. Kafelek ma sprzedać kliknięcie,
// podstrona ma sprzedać umiejętności.
//
// Nowy projekt dodajesz w lib/dane.ts (tablica `portfolio`)
// + wpis w `studiaPrzypadku`. Jeśli nie dopiszesz go do
// UKLAD_MOZAIKI niżej, dostanie sensowny układ domyślny.
// ============================================================

import Image from "next/image";
import Link from "next/link";
import Reveal from "./Reveal";
import KartaProjektu from "./KartaProjektu";
import OzdobyKosmos from "./OzdobyKosmos";
import { IkonaStrzalka } from "./Ikony";
import { portfolio, projektyWyroznione } from "@/lib/dane";

/* RYTM MOZAIKI — siatka ma 6 kolumn, każdy rząd sumuje się do 6.
   Wysokości zmieniają się rząd po rzędzie, żeby oko miało po czym
   wędrować. To jedyne miejsce, w którym dobiera się kompozycję
   tej sekcji.
     kol — ile kolumn zajmuje kafelek
     wys — wysokość kafelka (cały rząd musi mieć tę samą!) */
const UKLAD_MOZAIKI = [
  { kol: "md:col-span-4", wys: "h-72 md:h-[26rem]" }, // rząd 1
  { kol: "md:col-span-2", wys: "h-72 md:h-[26rem]" },
  { kol: "md:col-span-2", wys: "h-72 md:h-[19rem]" }, // rząd 2
  { kol: "md:col-span-4", wys: "h-72 md:h-[19rem]" },
  { kol: "md:col-span-3", wys: "h-72 md:h-[23rem]" }, // rząd 3
  { kol: "md:col-span-3", wys: "h-72 md:h-[23rem]" },
  { kol: "md:col-span-4", wys: "h-72 md:h-[26rem]" }, // rząd 4
  { kol: "md:col-span-2", wys: "h-72 md:h-[26rem]" },
  { kol: "md:col-span-3", wys: "h-72 md:h-[21rem]" }, // rząd 5
  { kol: "md:col-span-3", wys: "h-72 md:h-[21rem]" },
];

/* Gdy dopiszesz projekt, a zapomnisz o UKLAD_MOZAIKI — nic się
   nie psuje: „szeroki" dostaje 3 kolumny, „wąski" też 3. */
function ukladDla(indeks: number, uklad: string) {
  return (
    UKLAD_MOZAIKI[indeks] ?? {
      kol: uklad === "szeroki" ? "md:col-span-4" : "md:col-span-2",
      wys: "h-72 md:h-[22rem]",
    }
  );
}

export default function Portfolio() {
  return (
    <section
      id="portfolio"
      className="relative scroll-mt-20 bg-zinc-50 px-5 py-24 md:px-8 md:py-32 dark:bg-zinc-900/40"
    >
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
            Every project opens a short case study — the brief, the decisions, and a live demo.
          </p>
        </Reveal>

        {/* ===== PRAWDZIWI KLIENCI — największe pola w mozaice =====
            Dane edytujesz w lib/dane.ts (projektyWyroznione). */}
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {projektyWyroznione.map((projekt, indeks) => (
            <Reveal key={projekt.tytul} opoznienie={indeks * 0.1}>
              <Link
                href={`/case/${projekt.slug}`}
                className="kafel-projektu group relative block h-80 overflow-hidden rounded-3xl border border-akcent/25 bg-zinc-800 shadow-xl shadow-akcent/10 transition-all duration-300 hover:-translate-y-1 hover:border-akcent/60 hover:shadow-2xl hover:shadow-akcent/20 md:h-[30rem]"
              >
                <Image
                  src={projekt.obraz}
                  alt={projekt.tytul}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover object-left-top transition-transform duration-[900ms] ease-out group-hover:scale-[1.04]"
                />
                {/* przyciemnienie tylko pod podpisem — dla czytelności */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-black/10" />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 p-7">
                  {/* Odznaka „Prawdziwy klient" — jedyne miejsce
                      z gradientem, bo to jedyna rzecz, która musi
                      krzyczeć na tej sekcji */}
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-gradient-to-r from-akcent to-pink-500 px-3.5 py-1.5 text-xs font-bold text-white shadow-lg shadow-akcent/30">
                    ★ {projekt.odznaka}
                  </span>
                  <h3 className="mt-4 text-2xl font-bold leading-tight text-white md:text-[1.7rem]">
                    {projekt.tytul}
                  </h3>
                  <p className="mt-1.5 text-sm font-medium text-white/75">
                    {projekt.podtytul}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {projekt.tagi.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/25 px-3 py-1 text-xs font-semibold text-white/85"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="mt-5 flex translate-y-2 items-center gap-2 text-sm font-semibold text-white/0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-white">
                    Read the case study
                    <IkonaStrzalka className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>

        {/* ===== PROJEKTY POKAZOWE — mozaika o zmiennym rytmie ===== */}
        <div className="mt-5 grid gap-5 md:grid-cols-6">
          {portfolio.map((projekt, indeks) => {
            const { kol, wys } = ukladDla(indeks, projekt.uklad);
            return (
              <Reveal
                key={projekt.tytul}
                opoznienie={(indeks % 2) * 0.08}
                className={kol}
              >
                <KartaProjektu projekt={projekt} wysokosc={wys} />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
