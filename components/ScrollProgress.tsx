"use client";
// ============================================================
// PASEK POSTĘPU SCROLLA — cienka, kolorowa linia na samej górze
// ekranu, która wydłuża się w miarę przewijania strony.
// Subtelny detal, który od razu daje wrażenie „dopracowane".
// ============================================================

import { useEffect, useRef } from "react";

export default function ScrollProgress() {
  const pasek = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function aktualizuj() {
      const html = document.documentElement;
      // Ile procent strony już przewinięto (0 → 1)
      const postep = html.scrollTop / (html.scrollHeight - html.clientHeight || 1);
      if (pasek.current) pasek.current.style.transform = `scaleX(${postep})`;
    }
    aktualizuj();
    window.addEventListener("scroll", aktualizuj, { passive: true });
    return () => window.removeEventListener("scroll", aktualizuj);
  }, []);

  return (
    <div
      ref={pasek}
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left scale-x-0 bg-gradient-to-r from-akcent via-purple-500 to-pink-500"
    />
  );
}
