// ============================================================
// SEKCJA 1: HERO — pierwsze, co widzi odwiedzający.
// Duże imię, jedno zdanie o Tobie i dwa przyciski.
// Teksty edytujesz w pliku lib/dane.ts (sekcja „hero").
// ============================================================

import Reveal from "./Reveal";
import { IkonaStrzalka } from "./Ikony";
import { hero, linki } from "@/lib/dane";

export default function Hero() {
  return (
    <section
      id="start"
      className="relative flex min-h-screen items-center overflow-hidden px-5 pt-16 md:px-8"
    >
      {/* Delikatna fioletowa poświata w tle — czysto dekoracyjna */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/4 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-akcent/15 blur-[120px] dark:bg-akcent/20"
      />

      <div className="relative mx-auto w-full max-w-6xl py-24 md:py-32">
        {/* Zielona kropka + „Dostępny do projektów" */}
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <span className="relative flex h-2 w-2">
              {/* Pulsująca zielona kropka */}
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {hero.dostepnosc}
          </span>
        </Reveal>

        {/* Wielki nagłówek — imię + kolorowy podtytuł */}
        <Reveal opoznienie={0.1}>
          <h1 className="mt-8 text-6xl font-extrabold leading-[1.02] tracking-tighter sm:text-7xl md:text-8xl lg:text-[7rem]">
            {hero.imie}
            <br />
            {/* Gradientowy tekst — od akcentu do różu */}
            <span className="bg-gradient-to-r from-akcent via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {hero.imieAkcent}
            </span>
          </h1>
        </Reveal>

        {/* Jedno zdanie o Tobie */}
        <Reveal opoznienie={0.2}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-600 md:text-xl dark:text-zinc-400">
            {hero.opis}
          </p>
        </Reveal>

        {/* Dwa główne przyciski */}
        <Reveal opoznienie={0.3}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {/* „Zobacz prace" — przewija do portfolio */}
            <a
              href="#portfolio"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-akcent hover:shadow-xl hover:shadow-akcent/25 dark:bg-white dark:text-zinc-900 dark:hover:bg-akcent dark:hover:text-white"
            >
              {hero.przyciskPrace}
              {/* Strzałka delikatnie przesuwa się na hover */}
              <IkonaStrzalka className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </a>

            {/* „Napisz do mnie" — prowadzi na Fiverr */}
            <a
              href={linki.fiverr}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 px-8 py-4 text-base font-semibold text-zinc-800 transition-all duration-300 hover:-translate-y-0.5 hover:border-akcent hover:text-akcent dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-akcent dark:hover:text-akcent"
            >
              {hero.przyciskKontakt}
            </a>
          </div>
        </Reveal>
      </div>

      {/* Wskaźnik „przewiń w dół" na dole ekranu */}
      <div
        aria-hidden="true"
        className="absolute bottom-8 left-1/2 hidden -translate-x-1/2 md:block"
      >
        <div className="flex h-9 w-6 items-start justify-center rounded-full border-2 border-zinc-300 p-1.5 dark:border-zinc-700">
          <div className="h-2 w-1 animate-bounce rounded-full bg-zinc-400 dark:bg-zinc-500" />
        </div>
      </div>
    </section>
  );
}
