"use client";
// ============================================================
// KAFELEK PROJEKTU — jeden element mozaiki portfolio.
//
// Trzy efekty „wow":
//
// 1. ŻYWY PODGLĄD (inspiracja: supaste.com) — po najechaniu myszką
//    statyczna miniatura płynnie zamienia się w PRAWDZIWĄ, działającą
//    stronę-demo (iframe). Klient widzi projekt „na żywo" bez klikania.
//    • iframe montuje się dopiero przy pierwszym najechaniu (lazy),
//      więc strona główna nie ładuje kilkunastu stron na starcie;
//    • tylko na komputerach z myszką — na dotyku zostaje obrazek.
//
// 2. TILT 3D (inspiracja: dreiraum.studio) — kafelek delikatnie
//    przechyla się w stronę kursora, jak fizyczna płytka.
//
// 3. Podpisy wjeżdżają od dołu, a nie po prostu się pojawiają.
//
// ⭐ ZMIANA w ZUI v2: klik prowadzi teraz do PODSTRONY Z OPISEM
//    (/case/nazwa), a nie prosto do demo. Powód jest praktyczny:
//    taki link możesz wysłać klientowi na czacie Fiverr, a on
//    zobaczy nie tylko zrzut, ale i sposób myślenia. Samo demo
//    jest o jedno kliknięcie dalej, z podstrony.
//
// Oba efekty wyłączają się przy „ograniczeniu animacji" (dostępność).
// ============================================================

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { IkonaStrzalka } from "./Ikony";

type Projekt = {
  tytul: string;
  kategoria: string;
  uklad: string;
  obraz: string;
  link: string;
  slug: string;
};

export default function KartaProjektu({
  projekt,
  wysokosc = "h-72 md:h-80",
}: {
  projekt: Projekt;
  /** klasa wysokości — mozaika nadaje różne, żeby rzędy miały rytm */
  wysokosc?: string;
}) {
  const karta = useRef<HTMLAnchorElement>(null);
  const stoper = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [desktop, setDesktop] = useState(false); // komputer z myszką?
  const [zywy, setZywy] = useState(false); // czy iframe już zamontowany
  const [pokaz, setPokaz] = useState(false); // czy podgląd widoczny
  const [skala, setSkala] = useState(0.3); // dopasowanie iframe do kafelka

  // Podgląd na żywo ma sens tylko dla naszych dem (linki od "/")
  const lokalneDemo = projekt.link.startsWith("/");

  useEffect(() => {
    const mysz = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const bezAnimacji = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setDesktop(mysz && !bezAnimacji);
  }, []);

  /* --- wejście myszką: po chwili pokaż żywy podgląd --- */
  function wejscie() {
    if (!desktop || !lokalneDemo) return;
    // mierzymy kafelek, żeby strona w iframe idealnie wypełniła jego szerokość
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
    const x = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const y = (e.clientY - r.top) / r.height - 0.5;
    karta.current.style.transform = `perspective(900px) rotateX(${(-y * 3.5).toFixed(2)}deg) rotateY(${(x * 4.5).toFixed(2)}deg) translateY(-5px)`;
  }

  /* --- zjechanie myszką: schowaj podgląd, wyprostuj kafelek --- */
  function wyjscie() {
    if (stoper.current) clearTimeout(stoper.current);
    setPokaz(false);
    if (karta.current) karta.current.style.transform = "";
  }

  return (
    <Link
      ref={karta}
      href={`/case/${projekt.slug}`}
      onMouseEnter={wejscie}
      onMouseMove={ruch}
      onMouseLeave={wyjscie}
      className={`kafel-projektu group relative block overflow-hidden rounded-3xl bg-zinc-800 shadow-sm [transition:transform_.18s_ease-out,box-shadow_.3s] hover:shadow-2xl hover:shadow-akcent/20 ${wysokosc}`}
    >
      {/* Warstwa 1: statyczna miniatura */}
      <Image
        src={projekt.obraz}
        alt={projekt.tytul}
        fill
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
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
            title={`Preview: ${projekt.tytul}`}
            className="pointer-events-none origin-top-left border-0"
            style={{
              width: 1280,
              height: Math.ceil(420 / skala),
              transform: `scale(${skala})`,
            }}
          />
        </div>
      )}

      {/* Warstwa 3: przyciemnienie OD DOŁU — tylko pod podpisem.
          To nie jest zaciemnienie sceny (te wyleciały), tylko
          zwykła czytelność białego tekstu na zdjęciu. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-2/3 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />

      {/* Warstwa 4: podpisy */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex items-end justify-between gap-4 p-6">
        <div className="min-w-0">
          <span className="inline-block rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm">
            {projekt.kategoria}
          </span>
          <h3 className="mt-3 text-xl font-bold leading-tight text-white drop-shadow-sm md:text-[1.35rem]">
            {projekt.tytul}
          </h3>
          {/* „Read the case study" wjeżdża od dołu przy najechaniu */}
          <span className="mt-2 flex translate-y-2 items-center gap-1.5 text-[13px] font-semibold text-white/0 transition-all duration-300 group-hover:translate-y-0 group-hover:text-white/85">
            Read the case study
            <IkonaStrzalka className="h-3.5 w-3.5" />
          </span>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 text-white opacity-0 backdrop-blur-sm transition-all duration-300 group-hover:opacity-100">
          <IkonaStrzalka className="h-4 w-4 -rotate-45" />
        </span>
      </div>

      {/* Plakietka „podgląd na żywo" — pojawia się razem z iframe */}
      {lokalneDemo && (
        <span
          className={`absolute right-4 top-4 z-30 flex items-center gap-2 rounded-full bg-zinc-950/70 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-white backdrop-blur-sm transition-all duration-300 ${
            pokaz ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
          </span>
          Live preview
        </span>
      )}
    </Link>
  );
}
