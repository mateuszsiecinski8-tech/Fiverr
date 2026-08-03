"use client";
// ============================================================
// LOT PRZEZ CAŁĄ STRONĘ (eksperyment „ZUI Space Scroll")
//
// Jak to działa:
//  • JEDNA kanwa 3D (components/lot/silnik.ts) jest PRZYPIĘTA pod
//    całą stroną (position: fixed, z-index -10). To ta sama scena,
//    co w produkcyjnym hero — fioletowy olbrzym z pierścieniami
//    i księżycami, różowa planeta, turkusowa, słońce. Nic więcej
//    nie dochodzi: scroll po prostu WOZI KAMERĘ po tej scenie;
//  • HERO to produkcyjny komponent <Hero /> (tekst po lewej),
//    tylko bez własnej sceny 3D — planety rysuje wspólna kanwa,
//    a kadr startowy kamery odtwarza produkcyjną kompozycję;
//  • sekcje to NORMALNE komponenty strony (pełna treść, działające
//    kotwice menu, SEO) przewijane nad kosmosem;
//  • między sekcjami są puste „przerwy podróży" — tam kamera LECI
//    do następnego ciała (zoom out po łuku → pan → przechył kadru
//    → zoom in); gdy sekcja jest na ekranie, kamera STOI przy jej
//    ciele, a w górnych rogach widać sąsiadów (panorama);
//  • ScrollTrigger zamienia scroll całej strony na postęp 0–1
//    i podaje go silnikowi 3D.
//
// Przystanki: Hero (szeroki plan układu) → Usługi (duży księżyc)
// → Portfolio (olbrzym) → Proces (turkusowa) → Opinie (różowa)
// → Kontakt (słońce). Cennik jest wyłączony na stronie
// (app/page.tsx), więc nie ma przystanku.
// ============================================================

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Hero from "../Hero";
import Services from "../Services";
import Portfolio from "../Portfolio";
import Process from "../Process";
import Testimonials from "../Testimonials";
import Contact from "../Contact";
import type { SilnikLotu } from "./silnik";

// ScrollTrigger używamy TYLKO do efektów HTML (odjazd tekstu hero,
// podświetlenie aktywnej sekcji). Sama kamera 3D czyta pozycję
// scrolla bezpośrednio — patrz components/lot/silnik.ts.
gsap.registerPlugin(ScrollTrigger);

/* Sekcje-przystanki (kolejność MUSI się zgadzać z trasą w silnik.ts) */
const SEKCJE = ["uslugi", "portfolio", "proces", "opinie", "kontakt"];

/* Przystanki na pasku podróży (kropki przy lewej krawędzi ekranu).
   Kolor = kolor ciała niebieskiego, przy którym stoi kamera.
   Nazwy takie same jak w menu (components/Navbar.tsx). */
const PRZYSTANKI_PASKA = [
  { id: "start", nazwa: "Start", kolor: "#cfc9ff" },
  { id: "uslugi", nazwa: "Services", kolor: "#e4dffd" },
  { id: "portfolio", nazwa: "Portfolio", kolor: "#c9bcff" },
  { id: "proces", nazwa: "Process", kolor: "#b5e8dd" },
  { id: "opinie", nazwa: "Reviews", kolor: "#ffc4e0" },
  { id: "kontakt", nazwa: "Contact", kolor: "#ffe0a8" },
];

/* Pusta przerwa między sekcjami — tu dzieje się lot. DŁUGA (200vh),
   żeby przelot kamery przez układ był powolny i filmowy — widać
   wtedy piękno sceny, a nie tylko szybki przeskok do planety. */
function PrzerwaPodrozy() {
  return <div aria-hidden="true" className="h-[200vh]" />;
}

export default function LotSekcja() {
  const root = useRef<HTMLDivElement>(null);
  const pojemnik3d = useRef<HTMLDivElement>(null);
  const heroTresc = useRef<HTMLDivElement>(null);
  const podpowiedz = useRef<HTMLDivElement>(null);
  // numer przystanku, przy którym stoi kamera — świeci nim pasek podróży
  const [przystanek, setPrzystanek] = useState(0);

  useEffect(() => {
    let silnik: SilnikLotu | null = null;
    let zatrzymana = false;
    let stoper: ReturnType<typeof setTimeout> | null = null;
    const wyzwalacze: ScrollTrigger[] = [];
    const tweeny: gsap.core.Tween[] = [];
    const sprzataczki: (() => void)[] = []; // co odpiąć przy unmount

    /* — płynne przewijanie z CSS gryzie się z animacją GSAP
         (klik w menu = filmowa podróż), więc na czas trybu lotu
         oddajemy stery JavaScriptowi — */
    const poprzednieScroll = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";

    /* ============ KLIK W MENU = FILMOWA PODRÓŻ KAMERY ============
       Kotwice (#uslugi, #portfolio…) zostają w HTML-u (SEO i
       dostępność), ale zamiast skoku robimy płynne przewinięcie —
       a że kamera jest podpięta pod scroll, sama wykonuje
       zoom out → przelot → przechył → zoom in do właściwego ciała. */
    function przyKliku(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey) return;
      const cel = e.target as HTMLElement | null;
      const link = cel?.closest?.('a[href^="#"]') as HTMLAnchorElement | null;
      if (!link) return;
      const id = link.getAttribute("href")?.slice(1);
      if (!id) return;
      const sekcja = document.getElementById(id);
      if (!sekcja) return;

      e.preventDefault();
      const vh = window.innerHeight;
      const doceloweY =
        id === "start" ? 0 : sekcja.getBoundingClientRect().top + window.scrollY - vh * 0.12;
      // im dalej lecimy, tym dłuższa (ale wciąż filmowa) animacja
      const dystans = Math.abs(doceloweY - window.scrollY) / vh;
      const czas = Math.min(1.9, Math.max(0.9, 0.55 + dystans * 0.16)) * 1000;
      przewinDo(doceloweY, czas, () => history.replaceState(null, "", `#${id}`));
    }

    /* Płynne przewinięcie strony — własne, w kilku linijkach, bez
       dodatkowej biblioteki. Kamera 3D czyta pozycję scrolla sama,
       więc podąża za tym ruchem i wykonuje pełne przejście:
       zoom out → przelot → przechył → zoom in. */
    let klatkaPrzewijania = 0;
    function przewinDo(doY: number, czasMs: number, poZakonczeniu: () => void) {
      cancelAnimationFrame(klatkaPrzewijania);
      const odY = window.scrollY;
      const roznica = doY - odY;
      const start = performance.now();
      // ten sam „filmowy" easing co w silniku (odpowiednik power2.inOut)
      const filmowe = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
      const krok = (teraz: number) => {
        const t = Math.min(1, (teraz - start) / czasMs);
        window.scrollTo(0, odY + roznica * filmowe(t));
        if (t < 1) klatkaPrzewijania = requestAnimationFrame(krok);
        else poZakonczeniu();
      };
      klatkaPrzewijania = requestAnimationFrame(krok);
    }
    sprzataczki.push(() => cancelAnimationFrame(klatkaPrzewijania));
    document.addEventListener("click", przyKliku);

    (async () => {
      // silnik (i cały Three.js) dociąga się dopiero tutaj — leniwie
      const { zbudujLot } = await import("./silnik");
      if (zatrzymana || !pojemnik3d.current || !root.current) return;
      silnik = zbudujLot(pojemnik3d.current);
      // kanwa jest ukryta do czasu zbudowania sceny (klasa niżej)
      root.current.classList.add("lot-gotowy");
      // silnik sam mówi, przy którym ciele niebieskim stoi kamera —
      // pasek podróży po lewej podświetla wtedy właściwą kropkę
      silnik.naPrzystanku(setPrzystanek);

      /* — pomiar OKIEN POSTOJU z prawdziwego układu strony —
         okno = zakres scrolla (w PIKSELACH), w którym sekcja jest
         na ekranie; wtedy kamera stoi przy jej ciele niebieskim,
         a między oknami leci do następnego.

         Piksele, a nie ułamki — bo silnik sam odczytuje pozycję
         scrolla. Gdyby jedna strona liczyła w pikselach, a druga
         w ułamkach zapamiętanego zakresu, obie miary rozjechałyby
         się w chwili, gdy doładują się miniatury portfolio i strona
         zmieni wysokość. */
      function przeliczOkna() {
        if (!silnik) return;
        const vh = window.innerHeight;
        // hero: kamera stoi, dopóki tekst nie odjedzie z ekranu
        const nowe = [{ a: 0, b: vh * 0.55 }];
        for (const id of SEKCJE) {
          const s = document.getElementById(id);
          if (!s) return; // sekcja jeszcze nie w DOM — spróbujemy ponownie
          const gora = s.getBoundingClientRect().top + window.scrollY;
          nowe.push({
            a: gora - vh * 0.65, // kamera dolatuje tuż przed sekcją
            b: gora + s.offsetHeight - vh * 0.35,
          });
        }
        silnik.ustawOkna(nowe);
      }
      przeliczOkna();

      /* — układ strony zmienia się, gdy doładują się miniatury
           portfolio albo gdy zmienisz rozmiar okna — wtedy trzeba
           przemierzyć okna postoju od nowa — */
      window.addEventListener("load", przeliczOkna);
      window.addEventListener("resize", przeliczOkna);
      sprzataczki.push(() => {
        window.removeEventListener("load", przeliczOkna);
        window.removeEventListener("resize", przeliczOkna);
      });
      stoper = setTimeout(przeliczOkna, 1500);

      /* — tekst hero i podpowiedź odjeżdżają w górę, gdy ruszamy — */
      if (heroTresc.current) {
        tweeny.push(
          gsap.to(heroTresc.current, {
            autoAlpha: 0,
            y: -70,
            ease: "none",
            scrollTrigger: {
              trigger: root.current,
              start: "top top",
              end: () => `+=${window.innerHeight * 0.8}`,
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
              end: () => `+=${window.innerHeight * 0.3}`,
              scrub: true,
            },
          })
        );
      }

      /* — AKTYWNA SEKCJA („wyspa", przy której właśnie stoi kamera):
           pełna jasność + poświata w kolorze ciała niebieskiego.
           Reszta lekko przygaszona — patrz app/globals.css. — */
      for (const id of SEKCJE) {
        const s = document.getElementById(id);
        if (!s) continue;
        wyzwalacze.push(
          ScrollTrigger.create({
            trigger: s,
            start: "top 80%",
            end: "bottom 20%",
            toggleClass: { targets: s, className: "aktywna" },
          })
        );
      }

      ScrollTrigger.refresh();
    })();

    return () => {
      zatrzymana = true;
      if (stoper) clearTimeout(stoper);
      sprzataczki.forEach((s) => s());
      document.removeEventListener("click", przyKliku);
      document.documentElement.style.scrollBehavior = poprzednieScroll;
      tweeny.forEach((t) => {
        t.scrollTrigger?.kill();
        t.kill();
      });
      wyzwalacze.forEach((w) => w.kill());
      silnik?.zniszcz();
    };
  }, []);

  return (
    <div ref={root} className="tryb-lot relative">
      {/* ===== KOSMOS: jedna kanwa przypięta POD całą stroną ===== */}
      <div ref={pojemnik3d} className="pojemnik-kosmos fixed inset-0 -z-10" />

      {/* ===== PASEK PODRÓŻY — sześć kropek przy lewej krawędzi.
          Mówi, na którym przystanku jesteś, i pozwala przeskoczyć
          do dowolnego (klik = ta sama filmowa podróż co z menu).
          Wygląd: app/globals.css, sekcja „PASEK PODRÓŻY". ===== */}
      <nav aria-label="Journey" className="pasek-podrozy">
        {PRZYSTANKI_PASKA.map((p, i) => (
          <a
            key={p.id}
            href={`#${p.id}`}
            aria-current={i === przystanek ? "true" : undefined}
            style={{ "--kropka": p.kolor } as React.CSSProperties}
          >
            <span>{p.nazwa}</span>
          </a>
        ))}
      </nav>

      {/* ===== HERO — produkcyjny układ; planety rysuje kanwa wyżej ===== */}
      <div ref={heroTresc} className="relative">
        <Hero scena3d={false} />

        {/* podpowiedź: zacznij podróż (dodatek trybu ZUI) */}
        <div
          ref={podpowiedz}
          className="pointer-events-none absolute inset-x-0 bottom-8 z-20 flex flex-col items-center gap-2 text-zinc-400"
        >
          <span className="text-xs font-semibold uppercase tracking-[0.25em]">
            Scroll to begin the journey
          </span>
          <span className="animate-bounce text-lg">↓</span>
        </div>
      </div>

      {/* ===== PODRÓŻ: sekcje strony z lotami między nimi ===== */}
      <PrzerwaPodrozy /> {/* lot: znad układu na duży księżyc */}
      <Services />
      <PrzerwaPodrozy /> {/* lot: z księżyca na tarczę olbrzyma */}
      <Portfolio />
      <PrzerwaPodrozy /> {/* lot: do turkusowej planety */}
      <Process />
      <PrzerwaPodrozy /> {/* lot: do różowej planety */}
      <Testimonials />
      <PrzerwaPodrozy /> {/* lot: finałowy kurs na słońce */}
      <Contact />
    </div>
  );
}
