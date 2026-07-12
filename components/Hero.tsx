// ============================================================
// SEKCJA 1: HERO — pierwsze, co widzi odwiedzający.
// Wersja „premium": tekst wyłania się z rozmycia zaraz po
// wczytaniu strony (klasa .wjazd), gradient w nagłówku faluje,
// a poświaty w tle delikatnie dryfują.
// Teksty edytujesz w pliku lib/dane.ts (sekcja „hero").
// ============================================================

import { IkonaStrzalka } from "./Ikony";
import Scena3D from "./Scena3D";
import Ozdoby3D from "./Ozdoby3D";
import { hero, linki } from "@/lib/dane";

export default function Hero() {
  return (
    <section
      id="start"
      className="relative flex min-h-screen items-center overflow-hidden px-5 pt-16 md:px-8"
    >
      {/* Dryfujące poświaty w tle — czysto dekoracyjne */}
      <div
        aria-hidden="true"
        className="plywa1 pointer-events-none absolute left-1/2 top-1/4 h-[36rem] w-[36rem] -translate-x-1/2 rounded-full bg-akcent/15 blur-[130px] dark:bg-akcent/20"
      />
      <div
        aria-hidden="true"
        className="plywa2 pointer-events-none absolute right-[6%] top-[52%] h-80 w-80 rounded-full bg-fuchsia-400/10 blur-[110px] dark:bg-fuchsia-500/15"
      />
      {/* Subtelna tekstura ziarna na całym tle */}
      <div aria-hidden="true" className="ziarno" />

      {/* Na dużych ekranach: tekst po lewej, scena 3D po prawej */}
      <div className="relative mx-auto w-full max-w-6xl py-24 md:py-28 lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-8">
      <div>
        {/* Zielona kropka + „Dostępny do projektów" */}
        <div className="wjazd">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white/60 px-4 py-1.5 text-sm font-medium text-zinc-600 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-300">
            <span className="relative flex h-2 w-2">
              {/* Pulsująca zielona kropka */}
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {hero.dostepnosc}
          </span>
        </div>

        {/* Wielki nagłówek — imię + falujący gradient */}
        <h1 className="mt-8 text-6xl font-extrabold leading-[1.02] tracking-tighter sm:text-7xl md:text-8xl lg:text-6xl xl:text-[4.75rem]">
          <span className="wjazd block" style={{ animationDelay: "0.1s" }}>
            {hero.imie}
          </span>
          <span className="wjazd block" style={{ animationDelay: "0.22s" }}>
            <span className="gradient-zywy bg-gradient-to-r from-akcent via-purple-500 to-pink-500 bg-clip-text text-transparent">
              {hero.imieAkcent}
            </span>
          </span>
        </h1>

        {/* Jedno zdanie o Tobie */}
        <div className="wjazd" style={{ animationDelay: "0.34s" }}>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-600 md:text-xl dark:text-zinc-400">
            {hero.opis}
          </p>
        </div>

        {/* Dwa główne przyciski */}
        <div className="wjazd" style={{ animationDelay: "0.46s" }}>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            {/* „Zobacz prace" — przewija do portfolio (z błyskiem na hover) */}
            <a
              href="#portfolio"
              className="blysk group inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-akcent hover:shadow-xl hover:shadow-akcent/25 dark:bg-white dark:text-zinc-900 dark:hover:bg-akcent dark:hover:text-white"
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
        </div>

        {/* Trzy liczby budujące wiarygodność */}
        <div className="wjazd" style={{ animationDelay: "0.6s" }}>
          <dl className="mt-16 grid max-w-xl grid-cols-3 gap-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">
            {hero.statystyki.map((stat) => (
              <div key={stat.opis}>
                <dt className="sr-only">{stat.opis}</dt>
                <dd className="text-2xl font-extrabold tracking-tight md:text-3xl">
                  {stat.liczba}
                </dd>
                <dd className="mt-1 text-xs font-medium text-zinc-500 md:text-sm dark:text-zinc-400">
                  {stat.opis}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

        {/* Interaktywna scena 3D (Spline) + unoszące się szklane chipy
            z parallaxą za kursorem; szczegóły w components/Scena3D.tsx
            i components/Ozdoby3D.tsx */}
        <div className="wjazd relative mt-14 lg:mt-0" style={{ animationDelay: "0.55s" }}>
          <Scena3D />
          <Ozdoby3D />
        </div>
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
