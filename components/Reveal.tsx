"use client";
// ============================================================
// REVEAL — animacja pojawiania się przy scrollu.
// Owiń dowolny fragment strony w <Reveal>...</Reveal>,
// a płynnie „wjedzie" on na ekran podczas przewijania.
//
// Dodatkowo: <Reveal opoznienie={0.2}> opóźni animację o 0,2 s —
// przydatne, gdy kilka kart ma pojawiać się jedna po drugiej.
// ============================================================

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  opoznienie?: number; // opóźnienie animacji w sekundach (np. 0.15)
  className?: string;
};

export default function Reveal({ children, opoznienie = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // IntersectionObserver to wbudowany mechanizm przeglądarki,
    // który mówi nam, kiedy element pojawia się na ekranie.
    const obserwator = new IntersectionObserver(
      (wpisy) => {
        wpisy.forEach((wpis) => {
          if (wpis.isIntersecting) {
            // Element widać — dodajemy klasę uruchamiającą animację (CSS w globals.css)
            wpis.target.classList.add("widoczny");
            // Animujemy tylko raz — przestajemy obserwować
            obserwator.unobserve(wpis.target);
          }
        });
      },
      // Animacja startuje, gdy ~15% elementu wjedzie na ekran
      { threshold: 0.15 }
    );

    obserwator.observe(element);
    return () => obserwator.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      style={{ "--reveal-opoznienie": `${opoznienie}s` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}
