"use client";
// ============================================================
// SCENA 3D (Spline) — interaktywny element w sekcji hero.
//
// Jak to działa (w prostych słowach):
// • Obsługujemy DWA rodzaje linków (ustawiane w lib/dane.ts → hero.scena3d):
//   a) adres eksportu „...scene.splinecode" → rysujemy scenę silnikiem
//      Spline bezpośrednio na <canvas> (najładniej, bez ramki),
//   b) zwykły link do sceny Spline → osadzamy przez <iframe>
//      (darmowy sposób, nie wymaga eksportu kodu).
// • Ciężki silnik 3D ładuje się LENIWIE (osobnym plikiem, dopiero
//   w przeglądarce) — strona startuje tak szybko jak wcześniej.
// • Zanim scena się wczyta, widać elegancki spinner.
// • Na telefonie / przy „ograniczeniu animacji" / przy błędzie sieci —
//   pokazujemy statyczną grafikę CSS (fallback). Strona nigdy nie
//   wygląda na zepsutą.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { hero } from "@/lib/dane";

/* --- Spinner pokazywany podczas ładowania sceny --- */
function Spinner() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-akcent/20 border-t-akcent" />
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500">
        Ładowanie sceny 3D…
      </p>
    </div>
  );
}

/* --- Statyczny fallback: „kula 3D" narysowana czystym CSS-em.
       Pokazuje się na telefonach i gdy scena nie może się załadować —
       wygląda celowo, nie jak błąd. --- */
function Fallback() {
  return (
    <div aria-hidden="true" className="relative flex h-full w-full items-center justify-center">
      {/* poświata pod kulą */}
      <div className="absolute h-56 w-56 rounded-full bg-akcent/25 blur-[70px]" />
      {/* kula z odbiciem światła */}
      <div
        className="plywa2 relative h-44 w-44 rounded-full shadow-2xl shadow-akcent/30 md:h-56 md:w-56"
        style={{
          background:
            "radial-gradient(circle at 32% 28%, #c9bfff 0%, #8b7cf7 35%, #5b47d6 70%, #37277f 100%)",
        }}
      >
        {/* błysk na kuli */}
        <div className="absolute left-7 top-6 h-8 w-12 -rotate-[24deg] rounded-full bg-white/50 blur-md" />
      </div>
      {/* orbitujące pierścienie */}
      <div className="absolute h-64 w-64 rounded-full border border-akcent/25 md:h-80 md:w-80" />
      <div className="absolute h-64 w-64 rotate-[65deg] scale-y-[0.35] rounded-full border border-akcent/40 md:h-80 md:w-80" />
    </div>
  );
}

export default function Scena3D() {
  // trzy stany: "czekam" (jeszcze nie wiemy), "3d", "fallback"
  const [tryb, setTryb] = useState<"czekam" | "3d" | "fallback">("czekam");
  const [zaladowana, setZaladowana] = useState(false);
  // Czy serwer Spline w ogóle odpowiada? (sprawdzamy PRZED pokazaniem iframe,
  // bo iframe nie umie sam zgłosić „nie działam" — pokazałby szary błąd)
  const [serwerDziala, setSerwerDziala] = useState(false);
  const plotno = useRef<HTMLCanvasElement>(null);

  // Czy link to eksport .splinecode (tryb canvas), czy zwykły link (iframe)?
  const trybCanvas = hero.scena3d.endsWith(".splinecode");

  useEffect(() => {
    // 3D włączamy tylko na dużych ekranach i gdy użytkownik
    // nie ma włączonego „ograniczenia animacji"
    const duzyEkran = window.matchMedia("(min-width: 1024px)").matches;
    const bezAnimacji = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTryb(duzyEkran && !bezAnimacji ? "3d" : "fallback");
  }, []);

  // Tryb canvas: leniwie pobieramy silnik Spline i rysujemy scenę
  useEffect(() => {
    if (tryb !== "3d" || !trybCanvas) return;
    let aplikacja: { dispose?: () => void } | undefined;
    let anulowane = false;

    (async () => {
      try {
        const { Application } = await import("@splinetool/runtime");
        if (anulowane || !plotno.current) return;
        const app = new Application(plotno.current);
        aplikacja = app;
        await app.load(hero.scena3d);
        if (!anulowane) setZaladowana(true);
      } catch {
        // Silnik lub scena nie wczytały się — pokazujemy fallback
        if (!anulowane) setTryb("fallback");
      }
    })();

    return () => {
      anulowane = true;
      aplikacja?.dispose?.(); // sprzątamy po sobie przy odmontowaniu
    };
  }, [tryb, trybCanvas]);

  // Tryb iframe: najpierw cicha sonda — czy serwer Spline jest osiągalny?
  // Jeśli nie (np. brak internetu) → od razu elegancki fallback.
  useEffect(() => {
    if (tryb !== "3d" || trybCanvas) return;
    let anulowane = false;
    fetch(hero.scena3d, { mode: "no-cors" })
      .then(() => !anulowane && setSerwerDziala(true))
      .catch(() => !anulowane && setTryb("fallback"));
    return () => {
      anulowane = true;
    };
  }, [tryb, trybCanvas]);

  // Bezpiecznik: jeśli scena nie wczyta się w 15 sekund — fallback
  useEffect(() => {
    if (tryb !== "3d" || zaladowana) return;
    const stoper = setTimeout(() => setTryb("fallback"), 15000);
    return () => clearTimeout(stoper);
  }, [tryb, zaladowana]);

  return (
    <div className="relative h-72 w-full md:h-96 lg:h-[540px]">
      {tryb === "fallback" && <Fallback />}

      {tryb === "3d" && (
        <>
          {!zaladowana && <Spinner />}
          {/* Scena płynnie pojawia się dopiero, gdy jest gotowa */}
          <div
            className={`h-full w-full transition-opacity duration-700 ${
              zaladowana ? "opacity-100" : "opacity-0"
            }`}
          >
            {trybCanvas ? (
              <canvas ref={plotno} className="h-full w-full" />
            ) : (
              serwerDziala && (
                <iframe
                  src={hero.scena3d}
                  title="Interaktywna scena 3D"
                  loading="lazy"
                  allow="fullscreen"
                  className="h-full w-full rounded-3xl border-0"
                  onLoad={() => setZaladowana(true)}
                />
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
