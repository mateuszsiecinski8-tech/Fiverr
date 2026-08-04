// ============================================================
// PODSTRONA PROJEKTU — /case/<nazwa>
//
// Po co to istnieje? Bo sam zrzut ekranu pokazuje EFEKT, a klient
// kupuje SPOSÓB MYŚLENIA. Na tej stronie jest jedno i drugie:
// zadanie, trzy decyzje projektowe z uzasadnieniem, na co patrzeć
// w demie, paleta i typografia.
//
// Praktyczna korzyść: każdy projekt ma własny adres, który możesz
// wkleić klientowi na czacie Fiverr — i który indeksuje Google.
//
// Wszystkie teksty są w lib/dane.ts (tablica `studiaPrzypadku`).
// Ta strona tylko je układa.
//
// Strona jest renderowana NA SERWERZE i budowana statycznie
// (generateStaticParams niżej), więc ładuje się natychmiast
// i nie potrzebuje ani grama JavaScriptu.
// ============================================================

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import { IkonaStrzalka } from "@/components/Ikony";
import { portfolio, projektyWyroznione, studiaPrzypadku, linki } from "@/lib/dane";

/* --- Zbieramy w jedno miejsce dane kafelka (obraz, tytuł, link
       do demo) i treść studium przypadku. Kafelki żyją w dwóch
       tablicach, bo prawdziwi klienci wyświetlają się inaczej. --- */
function znajdzProjekt(slug: string) {
  const studium = studiaPrzypadku.find((s) => s.slug === slug);
  if (!studium) return null;

  const kafel = portfolio.find((p) => p.slug === slug);
  const klient = projektyWyroznione.find((p) => p.slug === slug);
  if (!kafel && !klient) return null;

  return {
    studium,
    tytul: kafel?.tytul ?? klient!.tytul,
    obraz: kafel?.obraz ?? klient!.obraz,
    link: kafel?.link ?? klient!.link,
    /* demo leży u nas (/prace/...), a strona klienta w internecie —
       ta druga musi się otwierać w nowej karcie */
    zewnetrzny: !(kafel?.link ?? klient!.link).startsWith("/"),
    kategoria: kafel?.kategoria ?? "Client work",
  };
}

/** Wszystkie adresy, które Next ma zbudować z góry. */
export function generateStaticParams() {
  return studiaPrzypadku.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = znajdzProjekt(slug);
  if (!p) return { title: "Project not found — Maty" };
  return {
    title: `${p.tytul} — case study | Maty`,
    description: p.studium.zajawka,
    openGraph: {
      title: `${p.tytul} — case study`,
      description: p.studium.zajawka,
      images: [p.obraz],
    },
  };
}

export default async function StronaProjektu({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = znajdzProjekt(slug);
  if (!p) notFound();
  const { studium } = p;

  // następny projekt w kolejce — żeby nie kończyć ślepym zaułkiem
  const wszystkie = studiaPrzypadku;
  const teraz = wszystkie.findIndex((s) => s.slug === slug);
  const nastepny = znajdzProjekt(wszystkie[(teraz + 1) % wszystkie.length].slug);

  return (
    <>
      {/* — pasek powrotu: prosty, nie udaje pełnego menu — */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 md:px-8">
          <Link
            href="/#portfolio"
            className="group flex items-center gap-2 text-sm font-semibold text-zinc-300 transition-colors hover:text-white"
          >
            <IkonaStrzalka className="h-4 w-4 rotate-180 transition-transform duration-300 group-hover:-translate-x-1" />
            All projects
          </Link>
          <a
            href={linki.fiverr}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full bg-akcent px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-akcent-hover"
          >
            Hire me
          </a>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-24 pt-14 md:px-8 md:pt-20">
        {/* — NAGŁÓWEK — */}
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold uppercase tracking-[0.18em] text-akcent">
          <span>{studium.typ}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">{studium.branza}</span>
          <span className="text-zinc-600">·</span>
          <span className="text-zinc-400">{studium.rok}</span>
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-[1.08] tracking-tight md:text-6xl">
          {p.tytul}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400 md:text-xl">
          {studium.zajawka}
        </p>

        {/* — DUŻY KADR PROJEKTU — */}
        <div className="relative mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-white/10 bg-zinc-900">
          <Image
            src={p.obraz}
            alt={p.tytul}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 64rem"
            className="object-cover object-top"
          />
        </div>

        {/* — PASEK FAKTÓW — */}
        <div className="mt-5 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
          <div className="bg-zinc-950 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              My role
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-200">
              {studium.rola.join(" · ")}
            </p>
          </div>
          <div className="bg-zinc-950 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Typography
            </p>
            <p className="mt-2 text-sm font-medium text-zinc-200">{studium.typografia}</p>
          </div>
          <div className="bg-zinc-950 p-5">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Palette
            </p>
            <div className="mt-3 flex gap-2">
              {studium.paleta.map((kolor) => (
                <span
                  key={kolor}
                  title={kolor}
                  className="h-6 w-6 rounded-full border border-white/20"
                  style={{ background: kolor }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* — ZADANIE — */}
        <section className="mt-20 grid gap-10 md:grid-cols-[10rem_1fr]">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-akcent">
            The brief
          </h2>
          <p className="max-w-2xl text-lg leading-relaxed text-zinc-300">{studium.brief}</p>
        </section>

        {/* — DECYZJE PROJEKTOWE (mięso case study) — */}
        <section className="mt-20 grid gap-10 md:grid-cols-[10rem_1fr]">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-akcent">
            Design decisions
          </h2>
          <ol className="max-w-2xl space-y-10">
            {studium.decyzje.map((d, i) => (
              <li key={d.tytul} className="border-l border-white/12 pl-6">
                <span className="text-sm font-bold text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 text-xl font-bold tracking-tight md:text-2xl">
                  {d.tytul}
                </h3>
                <p className="mt-3 leading-relaxed text-zinc-400">{d.opis}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* — NA CO PATRZEĆ — */}
        <section className="mt-20 grid gap-10 md:grid-cols-[10rem_1fr]">
          <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-akcent">
            Worth a look
          </h2>
          <ul className="max-w-2xl space-y-4">
            {studium.patrz.map((punkt) => (
              <li key={punkt} className="flex gap-3 leading-relaxed text-zinc-400">
                <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-akcent" />
                {punkt}
              </li>
            ))}
          </ul>
        </section>

        {/* — WEJŚCIE DO DEMO — */}
        <section className="mt-20 overflow-hidden rounded-3xl border border-akcent/30 bg-gradient-to-br from-akcent/15 via-zinc-950 to-zinc-950 p-8 md:p-12">
          <h2 className="max-w-xl text-2xl font-bold tracking-tight md:text-3xl">
            {p.zewnetrzny ? "See it live, in the wild." : "The whole thing is clickable."}
          </h2>
          <p className="mt-3 max-w-xl text-zinc-400">
            {p.zewnetrzny
              ? "This one is a real, published website — go and use it."
              : "A complete, responsive page — not a mock-up. Open it and scroll to the bottom."}
          </p>
          <a
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className="blysk mt-7 inline-flex items-center gap-3 rounded-full bg-akcent px-7 py-4 font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-akcent-hover hover:shadow-xl hover:shadow-akcent/30"
          >
            {p.zewnetrzny ? "Visit the live site" : "Open the live demo"}
            <IkonaStrzalka className="h-4 w-4 -rotate-45" />
          </a>
        </section>

        {/* — NASTĘPNY PROJEKT — */}
        {nastepny && (
          <section className="mt-20 border-t border-white/10 pt-10">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Next project
            </p>
            <Link
              href={`/case/${nastepny.studium.slug}`}
              className="group mt-4 flex items-center justify-between gap-6"
            >
              <div>
                <h3 className="text-2xl font-bold tracking-tight transition-colors group-hover:text-akcent md:text-3xl">
                  {nastepny.tytul}
                </h3>
                <p className="mt-2 max-w-xl text-zinc-400">{nastepny.studium.zajawka}</p>
              </div>
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 transition-all duration-300 group-hover:border-akcent group-hover:bg-akcent/10">
                <IkonaStrzalka className="h-5 w-5" />
              </span>
            </Link>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
