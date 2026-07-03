// ============================================================
// SEKCJA 3: PORTFOLIO — siatka bento z 6 projektami.
// Na razie karty to eleganckie placeholdery (mockupy rysowane
// kodem). Gdy będziesz mieć prawdziwe screeny projektów,
// podmienisz je tutaj — a tytuły edytujesz w lib/dane.ts.
//
// Rozmiar i kolor każdej karty też ustawiasz w lib/dane.ts:
//   uklad: "szeroki" (2 kolumny) lub "waski" (1 kolumna)
//   motyw: fiolet / niebieski / roz / bursztyn / szmaragd / grafit
// ============================================================

import Reveal from "./Reveal";
import { IkonaStrzalka } from "./Ikony";
import { portfolio } from "@/lib/dane";

// Gradienty tła dla poszczególnych motywów kolorystycznych
const gradienty: Record<string, string> = {
  fiolet: "from-violet-500 via-purple-500 to-fuchsia-500",
  niebieski: "from-sky-500 via-blue-500 to-indigo-500",
  roz: "from-rose-400 via-pink-500 to-fuchsia-500",
  bursztyn: "from-amber-400 via-orange-400 to-rose-400",
  szmaragd: "from-emerald-400 via-teal-500 to-cyan-500",
  grafit: "from-zinc-600 via-zinc-700 to-zinc-900",
};

/* --- Mini-mockup: okno przeglądarki (dla projektów stron WWW) --- */
function MockupPrzegladarki() {
  return (
    <div className="w-[78%] overflow-hidden rounded-t-xl bg-white/95 shadow-2xl dark:bg-zinc-100">
      {/* Górny pasek z trzema kropkami — jak w prawdziwej przeglądarce */}
      <div className="flex items-center gap-1.5 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        <span className="h-2 w-2 rounded-full bg-amber-400" />
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="ml-2 h-2 w-1/2 rounded-full bg-zinc-200" />
      </div>
      {/* Szkielet strony — paski udające nagłówek, tekst i przyciski */}
      <div className="space-y-2 p-4">
        <div className="h-3 w-2/3 rounded-full bg-zinc-800/80" />
        <div className="h-2 w-full rounded-full bg-zinc-300" />
        <div className="h-2 w-5/6 rounded-full bg-zinc-300" />
        <div className="flex gap-2 pt-1">
          <div className="h-4 w-16 rounded-full bg-zinc-800/80" />
          <div className="h-4 w-16 rounded-full border border-zinc-300" />
        </div>
      </div>
    </div>
  );
}

/* --- Mini-mockup: telefon (dla projektów aplikacji mobilnych) --- */
function MockupTelefonu() {
  return (
    <div className="w-[42%] overflow-hidden rounded-t-2xl border-4 border-b-0 border-zinc-900/80 bg-white/95 shadow-2xl">
      {/* „Notch" u góry telefonu */}
      <div className="flex justify-center py-1.5">
        <span className="h-1 w-8 rounded-full bg-zinc-300" />
      </div>
      {/* Szkielet ekranu aplikacji */}
      <div className="space-y-2 px-3 pb-3">
        <div className="h-2.5 w-2/3 rounded-full bg-zinc-800/80" />
        <div className="h-10 rounded-lg bg-zinc-200" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-7 rounded-lg bg-zinc-200" />
          <div className="h-7 rounded-lg bg-zinc-300" />
        </div>
        <div className="h-2 w-5/6 rounded-full bg-zinc-300" />
      </div>
    </div>
  );
}

/* --- Mini-mockup: plansza brandingowa (logo + paleta kolorów) --- */
function MockupBrandingu() {
  return (
    <div className="w-[70%] rounded-xl bg-white/95 p-5 shadow-2xl">
      {/* Okrąg udający logo */}
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-zinc-800">
        <span className="text-lg font-black text-zinc-800">M</span>
      </div>
      <div className="mx-auto mt-3 h-2 w-1/2 rounded-full bg-zinc-800/80" />
      {/* Próbki kolorów marki */}
      <div className="mt-4 flex justify-center gap-2">
        <span className="h-5 w-5 rounded-full bg-zinc-900" />
        <span className="h-5 w-5 rounded-full bg-amber-400" />
        <span className="h-5 w-5 rounded-full bg-orange-300" />
        <span className="h-5 w-5 rounded-full border border-zinc-300 bg-white" />
      </div>
    </div>
  );
}

// Wybór mockupu na podstawie pola „mockup" w lib/dane.ts
const mockupy: Record<string, () => React.JSX.Element> = {
  przegladarka: MockupPrzegladarki,
  telefon: MockupTelefonu,
  branding: MockupBrandingu,
};

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
        </Reveal>

        {/* Siatka bento: na komórce 1 kolumna, na komputerze 3 kolumny.
            Karty „szerokie" zajmują 2 kolumny. */}
        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {portfolio.map((projekt, indeks) => {
            const Mockup = mockupy[projekt.mockup] ?? MockupPrzegladarki;
            const gradient = gradienty[projekt.motyw] ?? gradienty.fiolet;
            const szeroki = projekt.uklad === "szeroki";

            return (
              <Reveal
                key={projekt.tytul}
                opoznienie={(indeks % 3) * 0.1}
                className={szeroki ? "md:col-span-2" : ""}
              >
                <article className="group relative h-72 cursor-pointer overflow-hidden rounded-3xl md:h-80">
                  {/* Kolorowe tło gradientowe */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} transition-transform duration-500 group-hover:scale-105`}
                  />

                  {/* Mockup „wystaje" z dołu karty i unosi się na hover */}
                  <div className="absolute inset-x-0 bottom-0 flex justify-center transition-transform duration-500 group-hover:-translate-y-2">
                    <Mockup />
                  </div>

                  {/* Ciemna winieta u dołu, żeby tekst był czytelny */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                  {/* Podpisy: kategoria + tytuł projektu */}
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-6">
                    <div>
                      <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                        {projekt.kategoria}
                      </span>
                      <h3 className="mt-3 text-xl font-bold text-white drop-shadow-sm md:text-2xl">
                        {projekt.tytul}
                      </h3>
                    </div>

                    {/* Kółko ze strzałką — pojawia się na hover */}
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
                      <IkonaStrzalka className="h-4 w-4 -rotate-45" />
                    </span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
