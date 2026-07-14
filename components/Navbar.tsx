"use client";
// ============================================================
// NAVBAR — lekki, „szklany" pasek nawigacji.
// • BEZ ciężkiego tła na całą szerokość — logo wisi maksymalnie
//   po lewej, a po prawej pływa szklana pigułka z linkami
//   (rozmyte szkło / glassmorphism — styl znany z premium stron).
// • Na komórce zamienia się w szklany przycisk-hamburger.
// ============================================================

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { IkonaMenu, IkonaZamknij } from "./Ikony";
import { linki, hero } from "@/lib/dane";

// Linki w menu — prowadzą do sekcji na tej samej stronie
const pozycjeMenu = [
  { nazwa: "Services", href: "#uslugi" },
  { nazwa: "Portfolio", href: "#portfolio" },
  { nazwa: "Process", href: "#proces" },
  { nazwa: "Reviews", href: "#opinie" },
  { nazwa: "Contact", href: "#kontakt" },
];

export default function Navbar() {
  // Czy menu mobilne jest otwarte?
  const [otwarte, setOtwarte] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="flex h-20 items-center justify-between px-5 md:px-8">
        {/* Logo — maksymalnie po lewej, klik przewija na samą górę */}
        <a href="#start" className="text-xl font-bold tracking-tight">
          {hero.imie}
          <span className="text-akcent">.</span>
        </a>

        {/* Szklana pigułka z linkami — tylko na komputerze */}
        <div className="hidden items-center gap-1 rounded-full border border-zinc-200/70 bg-white/60 p-1.5 shadow-lg shadow-zinc-900/5 backdrop-blur-xl md:flex dark:border-white/10 dark:bg-zinc-900/50 dark:shadow-black/20">
          {pozycjeMenu.map((pozycja) => (
            <a
              key={pozycja.href}
              href={pozycja.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-zinc-600 transition-colors duration-200 hover:bg-white/80 hover:text-zinc-950 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              {pozycja.nazwa}
            </a>
          ))}

          {/* separator */}
          <span className="mx-1 h-5 w-px bg-zinc-300/70 dark:bg-white/10" />

          <ThemeToggle />

          {/* Przycisk Fiverr — akcentowy, na końcu pigułki */}
          <a
            href={linki.fiverr}
            target="_blank"
            rel="noopener noreferrer"
            className="blysk ml-1 rounded-full bg-akcent px-5 py-2 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-akcent-hover hover:shadow-lg hover:shadow-akcent/30"
          >
            Hire me
          </a>
        </div>

        {/* Wersja mobilna: motyw + szklany hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOtwarte(!otwarte)}
            aria-label={otwarte ? "Close menu" : "Open menu"}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200/70 bg-white/60 text-zinc-700 shadow-lg shadow-zinc-900/5 backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/50 dark:text-zinc-200"
          >
            {otwarte ? <IkonaZamknij className="h-5 w-5" /> : <IkonaMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Rozwijane menu mobilne — szklany panel */}
      {otwarte && (
        <div className="mx-4 rounded-3xl border border-zinc-200/70 bg-white/85 p-3 shadow-2xl backdrop-blur-xl md:hidden dark:border-white/10 dark:bg-zinc-950/85">
          <ul className="flex flex-col gap-1">
            {pozycjeMenu.map((pozycja) => (
              <li key={pozycja.href}>
                <a
                  href={pozycja.href}
                  onClick={() => setOtwarte(false)} // klik zamyka menu
                  className="block rounded-2xl px-4 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100/80 dark:text-zinc-300 dark:hover:bg-white/10"
                >
                  {pozycja.nazwa}
                </a>
              </li>
            ))}
            <li className="mt-1">
              <a
                href={linki.fiverr}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-2xl bg-akcent px-4 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-akcent-hover"
              >
                Hire me on Fiverr
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
