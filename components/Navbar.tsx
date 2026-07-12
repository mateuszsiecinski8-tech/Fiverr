"use client";
// ============================================================
// NAVBAR — górne menu strony.
// • przyklejone do góry ekranu, z lekkim rozmyciem tła
// • na komórce zamienia się w menu „hamburger"
// • zawiera przełącznik motywu i przycisk do Fiverr
// ============================================================

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { IkonaMenu, IkonaZamknij } from "./Ikony";
import { linki, hero } from "@/lib/dane";

// Linki w menu — prowadzą do sekcji na tej samej stronie
const pozycjeMenu = [
  { nazwa: "Usługi", href: "#uslugi" },
  { nazwa: "Portfolio", href: "#portfolio" },
  { nazwa: "Proces", href: "#proces" },
  { nazwa: "Opinie", href: "#opinie" },
  { nazwa: "Kontakt", href: "#kontakt" },
];

export default function Navbar() {
  // Czy menu mobilne jest otwarte?
  const [otwarte, setOtwarte] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-zinc-200/60 bg-white/75 backdrop-blur-xl dark:border-zinc-800/60 dark:bg-zinc-950/75">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
        {/* Logo / nazwa — klik przewija na samą górę */}
        <a href="#start" className="text-lg font-bold tracking-tight">
          {hero.imie}
          <span className="text-akcent">.</span>
        </a>

        {/* Menu na komputerze (ukryte na komórce) */}
        <ul className="hidden items-center gap-8 md:flex">
          {pozycjeMenu.map((pozycja) => (
            <li key={pozycja.href}>
              <a
                href={pozycja.href}
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white"
              >
                {pozycja.nazwa}
              </a>
            </li>
          ))}
        </ul>

        {/* Prawa strona: motyw + przycisk Fiverr + hamburger */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* Przycisk Fiverr — tylko na komputerze */}
          <a
            href={linki.fiverr}
            target="_blank"
            rel="noopener noreferrer"
            className="blysk hidden rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-akcent hover:shadow-lg hover:shadow-akcent/25 md:block dark:bg-white dark:text-zinc-900 dark:hover:bg-akcent dark:hover:text-white"
          >
            Zamów projekt
          </a>

          {/* Hamburger — tylko na komórce */}
          <button
            onClick={() => setOtwarte(!otwarte)}
            aria-label={otwarte ? "Zamknij menu" : "Otwórz menu"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 md:hidden dark:border-zinc-700 dark:text-zinc-300"
          >
            {otwarte ? <IkonaZamknij className="h-5 w-5" /> : <IkonaMenu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Rozwijane menu mobilne — pokazuje się po kliknięciu hamburgera */}
      {otwarte && (
        <div className="border-t border-zinc-200/60 bg-white px-5 py-4 md:hidden dark:border-zinc-800/60 dark:bg-zinc-950">
          <ul className="flex flex-col gap-1">
            {pozycjeMenu.map((pozycja) => (
              <li key={pozycja.href}>
                <a
                  href={pozycja.href}
                  onClick={() => setOtwarte(false)} // klik zamyka menu
                  className="block rounded-xl px-4 py-3 text-base font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                >
                  {pozycja.nazwa}
                </a>
              </li>
            ))}
            <li className="mt-2">
              <a
                href={linki.fiverr}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-akcent px-4 py-3 text-center text-base font-semibold text-white transition-colors hover:bg-akcent-hover"
              >
                Zamów projekt na Fiverr
              </a>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
