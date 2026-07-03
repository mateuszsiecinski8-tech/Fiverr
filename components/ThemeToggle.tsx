"use client";
// ============================================================
// PRZEŁĄCZNIK MOTYWU (jasny ☀️ / ciemny 🌙)
// Klik dodaje/usuwa klasę "dark" na stronie i zapamiętuje
// wybór w przeglądarce (localStorage), więc po powrocie
// użytkownik zobaczy swój ulubiony motyw.
// ============================================================

import { IkonaSlonce, IkonaKsiezyc } from "./Ikony";

export default function ThemeToggle() {
  function przelaczMotyw() {
    const html = document.documentElement;
    const terazCiemny = html.classList.toggle("dark");
    // Zapisujemy wybór — odczytuje go skrypt w app/layout.tsx
    localStorage.setItem("motyw", terazCiemny ? "ciemny" : "jasny");
  }

  return (
    <button
      onClick={przelaczMotyw}
      aria-label="Przełącz motyw jasny/ciemny"
      className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition-all duration-300 hover:scale-105 hover:border-akcent hover:text-akcent dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-akcent dark:hover:text-akcent"
    >
      {/* Księżyc widać w trybie jasnym, słońce w ciemnym —
          sterują tym klasy CSS (dark:hidden / dark:block) */}
      <IkonaKsiezyc className="h-5 w-5 dark:hidden" />
      <IkonaSlonce className="hidden h-5 w-5 dark:block" />
    </button>
  );
}
