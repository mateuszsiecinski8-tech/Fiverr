// ============================================================
// SEKCJA 8: STOPKA — linki do social media i podpis.
// Linki edytujesz w lib/dane.ts (sekcja „linki") —
// niepotrzebne pozycje możesz usunąć z listy „social" poniżej.
// ============================================================

import { linki, stopka } from "@/lib/dane";

// Lista social media wyświetlana w stopce
const social = [
  { nazwa: "Fiverr", href: linki.fiverr },
  { nazwa: "Instagram", href: linki.instagram },
  { nazwa: "Behance", href: linki.behance },
  { nazwa: "Dribbble", href: linki.dribbble },
  { nazwa: "LinkedIn", href: linki.linkedin },
];

export default function Footer() {
  // Rok aktualizuje się sam — nie trzeba go zmieniać co roku
  const rok = new Date().getFullYear();

  return (
    <footer className="border-t border-zinc-200 px-5 py-12 md:px-8 dark:border-zinc-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 md:flex-row">
        {/* Podpis + copyright */}
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          © {rok} {stopka.nazwa}. Wszystkie prawa zastrzeżone.
        </p>

        {/* Linki social media */}
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {social.map((pozycja) => (
            <li key={pozycja.nazwa}>
              <a
                href={pozycja.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-zinc-600 transition-colors hover:text-akcent dark:text-zinc-400 dark:hover:text-akcent"
              >
                {pozycja.nazwa}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
