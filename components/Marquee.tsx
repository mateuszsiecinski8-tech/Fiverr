// ============================================================
// MARQUEE — pasek haseł przewijany w nieskończoność.
// Klasyczny „agencyjny" akcent między sekcjami.
// Hasła edytujesz w lib/dane.ts (lista „marquee").
// Najechanie myszką zatrzymuje pasek (CSS w globals.css).
// ============================================================

import { marquee } from "@/lib/dane";

// Jedna „taśma" haseł — renderujemy ją dwa razy obok siebie,
// żeby animacja mogła zapętlać się bez widocznego „skoku".
function Tasma() {
  return (
    <div className="flex items-center gap-10 pr-10">
      {marquee.map((haslo) => (
        <span
          key={haslo}
          className="flex items-center gap-10 whitespace-nowrap text-sm font-semibold uppercase tracking-[0.25em] text-zinc-400 dark:text-zinc-600"
        >
          {haslo}
          <span className="text-akcent">✦</span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <div
      aria-hidden="true"
      className="overflow-hidden border-y border-zinc-200 bg-white py-5 dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="marquee">
        <Tasma />
        <Tasma />
      </div>
    </div>
  );
}
