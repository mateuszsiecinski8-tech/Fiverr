"use client";
// ============================================================
// LOT SEKCJA (eksperyment „ZUI Space Scroll")
//
// Jak to działa:
//  • wrapper ma wysokość ~320vh — to „długość podróży" scrollem,
//  • w środku sticky ekran (position: sticky) — obraz stoi w miejscu,
//    a scroll przewija tylko niewidzialną wysokość wrappera,
//  • GSAP ScrollTrigger zamienia pozycję scrolla na postęp 0–1
//    i podaje go do silnika 3D (kamera leci) oraz animuje nakładki
//    HTML (tekst hero znika, karty usług wjeżdżają na księżycu).
//
// Treść pochodzi z lib/dane.ts — dokładnie ta sama, co w wersji
// klasycznej. Zmienia się tylko sposób podania.
// ============================================================

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { IkonaStrzalka, IkonaMonitor, IkonaPaleta, IkonaWarstwy, IkonaPtaszek } from "../Ikony";
import { hero, uslugi, linki } from "@/lib/dane";
import type { SilnikLotu } from "./silnik";

gsap.registerPlugin(ScrollTrigger);

const ikony = {
  monitor: IkonaMonitor,
  paleta: IkonaPaleta,
  warstwy: IkonaWarstwy,
};

export default function LotSekcja() {
  const wrapper = useRef<HTMLDivElement>(null);
  const pojemnik3d = useRef<HTMLDivElement>(null);
  const nakladkaHero = useRef<HTMLDivElement>(null);
  const nakladkaUslugi = useRef<HTMLDivElement>(null);
  const podpowiedz = useRef<HTMLDivElement>(null);
  const [gotowa, setGotowa] = useState(false);

  useEffect(() => {
    let silnik: SilnikLotu | null = null;
    let tl: gsap.core.Timeline | null = null;
    let zatrzymana = false;

    (async () => {
      // silnik (i cały Three.js) dociąga się dopiero tutaj — leniwie
      const { zbudujLot } = await import("./silnik");
      if (zatrzymana || !pojemnik3d.current || !wrapper.current) return;
      silnik = zbudujLot(pojemnik3d.current);
      setGotowa(true);

      // jeden „wskaźnik postępu" 0–1 — scrub 0.9 daje płynne doganianie
      const proxy = { p: 0 };
      tl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
        },
      });
      tl.to(
        proxy,
        {
          p: 1,
          duration: 1,
          ease: "none",
          onUpdate: () => silnik?.ustawPostep(proxy.p),
        },
        0
      );
      // tekst hero: znika na starcie podróży (0–18% scrolla)
      tl.to(nakladkaHero.current, { autoAlpha: 0, y: -70, duration: 0.18, ease: "none" }, 0);
      // podpowiedź „scroll": znika jeszcze szybciej
      tl.to(podpowiedz.current, { autoAlpha: 0, duration: 0.08, ease: "none" }, 0);
      // karty usług: wjeżdżają, gdy kamera siada na księżycu (78–96%)
      tl.fromTo(
        nakladkaUslugi.current,
        { autoAlpha: 0, y: 90 },
        { autoAlpha: 1, y: 0, duration: 0.18, ease: "none" },
        0.78
      );
    })();

    return () => {
      zatrzymana = true;
      tl?.scrollTrigger?.kill();
      tl?.kill();
      silnik?.zniszcz();
    };
  }, []);

  return (
    // 320vh = długość podróży (hero → lądowanie na księżycu)
    <div ref={wrapper} className="relative h-[320vh]">
      {/* niewidzialna kotwica: link „Services" z menu trafia w moment lądowania */}
      <div id="uslugi" className="absolute top-[62%]" aria-hidden="true" />

      {/* przyklejony ekran podróży */}
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* kanwa 3D (pełny ekran, pod treścią) */}
        <div
          ref={pojemnik3d}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            gotowa ? "opacity-100" : "opacity-0"
          }`}
        />
        {!gotowa && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-akcent/20 border-t-akcent" />
          </div>
        )}

        {/* ===== NAKŁADKA 1: tekst hero (jak na klasycznej stronie) ===== */}
        <div
          ref={nakladkaHero}
          className="absolute inset-0 z-10 flex items-center px-5 md:px-8"
        >
          <div className="mx-auto w-full max-w-[94rem]">
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
                <span className="gradient-zywy block bg-gradient-to-r from-akcent via-purple-500 to-pink-500 bg-clip-text text-transparent">
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
        </div>

        {/* podpowiedź na dole: zacznij podróż */}
        <div
          ref={podpowiedz}
          className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-2 text-zinc-400"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">
            Scroll to begin the journey
          </span>
          <span className="animate-bounce text-lg">↓</span>
        </div>

        {/* ===== NAKŁADKA 2: USŁUGI — karty „stojące" na księżycu ===== */}
        <div
          ref={nakladkaUslugi}
          className="invisible absolute inset-0 z-10 flex flex-col justify-end px-5 pb-10 opacity-0 md:px-8 lg:pb-14"
        >
          <div className="mx-auto w-full max-w-6xl">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-akcent">
              01 — Services · touchdown on the moon
            </p>
            <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
              Everything Your Brand Needs
            </h2>

            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {uslugi.map((usluga) => {
                const Ikona = ikony[usluga.ikona as keyof typeof ikony];
                return (
                  <article
                    key={usluga.tytul}
                    className="rounded-3xl border border-white/10 bg-zinc-950/55 p-6 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-akcent/40 hover:shadow-xl hover:shadow-akcent/10"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-akcent/15 text-akcent">
                      <Ikona className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">{usluga.tytul}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-zinc-400">{usluga.opis}</p>
                    <ul className="mt-4 space-y-2 border-t border-white/10 pt-4">
                      {usluga.zawiera.map((punkt) => (
                        <li key={punkt} className="flex items-start gap-2 text-sm text-zinc-300">
                          <IkonaPtaszek className="mt-0.5 h-4 w-4 shrink-0 text-akcent" />
                          {punkt}
                        </li>
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
