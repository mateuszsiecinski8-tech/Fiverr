"use client";
// ============================================================
// KARTA PROJEKTU (siatka bento) — dwa efekty „wow":
//
// 1. ŻYWY PODGLĄD (inspiracja: supaste.com) — po najechaniu myszką
//    statyczny obrazek płynnie zamienia się w PRAWDZIWĄ, działającą
//    stronę-demo (iframe). Klient widzi projekt „na żywo" bez klikania.
//    • iframe montuje się dopiero przy pierwszym najechaniu (lazy),
//      więc strona główna nie ładuje 6 dodatkowych stron na starcie;
//    • tylko na komputerach z myszką — na dotyku zostaje obrazek.
//
// 2. TILT 3D (inspiracja: dreiraum.studio) — karta delikatnie
//    przechyla się w stronę kursora, jak fizyczna płytka.
//
// Oba efekty wyłączają się przy „ograniczeniu animacji" (dostępność).
// ============================================================

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { IkonaStrzalka } from "./Ikony";

type Projekt = {
  tytul: string;
  kategoria: string;
  uklad: string;
  obraz: string;
  link: string;
};

export default function KartaProjektu({ projekt }: { projekt: Projekt }) {
  const karta = useRef<HTMLAnchorElement>(null);
  const stoper = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [desktop, setDesktop] = useState(false); // komputer z myszką?
  const [zywy, setZywy] = useState(false);       // czy iframe już zamontowany
  const [pokaz, setPokaz] = useState(false);     // czy podgląd widoczny
  const [skala, setSkala] = useState(0.3);       // dopasowanie iframe do karty

  // Podgląd na żywo ma sens tylko dla naszych dem (linki zaczynające się od "/")
  const lokalneDemo = projekt.link.startsWith("/");

  useEffect(() => {
    const mysz = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const bezAnimacji = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setDesktop(mysz && !bezAnimacji);
  }, []);

  /* --- wejście myszką: po chwili pokaż żywy podgląd --- */
  function wejscie() {
    if (!desktop || !lokalneDemo) return;
    // mierzymy kartę, żeby strona w iframe idealnie wypełniła jej szerokość
    const ramka = karta.current?.getBoundingClientRect();
    if (ramka) setSkala(ramka.width / 1280);
    stoper.current = setTimeout(() => {
      setZywy(true);
      setPokaz(true);
    }, 220);
  }

  /* --- ruch myszki: przechył 3D w stronę kursora --- */
  function ruch(e: React.MouseEvent<HTMLAnchorElement>) {
    if (!desktop || !karta.current) return;
    const r = karta.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;  // -0.5 … 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    karta.current.style.transform = `perspective(900px) rotateX(${(-y * 4).toFixed(2)}deg) rotateY(${(x * 5).toFixed(2)}deg) translateY(-4px)`;
  }

  /* --- zjechanie myszką: schowaj podgląd, wyprostuj kartę --- */
  function wyjscie() {
    if (stoper.current) clearTimeout(stoper.current);
    setPokaz(false);
    if (karta.current) karta.current.style.transform = "";
  }

  return (
    <a
      ref={karta}
      href={projekt.link}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={wejscie}
      onMouseMove={ruch}
      onMouseLeave={wyjscie}
      className="group relative block h-72 overflow-hidden rounded-3xl bg-zinc-200 shadow-sm transition-shadow duration-300 [transition:transform_.18s_ease-out,box-shadow_.3s] hover:shadow-2xl hover:shadow-akcent/20 md:h-80 dark:bg-zinc-800"
    >
      {/* Warstwa 1: statyczny obrazek-mockup */}
      <Image
        src={projekt.obraz}
        alt={projekt.tytul}
        fill
        sizes="(max-width: 768px) 100vw, 66vw"
        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />

      {/* Warstwa 2: ŻYWY PODGLĄD — prawdziwa strona-demo w iframe */}
      {zywy && (
        <div
          className={`absolute inset-0 z-10 bg-white transition-opacity duration-500 dark:bg-zinc-900 ${
            pokaz ? "opacity-100" : "opacity-0"
          }`}
        >
          <iframe
            src={projekt.link}
            tabIndex={-1}
            aria-hidden="true"
            title={`Podgląd: ${projekt.tytul}`}
            className="pointer-events-none origin-top-left border-0"
            style={{
              width: 1280,
              height: Math.ceil(340 / skala),
              transform: `scale(${skala})`,
            }}
          />
        </div>
      )}

      {/* Warstwa 3: winieta, żeby podpisy były czytelne */}
      <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/45 via-transparent to-transparent" />

      {/* Warstwa 4: podpisy i plakietki */}
      <div className="absolute inset-x-0 top-0 z-30 flex items-start justify-between p-6">
        <div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            {projekt.kategoria}
          </span>
          <h3 className="mt-3 max-w-[16rem] text-xl font-bold text-white drop-shadow-sm md:text-2xl">
            {projekt.tytul}
          </h3>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
          <IkonaStrzalka className="h-4 w-4 -rotate-45" />
        </span>
      </div>

      {/* Plakietka „podgląd na żywo" — pojawia się razem z iframe */}
      {lokalneDemo && (
        <span
          className={`absolute bottom-4 left-4 z-30 flex items-center gap-2 rounded-full bg-zinc-950/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 ${
            pokaz ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Podgląd na żywo
        </span>
      )}
    </a>
  );
}
