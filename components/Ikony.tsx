// ============================================================
// IKONY — wszystkie ikonki SVG używane na stronie.
// Rysowane kodem (bez zewnętrznych plików), więc są ostre
// w każdym rozmiarze i same dopasowują kolor do otoczenia.
// Nie musisz tu nic zmieniać.
// ============================================================

// Wspólne ustawienia dla każdej ikony (rozmiar ustawiamy klasą CSS)
type Props = { className?: string };

const bazowe = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  viewBox: "0 0 24 24",
};

/* --- Ikony usług --- */

// Monitor (Strony & Landing Page)
export function IkonaMonitor({ className }: Props) {
  return (
    <svg {...bazowe} className={className}>
      <rect x="2.5" y="4" width="19" height="13" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M6.5 8.5h6M6.5 11.5h4" />
    </svg>
  );
}

// Paleta (Grafika & Branding)
export function IkonaPaleta({ className }: Props) {
  return (
    <svg {...bazowe} className={className}>
      <path d="M12 21a9 9 0 1 1 9-9c0 2-1.5 3-3 3h-2a2 2 0 0 0-1.5 3.3c.6.7.2 2.7-2.5 2.7Z" />
      <circle cx="7.5" cy="11.5" r="0.6" fill="currentColor" />
      <circle cx="10.5" cy="7.5" r="0.6" fill="currentColor" />
      <circle cx="15" cy="7.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

// Warstwy (UI/UX Design)
export function IkonaWarstwy({ className }: Props) {
  return (
    <svg {...bazowe} className={className}>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
      <path d="m3 17.5 9 5 9-5" opacity="0.45" />
    </svg>
  );
}

/* --- Ikony pomocnicze --- */

// Ptaszek (listy „co dostajesz")
export function IkonaPtaszek({ className }: Props) {
  return (
    <svg {...bazowe} strokeWidth={2.4} className={className}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

// Strzałka w prawo (przyciski)
export function IkonaStrzalka({ className }: Props) {
  return (
    <svg {...bazowe} strokeWidth={2} className={className}>
      <path d="M4 12h16m0 0-6-6m6 6-6 6" />
    </svg>
  );
}

// Gwiazdka (oceny w opiniach)
export function IkonaGwiazdka({ className }: Props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.3 6.6L12 17.4l-5.9 3.3 1.3-6.6L2.5 9.5l6.6-.8L12 2.5z" />
    </svg>
  );
}

// Koperta (email)
export function IkonaKoperta({ className }: Props) {
  return (
    <svg {...bazowe} className={className}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </svg>
  );
}

/* --- Ikony menu i motywu --- */

// Słońce (przełączenie na tryb jasny)
export function IkonaSlonce({ className }: Props) {
  return (
    <svg {...bazowe} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </svg>
  );
}

// Księżyc (przełączenie na tryb ciemny)
export function IkonaKsiezyc({ className }: Props) {
  return (
    <svg {...bazowe} className={className}>
      <path d="M20.5 14.5A8.5 8.5 0 0 1 9.5 3.5a8.5 8.5 0 1 0 11 11Z" />
    </svg>
  );
}

// Hamburger (otwarcie menu mobilnego)
export function IkonaMenu({ className }: Props) {
  return (
    <svg {...bazowe} strokeWidth={2} className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

// X (zamknięcie menu mobilnego)
export function IkonaZamknij({ className }: Props) {
  return (
    <svg {...bazowe} strokeWidth={2} className={className}>
      <path d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}
