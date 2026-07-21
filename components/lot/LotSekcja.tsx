"use client";
// ============================================================
// LOT PRZEZ CAŁĄ STRONĘ (eksperyment „ZUI Space Scroll")
//
// Jak to działa:
//  • kanwa 3D jest PRZYPIĘTA pod całą stroną (position: fixed,
//    z-index -10) — kosmos widać zawsze, pod każdą sekcją,
//  • sekcje to NORMALNE komponenty strony (pełna treść, działające
//    kotwice menu, SEO) przewijane nad kosmosem,
//  • między sekcjami są puste „przerwy podróży" (120vh) — tam kamera
//    LECI do następnej planety; gdy sekcja jest na ekranie, kamera
//    STOI przy jej planecie (okna postoju mierzone z układu strony),
//  • ScrollTrigger zamienia scroll całej strony na postęp 0–1
//    i podaje go silnikowi 3D.
//
// Przystanki: Hero (szeroki plan) → Usługi (księżyc) → Portfolio
// (atmosfera fioletowej) → Proces (turkusowa) → Opinie (różowa)
// → Kontakt (lot w słońce). Cennik jest wyłączony na stronie
// (app/page.tsx), więc nie ma przystanku.
// ============================================================

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IkonaStrzalka } from "../Ikony";
import { hero, linki } from "@/lib/dane";
import Services from "../Services";
import Portfolio from "../Portfolio";
import Process from "../Process";
import Testimonials from "../Testimonials";
import Contact from "../Contact";
import type { SilnikLotu } from "./silnik";

gsap.registerPlugin(ScrollTrigger);

/* Pusta przerwa między sekcjami — tu dzieje się lot */
function PrzerwaPodrozy() {
  return <div aria-hidden="true" className="h-[120vh]" />;
}

export default function LotSekcja() {
  const root = useRef<HTMLDivElement>(null);
  const pojemnik3d = useRef<HTMLDivElement>(null);
  const heroTresc = useRef<HTMLDivElement>(null);
  const podpowiedz = useRef<HTMLDivElement>(null);
  const [gotowa, setGotowa] = useState(false);

  useEffect(() => {
    let silnik: SilnikLotu | null = null;
    let trigger: ScrollTrigger | null = null;
    let zatrzymana = false;
    const tweeny: gsap.core.Tween[] = [];

    (async () => {
      // silnik (i cały Three.js) dociąga się dopiero tutaj — leniwie
      const { zbudujLot } = await import("./silnik");
      if (zatrzymana || !pojemnik3d.current || !root.current) return;
      silnik = zbudujLot(pojemnik3d.current);
      setGotowa(true);

      /* — pomiar OKIEN POSTOJU z prawdziwego układu strony —
         okno = zakres scrolla, w którym sekcja jest na ekranie
         (wtedy kamera stoi przy jej planecie) */
      const przeliczOkna = () => {
        const el = root.current;
        if (!el || !silnik) return;
        const vh = window.innerHeight;
        const calosc = Math.max(1, el.offsetHeight - vh); // ile da się przescrollować
        const frakcja = (y: number) => Math.min(1, Math.max(0, y / calosc));
        const sekcje = ["uslugi", "portfolio", "proces", "opinie", "kontakt"];
        const nowe = [{ a: 0, b: frakcja(vh * 0.4) }]; // hero: od samej góry
        for (const id of sekcje) {
          const s = document.getElementById(id);
          if (!s) return; // sekcja jeszcze nie w DOM — spróbujemy ponownie
          const gora = s.getBoundingClientRect().top + window.scrollY;
          nowe.push({
            a: frakcja(gora - vh * 0.65), // kamera dolatuje tuż przed sekcją
            b: frakcja(gora + s.offsetHeight - vh * 0.35),
          });
        }
        silnik.ustawOkna(nowe);
      };

      /* — scroll całej strony → postęp lotu 0–1 — */
      trigger = ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => silnik?.ustawPostep(self.progress),
        onRefresh: przeliczOkna,
      });
      przeliczOkna();
      // jeszcze raz po chwili — układ mógł się przesunąć po dociągnięciu
      // miniatur portfolio
      setTimeout(przeliczOkna, 1500);

      /* — tekst hero i podpowiedź znikają, gdy ruszamy w podróż — */
      if (heroTresc.current) {
        tweeny.push(
          gsap.to(heroTresc.current, {
            autoAlpha: 0,
            y: -70,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: `+=${window.innerHeight * 0.7}`,
              scrub: true,
            },
          })
        );
      }
      if (podpowiedz.current) {
        tweeny.push(
          gsap.to(podpowiedz.current, {
            autoAlpha: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: `+=${window.innerHeight * 0.3}`,
              scrub: true,
            },
          })
        );
      }
    })();

    return () => {
      zatrzymana = true;
      tweeny.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      trigger?.kill();
      silnik?.zniszcz();
    };
  }, []);

  return (
    <div ref={root} className="tryb-lot relative">
      {/* ===== KOSMOS: przypięty POD całą stroną ===== */}
      <div className="fixed inset-0 -z-10">
        <div
          ref={pojemnik3d}
          className={`h-full w-full transition-opacity duration-1000 ${
            gotowa ? "opacity-100" : "opacity-0"
          }`}
        />
        {!gotowa && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-akcent/20 border-t-akcent" />
          </div>
        )}
      </div>

      {/* ===== HERO (bez ciemnej mgiełki — czysty kosmos za tekstem) ===== */}
      <section className="relative flex min-h-screen items-center px-5 md:px-8">
        <div ref={heroTresc} className="mx-auto w-full max-w-[94rem]">
          <div className="max-w-2xl pt-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-4 py-1.5 text-sm font-medium text-zinc-300 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {hero.dostepnosc}
            </span>

            <h1 className="mt-8 text-6xl font-extrabold leading-[1.02] tracking-tighter sm:text-7xl md:text-8xl lg:text-7xl xl:text-[5rem]">
              <span className="block">{hero.imie}</span>
              {/* pb/-mb: tło gradientu musi objąć też ogonek „g" (bg-clip-text
                  przycina kolor do linii tekstu — bez tego „g" wygląda na ucięte) */}
              <span className="gradient-zywy block bg-gradient-to-r from-akcent via-purple-500 to-pink-500 bg-clip-text pb-[0.15em] -mb-[0.15em] text-transparent">
                {hero.imieAkcent}
              </span>
            </h1>

            <p className="mt-8 max-w-xl text-lg leading-relaxed text-zinc-400 md:text-xl">
              {hero.opis}
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="#uslugi"
                className="blysk group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-zinc-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-akcent hover:text-white hover:shadow-xl hover:shadow-akcent/25"
              >
                {hero.przyciskPrace}
                <IkonaStrzalka className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </a>
              <a
                href={linki.fiverr}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-700 px-8 py-4 text-base font-semibold text-zinc-200 transition-all duration-300 hover:-translate-y-0.5 hover:border-akcent hover:text-akcent"
              >
                {hero.przyciskKontakt}
              </a>
            </div>

            <dl className="mt-14 grid max-w-xl grid-cols-3 gap-6 border-t border-zinc-800 pt-8">
              {hero.statystyki.map((stat) => (
                <div key={stat.opis}>
                  <dt className="sr-only">{stat.opis}</dt>
                  <dd className="text-2xl font-extrabold tracking-tight md:text-3xl">
                    {stat.liczba}
                  </dd>
                  <dd className="mt-1 text-xs font-medium text-zinc-400 md:text-sm">
                    {stat.opis}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* podpowiedź: zacznij podróż */}
        <div
          ref={podpowiedz}
          className="absolute inset-x-0 bottom-8 flex flex-col items-center gap-2 text-zinc-400"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">
            Scroll to begin the journey
          </span>
          <span className="animate-bounce text-lg">↓</span>
        </div>
      </section>

      {/* ===== PODRÓŻ: sekcje strony z lotami między nimi ===== */}
      <PrzerwaPodrozy /> {/* lot: opadanie na księżyc */}
      <Services />
      <PrzerwaPodrozy /> {/* lot: wejście w atmosferę fioletowej */}
      <Portfolio />
      <PrzerwaPodrozy /> {/* lot: przelot do turkusowej */}
      <Process />
      <PrzerwaPodrozy /> {/* lot: wzlot ku różowej */}
      <Testimonials />
      <PrzerwaPodrozy /> {/* lot: finałowy kurs na słońce */}
      <Contact />
    </div>
  );
}
