"use client";
// ============================================================
// KARTA SPOTLIGHT — owija dowolną kartę i dodaje jej poświatę,
// która podąża za kursorem myszki (efekt znany z premium stron
// typu Linear czy Vercel). Sam efekt świetlny rysuje CSS
// (klasa .spot w globals.css) — tu tylko śledzimy pozycję myszki.
// ============================================================

type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function KartaSpotlight({ children, className = "" }: Props) {
  function sledzMysz(zdarzenie: React.MouseEvent<HTMLDivElement>) {
    const element = zdarzenie.currentTarget;
    const ramka = element.getBoundingClientRect();
    // Zapisujemy pozycję kursora względem karty w zmiennych CSS —
    // gradient w .spot::after czyta je jako środek poświaty
    element.style.setProperty("--mx", `${zdarzenie.clientX - ramka.left}px`);
    element.style.setProperty("--my", `${zdarzenie.clientY - ramka.top}px`);
  }

  return (
    <div onMouseMove={sledzMysz} className={`spot ${className}`}>
      {children}
    </div>
  );
}
