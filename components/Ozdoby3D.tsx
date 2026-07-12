"use client";
// ============================================================
// OZDOBY 3D (inspiracja: haoqi.design) — szklane „chipy"
// unoszące się wokół sceny 3D w hero. Reagują na ruch myszki
// efektem parallax: każdy chip ma inną „głębię", więc porusza
// się z inną siłą — to daje wrażenie przestrzeni.
// Widoczne tylko na dużych ekranach; wyłączone przy
// „ograniczeniu animacji".
// ============================================================

import { useEffect, useRef } from "react";

// Lista chipów: tekst, pozycja (klasy Tailwind), głębia parallaxy
// (większa liczba = mocniej reaguje na mysz), opóźnienie „pływania"
const chipy = [
  { tekst: "⚡ Next.js", pozycja: "left-[-6%] top-[10%]", glebia: 26, opoznienie: "0s" },
  { tekst: "🎨 UI/UX", pozycja: "right-[-3%] top-[4%]", glebia: 38, opoznienie: "1.4s" },
  { tekst: "✦ Figma", pozycja: "left-[0%] bottom-[16%]", glebia: 32, opoznienie: "2.2s" },
  { tekst: "◉ 3D · Spline", pozycja: "right-[2%] bottom-[6%]", glebia: 20, opoznienie: "0.8s" },
];

export default function Ozdoby3D() {
  const warstwa = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Parallax tylko dla myszki i tylko bez „ograniczenia animacji"
    const mysz = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const bezAnimacji = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!mysz || bezAnimacji) return;

    function ruch(e: MouseEvent) {
      // pozycja kursora w skali -0.5 … 0.5 względem całego okna
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      warstwa.current
        ?.querySelectorAll<HTMLElement>("[data-glebia]")
        .forEach((chip) => {
          const g = Number(chip.dataset.glebia);
          chip.style.transform = `translate(${(x * g).toFixed(1)}px, ${(y * g).toFixed(1)}px)`;
        });
    }

    window.addEventListener("mousemove", ruch, { passive: true });
    return () => window.removeEventListener("mousemove", ruch);
  }, []);

  return (
    <div
      ref={warstwa}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10 hidden lg:block"
    >
      {chipy.map((chip) => (
        <div
          key={chip.tekst}
          data-glebia={chip.glebia}
          className={`absolute ${chip.pozycja} transition-transform duration-300 ease-out`}
        >
          {/* wewnętrzny span „pływa" niezależnie od parallaxy */}
          <span
            className="plywa2 block rounded-2xl border border-white/50 bg-white/65 px-4 py-2 text-xs font-bold text-zinc-700 shadow-lg shadow-akcent/10 backdrop-blur-md dark:border-white/10 dark:bg-zinc-800/60 dark:text-zinc-200"
            style={{ animationDelay: chip.opoznienie }}
          >
            {chip.tekst}
          </span>
        </div>
      ))}
    </div>
  );
}
